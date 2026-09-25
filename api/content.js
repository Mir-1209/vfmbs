// GET /api/content: published site content + live seat counts (edge-cached briefly).
import { handler, send, allow } from "./_lib/http.js";
import { hasKV, pipe, P, toObj, parse } from "./_lib/kv.js";
import { isPublished } from "./_lib/content.js";

export default handler(async (req, res) => {
  allow(req, ["GET"]);
  // Browsers always revalidate; only Vercel's edge caches (briefly) so publishes show up fast.
  const edge = { cache: "no-cache", headers: { "Vercel-CDN-Cache-Control": "max-age=15, stale-while-revalidate=120" } };
  if (!hasKV()) return send(res, 200, { live: false }, edge);
  const [raw, counts] = await pipe([["GET", P + "content"], ["HGETALL", P + "counts"]]);
  const content = parse(raw, null);
  if (content) {
    for (const k of ["events", "workshops", "posts", "team", "partners"]) if (Array.isArray(content[k])) content[k] = content[k].filter(isPublished);
    if (content.settings) delete content.settings.notes;
  }
  const c = toObj(counts);
  for (const k in c) c[k] = Number(c[k]) || 0;
  send(res, 200, { live: true, content, counts: c }, edge);
});
