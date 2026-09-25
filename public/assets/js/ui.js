/* =========================================================================
   VFMBS UI: chrome (nav, footer, search), modals, cards, RSVP/tickets,
   workshop applications, forms, toasts, popcorn.
   ========================================================================= */
(() => {
  const { $, $$, esc, icons, Store } = V;
  const page = V.page;

  /* ---------------- Nav ---------------- */
  const NAV = [
    ["events", "/events", "Events"],
    ["workshops", "/workshops", "Workshops"],
    ["team", "/team", "Team"],
    ["journal", "/journal", "Journal"],
    ["partners", "/partners", "Partners"],
    ["about", "/about", "About"],
  ];

  function renderNav() {
    document.body.insertAdjacentHTML("afterbegin", `<a class="skip" href="#main">Skip to content</a>`);
    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML = `
      <a class="brand" href="/" aria-label="VFMBS home">
        <img src="/assets/brand/logo.svg" alt="" width="38" height="38">
        <span class="brand-word">VFMBS<i>.</i></span>
        <span class="brand-sub">Vanderbilt Film &amp;<br>Media Business Society</span>
      </a>
      <nav class="nav-links" aria-label="Main">${NAV.map(([k, h, l]) => `<a href="${h}" class="${k === page ? "active" : ""}" ${k === page ? 'aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
      <div class="nav-right">
        <button class="icon-btn" data-search aria-label="Search (press /)">${icons.search}</button>
        <span class="kbd" aria-hidden="true">/</span>
        <a class="icon-btn" href="/portal" aria-label="My Studio: your tickets and applications" data-cursor="Studio">${icons.ticket}<span class="badge" data-badge></span></a>
        <a class="btn btn-gold btn-sm btn-nav magnetic" href="/apply">Apply Now</a>
        <button class="icon-btn nav-toggle" aria-label="Open menu" aria-expanded="false">${icons.menu}</button>
      </div>`;
    document.body.prepend(nav);

    const mm = document.createElement("div");
    mm.className = "mobile-menu";
    mm.setAttribute("aria-hidden", "true");
    const all = [["home", "/", "Home"], ...NAV, ["apply", "/apply", "Apply"], ["portal", "/portal", "My Studio"], ["contact", "/contact", "Contact"]];
    mm.innerHTML = all.map(([k, h, l], i) => `<a class="big ${k === page ? "active" : ""}" href="${h}" style="--i:${i}"><small>${V.pad(i + 1)}</small>${l}</a>`).join("") +
      `<div class="mm-foot"><a class="btn btn-gold" href="/apply">Apply Now</a><a class="btn btn-outline" href="/events">RSVP to an event</a></div>`;
    nav.after(mm);
    const tog = $(".nav-toggle", nav);
    tog.addEventListener("click", () => {
      const open = mm.classList.toggle("open");
      tog.setAttribute("aria-expanded", open);
      tog.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mm.setAttribute("aria-hidden", !open);
      tog.innerHTML = open ? icons.close : icons.menu;
      document.body.classList.toggle("locked", open);
    });

    document.body.insertAdjacentHTML("beforeend", `
      <div class="progress-bar" aria-hidden="true"></div>
      <div class="grain" aria-hidden="true"></div>
      <div class="toasts" role="status" aria-live="polite"></div>
      <div class="modal-root" role="dialog" aria-modal="true" aria-label="Details"><div class="modal-backdrop"></div><div class="modal"></div></div>
      <div class="search" role="dialog" aria-label="Search">
        <button class="icon-btn search-close" data-search-close aria-label="Close search">${icons.close}</button>
        <div class="search-bar">${icons.search}<input type="search" placeholder="Events, workshops, stories…" aria-label="Search the site"></div>
        <div class="search-hint">Try: <button>finance</button><button>trek</button><button>streaming</button><button>music</button><button>pitch</button></div>
        <div class="search-results"></div>
      </div>`);
  }

  function renderAnnouncement() {
    const a = V.C.settings.announcement;
    if (!a || !a.enabled || !a.text) return;
    const key = "bar:" + V.hash(a.text);
    if (V.LS.get(key)) return;
    const bar = document.createElement("div");
    bar.className = "announce";
    const href = V.safeUrl(a.link);
    bar.innerHTML = `<span class="live">LIVE</span><span class="txt">${esc(a.text)}</span>${href ? `<a href="${esc(href)}">${esc(a.label || "Learn more")} →</a>` : ""}<button aria-label="Dismiss announcement">${icons.close}</button>`;
    document.body.prepend(bar);
    document.body.classList.add("has-bar");
    $("button", bar).addEventListener("click", () => { V.LS.set(key, 1); bar.remove(); document.body.classList.remove("has-bar"); });
  }

  function renderFooter() {
    const s = V.C.settings;
    const socials = [["instagram", icons.ig, "Instagram"], ["linkedin", icons.li, "LinkedIn"], ["tiktok", icons.tiktok, "TikTok"], ["youtube", icons.yt, "YouTube"]]
      .filter(([k]) => V.safeUrl(s[k])).map(([k, ic, l]) => `<a class="icon-btn" href="${esc(V.safeUrl(s[k]))}" target="_blank" rel="noopener noreferrer" aria-label="${l}">${ic}</a>`).join("");
    const f = document.createElement("footer");
    f.className = "footer";
    f.innerHTML = `
      <div class="film-strip" aria-hidden="true"></div>
      <div class="container">
        <div class="foot-cta">
          <h2 class="reveal">Your first credit<br><em>starts here.</em></h2>
          <div class="foot-news reveal reveal-d1">
            <p>Get event drops, deadlines and the Journal in your inbox. No spam, just good cinema.</p>
            <form class="signup" data-signup="footer" novalidate><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="email" name="email" placeholder="you@vanderbilt.edu" aria-label="Email address" required><button class="btn btn-primary" type="submit">Subscribe</button></form>
          </div>
        </div>
        <div class="footer-grid">
          <div>
            <a class="brand" href="/"><img src="/assets/brand/logo.svg" alt="" width="38" height="38"><span class="brand-word">VFMBS<i>.</i></span></a>
            <p style="max-width:340px;margin:16px 0 0">${esc(s.tagline || "The business behind the screen.")} Finance, film, media and entertainment at Vanderbilt.</p>
            <div class="socials">${socials}<a class="icon-btn" href="mailto:${esc(s.email)}" aria-label="Email">${icons.mail}</a></div>
          </div>
          <div><h4>Explore</h4><ul><li><a href="/events">Events</a></li><li><a href="/workshops">Workshops</a></li><li><a href="/journal">Journal</a></li><li><a href="/team">Team</a></li></ul></div>
          <div><h4>Society</h4><ul><li><a href="/about">About</a></li><li><a href="/apply">Apply</a></li><li><a href="/partners">Partner with us</a></li><li><a href="/portal">My Studio</a></li></ul></div>
          <div><h4>Contact</h4><ul><li><a href="/contact">Contact us</a></li><li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li><li><a href="/partners#inquire">Sponsorships</a></li><li>${esc(s.location || "Nashville, TN")}</li></ul></div>
          <div><h4>Legal</h4><ul><li><a href="/privacy">Privacy</a></li><li><a href="/privacy#terms">Terms</a></li><li><a href="/privacy#conduct">Code of Conduct</a></li><li><a href="/privacy#accessibility">Accessibility</a></li></ul></div>
        </div>
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} ${esc(s.orgName || "VFMBS")}. VFMBS is a student organization at Vanderbilt University. Content on this site does not necessarily represent the views of Vanderbilt University.</p>
          <span>No popcorn was harmed in the making of this website. · <a href="/admin">Admin</a></span>
        </div>
      </div>
      <div class="giant" aria-hidden="true">VFMBS.</div>`;
    const main = $("main");
    (main ? main.after(f) : document.body.append(f));
  }

  function updateBadge() {
    const n = Object.keys(Store.tickets()).length + Object.keys(Store.wsApps()).length + (Store.app()?.submitted ? 1 : 0);
    $$("[data-badge]").forEach((b) => (b.textContent = n || ""));
  }

  /* ---------------- Toast & modal ---------------- */
  function toast(msg, type = "") {
    const box = $(".toasts");
    if (!box) return;
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.innerHTML = `<span class="dot"></span><span>${esc(msg)}</span>`;
    box.append(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3600);
  }

  let lastFocus = null;
  function openModal(html, { size = "", onOpen, hash } = {}) {
    const root = $(".modal-root"), m = $(".modal", root);
    if (!root.classList.contains("open")) lastFocus = document.activeElement;
    m.className = "modal " + size;
    m.innerHTML = `<button class="modal-close" aria-label="Close">${icons.close}</button>` + html;
    root.classList.add("open");
    document.body.classList.add("locked");
    root.scrollTop = 0;
    $(".modal-close", m).addEventListener("click", closeModal);
    if (hash) history.replaceState(null, "", "#" + hash);
    onOpen && onOpen(m);
    setTimeout(() => (m.querySelector("input:not(.hp),select,textarea") || $(".modal-close", m)).focus({ preventScroll: true }), 80);
    return m;
  }
  function closeModal() {
    const root = $(".modal-root");
    if (!root || !root.classList.contains("open")) return;
    root.classList.remove("open");
    if (!$(".search.open") && !$(".mobile-menu.open")) document.body.classList.remove("locked");
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    lastFocus?.focus?.({ preventScroll: true });
  }
  // Focus trap
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !$(".modal-root.open")) return;
    const f = $$(".modal-root.open .modal a[href], .modal-root.open .modal button:not([disabled]), .modal-root.open .modal input:not(.hp), .modal-root.open .modal select, .modal-root.open .modal textarea").filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------------- Cards ---------------- */
  const pctTaken = (ev) => (ev.capacity ? (V.taken(ev) / ev.capacity) * 100 : 0);
  function eventCard(ev) {
    const going = Store.tickets()[ev.id];
    const left = V.seatsLeft(ev);
    const inList = Store.list().includes(ev.id);
    return `
      <article class="card" data-open="${ev.id}" tabindex="0" aria-label="${esc(ev.title)}" data-cursor="View">
        <div class="card-media">${V.art(ev.palette, ev.motif, { image: ev.image })}
          <span class="card-tag">${esc(ev.type)}</span>
          ${going ? `<span class="card-flag gold">GOING</span>` : left <= 10 && !V.isPast(ev) ? `<span class="card-flag">LAST<br>SEATS</span>` : ""}
          <div class="card-label">${esc(ev.title)}</div>
        </div>
        <div class="card-details">
          <div class="card-actions">
            <button class="round-btn filled" data-rsvp="${ev.id}" aria-label="${going ? "View ticket" : "RSVP"}">${going ? icons.ticket : icons.play}</button>
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ev.id}" aria-label="Add to My List">${inList ? icons.check : icons.plus}</button>
            <button class="round-btn" data-like aria-label="Like">${icons.thumb}</button>
            <span class="spacer"></span>
            <button class="round-btn" data-open="${ev.id}" aria-label="More info">${icons.chevDown}</button>
          </div>
          <div class="card-meta"><span class="match">${V.match(ev.id)}% Match</span><span class="rating">${esc(String(ev.type).toUpperCase())}</span><span>${V.fmtDate(ev)}</span></div>
          <div class="card-genres">${(ev.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          ${ev.capacity ? `<div class="seat-bar" title="${left} seats left"><i style="width:${pctTaken(ev)}%"></i></div>` : ""}
        </div>
      </article>`;
  }
  function workshopCard(ws) {
    const applied = Store.wsApps()[ws.id];
    const inList = Store.list().includes(ws.id);
    return `
      <article class="card" data-open="${ws.id}" tabindex="0" aria-label="${esc(ws.title)}" data-cursor="Episodes">
        <div class="card-media">${V.art(ws.palette, ws.motif, { image: ws.image })}
          <span class="card-tag">${(ws.episodes || []).length} Episodes</span>
          ${applied ? `<span class="card-flag gold">APPLIED</span>` : (ws.demoApplied || 0) > ws.seats ? `<span class="card-flag">HOT</span>` : ""}
          <div class="card-label">${esc(ws.title)}</div>
        </div>
        <div class="card-details">
          <div class="card-actions">
            <button class="round-btn filled" data-apply-ws="${ws.id}" aria-label="Apply">${applied ? icons.check : icons.play}</button>
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ws.id}" aria-label="Add to My List">${inList ? icons.check : icons.plus}</button>
            <span class="spacer"></span>
            <button class="round-btn" data-open="${ws.id}" aria-label="Episodes and info">${icons.chevDown}</button>
          </div>
          <div class="card-meta"><span class="match">${V.match(ws.id)}% Match</span><span class="rating">${esc(String(ws.level).toUpperCase())}</span><span class="hd">HD</span></div>
          <div class="card-genres"><span>${esc(V.trackName(ws.track))}</span><span>${ws.seats} seats</span></div>
        </div>
      </article>`;
  }
  function trackCard(t) {
    const inList = Store.list().includes(t.id);
    return `
      <article class="card" data-open="${t.id}" tabindex="0" aria-label="${esc(t.name)}" data-cursor="View">
        <div class="card-media">${V.art(t.palette, t.motif)}<span class="card-tag">Track</span><div class="card-label">${esc(t.name)}</div></div>
        <div class="card-details">
          <div class="card-actions"><a class="round-btn filled" href="/apply" aria-label="Apply">${icons.play}</a><button class="round-btn ${inList ? "on" : ""}" data-list="${t.id}" aria-label="My List">${inList ? icons.check : icons.plus}</button><span class="spacer"></span><button class="round-btn" data-open="${t.id}" aria-label="More">${icons.chevDown}</button></div>
          <div class="card-meta"><span class="match">${V.match(t.id)}% Match</span></div>
          <div class="card-genres">${String(t.genre || "").split(" · ").map((g) => `<span>${esc(g)}</span>`).join("")}</div>
        </div>
      </article>`;
  }
  const anyCard = (x) => (x.episodes ? workshopCard(x) : x.skills ? trackCard(x) : x.body !== undefined ? postCard(x) : eventCard(x));
  function postCard(p) {
    return `<a class="post-card" href="/journal?p=${encodeURIComponent(p.id)}" data-cursor="Read">
      <div class="thumb">${V.art(p.palette, p.motif, { image: p.image })}</div>
      <div class="cat">${esc(p.category)}</div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p>
      <div class="post-meta">${p.date ? V.fmt(p.date + "T12:00:00Z", { month: "long", day: "numeric", year: "numeric" }, "UTC") : ""}${p.author ? " · " + esc(p.author) : ""}</div></a>`;
  }

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
  const rowHTML = (title, inner, more) => !inner ? "" : `
    <section class="row reveal">
      <div class="row-head"><h2 class="row-title">${title}</h2>${more ? `<a class="row-more" href="${more}">Explore all ›</a>` : ""}</div>
      <div class="row-viewport">
        <button class="row-arrow left" aria-label="Scroll left">${icons.chevL}</button>
        <div class="row-track">${inner}</div>
        <button class="row-arrow right" aria-label="Scroll right">${icons.chevR}</button>
      </div>
    </section>`;

  /* ---------------- Detail modals ---------------- */
  function primaryEventBtn(ev) {
    const going = Store.tickets()[ev.id];
    if (V.isPast(ev)) return `<button class="btn btn-ghost" disabled>Event ended</button>`;
    if (going) return `<button class="btn btn-primary" data-ticket="${ev.id}">${icons.ticket} View Ticket</button>`;
    if (ev.rsvpOpen === false) return `<button class="btn btn-ghost" disabled>RSVPs closed</button>`;
    return `<button class="btn btn-primary" data-rsvp="${ev.id}">${icons.play} ${V.seatsLeft(ev) > 0 ? "RSVP" : "Join Waitlist"}</button>`;
  }
  function openEvent(id) {
    const ev = V.C.events.find((e) => e.id === id);
    if (!ev) return;
    const left = V.seatsLeft(ev);
    const inList = Store.list().includes(ev.id);
    openModal(`
      <div class="modal-hero">${V.art(ev.palette, ev.motif, { beam: true, image: ev.image })}
        <div class="modal-hero-content">
          <div class="kicker"><img src="/assets/brand/logo.svg" alt="">${esc(ev.type)}${ev.membersOnly ? " · Members only" : ""}</div>
          <h2>${esc(ev.title)}</h2>
          <div class="actions">${primaryEventBtn(ev)}
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ev.id}" aria-label="My List">${inList ? icons.check : icons.plus}</button>
            <button class="round-btn" data-ics="${ev.id}" aria-label="Add to calendar">${icons.cal}</button>
            <button class="round-btn" data-share="/events#${ev.id}" aria-label="Copy link">${icons.link}</button>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-cols">
          <div>
            <div class="meta-line"><span class="match">${V.match(ev.id)}% Match</span><span>${V.fmtDate(ev)}</span><span class="rating">${esc(String(ev.type).toUpperCase())}</span><span class="hd">LIVE</span></div>
            <p style="font-size:16px;white-space:pre-line">${esc(ev.desc)}</p>
            ${ev.capacity ? `<div class="ev-cap" style="max-width:none;margin-top:18px"><span>${V.taken(ev)} / ${ev.capacity} going</span><div class="seat-bar"><i style="width:${pctTaken(ev)}%"></i></div><span class="${left <= 10 ? "hot" : ""}">${left} left</span></div>` : ""}
          </div>
          <div class="side">
            <p>When: <b>${V.fmtTime(ev)}</b></p>
            <p>Where: <b>${esc(ev.location)}</b></p>
            ${(ev.tags || []).length ? `<p>Tags: <b>${ev.tags.map(esc).join(", ")}</b></p>` : ""}
            ${Store.tickets()[ev.id] ? `<p>Status: <b style="color:var(--green)">You're going ✓</b></p>` : ""}
          </div>
        </div>
      </div>`, { hash: ev.id });
  }

  function openWorkshop(id) {
    const ws = V.C.workshops.find((w) => w.id === id);
    if (!ws) return;
    const applied = Store.wsApps()[ws.id];
    const closed = ws.open === false || new Date(ws.deadline) < new Date();
    const inList = Store.list().includes(ws.id);
    openModal(`
      <div class="modal-hero">${V.art(ws.palette, ws.motif, { beam: true, image: ws.image })}
        <div class="modal-hero-content">
          <div class="kicker"><img src="/assets/brand/logo.svg" alt="">Workshop series</div>
          <h2>${esc(ws.title)}</h2>
          <div class="actions">
            ${applied ? `<a class="btn btn-primary" href="/portal">${icons.check} Applied · View status</a>` : closed ? `<button class="btn btn-ghost" disabled>Applications closed</button>` : `<button class="btn btn-primary" data-apply-ws="${ws.id}">${icons.play} Apply</button>`}
            <button class="round-btn ${inList ? "on" : ""}" data-list="${ws.id}" aria-label="My List">${inList ? icons.check : icons.plus}</button>
            <button class="round-btn" data-share="/workshops#${ws.id}" aria-label="Copy link">${icons.link}</button>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-cols">
          <div>
            <div class="meta-line"><span class="match">${V.match(ws.id)}% Match</span><span>${(ws.episodes || []).length} Episodes</span><span class="rating">${esc(String(ws.level).toUpperCase())}</span><span class="hd">HD</span></div>
            <p style="font-size:16px"><b>${esc(ws.subtitle)}.</b> ${esc(ws.schedule)}.${ws.deadline ? ` Apply by ${V.fmt(ws.deadline, { month: "short", day: "numeric" })}.` : ""}</p>
          </div>
          <div class="side">
            <p>Track: <b>${esc(V.trackName(ws.track))}</b></p>
            <p>Seats: <b>${ws.seats}</b></p>
            ${ws.location ? `<p>Where: <b>${esc(ws.location)}</b></p>` : ""}
          </div>
        </div>
        <div class="episodes">
          <div class="episodes-head"><h3>Episodes</h3><span class="chip">Season 1 · ${esc(V.C.settings.season || "")}</span></div>
          ${(ws.episodes || []).map((e, i) => `
            <div class="episode"><div class="episode-n">${i + 1}</div><div class="episode-thumb">${V.art(ws.palette, ws.motif)}</div><div><h4>${esc(e.t)}</h4><p>${esc(e.s)}</p></div><div class="episode-d">${esc(e.d)}</div></div>`).join("")}
        </div>
      </div>`, { hash: ws.id });
  }

  function openTrack(id) {
    const t = V.C.tracks.find((x) => x.id === id);
    if (!t) return;
    const ws = V.C.workshops.filter((w) => w.track === id);
    openModal(`
      <div class="modal-hero">${V.art(t.palette, t.motif, { beam: true })}
        <div class="modal-hero-content">
          <div class="kicker"><img src="/assets/brand/logo.svg" alt="">Track</div>
          <h2>${esc(t.name)}</h2>
          <div class="actions"><a class="btn btn-primary" href="/apply">${icons.play} Apply to this track</a></div>
        </div>
      </div>
      <div class="modal-body">
        <div class="meta-line"><span class="match">${V.match(t.id)}% Match</span><span>${esc(t.genre)}</span></div>
        <p style="font-size:16px">${esc(t.blurb)}</p>
        <div class="chips" style="margin:16px 0 26px">${(t.skills || []).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
        ${ws.length ? `<h3 style="margin:0 0 12px">Related workshops</h3>${ws.map((w) => `<button class="status-card" style="grid-template-columns:120px 1fr" data-open="${w.id}"><div class="ev-thumb">${V.art(w.palette, w.motif, { image: w.image })}</div><div><h3>${esc(w.title)}</h3><p>${esc(w.subtitle)}</p></div></button>`).join("")}` : ""}
      </div>`);
  }

  function openAny(id) {
    if (V.C.events.some((e) => e.id === id)) return openEvent(id);
    if (V.C.workshops.some((w) => w.id === id)) return openWorkshop(id);
    if (V.C.tracks.some((t) => t.id === id)) return openTrack(id);
    if (V.C.posts.some((p) => p.id === id)) location.href = "/journal?p=" + encodeURIComponent(id);
  }

  /* ---------------- Validation ---------------- */
  function validate(form) {
    let msg = "";
    $$("[required]", form).forEach((el) => {
      if (el.offsetParent === null && el.type !== "checkbox") return;
      const ok = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
      el.classList.toggle("invalid", !ok);
      if (!ok && !msg) msg = "Please fill in all required fields.";
    });
    $$('[type="email"]', form).forEach((em) => {
      if (em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value)) { em.classList.add("invalid"); msg = msg || "Please enter a valid email."; }
    });
    $$('[type="url"]', form).forEach((u) => {
      if (u.value && !/^https?:\/\/\S+$/i.test(u.value)) { u.classList.add("invalid"); msg = msg || "Links must start with https://"; }
    });
    const first = $(".invalid", form);
    first && first.focus();
    return msg;
  }
  function wireCounters(root = document) {
    $$("textarea[maxlength]", root).forEach((ta) => {
      const c = ta.nextElementSibling;
      if (!c || !c.classList.contains("counter")) return;
      const max = +ta.getAttribute("maxlength");
      const upd = () => { c.textContent = `${ta.value.length} / ${max}`; c.classList.toggle("over", ta.value.length >= max); };
      ta.addEventListener("input", upd);
      upd();
    });
  }
  const busy = (btn, on) => { if (btn) { btn.classList.toggle("loading", on); btn.disabled = on; } };
  const demoNote = () => V.live ? "" : `<div class="demo-note">${icons.info}<span>Preview mode: the database isn't connected yet, so this is saved on this device only.</span></div>`;
  const YEARS = ["2027", "2028", "2029", "2030", "Graduate"];

  /* ---------------- RSVP ---------------- */
  function rsvpForm(id) {
    const ev = V.C.events.find((e) => e.id === id);
    if (!ev) return;
    if (Store.tickets()[id]) return showTicket(id);
    if (ev.rsvpOpen === false || V.isPast(ev)) return toast("RSVPs for this event are closed.", "error");
    const p = Store.profile() || {};
    const full = V.seatsLeft(ev) === 0;
    openModal(`
      <div class="modal-pad">
        <div class="eyebrow">${full ? "Waitlist" : "Reserve your seat"}</div>
        <h2>${esc(ev.title)}</h2>
        <p style="color:var(--muted);margin:0 0 22px">${V.fmtDate(ev)} · ${esc(ev.location)}</p>
        ${demoNote()}
        <form id="rsvp-form" novalidate>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="row2">
            <div class="field"><label for="r-name">Full name *</label><input class="input" id="r-name" name="name" required maxlength="80" value="${esc(p.name || "")}" autocomplete="name"></div>
            <div class="field"><label for="r-email">Email *</label><input class="input" id="r-email" name="email" type="email" required maxlength="160" value="${esc(p.email || "")}" placeholder="you@vanderbilt.edu" autocomplete="email"></div>
          </div>
          <div class="row2">
            <div class="field"><label for="r-year">Class year</label><select class="select" id="r-year" name="year"><option value="">Select…</option>${YEARS.map((y) => `<option ${p.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
            <div class="field"><label for="r-diet">Dietary needs</label><select class="select" id="r-diet" name="diet"><option>None</option><option>Vegetarian</option><option>Vegan</option><option>Gluten-free</option><option>Halal</option><option>Kosher</option><option>Nut allergy</option><option>Other</option></select></div>
          </div>
          <div class="field"><span class="label">What are you most interested in?</span>
            <div class="opts">${["Finance", "Film & TV", "Music", "Sports", "Gaming", "Startups"].map((o) => `<label class="opt"><input type="checkbox" name="interests" value="${o}"><span>${o}</span></label>`).join("")}</div></div>
          <div class="field"><label for="r-q">Question for the speakers (optional)</label><input class="input" id="r-q" name="question" maxlength="300"></div>
          <div class="err" id="r-err" role="alert"></div>
          <button class="btn btn-gold btn-block" style="margin-top:6px" type="submit">${full ? "Join Waitlist" : "Confirm RSVP"}</button>
          <p class="form-note">Your ticket is emailed to you and saved in My Studio. See our <a href="/privacy" style="text-decoration:underline">privacy policy</a>.</p>
        </form>
      </div>`, { size: "sm" });

    $("#rsvp-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, fd = new FormData(f), btn = $("button[type=submit]", f);
      const data = Object.fromEntries(fd);
      data.interests = fd.getAll("interests");
      const bad = validate(f);
      if (bad) { $("#r-err").textContent = bad; return; }
      busy(btn, true);
      let ticket;
      try {
        if (!V.live) throw { demo: true };
        const r = await V.api("rsvp", { eventId: id, ...data });
        ticket = r.ticket;
      } catch (err) {
        if (!err.demo) { busy(btn, false); $("#r-err").textContent = err.message; return; }
        const no = V.taken(ev) + 1;
        ticket = { token: "", code: V.demoCode("VF"), no, waitlist: full, eventId: id, name: data.name, demo: true };
      }
      const all = Store.tickets();
      all[id] = { ...ticket, ts: Date.now() };
      Store.set("rsvps", all);
      Store.remember(data);
      if (V.live) V.counts[id] = (V.counts[id] || 0) + (ticket.waitlist ? 0 : 1);
      popcorn(btn);
      toast(ticket.waitlist ? "You're on the waitlist" : "You're going! Your ticket is saved in My Studio");
      showTicket(id);
      refresh();
    });
  }

  function ticketHTML(ev, t, { stamp } = {}) {
    const tz = V.evTz(ev);
    const qrText = t.token ? V.ticketUrl(t.token) : `VFMBS-DEMO:${t.code}`;
    return `
      <div class="ticket" data-tilt>
        <div class="foil"></div>
        ${stamp ? `<div class="stamp-on ${stamp[1]}">${stamp[0]}</div>` : ""}
        <div class="ticket-main">
          <div class="ticket-top"><div class="admit">${t.waitlist ? "Waitlist · Standby" : "Admit One"} · ${esc(ev.type || "Event")}</div><img src="/assets/brand/logo.svg" alt=""></div>
          <h3>${esc(ev.title)}</h3>
          <div class="ticket-grid">
            <div><span>Date</span><b>${ev.date ? V.fmt(ev.date, { month: "short", day: "numeric" }, tz) : "TBA"}</b></div>
            <div><span>Doors</span><b>${ev.date ? V.fmt(ev.date, { hour: "numeric", minute: "2-digit" }, tz) : "TBA"}</b></div>
            <div><span>${t.waitlist ? "Waitlist" : "Admission"}</span><b>No. ${V.pad(t.no || 0, 3)}</b></div>
            <div style="grid-column:span 2"><span>Venue</span><b>${esc(ev.location || "")}</b></div>
            <div><span>Guest</span><b>${esc(String(t.name || "").split(" ")[0])}</b></div>
          </div>
        </div>
        <div class="ticket-stub">${V.qr(qrText, { dark: "#1a1408" })}<div class="code">${esc(t.code)}</div></div>
      </div>`;
  }

  function showTicket(id) {
    const ev = V.C.events.find((e) => e.id === id);
    const t = Store.tickets()[id];
    if (!ev || !t) return;
    openModal(`
      <div class="modal-pad">
        <div class="eyebrow">${t.waitlist ? "You're on the list" : "You're going"}</div>
        <h2 style="margin-bottom:22px">${t.waitlist ? "Standby confirmed." : "See you at the premiere."}</h2>
        ${t.demo ? demoNote() : ""}
        ${ticketHTML(ev, t)}
        <div class="ticket-tools" style="margin-top:22px">
          ${t.token ? `<a class="btn btn-primary btn-sm" href="/ticket?t=${encodeURIComponent(t.token)}">${icons.ticket} Open full ticket</a>` : ""}
          <button class="btn btn-outline btn-sm" data-ics="${ev.id}">${icons.cal} Add to calendar</button>
          <button class="btn btn-outline btn-sm" data-cancel="${ev.id}" style="margin-left:auto">Cancel RSVP</button>
        </div>
      </div>`, { size: "sm" });
  }

  async function cancelRsvp(id) {
    if (!confirm("Cancel your RSVP? Your seat will be released.")) return;
    const t = Store.tickets()[id];
    if (t?.token && V.live) {
      try { await V.api("rsvp", { action: "cancel", t: t.token }); V.counts[id] = Math.max(0, (V.counts[id] || 1) - (t.waitlist ? 0 : 1)); }
      catch (e) { if (e.status !== 404) return toast(e.message, "error"); }
    }
    const all = Store.tickets();
    delete all[id];
    Store.set("rsvps", all);
    toast("RSVP cancelled");
    closeModal();
    refresh();
  }

  function downloadICS(id) {
    const ev = V.C.events.find((e) => e.id === id);
    if (!ev) return;
    const z = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const clean = (s) => String(s || "").replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VFMBS//Events//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:${ev.id}@vfmbs`, `DTSTAMP:${z(Date.now())}`, `DTSTART:${z(ev.date)}`, `DTEND:${z(ev.end || ev.date)}`,
      `SUMMARY:${clean(ev.title)} (VFMBS)`, `LOCATION:${clean(ev.location)}`, `DESCRIPTION:${clean(ev.desc)}`, `URL:${location.origin}/events#${ev.id}`, "END:VEVENT", "END:VCALENDAR"];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    a.download = ev.id + ".ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Calendar invite downloaded");
  }

  /* ---------------- Workshop application ---------------- */
  function applyWorkshop(id) {
    const ws = V.C.workshops.find((w) => w.id === id);
    if (!ws) return;
    if (Store.wsApps()[id]) return toast("You've already applied. Check My Studio.");
    if (ws.open === false || new Date(ws.deadline) < new Date()) return toast("Applications for this workshop are closed.", "error");
    const p = Store.profile() || {};
    openModal(`
      <div class="modal-pad">
        <div class="eyebrow">Workshop application</div>
        <h2>${esc(ws.title)}</h2>
        <p style="color:var(--muted);margin:0 0 22px">${esc(ws.schedule)}${ws.deadline ? ` · Deadline ${V.fmt(ws.deadline, { month: "short", day: "numeric" })}` : ""}</p>
        ${demoNote()}
        <form id="ws-form" novalidate>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="row2">
            <div class="field"><label for="w-name">Full name *</label><input class="input" id="w-name" name="name" required maxlength="80" value="${esc(p.name || "")}" autocomplete="name"></div>
            <div class="field"><label for="w-email">Email *</label><input class="input" id="w-email" name="email" type="email" required value="${esc(p.email || "")}" autocomplete="email"></div>
          </div>
          <div class="row2">
            <div class="field"><label for="w-year">Class year *</label><select class="select" id="w-year" name="year" required><option value="">Select…</option>${YEARS.map((y) => `<option ${p.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
            <div class="field"><label for="w-major">Major(s) *</label><input class="input" id="w-major" name="major" required maxlength="120"></div>
          </div>
          <div class="field"><span class="label">Experience with this topic</span>
            <div class="opts">${["None, and excited", "Some coursework", "Internship / project", "I could teach it"].map((o, i) => `<label class="opt"><input type="radio" name="exp" value="${o}" ${i === 0 ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
          <div class="field"><label for="w-why">Why this workshop? *</label><textarea class="textarea" id="w-why" name="why" required maxlength="600"></textarea><div class="counter"></div></div>
          <label class="check" style="margin-bottom:16px"><input type="checkbox" name="commit" required> I can attend at least ${Math.max(1, (ws.episodes || []).length - 1)} of ${(ws.episodes || []).length} sessions.</label>
          <div class="err" id="w-err" role="alert"></div>
          <button class="btn btn-gold btn-block" style="margin-top:6px" type="submit">Submit application</button>
        </form>
      </div>`, { size: "sm", onOpen: (m) => wireCounters(m) });

    $("#ws-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, btn = $("button[type=submit]", f);
      const bad = validate(f);
      if (bad) { $("#w-err").textContent = bad; return; }
      const data = Object.fromEntries(new FormData(f));
      busy(btn, true);
      let rec;
      try {
        if (!V.live) throw { demo: true };
        const r = await V.api("workshop", { workshopId: id, ...data });
        rec = { code: r.code, token: r.token };
      } catch (err) {
        if (!err.demo) { busy(btn, false); $("#w-err").textContent = err.message; return; }
        rec = { code: V.demoCode("WS"), demo: true };
      }
      const all = Store.wsApps();
      all[id] = { ...rec, status: "review", ts: Date.now() };
      Store.set("ws", all);
      Store.remember(data);
      confetti();
      openModal(`
        <div class="modal-pad wrap-screen">
          ${clapperSVG()}
          <div class="eyebrow center">Application received</div>
          <h2>You're in the pitch meeting.</h2>
          <p style="color:var(--muted)">We'll review your application for <b style="color:#fff">${esc(ws.title)}</b> and email decisions after the deadline. Confirmation: <b style="color:var(--gold);font-family:var(--mono)">${esc(rec.code)}</b></p>
          <div class="actions" style="justify-content:center;margin-top:20px"><a class="btn btn-primary btn-sm" href="/portal">Track status</a><button class="btn btn-outline btn-sm" data-close>Keep browsing</button></div>
        </div>`, { size: "sm" });
      refresh();
    });
  }

  const clapperSVG = () => `<svg class="clapper" viewBox="0 0 200 170" aria-hidden="true"><rect x="20" y="60" width="160" height="100" rx="6" fill="#111" stroke="#cfae70" stroke-width="3"/><path d="M20 90h160" stroke="#cfae70" stroke-width="2"/><text x="100" y="135" text-anchor="middle" fill="#f2ede4" font-family="Bebas Neue, sans-serif" font-size="30" letter-spacing="3">THAT'S A WRAP</text><g class="top"><path d="M20 60 26 20 184 8 178 48Z" fill="#111" stroke="#cfae70" stroke-width="3"/><path d="M50 20 62 54M90 17l12 34M130 14l12 34M168 11l8 30" stroke="#f2ede4" stroke-width="10"/></g></svg>`;

  /* ---------------- Popcorn & confetti ---------------- */
  const KERNEL = `<svg viewBox="0 0 20 20"><circle cx="7" cy="8" r="5" fill="#f7f1e3"/><circle cx="13" cy="7" r="4.5" fill="#fffaf0"/><circle cx="10" cy="12" r="5" fill="#f2ead8"/><circle cx="10" cy="10" r="1.6" fill="#cfae70"/></svg>`;
  function popcorn(from, n = 26) {
    if (V.reduced) return;
    const r = from?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const k = document.createElement("i");
      k.className = "kernel";
      k.innerHTML = KERNEL;
      document.body.append(k);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 160 + Math.random() * 240;
      const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
      const s = 0.7 + Math.random() * 0.9, rot = (Math.random() - 0.5) * 720;
      k.animate([
        { transform: `translate(${x0}px,${y0}px) scale(0.2) rotate(0)`, opacity: 1 },
        { transform: `translate(${x0 + dx}px,${y0 + dy}px) scale(${s}) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${x0 + dx * 1.5}px,${y0 + dy + 520}px) scale(${s}) rotate(${rot}deg)`, opacity: 0 },
      ], { duration: 1300 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => k.remove();
    }
  }
  function confetti(n = 90) {
    if (V.reduced) return;
    const cols = ["#cfae70", "#f2ede4", "#e6cc94", "#ffffff", "#8a6d35"];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("i");
      c.className = "conf";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cols[i % cols.length];
      c.style.animationDuration = 1.8 + Math.random() * 2 + "s";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      document.body.append(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  /* ---------------- Newsletter ---------------- */
  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("form[data-signup]");
    if (!f) return;
    e.preventDefault();
    const em = $("input[type=email]", f), btn = $("button", f);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value)) { em.classList.add("invalid"); return toast("Please enter a valid email", "error"); }
    busy(btn, true);
    try {
      if (V.live) await V.api("subscribe", { email: em.value, source: f.dataset.signup, website: $(".hp", f)?.value });
      em.value = "";
      em.classList.remove("invalid");
      toast("You're on the list. Coming soon to your inbox.");
      popcorn(btn, 14);
    } catch (err) { toast(err.message, "error"); }
    busy(btn, false);
  });

  /* ---------------- Search ---------------- */
  function initSearch() {
    const box = $(".search"), input = $("input", box), res = $(".search-results", box);
    const open = () => { box.classList.add("open"); document.body.classList.add("locked"); setTimeout(() => input.focus(), 50); run(); };
    const close = () => { box.classList.remove("open"); if (!$(".modal-root.open")) document.body.classList.remove("locked"); };
    const run = () => {
      if (!V.C) return;
      const q = input.value.trim().toLowerCase();
      const hay = (o) => JSON.stringify(o).toLowerCase();
      const items = [...V.C.events.filter((e) => !V.isPast(e)), ...V.C.workshops, ...V.C.tracks, ...V.C.posts].filter((x) => !q || hay(x).includes(q) || (x.track && V.trackName(x.track).toLowerCase().includes(q)));
      res.innerHTML = items.map((x) => x.body !== undefined ? `<article class="card" style="--w:auto" data-post="${x.id}"><a href="/journal?p=${encodeURIComponent(x.id)}" class="card-media" style="display:block">${V.art(x.palette, x.motif, { image: x.image })}<span class="card-tag">Journal</span><div class="card-label">${esc(x.title)}</div></a></article>` : anyCard(x)).join("");
      res.nextElementSibling?.classList.contains("search-empty") && res.nextElementSibling.remove();
      if (!items.length) res.insertAdjacentHTML("afterend", `<p class="search-empty">Your search for "${esc(q)}" did not have any matches. Try "finance", "trek" or "pitch".</p>`);
    };
    input.addEventListener("input", run);
    $$(".search-hint button", box).forEach((b) => b.addEventListener("click", () => { input.value = b.textContent; run(); }));
    document.addEventListener("click", (e) => { if (e.target.closest("[data-search]")) open(); });
    $("[data-search-close]", box).addEventListener("click", close);
    res.addEventListener("click", (e) => { if (e.target.closest("[data-open],[data-rsvp],[data-apply-ws],a")) close(); }, true);
    addEventListener("keydown", (e) => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); open(); }
      if (e.key === "Escape") { if (box.classList.contains("open")) close(); else if ($(".mobile-menu.open")) $(".nav-toggle").click(); else closeModal(); }
    });
    return { rerun: () => box.classList.contains("open") && run() };
  }

  /* ---------------- Delegation ---------------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-rsvp],[data-list],[data-open],[data-apply-ws],[data-ics],[data-ticket],[data-cancel],[data-close],[data-like],[data-share],.modal-backdrop");
    if (!t || !V.C) return;
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
    else if (d.share) { navigator.clipboard?.writeText(location.origin + d.share).then(() => toast("Link copied"), () => toast(location.origin + d.share)); }
    else if ("like" in d) { t.classList.toggle("on"); if (t.classList.contains("on")) { toast("Rated. We'll show you more like this."); popcorn(t, 10); } }
    else if (d.open) openAny(d.open);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches(".card[data-open]")) openAny(e.target.dataset.open); });

  /* ---------------- Scroll bits ---------------- */
  function initScroll() {
    const nav = $(".nav"), bar = $(".progress-bar");
    let lastY = scrollY;
    const on = () => {
      const y = scrollY;
      nav.classList.toggle("solid", y > 40);
      nav.classList.toggle("hide", y > 500 && y > lastY + 4 && !$(".mobile-menu.open"));
      if (y < lastY - 4 || y < 500) nav.classList.remove("hide");
      lastY = y;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    };
    addEventListener("scroll", on, { passive: true });
    on();
  }
  let io;
  function reveal(root = document) {
    io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal:not(.in), .img-reveal:not(.in), [data-split]:not(.in)", root).forEach((el) => io.observe(el));
  }
  function counters(root = document) {
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, to = +el.dataset.countTo, t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1800); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); p < 1 && requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.5 });
    $$("[data-count-to]", root).forEach((el) => cio.observe(el));
  }
  function countdown(el, iso) {
    if (!el || !iso) return;
    const tick = () => {
      let s = Math.max(0, (new Date(iso) - Date.now()) / 1000);
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s = Math.floor(s - m * 60);
      el.innerHTML = [[d, "Days"], [h, "Hours"], [m, "Min"], [s, "Sec"]].map(([n, l]) => `<div><b>${V.pad(n)}</b><span>${l}</span></div>`).join("");
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Refresh hooks ---------------- */
  const refreshers = [];
  let searchApi;
  function refresh() { refreshers.forEach((f) => f()); updateBadge(); searchApi?.rerun(); }

  Object.assign(V, {
    toast, openModal, closeModal, eventCard, workshopCard, trackCard, postCard, anyCard, rowHTML, wireRow, openEvent, openWorkshop, openTrack, openAny,
    rsvpForm, showTicket, ticketHTML, cancelRsvp, applyWorkshop, validate, wireCounters, clapperSVG, confetti, popcorn, busy, demoNote,
    reveal, counters, countdown, onRefresh: (f) => refreshers.push(f), refresh, YEARS,
  });

  /* ---------------- Boot ---------------- */
  if (page !== "admin") {
    $$("[data-motif]").forEach((el) => (el.innerHTML = V.motifs[el.dataset.motif] || ""));
    renderNav();
    searchApi = initSearch();
    initScroll();
    updateBadge();
    V.onChange(updateBadge);
    V.ready.then(() => {
      renderAnnouncement();
      renderFooter();
      requestAnimationFrame(() => { reveal(); counters(); });
      const h = decodeURIComponent(location.hash.slice(1));
      if (h && V.byId(h) && !V.byId(h).body) setTimeout(() => openAny(h), V.introPlaying ? 3600 : 350);
    });
  }
})();
