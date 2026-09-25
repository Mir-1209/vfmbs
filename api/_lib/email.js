// Optional transactional email via Resend (https://resend.com).
// Set RESEND_API_KEY and EMAIL_FROM (e.g. "VFMBS <hello@yourdomain.com>") to enable.
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

export function layout({ kicker, title, body, cta }) {
  return `<!doctype html><html><body style="margin:0;background:#070707;font-family:Helvetica,Arial,sans-serif;color:#f4f1ea">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070707;padding:32px 12px"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
    <tr><td style="background:#f2ede4;padding:18px 28px;color:#000;font-weight:800;letter-spacing:3px;font-size:14px">VFMBS<span style="color:#cfae70">.</span></td></tr>
    <tr><td style="padding:32px 28px">
      <div style="font-size:11px;letter-spacing:4px;color:#cfae70;text-transform:uppercase">${esc(kicker)}</div>
      <h1 style="font-size:28px;line-height:1.1;margin:10px 0 18px;color:#fff">${esc(title)}</h1>
      <div style="font-size:15px;line-height:1.6;color:#cfcac1">${body}</div>
      ${cta ? `<p style="margin:28px 0 0"><a href="${esc(cta.href)}" style="background:#cfae70;color:#111;padding:14px 22px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">${esc(cta.label)}</a></p>` : ""}
    </td></tr>
    <tr><td style="padding:18px 28px;border-top:1px solid #222;font-size:11px;color:#777">Vanderbilt Film &amp; Media Business Society · Nashville, TN</td></tr>
  </table></td></tr></table></body></html>`;
}

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!emailEnabled() || !to) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
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
