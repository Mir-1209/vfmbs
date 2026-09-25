// Point canonical URLs, sitemap and social previews at your real domain.
//   npm run set-domain -- https://vfmbs.org
import fs from "node:fs";
import path from "node:path";

const next = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(next)) {
  console.error("Usage: npm run set-domain -- https://your-domain.com");
  process.exit(1);
}
const PUB = path.join(process.cwd(), "public");
const files = [...fs.readdirSync(PUB).filter((f) => f.endsWith(".html")).map((f) => path.join(PUB, f)), path.join(PUB, "sitemap.xml"), path.join(PUB, "robots.txt"), path.join(process.cwd(), "scripts", "pages.py")];
const cur = fs.readFileSync(path.join(PUB, "robots.txt"), "utf8").match(/Sitemap: (https:\/\/[^/\s]+)/)[1];
let n = 0;
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  if (s.includes(cur)) { fs.writeFileSync(f, s.split(cur).join(next)); n++; }
}
console.log(`Updated ${n} files: ${cur} → ${next}`);
