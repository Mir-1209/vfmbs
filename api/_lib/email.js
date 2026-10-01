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

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!emailEnabled() || !to) return false;
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
