// POST /api/contact { name, email, org, topic, message }: inbox for general, sponsorship, press & speaker inquiries.
import { handler, send, allow, readBody, rateLimit, sameOrigin, requireKV, randomCode } from "./_lib/http.js";
import { cmd, P } from "./_lib/kv.js";
import { str, email, oneOf, isBot } from "./_lib/validate.js";
import { sendEmail, siteUrl } from "./_lib/email.js";
import { contactEmail } from "./_lib/templates.js";
import { loadContent } from "./_lib/content.js";

const TOPICS = ["General", "Sponsorship", "Speaking", "Press", "Alumni", "Other"];

export default handler(async (req, res) => {
  allow(req, ["POST"]);
  sameOrigin(req);
  requireKV();
  const b = await readBody(req, 12_000);
  if (isBot(b)) return send(res, 200, { ok: true });
  await rateLimit(req, "contact", 5, 3600);
  const msg = {
    name: str(b.name, "Name", { max: 80, required: true }),
    email: email(b.email),
    org: str(b.org, "Organization", { max: 120 }),
    topic: oneOf(b.topic, "Topic", TOPICS, "General"),
    message: str(b.message, "Message", { max: 3000, required: true, min: 10 }),
    ts: Date.now(),
    read: false,
  };
  const id = Date.now().toString(36) + randomCode(4);
  await cmd("HSET", P + "inbox", id, JSON.stringify(msg));
  if (process.env.NOTIFY_EMAIL) {
    const s = (await loadContent(req).catch(() => ({}))).settings || {};
    const mail = contactEmail({ base: siteUrl(req), msg, s });
    await sendEmail({ to: process.env.NOTIFY_EMAIL, replyTo: msg.email, subject: mail.subject, html: mail.html, text: mail.text });
  }
  send(res, 200, { ok: true });
});
