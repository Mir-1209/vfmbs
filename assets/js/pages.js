/* =========================================================================
   VFMBS page controllers
   ========================================================================= */
(() => {
  const A = window.App;
  const { D, $, $$, esc, icons, art, vars, Store } = A;
  const page = document.body.dataset.page;

  /* =====================================================================
     HOME
     ===================================================================== */
  function home() {
    // Billboard
    const bb = $("#billboard");
    const SLIDE_MS = 8000;
    bb.style.setProperty("--slide-ms", SLIDE_MS + "ms");
    bb.innerHTML = D.featured.map((f, i) => `
      <div class="slide ${i === 0 ? "active" : ""}" data-i="${i}">
        <div class="slide-art">${art(f.palette, f.motif, { beam: true })}</div>
        <div class="slide-content">
          <div class="kicker"><span class="n-logo">V</span>${esc(f.kicker)}</div>
          <h1 class="slide-title">${esc(f.title)}</h1>
          <p class="slide-tagline">${esc(f.tagline)}</p>
          <div class="meta-line"><span class="match">${A.match(f.id)}% Match</span>${f.meta.map((m) => `<span>${esc(m)}</span>`).join("")}<span class="rating">${esc(f.rating)}</span></div>
          <p class="slide-desc">${esc(f.desc)}</p>
          <div class="slide-actions">
            <a class="btn btn-primary" href="${f.cta.href}">${icons.play} ${esc(f.cta.label)}</a>
            <a class="btn btn-ghost" href="${f.info}">${icons.info} More Info</a>
          </div>
        </div>
      </div>`).join("") + `
      <div class="slide-side"><button class="round-btn" id="bb-replay" aria-label="Replay">${icons.replay}</button><span class="maturity">Rated ${esc(D.featured[0].rating)}</span></div>
      <div class="slide-dots">${D.featured.map((_, i) => `<button aria-label="Slide ${i + 1}" class="${i === 0 ? "active" : ""}"><i></i></button>`).join("")}</div>`;
    let cur = 0, timer;
    const slides = $$(".slide", bb), dots = $$(".slide-dots button", bb), mat = $(".maturity", bb);
    const go = (i) => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === cur));
      dots.forEach((d, k) => { d.classList.remove("active"); void d.offsetWidth; d.classList.toggle("active", k === cur); });
      mat.textContent = "Rated " + D.featured[cur].rating;
      clearTimeout(timer);
      timer = setTimeout(() => go(cur + 1), SLIDE_MS);
    };
    dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
    $("#bb-replay").addEventListener("click", () => go(0));
    go(0);

    // Ticker
    const items = D.ticker.map(([k, v]) => `<span class="ticker-item"><b>${esc(k)}</b><span class="${v.startsWith("▲") ? "up" : "down"}">${esc(v)}</span></span>`).join("");
    $("#ticker").innerHTML = `<span class="ticker-label"><span class="live"></span>VFMBS INDEX</span><div class="ticker-track">${items}${items}</div>`;

    // Rows
    const renderRows = () => {
      const upcoming = D.events.filter((e) => !A.isPast(e));
      const mine = Store.list().map(A.byId).filter(Boolean);
      const rows = [];
      if (mine.length) rows.push(A.rowHTML("My List", mine.map((x) => (x.episodes ? A.workshopCard(x) : x.skills ? trackCard(x) : A.eventCard(x))).join(""), "portal.html"));
      rows.push(A.rowHTML("Upcoming Premieres", upcoming.map(A.eventCard).join(""), "events.html"));
      rows.push(A.rowHTML("Workshops: Now Enrolling", D.workshops.map(A.workshopCard).join(""), "workshops.html"));
      rows.push(A.rowHTML("Top 10 Reasons to Join VFMBS Today", D.top10.map((t, i) => `
        <div class="top-card"><span class="top-num">${i + 1}</span>
          <div class="top-poster">${art(Object.keys(D.palettes)[i % 8], Object.keys(A.motifs)[(i * 3) % 16])}<p>${esc(t)}</p></div></div>`).join("")));
      rows.push(A.rowHTML("Speaker Series &amp; Treks", upcoming.filter((e) => /Speaker|Trek/.test(e.type)).map(A.eventCard).join(""), "events.html"));
      rows.push(A.rowHTML("Choose Your Track", D.tracks.map(trackCard).join(""), "about.html#tracks"));
      $("#rows").innerHTML = rows.join("");
      $$("#rows .row").forEach(A.wireRow);
      A.reveal($("#rows"));
    };
    const trackCard = (t) => `
      <article class="card" data-open="${t.id}" tabindex="0" aria-label="${esc(t.name)}">
        <div class="card-media">${art(t.palette, t.motif)}<span class="card-tag">Track</span><div class="card-label">${esc(t.name)}</div></div>
        <div class="card-details">
          <div class="card-actions"><a class="round-btn filled" href="apply.html" aria-label="Apply">${icons.play}</a><button class="round-btn ${Store.list().includes(t.id) ? "on" : ""}" data-list="${t.id}" aria-label="My List">${Store.list().includes(t.id) ? icons.check : icons.plus}</button><span class="spacer"></span><button class="round-btn" data-open="${t.id}" aria-label="More">${icons.chevDown}</button></div>
          <div class="card-meta"><span class="match">${A.match(t.id)}% Match</span></div>
          <div class="card-genres">${t.genre.split(" · ").map((g) => `<span>${esc(g)}</span>`).join("")}</div>
        </div>
      </article>`;
    renderRows();
    A.onRefresh(renderRows);
    A.onChange(() => { clearTimeout(renderRows.t); renderRows.t = setTimeout(renderRows, 400); });

    // Stats
    $("#stats").innerHTML = D.stats.map((s) => `<div class="stat reveal"><div class="stat-n"><span data-count="${s.n}">0</span><small>${s.suffix}</small></div><div class="stat-l">${esc(s.label)}</div></div>`).join("");

    // Tracks
    $("#tracks").innerHTML = D.tracks.map((t, i) => `
      <a class="track reveal reveal-d${i}" style="${vars(t.palette)}" href="#" data-open="${t.id}">
        ${art(t.palette, t.motif)}
        <span class="track-no">TRACK 0${i + 1}</span>
        <h3>${esc(t.name)}</h3>
        <div class="genre">${esc(t.genre)}</div>
        <p>${esc(t.blurb)}</p>
        <div class="chips">${t.skills.slice(0, 3).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
      </a>`).join("");

    simulator();

    // Reviews
    $("#reviews").innerHTML = D.reviews.map((r, i) => `<div class="review reveal reveal-d${i}"><div class="stars">${"★".repeat(r.stars)}</div><blockquote>“${esc(r.q)}”</blockquote><cite>${esc(r.who)}</cite></div>`).join("");

    // FAQ
    $("#faq-list").innerHTML = D.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
    $$("#faq-list details").forEach((d) => d.addEventListener("toggle", () => { if (d.open) $$("#faq-list details").forEach((o) => o !== d && (o.open = false)); }));

    // Countdown
    A.countdown($("#countdown"), D.config.applicationDeadline);

    // Newsletter
    $$(".signup").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const em = $("input", f);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.classList.add("invalid"); A.toast("Enter a valid email", "error"); return; }
      const subs = Store.get("subs", []);
      subs.push(em.value);
      Store.set("subs", subs);
      A.send("newsletter", { email: em.value });
      em.value = "";
      A.toast("You're on the list. Coming soon to your inbox.");
    }));
  }

  /* ---------- Greenlight simulator: film financing waterfall ---------- */
  function simulator() {
    const root = $("#sim");
    if (!root) return;
    const st = { budget: 40, pa: 25, genre: "Horror", release: "Theatrical" };
    const genres = { Horror: 3.6, Comedy: 2.2, Drama: 1.6, Action: 2.6, Animation: 3.0 };
    const releases = { Theatrical: 1, Streaming: 0.75, Hybrid: 0.9 };
    root.innerHTML = `
      <div class="sim-controls">
        <div class="eyebrow">Interactive</div>
        <h3 class="h2" style="font-size:clamp(36px,4vw,56px)">Greenlight <em>or</em> Pass?</h3>
        <p style="color:var(--muted);margin:0 0 26px">You're the studio. Set the budget, pick a genre and a release strategy, and see how the money flows. This is the kind of model you'll build in the Deal Room.</p>
        <div class="range"><div class="range-top"><span>Production budget</span><output id="o-budget"></output></div><input type="range" min="2" max="250" value="${st.budget}" id="s-budget" aria-label="Production budget"></div>
        <div class="range"><div class="range-top"><span>Prints &amp; advertising</span><output id="o-pa"></output></div><input type="range" min="1" max="150" value="${st.pa}" id="s-pa" aria-label="Marketing spend"></div>
        <div class="range"><div class="range-top"><span>Genre</span></div><div class="seg" id="s-genre">${Object.keys(genres).map((g) => `<button class="${g === st.genre ? "on" : ""}">${g}</button>`).join("")}</div></div>
        <div class="range"><div class="range-top"><span>Release strategy</span></div><div class="seg" id="s-rel">${Object.keys(releases).map((g) => `<button class="${g === st.release ? "on" : ""}">${g}</button>`).join("")}</div></div>
      </div>
      <div class="sim-out">
        <div class="sim-verdict" id="o-verdict"></div>
        <div style="font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--muted)">PROJECTED STUDIO PROFIT</div>
        <div class="sim-big" id="o-profit"></div>
        <div class="sim-grid">
          <div><span>Worldwide gross</span><b id="o-gross"></b></div>
          <div><span>ROI</span><b id="o-roi"></b></div>
          <div><span>Cost-to-gross ratio</span><b id="o-be"></b></div>
          <div><span>Opening weekend</span><b id="o-ow"></b></div>
        </div>
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--dim)">REVENUE WATERFALL ($M)</div>
        <div class="waterfall" id="o-wf"></div>
        <p style="font-size:11px;color:var(--dim);margin:14px 0 0">Simplified illustrative model: theatrical rentals ≈50% of gross, plus ancillary windows. Not financial advice, just very fun math.</p>
      </div>`;
    const m = (n) => (n < 0 ? "−" : "") + "$" + Math.abs(n).toFixed(Math.abs(n) < 10 ? 1 : 0) + "M";
    const calc = () => {
      // Diminishing returns on spend; genre multiplier; release discount
      const g = genres[st.genre], r = releases[st.release];
      const base = Math.pow(st.budget, 0.82) * g * 1.35 + Math.pow(st.pa, 0.9) * 1.9 * g * 0.55;
      const gross = base * r * (st.release === "Streaming" ? 0.35 : 1);
      const rentals = gross * 0.5;
      const ancillary = gross * 0.38 + (st.release !== "Theatrical" ? st.budget * 0.55 : 0);
      const dist = (rentals + ancillary) * 0.12;
      const profit = rentals + ancillary - dist - st.budget - st.pa;
      return { gross, rentals, ancillary, dist, profit, roi: (profit / (st.budget + st.pa)) * 100, be: (st.budget + st.pa) / (gross || 1) };
    };
    const draw = () => {
      const r = calc();
      $("#o-budget").textContent = "$" + st.budget + "M";
      $("#o-pa").textContent = "$" + st.pa + "M";
      $$("#sim input[type=range]").forEach((el) => el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min)) * 100 + "%"));
      $("#o-profit").textContent = m(r.profit);
      $("#o-profit").style.color = r.profit >= 0 ? "var(--green)" : "var(--red-2)";
      $("#o-gross").textContent = m(r.gross);
      $("#o-roi").textContent = (r.roi >= 0 ? "+" : "") + r.roi.toFixed(0) + "%";
      $("#o-be").textContent = r.be.toFixed(2) + "×";
      $("#o-ow").textContent = st.release === "Streaming" ? "N/A" : m(r.gross * (st.genre === "Horror" ? 0.38 : 0.3));
      const v = $("#o-verdict");
      const [txt, col] = r.roi > 60 ? ["GREENLIT ✦ FRANCHISE", "var(--green)"] : r.roi > 0 ? ["GREENLIT", "var(--gold)"] : r.roi > -25 ? ["DEVELOPMENT HELL", "#ffc75a"] : ["PASS", "var(--red-2)"];
      v.textContent = txt; v.style.color = col;
      const parts = [["Rentals", r.rentals, "var(--gold)"], ["Ancillary", r.ancillary, "var(--gold-2)"], ["Dist. fee", -r.dist, "#666"], ["Budget", -st.budget, "var(--red)"], ["P&A", -st.pa, "var(--red-2)"], ["Profit", r.profit, r.profit >= 0 ? "var(--green)" : "var(--red-2)"]];
      const max = Math.max(...parts.map((p) => Math.abs(p[1])), 1);
      $("#o-wf").innerHTML = parts.map(([l, v, c]) => `<div class="bar"><i style="height:${Math.max(2, (Math.abs(v) / max) * 100)}%;background:${c};opacity:${v < 0 ? 0.75 : 1}"></i><span>${l}</span></div>`).join("");
    };
    $("#s-budget").addEventListener("input", (e) => { st.budget = +e.target.value; draw(); });
    $("#s-pa").addEventListener("input", (e) => { st.pa = +e.target.value; draw(); });
    const seg = (id, key) => $$(`#${id} button`).forEach((b) => b.addEventListener("click", () => { st[key] = b.textContent; $$(`#${id} button`).forEach((x) => x.classList.toggle("on", x === b)); draw(); }));
    seg("s-genre", "genre");
    seg("s-rel", "release");
    draw();
  }

  /* =====================================================================
     EVENTS
     ===================================================================== */
  function events() {
    const types = ["All", ...new Set(D.events.map((e) => e.type)), "My RSVPs"];
    let filter = "All", view = "list", q = "", month = null;
    $("#filters").innerHTML = types.map((t) => `<button class="filter ${t === "All" ? "on" : ""}">${t}</button>`).join("");
    $$("#filters .filter").forEach((b) => b.addEventListener("click", () => { filter = b.textContent; $$("#filters .filter").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
    $$("#view button").forEach((b) => b.addEventListener("click", () => { view = b.dataset.v; $$("#view button").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
    $("#ev-q").addEventListener("input", (e) => { q = e.target.value.toLowerCase(); render(); });

    const list = () => D.events
      .filter((e) => filter === "All" || e.type === filter || (filter === "My RSVPs" && Store.rsvps()[e.id]))
      .filter((e) => !q || JSON.stringify(e).toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const render = () => {
      const out = $("#ev-out");
      const evs = list();
      if (view === "cal") return renderCal(out, evs);
      if (!evs.length) { out.innerHTML = `<div class="empty">No screenings match. ${filter === "My RSVPs" ? "RSVP to an event and it'll show up here." : "Try another filter."}</div>`; return; }
      out.innerHTML = `<div class="ev-list">${evs.map((ev) => {
        const tz = A.evTz(ev), going = Store.rsvps()[ev.id], left = A.seatsLeft(ev), past = A.isPast(ev);
        return `
        <article class="ev reveal ${past ? "past" : ""}" id="${ev.id}">
          <div class="ev-date"><div class="m">${A.fmt(ev.date, { month: "short" }, tz).toUpperCase()}</div><div class="d">${A.fmt(ev.date, { day: "numeric" }, tz)}</div><div class="w">${A.fmt(ev.date, { weekday: "long" }, tz)}</div></div>
          <button class="ev-thumb" data-open="${ev.id}" aria-label="Details for ${esc(ev.title)}">${art(ev.palette, ev.motif)}</button>
          <div>
            <div class="ev-type">${esc(ev.type)} ${ev.tags.map((t) => ` · ${esc(t)}`).join("")}</div>
            <h3>${esc(ev.title)}</h3>
            <div class="ev-info"><span>${icons.clock}${A.fmtTime(ev)}</span><span>${icons.pin}${esc(ev.location)}</span></div>
            <div class="ev-cap"><div class="seat-bar"><i style="width:${(A.seatsTaken(ev) / ev.capacity) * 100}%"></i></div><span class="${left <= 10 ? "hot" : ""}">${left ? `${left} of ${ev.capacity} seats left` : "Sold out · waitlist open"}</span></div>
          </div>
          <div class="ev-actions">
            ${past ? `<button class="btn btn-outline btn-sm" disabled>Ended</button>` : going ? `<span class="going">${icons.check} You're going</span><button class="btn btn-primary btn-sm" data-ticket="${ev.id}">View ticket</button>` : `<button class="btn btn-red btn-sm" data-rsvp="${ev.id}">${left ? "RSVP" : "Join waitlist"}</button>`}
            <button class="btn btn-outline btn-sm" data-open="${ev.id}">Details</button>
          </div>
        </article>`;
      }).join("")}</div>`;
      A.reveal(out);
    };

    const renderCal = (out, evs) => {
      if (!month) {
        const first = evs.find((e) => !A.isPast(e)) || evs[0] || D.events[0];
        const d = new Date(first.date);
        month = new Date(d.getFullYear(), d.getMonth(), 1);
      }
      const y = month.getFullYear(), mo = month.getMonth();
      const start = new Date(y, mo, 1 - new Date(y, mo, 1).getDay());
      const today = new Date().toDateString();
      const cells = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const key = d.toDateString();
        const day = evs.filter((e) => {
          const s = new Date(A.fmt(e.date, { year: "numeric", month: "2-digit", day: "2-digit" }, A.evTz(e)));
          const en = new Date(A.fmt(e.end, { year: "numeric", month: "2-digit", day: "2-digit" }, A.evTz(e)));
          return d >= s && d <= en;
        });
        cells.push(`<div class="cal-day ${d.getMonth() !== mo ? "muted" : ""} ${key === today ? "today" : ""}"><div class="num">${d.getDate()}</div>${day.map((e) => `<button class="cal-ev ${Store.rsvps()[e.id] ? "mine" : ""}" style="${vars(e.palette)}" data-open="${e.id}" title="${esc(e.title)}">${esc(e.title)}</button>`).join("")}</div>`);
      }
      out.innerHTML = `<div class="cal">
        <div class="cal-head"><button class="icon-btn" id="cal-prev" aria-label="Previous month">${icons.chevL}</button><h3>${month.toLocaleString("en-US", { month: "long", year: "numeric" })}</h3><button class="icon-btn" id="cal-next" aria-label="Next month">${icons.chevR}</button></div>
        <div class="cal-grid">${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => `<div class="cal-dow">${d}</div>`).join("")}${cells.join("")}</div></div>`;
      $("#cal-prev").addEventListener("click", () => { month = new Date(y, mo - 1, 1); render(); });
      $("#cal-next").addEventListener("click", () => { month = new Date(y, mo + 1, 1); render(); });
    };

    // Next-up hero
    const next = D.events.filter((e) => !A.isPast(e)).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    if (next) {
      $("#next-up").innerHTML = `<div class="eyebrow">Next up · ${A.fmtDate(next)}</div><h2 class="h2">${esc(next.title)}</h2><div class="countdown" id="ev-count" style="justify-content:flex-start"></div><div class="slide-actions"><button class="btn btn-primary" data-rsvp="${next.id}">${icons.play} RSVP</button><button class="btn btn-ghost" data-open="${next.id}">${icons.info} Details</button></div>`;
      A.countdown($("#ev-count"), next.date);
    }
    render();
    A.onRefresh(render);
  }

  /* =====================================================================
     WORKSHOPS
     ===================================================================== */
  function workshops() {
    let track = "all", level = "all";
    $("#ws-tracks").innerHTML = [["all", "All tracks"], ...D.tracks.map((t) => [t.id, t.name])].map(([id, n]) => `<button class="filter ${id === "all" ? "on" : ""}" data-t="${id}">${esc(n)}</button>`).join("");
    $$("#ws-tracks .filter").forEach((b) => b.addEventListener("click", () => { track = b.dataset.t; $$("#ws-tracks .filter").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
    $("#ws-level").addEventListener("change", (e) => { level = e.target.value; render(); });
    const render = () => {
      const list = D.workshops.filter((w) => (track === "all" || w.track === track) && (level === "all" || w.level === level));
      $("#ws-out").innerHTML = list.length ? list.map((ws, i) => {
        const app = Store.wsApps()[ws.id];
        const closed = new Date(ws.deadline) < new Date();
        const days = Math.ceil((new Date(ws.deadline) - Date.now()) / 864e5);
        return `
        <article class="ws reveal reveal-d${i % 3}" style="${vars(ws.palette)}" id="${ws.id}">
          <button class="ws-media" data-open="${ws.id}" aria-label="Episodes for ${esc(ws.title)}">${art(ws.palette, ws.motif)}<span class="card-tag">${esc(A.trackName(ws.track))}</span>${ws.applied > ws.seats ? `<span class="card-flag">HOT</span>` : ""}<div class="card-label">${esc(ws.title)}</div></button>
          <div class="ws-body">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3>${esc(ws.subtitle)}</h3></div>
            <div class="sub">${esc(ws.schedule)}</div>
            <div class="ws-facts"><div><span>Level</span><b>${esc(ws.level)}</b></div><div><span>Seats</span><b>${ws.seats}</b></div><div><span>Deadline</span><b style="${days <= 5 && !closed ? "color:var(--red-2)" : ""}">${closed ? "Closed" : days <= 1 ? "Today" : days + " days"}</b></div></div>
            <div class="seat-bar" title="Demand"><i style="width:${Math.min(100, (ws.applied / ws.seats) * 50)}%;background:var(--a3)"></i></div>
            <div style="font-size:12px;color:var(--muted)">${ws.applied + (app ? 1 : 0)} applicants for ${ws.seats} seats${app ? ` · <span class="status-pill st-review">Under review</span>` : ""}</div>
            <div class="ws-foot">
              ${app ? `<a class="btn btn-outline btn-sm" href="portal.html">View status</a>` : closed ? `<button class="btn btn-outline btn-sm" disabled>Closed</button>` : `<button class="btn btn-gold btn-sm" data-apply-ws="${ws.id}">Apply</button>`}
              <button class="btn btn-outline btn-sm" data-open="${ws.id}">${ws.episodes.length} Episodes</button>
            </div>
          </div>
        </article>`;
      }).join("") : `<div class="empty">No workshops match those filters.</div>`;
      A.reveal($("#ws-out"));
    };
    render();
    A.onRefresh(render);
  }

  /* =====================================================================
     ABOUT
     ===================================================================== */
  function about() {
    $("#tracks-grid").innerHTML = D.tracks.map((t, i) => `
      <a class="track reveal reveal-d${i}" style="${vars(t.palette)}" href="#" data-open="${t.id}">
        ${art(t.palette, t.motif)}<span class="track-no">TRACK 0${i + 1}</span><h3>${esc(t.name)}</h3><div class="genre">${esc(t.genre)}</div><p>${esc(t.blurb)}</p>
        <div class="chips">${t.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></a>`).join("");
    const trk = (id) => D.tracks.find((t) => t.id === id) || D.tracks[0];
    $("#cast").innerHTML = D.board.map((b, i) => {
      const t = trk(b.track);
      const ini = b.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
      return `<div class="cast-card reveal reveal-d${i % 4}" style="${vars(t.palette)}">${art(t.palette, null)}<div class="initials">${esc(ini)}</div><div class="cast-info"><div class="r">${esc(b.role)}</div><div class="n">${esc(b.name)} <span style="color:var(--muted);font-weight:400">${esc(b.year)}</span></div></div></div>`;
    }).join("");
    $("#stats").innerHTML = D.stats.map((s) => `<div class="stat reveal"><div class="stat-n"><span data-count="${s.n}">0</span><small>${s.suffix}</small></div><div class="stat-l">${esc(s.label)}</div></div>`).join("");
  }

  /* =====================================================================
     APPLY
     ===================================================================== */
  function apply() {
    A.countdown($("#countdown"), D.config.applicationDeadline);
    // Recruitment timeline
    const tl = [
      ["Info Session", "2026-09-30T19:00:00-05:00"],
      ["Coffee Chats", "2026-10-03T10:00:00-05:00"],
      ["Applications Due", D.config.applicationDeadline],
      ["Interviews", "2026-10-15T09:00:00-05:00"],
      ["Offers Out", "2026-10-21T12:00:00-05:00"],
    ];
    const now = Date.now();
    const idx = tl.findIndex(([, d]) => new Date(d) > now);
    const nowI = idx === -1 ? tl.length : idx;
    $("#timeline").innerHTML = `<div class="fill" style="width:${Math.min(100, (nowI / (tl.length - 1)) * 100 - 10)}%"></div>` + tl.map(([n, d], i) => `<div class="tl ${i < nowI ? "done" : i === nowI ? "now" : ""}"><b>${n}</b><span>${A.fmt(d, { month: "short", day: "numeric" })}</span></div>`).join("");

    const host = $("#apply-host");
    const existing = Store.app();
    if (existing && existing.submitted) return submittedView(host, existing);
    formView(host, existing?.draft || {});
  }

  const STEPS = [
    { t: "The Basics", s: "Who you are" },
    { t: "Your Tracks", s: "Where you fit" },
    { t: "The Pitch", s: "How you think" },
    { t: "Final Cut", s: "Review & submit" },
  ];

  function formView(host, draft) {
    const p = Store.profile() || {};
    const d = { name: p.name || "", email: p.email || "", year: p.year || "", ...draft };
    d.tracks = d.tracks || [];
    let step = d.step || 0;
    const Q = [
      ["why", "Why VFMBS, and why now?", 1200, "What draws you to the business side of entertainment?"],
      ["pitch", "Greenlight it: pitch us one film, show, deal or company you'd bet on.", 1200, "Tell us what it is, who it's for and why it makes money."],
      ["news", "What's a recent entertainment or media business story you can't stop thinking about?", 800, "A merger, a flop, a breakout hit, a strategy shift. Anything."],
    ];
    host.innerHTML = `
      <div class="apply-wrap">
        <aside class="steps">
          ${STEPS.map((s, i) => `<button class="step-link" data-step="${i}"><span class="n">${i + 1}</span><span>${s.t}<small>${s.s}</small></span></button>`).join("")}
          <div class="save-note" id="save-note">Drafts auto-save on this device.</div>
        </aside>
        <form class="panel" id="app-form" novalidate>
          <section class="fstep" data-s="0">
            <div class="scene">Scene 01</div><h2>The Basics</h2><p style="color:var(--muted);margin:0 0 24px">Roll camera. Tell us who you are.</p>
            <div class="row2">
              <div class="field"><label for="a-name">Full name *</label><input class="input" id="a-name" name="name" required value="${esc(d.name)}" autocomplete="name"></div>
              <div class="field"><label for="a-pref">Preferred name</label><input class="input" id="a-pref" name="pref" value="${esc(d.pref || "")}"></div>
            </div>
            <div class="row2">
              <div class="field"><label for="a-email">Vanderbilt email *</label><input class="input" id="a-email" name="email" type="email" required value="${esc(d.email)}" placeholder="you@vanderbilt.edu"></div>
              <div class="field"><label for="a-phone">Phone</label><input class="input" id="a-phone" name="phone" type="tel" value="${esc(d.phone || "")}"></div>
            </div>
            <div class="row2">
              <div class="field"><label for="a-year">Class year *</label><select class="select" id="a-year" name="year" required><option value="">Select…</option>${["2027", "2028", "2029", "2030", "Graduate"].map((y) => `<option ${d.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
              <div class="field"><label for="a-major">Major(s) / Minor(s) *</label><input class="input" id="a-major" name="major" required value="${esc(d.major || "")}"></div>
            </div>
            <div class="field"><span class="label">How did you hear about us?</span>
              <div class="opts">${["Instagram", "Info session", "A friend", "Activities fair", "Class / professor", "This website"].map((o) => `<label class="opt"><input type="radio" name="heard" value="${o}" ${d.heard === o ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
          </section>

          <section class="fstep" data-s="1">
            <div class="scene">Scene 02</div><h2>Your Tracks</h2><p style="color:var(--muted);margin:0 0 24px">Pick up to two tracks, in order of preference. Click again to remove.</p>
            <div class="pick-tracks" id="picks">${D.tracks.map((t) => `<button type="button" class="pick" data-id="${t.id}" style="${vars(t.palette)}"><span class="rank"></span><b>${esc(t.name)}</b><span>${esc(t.genre)}</span></button>`).join("")}</div>
            <div class="err" id="pick-err" style="margin-top:10px"></div>
            <div class="field" style="margin-top:22px"><span class="label">Which areas excite you most?</span>
              <div class="opts">${["Film", "TV & Streaming", "Music", "Sports", "Gaming", "Creator economy", "News & publishing", "Live events"].map((o) => `<label class="opt"><input type="checkbox" name="areas" value="${o}" ${(d.areas || []).includes(o) ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
            <div class="field"><span class="label">Finance experience</span>
              <div class="opts">${["None yet", "Intro courses", "Modeling experience", "Internship"].map((o) => `<label class="opt"><input type="radio" name="finexp" value="${o}" ${d.finexp === o ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
          </section>

          <section class="fstep" data-s="2">
            <div class="scene">Scene 03</div><h2>The Pitch</h2><p style="color:var(--muted);margin:0 0 24px">No right answers. We want to see how you think.</p>
            ${Q.map(([k, l, max, h]) => `<div class="field"><label for="a-${k}">${l} *</label><div class="hint">${h}</div><textarea class="textarea" id="a-${k}" name="${k}" required maxlength="${max}" data-count>${esc(d[k] || "")}</textarea><div class="counter"></div></div>`).join("")}
            <div class="field"><span class="label">Resume (PDF)</span>
              <label class="drop" id="drop"><input type="file" accept=".pdf" hidden id="a-resume"><span id="drop-txt">${d.resume ? `📎 <b>${esc(d.resume)}</b> · click to replace` : `Drag &amp; drop or <b>browse</b> · PDF, max 5MB`}</span></label></div>
            <div class="field"><label for="a-li">LinkedIn URL</label><input class="input" id="a-li" name="linkedin" type="url" value="${esc(d.linkedin || "")}" placeholder="https://linkedin.com/in/…"></div>
          </section>

          <section class="fstep" data-s="3">
            <div class="scene">Scene 04</div><h2>Final Cut</h2><p style="color:var(--muted);margin:0 0 24px">Review your application before it goes to the screening room.</p>
            <div class="review-list" id="review"></div>
            <label style="display:flex;gap:10px;align-items:flex-start;font-size:14px;margin-top:22px;cursor:pointer"><input type="checkbox" id="a-agree" required style="margin-top:4px;accent-color:var(--gold)"> I confirm this application is my own work and I'm available for interviews Oct 15–17.</label>
            <div class="err" id="final-err" style="margin-top:8px"></div>
          </section>

          <div class="panel-foot">
            <button type="button" class="btn btn-outline" id="prev">${icons.chevL} Back</button>
            <button type="button" class="btn btn-red" id="next">Continue ${icons.chevR}</button>
          </div>
        </form>
      </div>`;

    const form = $("#app-form");
    A.wireCounters(form);
    const collect = () => {
      const fd = new FormData(form);
      const o = Object.fromEntries(fd);
      o.areas = fd.getAll("areas");
      o.tracks = d.tracks;
      o.resume = d.resume;
      o.step = step;
      return o;
    };
    let saveT;
    const save = () => {
      clearTimeout(saveT);
      saveT = setTimeout(() => {
        if (!form.isConnected || Store.app()?.submitted) return;
        Store.set("app", { draft: collect(), submitted: false });
        $("#save-note").textContent = "Draft saved · " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      }, 400);
    };
    form.addEventListener("input", save);

    // Track picker
    const drawPicks = () => $$("#picks .pick").forEach((b) => {
      const r = d.tracks.indexOf(b.dataset.id);
      b.classList.toggle("on", r >= 0);
      $(".rank", b).textContent = r >= 0 ? r + 1 : "";
    });
    $$("#picks .pick").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.id, i = d.tracks.indexOf(id);
      if (i >= 0) d.tracks.splice(i, 1);
      else if (d.tracks.length < 2) d.tracks.push(id);
      else A.toast("You can rank up to two tracks", "error");
      $("#pick-err").textContent = "";
      drawPicks(); save();
    }));
    drawPicks();

    // Resume
    const drop = $("#drop"), fi = $("#a-resume");
    const setFile = (f) => {
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) return A.toast("File is over 5MB", "error");
      if (!/\.pdf$/i.test(f.name)) return A.toast("Please upload a PDF", "error");
      d.resume = f.name;
      $("#drop-txt").innerHTML = `📎 <b>${esc(f.name)}</b> · click to replace`;
      save();
    };
    fi.addEventListener("change", () => setFile(fi.files[0]));
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));

    const validStep = (i) => {
      const sec = $(`.fstep[data-s="${i}"]`, form);
      if (i === 1 && !d.tracks.length) { $("#pick-err").textContent = "Pick at least one track."; return false; }
      if (i === 3) {
        if (!$("#a-agree").checked) { $("#final-err").textContent = "Please confirm to submit."; return false; }
        return true;
      }
      const msg = A.validate(sec, { email: true });
      if (msg) A.toast(msg, "error");
      return !msg;
    };

    const show = (i) => {
      step = i;
      $$(".fstep", form).forEach((s) => s.classList.toggle("on", +s.dataset.s === i));
      $$(".step-link").forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.toggle("ok", k < i); });
      $("#prev").style.visibility = i === 0 ? "hidden" : "visible";
      $("#next").innerHTML = i === 3 ? `Submit Application ${icons.check}` : `Continue ${icons.chevR}`;
      if (i === 3) drawReview();
      const top = $("#apply-host").getBoundingClientRect().top + scrollY - 90;
      if (scrollY > top) scrollTo({ top, behavior: "smooth" });
    };
    const drawReview = () => {
      const o = collect();
      const rows = [
        ["Name", o.name + (o.pref ? ` (${o.pref})` : "")], ["Email", o.email], ["Class / Major", `${o.year} · ${o.major}`],
        ["Tracks", d.tracks.map((t, i) => `${i + 1}. ${A.trackName(t)}`).join("\n")], ["Areas", (o.areas || []).join(", ") || "—"],
        ["Why VFMBS", o.why], ["Your pitch", o.pitch], ["Story", o.news], ["Resume", d.resume || "Not attached"], ["LinkedIn", o.linkedin || "—"],
      ];
      $("#review").innerHTML = rows.map(([k, v]) => `<div class="review-item"><span>${k}</span><p>${esc(v || "—")}</p></div>`).join("");
    };
    $$(".step-link").forEach((b) => b.addEventListener("click", () => {
      const to = +b.dataset.step;
      if (to > step) { for (let i = step; i < to; i++) if (!validStep(i)) return show(i); }
      show(to);
    }));
    $("#prev").addEventListener("click", () => show(Math.max(0, step - 1)));
    $("#next").addEventListener("click", () => {
      if (!validStep(step)) return;
      if (step < 3) return show(step + 1);
      for (let i = 0; i < 3; i++) if (!validStep(i)) return show(i);
      clearTimeout(saveT);
      const data = collect();
      delete data.step;
      const rec = { draft: data, submitted: true, id: A.code("CAST"), ts: Date.now(), status: "review", interview: null };
      Store.set("app", rec);
      A.rememberProfile(data);
      A.send("application", { id: rec.id, ...data });
      A.confetti(160);
      submittedView($("#apply-host"), rec, true);
    });
    show(Math.min(step, 3));
  }

  function interviewSlots() {
    const days = ["2026-10-15", "2026-10-16", "2026-10-17"];
    const times = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    const out = [];
    days.forEach((d) => times.forEach((t) => {
      const iso = `${d}T${t}:00-05:00`;
      out.push({ iso, taken: A.hash(iso) % 3 === 0 });
    }));
    return out;
  }
  function slotPicker(rec, onPick) {
    const slots = interviewSlots();
    const byDay = {};
    slots.forEach((s) => { const k = A.fmt(s.iso, { weekday: "short", month: "short", day: "numeric" }); (byDay[k] = byDay[k] || []).push(s); });
    return `<div style="display:grid;gap:18px">${Object.entries(byDay).map(([day, ss]) => `
      <div><div class="label" style="margin-bottom:8px">${day}</div><div class="opts">${ss.map((s) => `<label class="opt"><input type="radio" name="slot" value="${s.iso}" ${s.taken ? "disabled" : ""} ${rec.interview === s.iso ? "checked" : ""}><span style="${s.taken ? "opacity:.3;text-decoration:line-through;cursor:not-allowed" : ""}">${A.fmt(s.iso, { hour: "numeric", minute: "2-digit" })}</span></label>`).join("")}</div></div>`).join("")}</div>`;
  }

  function submittedView(host, rec, fresh) {
    const name = (rec.draft.pref || rec.draft.name || "").split(" ")[0];
    host.innerHTML = `
      <div class="panel wrap-screen" style="max-width:820px;margin:0 auto">
        ${A.clapperSVG()}
        <div class="eyebrow" style="justify-content:center">${fresh ? "Application submitted" : "Application on file"}</div>
        <h2 class="h2">That's a wrap${name ? ", " + esc(name) : ""}.</h2>
        <p style="color:var(--muted);max-width:520px;margin:0 auto 10px">Your application is in the screening room. Confirmation number <b style="color:var(--gold);font-family:var(--mono)">${esc(rec.id)}</b>.</p>
        <div class="progress-steps" style="max-width:420px;margin:24px auto 6px"><i class="on"></i><i class="${rec.interview ? "on" : ""}"></i><i></i><i></i></div>
        <div style="display:flex;justify-content:space-between;max-width:420px;margin:0 auto 34px;font-family:var(--mono);font-size:10px;letter-spacing:.14em;color:var(--dim)"><span>SUBMITTED</span><span>INTERVIEW</span><span>DECISION</span><span>OFFER</span></div>
        <div style="text-align:left;border-top:1px solid var(--line);padding-top:28px">
          <div class="eyebrow">Book your screen test</div>
          <p style="color:var(--muted);margin:-6px 0 18px">Choose a 20-minute interview slot (Central Time). You can change it anytime before Oct 14.</p>
          <form id="slot-form">${slotPicker(rec)}
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><button class="btn btn-gold" type="submit">${rec.interview ? "Update slot" : "Confirm slot"}</button><a class="btn btn-outline" href="portal.html">Go to My Studio</a><button class="btn btn-outline" type="button" id="withdraw" style="margin-left:auto">Withdraw</button></div>
          </form>
        </div>
      </div>`;
    $("#slot-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = new FormData(e.target).get("slot");
      if (!v) return A.toast("Pick a time slot", "error");
      rec.interview = v;
      Store.set("app", rec);
      A.send("interview", { id: rec.id, slot: v });
      A.toast("Interview booked: " + A.fmt(v, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
      submittedView(host, rec);
    });
    $("#withdraw").addEventListener("click", () => {
      if (!confirm("Withdraw your application? Your answers will be kept as a draft.")) return;
      Store.set("app", { draft: rec.draft, submitted: false });
      A.refresh();
      formView(host, rec.draft);
    });
    const top = host.getBoundingClientRect().top + scrollY - 90;
    scrollTo({ top, behavior: "smooth" });
    A.refresh();
  }

  /* =====================================================================
     PORTAL (My Studio)
     ===================================================================== */
  const COLORS = ["crimson", "gold", "cobalt", "emerald", "violet", "ember"];
  function portal() {
    const host = $("#portal");
    let chosen = false;
    try { chosen = sessionStorage.getItem("vfmbs:who"); } catch {}
    const render = () => (chosen && (Store.profile() || Store.activeId() === "guest") ? dashboard(host) : whosWatching(host));
    function whosWatching(h) {
      const profiles = Store.profiles();
      h.innerHTML = `
        <div class="profiles">
          <div>
            <h1>Who's watching?</h1>
            <div class="profile-list">
              ${profiles.map((p) => `<button class="profile" data-pid="${esc(p.id)}"><div class="avatar" style="background:${D.palettes[p.color || "gold"][2]}">${esc((p.name || "?")[0].toUpperCase())}</div>${esc(p.name || "Guest")}</button>`).join("")}
              ${profiles.length < 5 ? `<button class="profile" id="add-profile"><div class="avatar add">+</div>Add Profile</button>` : ""}
            </div>
            ${profiles.length ? "" : `<p style="color:var(--muted);margin-top:30px">Create a profile to keep your tickets, applications and list in one place.</p>`}
          </div>
        </div>`;
      $$("[data-pid]", h).forEach((b) => b.addEventListener("click", () => {
        Store.setActive(b.dataset.pid);
        try { sessionStorage.setItem("vfmbs:who", 1); } catch {}
        chosen = true;
        render();
      }));
      $("#add-profile", h)?.addEventListener("click", () => editProfile());
    }
    function editProfile(p) {
      let color = p?.color || COLORS[Store.profiles().length % COLORS.length];
      A.openModal(`
        <div class="modal-pad">
          <div class="eyebrow">${p ? "Edit" : "Add"} profile</div><h2>${p ? "Edit profile" : "New profile"}</h2>
          <form id="prof-form" novalidate style="margin-top:20px">
            <div class="field"><label for="p-name">Name *</label><input class="input" id="p-name" name="name" required value="${esc(p?.name || "")}"></div>
            <div class="field"><label for="p-email">Vanderbilt email</label><input class="input" id="p-email" name="email" type="email" value="${esc(p?.email || "")}"></div>
            <div class="field"><label for="p-year">Class year</label><select class="select" id="p-year" name="year"><option value="">Select…</option>${["2027", "2028", "2029", "2030", "Graduate"].map((y) => `<option ${p?.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
            <div class="field"><span class="label">Avatar color</span><div class="opts" id="p-colors">${COLORS.map((c) => `<button type="button" data-c="${c}" style="width:38px;height:38px;border-radius:8px;background:${D.palettes[c][2]};outline:${c === color ? "3px solid #fff" : "none"};outline-offset:2px" aria-label="${c}"></button>`).join("")}</div></div>
            <button class="btn btn-red" style="width:100%" type="submit">Save profile</button>
          </form>
        </div>`, { size: "sm" });
      $$("#p-colors button").forEach((b) => b.addEventListener("click", () => { color = b.dataset.c; $$("#p-colors button").forEach((x) => (x.style.outline = x === b ? "3px solid #fff" : "none")); }));
      $("#prof-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const msg = A.validate(e.target, { email: true });
        if (msg) return A.toast(msg, "error");
        const fd = Object.fromEntries(new FormData(e.target));
        const list = Store.profiles();
        if (p) Object.assign(list.find((x) => x.id === p.id), fd, { color });
        else list.push({ id: "p" + Date.now().toString(36), ...fd, color });
        Store.saveProfiles(list);
        A.closeModal();
        render();
      });
    }

    function dashboard(h) {
      const p = Store.profile() || { name: "Guest", color: "gold" };
      const rs = Store.rsvps(), ws = Store.wsApps(), app = Store.app(), list = Store.list();
      const rsIds = Object.keys(rs).filter((id) => D.events.some((e) => e.id === id)).sort((a, b) => new Date(A.byId(a).date) - new Date(A.byId(b).date));
      const wsIds = Object.keys(ws).filter((id) => D.workshops.some((w) => w.id === id));
      h.innerHTML = `
        <section class="page-hero" style="min-height:40vh">${art(p.color || "gold", "ticket", { beam: true })}
          <div class="container">
            <div class="dash-head">
              <div class="avatar" style="background:${D.palettes[p.color || "gold"][2]}">${esc((p.name || "G")[0].toUpperCase())}</div>
              <div><div class="eyebrow" style="margin-bottom:8px">My Studio</div><h1>${esc(p.name || "Guest")}'s Studio</h1></div>
              <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
                ${Store.profile() ? `<button class="btn btn-outline btn-sm" id="edit-prof">Edit profile</button>` : ""}
                <button class="btn btn-outline btn-sm" id="switch">Switch profile</button>
              </div>
            </div>
          </div>
        </section>
        <div class="container">
          <div class="dash-grid">
            <div class="dash-stat"><b>${rsIds.length}</b><span>Tickets</span></div>
            <div class="dash-stat"><b>${wsIds.length}</b><span>Workshop apps</span></div>
            <div class="dash-stat"><b>${app?.submitted ? "✓" : app?.draft ? "…" : "—"}</b><span>Membership app</span></div>
            <div class="dash-stat"><b>${list.length}</b><span>My List</span></div>
          </div>

          <div class="dash-section">
            <h2>Membership Application ${app?.submitted ? `<span class="status-pill ${app.interview ? "st-accepted" : "st-review"}">${app.interview ? "Interview booked" : "Under review"}</span>` : app?.draft ? `<span class="status-pill st-draft">Draft</span>` : ""}</h2>
            ${app?.submitted ? `
              <div class="status-card">
                <div class="ev-thumb">${art("crimson", "clapper")}</div>
                <div><h3>Fall 2026 Casting Call · ${esc(app.id)}</h3>
                  <p>Tracks: ${app.draft.tracks.map((t) => esc(A.trackName(t))).join(" → ")}${app.interview ? ` · Interview: <b style="color:#fff">${A.fmt(app.interview, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} CT</b>` : ""}</p>
                  <div class="progress-steps"><i class="on"></i><i class="${app.interview ? "on" : ""}"></i><i></i><i></i></div></div>
                <a class="btn btn-outline btn-sm" href="apply.html">${app.interview ? "Manage" : "Book interview"}</a>
              </div>` : app?.draft ? `
              <div class="status-card"><div class="ev-thumb">${art("crimson", "clapper")}</div><div><h3>Draft in progress</h3><p>Pick up where you left off. Deadline ${A.fmt(D.config.applicationDeadline, { month: "short", day: "numeric" })}.</p><div class="progress-steps">${[0, 1, 2, 3].map((i) => `<i class="${i < (app.draft.step || 0) + 1 ? "on" : ""}"></i>`).join("")}</div></div><a class="btn btn-red btn-sm" href="apply.html">Continue</a></div>` :
              `<div class="empty">You haven't started an application. <a href="apply.html">Start your casting call →</a></div>`}
          </div>

          <div class="dash-section">
            <h2>My Tickets</h2>
            ${rsIds.length ? `<div class="tickets">${rsIds.map((id) => `<div class="ticket-wrap">${A.ticketHTML(A.byId(id), rs[id])}<div class="ticket-tools"><button class="btn btn-outline btn-sm" data-ics="${id}">${icons.cal} Calendar</button><button class="btn btn-outline btn-sm" data-open="${id}">Details</button><button class="btn btn-outline btn-sm" data-cancel="${id}" style="margin-left:auto">Cancel</button></div></div>`).join("")}</div>` : `<div class="empty">No tickets yet. <a href="events.html">Browse events →</a></div>`}
          </div>

          <div class="dash-section">
            <h2>Workshop Applications</h2>
            ${wsIds.length ? wsIds.map((id) => { const w = A.byId(id), a = ws[id]; return `
              <div class="status-card"><div class="ev-thumb">${art(w.palette, w.motif)}</div>
                <div><h3>${esc(w.title)} <span class="status-pill st-review" style="margin-left:6px">Under review</span></h3>
                  <p>Submitted ${new Date(a.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · Decision by ${A.fmt(new Date(new Date(w.deadline).getTime() + 3 * 864e5).toISOString(), { month: "short", day: "numeric" })} · <span style="font-family:var(--mono)">${esc(a.code)}</span></p>
                  <div class="progress-steps"><i class="on"></i><i class="on"></i><i></i></div></div>
                <div style="display:flex;gap:8px"><button class="btn btn-outline btn-sm" data-open="${id}">Episodes</button><button class="btn btn-outline btn-sm" data-withdraw="${id}">Withdraw</button></div>
              </div>`; }).join("") : `<div class="empty">No workshop applications yet. <a href="workshops.html">Explore workshops →</a></div>`}
          </div>

          <div class="dash-section" id="mylist">
            <h2>My List</h2>
            ${list.length ? `<div class="ws-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${list.map(A.byId).filter(Boolean).map((x) => x.episodes ? A.workshopCard(x) : x.skills ? `<article class="card" data-open="${x.id}" style="--w:auto"><div class="card-media">${art(x.palette, x.motif)}<span class="card-tag">Track</span><div class="card-label">${esc(x.name)}</div></div></article>` : A.eventCard(x)).join("")}</div>` : `<div class="empty">Tap <b>+</b> on anything to save it here.</div>`}
          </div>

          <div class="dash-section" style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" id="export">${icons.download} Export my data</button>
            <button class="btn btn-outline btn-sm" id="reset">${icons.trash} Clear this profile's data</button>
          </div>
        </div>`;
      $$(".ws-grid .card", h).forEach((c) => (c.style.setProperty("--w", "auto")));
      $("#switch", h).addEventListener("click", () => { try { sessionStorage.removeItem("vfmbs:who"); } catch {} chosen = false; render(); });
      $("#edit-prof", h)?.addEventListener("click", () => editProfile(Store.profile()));
      $$("[data-withdraw]", h).forEach((b) => b.addEventListener("click", () => {
        if (!confirm("Withdraw this workshop application?")) return;
        const all = Store.wsApps(); delete all[b.dataset.withdraw]; Store.set("ws", all); A.toast("Application withdrawn"); render();
      }));
      $("#export", h).addEventListener("click", () => {
        const blob = new Blob([JSON.stringify({ profile: Store.profile(), rsvps: Store.rsvps(), workshops: Store.wsApps(), application: Store.app(), list: Store.list() }, null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "vfmbs-my-studio.json"; a.click();
      });
      $("#reset", h).addEventListener("click", () => {
        if (!confirm("Clear all tickets, applications and saved items for this profile?")) return;
        ["rsvps", "ws", "app", "list"].forEach((k) => Store.set(k, k === "list" ? [] : k === "app" ? null : {}));
        A.toast("Profile data cleared"); render();
      });
    }
    render();
    A.onRefresh(() => chosen && render());
  }

  ({ home, events, workshops, about, apply, portal }[page] || (() => {}))();
})();
