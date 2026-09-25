// Signing (tickets, applicant tokens) and admin sessions.
import crypto from "node:crypto";
import { HttpError } from "./http.js";

const SECRET = process.env.SESSION_SECRET || (process.env.VFMBS_MOCK_KV === "1" ? "dev-only-secret-change-me" : "");
const COOKIE = "vfmbs_admin";
const SESSION_HOURS = 12;

function secret() {
  if (!SECRET || SECRET.length < 16) throw new HttpError(503, "SESSION_SECRET is not configured (min 16 chars).");
  return SECRET;
}
const hmac = (s) => crypto.createHmac("sha256", secret()).update(s).digest("base64url");
const safeEq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Public tokens: "<id>.<sig>". Holding the token proves you own the ticket/application.
export const signId = (kind, id) => `${id}.${hmac(`${kind}:${id}`).slice(0, 22)}`;
export function verifyId(kind, token) {
  if (typeof token !== "string" || token.length > 80) return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const id = token.slice(0, i);
  return safeEq(token, signId(kind, id)) ? id : null;
}

/* ---------------- Admin sessions ---------------- */
export function checkPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD || (process.env.VFMBS_MOCK_KV === "1" ? "admin" : "");
  if (!expected) throw new HttpError(503, "ADMIN_PASSWORD is not configured.");
  const h = (s) => crypto.createHash("sha256").update(String(s)).digest();
  return crypto.timingSafeEqual(h(pw), h(expected));
}

export function sessionCookie(req) {
  const exp = Date.now() + SESSION_HOURS * 3600e3;
  const payload = `admin.${exp}`;
  const val = `${payload}.${hmac(payload)}`;
  const secure = (req.headers["x-forwarded-proto"] || "").includes("https") || process.env.VERCEL ? "; Secure" : "";
  return `${COOKIE}=${val}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isAdmin(req) {
  const raw = (req.headers.cookie || "").split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return false;
  const val = raw.slice(COOKIE.length + 1);
  const parts = val.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const payload = `${parts[0]}.${parts[1]}`;
  try { if (!safeEq(parts[2], hmac(payload))) return false; } catch { return false; }
  return Number(parts[1]) > Date.now();
}

export function requireAdmin(req) {
  if (!isAdmin(req)) throw new HttpError(401, "Please sign in.");
  // CSRF defence in depth: our dashboard always sends this header; browsers can't add it cross-site without CORS.
  if (req.method !== "GET" && req.headers["x-vfmbs"] !== "1") throw new HttpError(403, "Missing request header.");
}
