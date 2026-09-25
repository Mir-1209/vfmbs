/* =========================================================================
   VFMBS Admin: no-code control room.
   Content editing is schema-driven: add a field to SCHEMAS and it appears.
   ========================================================================= */
(() => {
  const { $, $$, esc, icons } = V;
  const root = $("#admin");
  const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ic = {
    dash: I('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'),
    scan: I('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>'),
    ticket: icons.ticket, cal: icons.cal, mail: icons.mail,
    apps: I('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>'),
    ws: I('<rect x="2" y="4" width="20" height="14" rx="2"/><path d="m10 8 5 3-5 3Z"/>'),
    inbox: I('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/>'),
    subs: I('<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>'),
    pen: I('<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    users: I('<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"/>'),
    hand: I('<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>'),
    tracks: I('<path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/>'),
    home: I('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>'),
    gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>'),
    hist: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>'),
    up: I('<path d="m18 15-6-6-6 6"/>'), down: I('<path d="m6 9 6 6 6-6"/>'),
    eye: I('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: I('<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>'),
    copy: I('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    trash: icons.trash, plus: icons.plus, close: icons.close, check: icons.check, download: icons.download,
    upload: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
    out: I('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    ext: icons.arrowUR, menu: icons.menu,
  };

  /* ---------------- State ---------------- */
  const S = { mode: "live", health: {}, content: null, published: "", view: "dashboard", cache: {}, overview: null };
  const TZS = ["America/Chicago", "America/New_York", "America/Los_Angeles", "America/Denver", "Europe/London", "UTC"];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const live = () => S.mode === "live";
  const api = (action, body) => V.api("admin?action=" + action, body);
  const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, p, v) => { const ks = p.split("."); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] == null ? (a[k] = {}) : a[k]), o); t[last] = v; };
  const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
  const uid = (prefix, title, list) => { let base = `${prefix}-${slug(title)}`, id = base, n = 2; while (list.some((x) => x.id === id)) id = `${base}-${n++}`; return id; };
  const fmtDT = (iso, tz) => (iso ? V.fmt(iso, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }, tz) : "—");
  const ago = (ts) => { const s = (Date.now() - ts) / 1000; return s < 60 ? "just now" : s < 3600 ? Math.round(s / 60) + "m ago" : s < 86400 ? Math.round(s / 3600) + "h ago" : Math.round(s / 86400) + "d ago"; };

  /* ---------------- Toast & confirm ---------------- */
  function toast(msg, type = "") {
    let box = $(".adm-toasts");
    if (!box) { box = document.createElement("div"); box.className = "adm-toasts"; document.body.append(box); }
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.innerHTML = `<span class="dot"></span><span>${esc(msg)}</span>`;
    box.append(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3800);
  }
  const fail = (e) => toast(e.message || String(e), "error");

  /* ---------------- CSV (formula-injection safe) ---------------- */
  function csv(rows, cols, name) {
    const cell = (v) => {
      let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const out = [cols.map((c) => cell(c[1])).join(","), ...rows.map((r) => cols.map((c) => cell(typeof c[0] === "function" ? c[0](r) : r[c[0]])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + out], { type: "text/csv;charset=utf-8" }));
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const copy = (text, label = "Copied") => navigator.clipboard?.writeText(text).then(() => toast(label), () => prompt("Copy:", text));

  /* =====================================================================
     SCHEMAS
     ===================================================================== */
  const PALS = Object.keys(V.palettes), MOTIFS = Object.keys(V.motifs);
  const posterFields = [{ k: "image", t: "image", label: "Photo / poster image (optional)", help: "Leave empty to use the generated poster art below." }, { k: "palette", t: "palette", label: "Poster colors" }, { k: "motif", t: "motif", label: "Poster icon" }];
  const inWeek = (h = 18) => { const d = new Date(Date.now() + 7 * 864e5); return V.zonedToISO(`${d.toISOString().slice(0, 10)}T${V.pad(h)}:00`); };

  const SCHEMAS = {
    events: {
      title: "Events", noun: "event", prefix: "ev", icon: ic.cal,
      label: (x) => x.title, sub: (x) => `${fmtDT(x.date, x.tz)} · ${x.location || "No location"}${x.capacity ? ` · ${x.capacity} seats` : ""}`,
      badge: (x) => (new Date(x.end || x.date) < new Date() ? ["Past", ""] : x.rsvpOpen === false ? ["RSVP closed", "warn"] : ["RSVP open", "ok"]),
      create: () => ({ title: "New event", type: "Speaker", date: inWeek(18), end: inWeek(20), tz: V.TZ, location: "", capacity: 100, desc: "", tags: [], rsvpOpen: true, membersOnly: false, published: false, image: "", palette: "gold", motif: "spotlight" }),
      fields: [
        { k: "title", t: "text", label: "Title", req: true },
        { row: [{ k: "type", t: "select", label: "Type", opts: ["Speaker", "Social", "Workshop", "Competition", "Trek", "Screening", "Summit"] }, { k: "capacity", t: "number", label: "Capacity", help: "0 = unlimited. Extra RSVPs join the waitlist." }] },
        { row: [{ k: "date", t: "datetime", label: "Starts" }, { k: "end", t: "datetime", label: "Ends" }] },
        { row: [{ k: "tz", t: "tz", label: "Time zone" }, { k: "location", t: "text", label: "Location" }] },
        { k: "desc", t: "textarea", label: "Description" },
        { k: "tags", t: "tags", label: "Tags", help: "Comma separated, e.g. Finance, Free food" },
        ...posterFields,
        { row: [{ k: "published", t: "toggle", label: "Visible on site" }, { k: "rsvpOpen", t: "toggle", label: "RSVPs open" }, { k: "membersOnly", t: "toggle", label: "Members only" }] },
      ],
    },
    workshops: {
      title: "Workshops", noun: "workshop", prefix: "ws", icon: ic.ws,
      label: (x) => x.title, sub: (x) => `${x.subtitle || ""} · ${x.seats} seats · due ${fmtDT(x.deadline)}`,
      badge: (x) => (x.open === false || new Date(x.deadline) < new Date() ? ["Closed", "warn"] : ["Open", "ok"]),
      create: () => ({ title: "New workshop", subtitle: "", level: "Beginner", track: (S.content.tracks[0] || {}).id || "", seats: 20, deadline: inWeek(23), schedule: "", location: "", episodes: [{ t: "Pilot", d: "45m", s: "" }], open: true, published: false, image: "", palette: "gold", motif: "chart" }),
      fields: [
        { k: "title", t: "text", label: "Title", req: true },
        { k: "subtitle", t: "text", label: "Subtitle" },
        { row: [{ k: "track", t: "select", label: "Track", opts: () => S.content.tracks.map((t) => [t.id, t.name]) }, { k: "level", t: "select", label: "Level", opts: ["Beginner", "Intermediate", "Advanced", "All levels"] }] },
        { row: [{ k: "seats", t: "number", label: "Seats" }, { k: "deadline", t: "datetime", label: "Application deadline" }] },
        { k: "schedule", t: "text", label: "Schedule", help: "e.g. Tuesdays 7–9 PM · Oct 20 – Dec 1" },
        { k: "location", t: "text", label: "Location" },
        { k: "episodes", t: "objects", label: "Episodes", noun: "episode", fields: [{ row: [{ k: "t", t: "text", label: "Episode title" }, { k: "d", t: "text", label: "Length" }] }, { k: "s", t: "text", label: "Summary" }], blank: () => ({ t: "New episode", d: "1h", s: "" }) },
        ...posterFields,
        { row: [{ k: "published", t: "toggle", label: "Visible on site" }, { k: "open", t: "toggle", label: "Accepting applications" }] },
      ],
    },
    posts: {
      title: "Journal", noun: "story", prefix: "post", icon: ic.pen,
      label: (x) => x.title, sub: (x) => `${x.category || ""} · ${x.date || ""} · ${x.author || ""}`,
      create: () => ({ title: "New story", category: "News", date: new Date().toISOString().slice(0, 10), author: "", excerpt: "", body: "", image: "", palette: "gold", motif: "reel", published: false }),
      fields: [
        { k: "title", t: "text", label: "Headline", req: true },
        { row: [{ k: "category", t: "text", label: "Category", list: () => [...new Set(S.content.posts.map((p) => p.category).filter(Boolean))] }, { k: "date", t: "date", label: "Date" }] },
        { k: "author", t: "text", label: "Author" },
        { k: "excerpt", t: "textarea", label: "Standfirst / excerpt", rows: 2 },
        { k: "body", t: "textarea", label: "Story", rows: 14, help: "Leave a blank line between paragraphs. Start a paragraph with > for a pull quote." },
        ...posterFields,
        { k: "published", t: "toggle", label: "Visible on site" },
      ],
    },
    team: {
      title: "Team", noun: "member", prefix: "tm", icon: ic.users, square: true,
      label: (x) => x.name, sub: (x) => `${x.role} · ${x.group || ""}${x.year ? " · " + x.year : ""}`,
      create: () => ({ name: "New member", role: "", group: "Executive Board", track: "", year: "", major: "", bio: "", photo: "", linkedin: "", email: "", published: true }),
      fields: [
        { row: [{ k: "name", t: "text", label: "Name", req: true }, { k: "role", t: "text", label: "Role / title" }] },
        { row: [{ k: "group", t: "text", label: "Group", list: () => [...new Set(["Executive Board", "Track Leads", "Directors", "Advisors", "Alumni Council", ...S.content.team.map((m) => m.group)])] }, { k: "track", t: "select", label: "Track (sets card color)", opts: () => [["", "—"], ...S.content.tracks.map((t) => [t.id, t.name])] }] },
        { row: [{ k: "year", t: "text", label: "Class year", help: "e.g. '27" }, { k: "major", t: "text", label: "Major" }] },
        { k: "bio", t: "textarea", label: "Bio", rows: 4 },
        { k: "photo", t: "image", label: "Headshot" },
        { row: [{ k: "linkedin", t: "url", label: "LinkedIn URL" }, { k: "email", t: "text", label: "Email" }] },
        { k: "published", t: "toggle", label: "Visible on site" },
      ],
    },
    partners: {
      title: "Partners", noun: "partner", prefix: "pt", icon: ic.hand, square: true,
      label: (x) => x.name, sub: (x) => `${x.tier || ""} · ${x.url || ""}`,
      create: () => ({ name: "New partner", tier: "Feature", url: "", logo: "", blurb: "", published: true }),
      fields: [
        { row: [{ k: "name", t: "text", label: "Name", req: true }, { k: "tier", t: "text", label: "Tier", list: () => (S.content.sponsorTiers || []).map((t) => t.name) }] },
        { k: "url", t: "url", label: "Website" },
        { k: "logo", t: "image", label: "Logo (transparent PNG or SVG works best)" },
        { k: "blurb", t: "text", label: "Short description" },
        { k: "published", t: "toggle", label: "Visible on site" },
      ],
    },
    tracks: {
      title: "Tracks", noun: "track", prefix: "tr", icon: ic.tracks,
      label: (x) => x.name, sub: (x) => x.genre,
      create: () => ({ name: "New track", genre: "", blurb: "", skills: [], palette: "gold", motif: "chart" }),
      fields: [
        { k: "name", t: "text", label: "Name", req: true },
        { k: "genre", t: "text", label: "Tagline", help: "e.g. Finance · M&A · Valuation" },
        { k: "blurb", t: "textarea", label: "Description", rows: 3 },
        { k: "skills", t: "list", label: "Skills you'll learn", help: "One per line" },
        { k: "palette", t: "palette", label: "Colors" }, { k: "motif", t: "motif", label: "Icon" },
      ],
    },
  };

  const HOMEPAGE = [
    { k: "featured", t: "objects", label: "Hero slides (billboard)", noun: "slide", blank: () => ({ id: "f-" + Date.now().toString(36), kicker: "NOW SHOWING", title: "New slide", tagline: "", desc: "", meta: [], rating: "", palette: "gold", motif: "film", image: "", cta: { label: "Learn more", href: "/events" }, info: "/about" }),
      fields: [{ row: [{ k: "kicker", t: "text", label: "Kicker" }, { k: "rating", t: "text", label: "Rating badge" }] }, { k: "title", t: "text", label: "Title" }, { k: "tagline", t: "text", label: "Tagline" }, { k: "desc", t: "textarea", label: "Description", rows: 2 }, { k: "meta", t: "tags", label: "Meta items", help: "Comma separated" }, { row: [{ k: "cta.label", t: "text", label: "Button text" }, { k: "cta.href", t: "text", label: "Button link", help: "/apply, /events#ev-id or https://…" }] }, { k: "info", t: "text", label: "More info link" }, ...posterFields] },
    { k: "stats", t: "objects", label: "Stats (numbers that count up)", noun: "stat", blank: () => ({ n: 10, suffix: "", label: "New stat" }), fields: [{ row: [{ k: "n", t: "number", label: "Number" }, { k: "suffix", t: "text", label: "Suffix" }, { k: "label", t: "text", label: "Label" }] }] },
    { k: "pipeline", t: "objects", label: "“From script to screen” panels", noun: "panel", blank: () => ({ n: "06", title: "New stage", sub: "", text: "", motif: "film", palette: "gold" }), fields: [{ row: [{ k: "n", t: "text", label: "No." }, { k: "title", t: "text", label: "Title" }] }, { k: "sub", t: "text", label: "Subtitle" }, { k: "text", t: "textarea", label: "Text", rows: 2 }, { k: "palette", t: "palette", label: "Colors" }, { k: "motif", t: "motif", label: "Icon" }] },
    { k: "top10", t: "list", label: "Top 10 reasons to join", help: "One per line (max 10 shown)" },
    { k: "reviews", t: "objects", label: "Member reviews", noun: "review", blank: () => ({ q: "", who: "Member", stars: 5 }), fields: [{ k: "q", t: "textarea", label: "Quote", rows: 2 }, { row: [{ k: "who", t: "text", label: "Attribution" }, { k: "stars", t: "number", label: "Stars (1–5)" }] }] },
    { k: "faq", t: "objects", label: "FAQ", noun: "question", blank: () => ({ q: "New question?", a: "" }), fields: [{ k: "q", t: "text", label: "Question" }, { k: "a", t: "textarea", label: "Answer", rows: 3 }] },
    { k: "ticker", t: "objects", label: "Ticker (illustrative index)", noun: "item", blank: () => ["NEW ITEM", "▲ 1.0%"], fields: [{ row: [{ k: "0", t: "text", label: "Label" }, { k: "1", t: "text", label: "Value", help: "Start with ▲ or ▼" }] }] },
    { k: "sponsorTiers", t: "objects", label: "Sponsorship packages (Partners page)", noun: "package", blank: () => ({ name: "New tier", price: "", perks: [] }), fields: [{ row: [{ k: "name", t: "text", label: "Name" }, { k: "price", t: "text", label: "Subtitle / price" }] }, { k: "perks", t: "list", label: "Perks", help: "One per line" }] },
  ];

  const SETTINGS = [
    { legend: "Announcement bar", fields: [{ k: "announcement.enabled", t: "toggle", label: "Show announcement bar at top of every page" }, { k: "announcement.text", t: "text", label: "Message" }, { row: [{ k: "announcement.label", t: "text", label: "Link text" }, { k: "announcement.link", t: "text", label: "Link", help: "/apply or https://…" }] }] },
    { legend: "Recruiting", fields: [
      { row: [{ k: "applicationsOpen", t: "toggle", label: "Applications open" }, { k: "releaseDecisions", t: "toggle", label: "Show decisions to applicants", help: "When off, applicants only see “In review” until you release decisions." }] },
      { k: "applicationDeadline", t: "datetime", label: "Application deadline (Central Time)" },
      { k: "timeline", t: "objects", label: "Recruitment timeline", noun: "milestone", blank: () => ({ label: "Milestone", date: inWeek(12) }), fields: [{ row: [{ k: "label", t: "text", label: "Label" }, { k: "date", t: "datetime", label: "Date" }] }] },
      { k: "interviewSlots", t: "slots", label: "Interview slots (Central Time)" },
      { k: "membershipDues", t: "text", label: "Membership dues (shown on About page)" },
    ] },
    { legend: "Organization", fields: [
      { row: [{ k: "orgName", t: "text", label: "Full name" }, { k: "shortName", t: "text", label: "Short name" }] },
      { k: "tagline", t: "text", label: "Tagline" },
      { row: [{ k: "season", t: "text", label: "Current season", help: "e.g. Fall 2026" }, { k: "issue", t: "text", label: "Journal issue", help: "e.g. Vol. 04" }] },
      { row: [{ k: "email", t: "text", label: "Public email" }, { k: "sponsorEmail", t: "text", label: "Partnerships email" }] },
      { k: "location", t: "text", label: "Location line" },
    ] },
    { legend: "Social links", fields: [{ row: [{ k: "instagram", t: "url", label: "Instagram" }, { k: "linkedin", t: "url", label: "LinkedIn" }] }, { row: [{ k: "tiktok", t: "url", label: "TikTok" }, { k: "youtube", t: "url", label: "YouTube" }] }] },
  ];

  /* =====================================================================
     FIELD RENDERER
     ===================================================================== */
  let fid = 0;
  function renderFields(host, fields, obj, onChange, ctx = {}) {
    for (const f of fields) {
      if (f.row) {
        const r = document.createElement("div");
        r.className = f.row.length === 3 ? "grid3" : "row2";
        r.style.gap = "14px";
        renderFields(r, f.row, obj, onChange, ctx);
        host.append(r);
        continue;
      }
      const id = "f" + ++fid;
      const w = document.createElement("div");
      w.className = "field";
      const val = get(obj, f.k);
      const label = `<label for="${id}">${esc(f.label)}${f.req ? " *" : ""}</label>`;
      const help = f.help ? `<div class="help">${esc(f.help)}</div>` : "";
      const change = (v) => { set(obj, f.k, v); onChange(f.k); };
      switch (f.t) {
        case "text": case "url": case "number": case "date": {
          const list = f.list ? f.list() : null;
          w.innerHTML = `${label}<input class="input" id="${id}" type="${f.t === "url" ? "url" : f.t}" value="${esc(val ?? "")}" ${list ? `list="${id}-l"` : ""} ${f.req ? "required" : ""}>${list ? `<datalist id="${id}-l">${list.map((o) => `<option value="${esc(o)}">`).join("")}</datalist>` : ""}${help}`;
          $("input", w).addEventListener("input", (e) => change(f.t === "number" ? Number(e.target.value) || 0 : e.target.value));
          break;
        }
        case "textarea":
          w.innerHTML = `${label}<textarea class="textarea" id="${id}" rows="${f.rows || 4}" style="min-height:${(f.rows || 4) * 24}px">${esc(val ?? "")}</textarea>${help}`;
          $("textarea", w).addEventListener("input", (e) => change(e.target.value));
          break;
        case "select": case "tz": {
          const opts = f.t === "tz" ? TZS : typeof f.opts === "function" ? f.opts() : f.opts;
          w.innerHTML = `${label}<select class="select" id="${id}">${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(val ?? "") === String(v) ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select>${help}`;
          $("select", w).addEventListener("change", (e) => {
            if (f.t === "tz") { // keep wall-clock times when switching time zone
              const oldTz = obj.tz || V.TZ;
              for (const k of ["date", "end"]) if (obj[k]) obj[k] = V.zonedToISO(V.isoToLocal(obj[k], oldTz), e.target.value);
            }
            change(e.target.value);
            if (f.t === "tz") ctx.rerender?.();
          });
          break;
        }
        case "datetime": {
          const tz = () => obj.tz || V.TZ;
          w.innerHTML = `${label}<input class="input" id="${id}" type="datetime-local" value="${esc(V.isoToLocal(val, tz()))}">${help}`;
          $("input", w).addEventListener("change", (e) => change(V.zonedToISO(e.target.value, tz())));
          break;
        }
        case "toggle":
          w.innerHTML = `<label class="switch" style="margin-top:6px"><input type="checkbox" id="${id}" ${val !== false && val != null ? "checked" : ""}><i></i>${esc(f.label)}</label>${help}`;
          $("input", w).addEventListener("change", (e) => change(e.target.checked));
          break;
        case "tags":
          w.innerHTML = `${label}<input class="input" id="${id}" value="${esc((val || []).join(", "))}">${help}`;
          $("input", w).addEventListener("input", (e) => change(e.target.value.split(",").map((s) => s.trim()).filter(Boolean)));
          break;
        case "list":
          w.innerHTML = `${label}<textarea class="textarea" id="${id}" rows="5">${esc((val || []).join("\n"))}</textarea>${help}`;
          $("textarea", w).addEventListener("input", (e) => change(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)));
          break;
        case "palette":
          w.innerHTML = `<span class="label">${esc(f.label)}</span><div class="swatches">${PALS.map((p) => `<button type="button" class="swatch ${val === p ? "on" : ""}" style="${V.vars(p)}" data-v="${p}" aria-label="${p}" title="${p}"></button>`).join("")}</div>`;
          $$(".swatch", w).forEach((b) => b.addEventListener("click", () => { $$(".swatch", w).forEach((x) => x.classList.toggle("on", x === b)); change(b.dataset.v); }));
          break;
        case "motif":
          w.innerHTML = `<span class="label">${esc(f.label)}</span><div class="motifs">${MOTIFS.map((m) => `<button type="button" class="motif-btn ${val === m ? "on" : ""}" data-v="${m}" title="${m}" aria-label="${m}">${V.motifs[m]}</button>`).join("")}</div>`;
          $$(".motif-btn", w).forEach((b) => b.addEventListener("click", () => { $$(".motif-btn", w).forEach((x) => x.classList.toggle("on", x === b)); change(b.dataset.v); }));
          break;
        case "image": {
          const canUp = live() && S.health.uploads;
          w.innerHTML = `${label}<div class="img-field"><input class="input" id="${id}" type="url" value="${esc(val || "")}" placeholder="https://…"><button type="button" class="btn btn-outline btn-sm" ${canUp ? "" : 'title="Connect Vercel Blob to enable uploads"'}>${ic.upload} Upload</button></div><div class="img-prev" ${val ? "" : "hidden"}></div>${help || ""}${canUp ? "" : `<div class="help">Paste an image link, or connect Vercel Blob to upload files directly.</div>`}<input type="file" accept="image/*" hidden>`;
          const inp = $("input[type=url]", w), prev = $(".img-prev", w), file = $("input[type=file]", w);
          const show = (u) => { const s = V.safeUrl(u); prev.hidden = !s; if (s) prev.style.backgroundImage = `url("${s.replace(/"/g, "%22")}")`; };
          show(val);
          inp.addEventListener("input", (e) => { change(e.target.value.trim()); show(e.target.value.trim()); });
          $("button", w).addEventListener("click", () => canUp ? file.click() : toast("Uploads need Vercel Blob. For now, paste an image link.", "error"));
          file.addEventListener("change", async () => {
            const fl = file.files[0];
            if (!fl) return;
            const btn = $("button", w);
            V.busy?.(btn, true) || btn.classList.add("loading");
            try { const url = await uploadImage(fl); inp.value = url; change(url); show(url); toast("Image uploaded"); }
            catch (e) { fail(e); }
            btn.classList.remove("loading"); btn.disabled = false;
          });
          break;
        }
        case "objects": {
          const arr = Array.isArray(val) ? val : [];
          if (!Array.isArray(val)) set(obj, f.k, arr);
          w.innerHTML = `<span class="label">${esc(f.label)}</span>${help}<div class="subrows"></div><button type="button" class="btn btn-outline btn-sm" style="margin-top:10px">${ic.plus} Add ${esc(f.noun || "item")}</button>`;
          const rows = $(".subrows", w);
          const draw = () => {
            rows.innerHTML = "";
            arr.forEach((it, i) => {
              const r = document.createElement("div");
              r.className = "subrow";
              r.innerHTML = `<div class="sr-n">${esc((f.noun || "item").toUpperCase())} ${i + 1}</div><div class="sr-acts"><button type="button" class="ib" data-a="up" aria-label="Move up">${ic.up}</button><button type="button" class="ib" data-a="down" aria-label="Move down">${ic.down}</button><button type="button" class="ib danger" data-a="del" aria-label="Remove">${ic.trash}</button></div>`;
              renderFields(r, f.fields, it, () => onChange(f.k), ctx);
              $$(".sr-acts button", r).forEach((b) => b.addEventListener("click", () => {
                const a = b.dataset.a;
                if (a === "del") { if (!confirm(`Remove this ${f.noun || "item"}?`)) return; arr.splice(i, 1); }
                if (a === "up" && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                if (a === "down" && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                onChange(f.k); draw();
              }));
              rows.append(r);
            });
          };
          draw();
          $(":scope > .btn", w).addEventListener("click", () => { arr.push(f.blank()); onChange(f.k); draw(); });
          break;
        }
        case "slots": {
          const arr = Array.isArray(val) ? val : [];
          if (!Array.isArray(val)) set(obj, f.k, arr);
          const today = new Date().toISOString().slice(0, 10);
          w.innerHTML = `<span class="label">${esc(f.label)}</span>
            <div class="slot-gen">
              <div><div class="help">Day</div><input class="input" type="date" value="${today}" data-g="day"></div>
              <div><div class="help">From</div><input class="input" type="time" value="10:00" data-g="from"></div>
              <div><div class="help">To</div><input class="input" type="time" value="17:00" data-g="to"></div>
              <div><div class="help">Every (min)</div><input class="input" type="number" value="30" min="10" step="5" data-g="step"></div>
              <button type="button" class="btn btn-outline btn-sm">${ic.plus} Add</button>
            </div>
            <div class="slot-chips"></div>
            <div class="actions" style="margin-top:8px"><button type="button" class="btn btn-outline btn-sm" data-clear>Clear past slots</button><button type="button" class="btn btn-outline btn-sm" data-all>Remove all</button></div>`;
          const chips = $(".slot-chips", w);
          const draw = () => {
            arr.sort();
            chips.innerHTML = arr.length ? arr.map((s, i) => `<span>${esc(fmtDT(s))}<button type="button" data-i="${i}" aria-label="Remove">×</button></span>`).join("") : `<span class="help">No slots yet. Generate some above.</span>`;
            $$("button", chips).forEach((b) => b.addEventListener("click", () => { arr.splice(+b.dataset.i, 1); onChange(f.k); draw(); }));
          };
          draw();
          $(".slot-gen .btn", w).addEventListener("click", () => {
            const g = (n) => $(`[data-g=${n}]`, w).value;
            const [fh, fm] = g("from").split(":").map(Number), [th, tm] = g("to").split(":").map(Number), step = Math.max(10, +g("step") || 30);
            let added = 0;
            for (let m = fh * 60 + fm; m < th * 60 + tm; m += step) {
              const iso = V.zonedToISO(`${g("day")}T${V.pad((m / 60) | 0)}:${V.pad(m % 60)}`);
              if (!arr.includes(iso)) { arr.push(iso); added++; }
            }
            onChange(f.k); draw(); toast(`Added ${added} slots`);
          });
          $("[data-clear]", w).addEventListener("click", () => { const keep = arr.filter((s) => new Date(s) > new Date()); arr.length = 0; arr.push(...keep); onChange(f.k); draw(); });
          $("[data-all]", w).addEventListener("click", () => { if (confirm("Remove all interview slots?")) { arr.length = 0; onChange(f.k); draw(); } });
          break;
        }
      }
      host.append(w);
    }
  }

  async function uploadImage(file) {
    if (file.size > 12e6) throw new Error("That file is over 12MB.");
    let blob = file, type = file.type;
    if (/^image\/(jpeg|png|webp)$/.test(type)) {
      const img = await createImageBitmap(file);
      const scale = Math.min(1, 1800 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      type = type === "image/png" ? "image/png" : "image/jpeg";
      blob = await new Promise((r) => c.toBlob(r, type, 0.86));
      if (type === "image/png" && blob.size > 2.5e6) { type = "image/jpeg"; blob = await new Promise((r) => c.toBlob(r, type, 0.86)); }
    }
    if (blob.size > 3e6) throw new Error("Image is still over 3MB after resizing. Try a smaller file.");
    const data = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.readAsDataURL(blob); });
    return (await api("upload", { name: file.name, type, data })).url;
  }

  /* =====================================================================
     DIRTY STATE / PUBLISH
     ===================================================================== */
  const isDirty = () => JSON.stringify(S.content) !== S.published;
  let draftT;
  function changed() {
    $(".dirty")?.classList.toggle("on", isDirty());
    const pb = $("#publish");
    if (pb) pb.disabled = !isDirty();
    clearTimeout(draftT);
    draftT = setTimeout(() => V.LS.set("admin-draft", { base: S.published, content: S.content, ts: Date.now() }), 500);
  }
  async function publish() {
    if (!isDirty()) return;
    const btn = $("#publish");
    btn.classList.add("loading");
    try {
      if (live()) await api("content", { content: S.content });
      else V.LS.set("preview-content", S.content);
      S.published = JSON.stringify(S.content);
      V.LS.del("admin-draft");
      toast(live() ? "Published! Changes are live within ~30 seconds." : "Saved to preview. Open the site in this browser to see it.");
      changed();
    } catch (e) { fail(e); }
    btn.classList.remove("loading");
  }
  function discard() {
    if (!confirm("Discard all unpublished changes?")) return;
    S.content = JSON.parse(S.published);
    V.LS.del("admin-draft");
    changed();
    go(S.view);
  }
  addEventListener("beforeunload", (e) => { if (S.content && isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* =====================================================================
     SHELL
     ===================================================================== */
  const NAV = [
    ["Overview", [["dashboard", "Dashboard", ic.dash], ["checkin", "Check-in", ic.scan]]],
    ["People", [["rsvps", "RSVPs", ic.ticket], ["applications", "Applications", ic.apps], ["wsapps", "Workshop apps", ic.ws], ["inbox", "Inbox", ic.inbox], ["subscribers", "Subscribers", ic.subs]]],
    ["Content", [["events", "Events", ic.cal], ["workshops", "Workshops", ic.ws], ["posts", "Journal", ic.pen], ["team", "Team", ic.users], ["partners", "Partners", ic.hand], ["tracks", "Tracks", ic.tracks]]],
    ["Site", [["homepage", "Homepage", ic.home], ["settings", "Settings", ic.gear], ["versions", "Versions & backup", ic.hist]]],
  ];
  const TITLES = Object.fromEntries(NAV.flatMap(([, it]) => it.map(([k, l]) => [k, l])));

  function shell() {
    root.innerHTML = `
      <div class="adm">
        <aside class="adm-side" id="side">
          <div class="adm-brand"><img src="/assets/brand/logo.svg" alt=""><div><b>VFMBS</b><small>Control room</small></div></div>
          ${NAV.map(([g, items]) => `<div class="adm-group">${g}</div>` + items.map(([k, l, i]) => `<button class="adm-nav" data-go="${k}">${i}<span>${l}</span><span class="cnt" data-cnt="${k}" hidden></span></button>`).join("")).join("")}
          <div class="spacer"></div>
          <a class="adm-nav" href="/" target="_blank" rel="noopener">${ic.ext}<span>View site</span></a>
          ${live() ? `<button class="adm-nav" id="logout">${ic.out}<span>Sign out</span></button>` : `<button class="adm-nav" id="leave-preview">${ic.out}<span>Exit preview</span></button>`}
        </aside>
        <div class="adm-body">
          <header class="adm-top">
            <button class="icon-btn adm-menu" id="menu" aria-label="Menu">${ic.menu}</button>
            <h1 id="view-title">Dashboard</h1>
            <span class="chip-status ${live() ? "live" : "preview"}">${live() ? "Live · database connected" : "Preview mode · this browser only"}</span>
            <span class="grow"></span>
            <span class="dirty">● Unpublished changes <button class="btn btn-outline btn-sm" id="discard" style="height:30px;padding:0 12px">Discard</button></span>
            <button class="btn btn-gold btn-sm" id="publish" disabled>${ic.check} ${live() ? "Publish changes" : "Save preview"}</button>
          </header>
          <main class="adm-main" id="view"></main>
        </div>
      </div>
      <div class="drawer" id="drawer" role="dialog" aria-modal="true"></div><div class="drawer-bg" id="drawer-bg"></div>`;
    $$("[data-go]").forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.go; $("#side").classList.remove("open"); }));
    $("#publish").addEventListener("click", publish);
    $("#discard").addEventListener("click", discard);
    $("#menu").addEventListener("click", () => $("#side").classList.toggle("open"));
    $("#logout")?.addEventListener("click", async () => { if (isDirty() && !confirm("You have unpublished changes. Sign out anyway?")) return; try { await api("logout", {}); } catch {} V.LS.del("admin-draft"); S.content = null; location.hash = ""; location.reload(); });
    $("#leave-preview")?.addEventListener("click", () => { V.LS.del("admin-preview"); location.reload(); });
    $("#drawer-bg").addEventListener("click", closeDrawer);
    addEventListener("hashchange", () => go(location.hash.slice(1) || "dashboard"));
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); publish(); } });
    go(location.hash.slice(1) || "dashboard");
    changed();
    if (live()) refreshCounts();
  }

  async function refreshCounts() {
    try {
      S.overview = await api("overview");
      const o = S.overview;
      const setC = (k, n, hot) => { const el = $(`[data-cnt="${k}"]`); if (el) { el.hidden = !n; el.textContent = n; el.classList.toggle("hot", Boolean(hot)); } };
      setC("applications", o.apps);
      setC("inbox", o.unread, o.unread);
      setC("subscribers", o.subs);
      setC("rsvps", Object.values(o.counts).reduce((a, b) => a + b, 0));
      setC("wsapps", Object.values(o.wsCounts).reduce((a, b) => a + b, 0));
    } catch {}
  }

  function go(view) {
    closeDrawer();
    S.view = TITLES[view] ? view : "dashboard";
    $$("[data-go]").forEach((b) => b.classList.toggle("on", b.dataset.go === S.view));
    $("#view-title").textContent = TITLES[S.view];
    document.title = `${TITLES[S.view]} · VFMBS Admin`;
    const v = $("#view");
    v.innerHTML = "";
    scrollTo(0, 0);
    const people = ["rsvps", "applications", "wsapps", "inbox", "subscribers", "checkin"];
    if (people.includes(S.view) && !live()) return v.append(needDB());
    ({ dashboard, checkin, rsvps, applications, wsapps, inbox, subscribers, homepage, settings, versions }[S.view] || collection)(v, S.view);
  }
  function needDB() {
    const d = document.createElement("div");
    d.className = "empty-s";
    d.innerHTML = `<h3 style="margin:0 0 8px;color:#fff">Connect the database to see people data</h3><p style="margin:0">RSVPs, applications, messages and check-in need the live database. Follow the setup steps in the README (Vercel → Storage → Upstash for Redis).</p>`;
    return d;
  }

  /* =====================================================================
     COLLECTION VIEW (events, workshops, posts, team, partners, tracks)
     ===================================================================== */
  function collection(v, key) {
    const sc = SCHEMAS[key];
    const list = S.content[key] = S.content[key] || [];
    let q = "";
    v.innerHTML = `
      <div class="tbl-tools"><input class="input" type="search" placeholder="Search ${esc(sc.title.toLowerCase())}…" id="cq"><span class="grow"></span><button class="btn btn-gold btn-sm" id="new">${ic.plus} New ${esc(sc.noun)}</button></div>
      <div class="items" id="items"></div>
      <p class="help" style="margin-top:14px">Changes are drafts until you press <b>Publish changes</b>. Use ${ic.eye.replace("<svg", '<svg style="width:13px;display:inline;vertical-align:-2px"')} to hide something without deleting it.</p>`;
    const draw = () => {
      const items = list.map((x, i) => [x, i]).filter(([x]) => !q || JSON.stringify(x).toLowerCase().includes(q));
      $("#items").innerHTML = items.length ? items.map(([x, i]) => {
        const hidden = x.published === false;
        const b = sc.badge ? sc.badge(x) : null;
        const img = x.image || x.photo || x.logo;
        return `<div class="item ${hidden ? "hidden-item" : ""}" data-i="${i}">
          <div class="grip"><button data-a="up" aria-label="Move up">${ic.up}</button><button data-a="down" aria-label="Move down">${ic.down}</button></div>
          <div class="thumb ${sc.square ? "sq" : ""}">${V.art(x.palette || "gold", sc.square ? null : x.motif, { image: img })}</div>
          <div style="min-width:0;cursor:pointer" data-a="edit"><h3>${esc(sc.label(x))}</h3><p>${esc(sc.sub(x))}</p></div>
          <div class="acts">${hidden ? `<span class="pill">Hidden</span>` : ""}${b ? `<span class="pill ${b[1]}">${esc(b[0])}</span>` : ""}
            ${"published" in x || key !== "tracks" ? `<button class="ib" data-a="vis" aria-label="${hidden ? "Show" : "Hide"}" title="${hidden ? "Show on site" : "Hide from site"}">${hidden ? ic.eyeOff : ic.eye}</button>` : ""}
            <button class="ib" data-a="dup" aria-label="Duplicate" title="Duplicate">${ic.copy}</button>
            <button class="ib" data-a="edit" aria-label="Edit" title="Edit">${ic.pen}</button>
            <button class="ib danger" data-a="del" aria-label="Delete" title="Delete">${ic.trash}</button></div>
        </div>`;
      }).join("") : `<div class="empty-s">No ${esc(sc.title.toLowerCase())} yet.</div>`;
    };
    $("#items").addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"), row = e.target.closest(".item");
      if (!b || !row) return;
      const i = +row.dataset.i, x = list[i], a = b.dataset.a;
      if (a === "edit") return editItem(key, x, draw);
      if (a === "up" && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
      if (a === "down" && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
      if (a === "vis") x.published = x.published === false;
      if (a === "dup") { const c = clone(x); c.id = uid(sc.prefix, (sc.label(x) || "") + " copy", list); if ("title" in c) c.title += " (copy)"; c.published = false; list.splice(i + 1, 0, c); }
      if (a === "del") {
        const extra = key === "events" && S.overview?.counts?.[x.id] ? `\n\n${S.overview.counts[x.id]} people have RSVP'd. Consider hiding it instead.` : key === "tracks" ? "\n\nWorkshops and applications that reference this track will show it blank." : "";
        if (!confirm(`Delete “${sc.label(x)}”?${extra}`)) return;
        list.splice(i, 1);
      }
      changed(); draw();
    });
    $("#cq").addEventListener("input", (e) => { q = e.target.value.toLowerCase(); draw(); });
    $("#new").addEventListener("click", () => {
      const x = sc.create();
      x.id = uid(sc.prefix, sc.label(x), list);
      list.unshift(x);
      changed(); draw();
      editItem(key, x, draw, true);
    });
    draw();
  }

  function editItem(key, x, redraw, isNew) {
    const sc = SCHEMAS[key];
    const d = $("#drawer");
    const preview = () => {
      const p = $(".preview", d);
      if (!p) return;
      const img = x.image || x.photo || x.logo;
      p.innerHTML = V.art(x.palette || "gold", sc.square ? null : x.motif, { image: img, beam: true }) + `<div class="card-label">${esc(sc.label(x))}</div>`;
      $(".drawer-head h2", d).textContent = sc.label(x) || "Untitled";
    };
    const render = () => {
      d.innerHTML = `
        <div class="drawer-head"><h2></h2><span class="pill">${esc(x.id)}</span><button class="ib" id="dclose" aria-label="Close">${ic.close}</button></div>
        <div class="drawer-body"><div class="preview"></div><form id="dform" novalidate></form></div>
        <div class="drawer-foot">${key === "events" ? `<a class="btn btn-outline btn-sm" href="/events#${esc(x.id)}" target="_blank" rel="noopener">${ic.ext} View</a>` : key === "posts" ? `<a class="btn btn-outline btn-sm" href="/journal?p=${esc(x.id)}" target="_blank" rel="noopener">${ic.ext} View</a>` : ""}<span style="flex:1"></span><button class="btn btn-gold btn-sm" id="ddone">${ic.check} Done</button></div>`;
      renderFields($("#dform", d), sc.fields, x, () => { changed(); preview(); }, { rerender: render });
      preview();
      $("#dclose", d).addEventListener("click", closeDrawer);
      $("#ddone", d).addEventListener("click", closeDrawer);
    };
    render();
    d.classList.add("open");
    $("#drawer-bg").classList.add("open");
    S.onDrawerClose = () => { redraw(); if (isNew) toast(`Draft ${sc.noun} created. Publish to make it live.`); };
    setTimeout(() => $("input, textarea", d)?.focus(), 250);
  }
  function closeDrawer() {
    const d = $("#drawer");
    if (!d || !d.classList.contains("open")) return;
    d.classList.remove("open");
    $("#drawer-bg").classList.remove("open");
    const f = S.onDrawerClose; S.onDrawerClose = null; f && f();
  }

  /* =====================================================================
     HOMEPAGE & SETTINGS
     ===================================================================== */
  function homepage(v) {
    v.innerHTML = `<p class="help" style="margin:0 0 16px">Everything on the home page (and the sponsorship packages on the Partners page). Events, workshops and journal stories appear automatically.</p>`;
    HOMEPAGE.forEach((f) => {
      const box = document.createElement("div");
      box.className = "box";
      box.innerHTML = `<details ${f.k === "featured" ? "open" : ""}><summary style="cursor:pointer;font-weight:700;font-size:16px">${esc(f.label)}</summary><div style="margin-top:14px"></div></details>`;
      renderFields($("details > div", box), [{ ...f, label: "" }], S.content, changed);
      v.append(box);
    });
  }
  function settings(v) {
    S.content.settings = S.content.settings || {};
    SETTINGS.forEach((g) => {
      const box = document.createElement("div");
      box.className = "box";
      box.innerHTML = `<h2>${esc(g.legend)}</h2>`;
      renderFields(box, g.fields, S.content.settings, changed);
      v.append(box);
    });
  }

  /* =====================================================================
     VERSIONS & BACKUP
     ===================================================================== */
  async function versions(v) {
    v.innerHTML = `
      <div class="grid2">
        <div class="box"><h2>Backup</h2><p class="help" style="margin:0 0 14px">Download everything (events, workshops, team, settings…) as a JSON file, or restore from one.</p>
          <div class="quick"><button class="btn btn-outline btn-sm" id="exp">${ic.download} Export content</button><button class="btn btn-outline btn-sm" id="imp">${ic.upload} Import content</button><button class="btn btn-outline btn-sm" id="rst">${ic.hist} Reset to defaults</button></div><input type="file" id="impf" accept="application/json" hidden></div>
        <div class="box"><h2>Status</h2>
          <ul class="setup" style="border:0;padding:0;margin:0;list-style:none">
            <li><span class="${S.health.database ? "ok" : "no"}">●</span> Database ${S.health.database ? "connected" : "not connected"}</li>
            <li><span class="${S.health.email ? "ok" : "no"}">●</span> Confirmation emails ${S.health.email ? "on" : "off (optional: add RESEND_API_KEY)"}</li>
            <li><span class="${S.health.uploads ? "ok" : "no"}">●</span> Image uploads ${S.health.uploads ? "on" : "off (optional: connect Vercel Blob)"}</li>
          </ul></div>
      </div>
      <div class="box"><h2>Published versions <small>Last ${15} publishes. Restoring replaces the live site immediately.</small></h2><div id="vers">${live() ? "Loading…" : `<p class="help">Version history is available once the database is connected.</p>`}</div></div>`;
    $("#exp").addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S.content, null, 2)], { type: "application/json" })); a.download = `vfmbs-content-${new Date().toISOString().slice(0, 10)}.json`; a.click(); });
    $("#imp").addEventListener("click", () => $("#impf").click());
    $("#impf").addEventListener("change", async (e) => {
      try {
        const c = JSON.parse(await e.target.files[0].text());
        if (!c || typeof c !== "object" || !Array.isArray(c.events)) throw new Error("That doesn't look like a VFMBS content file.");
        if (!confirm("Replace the current draft with this file? You'll still need to publish.")) return;
        S.content = c; changed(); toast("Imported. Review and publish.");
      } catch (err) { fail(err); }
    });
    $("#rst").addEventListener("click", async () => {
      if (!confirm("Replace the draft with the original default content? (You'll still need to publish.)")) return;
      S.content = await (await fetch("/assets/data/content.json")).json(); changed(); toast("Default content loaded into draft.");
    });
    if (!live()) return;
    try {
      const { versions: vs } = await api("history");
      $("#vers").innerHTML = vs.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Saved</th><th>Size</th><th></th></tr>${vs.map((x) => `<tr><td>${new Date(x.ts).toLocaleString()}<div class="help">${ago(x.ts)}</div></td><td class="muted">${Math.round(x.size / 1024)} KB</td><td style="text-align:right"><button class="btn btn-outline btn-sm" data-restore="${x.index}">Restore</button></td></tr>`).join("")}</table></div>` : `<p class="help">No previous versions yet. Each publish saves the version it replaced.</p>`;
      $$("[data-restore]").forEach((b) => b.addEventListener("click", async () => {
        if (!confirm("Restore this version? The current live content will be saved as a version first.")) return;
        try { const r = await api("restore", { index: +b.dataset.restore }); S.content = r.content; S.published = JSON.stringify(r.content); changed(); toast("Version restored and live."); go("versions"); } catch (e) { fail(e); }
      }));
    } catch (e) { $("#vers").textContent = e.message; }
  }

  /* =====================================================================
     DASHBOARD
     ===================================================================== */
  async function dashboard(v) {
    const C = S.content;
    const upcoming = (C.events || []).filter((e) => e.published !== false && new Date(e.end || e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    let o = null;
    if (live()) { try { o = await api("overview"); S.overview = o; } catch (e) { fail(e); } }
    const total = o ? Object.values(o.counts).reduce((a, b) => a + b, 0) : 0;
    const SC = { submitted: ["Submitted", "#8a8a8a"], reviewing: ["Reviewing", "#ffc75a"], interview: ["Interview", "#5aa9ff"], accepted: ["Accepted", "#46d369"], waitlisted: ["Waitlisted", "#b884ff"], declined: ["Declined", "#ff4052"] };
    const S0 = C.settings || {};
    const dl = S0.applicationDeadline ? Math.ceil((new Date(S0.applicationDeadline) - Date.now()) / 864e5) : null;
    v.innerHTML = `
      ${live() ? "" : `<div class="box" style="border-color:rgba(255,199,90,.4)"><h2>You're in preview mode</h2><p class="help" style="margin:0">Edits save only to this browser so you can try things out. To go live and collect RSVPs and applications, connect the database and set <code>ADMIN_PASSWORD</code> + <code>SESSION_SECRET</code> in Vercel (see README).</p></div>`}
      <div class="kpis">
        <div class="kpi"><b>${o ? total : "—"}</b><span>RSVPs</span><small>${upcoming.length} upcoming events</small></div>
        <div class="kpi"><b>${o ? o.apps : "—"}</b><span>Applications</span><small>${S0.applicationsOpen === false ? "Closed" : dl != null ? (dl > 0 ? dl + " days left" : "Deadline passed") : ""}</small></div>
        <div class="kpi"><b>${o ? o.unread : "—"}</b><span>Unread messages</span><small>${o ? o.inbox + " total" : ""}</small></div>
        <div class="kpi"><b>${o ? o.subs : "—"}</b><span>Subscribers</span></div>
      </div>
      <div class="grid2">
        <div class="box"><h2>Upcoming events <button class="btn btn-outline btn-sm" data-goto="events">Manage</button></h2>
          ${upcoming.slice(0, 6).map((e) => { const n = o?.counts?.[e.id] || 0, w = o?.waits?.[e.id] || 0; return `<div class="ev-fill"><div class="t"><b>${esc(e.title)}</b><span>${fmtDT(e.date, e.tz)}</span></div><div class="bar"><i style="width:${e.capacity ? Math.min(100, (n / e.capacity) * 100) : 0}%"></i></div><div class="n muted">${n}${e.capacity ? " / " + e.capacity : ""}${w ? ` +${w}w` : ""}</div><button class="btn btn-outline btn-sm" data-rsvps="${e.id}">List</button></div>`; }).join("") || `<p class="help">No upcoming events. <a class="gold" href="#events">Create one →</a></p>`}
        </div>
        <div class="box"><h2>Application pipeline <button class="btn btn-outline btn-sm" data-goto="applications">Review</button></h2>
          ${o && o.apps ? `<div class="pipeline-bar">${Object.entries(SC).map(([k, [, c]]) => `<i style="width:${((o.byStatus[k] || 0) / o.apps) * 100}%;background:${c}"></i>`).join("")}</div><div class="legend">${Object.entries(SC).map(([k, [l, c]]) => `<span style="--c:${c}">${l} ${o.byStatus[k] || 0}</span>`).join("")}</div>
          <div style="margin-top:18px">${o.recent.map((a) => `<div class="ev-fill" style="grid-template-columns:1fr auto"><div class="t"><b>${esc(a.name)}</b><span>${esc((a.tracks || []).map((t) => (C.tracks.find((x) => x.id === t) || {}).name || t).join(" → "))} · ${ago(a.ts)}</span></div><span class="pill">${esc(a.status)}</span></div>`).join("")}</div>` : `<p class="help">${live() ? "No applications yet." : "Available once the database is connected."}</p>`}
        </div>
      </div>
      <div class="box"><h2>Quick actions</h2><div class="quick">
        <button class="btn btn-gold btn-sm" data-new="events">${ic.plus} New event</button>
        <button class="btn btn-outline btn-sm" data-new="posts">${ic.plus} New journal story</button>
        <button class="btn btn-outline btn-sm" data-new="workshops">${ic.plus} New workshop</button>
        <button class="btn btn-outline btn-sm" data-goto="checkin">${ic.scan} Door check-in</button>
        <button class="btn btn-outline btn-sm" data-goto="settings">${ic.gear} Announcement &amp; deadlines</button>
        <a class="btn btn-outline btn-sm" href="/" target="_blank" rel="noopener">${ic.ext} Open site</a>
      </div></div>`;
    $$("[data-goto]", v).forEach((b) => b.addEventListener("click", () => (location.hash = b.dataset.goto)));
    $$("[data-rsvps]", v).forEach((b) => b.addEventListener("click", () => { S.rsvpEvent = b.dataset.rsvps; location.hash = "rsvps"; }));
    $$("[data-new]", v).forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.new; setTimeout(() => $("#new")?.click(), 50); }));
  }

  /* =====================================================================
     RSVPs
     ===================================================================== */
  const eventOptions = (sel) => {
    const evs = [...(S.content.events || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    const next = evs.find((e) => new Date(e.end || e.date) > new Date()) || evs.at(-1);
    const cur = sel || next?.id;
    return [evs.map((e) => `<option value="${esc(e.id)}" ${e.id === cur ? "selected" : ""}>${esc(e.title)} · ${fmtDT(e.date, e.tz)}</option>`).join(""), cur];
  };
  async function rsvps(v) {
    const [opts, cur] = eventOptions(S.rsvpEvent);
    S.rsvpEvent = cur;
    v.innerHTML = `
      <div class="tbl-tools"><select class="select" id="rev">${opts}</select><input class="input" type="search" id="rq" placeholder="Search name or email…"><span class="grow"></span>
        <button class="btn btn-outline btn-sm" id="rcopy">${ic.copy} Copy emails</button><button class="btn btn-outline btn-sm" id="rcsv">${ic.download} Export CSV</button><button class="btn btn-gold btn-sm" id="rscan">${ic.scan} Check-in mode</button></div>
      <div class="kpis" id="rk"></div><div id="rt">Loading…</div>`;
    let data = [], q = "";
    const ev = () => S.content.events.find((e) => e.id === S.rsvpEvent) || {};
    const load = async () => {
      try { data = (await api("rsvps&event=" + encodeURIComponent(S.rsvpEvent))).rsvps; } catch (e) { data = []; fail(e); }
      draw();
    };
    const draw = () => {
      const going = data.filter((r) => !r.waitlist), wait = data.filter((r) => r.waitlist), inn = data.filter((r) => r.checkedIn);
      $("#rk").innerHTML = `<div class="kpi"><b>${going.length}</b><span>Going</span><small>${ev().capacity ? "of " + ev().capacity : ""}</small></div><div class="kpi"><b>${wait.length}</b><span>Waitlist</span></div><div class="kpi"><b>${inn.length}</b><span>Checked in</span></div><div class="kpi"><b>${going.length ? Math.round((inn.length / going.length) * 100) : 0}%</b><span>Show rate</span></div>`;
      const rows = data.filter((r) => !q || (r.name + r.email).toLowerCase().includes(q));
      $("#rt").innerHTML = rows.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>No.</th><th>Name</th><th>Email</th><th>Year</th><th>Diet</th><th>Interests</th><th>Question</th><th>Status</th><th></th></tr>${rows.map((r) => `
        <tr><td class="nowrap">${r.waitlist ? "W" : ""}${V.pad(r.no, 3)}</td><td><b>${esc(r.name)}</b><div class="help">${esc(r.code)} · ${ago(r.ts)}</div></td><td><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td><td>${esc(r.year)}</td><td>${esc(r.diet === "None" ? "" : r.diet)}</td><td class="muted">${esc((r.interests || []).join(", "))}</td><td class="muted" style="max-width:220px">${esc(r.question)}</td>
        <td>${r.checkedIn ? `<span class="pill ok">In · ${new Date(r.checkedIn).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>` : r.waitlist ? `<span class="pill warn">Waitlist</span>` : `<span class="pill">Going</span>`}</td>
        <td class="nowrap" style="text-align:right">${r.waitlist ? `<button class="btn btn-outline btn-sm" data-op="promote" data-c="${esc(r.code)}">Promote</button>` : `<button class="ib" data-op="checkin" data-c="${esc(r.code)}" title="${r.checkedIn ? "Undo check-in" : "Check in"}">${ic.check}</button>`}<button class="ib danger" data-op="remove" data-c="${esc(r.code)}" title="Remove">${ic.trash}</button></td></tr>`).join("")}</table></div>` : `<div class="empty-s">No RSVPs${q ? " match" : " yet"}.</div>`;
      $$("[data-op]", v).forEach((b) => b.addEventListener("click", async () => {
        const op = b.dataset.op;
        if (op === "remove" && !confirm("Remove this RSVP? Their ticket will stop working.")) return;
        try { await api("rsvp", { eventId: S.rsvpEvent, code: b.dataset.c, op }); await load(); refreshCounts(); } catch (e) { fail(e); }
      }));
    };
    $("#rev").addEventListener("change", (e) => { S.rsvpEvent = e.target.value; load(); });
    $("#rq").addEventListener("input", (e) => { q = e.target.value.toLowerCase(); draw(); });
    $("#rcopy").addEventListener("click", () => copy(data.filter((r) => !r.waitlist).map((r) => r.email).join(", "), "Emails copied"));
    $("#rcsv").addEventListener("click", () => csv(data, [["no", "No."], ["name", "Name"], ["email", "Email"], ["year", "Year"], ["diet", "Diet"], ["interests", "Interests"], ["question", "Question"], [(r) => (r.waitlist ? "Waitlist" : "Going"), "Status"], [(r) => (r.checkedIn ? new Date(r.checkedIn).toLocaleString() : ""), "Checked in"], ["code", "Code"], [(r) => new Date(r.ts).toLocaleString(), "RSVP'd at"]], "rsvps-" + S.rsvpEvent));
    $("#rscan").addEventListener("click", () => (location.hash = "checkin"));
    load();
  }

  /* =====================================================================
     CHECK-IN
     ===================================================================== */
  let stream = null;
  function stopCam() { stream?.getTracks().forEach((t) => t.stop()); stream = null; }
  addEventListener("hashchange", stopCam);
  function checkin(v) {
    const [opts, cur] = eventOptions(S.rsvpEvent);
    S.rsvpEvent = cur;
    const canScan = "BarcodeDetector" in window && navigator.mediaDevices?.getUserMedia;
    v.innerHTML = `
      <div class="tbl-tools"><select class="select" id="cev">${opts}</select><span class="grow"></span><span class="help" id="ccount"></span></div>
      <div class="scan-wrap">
        <div>
          <div class="scanner" id="scanner">${canScan ? `<button class="btn btn-gold" id="cam">${ic.scan} Start camera</button>` : `<div style="padding:20px;text-align:center" class="help">Camera scanning isn't supported in this browser. Use Chrome on Android/desktop, or type the ticket code below.</div>`}</div>
          <form id="cform" class="tbl-tools" style="margin-top:12px"><input class="input" id="ccode" placeholder="Ticket code (e.g. K7M2QX9A)" autocomplete="off" style="flex:1;font-family:var(--mono);text-transform:uppercase"><button class="btn btn-gold btn-sm" type="submit">Check in</button></form>
        </div>
        <div><div class="result" id="cres"><div class="help">Scan a ticket QR code or enter its code.</div></div><div class="box" style="margin-top:16px"><h2>Recent</h2><div id="crecent" class="help">No check-ins yet this session.</div></div></div>
      </div>`;
    const recent = [];
    let lastCode = "", lastAt = 0;
    const count = async () => { try { const d = (await api("rsvps&event=" + encodeURIComponent(S.rsvpEvent))).rsvps; const g = d.filter((r) => !r.waitlist); $("#ccount").textContent = `${d.filter((r) => r.checkedIn).length} / ${g.length} checked in`; } catch {} };
    const run = async (code) => {
      if (!code) return;
      const res = $("#cres");
      try {
        const r = await api("checkin", { code, event: S.rsvpEvent });
        const t = r.ticket;
        res.className = "result " + (r.already ? "warn" : t.waitlist ? "warn" : "ok");
        res.innerHTML = `<div><b>${r.already ? "Already in" : t.waitlist ? "Waitlist" : "Admitted"}</b><div style="font-size:22px;margin:10px 0 4px;font-weight:700">${esc(t.name)}</div><div class="help">No. ${V.pad(t.no, 3)} · ${esc(t.code)}${r.already ? ` · first scanned ${new Date(t.checkedIn).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}${t.diet && t.diet !== "None" ? ` · Diet: ${esc(t.diet)}` : ""}</div></div>`;
        if (!r.already) { recent.unshift(`${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${t.name}`); navigator.vibrate?.(80); }
      } catch (e) {
        res.className = "result bad";
        res.innerHTML = `<div><b>Not valid</b><div class="help" style="margin-top:10px">${esc(e.message)}</div></div>`;
        navigator.vibrate?.([60, 60, 60]);
      }
      $("#crecent").innerHTML = recent.slice(0, 8).map((x) => `<div>${esc(x)}</div>`).join("") || "No check-ins yet this session.";
      count();
    };
    $("#cev").addEventListener("change", (e) => { S.rsvpEvent = e.target.value; count(); });
    $("#cform").addEventListener("submit", (e) => { e.preventDefault(); run($("#ccode").value.trim()); $("#ccode").value = ""; $("#ccode").focus(); });
    $("#cam")?.addEventListener("click", async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.createElement("video");
        video.setAttribute("playsinline", "");
        video.muted = true;
        video.srcObject = stream;
        $("#scanner").innerHTML = "";
        $("#scanner").append(video);
        $("#scanner").insertAdjacentHTML("beforeend", `<div class="frame"></div>`);
        await video.play();
        const det = new BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (!stream) return;
          try {
            const codes = await det.detect(video);
            const val = codes[0]?.rawValue;
            if (val && (val !== lastCode || Date.now() - lastAt > 4000)) { lastCode = val; lastAt = Date.now(); run(val); }
          } catch {}
          setTimeout(tick, 350);
        };
        tick();
      } catch (e) { fail(new Error("Couldn't open the camera: " + e.message)); }
    });
    count();
    $("#ccode").focus();
  }

  /* =====================================================================
     APPLICATIONS
     ===================================================================== */
  const APP_ST = [["submitted", "Submitted", ""], ["reviewing", "Reviewing", "warn"], ["interview", "Interview", "gold"], ["accepted", "Accepted", "ok"], ["waitlisted", "Waitlisted", "warn"], ["declined", "Declined", "bad"]];
  const stPill = (s) => { const x = APP_ST.find((a) => a[0] === s) || APP_ST[0]; return `<span class="pill ${x[2]}">${x[1]}</span>`; };
  const tn = (id) => (S.content.tracks.find((t) => t.id === id) || {}).name || id;
  async function applications(v) {
    v.innerHTML = `
      <div class="tbl-tools"><input class="input" type="search" id="aq" placeholder="Search applicants…"><select class="select" id="ast"><option value="">All statuses</option>${APP_ST.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select><select class="select" id="atr"><option value="">All tracks</option>${S.content.tracks.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("")}</select><span class="grow"></span><button class="btn btn-outline btn-sm" id="acsv">${ic.download} Export CSV</button></div>
      <div id="at">Loading…</div>`;
    let apps = [];
    try { apps = (await api("apps")).apps; } catch (e) { fail(e); }
    const f = { q: "", st: "", tr: "" };
    const draw = () => {
      const rows = apps.filter((a) => (!f.st || a.status === f.st) && (!f.tr || (a.tracks || []).includes(f.tr)) && (!f.q || JSON.stringify(a).toLowerCase().includes(f.q)));
      $("#at").innerHTML = rows.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Applicant</th><th>Year</th><th>Tracks</th><th>Status</th><th>Rating</th><th>Interview</th><th>Submitted</th></tr>${rows.map((a) => `
        <tr class="click" data-id="${esc(a.id)}"><td><b>${esc(a.name)}</b><div class="help">${esc(a.email)} · ${esc(a.id)}</div></td><td>${esc(a.year)}</td><td class="muted">${esc((a.tracks || []).map(tn).join(" → "))}</td><td>${stPill(a.status)}</td><td style="color:var(--gold)">${"★".repeat(a.rating || 0)}<span style="color:#333">${"★".repeat(5 - (a.rating || 0))}</span></td><td class="nowrap">${a.interview ? fmtDT(a.interview) : '<span class="muted">—</span>'}</td><td class="muted nowrap">${ago(a.ts)}</td></tr>`).join("")}</table></div>` : `<div class="empty-s">No applications${apps.length ? " match these filters" : " yet"}.</div>`;
      $$("tr[data-id]", v).forEach((tr) => tr.addEventListener("click", () => openApp(apps.find((a) => a.id === tr.dataset.id), draw, () => { apps = apps.filter((a) => a.id !== tr.dataset.id); draw(); })));
    };
    $("#aq").addEventListener("input", (e) => { f.q = e.target.value.toLowerCase(); draw(); });
    $("#ast").addEventListener("change", (e) => { f.st = e.target.value; draw(); });
    $("#atr").addEventListener("change", (e) => { f.tr = e.target.value; draw(); });
    $("#acsv").addEventListener("click", () => csv(apps, [["id", "ID"], ["name", "Name"], ["pref", "Preferred"], ["email", "Email"], ["phone", "Phone"], ["year", "Year"], ["major", "Major"], [(a) => (a.tracks || []).map(tn), "Tracks"], ["areas", "Areas"], ["finexp", "Finance exp."], ["heard", "Heard via"], ["status", "Status"], ["rating", "Rating"], [(a) => (a.interview ? new Date(a.interview).toLocaleString() : ""), "Interview"], ["why", "Why VFMBS"], ["pitch", "Pitch"], ["news", "Story"], ["resume", "Resume"], ["linkedin", "LinkedIn"], ["notes", "Notes"], [(a) => new Date(a.ts).toLocaleString(), "Submitted"]], "applications"));
    draw();
  }
  function openApp(a, redraw, onDelete) {
    const d = $("#drawer");
    const safe = (u) => (V.safeUrl(u).startsWith("http") ? V.safeUrl(u) : "");
    d.innerHTML = `
      <div class="drawer-head"><h2>${esc(a.name)}</h2>${stPill(a.status)}<button class="ib" id="dclose" aria-label="Close">${ic.close}</button></div>
      <div class="drawer-body">
        <div class="grid2" style="gap:10px;margin-bottom:18px">
          <div class="field"><label for="ap-st">Status</label><select class="select" id="ap-st">${APP_ST.map(([k, l]) => `<option value="${k}" ${a.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <div class="field"><span class="label">Rating</span><div class="stars" id="ap-stars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" class="${n <= (a.rating || 0) ? "on" : ""}" aria-label="${n} stars">★</button>`).join("")}</div></div>
        </div>
        <div class="grid2" style="gap:0 16px">
          <div class="qa"><span>Email</span><p><a class="gold" href="mailto:${esc(a.email)}">${esc(a.email)}</a></p></div>
          <div class="qa"><span>Phone</span><p>${esc(a.phone || "—")}</p></div>
          <div class="qa"><span>Year · Major</span><p>${esc(a.year)} · ${esc(a.major)}</p></div>
          <div class="qa"><span>Interview</span><p>${a.interview ? fmtDT(a.interview) + " CT" : "Not booked"}</p></div>
          <div class="qa"><span>Tracks</span><p>${esc((a.tracks || []).map((t, i) => `${i + 1}. ${tn(t)}`).join("\n"))}</p></div>
          <div class="qa"><span>Areas · Finance exp.</span><p>${esc((a.areas || []).join(", ") || "—")}\n${esc(a.finexp || "")}</p></div>
        </div>
        <div class="qa"><span>Why VFMBS</span><p>${esc(a.why)}</p></div>
        <div class="qa"><span>Pitch</span><p>${esc(a.pitch)}</p></div>
        <div class="qa"><span>Industry story</span><p>${esc(a.news)}</p></div>
        <div class="quick" style="margin-bottom:18px">${safe(a.resume) ? `<a class="btn btn-outline btn-sm" href="${esc(safe(a.resume))}" target="_blank" rel="noopener noreferrer">${ic.ext} Resume</a>` : ""}${safe(a.linkedin) ? `<a class="btn btn-outline btn-sm" href="${esc(safe(a.linkedin))}" target="_blank" rel="noopener noreferrer">${ic.ext} LinkedIn</a>` : ""}</div>
        <div class="field"><label for="ap-notes">Reviewer notes (private)</label><textarea class="textarea" id="ap-notes" rows="5">${esc(a.notes || "")}</textarea></div>
        <p class="help">${esc(a.id)} · submitted ${new Date(a.ts).toLocaleString()} · heard via ${esc(a.heard || "—")}</p>
      </div>
      <div class="drawer-foot"><button class="btn btn-outline btn-sm" id="ap-del">${ic.trash} Delete</button><span style="flex:1"></span><button class="btn btn-gold btn-sm" id="ap-save">${ic.check} Save</button></div>`;
    let rating = a.rating || 0;
    $$("#ap-stars button", d).forEach((b) => b.addEventListener("click", () => { rating = +b.dataset.n === rating ? 0 : +b.dataset.n; $$("#ap-stars button", d).forEach((x) => x.classList.toggle("on", +x.dataset.n <= rating)); }));
    $("#dclose", d).addEventListener("click", closeDrawer);
    $("#ap-save", d).addEventListener("click", async () => {
      try {
        const r = await api("app", { id: a.id, status: $("#ap-st", d).value, notes: $("#ap-notes", d).value, rating });
        Object.assign(a, r.app);
        toast("Saved"); closeDrawer(); redraw(); refreshCounts();
      } catch (e) { fail(e); }
    });
    $("#ap-del", d).addEventListener("click", async () => {
      if (!confirm(`Permanently delete ${a.name}'s application?`)) return;
      try { await api("app", { id: a.id, op: "delete" }); toast("Deleted"); closeDrawer(); onDelete(); refreshCounts(); } catch (e) { fail(e); }
    });
    d.classList.add("open");
    $("#drawer-bg").classList.add("open");
  }

  /* =====================================================================
     WORKSHOP APPS · INBOX · SUBSCRIBERS
     ===================================================================== */
  async function wsapps(v) {
    v.innerHTML = `<div class="tbl-tools"><select class="select" id="wsw"><option value="">All workshops</option>${(S.content.workshops || []).map((w) => `<option value="${esc(w.id)}">${esc(w.title)}</option>`).join("")}</select><select class="select" id="wss"><option value="">All statuses</option><option value="review">In review</option><option value="accepted">Accepted</option><option value="waitlisted">Waitlisted</option><option value="declined">Declined</option></select><span class="grow"></span><button class="btn btn-outline btn-sm" id="wcopy">${ic.copy} Copy accepted emails</button><button class="btn btn-outline btn-sm" id="wcsv">${ic.download} Export CSV</button></div><div id="wt">Loading…</div>`;
    let apps = [];
    try { apps = (await api("wsapps")).apps; } catch (e) { fail(e); }
    const f = { w: "", s: "" };
    const draw = () => {
      const rows = apps.filter((a) => (!f.w || a.workshopId === f.w) && (!f.s || a.status === f.s));
      $("#wt").innerHTML = rows.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Applicant</th><th>Workshop</th><th>Year · Major</th><th>Experience</th><th>Why</th><th>Status</th><th></th></tr>${rows.map((a) => `
        <tr><td><b>${esc(a.name)}</b><div class="help">${esc(a.email)}</div></td><td>${esc(a.workshop)}</td><td class="muted">${esc(a.year)} · ${esc(a.major)}</td><td class="muted">${esc(a.exp)}</td><td class="muted" style="max-width:300px">${esc(a.why)}</td>
        <td><select class="select" data-st="${esc(a.code)}" style="padding:6px 30px 6px 10px;font-size:12px">${["review", "accepted", "waitlisted", "declined"].map((s) => `<option ${a.status === s ? "selected" : ""} value="${s}">${s[0].toUpperCase() + s.slice(1)}</option>`).join("")}</select></td>
        <td><button class="ib danger" data-del="${esc(a.code)}" title="Delete">${ic.trash}</button></td></tr>`).join("")}</table></div>` : `<div class="empty-s">No workshop applications${apps.length ? " match" : " yet"}.</div>`;
      $$("[data-st]", v).forEach((s) => s.addEventListener("change", async () => {
        const a = apps.find((x) => x.code === s.dataset.st);
        try { await api("wsapp", { workshopId: a.workshopId, code: a.code, status: s.value }); a.status = s.value; toast("Status updated"); } catch (e) { fail(e); }
      }));
      $$("[data-del]", v).forEach((b) => b.addEventListener("click", async () => {
        const a = apps.find((x) => x.code === b.dataset.del);
        if (!confirm(`Delete ${a.name}'s application?`)) return;
        try { await api("wsapp", { workshopId: a.workshopId, code: a.code, op: "delete" }); apps = apps.filter((x) => x !== a); draw(); } catch (e) { fail(e); }
      }));
    };
    $("#wsw").addEventListener("change", (e) => { f.w = e.target.value; draw(); });
    $("#wss").addEventListener("change", (e) => { f.s = e.target.value; draw(); });
    $("#wcopy").addEventListener("click", () => copy(apps.filter((a) => a.status === "accepted" && (!f.w || a.workshopId === f.w)).map((a) => a.email).join(", "), "Emails copied"));
    $("#wcsv").addEventListener("click", () => csv(apps, [["workshop", "Workshop"], ["name", "Name"], ["email", "Email"], ["year", "Year"], ["major", "Major"], ["exp", "Experience"], ["why", "Why"], ["status", "Status"], [(a) => new Date(a.ts).toLocaleString(), "Submitted"]], "workshop-applications"));
    draw();
  }

  async function inbox(v) {
    v.innerHTML = `<div id="it">Loading…</div>`;
    let msgs = [];
    try { msgs = (await api("inbox")).messages; } catch (e) { fail(e); }
    const draw = () => {
      $("#it").innerHTML = msgs.length ? `<div class="items">${msgs.map((m) => `
        <details class="box" style="margin:0" data-id="${esc(m.id)}" ${m.read ? "" : 'style="border-color:rgba(207,174,112,.5)"'}>
          <summary style="cursor:pointer;display:flex;gap:12px;align-items:center;list-style:none">${m.read ? "" : `<span class="pill gold">New</span>`}<span class="pill">${esc(m.topic)}</span><b>${esc(m.name)}</b><span class="muted">${esc(m.org || "")}</span><span class="grow" style="flex:1"></span><span class="help">${ago(m.ts)}</span></summary>
          <p style="white-space:pre-wrap;margin:16px 0">${esc(m.message)}</p>
          <div class="quick"><a class="btn btn-gold btn-sm" href="mailto:${esc(m.email)}?subject=${encodeURIComponent("Re: your message to VFMBS")}">${ic.mail} Reply to ${esc(m.email)}</a><button class="btn btn-outline btn-sm" data-unread>Mark unread</button><button class="btn btn-outline btn-sm" data-del>${ic.trash} Delete</button></div>
        </details>`).join("")}</div>` : `<div class="empty-s">Inbox zero. Contact and sponsorship inquiries will appear here.</div>`;
      $$("details[data-id]", v).forEach((dEl) => {
        const m = msgs.find((x) => x.id === dEl.dataset.id);
        dEl.addEventListener("toggle", async () => { if (dEl.open && !m.read) { m.read = true; try { await api("inbox", { id: m.id, read: true }); refreshCounts(); } catch {} } });
        $("[data-unread]", dEl).addEventListener("click", async () => { m.read = false; await api("inbox", { id: m.id, read: false }).catch(fail); refreshCounts(); draw(); });
        $("[data-del]", dEl).addEventListener("click", async () => { if (!confirm("Delete this message?")) return; await api("inbox", { id: m.id, op: "delete" }).catch(fail); msgs = msgs.filter((x) => x !== m); refreshCounts(); draw(); });
      });
    };
    draw();
  }

  async function subscribers(v) {
    v.innerHTML = `<div class="tbl-tools"><input class="input" type="search" id="sq" placeholder="Search…"><span class="grow"></span><button class="btn btn-outline btn-sm" id="scopy">${ic.copy} Copy all</button><button class="btn btn-outline btn-sm" id="scsv">${ic.download} Export CSV</button></div><div id="st">Loading…</div>`;
    let subs = [];
    try { subs = (await api("subs")).subs; } catch (e) { fail(e); }
    let q = "";
    const draw = () => {
      const rows = subs.filter((s) => !q || s.email.includes(q));
      $("#st").innerHTML = rows.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Email</th><th>Source</th><th>Joined</th><th></th></tr>${rows.map((s) => `<tr><td>${esc(s.email)}</td><td class="muted">${esc(s.source || "")}</td><td class="muted">${s.ts ? new Date(s.ts).toLocaleDateString() : ""}</td><td style="text-align:right"><button class="ib danger" data-del="${esc(s.email)}" title="Remove">${ic.trash}</button></td></tr>`).join("")}</table></div>` : `<div class="empty-s">No subscribers${q ? " match" : " yet"}.</div>`;
      $$("[data-del]", v).forEach((b) => b.addEventListener("click", async () => { if (!confirm("Remove " + b.dataset.del + "?")) return; await api("sub", { email: b.dataset.del }).catch(fail); subs = subs.filter((s) => s.email !== b.dataset.del); draw(); refreshCounts(); }));
    };
    $("#sq").addEventListener("input", (e) => { q = e.target.value.toLowerCase(); draw(); });
    $("#scopy").addEventListener("click", () => copy(subs.map((s) => s.email).join(", "), `${subs.length} emails copied`));
    $("#scsv").addEventListener("click", () => csv(subs, [["email", "Email"], ["source", "Source"], [(s) => (s.ts ? new Date(s.ts).toISOString() : ""), "Joined"]], "subscribers"));
    draw();
  }

  /* =====================================================================
     LOGIN & BOOT
     ===================================================================== */
  function login() {
    const h = S.health;
    const ready = h.database && h.adminConfigured;
    root.innerHTML = `
      <div class="login">${V.art("gold", "clapper", { beam: true })}
        <div class="login-card">
          <img src="/assets/brand/logo.svg" alt="VFMBS">
          <h1>Control room</h1>
          <p class="help" style="margin:0 0 22px;font-size:14px">Board members only. Manage events, applications, content and check-in.</p>
          ${ready ? `
          <form id="lf" novalidate>
            <div class="field"><label for="pw">Admin password</label><input class="input" id="pw" type="password" autocomplete="current-password" required></div>
            <div class="err" id="lerr" role="alert"></div>
            <button class="btn btn-gold btn-block" type="submit">Sign in</button>
          </form>` : `
          <div class="setup" style="margin-top:0;border:0;padding:0">
            <b style="color:#fff">Finish setup to go live</b>
            <ul style="padding-left:18px;margin:10px 0">
              <li><span class="${h.database ? "ok" : "no"}">${h.database ? "✓" : "○"}</span> Database (Vercel → Storage → Upstash for Redis)</li>
              <li><span class="${h.adminConfigured ? "ok" : "no"}">${h.adminConfigured ? "✓" : "○"}</span> ADMIN_PASSWORD and SESSION_SECRET environment variables</li>
            </ul>
            <p>Until then you can explore the dashboard in <b>preview mode</b>: edits are saved only in this browser so you can see them on the site.</p>
          </div>
          <button class="btn btn-gold btn-block" id="preview">Open preview mode</button>`}
          <p class="help" style="margin-top:18px"><a href="/" class="gold">← Back to site</a></p>
        </div>
      </div>`;
    $("#lf")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("button", e.target);
      btn.classList.add("loading");
      try { await api("login", { password: $("#pw").value }); await start(); }
      catch (err) { $("#lerr").textContent = err.message; btn.classList.remove("loading"); $("#pw").select(); }
    });
    $("#preview")?.addEventListener("click", () => { V.LS.set("admin-preview", 1); startPreview(); });
    $("#pw")?.focus();
  }

  function restoreDraft() {
    const dr = V.LS.get("admin-draft");
    if (dr && dr.content && dr.base === S.published && JSON.stringify(dr.content) !== S.published) {
      if (confirm(`You have unpublished changes from ${new Date(dr.ts).toLocaleString()}. Restore them?`)) S.content = dr.content;
      else V.LS.del("admin-draft");
    }
  }
  async function start() {
    S.mode = "live";
    const r = await api("content");
    S.content = r.content;
    S.published = JSON.stringify(r.published ? r.content : null);
    if (!r.published) toast("Tip: press Publish once to save the starting content to the database.");
    restoreDraft();
    shell();
  }
  async function startPreview() {
    S.mode = "preview";
    const pv = V.LS.get("preview-content");
    S.content = pv || (await (await fetch("/assets/data/content.json")).json());
    S.published = JSON.stringify(S.content);
    restoreDraft();
    shell();
  }

  (async () => {
    try { S.health = await (await fetch("/api/health", { cache: "no-store" })).json(); } catch { S.health = {}; }
    if (S.health.database && S.health.adminConfigured) {
      try { const me = await api("me"); if (me.admin) return await start(); } catch {}
      return login();
    }
    if (V.LS.get("admin-preview")) return startPreview();
    login();
  })();
})();
