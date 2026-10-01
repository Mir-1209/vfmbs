// Vercel build step (vercel.json → buildCommand). Lives at the repo root because .vercelignore skips scripts/. No bundling: it only stamps the real
// domain into canonical links, social previews, the sitemap and robots.txt, and dates the sitemap.
// Domain: SITE_URL if set (e.g. https://greenlight.vanderbilt.edu), otherwise Vercel's production domain.
import fs from "node:fs";
import path from "node:path";

try {
  const PUB = path.join(process.cwd(), "public");
  const raw = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "");
  const next = raw.trim().replace(/\/+$/, "");
  const robots = path.join(PUB, "robots.txt");
  const cur = fs.readFileSync(robots, "utf8").match(/Sitemap: (https:\/\/[^/\s]+)/)[1];

  const files = [...fs.readdirSync(PUB).filter((f) => f.endsWith(".html")).map((f) => path.join(PUB, f)), path.join(PUB, "sitemap.xml"), robots];
  let n = 0;
  if (/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(next) && next !== cur) {
    for (const f of files) {
      const s = fs.readFileSync(f, "utf8");
      if (s.includes(cur)) { fs.writeFileSync(f, s.split(cur).join(next)); n++; }
    }
    console.log(`SEO: ${cur} → ${next} in ${n} files`);
  } else console.log(`SEO: keeping ${cur}${raw && !next.startsWith("https://") ? ` (ignored SITE_URL "${raw}": it must start with https://)` : ""}`);

  const today = new Date().toISOString().slice(0, 10);
  const sm = path.join(PUB, "sitemap.xml");
  fs.writeFileSync(sm, fs.readFileSync(sm, "utf8").replace(/<lastmod>[^<]*<\/lastmod>/g, "").replace(/<\/loc>/g, `</loc><lastmod>${today}</lastmod>`));
  console.log("SEO: sitemap dated", today);
} catch (e) {
  // Never fail a deploy over SEO stamping: the site works with the default URLs.
  console.warn("SEO step skipped:", e.message);
}
