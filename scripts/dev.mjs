// Local dev server: serves /public with clean URLs, applies vercel.json headers and
// redirects, and runs /api functions. Without Upstash env vars it uses an in-memory
// database persisted to .data/kv.json (admin password: "admin").
//   npm run dev   →  http://localhost:3000
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3000;

for (const f of [".env.local", ".env"]) {
  try {
    for (const line of fs.readFileSync(path.join(ROOT, f), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && m[2] && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  } catch {}
}
if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) process.env.VFMBS_MOCK_KV = "1";

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };
const toRe = (src) => new RegExp("^" + src.replace(/\(\.\*\)/g, "(.*)").replace(/\/:path\*/g, "(?:/.*)?") + "$");

function applyHeaders(res, p) {
  for (const h of cfg.headers || []) {
    if (!toRe(h.source).test(p)) continue;
    for (const { key, value } of h.headers) {
      if (key === "Strict-Transport-Security") continue;
      res.setHeader(key, key === "Content-Security-Policy" ? value.replace("; upgrade-insecure-requests", "") : value);
    }
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let p = decodeURIComponent(url.pathname);
  applyHeaders(res, p);

  for (const r of cfg.redirects || []) if (r.source === p) { res.writeHead(r.permanent ? 308 : 307, { Location: r.destination }); return res.end(); }

  if (p.startsWith("/api/")) {
    const name = p.slice(5).replace(/[^a-z0-9-]/gi, "");
    const file = path.join(ROOT, "api", name + ".js");
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('{"error":"Not found"}'); }
    try {
      const mod = await import(pathToFileURL(file).href + "?v=" + fs.statSync(file).mtimeMs);
      return await mod.default(req, res);
    } catch (e) {
      console.error(e);
      res.statusCode = 500; return res.end('{"error":"dev server error"}');
    }
  }

  if (p.endsWith(".html") && p !== "/404.html") { res.writeHead(308, { Location: p.replace(/(index)?\.html$/, "") || "/" }); return res.end(); }
  let file = path.join(PUB, p);
  if (!file.startsWith(PUB)) { res.statusCode = 400; return res.end(); }
  if (p === "/" ) file = path.join(PUB, "index.html");
  else if (!path.extname(p)) file += ".html";
  let status = 200;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { file = path.join(PUB, "404.html"); status = 404; }
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n  VFMBS dev server → http://localhost:${PORT}`);
  console.log(`  Database: ${process.env.VFMBS_MOCK_KV ? "in-memory mock (.data/kv.json)" : "Upstash"}`);
  console.log(`  Admin:    http://localhost:${PORT}/admin  (password: ${process.env.ADMIN_PASSWORD ? "from env" : "admin"})\n`);
});
