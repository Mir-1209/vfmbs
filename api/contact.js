// POST /api/contact { name, email, org, topic, message }: inbox for general, sponsorship, press & speaker inquiries.
import { handler, send, allow, readBody, rateLimit, sameOrigin, requireKV, randomCode } from "./_lib/http.js";
import { cmd, P } from "./_lib/kv.js";
import { str, email, oneOf, isBot } from "./_lib/validate.js";
import { sendEmail, layout, esc } from "./_lib/email.js";

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
    await sendEmail({
      to: process.env.NOTIFY_EMAIL,
      replyTo: msg.email,
      subject: `[VFMBS ${msg.topic}] ${msg.name}${msg.org ? " · " + msg.org : ""}`,
      html: layout({ kicker: `New ${msg.topic} inquiry`, title: msg.name, body: `<p>${esc(msg.email)}${msg.org ? " · " + esc(msg.org) : ""}</p><p style="white-space:pre-wrap">${esc(msg.message)}</p>` }),
    });
  }
  send(res, 200, { ok: true });
});
