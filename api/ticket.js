// GET /api/ticket?t=<token>: verify a ticket and return what's printed on it.
import { handler, send, allow, query, rateLimit, requireKV, HttpError } from "./_lib/http.js";
import { cmd, P, parse } from "./_lib/kv.js";
import { verifyId } from "./_lib/auth.js";
import { loadContent } from "./_lib/content.js";

export default handler(async (req, res) => {
  allow(req, ["GET"]);
  requireKV();
  await rateLimit(req, "ticket", 60, 300);
  const code = verifyId("ticket", query(req).t);
  if (!code) throw new HttpError(400, "This ticket link isn't valid.");
  const eventId = await cmd("GET", `${P}ticket:${code}`);
  const rec = eventId && parse(await cmd("HGET", `${P}rsvps:${eventId}`, code));
  if (!rec) throw new HttpError(404, "This ticket was cancelled or doesn't exist.");
  const content = await loadContent(req);
  const ev = (content.events || []).find((e) => e.id === eventId) || { id: eventId, title: "VFMBS Event" };
  const [first, ...rest] = rec.name.split(" ");
  send(res, 200, {
    ticket: { code, no: rec.no, waitlist: rec.waitlist, checkedIn: rec.checkedIn, name: `${first}${rest.length ? " " + rest.at(-1)[0] + "." : ""}` },
    event: { id: ev.id, title: ev.title, type: ev.type, date: ev.date, end: ev.end, tz: ev.tz, location: ev.location, palette: ev.palette, motif: ev.motif },
  });
});
