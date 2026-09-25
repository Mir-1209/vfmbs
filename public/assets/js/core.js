/* =========================================================================
   VFMBS core: content loading, API client, storage, formatting, icons, art.
   Exposes window.V. Every page script waits on V.ready.
   ========================================================================= */
(() => {
  const V = (window.V = {});
  const $ = (V.$ = (s, r = document) => r.querySelector(s));
  V.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (V.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  V.TZ = "America/Chicago";
  V.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  V.touch = matchMedia("(hover: none)").matches;

  // Only allow safe link targets from admin-edited content
  V.safeUrl = (u) => {
    const s = String(u || "").trim();
    if (/^(https?:\/\/|mailto:|tel:)/i.test(s) || /^\/(?!\/)/.test(s) || /^#/.test(s)) return s;
    return "";
  };
  V.page = document.body.dataset.page;

  /* ---------------- Storage ---------------- */
  const LS = (V.LS = {
    get(k, d) { try { const v = localStorage.getItem("vfmbs:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("vfmbs:" + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem("vfmbs:" + k); } catch {} },
  });
  const listeners = [];
  V.onChange = (f) => listeners.push(f);
  const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  const Store = (V.Store = {
    profiles: () => LS.get("profiles", []),
    saveProfiles: (p) => { LS.set("profiles", p); emit(); },
    activeId: () => LS.get("active", "guest"),
    setActive: (id) => { LS.set("active", id); emit(); },
    profile: () => Store.profiles().find((p) => p.id === Store.activeId()) || null,
    get: (k, d) => LS.get(`${Store.activeId()}:${k}`, d),
    set: (k, v) => { LS.set(`${Store.activeId()}:${k}`, v); emit(); },
    tickets: () => Store.get("rsvps", {}),
    list: () => Store.get("list", []),
    wsApps: () => Store.get("ws", {}),
    app: () => Store.get("app", null),
    toggleList(id) {
      const l = Store.list();
      const i = l.indexOf(id);
      i >= 0 ? l.splice(i, 1) : l.unshift(id);
      Store.set("list", l);
      return i < 0;
    },
    remember(d) {
      const list = Store.profiles();
      let p = list.find((x) => x.id === Store.activeId());
      if (!p) { p = { id: Store.activeId(), color: "gold" }; list.push(p); }
      for (const k of ["name", "email", "year"]) if (!p[k] && d[k]) p[k] = d[k];
      Store.saveProfiles(list);
    },
  });

  /* ---------------- API ---------------- */
  V.api = async (path, body, { method, timeout = 12000 } = {}) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    let r;
    try {
      r = await fetch("/api/" + path, {
        method: method || (body ? "POST" : "GET"),
        headers: body ? { "Content-Type": "application/json", "X-VFMBS": "1" } : { "X-VFMBS": "1" },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "same-origin",
        signal: ctrl.signal,
      });
    } catch (e) {
      throw Object.assign(new Error("Network error. Check your connection and try again."), { network: true });
    } finally { clearTimeout(t); }
    let j = {};
    try { j = await r.json(); } catch {}
    if (!r.ok) throw Object.assign(new Error(j.error || `Request failed (${r.status})`), { status: r.status, demo: j.demo || r.status === 404 });
    return j;
  };

  /* ---------------- Content ---------------- */
  const pub = (x) => x && x.published !== false;
  V.ready = (async () => {
    let live = false, content = null, counts = {};
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3500);
      const r = await fetch("/api/content", { signal: ctrl.signal });
      clearTimeout(t);
      if (r.ok && (r.headers.get("content-type") || "").includes("json")) {
        const j = await r.json();
        live = Boolean(j.live);
        content = j.content || null;
        counts = j.counts || {};
      }
    } catch {}
    if (!content) {
      try { content = await (await fetch("/assets/data/content.json")).json(); } catch { content = {}; }
    }
    // In preview mode (no database yet), admins can preview unpublished edits in their own browser.
    if (!live) { const pv = LS.get("preview-content"); if (pv) content = pv; }
    for (const k of ["events", "workshops", "posts", "team", "partners"]) content[k] = (content[k] || []).filter(pub);
    content.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    content.posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    content.settings = content.settings || {};
    V.C = content;
    V.live = live;
    V.counts = counts;
    return content;
  })();

  /* ---------------- Formatting & time ---------------- */
  V.fmt = (iso, o, tz) => new Intl.DateTimeFormat("en-US", { timeZone: tz || V.TZ, ...o }).format(new Date(iso));
  V.evTz = (ev) => ev.tz || V.TZ;
  V.fmtDate = (ev) => V.fmt(ev.date, { weekday: "short", month: "short", day: "numeric" }, V.evTz(ev));
  V.fmtTime = (ev) => {
    const tz = V.evTz(ev);
    const same = V.fmt(ev.date, { dateStyle: "short" }, tz) === V.fmt(ev.end || ev.date, { dateStyle: "short" }, tz);
    if (!same) return `${V.fmtDate(ev)} – ${V.fmt(ev.end, { weekday: "short", month: "short", day: "numeric" }, tz)}`;
    return V.fmt(ev.date, { hour: "numeric", minute: "2-digit" }, tz) + (ev.end ? " – " + V.fmt(ev.end, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }, tz) : "");
  };
  V.isPast = (ev) => new Date(ev.end || ev.date) < new Date();
  V.taken = (ev) => {
    const mine = Store.tickets()[ev.id] && !Store.tickets()[ev.id].waitlist ? 1 : 0;
    const base = V.live ? V.counts[ev.id] || 0 : (ev.demoTaken || 0) + mine;
    return Math.min(ev.capacity || Infinity, base);
  };
  V.seatsLeft = (ev) => (ev.capacity ? Math.max(0, ev.capacity - V.taken(ev)) : Infinity);
  V.hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  V.match = (id) => 90 + (V.hash(id) % 10);
  V.pad = (n, l = 2) => String(n).padStart(l, "0");

  // Timezone math (used by the admin date pickers)
  function tzOffsetMin(date, tz) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(date).map((x) => [x.type, x.value]));
    return Math.round((Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - date.getTime()) / 60000);
  }
  V.zonedToISO = (local, tz = V.TZ) => {
    if (!local) return "";
    const [d, t = "00:00"] = local.split("T");
    const [y, m, dd] = d.split("-").map(Number);
    const [hh, mm] = t.split(":").map(Number);
    const guess = Date.UTC(y, m - 1, dd, hh, mm);
    let off = tzOffsetMin(new Date(guess), tz);
    off = tzOffsetMin(new Date(guess - off * 60000), tz);
    const a = Math.abs(off);
    return `${d}T${V.pad(hh)}:${V.pad(mm)}:00${off >= 0 ? "+" : "-"}${V.pad((a / 60) | 0)}:${V.pad(a % 60)}`;
  };
  V.isoToLocal = (iso, tz = V.TZ) => {
    if (!iso) return "";
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${V.pad(+p.hour % 24)}:${p.minute}`;
  };

  V.byId = (id) => {
    const C = V.C || {};
    return (C.events || []).find((e) => e.id === id) || (C.workshops || []).find((w) => w.id === id) || (C.tracks || []).find((t) => t.id === id) || (C.posts || []).find((p) => p.id === id);
  };
  V.trackName = (id) => ((V.C.tracks || []).find((t) => t.id === id) || {}).name || "";

  /* ---------------- Icons ---------------- */
  const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  V.icons = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5Z"/></svg>`,
    info: I('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    check: I('<path d="M20 6 9 17l-5-5"/>'),
    chevDown: I('<path d="m6 9 6 6 6-6"/>'),
    chevL: I('<path d="m15 18-6-6 6-6"/>'),
    chevR: I('<path d="m9 18 6-6-6-6"/>'),
    arrowR: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    arrowUR: I('<path d="M7 17 17 7M8 7h9v9"/>'),
    close: I('<path d="M18 6 6 18M6 6l12 12"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    cal: I('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    pin: I('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    clock: I('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
    ticket: I('<path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>'),
    download: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
    thumb: I('<path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'),
    trash: I('<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    replay: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    ig: I('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
    li: I('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/>'),
    tiktok: I('<path d="M9 12a4 4 0 1 0 4 4V2c.6 2.8 2.7 4.8 6 5"/>'),
    yt: I('<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49 49 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49 49 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>'),
    mail: I('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
    link: I('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    print: I('<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
    sparkle: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    popcorn: I('<path d="M5 9h14l-2 12H7Z"/><path d="M9 9l.8 12M15 9l-.8 12"/><path d="M6 9a2.5 2.5 0 0 1 2-4 2.5 2.5 0 0 1 4-1.5A2.5 2.5 0 0 1 16 5a2.5 2.5 0 0 1 2 4"/>'),
  };

  /* ---------------- Poster motifs (line art) ---------------- */
  const S = (p) => `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  V.motifs = {
    clapper: S('<rect x="30" y="80" width="140" height="90" rx="4"/><path d="M30 80 170 80M30 110h140"/><g class="top"><path d="M30 80 36 50 170 40 164 70Z"/><path d="M55 48 70 76M90 45l15 28M125 42l15 28"/></g><circle cx="100" cy="140" r="14"/>'),
    chart: S('<path d="M25 170h155M25 170V30"/><path d="M35 150 70 115l28 18 36-50 36-28" stroke-width="3"/><circle cx="70" cy="115" r="4"/><circle cx="98" cy="133" r="4"/><circle cx="134" cy="83" r="4"/><circle cx="170" cy="55" r="5"/><path d="M45 170v-12M75 170v-30M105 170v-22M135 170v-55M165 170v-80" stroke-width="10" opacity=".25"/>'),
    spotlight: S('<path d="M60 40 20 180h160L140 40"/><ellipse cx="100" cy="40" rx="40" ry="12"/><ellipse cx="100" cy="180" rx="80" ry="12"/><path d="M100 28V8M70 32 58 14M130 32l12-18"/>'),
    film: S('<circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="12"/><circle cx="100" cy="58" r="16"/><circle cx="100" cy="142" r="16"/><circle cx="58" cy="100" r="16"/><circle cx="142" cy="100" r="16"/><path d="M170 100h22v70"/>'),
    camera: S('<rect x="20" y="80" width="110" height="70" rx="6"/><path d="m130 100 45-22v74l-45-22"/><circle cx="50" cy="55" r="24"/><circle cx="100" cy="55" r="24"/><circle cx="50" cy="55" r="6"/><circle cx="100" cy="55" r="6"/><path d="M60 150 45 185M90 150l15 35"/>'),
    rocket: S('<path d="M100 20c30 20 40 60 30 100H70C60 80 70 40 100 20Z"/><circle cx="100" cy="70" r="12"/><path d="m70 120-20 25 25-5M130 120l20 25-25-5M85 135c0 15 5 30 15 40 10-10 15-25 15-40"/>'),
    ticket: S('<path d="M25 60h150v25a15 15 0 0 0 0 30v25H25v-25a15 15 0 0 0 0-30Z"/><path d="M130 60v80" stroke-dasharray="6 6"/><path d="M45 90h60M45 110h40"/><path d="m152 92 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>'),
    coffee: S('<path d="M40 80h100v50a40 40 0 0 1-40 40H80a40 40 0 0 1-40-40Z"/><path d="M140 95h12a18 18 0 0 1 0 36h-14"/><path d="M70 60c0-10 10-10 10-20M100 60c0-10 10-10 10-20"/><path d="M30 185h140"/>'),
    play: S('<rect x="20" y="40" width="160" height="110" rx="10"/><path d="m85 70 40 25-40 25Z"/><path d="M70 175h60M100 150v25"/>'),
    trophy: S('<path d="M65 30h70v50a35 35 0 0 1-70 0Z"/><path d="M65 45H40a25 25 0 0 0 25 35M135 45h25a25 25 0 0 1-25 35"/><path d="M100 115v30M70 170h60l-6-25H76Z"/>'),
    palm: S('<path d="M100 185c5-40 5-90-5-120"/><path d="M95 65c-20-20-50-20-65-5 25-5 45 5 65 5ZM95 65c10-25 40-35 60-25-25 0-45 15-60 25ZM95 65c25-5 55 5 70 25-25-10-50-15-70-25ZM95 65c-25 5-45 25-50 50 15-20 35-35 50-50Z"/><circle cx="160" cy="40" r="14"/><path d="M20 185h160"/>'),
    building: S('<path d="M40 185V60h50v125M90 185V25h50v160M140 185V90h30v95"/><path d="M55 80h20M55 100h20M55 120h20M55 140h20M105 45h20M105 65h20M105 85h20M105 105h20M105 125h20M105 145h20M150 110h10M150 130h10M150 150h10M25 185h160"/>'),
    star: S('<path d="m100 20 22 50 54 5-41 36 12 53-47-28-47 28 12-53-41-36 54-5Z"/><circle cx="100" cy="100" r="20"/>'),
    music: S('<path d="M70 150V50l90-20v100"/><circle cx="50" cy="150" r="20"/><circle cx="140" cy="130" r="20"/><path d="M70 80l90-20"/>'),
    mic: S('<rect x="75" y="20" width="50" height="90" rx="25"/><path d="M55 90a45 45 0 0 0 90 0M100 135v40M70 180h60"/>'),
    popcorn: S('<path d="M50 90h100l-14 95H64Z"/><path d="M75 90l6 95M125 90l-6 95M100 90v95"/><circle cx="62" cy="78" r="16"/><circle cx="88" cy="62" r="18"/><circle cx="116" cy="64" r="17"/><circle cx="140" cy="80" r="15"/><circle cx="100" cy="42" r="14"/>'),
    reel: S('<circle cx="70" cy="70" r="40"/><circle cx="140" cy="70" r="30"/><circle cx="70" cy="70" r="8"/><circle cx="140" cy="70" r="6"/><rect x="40" y="115" width="130" height="60" rx="6"/><path d="m170 130 20-10v50l-20-10"/>'),
    handshake: S('<path d="m20 90 40-30 30 10 30-10 60 30"/><path d="M60 60 20 130l30 25M140 60l40 70-30 25"/><path d="m70 125 20 20a8 8 0 0 0 12-12M85 115l25 25a8 8 0 0 0 12-12l-30-30M100 105l25 22a8 8 0 0 0 11-11l-24-24"/>'),
  };

  V.palettes = {
    gold: ["#1a1408", "#4a3814", "#cfae70"],
    crimson: ["#1a0306", "#5c0a14", "#ff3b4e"],
    cobalt: ["#030a1a", "#0e2a5c", "#5aa9ff"],
    emerald: ["#021410", "#0b4a3a", "#3ee0a8"],
    violet: ["#0c0418", "#3b1466", "#b884ff"],
    ember: ["#1a0a02", "#6a2a08", "#ff9a3c"],
    mono: ["#0b0b0b", "#2b2b2b", "#f2f2f2"],
    teal: ["#01151a", "#0a4250", "#4fe3ff"],
    cream: ["#2a2620", "#6b6252", "#f2ede4"],
  };
  V.vars = (palette) => {
    const [a1, a2, a3] = V.palettes[palette] || V.palettes.gold;
    return `--a1:${a1};--a2:${a2};--a3:${a3}`;
  };
  V.art = (palette = "gold", motif = "film", opts = {}) => {
    const img = V.safeUrl(opts.image);
    return `<div class="art ${img ? "has-img" : ""}" style="${V.vars(palette)}">${img ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async">` : ""}${opts.beam ? '<div class="beam"></div>' : ""}<div class="glow"></div>${motif && !img ? `<div class="motif">${V.motifs[motif] || ""}</div>` : ""}</div>`;
  };

  /* ---------------- QR (vendored qrcode-generator, MIT) ---------------- */
  V.qr = (text, { dark = "#111", light = "transparent" } = {}) => {
    if (typeof window.qrcode !== "function") return "";
    const q = window.qrcode(0, "M");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg class="qr" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="Ticket QR code"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
  };

  V.ticketUrl = (token) => `${location.origin}/ticket?t=${encodeURIComponent(token)}`;
  V.demoCode = (prefix) => prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
})();
