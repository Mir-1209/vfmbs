// Small HTTP helpers that work on Vercel's Node runtime and in the local dev server.
import crypto from "node:crypto";
import { cmd, P, hasKV } from "./kv.js";

export class HttpError extends Error {
  constructor(status, message, extra = {}) { super(message); this.status = status; this.expose = true; this.extra = extra; }
}

export function send(res, status, data, { cache = "no-store", headers = {} } = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export function query(req) {
  return Object.fromEntries(new URL(req.url, "http://localhost").searchParams);
}

export async function readBody(req, limit = 100_000) {
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    const b = req.body;
    if (typeof b === "object" && !Buffer.isBuffer(b)) return b;
    const s = Buffer.isBuffer(b) ? b.toString("utf8") : String(b);
    if (s.length > limit) throw new HttpError(413, "Request too large");
    try { return JSON.parse(s); } catch { throw new HttpError(400, "Invalid JSON"); }
  }
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new HttpError(413, "Request too large");
    chunks.push(c);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new HttpError(400, "Invalid JSON"); }
}

export function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  return (Array.isArray(xf) ? xf[0] : xf || "").split(",")[0].trim() || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

// Fixed-window rate limit. Returns silently if allowed, throws 429 otherwise.
export async function rateLimit(req, bucket, max, windowSec) {
  if (!hasKV()) return;
  const ipHash = crypto.createHash("sha256").update(clientIp(req)).digest("hex").slice(0, 16);
  const key = `${P}rl:${bucket}:${ipHash}`;
  const n = await cmd("INCR", key);
  if (n === 1) await cmd("EXPIRE", key, windowSec);
  if (n > max) throw new HttpError(429, "Too many requests. Please try again in a few minutes.");
}

export function allow(req, methods) {
  if (!methods.includes(req.method)) throw new HttpError(405, "Method not allowed");
}

// Reject cross-site form posts: mutations must come from our own pages (fetch with JSON).
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  try { if (new URL(origin).host !== host) throw new HttpError(403, "Cross-origin request blocked"); }
  catch (e) { if (e instanceof HttpError) throw e; throw new HttpError(403, "Bad origin"); }
}

export const handler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    if (!e.expose) console.error(e);
    send(res, e.status || 500, { error: e.expose ? e.message : "Something went wrong. Please try again.", ...(e.extra || {}) });
  }
};

export function requireKV() {
  if (!hasKV()) throw new HttpError(503, "The database isn't connected yet.", { demo: true });
}

export const randomCode = (len = 8) => {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = crypto.randomBytes(len);
  return Array.from(b, (x) => A[x % A.length]).join("");
};
