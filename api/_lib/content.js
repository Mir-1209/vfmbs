// Site content: the version published from the admin dashboard lives in Redis.
// Until the first publish, the default file shipped with the site is used.
import fs from "node:fs";
import path from "node:path";
import { getJSON, hasKV } from "./kv.js";

const FILE = path.join(process.cwd(), "public", "assets", "data", "content.json");
let defaults;

export async function defaultContent(req) {
  if (defaults) return defaults;
  try {
    defaults = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    // Fallback: fetch the static file from our own deployment.
    const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host;
    if (host) {
      const r = await fetch(`https://${host}/assets/data/content.json`);
      if (r.ok) defaults = await r.json();
    }
  }
  return defaults || {};
}

// Sections added to the site after a board's last publish come from the defaults until they're edited.
export async function withDefaults(saved, req) {
  if (!saved) return saved;
  const d = await defaultContent(req);
  for (const k of Object.keys(d)) if (saved[k] === undefined) saved[k] = d[k];
  // posters shipped with the site fill in any film the board hasn't given a poster yet
  if (Array.isArray(saved.hits) && Array.isArray(d.hits)) {
    const art = Object.fromEntries(d.hits.filter((h) => h.image).map((h) => [h.id, h.image]));
    saved.hits = saved.hits.map((h) => (h && !h.image && art[h.id] ? { ...h, image: art[h.id] } : h));
  }
  return saved;
}

export async function loadContent(req) {
  const saved = hasKV() ? await getJSON("content", null) : null;
  return (await withDefaults(saved, req)) || (await defaultContent(req));
}

export const isPublished = (x) => x && x.published !== false;
export const findEvent = (c, id) => (c.events || []).find((e) => e.id === id && isPublished(e));
export const findWorkshop = (c, id) => (c.workshops || []).find((w) => w.id === id && isPublished(w));
