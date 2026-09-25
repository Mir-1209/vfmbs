/* =========================================================================
   VFMBS core: layout, poster art, storage, modals, RSVP, search, utilities
   ========================================================================= */
(() => {
  const D = window.VFMBS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TZ = "America/Chicago";

  /* ---------------- Icons ---------------- */
  const I = (p, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${p}</svg>`;
  const icons = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5Z"/></svg>`,
    info: I('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    check: I('<path d="M20 6 9 17l-5-5"/>'),
    chevDown: I('<path d="m6 9 6 6 6-6"/>'),
    chevL: I('<path d="m15 18-6-6 6-6"/>'),
    chevR: I('<path d="m9 18 6-6-6-6"/>'),
    close: I('<path d="M18 6 6 18M6 6l12 12"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    bell: I('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    menu: I('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    cal: I('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    pin: I('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    clock: I('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
    list: I('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    grid: I('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
    ticket: I('<path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>'),
    download: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
    thumb: I('<path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>'),
    user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    trash: I('<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    replay: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    ig: I('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
    li: I('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/>'),
    mail: I('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
  };

  /* ---------------- Poster motifs (line art) ---------------- */
  const S = (p) => `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const motifs = {
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
  };

  const art = (palette = "gold", motif = "film", opts = {}) => {
    const [a1, a2, a3] = D.palettes[palette] || D.palettes.gold;
    return `<div class="art" style="--a1:${a1};--a2:${a2};--a3:${a3}">${opts.beam ? '<div class="beam"></div>' : ""}<div class="glow"></div>${motif ? `<div class="motif">${motifs[motif] || ""}</div>` : ""}</div>`;
  };
  const vars = (palette) => {
    const [a1, a2, a3] = D.palettes[palette] || D.palettes.gold;
    return `--a1:${a1};--a2:${a2};--a3:${a3}`;
  };

  /* ---------------- Storage (namespaced per profile) ---------------- */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("vfmbs:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("vfmbs:" + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem("vfmbs:" + k); } catch {} },
  };
  const Store = {
    profiles: () => LS.get("profiles", []),
    saveProfiles: (p) => LS.set("profiles", p),
    activeId: () => LS.get("active", "guest"),
    setActive: (id) => { LS.set("active", id); emit(); },
    profile() { return Store.profiles().find((p) => p.id === Store.activeId()) || null; },
    get: (k, d) => LS.get(`${Store.activeId()}:${k}`, d),
    set: (k, v) => { LS.set(`${Store.activeId()}:${k}`, v); emit(); },
    rsvps: () => Store.get("rsvps", {}),
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
  };
  const listeners = [];
  const emit = () => listeners.forEach((f) => f());
  const onChange = (f) => listeners.push(f);

  /* ---------------- Formatting ---------------- */
  const fmt = (iso, o, tz) => new Intl.DateTimeFormat("en-US", { timeZone: tz || TZ, ...o }).format(new Date(iso));
  const evTz = (ev) => ev.tz || TZ;
  const fmtDate = (ev) => fmt(ev.date, { weekday: "short", month: "short", day: "numeric" }, evTz(ev));
  const fmtTime = (ev) => {
    const tz = evTz(ev);
    const t = fmt(ev.date, { hour: "numeric", minute: "2-digit" }, tz) + " – " + fmt(ev.end, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }, tz);
    const multi = fmt(ev.date, { day: "numeric" }, tz) !== fmt(ev.end, { day: "numeric" }, tz);
    return multi ? `${fmtDate(ev)} – ${fmt(ev.end, { weekday: "short", month: "short", day: "numeric" }, tz)}` : t;
  };
  const isPast = (ev) => new Date(ev.end || ev.date) < new Date();
  const seatsTaken = (ev) => Math.min(ev.capacity, ev.taken + (Store.rsvps()[ev.id] ? 1 : 0));
  const seatsLeft = (ev) => Math.max(0, ev.capacity - seatsTaken(ev));
  const match = (id) => 90 + (hash(id) % 10);
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const code = (prefix) => prefix + "-" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const byId = (id) => D.events.find((e) => e.id === id) || D.workshops.find((w) => w.id === id) || D.tracks.find((t) => t.id === id);

  /* ---------------- Layout ---------------- */
  const page = document.body.dataset.page;
  const navItems = [
    ["home", "index.html", "Home"],
    ["events", "events.html", "Events"],
    ["workshops", "workshops.html", "Workshops"],
    ["about", "about.html", "About"],
    ["apply", "apply.html", "Apply"],
  ];

  function renderChrome() {
    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML = `
      <a class="brand" href="index.html" aria-label="VFMBS home">
        <span class="brand-mark">VFMBS</span>
        <span class="brand-sub">Vanderbilt<br>Film &amp; Media<br>Business Society</span>
      </a>
      <nav class="nav-links" aria-label="Main">${navItems.map(([k, h, l]) => `<a href="${h}" class="${k === page ? "active" : ""}">${l}</a>`).join("")}</nav>
      <div class="nav-right">
        <button class="icon-btn" data-search aria-label="Search (press /)">${icons.search}</button>
        <span class="kbd">/</span>
        <a class="icon-btn" href="portal.html" aria-label="My Studio">${icons.ticket}<span class="badge" data-badge></span></a>
        <a class="btn btn-red btn-nav" href="apply.html">Apply Now</a>
        <button class="icon-btn nav-toggle" aria-label="Menu" aria-expanded="false">${icons.menu}</button>
      </div>`;
    document.body.prepend(nav);

    const mm = document.createElement("div");
    mm.className = "mobile-menu";
    mm.innerHTML = navItems.map(([k, h, l]) => `<a href="${h}" class="${k === page ? "active" : ""}">${l}</a>`).join("") + `<a href="portal.html" class="${page === "portal" ? "active" : ""}">My Studio</a>`;
    nav.after(mm);
    const tog = $(".nav-toggle", nav);
    tog.addEventListener("click", () => {
      const open = mm.classList.toggle("open");
      tog.setAttribute("aria-expanded", open);
      tog.innerHTML = open ? icons.close : icons.menu;
      document.body.classList.toggle("locked", open);
    });

    const extra = document.createElement("div");
    extra.innerHTML = `
      <div class="progress-bar"></div>
      <div class="grain" aria-hidden="true"></div>
      <div class="toasts" aria-live="polite"></div>
      <div class="modal-root" role="dialog" aria-modal="true"><div class="modal-backdrop"></div><div class="modal"></div></div>
      <div class="search" role="dialog" aria-label="Search">
        <button class="icon-btn" data-search-close style="position:absolute;top:20px;right:20px" aria-label="Close search">${icons.close}</button>
        <div class="search-bar">${icons.search}<input type="search" placeholder="Events, workshops, tracks…" aria-label="Search"></div>
        <div class="search-hint">Try: <button>finance</button><button>trek</button><button>streaming</button><button>music</button><button>pitch</button></div>
        <div class="search-results"></div>
      </div>`;
    document.body.append(...extra.children);

    const foot = document.createElement("footer");
    foot.className = "footer";
    foot.innerHTML = `
      <div class="film-strip"></div>
      <div class="container">
        <div class="credits reveal">
          <div class="role">A Production of</div>
          <div class="name">Vanderbilt Film &amp; Media Business Society</div>
          <div class="role">Filmed on location in</div>
          <div class="name">Nashville, Tennessee</div>
        </div>
        <div class="footer-grid">
          <div>
            <a class="brand" href="index.html"><span class="brand-mark">VFMBS</span></a>
            <p style="max-width:340px;margin-top:14px">Where finance meets film. The business of entertainment, media and everything on screen, for Vanderbilt students.</p>
            <div style="display:flex;gap:6px;margin-top:10px">
              <a class="icon-btn" href="${D.config.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icons.ig}</a>
              <a class="icon-btn" href="${D.config.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${icons.li}</a>
              <a class="icon-btn" href="mailto:${D.config.email}" aria-label="Email">${icons.mail}</a>
            </div>
          </div>
          <div><h4>Explore</h4><ul><li><a href="events.html">Events</a></li><li><a href="workshops.html">Workshops</a></li><li><a href="about.html">About &amp; Board</a></li></ul></div>
          <div><h4>Join</h4><ul><li><a href="apply.html">Apply</a></li><li><a href="portal.html">My Studio</a></li><li><a href="index.html#faq">FAQ</a></li></ul></div>
          <div><h4>Contact</h4><ul><li><a href="mailto:${D.config.email}">${D.config.email}</a></li><li>Vanderbilt University</li><li>Nashville, TN</li></ul></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} VFMBS · A student organization at Vanderbilt University</span><span>No popcorn was harmed in the making of this website.</span></div>
      </div>`;
    document.body.append(foot);
  }

  function updateBadge() {
    const n = Object.keys(Store.rsvps()).length + Object.keys(Store.wsApps()).length + (Store.app()?.submitted ? 1 : 0);
    $$("[data-badge]").forEach((b) => { b.textContent = n || ""; b.dataset.n = n; });
  }

  /* ---------------- Intro ---------------- */
  function intro() {
    if (page !== "home") return;
    let seen = false;
    try { seen = sessionStorage.getItem("vfmbs:intro"); sessionStorage.setItem("vfmbs:intro", 1); } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.createElement("div");
    el.className = "intro";
    const cols = ["#e50914", "#cfae70", "#ff2d3b", "#5aa9ff", "#b884ff", "#e50914", "#ff9a3c", "#cfae70", "#e50914", "#46d369", "#e50914"];
    el.innerHTML = `<div class="intro-streaks">${cols.map((c, i) => `<i style="--c:${c};animation-delay:${i * 0.03}s"></i>`).join("")}</div>
      <div class="intro-logo">${"VFMBS".split("").map((c) => `<span>${c}</span>`).join("")}</div>
      <div class="intro-sub">Vanderbilt Film &amp; Media Business Society presents</div>
      <button class="intro-skip">Skip intro</button>`;
    document.body.append(el);
    document.body.classList.add("locked");
    const finish = () => {
      if (el.dataset.done) return;
      el.dataset.done = 1;
      el.classList.add("zoom");
      tadum();
      setTimeout(() => { el.classList.add("done"); document.body.classList.remove("locked"); }, 850);
      setTimeout(() => el.remove(), 1600);
    };
    el.addEventListener("click", finish);
    setTimeout(finish, 2300);
  }
  // Synthesized "ta-dum" (only plays if the browser allows audio)
  function tadum() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state !== "running") return;
      const hit = (t, f) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(f, ctx.currentTime + t);
        o.frequency.exponentialRampToValueAtTime(f / 2.5, ctx.currentTime + t + 0.6);
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.9);
        o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 1);
      };
      hit(0, 110); hit(0.28, 82);
    } catch {}
  }

  /* ---------------- Toasts ---------------- */
  function toast(msg, type = "") {
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.innerHTML = `<span class="dot"></span><span>${esc(msg)}</span>`;
    $(".toasts").append(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3200);
  }

  /* ---------------- Modal ---------------- */
  let lastFocus = null;
  function openModal(html, { size = "", onOpen } = {}) {
    const root = $(".modal-root"), m = $(".modal", root);
    lastFocus = document.activeElement;
    m.className = "modal " + size;
    m.innerHTML = `<button class="modal-close" aria-label="Close">${icons.close}</button>` + html;
    root.classList.add("open");
    document.body.classList.add("locked");
    root.scrollTop = 0;
    $(".modal-close", m).addEventListener("click", closeModal);
    onOpen && onOpen(m);
    setTimeout(() => (m.querySelector("input,select,textarea") || $(".modal-close", m)).focus({ preventScroll: true }), 60);
    return m;
  }
  function closeModal() {
    const root = $(".modal-root");
    if (!root.classList.contains("open")) return;
    root.classList.remove("open");
    document.body.classList.remove("locked");
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  /* ---------------- Cards (Netflix rows) ---------------- */
  function eventCard(ev) {
    const going = Store.rsvps()[ev.id];
    const left = seatsLeft(ev);
    const inList = Store.list().includes(ev.id);
    const pct = (seatsTaken(ev) / ev.capacity) * 100;
    return `
      <article class="card" data-open="${ev.id}" tabindex="0" aria-label="${esc(ev.title)}">
        <div class="card-media">${art(ev.palette, ev.motif)}
          <span class="card-tag">${esc(ev.type)}</span>
          ${left <= 10 && !isPast(ev) ? `<span class="card-flag">LAST<br>SEATS</span>` : ""}
          <div class="card-label">${esc(ev.title)}</div>
        </div>
        <div class="card-details">
          <div class="card-actions">
            <button class="round-btn filled" data-rsvp="${ev.id}" aria-label="RSVP">${going ? icons.check : icons.play}</button>
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ev.id}" aria-label="Add to My List">${inList ? icons.check : icons.plus}</button>
            <button class="round-btn" data-like aria-label="Like">${icons.thumb}</button>
            <span class="spacer"></span>
            <button class="round-btn" data-open="${ev.id}" aria-label="More info">${icons.chevDown}</button>
          </div>
          <div class="card-meta"><span class="match">${match(ev.id)}% Match</span><span class="rating">${esc(ev.type.toUpperCase())}</span><span>${fmtDate(ev)}</span></div>
          <div class="card-genres">${ev.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <div class="seat-bar" title="${left} seats left"><i style="width:${pct}%"></i></div>
        </div>
      </article>`;
  }
  function workshopCard(ws) {
    const applied = Store.wsApps()[ws.id];
    const inList = Store.list().includes(ws.id);
    return `
      <article class="card" data-open="${ws.id}" tabindex="0" aria-label="${esc(ws.title)}">
        <div class="card-media">${art(ws.palette, ws.motif)}
          <span class="card-tag">${ws.episodes.length} Episodes</span>
          ${ws.applied > ws.seats ? `<span class="card-flag">HOT</span>` : ""}
          <div class="card-label">${esc(ws.title)}</div>
        </div>
        <div class="card-details">
          <div class="card-actions">
            <button class="round-btn filled" data-apply-ws="${ws.id}" aria-label="Apply">${applied ? icons.check : icons.play}</button>
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ws.id}" aria-label="Add to My List">${inList ? icons.check : icons.plus}</button>
            <span class="spacer"></span>
            <button class="round-btn" data-open="${ws.id}" aria-label="Episodes & info">${icons.chevDown}</button>
          </div>
          <div class="card-meta"><span class="match">${match(ws.id)}% Match</span><span class="rating">${esc(ws.level.toUpperCase())}</span><span class="hd">HD</span></div>
          <div class="card-genres"><span>${esc(trackName(ws.track))}</span><span>${ws.seats} seats</span></div>
        </div>
      </article>`;
  }
  const trackName = (id) => (D.tracks.find((t) => t.id === id) || {}).name || "";

  function wireRow(row) {
    const track = $(".row-track", row), l = $(".row-arrow.left", row), r = $(".row-arrow.right", row);
    if (!track || !l) return;
    const upd = () => { l.hidden = track.scrollLeft < 10; r.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10; };
    l.addEventListener("click", () => track.scrollBy({ left: -track.clientWidth * 0.85 }));
    r.addEventListener("click", () => track.scrollBy({ left: track.clientWidth * 0.85 }));
    track.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    upd();
  }
  const rowHTML = (title, inner, more) => `
    <section class="row reveal">
      <div class="row-head"><h2 class="row-title">${title}</h2>${more ? `<a class="row-more" href="${more}">Explore all ›</a>` : ""}</div>
      <div class="row-viewport">
        <button class="row-arrow left" aria-label="Scroll left">${icons.chevL}</button>
        <div class="row-track">${inner}</div>
        <button class="row-arrow right" aria-label="Scroll right">${icons.chevR}</button>
      </div>
    </section>`;

  /* ---------------- Detail modals ---------------- */
  function openEvent(id) {
    const ev = D.events.find((e) => e.id === id);
    if (!ev) return;
    const going = Store.rsvps()[ev.id];
    const left = seatsLeft(ev);
    const past = isPast(ev);
    const inList = Store.list().includes(ev.id);
    openModal(`
      <div class="modal-hero">${art(ev.palette, ev.motif, { beam: true })}
        <div class="modal-hero-content">
          <div class="kicker"><span class="n-logo">V</span> ${esc(ev.type)}</div>
          <h2>${esc(ev.title)}</h2>
          <div class="slide-actions">
            ${past ? `<button class="btn btn-ghost" disabled>Event ended</button>` : going ? `<button class="btn btn-primary" data-ticket="${ev.id}">${icons.ticket} View Ticket</button>` : left > 0 ? `<button class="btn btn-primary" data-rsvp="${ev.id}">${icons.play} RSVP</button>` : `<button class="btn btn-primary" data-rsvp="${ev.id}">Join Waitlist</button>`}
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ev.id}" aria-label="My List">${inList ? icons.check : icons.plus}</button>
            <button class="round-btn" data-ics="${ev.id}" aria-label="Add to calendar">${icons.cal}</button>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-cols">
          <div>
            <div class="meta-line"><span class="match">${match(ev.id)}% Match</span><span>${fmtDate(ev)}</span><span class="rating">${esc(ev.type.toUpperCase())}</span><span class="hd">LIVE</span></div>
            <p style="font-size:16px">${esc(ev.desc)}</p>
            <div class="ev-cap" style="max-width:none;margin-top:18px">
              <span>${seatsTaken(ev)} / ${ev.capacity} going</span>
              <div class="seat-bar"><i style="width:${(seatsTaken(ev) / ev.capacity) * 100}%"></i></div>
              <span class="${left <= 10 ? "hot" : ""}">${left} left</span>
            </div>
          </div>
          <div class="side">
            <p>When: <b>${fmtTime(ev)}</b></p>
            <p>Where: <b>${esc(ev.location)}</b></p>
            <p>Tags: <b>${ev.tags.map(esc).join(", ")}</b></p>
            ${going ? `<p>Status: <b style="color:var(--green)">You're going ✓</b></p>` : ""}
          </div>
        </div>
      </div>`);
    history.replaceState(null, "", "#" + ev.id);
  }

  function openWorkshop(id) {
    const ws = D.workshops.find((w) => w.id === id);
    if (!ws) return;
    const applied = Store.wsApps()[ws.id];
    const closed = new Date(ws.deadline) < new Date();
    const inList = Store.list().includes(ws.id);
    openModal(`
      <div class="modal-hero">${art(ws.palette, ws.motif, { beam: true })}
        <div class="modal-hero-content">
          <div class="kicker"><span class="n-logo">V</span> Workshop Series</div>
          <h2>${esc(ws.title)}</h2>
          <div class="slide-actions">
            ${applied ? `<a class="btn btn-primary" href="portal.html">${icons.check} Applied · View status</a>` : closed ? `<button class="btn btn-ghost" disabled>Applications closed</button>` : `<button class="btn btn-primary" data-apply-ws="${ws.id}">${icons.play} Apply</button>`}
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ws.id}" aria-label="My List">${inList ? icons.check : icons.plus}</button>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-cols">
          <div>
            <div class="meta-line"><span class="match">${match(ws.id)}% Match</span><span>${ws.episodes.length} Episodes</span><span class="rating">${esc(ws.level.toUpperCase())}</span><span class="hd">HD</span></div>
            <p style="font-size:16px"><b>${esc(ws.subtitle)}.</b> ${esc(ws.schedule)}. Apply by ${fmt(ws.deadline, { month: "short", day: "numeric" })}.</p>
          </div>
          <div class="side">
            <p>Track: <b>${esc(trackName(ws.track))}</b></p>
            <p>Seats: <b>${ws.seats}</b> · Applicants: <b>${ws.applied + (applied ? 1 : 0)}</b></p>
            <p>Acceptance rate: <b>~${Math.min(100, Math.round((ws.seats / (ws.applied + 1)) * 100))}%</b></p>
          </div>
        </div>
        <div class="episodes">
          <div class="episodes-head"><h3>Episodes</h3><span class="chip">Season 1 · Fall 2026</span></div>
          ${ws.episodes.map((e, i) => `
            <div class="episode">
              <div class="episode-n">${i + 1}</div>
              <div class="episode-thumb">${art(ws.palette, ws.motif)}</div>
              <div><h4>${esc(e.t)}</h4><p>${esc(e.s)}</p></div>
              <div class="episode-d">${esc(e.d)}</div>
            </div>`).join("")}
        </div>
      </div>`);
    history.replaceState(null, "", "#" + ws.id);
  }

  function openTrack(id) {
    const t = D.tracks.find((x) => x.id === id);
    if (!t) return;
    const ws = D.workshops.filter((w) => w.track === id);
    openModal(`
      <div class="modal-hero">${art(t.palette, t.motif, { beam: true })}
        <div class="modal-hero-content">
          <div class="kicker"><span class="n-logo">V</span> Track</div>
          <h2>${esc(t.name)}</h2>
          <div class="slide-actions"><a class="btn btn-primary" href="apply.html">${icons.play} Apply to this track</a></div>
        </div>
      </div>
      <div class="modal-body">
        <div class="meta-line"><span class="match">${match(t.id)}% Match</span><span>${esc(t.genre)}</span></div>
        <p style="font-size:16px">${esc(t.blurb)}</p>
        <div class="chips" style="margin:16px 0 26px">${t.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
        ${ws.length ? `<h3 style="margin:0 0 12px">Related workshops</h3><div class="ws-grid">${ws.map((w) => `<button class="status-card" style="grid-template-columns:120px 1fr;text-align:left;margin:0" data-open="${w.id}"><div class="ev-thumb">${art(w.palette, w.motif)}</div><div><h3>${esc(w.title)}</h3><p>${esc(w.subtitle)}</p></div></button>`).join("")}</div>` : ""}
      </div>`);
  }

  function openAny(id) {
    if (D.events.some((e) => e.id === id)) return openEvent(id);
    if (D.workshops.some((w) => w.id === id)) return openWorkshop(id);
    if (D.tracks.some((t) => t.id === id)) return openTrack(id);
  }

  /* ---------------- RSVP flow ---------------- */
  function rsvpForm(id) {
    const ev = D.events.find((e) => e.id === id);
    if (!ev) return;
    if (Store.rsvps()[id]) return showTicket(id);
    const p = Store.profile() || {};
    const full = seatsLeft(ev) === 0;
    openModal(`
      <div class="modal-pad">
        <div class="eyebrow">${full ? "Waitlist" : "Reserve your seat"}</div>
        <h2>${esc(ev.title)}</h2>
        <p style="color:var(--muted);margin:0 0 22px">${fmtDate(ev)} · ${esc(ev.location)}</p>
        <form id="rsvp-form" novalidate>
          <div class="row2">
            <div class="field"><label for="r-name">Full name</label><input class="input" id="r-name" name="name" required value="${esc(p.name || "")}" autocomplete="name"></div>
            <div class="field"><label for="r-email">Vanderbilt email</label><input class="input" id="r-email" name="email" type="email" required value="${esc(p.email || "")}" placeholder="you@vanderbilt.edu" autocomplete="email"></div>
          </div>
          <div class="row2">
            <div class="field"><label for="r-year">Class year</label>
              <select class="select" id="r-year" name="year" required><option value="">Select…</option>${["2027", "2028", "2029", "2030", "Graduate"].map((y) => `<option ${p.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
            <div class="field"><label for="r-diet">Dietary needs</label>
              <select class="select" id="r-diet" name="diet"><option>None</option><option>Vegetarian</option><option>Vegan</option><option>Gluten-free</option><option>Halal</option><option>Kosher</option><option>Other</option></select></div>
          </div>
          <div class="field"><span class="label">What are you most interested in?</span>
            <div class="opts">${["Finance", "Film & TV", "Music", "Sports", "Gaming", "Startups"].map((o) => `<label class="opt"><input type="checkbox" name="interests" value="${o}"><span>${o}</span></label>`).join("")}</div>
          </div>
          <div class="field"><label for="r-q">Question for the speakers (optional)</label><input class="input" id="r-q" name="q" maxlength="200"></div>
          <div class="err" id="r-err"></div>
          <button class="btn btn-red" style="width:100%;margin-top:6px" type="submit">${full ? "Join Waitlist" : "Confirm RSVP"}</button>
        </form>
      </div>`, { size: "sm" });

    $("#rsvp-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target, fd = new FormData(f);
      const data = Object.fromEntries(fd);
      data.interests = fd.getAll("interests");
      const bad = validate(f, { email: true });
      if (bad) { $("#r-err").textContent = bad; return; }
      const c = code("VFM");
      const h = hash(c);
      const rec = { ...data, code: c, seat: `${"ABCDEFGHJK"[h % 10]}${(h % 24) + 1}`, waitlist: full, ts: Date.now() };
      const all = Store.rsvps();
      all[id] = rec;
      Store.set("rsvps", all);
      rememberProfile(data);
      send("rsvp", { event: ev.title, eventId: id, ...rec });
      confetti();
      toast(full ? "You're on the waitlist" : "You're going! Ticket saved to My Studio");
      showTicket(id);
      refresh();
    });
  }

  function validate(form, { email } = {}) {
    let msg = "";
    $$("[required]", form).forEach((el) => {
      const ok = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
      el.classList.toggle("invalid", !ok);
      if (!ok && !msg) msg = "Please fill in all required fields.";
    });
    const em = form.querySelector('[type="email"]');
    if (email && em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.classList.add("invalid"); msg = msg || "Please enter a valid email."; }
    return msg;
  }

  function rememberProfile(d) {
    const id = Store.activeId();
    const list = Store.profiles();
    let p = list.find((x) => x.id === id);
    if (!p) {
      if (id !== "guest") return;
      p = { id: "guest", name: d.name, color: "gold" };
      list.push(p);
    }
    if (!p.name && d.name) p.name = d.name;
    if (!p.email && d.email) p.email = d.email;
    if (!p.year && d.year) p.year = d.year;
    Store.saveProfiles(list);
  }

  function ticketHTML(ev, r) {
    const bars = [];
    let h = hash(r.code);
    for (let i = 0; i < 38; i++) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; bars.push(`<i style="flex:${1 + (h % 4)}"></i><span style="flex:${1 + ((h >>> 3) % 2)}"></span>`); }
    return `
      <div class="ticket">
        <div class="ticket-main">
          <div class="admit">${r.waitlist ? "Waitlist · Standby" : "Admit One"} · ${esc(ev.type)}</div>
          <h3>${esc(ev.title)}</h3>
          <div class="ticket-grid">
            <div><span>Date</span><b>${fmt(ev.date, { month: "short", day: "numeric" }, evTz(ev))}</b></div>
            <div><span>Doors</span><b>${fmt(ev.date, { hour: "numeric", minute: "2-digit" }, evTz(ev))}</b></div>
            <div><span>Seat</span><b>${r.waitlist ? "TBA" : esc(r.seat)}</b></div>
            <div style="grid-column:span 2"><span>Venue</span><b>${esc(ev.location)}</b></div>
            <div><span>Guest</span><b>${esc((r.name || "").split(" ")[0])}</b></div>
          </div>
        </div>
        <div class="ticket-stub">
          <div class="ticket-brand">VFMBS</div>
          <div class="barcode">${bars.join("")}</div>
          <div class="code">${esc(r.code)}</div>
        </div>
      </div>`;
  }

  function showTicket(id) {
    const ev = D.events.find((e) => e.id === id);
    const r = Store.rsvps()[id];
    if (!ev || !r) return;
    openModal(`
      <div class="modal-pad">
        <div class="eyebrow">${r.waitlist ? "You're on the list" : "You're going"}</div>
        <h2 style="margin-bottom:22px">${r.waitlist ? "Standby confirmed." : "See you at the premiere."}</h2>
        ${ticketHTML(ev, r)}
        <div class="ticket-tools" style="margin-top:22px">
          <button class="btn btn-primary btn-sm" data-ics="${ev.id}">${icons.cal} Add to calendar</button>
          <a class="btn btn-outline btn-sm" href="portal.html">${icons.ticket} My Studio</a>
          <button class="btn btn-outline btn-sm" data-cancel="${ev.id}" style="margin-left:auto">Cancel RSVP</button>
        </div>
      </div>`, { size: "sm" });
  }

  function cancelRsvp(id) {
    if (!confirm("Cancel your RSVP? Your seat will be released.")) return;
    const all = Store.rsvps();
    delete all[id];
    Store.set("rsvps", all);
    toast("RSVP cancelled");
    closeModal();
    refresh();
  }

  function downloadICS(id) {
    const ev = D.events.find((e) => e.id === id);
    if (!ev) return;
    const z = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VFMBS//Events//EN", "BEGIN:VEVENT",
      `UID:${ev.id}@vfmbs`, `DTSTAMP:${z(Date.now())}`, `DTSTART:${z(ev.date)}`, `DTEND:${z(ev.end)}`,
      `SUMMARY:${ev.title} (VFMBS)`, `LOCATION:${ev.location}`, `DESCRIPTION:${ev.desc.replace(/,/g, "\\,")}`, "END:VEVENT", "END:VCALENDAR"];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    a.download = ev.id + ".ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Calendar invite downloaded");
  }

  /* ---------------- Workshop application ---------------- */
  function applyWorkshop(id) {
    const ws = D.workshops.find((w) => w.id === id);
    if (!ws) return;
    if (Store.wsApps()[id]) { toast("You've already applied. Check My Studio."); return; }
    const p = Store.profile() || {};
    openModal(`
      <div class="modal-pad">
        <div class="eyebrow">Workshop application</div>
        <h2>${esc(ws.title)}</h2>
        <p style="color:var(--muted);margin:0 0 22px">${esc(ws.schedule)} · Deadline ${fmt(ws.deadline, { month: "short", day: "numeric" })}</p>
        <form id="ws-form" novalidate>
          <div class="row2">
            <div class="field"><label for="w-name">Full name</label><input class="input" id="w-name" name="name" required value="${esc(p.name || "")}"></div>
            <div class="field"><label for="w-email">Vanderbilt email</label><input class="input" id="w-email" name="email" type="email" required value="${esc(p.email || "")}"></div>
          </div>
          <div class="row2">
            <div class="field"><label for="w-year">Class year</label><select class="select" id="w-year" name="year" required><option value="">Select…</option>${["2027", "2028", "2029", "2030", "Graduate"].map((y) => `<option ${p.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
            <div class="field"><label for="w-major">Major(s)</label><input class="input" id="w-major" name="major" required></div>
          </div>
          <div class="field"><span class="label">Experience with this topic</span>
            <div class="opts">${["None, and excited", "Some coursework", "Internship / project", "I could teach it"].map((o, i) => `<label class="opt"><input type="radio" name="exp" value="${o}" ${i === 0 ? "checked" : ""}><span>${o}</span></label>`).join("")}</div>
          </div>
          <div class="field"><label for="w-why">Why this workshop? <span style="color:var(--dim)">(max 500 characters)</span></label>
            <textarea class="textarea" id="w-why" name="why" required maxlength="500" data-count></textarea><div class="counter"></div></div>
          <label class="opt" style="display:flex;gap:10px;align-items:center;font-size:13px;margin-bottom:16px"><input type="checkbox" name="commit" required style="position:static;opacity:1;pointer-events:auto;accent-color:var(--gold)"> I can attend at least ${ws.episodes.length - 1} of ${ws.episodes.length} sessions.</label>
          <div class="err" id="w-err"></div>
          <button class="btn btn-gold" style="width:100%;margin-top:6px" type="submit">Submit Application</button>
        </form>
      </div>`, { size: "sm", onOpen: (m) => wireCounters(m) });

    $("#ws-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const bad = validate(f, { email: true });
      if (bad) { $("#w-err").textContent = bad; return; }
      const data = Object.fromEntries(new FormData(f));
      const all = Store.wsApps();
      all[id] = { ...data, code: code("WS"), status: "review", ts: Date.now() };
      Store.set("ws", all);
      rememberProfile(data);
      send("workshop", { workshop: ws.title, ...all[id] });
      confetti();
      openModal(`
        <div class="modal-pad wrap-screen">
          ${clapperSVG()}
          <div class="eyebrow" style="justify-content:center">Application received</div>
          <h2>You're in the pitch meeting.</h2>
          <p style="color:var(--muted)">We'll review your application for <b style="color:#fff">${esc(ws.title)}</b> and email decisions within 3 days of the deadline. Confirmation: <b style="color:var(--gold);font-family:var(--mono)">${all[id].code}</b></p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:20px"><a class="btn btn-primary btn-sm" href="portal.html">Track status</a><button class="btn btn-outline btn-sm" data-close>Keep browsing</button></div>
        </div>`, { size: "sm" });
      refresh();
    });
  }

  function wireCounters(root = document) {
    $$("[data-count]", root).forEach((ta) => {
      const c = ta.nextElementSibling;
      const max = +ta.getAttribute("maxlength");
      const upd = () => { c.textContent = `${ta.value.length} / ${max}`; c.classList.toggle("over", ta.value.length >= max); };
      ta.addEventListener("input", upd);
      upd();
    });
  }

  const clapperSVG = () => `<svg class="clapper" viewBox="0 0 200 170"><rect x="20" y="60" width="160" height="100" rx="6" fill="#111" stroke="#cfae70" stroke-width="3"/><path d="M20 90h160" stroke="#cfae70" stroke-width="2"/><text x="100" y="135" text-anchor="middle" fill="#cfae70" font-family="Bebas Neue, sans-serif" font-size="30" letter-spacing="3">THAT'S A WRAP</text><g class="top"><path d="M20 60 26 20 184 8 178 48Z" fill="#111" stroke="#cfae70" stroke-width="3"/><path d="M50 20 62 54M90 17l12 34M130 14l12 34M168 11l8 30" stroke="#e50914" stroke-width="10"/></g></svg>`;

  /* ---------------- Backend hook ---------------- */
  function send(kind, payload) {
    if (!D.config.formEndpoint) return;
    fetch(D.config.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ kind, ...payload }) })
      .catch(() => toast("Saved locally. We couldn't reach the server.", "error"));
  }

  /* ---------------- Confetti ---------------- */
  function confetti(n = 90) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cols = ["#cfae70", "#e50914", "#fff", "#e8cf97", "#ff2d3b"];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("i");
      c.className = "conf";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cols[i % cols.length];
      c.style.animationDuration = 1.8 + Math.random() * 2 + "s";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.append(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  /* ---------------- Search ---------------- */
  function initSearch() {
    const box = $(".search"), input = $("input", box), res = $(".search-results", box);
    const open = () => { box.classList.add("open"); document.body.classList.add("locked"); setTimeout(() => input.focus(), 50); run(); };
    const close = () => { box.classList.remove("open"); if (!$(".modal-root.open")) document.body.classList.remove("locked"); };
    const run = () => {
      const q = input.value.trim().toLowerCase();
      const hay = (o) => JSON.stringify(o).toLowerCase();
      const evs = D.events.filter((e) => !q || hay(e).includes(q));
      const wss = D.workshops.filter((w) => !q || hay(w).includes(q) || trackName(w.track).toLowerCase().includes(q));
      const html = evs.map(eventCard).join("") + wss.map(workshopCard).join("");
      res.innerHTML = html;
      res.nextElementSibling?.remove();
      if (!html) res.insertAdjacentHTML("afterend", `<p class="search-empty">Your search for "${esc(q)}" did not have any matches. Try "finance", "trek" or "pitch".</p>`);
    };
    input.addEventListener("input", run);
    $$(".search-hint button", box).forEach((b) => b.addEventListener("click", () => { input.value = b.textContent; run(); }));
    $$("[data-search]").forEach((b) => b.addEventListener("click", open));
    $("[data-search-close]", box).addEventListener("click", close);
    res.addEventListener("click", (e) => { if (e.target.closest("[data-open],[data-rsvp],[data-apply-ws]")) close(); }, true);
    addEventListener("keydown", (e) => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
      if (e.key === "Escape") { if (box.classList.contains("open")) close(); else closeModal(); }
    });
    return { rerun: () => box.classList.contains("open") && run() };
  }

  /* ---------------- Global delegation ---------------- */
  function initDelegation() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-rsvp],[data-list],[data-open],[data-apply-ws],[data-ics],[data-ticket],[data-cancel],[data-close],[data-like],.modal-backdrop");
      if (!t) return;
      if (t.matches(".modal-backdrop") || t.matches("[data-close]")) return closeModal();
      e.preventDefault();
      e.stopPropagation();
      const d = t.dataset;
      if (d.rsvp) rsvpForm(d.rsvp);
      else if (d.list) {
        const added = Store.toggleList(d.list);
        toast(added ? "Added to My List" : "Removed from My List");
        t.classList.toggle("on", added);
        t.innerHTML = added ? icons.check : icons.plus;
      } else if (d.applyWs) applyWorkshop(d.applyWs);
      else if (d.ics) downloadICS(d.ics);
      else if (d.ticket) showTicket(d.ticket);
      else if (d.cancel) cancelRsvp(d.cancel);
      else if ("like" in d) { t.classList.toggle("on"); if (t.classList.contains("on")) toast("Rated. We'll show you more like this."); }
      else if (d.open) openAny(d.open);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches(".card[data-open]")) openAny(e.target.dataset.open);
    });
  }

  /* ---------------- Scroll effects ---------------- */
  function initScroll() {
    const nav = $(".nav"), bar = $(".progress-bar");
    const on = () => {
      nav.classList.toggle("solid", scrollY > 40);
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    };
    addEventListener("scroll", on, { passive: true });
    on();
  }
  let io;
  function reveal(root = document) {
    io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal:not(.in)", root).forEach((el) => io.observe(el));
  }
  function counters(root = document) {
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); p < 1 && requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.5 });
    $$("[data-count]:not(textarea)", root).forEach((el) => cio.observe(el));
  }
  function countdown(el, iso) {
    const tick = () => {
      let s = Math.max(0, (new Date(iso) - Date.now()) / 1000);
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s = Math.floor(s - m * 60);
      el.innerHTML = [[d, "Days"], [h, "Hours"], [m, "Min"], [s, "Sec"]].map(([n, l]) => `<div><b>${String(n).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Page refresh hooks ---------------- */
  const refreshers = [];
  let searchApi;
  function refresh() { refreshers.forEach((f) => f()); updateBadge(); searchApi && searchApi.rerun(); }

  /* ---------------- Boot ---------------- */
  renderChrome();
  intro();
  initDelegation();
  searchApi = initSearch();
  initScroll();
  updateBadge();
  onChange(updateBadge);

  window.App = {
    D, $, $$, esc, icons, motifs, art, vars, Store, onChange, fmt, fmtDate, fmtTime, isPast, seatsLeft, seatsTaken, match, hash, code, byId,
    toast, openModal, closeModal, eventCard, workshopCard, rowHTML, wireRow, openEvent, openWorkshop, openTrack, openAny,
    rsvpForm, showTicket, ticketHTML, applyWorkshop, validate, wireCounters, clapperSVG, confetti, send, rememberProfile,
    reveal, counters, countdown, trackName, evTz,
    onRefresh: (f) => refreshers.push(f), refresh,
  };

  addEventListener("DOMContentLoaded", () => {
    reveal();
    counters();
    const h = location.hash.slice(1);
    if (h && byId(h)) setTimeout(() => openAny(h), page === "home" ? 2600 : 300);
  });
})();
