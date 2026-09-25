// POST /api/rsvp            { eventId, name, email, year, diet, interests[], question }  -> ticket
// POST /api/rsvp            { action: "cancel", t }                                      -> release seat
import { handler, send, allow, readBody, rateLimit, sameOrigin, requireKV, randomCode, HttpError } from "./_lib/http.js";
import { cmd, pipe, P, parse } from "./_lib/kv.js";
import { signId, verifyId } from "./_lib/auth.js";
import { str, email, list, isBot } from "./_lib/validate.js";
import { loadContent, findEvent } from "./_lib/content.js";
import { sendEmail, layout, siteUrl, esc } from "./_lib/email.js";

export default handler(async (req, res) => {
  allow(req, ["POST"]);
  sameOrigin(req);
  requireKV();
  const b = await readBody(req, 20_000);

  if (b.action === "cancel") {
    await rateLimit(req, "rsvp-cancel", 20, 600);
    const code = verifyId("ticket", b.t);
    if (!code) throw new HttpError(400, "Invalid ticket.");
    const eventId = await cmd("GET", `${P}ticket:${code}`);
    if (!eventId) throw new HttpError(404, "Ticket not found.");
    const rec = parse(await cmd("HGET", `${P}rsvps:${eventId}`, code));
    const ops = [["HDEL", `${P}rsvps:${eventId}`, code], ["DEL", `${P}ticket:${code}`]];
    if (rec?.email) ops.push(["DEL", `${P}rsvpe:${eventId}:${rec.email}`]);
    if (rec && !rec.waitlist) ops.push(["HINCRBY", P + "counts", eventId, -1]);
    await pipe(ops);
    return send(res, 200, { ok: true });
  }

  if (isBot(b)) return send(res, 200, { ticket: { token: "0.0", code: "0", no: 0, waitlist: false } });
  await rateLimit(req, "rsvp", 15, 600);

  const content = await loadContent(req);
  const ev = findEvent(content, str(b.eventId, "Event", { max: 60, required: true }));
  if (!ev) throw new HttpError(404, "That event isn't available.");
  if (ev.rsvpOpen === false) throw new HttpError(400, "RSVPs for this event are closed.");
  if (new Date(ev.end || ev.date) < new Date()) throw new HttpError(400, "This event has already happened.");

  const rec = {
    name: str(b.name, "Name", { max: 80, required: true, min: 2 }),
    email: email(b.email),
    year: str(b.year, "Class year", { max: 20 }),
    diet: str(b.diet, "Dietary needs", { max: 40 }),
    interests: list(b.interests, "Interests", { max: 8, itemMax: 30 }),
    question: str(b.question, "Question", { max: 300 }),
  };
  const emailKey = `${P}rsvpe:${ev.id}:${rec.email}`;
  const code = randomCode(8);
  const claimed = await cmd("SET", emailKey, code, "NX");
  if (!claimed) throw new HttpError(409, "This email already has a ticket for this event. Check your inbox or My Studio.");

  let no = await cmd("HINCRBY", P + "counts", ev.id, 1);
  let waitlist = false;
  const cap = Number(ev.capacity) || 0;
  if (cap && no > cap) {
    await cmd("HINCRBY", P + "counts", ev.id, -1);
    waitlist = true;
    no = await cmd("HINCRBY", P + "waits", ev.id, 1);
  }
  const ticket = { code, eventId: ev.id, no, waitlist, ts: Date.now(), checkedIn: null, ...rec };
  await pipe([["HSET", `${P}rsvps:${ev.id}`, code, JSON.stringify(ticket)], ["SET", `${P}ticket:${code}`, ev.id]]);

  const token = signId("ticket", code);
  const link = `${siteUrl(req)}/ticket?t=${encodeURIComponent(token)}`;
  await sendEmail({
    to: rec.email,
    subject: waitlist ? `Waitlist confirmed: ${ev.title}` : `Your ticket: ${ev.title}`,
    html: layout({
      kicker: waitlist ? "Waitlist · Standby" : `Admit one · No. ${String(no).padStart(3, "0")}`,
      title: ev.title,
      body: `<p>Hi ${esc(rec.name.split(" ")[0])},</p><p>${waitlist ? "The house is full, so you're on the waitlist. We'll email you if a seat opens up." : "You're on the list. Show the QR code on your ticket at the door."}</p><p><b>${esc(ev.location)}</b></p>`,
      cta: { label: "Open my ticket", href: link },
    }),
  });

  send(res, 200, { ticket: { token, code, no, waitlist, eventId: ev.id, name: rec.name } });
});
