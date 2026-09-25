// POST /api/subscribe { email }: newsletter list.
import { handler, send, allow, readBody, rateLimit, sameOrigin, requireKV } from "./_lib/http.js";
import { cmd, P } from "./_lib/kv.js";
import { email, isBot } from "./_lib/validate.js";

export default handler(async (req, res) => {
  allow(req, ["POST"]);
  sameOrigin(req);
  requireKV();
  const b = await readBody(req, 2_000);
  if (isBot(b)) return send(res, 200, { ok: true });
  await rateLimit(req, "sub", 10, 3600);
  const e = email(b.email);
  await cmd("HSETNX", P + "subs", e, JSON.stringify({ ts: Date.now(), source: String(b.source || "site").slice(0, 30) }));
  send(res, 200, { ok: true });
});
