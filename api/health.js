// GET /api/health: which optional services are configured (no secrets are returned).
import { handler, send } from "./_lib/http.js";
import { hasKV, cmd } from "./_lib/kv.js";
import { emailEnabled } from "./_lib/email.js";

export default handler(async (req, res) => {
  let db = false;
  if (hasKV()) { try { db = (await cmd("PING")) === "PONG"; } catch {} }
  send(res, 200, {
    ok: true,
    database: db,
    email: emailEnabled(),
    uploads: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    adminConfigured: Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET) || process.env.VFMBS_MOCK_KV === "1",
  });
});
