// Optional transactional email via Resend (https://resend.com).
// Set RESEND_API_KEY and EMAIL_FROM (e.g. "Greenlight <hello@yourdomain.com>") to enable.
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM;

export const emailEnabled = () => Boolean(KEY && FROM);

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return `${proto}://${host}`;
}

import { cmd, P, hasKV } from "./kv.js";

// Every email attempt is logged (who, what, result) so it appears in the archive export.
async function logEmail(entry) {
  if (!hasKV()) return;
  try { await cmd("LPUSH", P + "emaillog", JSON.stringify({ ts: Date.now(), ...entry })); await cmd("LTRIM", P + "emaillog", 0, 9999); } catch {}
}

export async function sendEmail({ to, subject, html, text, replyTo, kind = "other" }) {
  if (!to) return false;
  if (!emailEnabled()) { await logEmail({ to, subject, kind, status: "not sent (email not connected)" }); return false; }
  const ok = await deliver({ to, subject, html, text, replyTo });
  await logEmail({ to, subject, kind, status: ok ? "sent" : "failed" });
  return ok;
}

async function deliver({ to, subject, html, text, replyTo }) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(text ? { text } : {}), ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return r.ok;
  } catch (e) {
    console.error("email failed", e.message);
    return false;
  }
}

export { esc };
