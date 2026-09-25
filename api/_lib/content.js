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

export async function loadContent(req) {
  const saved = hasKV() ? await getJSON("content", null) : null;
  return saved || (await defaultContent(req));
}

export const isPublished = (x) => x && x.published !== false;
export const findEvent = (c, id) => (c.events || []).find((e) => e.id === id && isPublished(e));
export const findWorkshop = (c, id) => (c.workshops || []).find((w) => w.id === id && isPublished(w));
