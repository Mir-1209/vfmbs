// Admin API: a single function (keeps Vercel Hobby under its function limit), routed by ?action=
import { handler, send, allow, readBody, query, rateLimit, sameOrigin, requireKV, HttpError } from "./_lib/http.js";
import { cmd, pipe, P, parse, toObj, hgetallJSON, getJSON, setJSON } from "./_lib/kv.js";
import { checkPassword, sessionCookie, clearCookie, isAdmin, requireAdmin, verifyId } from "./_lib/auth.js";
import { loadContent, defaultContent } from "./_lib/content.js";
import { str } from "./_lib/validate.js";

const HISTORY = 15;
const CONTENT_KEYS = ["settings", "featured", "tracks", "events", "workshops", "team", "partners", "posts", "stats", "top10", "reviews", "faq", "ticker", "sponsorTiers", "pipeline"];

const GET = {
  async me(req) { return { admin: isAdmin(req) }; },

  async content(req) {
    const saved = await getJSON("content", null);
    const meta = await getJSON("content:meta", null);
    return { content: saved || (await defaultContent(req)), published: Boolean(saved), meta };
  },

  async overview(req) {
    const content = await loadContent(req);
    const [counts, waits, apps, inbox, subs] = await pipe([
      ["HGETALL", P + "counts"], ["HGETALL", P + "waits"], ["HGETALL", P + "apps"], ["HGETALL", P + "inbox"], ["HLEN", P + "subs"],
    ]);
    const a = Object.values(toObj(apps)).map((x) => parse(x, {}));
    const byStatus = a.reduce((o, x) => ((o[x.status || "submitted"] = (o[x.status || "submitted"] || 0) + 1), o), {});
    const wsCounts = {};
    const ws = content.workshops || [];
    const lens = await pipe(ws.map((w) => ["HLEN", `${P}wsapps:${w.id}`]));
    ws.forEach((w, i) => (wsCounts[w.id] = lens[i] || 0));
    const msgs = Object.values(toObj(inbox)).map((x) => parse(x, {}));
    const recent = a.sort((x, y) => y.ts - x.ts).slice(0, 5).map((x) => ({ name: x.name, ts: x.ts, tracks: x.tracks, status: x.status }));
    return {
      counts: numObj(toObj(counts)), waits: numObj(toObj(waits)), apps: a.length, byStatus, wsCounts,
      inbox: msgs.length, unread: msgs.filter((m) => !m.read).length, subs: subs || 0, recent,
    };
  },

  async rsvps(req) {
    const id = str(query(req).event, "Event", { max: 60, required: true });
    const all = await hgetallJSON(`rsvps:${id}`);
    return { rsvps: Object.values(all).sort((a, b) => a.ts - b.ts) };
  },

  async apps() {
    const all = await hgetallJSON("apps");
    return { apps: Object.entries(all).map(([id, a]) => ({ id, ...a })).sort((a, b) => b.ts - a.ts) };
  },

  async wsapps(req) {
    const content = await loadContent(req);
    const out = [];
    for (const w of content.workshops || []) {
      const all = await hgetallJSON(`wsapps:${w.id}`);
      for (const [code, a] of Object.entries(all)) out.push({ ...a, code, workshopId: w.id, workshop: w.title });
    }
    return { apps: out.sort((a, b) => b.ts - a.ts) };
  },

  async inbox() {
    const all = await hgetallJSON("inbox");
    return { messages: Object.entries(all).map(([id, m]) => ({ id, ...m })).sort((a, b) => b.ts - a.ts) };
  },

  async subs() {
    const all = await hgetallJSON("subs");
    return { subs: Object.entries(all).map(([email, m]) => ({ email, ...(typeof m === "object" ? m : {}) })).sort((a, b) => (b.ts || 0) - (a.ts || 0)) };
  },

  async history() {
    const list = await cmd("LRANGE", P + "content:history", 0, HISTORY - 1);
    return { versions: (list || []).map((s, i) => { const v = parse(s, {}); return { index: i, ts: v.ts, by: v.by || "admin", size: s.length }; }) };
  },
};

const POST = {
  async login(req, b) {
    await rateLimit(req, "login", 8, 900);
    if (!checkPassword(String(b.password || ""))) throw new HttpError(401, "Wrong password.");
    return { ok: true, __cookie: sessionCookie(req) };
  },

  async logout() { return { ok: true, __cookie: clearCookie() }; },

  async content(req, b) {
    const c = b.content;
    if (!c || typeof c !== "object" || Array.isArray(c)) throw new HttpError(400, "Invalid content.");
    for (const k of Object.keys(c)) if (!CONTENT_KEYS.includes(k)) delete c[k];
    for (const k of CONTENT_KEYS) if (k !== "settings" && c[k] != null && !Array.isArray(c[k])) throw new HttpError(400, `"${k}" must be a list.`);
    const json = JSON.stringify(c);
    if (json.length > 900_000) throw new HttpError(413, "Content is too large. Remove some images or long text.");
    const prev = await cmd("GET", P + "content");
    const ops = [];
    if (prev) ops.push(["LPUSH", P + "content:history", JSON.stringify({ ts: Date.now(), content: parse(prev) })], ["LTRIM", P + "content:history", 0, HISTORY - 1]);
    ops.push(["SET", P + "content", json], ["SET", P + "content:meta", JSON.stringify({ ts: Date.now() })]);
    await pipe(ops);
    return { ok: true, ts: Date.now() };
  },

  async restore(req, b) {
    const raw = await cmd("LINDEX", P + "content:history", Number(b.index) || 0);
    const v = parse(raw);
    if (!v?.content) throw new HttpError(404, "Version not found.");
    const cur = await cmd("GET", P + "content");
    await pipe([
      ...(cur ? [["LPUSH", P + "content:history", JSON.stringify({ ts: Date.now(), content: parse(cur) })]] : []),
      ["LTRIM", P + "content:history", 0, HISTORY - 1],
      ["SET", P + "content", JSON.stringify(v.content)],
      ["SET", P + "content:meta", JSON.stringify({ ts: Date.now(), restored: v.ts })],
    ]);
    return { ok: true, content: v.content };
  },

  async checkin(req, b) {
    let input = String(b.code || "").trim();
    const m = input.match(/[?&]t=([^&\s]+)/);
    if (m) input = decodeURIComponent(m[1]);
    let code = input.includes(".") ? verifyId("ticket", input) : input.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!code) throw new HttpError(400, "That QR code isn't a valid VFMBS ticket.");
    const eventId = await cmd("GET", `${P}ticket:${code}`);
    if (!eventId) throw new HttpError(404, `No ticket found for ${code}.`);
    const rec = parse(await cmd("HGET", `${P}rsvps:${eventId}`, code));
    if (!rec) throw new HttpError(404, "Ticket was cancelled.");
    if (b.event && b.event !== eventId) {
      const c = await loadContent(req);
      const other = (c.events || []).find((e) => e.id === eventId);
      throw new HttpError(409, `Wrong event: this ticket is for “${other?.title || eventId}”.`);
    }
    const already = rec.checkedIn;
    if (!already) { rec.checkedIn = Date.now(); await cmd("HSET", `${P}rsvps:${eventId}`, code, JSON.stringify(rec)); }
    return { ok: true, already: Boolean(already), ticket: rec, eventId };
  },

  async rsvp(req, b) {
    const eventId = str(b.eventId, "Event", { max: 60, required: true });
    const code = str(b.code, "Code", { max: 20, required: true });
    const key = `${P}rsvps:${eventId}`;
    const rec = parse(await cmd("HGET", key, code));
    if (!rec) throw new HttpError(404, "RSVP not found.");
    if (b.op === "remove") {
      await pipe([["HDEL", key, code], ["DEL", `${P}ticket:${code}`], ["DEL", `${P}rsvpe:${eventId}:${rec.email}`], ...(rec.waitlist ? [] : [["HINCRBY", P + "counts", eventId, -1]])]);
      return { ok: true };
    }
    if (b.op === "checkin") rec.checkedIn = rec.checkedIn ? null : Date.now();
    if (b.op === "promote" && rec.waitlist) { rec.waitlist = false; rec.no = await cmd("HINCRBY", P + "counts", eventId, 1); }
    await cmd("HSET", key, code, JSON.stringify(rec));
    return { ok: true, rsvp: rec };
  },

  async app(req, b) {
    const id = str(b.id, "Id", { max: 20, required: true });
    const app = parse(await cmd("HGET", P + "apps", id));
    if (!app) throw new HttpError(404, "Application not found.");
    if (b.op === "delete") {
      const ops = [["HDEL", P + "apps", id], ["DEL", `${P}appe:${app.email}`]];
      if (app.interview) ops.push(["HDEL", P + "slots", app.interview]);
      await pipe(ops);
      return { ok: true };
    }
    if (b.status) app.status = ["submitted", "reviewing", "interview", "accepted", "waitlisted", "declined"].includes(b.status) ? b.status : app.status;
    if (b.notes != null) app.notes = str(b.notes, "Notes", { max: 4000 });
    if (b.rating != null) app.rating = Math.max(0, Math.min(5, Number(b.rating) || 0));
    await cmd("HSET", P + "apps", id, JSON.stringify(app));
    return { ok: true, app: { id, ...app } };
  },

  async wsapp(req, b) {
    const key = `${P}wsapps:${str(b.workshopId, "Workshop", { max: 60, required: true })}`;
    const code = str(b.code, "Code", { max: 80, required: true });
    const app = parse(await cmd("HGET", key, code));
    if (!app) throw new HttpError(404, "Not found.");
    if (b.op === "delete") { await pipe([["HDEL", key, code], ["DEL", `${P}wse:${b.workshopId}:${app.email}`]]); return { ok: true }; }
    if (["review", "accepted", "waitlisted", "declined"].includes(b.status)) app.status = b.status;
    await cmd("HSET", key, code, JSON.stringify(app));
    return { ok: true, app };
  },

  async inbox(req, b) {
    const id = str(b.id, "Id", { max: 40, required: true });
    if (b.op === "delete") { await cmd("HDEL", P + "inbox", id); return { ok: true }; }
    const m = parse(await cmd("HGET", P + "inbox", id));
    if (!m) throw new HttpError(404, "Not found.");
    m.read = b.read !== false;
    await cmd("HSET", P + "inbox", id, JSON.stringify(m));
    return { ok: true };
  },

  async sub(req, b) {
    await cmd("HDEL", P + "subs", String(b.email || "").toLowerCase());
    return { ok: true };
  },

  async upload(req, b) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new HttpError(503, "Image uploads need Vercel Blob. Connect a Blob store in your Vercel project.");
    const type = String(b.type || "");
    if (!/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(type)) throw new HttpError(400, "Only images can be uploaded.");
    const buf = Buffer.from(String(b.data || ""), "base64");
    if (!buf.length || buf.length > 3_000_000) throw new HttpError(413, "Image must be under 3MB.");
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" }[type];
    const name = String(b.name || "image").toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9-]+/g, "-").slice(0, 40) || "image";
    const { put } = await import("@vercel/blob");
    const blob = await put(`vfmbs/${name}.${ext}`, buf, { access: "public", contentType: type, addRandomSuffix: true });
    return { url: blob.url };
  },
};

const numObj = (o) => { for (const k in o) o[k] = Number(o[k]) || 0; return o; };

export default handler(async (req, res) => {
  allow(req, ["GET", "POST"]);
  requireKV();
  const action = query(req).action || "";
  const table = req.method === "GET" ? GET : POST;
  const fn = Object.hasOwn(table, action) ? table[action] : null;
  if (!fn) throw new HttpError(404, "Unknown action.");

  let body = {};
  if (req.method === "POST") {
    sameOrigin(req);
    body = await readBody(req, action === "upload" ? 4_200_000 : 1_000_000);
  }
  if (!["login", "me"].includes(action)) requireAdmin(req);

  const out = await fn(req, body);
  const headers = {};
  if (out && out.__cookie) { headers["Set-Cookie"] = out.__cookie; delete out.__cookie; }
  send(res, 200, out, { headers });
});
