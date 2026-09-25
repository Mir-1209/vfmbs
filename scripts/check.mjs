// Pre-deploy sanity checks: JS syntax, content JSON shape, required files.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
let bad = 0;
const ok = (m) => console.log("  ✓ " + m);
const no = (m) => { console.log("  ✗ " + m); bad++; };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

console.log("JavaScript syntax");
for (const f of [...walk(path.join(root, "api")), ...walk(path.join(root, "public/assets/js")), ...walk(path.join(root, "scripts"))].filter((f) => /\.(m?js)$/.test(f))) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); } catch (e) { no(path.relative(root, f) + "\n" + e.stderr); }
}
ok("all files parse");

console.log("Content");
try {
  const c = JSON.parse(fs.readFileSync(path.join(root, "public/assets/data/content.json"), "utf8"));
  for (const k of ["settings", "events", "workshops", "tracks", "team", "posts"]) (c[k] ? ok : no)(k);
  const ids = new Set();
  for (const k of ["events", "workshops", "posts", "team"]) for (const x of c[k] || []) { if (ids.has(x.id)) no("duplicate id " + x.id); ids.add(x.id); }
  for (const e of c.events || []) if (isNaN(new Date(e.date))) no("bad date on " + e.id);
} catch (e) { no("content.json: " + e.message); }

console.log("Files");
for (const f of ["vercel.json", "public/index.html", "public/404.html", "public/admin.html", "public/robots.txt", "public/sitemap.xml", "public/site.webmanifest", "public/favicon.svg", "public/assets/brand/og.png"]) (fs.existsSync(path.join(root, f)) ? ok : no)(f);
const fns = fs.readdirSync(path.join(root, "api")).filter((f) => f.endsWith(".js"));
(fns.length <= 12 ? ok : no)(`${fns.length} serverless functions (Vercel Hobby limit: 12)`);

console.log(bad ? `\n${bad} problem(s) found.` : "\nAll good. Ready to deploy.");
process.exit(bad ? 1 : 0);
