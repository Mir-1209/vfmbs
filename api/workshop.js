// POST /api/workshop { workshopId, name, email, year, major, exp, why }  -> { code, token }
// GET  /api/workshop?t=<token>                                        -> status
import { handler, send, allow, readBody, query, rateLimit, sameOrigin, requireKV, randomCode, HttpError } from "./_lib/http.js";
import { cmd, P, parse } from "./_lib/kv.js";
import { signId, verifyId } from "./_lib/auth.js";
import { str, email, isBot } from "./_lib/validate.js";
import { loadContent, findWorkshop } from "./_lib/content.js";
import { sendEmail, layout, esc } from "./_lib/email.js";

export default handler(async (req, res) => {
  allow(req, ["GET", "POST"]);
  requireKV();
  const content = await loadContent(req);

  if (req.method === "GET") {
    await rateLimit(req, "ws-get", 60, 300);
    const code = verifyId("ws", query(req).t);
    if (!code) throw new HttpError(400, "Invalid link.");
    const [wsId] = code.split(":");
    const app = parse(await cmd("HGET", `${P}wsapps:${wsId}`, code));
    if (!app) throw new HttpError(404, "Application not found.");
    const release = content.settings?.releaseDecisions;
    const status = ["accepted", "waitlisted", "declined"].includes(app.status) && !release ? "review" : app.status;
    return send(res, 200, { status });
  }

  sameOrigin(req);
  const b = await readBody(req, 20_000);
  if (isBot(b)) return send(res, 200, { code: "0", token: "0.0" });
  await rateLimit(req, "ws", 8, 3600);
  const ws = findWorkshop(content, str(b.workshopId, "Workshop", { max: 60, required: true }));
  if (!ws) throw new HttpError(404, "That workshop isn't available.");
  if (ws.open === false || (ws.deadline && new Date(ws.deadline) < new Date())) throw new HttpError(400, "Applications for this workshop are closed.");
  const app = {
    name: str(b.name, "Name", { max: 80, required: true, min: 2 }),
    email: email(b.email),
    year: str(b.year, "Class year", { max: 20, required: true }),
    major: str(b.major, "Major", { max: 120, required: true }),
    exp: str(b.exp, "Experience", { max: 40 }),
    why: str(b.why, "Why", { max: 600, required: true }),
    status: "review",
    ts: Date.now(),
  };
  const claimed = await cmd("SET", `${P}wse:${ws.id}:${app.email}`, "1", "NX");
  if (!claimed) throw new HttpError(409, "You've already applied to this workshop.");
  const code = `${ws.id}:${randomCode(6)}`;
  await cmd("HSET", `${P}wsapps:${ws.id}`, code, JSON.stringify({ ...app, code }));
  await sendEmail({
    to: app.email,
    subject: `Workshop application: ${ws.title}`,
    html: layout({ kicker: "Workshop application received", title: ws.title, body: `<p>Thanks, ${esc(app.name.split(" ")[0])}. We'll email decisions shortly after the deadline.</p><p>${esc(ws.schedule || "")}</p>` }),
  });
  send(res, 200, { code: code.split(":")[1], token: signId("ws", code) });
});
