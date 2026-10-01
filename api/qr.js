// GET /api/qr?t=<ticket token>: the ticket's QR code as a PNG (used in emails).
// Only signs/encodes; no database access.
import { handler, allow, query, HttpError } from "./_lib/http.js";
import { verifyId } from "./_lib/auth.js";
import { siteUrl } from "./_lib/email.js";
import { qrPng } from "./_lib/png.js";

export default handler(async (req, res) => {
  allow(req, ["GET"]);
  const t = query(req).t;
  if (!verifyId("ticket", t)) throw new HttpError(400, "Invalid ticket.");
  const png = qrPng(`${siteUrl(req)}/ticket?t=${encodeURIComponent(t)}`);
  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.end(png);
});
