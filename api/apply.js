// Membership applications.
// POST /api/apply                     { ...application }       -> { id, token }
// POST /api/apply { action:"book", t, slot }                    -> book / move interview slot
// POST /api/apply { action:"withdraw", t }
// GET  /api/apply?slots=1                                       -> interview slots with availability
// GET  /api/apply?t=<token>                                     -> applicant-visible status
import { handler, send, allow, readBody, query, rateLimit, sameOrigin, requireKV, randomCode, HttpError } from "./_lib/http.js";
import { cmd, pipe, P, parse, toObj } from "./_lib/kv.js";
import { signId, verifyId } from "./_lib/auth.js";
import { str, email, list, url, oneOf, isBot } from "./_lib/validate.js";
import { loadContent } from "./_lib/content.js";
import { sendEmail, layout, siteUrl, esc } from "./_lib/email.js";

const YEARS = ["2027", "2028", "2029", "2030", "Graduate"];

async function slotsFor(content) {
  const all = (content.settings?.interviewSlots || []).filter((s) => new Date(s) > new Date());
  const taken = toObj(await cmd("HGETALL", P + "slots"));
  return all.map((iso) => ({ iso, taken: Boolean(taken[iso]) }));
}

function publicStatus(app, content) {
  const release = content.settings?.releaseDecisions;
  const s = app.status || "submitted";
  const map = { submitted: "In review", reviewing: "In review", interview: "Interview stage", accepted: release ? "Accepted" : "In review", waitlisted: release ? "Waitlisted" : "In review", declined: release ? "Not selected" : "In review" };
  return map[s] || "In review";
}

export default handler(async (req, res) => {
  allow(req, ["GET", "POST"]);
  requireKV();
  const content = await loadContent(req);

  if (req.method === "GET") {
    await rateLimit(req, "apply-get", 60, 300);
    const q = query(req);
    if (q.slots) return send(res, 200, { slots: await slotsFor(content) });
    const id = verifyId("app", q.t);
    if (!id) throw new HttpError(400, "Invalid link.");
    const app = parse(await cmd("HGET", P + "apps", id));
    if (!app) throw new HttpError(404, "Application not found.");
    return send(res, 200, { id, status: publicStatus(app, content), interview: app.interview || null, tracks: app.tracks, ts: app.ts });
  }

  sameOrigin(req);
  const b = await readBody(req, 40_000);

  if (b.action === "book" || b.action === "withdraw") {
    await rateLimit(req, "apply-book", 20, 600);
    const id = verifyId("app", b.t);
    if (!id) throw new HttpError(400, "Invalid link.");
    const app = parse(await cmd("HGET", P + "apps", id));
    if (!app) throw new HttpError(404, "Application not found.");
    const release = async () => { if (app.interview && (await cmd("HGET", P + "slots", app.interview)) === id) await cmd("HDEL", P + "slots", app.interview); };

    if (b.action === "withdraw") {
      await release();
      await pipe([["HDEL", P + "apps", id], ["DEL", `${P}appe:${app.email}`]]);
      return send(res, 200, { ok: true });
    }
    const slot = str(b.slot, "Slot", { max: 40, required: true });
    const valid = (content.settings?.interviewSlots || []).includes(slot) && new Date(slot) > new Date();
    if (!valid) throw new HttpError(400, "That time isn't available.");
    if (slot !== app.interview) {
      const ok = await cmd("HSETNX", P + "slots", slot, id);
      if (!ok) throw new HttpError(409, "Someone just booked that slot. Please pick another.");
      await release();
      app.interview = slot;
      await cmd("HSET", P + "apps", id, JSON.stringify(app));
    }
    return send(res, 200, { ok: true, interview: slot });
  }

  if (isBot(b)) return send(res, 200, { id: "VF-OK", token: "0.0" });
  await rateLimit(req, "apply", 5, 3600);
  const s = content.settings || {};
  if (s.applicationsOpen === false) throw new HttpError(400, "Applications are currently closed.");
  if (s.applicationDeadline && new Date(s.applicationDeadline) < new Date()) throw new HttpError(400, "The application deadline has passed.");

  const trackIds = (content.tracks || []).map((t) => t.id);
  const tracks = list(b.tracks, "Tracks", { max: 2, itemMax: 30 }).filter((t) => trackIds.includes(t));
  if (!tracks.length) throw new HttpError(400, "Please choose at least one track.");
  const app = {
    name: str(b.name, "Name", { max: 80, required: true, min: 2 }),
    pref: str(b.pref, "Preferred name", { max: 40 }),
    email: email(b.email),
    phone: str(b.phone, "Phone", { max: 30 }),
    year: oneOf(b.year, "Class year", YEARS),
    major: str(b.major, "Major", { max: 120, required: true }),
    heard: str(b.heard, "Referral", { max: 40 }),
    tracks,
    areas: list(b.areas, "Areas", { max: 10, itemMax: 30 }),
    finexp: str(b.finexp, "Finance experience", { max: 40 }),
    why: str(b.why, "Why VFMBS", { max: 1500, required: true }),
    pitch: str(b.pitch, "Pitch", { max: 1500, required: true }),
    news: str(b.news, "Industry story", { max: 1000, required: true }),
    resume: url(b.resume, "Resume link"),
    linkedin: url(b.linkedin, "LinkedIn"),
    status: "submitted",
    notes: "",
    rating: 0,
    interview: null,
    ts: Date.now(),
  };
  const id = "VF-" + randomCode(6);
  const claimed = await cmd("SET", `${P}appe:${app.email}`, id, "NX");
  if (!claimed) throw new HttpError(409, "We already have an application from this email. Check My Studio or email us to make changes.");
  await cmd("HSET", P + "apps", id, JSON.stringify(app));
  const token = signId("app", id);

  await sendEmail({
    to: app.email,
    subject: "Application received: VFMBS",
    html: layout({
      kicker: "Casting call · Application received",
      title: `That's a wrap, ${app.pref || app.name.split(" ")[0]}.`,
      body: `<p>We've received your application (<b>${esc(id)}</b>). Next step: book your interview slot.</p>`,
      cta: { label: "Book my interview", href: `${siteUrl(req)}/apply?t=${encodeURIComponent(token)}` },
    }),
  });
  send(res, 200, { id, token });
});
