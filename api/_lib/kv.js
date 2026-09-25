// Redis (Upstash REST) client with an in-memory mock for local development.
// Env (either pair works; both are injected by Vercel's Upstash/KV integration):
//   KV_REST_API_URL + KV_REST_API_TOKEN   or   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
import fs from "node:fs";
import path from "node:path";

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const MOCK = !URL_ && process.env.VFMBS_MOCK_KV === "1";

export const P = "vfmbs:";
export const hasKV = () => Boolean((URL_ && TOKEN) || MOCK);

/* ---------------- Mock (dev only) ---------------- */
let mem;
const MOCK_FILE = path.join(process.cwd(), ".data", "kv.json");
function memDB() {
  if (mem) return mem;
  mem = { s: {}, h: {}, l: {}, exp: {} };
  try { mem = { ...mem, ...JSON.parse(fs.readFileSync(MOCK_FILE, "utf8")) }; } catch {}
  return mem;
}
function persist() {
  try { fs.mkdirSync(path.dirname(MOCK_FILE), { recursive: true }); fs.writeFileSync(MOCK_FILE, JSON.stringify(mem)); } catch {}
}
function mockExec([c, ...a]) {
  const db = memDB();
  const now = Date.now();
  for (const k of Object.keys(db.exp)) if (db.exp[k] < now) { delete db.s[k]; delete db.h[k]; delete db.l[k]; delete db.exp[k]; }
  const k = a[0];
  switch (String(c).toUpperCase()) {
    case "GET": return db.s[k] ?? null;
    case "SET": {
      const opts = a.slice(2).map((x) => String(x).toUpperCase());
      if (opts.includes("NX") && k in db.s) return null;
      db.s[k] = String(a[1]);
      const ex = opts.indexOf("EX");
      if (ex >= 0) db.exp[k] = now + Number(a[2 + ex + 1]) * 1000; else delete db.exp[k];
      persist(); return "OK";
    }
    case "DEL": { let n = 0; for (const x of a) { if (x in db.s || x in db.h || x in db.l) n++; delete db.s[x]; delete db.h[x]; delete db.l[x]; delete db.exp[x]; } persist(); return n; }
    case "INCR": db.s[k] = String(Number(db.s[k] || 0) + 1); persist(); return Number(db.s[k]);
    case "EXPIRE": if (!(k in db.s) && !(k in db.h)) return 0; if (String(a[2] || "").toUpperCase() === "NX" && db.exp[k]) return 0; db.exp[k] = now + Number(a[1]) * 1000; return 1;
    case "HSET": { db.h[k] = db.h[k] || {}; let n = 0; for (let i = 1; i < a.length; i += 2) { if (!(a[i] in db.h[k])) n++; db.h[k][a[i]] = String(a[i + 1]); } persist(); return n; }
    case "HSETNX": { db.h[k] = db.h[k] || {}; if (a[1] in db.h[k]) return 0; db.h[k][a[1]] = String(a[2]); persist(); return 1; }
    case "HGET": return db.h[k]?.[a[1]] ?? null;
    case "HDEL": { let n = 0; for (const f of a.slice(1)) if (db.h[k] && f in db.h[k]) { delete db.h[k][f]; n++; } persist(); return n; }
    case "HGETALL": return Object.entries(db.h[k] || {}).flat();
    case "HLEN": return Object.keys(db.h[k] || {}).length;
    case "HINCRBY": { db.h[k] = db.h[k] || {}; db.h[k][a[1]] = String(Number(db.h[k][a[1]] || 0) + Number(a[2])); persist(); return Number(db.h[k][a[1]]); }
    case "LPUSH": { db.l[k] = db.l[k] || []; db.l[k].unshift(...a.slice(1).map(String).reverse()); persist(); return db.l[k].length; }
    case "LRANGE": { const l = db.l[k] || []; const e = Number(a[2]); return l.slice(Number(a[1]), e < 0 ? l.length + e + 1 : e + 1); }
    case "LTRIM": { const l = db.l[k] || []; const e = Number(a[2]); db.l[k] = l.slice(Number(a[1]), e < 0 ? l.length + e + 1 : e + 1); persist(); return "OK"; }
    case "LINDEX": return (db.l[k] || [])[Number(a[1])] ?? null;
    case "PING": return "PONG";
    default: throw new Error("Mock KV: unsupported command " + c);
  }
}

/* ---------------- Public API ---------------- */
export async function cmd(...args) {
  if (MOCK) return mockExec(args);
  if (!hasKV()) throw Object.assign(new Error("Database not configured"), { status: 503, expose: true });
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error("KV: " + j.error);
  return j.result;
}

export async function pipe(cmds) {
  if (!cmds.length) return [];
  if (MOCK) return cmds.map(mockExec);
  if (!hasKV()) throw Object.assign(new Error("Database not configured"), { status: 503, expose: true });
  const r = await fetch(URL_.replace(/\/$/, "") + "/pipeline", { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmds) });
  const j = await r.json();
  return j.map((x) => { if (x.error) throw new Error("KV: " + x.error); return x.result; });
}

export const toObj = (arr) => { const o = {}; for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; };
export const parse = (s, d = null) => { try { return s == null ? d : JSON.parse(s); } catch { return d; } };

export async function getJSON(key, d = null) { return parse(await cmd("GET", P + key), d); }
export async function setJSON(key, v) { return cmd("SET", P + key, JSON.stringify(v)); }
export async function hgetallJSON(key) {
  const o = toObj(await cmd("HGETALL", P + key));
  for (const k in o) o[k] = parse(o[k], o[k]);
  return o;
}
export async function getContent() { return getJSON("content", null); }
