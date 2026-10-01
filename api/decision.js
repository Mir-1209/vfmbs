// Decision letters.
// POST /api/decision { code }  -> { status:"pending" } or the applicant's letter
// Applicants type the confirmation number from their application email (VF-XXXXXX or a 6-character workshop code).
import { handler, send, allow, readBody, rateLimit, sameOrigin, requireKV, HttpError } from "./_lib/http.js";
import { loadContent } from "./_lib/content.js";
import { str } from "./_lib/validate.js";
import { findApplication, normalizeCode, decisionVisible, letterBody, programName } from "./_lib/decision.js";

export default handler(async (req, res) => {
  allow(req, ["POST"]);
  requireKV();
  sameOrigin(req);
  await rateLimit(req, "decision", 15, 600);
  const b = await readBody(req, 2_000);
  const code = str(b.code, "Confirmation number", { max: 30, required: true });
  if (!normalizeCode(code)) throw new HttpError(400, "That doesn't look like a confirmation number. It looks like VF-3FQ2K3 (membership) or a 6-character workshop code.");
  const content = await loadContent(req);
  const s = content.settings || {};
  const found = await findApplication(code, content);
  if (!found) throw new HttpError(404, "We couldn't find an application with that confirmation number. Check the email we sent when you applied.");
  const { app, kind, ws, ref } = found;
  const name = String(app.pref || app.name || "").trim();
  const first = name.split(/\s+/)[0] || "Applicant";
  const program = programName(kind, s, ws);
  if (!decisionVisible(app, s)) return send(res, 200, { status: "pending", kind, first, ref, program });
  send(res, 200, {
    status: app.status,
    kind,
    first,
    ref,
    program,
    date: app.notifiedAt || app.decidedAt || Date.now(),
    body: letterBody(app.status, { first, program, settings: s }),
    signer: s.decisionSigner || "The Board of Vanderbilt Greenlight",
    signerTitle: s.decisionSigner ? s.decisionSignerTitle || "" : "",
    contact: s.email || "",
  });
});
