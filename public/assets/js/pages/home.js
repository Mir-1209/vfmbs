/* Home page */
V.ready.then((C) => {
  const { $, $$, esc, icons, Store } = V;
  const S = C.settings;

  /* ---------- Billboard ---------- */
  const bb = $("#billboard");
  const SLIDE_MS = 8000;
  const F = C.featured || [];
  bb.style.setProperty("--slide-ms", SLIDE_MS + "ms");
  bb.insertAdjacentHTML("beforeend", F.map((f, i) => `
    <div class="slide ${i === 0 ? "active" : ""}" aria-hidden="${i !== 0}">
      <div class="slide-art" data-parallax="-0.12">${V.art(f.palette, f.motif, { beam: true, image: f.image })}</div>
      <div class="slide-content">
        <div class="kicker reveal-up"><img src="/assets/brand/logo.svg" alt="">${esc(f.kicker)}</div>
        <h1 class="slide-title reveal-up">${esc(f.title)}</h1>
        <p class="slide-tagline reveal-up">${esc(f.tagline)}</p>
        <div class="meta-line reveal-up"><span class="match">${V.match(f.id)}% Match</span>${(f.meta || []).map((m) => `<span>${esc(m)}</span>`).join("")}<span class="rating">${esc(f.rating)}</span></div>
        <p class="slide-desc reveal-up">${esc(f.desc)}</p>
        <div class="actions reveal-up">
          <a class="btn btn-primary magnetic" href="${esc(V.safeUrl(f.cta?.href) || "/apply")}">${icons.play} ${esc(f.cta?.label || "Apply")}</a>
          <a class="btn btn-ghost" href="${esc(V.safeUrl(f.info) || "/about")}">${icons.info} More Info</a>
        </div>
      </div>
    </div>`).join("") + `
    <div class="slide-side"><button class="round-btn" id="bb-replay" aria-label="Restart slideshow">${icons.replay}</button><span class="maturity">Rated ${esc(F[0]?.rating || "")}</span></div>
    <div class="slide-dots" role="tablist">${F.map((f, i) => `<button role="tab" aria-label="Show ${esc(f.title)}" class="${i === 0 ? "active" : ""}"><i></i></button>`).join("")}</div>
    <div class="scroll-cue" aria-hidden="true"><span>SCROLL</span><i></i></div>`);
  let cur = 0, timer, paused = false;
  const slides = $$(".slide", bb), dots = $$(".slide-dots button", bb), mat = $(".maturity", bb);
  const go = (i) => {
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle("active", k === cur); s.setAttribute("aria-hidden", k !== cur); });
    dots.forEach((d, k) => { d.classList.remove("active"); void d.offsetWidth; d.classList.toggle("active", k === cur); });
    mat.textContent = "Rated " + (F[cur].rating || "");
    schedule();
  };
  const schedule = () => { clearTimeout(timer); if (!paused && slides.length > 1) timer = setTimeout(() => go(cur + 1), SLIDE_MS); };
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  $("#bb-replay").addEventListener("click", () => go(0));
  bb.addEventListener("focusin", () => { paused = true; bb.classList.add("paused"); clearTimeout(timer); });
  bb.addEventListener("focusout", () => { paused = false; bb.classList.remove("paused"); schedule(); });
  document.addEventListener("visibilitychange", () => (document.hidden ? clearTimeout(timer) : schedule()));
  setTimeout(() => go(0), V.introPlaying ? 3200 : 0);

  /* ---------- Rows ---------- */
  const renderRows = () => {
    const upcoming = C.events.filter((e) => !V.isPast(e));
    const mine = Store.list().map(V.byId).filter((x) => x && x.body === undefined);
    $("#rows").innerHTML = [
      mine.length ? V.rowHTML("My List", mine.map(V.anyCard).join(""), "/portal") : "",
      V.rowHTML("Upcoming Premieres", upcoming.map(V.eventCard).join(""), "/events"),
      V.rowHTML("Workshops: Now Enrolling", C.workshops.map(V.workshopCard).join(""), "/workshops"),
      V.rowHTML(`Top 10 Reasons to Join ${esc(S.shortName || "VFMBS")} Today`, (C.top10 || []).map((t, i) => `
        <div class="top-card"><span class="top-num" aria-hidden="true">${i + 1}</span>
          <div class="top-poster">${V.art(Object.keys(V.palettes)[i % 8], Object.keys(V.motifs)[(i * 3) % 18])}<p>${esc(t)}</p></div></div>`).join("")),
      V.rowHTML("Speaker Series &amp; Treks", upcoming.filter((e) => /Speaker|Trek/.test(e.type)).map(V.eventCard).join(""), "/events"),
      V.rowHTML("Choose Your Track", C.tracks.map(V.trackCard).join(""), "/about#tracks"),
    ].join("");
    $$("#rows .row").forEach(V.wireRow);
    V.reveal($("#rows"));
  };
  renderRows();
  V.onRefresh(renderRows);

  /* ---------- Ticker ---------- */
  const items = (C.ticker || []).map(([k, v]) => `<span class="ticker-item"><b>${esc(k)}</b><span class="${String(v).startsWith("▼") ? "down" : "up"}">${esc(v)}</span></span>`).join("");
  $("#ticker").innerHTML = items ? `<span class="ticker-label"><span class="live"></span>VFMBS INDEX</span><div class="ticker-track">${items}${items}</div><span class="ticker-note">Illustrative</span>` : "";

  /* ---------- Pipeline ---------- */
  $("#pipe-track").innerHTML = (C.pipeline || []).map((p) => `
    <article class="pipe-card spot" style="${V.vars(p.palette)}">${V.art(p.palette, p.motif)}
      <div class="pipe-n">${esc(p.n)}</div>
      <div><div class="sub">${esc(p.sub)}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>
    </article>`).join("");

  /* ---------- Stats ---------- */
  $("#stats").innerHTML = (C.stats || []).map((s, i) => `<div class="stat reveal reveal-d${i}"><div class="stat-n"><span data-count-to="${Number(s.n) || 0}">0</span><small>${esc(s.suffix)}</small></div><div class="stat-l">${esc(s.label)}</div></div>`).join("");

  /* ---------- Tracks ---------- */
  $("#tracks").innerHTML = C.tracks.map((t, i) => `
    <a class="track spot reveal reveal-d${i % 4}" style="${V.vars(t.palette)}" href="/about#tracks" data-open="${t.id}" data-cursor="Open">
      ${V.art(t.palette, t.motif)}
      <span class="track-no">TRACK ${V.pad(i + 1)}</span>
      <h3>${esc(t.name)}</h3><div class="genre">${esc(t.genre)}</div><p>${esc(t.blurb)}</p>
      <div class="chips">${(t.skills || []).slice(0, 3).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
    </a>`).join("");

  simulator();

  /* ---------- Journal preview ---------- */
  const posts = C.posts.slice(0, 3);
  if (posts.length) {
    const [c0, ...rest] = posts;
    $("#mag").innerHTML = `
      <a class="mag-cover reveal" href="/journal?p=${encodeURIComponent(c0.id)}" data-cursor="Read">${V.art(c0.palette, c0.motif, { image: c0.image })}
        <div class="masthead-row"><div class="masthead">The Reel</div><div class="mono">${esc(S.issue || "")}<br>${esc(S.season || "")}</div></div>
        <div><div class="cat">Cover story · ${esc(c0.category)}</div><h3>${esc(c0.title)}</h3><p style="color:#cfcac1;max-width:520px;margin:0">${esc(c0.excerpt)}</p></div>
      </a>
      <div class="mag-list">${rest.map((p, i) => `
        <a class="mag-item reveal reveal-d${i + 1}" href="/journal?p=${encodeURIComponent(p.id)}" data-cursor="Read"><div class="thumb">${V.art(p.palette, p.motif, { image: p.image })}</div>
          <div><div class="cat">${esc(p.category)}</div><h4>${esc(p.title)}</h4><p>${esc(p.excerpt)}</p></div></a>`).join("")}
        <a class="link-arrow reveal" href="/journal">Read the Journal ${icons.arrowR}</a>
      </div>`;
  } else $("#mag-section").remove();

  /* ---------- Partners strip ---------- */
  const partners = C.partners || [];
  $("#partners-strip").innerHTML = partners.length
    ? `<div class="logo-wall">${partners.slice(0, 8).map((p) => `<a class="logo-cell" href="${esc(V.safeUrl(p.url) || "/partners")}" ${V.safeUrl(p.url).startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}><span class="tier">${esc(p.tier || "")}</span>${V.safeUrl(p.logo) ? `<img src="${esc(V.safeUrl(p.logo))}" alt="${esc(p.name)}" loading="lazy">` : `<span class="nm">${esc(p.name)}</span>`}</a>`).join("")}</div>`
    : `<div class="logo-wall">${["Title Partner", "Studio Partner", "Streaming Partner", "Finance Partner"].map((t) => `<a class="logo-cell open" href="/partners#inquire" data-cursor="Partner"><span class="tier">Available</span><span class="nm">${t} · Your logo here</span></a>`).join("")}</div>`;

  /* ---------- Reviews ---------- */
  $("#reviews").innerHTML = (C.reviews || []).map((r, i) => `<div class="review spot reveal reveal-d${i}"><div class="stars" aria-label="${r.stars} stars">${"★".repeat(r.stars || 5)}</div><blockquote>“${esc(r.q)}”</blockquote><cite>${esc(r.who)}</cite></div>`).join("");

  /* ---------- CTA + FAQ ---------- */
  const open = S.applicationsOpen !== false && new Date(S.applicationDeadline) > new Date();
  $("#cta-eyebrow").textContent = open ? `${S.season || ""} casting call closes in` : "Applications are closed. Next casting call soon";
  if (open) V.countdown($("#countdown"), S.applicationDeadline); else $("#countdown").remove();
  $("#faq-list").innerHTML = (C.faq || []).map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  $$("#faq-list details").forEach((d) => d.addEventListener("toggle", () => { if (d.open) $$("#faq-list details").forEach((o) => o !== d && (o.open = false)); }));

  V.fx.scan();

  /* ---------- Greenlight simulator ---------- */
  function simulator() {
    const root = $("#sim");
    const st = { budget: 40, pa: 25, genre: "Horror", release: "Theatrical" };
    const genres = { Horror: 3.6, Comedy: 2.2, Drama: 1.6, Action: 2.6, Animation: 3.0 };
    const releases = { Theatrical: 1, Streaming: 0.75, Hybrid: 0.9 };
    root.innerHTML = `
      <div class="sim-controls">
        <div class="eyebrow">Interactive · Deal Desk</div>
        <h2 class="h2" style="font-size:clamp(40px,4.4vw,62px)">Greenlight <em>or</em> Pass?</h2>
        <p style="color:var(--muted);margin:0 0 26px">You're the studio. Set the budget, pick a genre and a release strategy, and watch the money flow. This is the kind of model you'll build in the Deal Room.</p>
        <div class="range"><div class="range-top"><label for="s-budget">Production budget</label><output id="o-budget"></output></div><input type="range" min="2" max="250" value="${st.budget}" id="s-budget"></div>
        <div class="range"><div class="range-top"><label for="s-pa">Prints &amp; advertising</label><output id="o-pa"></output></div><input type="range" min="1" max="150" value="${st.pa}" id="s-pa"></div>
        <div class="range"><div class="range-top"><span>Genre</span></div><div class="seg" id="s-genre" role="radiogroup" aria-label="Genre">${Object.keys(genres).map((g) => `<button role="radio" aria-checked="${g === st.genre}" class="${g === st.genre ? "on" : ""}">${g}</button>`).join("")}</div></div>
        <div class="range"><div class="range-top"><span>Release strategy</span></div><div class="seg" id="s-rel" role="radiogroup" aria-label="Release strategy">${Object.keys(releases).map((g) => `<button role="radio" aria-checked="${g === st.release}" class="${g === st.release ? "on" : ""}">${g}</button>`).join("")}</div></div>
      </div>
      <div class="sim-out" aria-live="polite">
        <div class="stamp" id="o-verdict"></div>
        <div class="mono">Projected studio profit</div>
        <div class="sim-big" id="o-profit"></div>
        <div class="sim-grid">
          <div><span>Worldwide gross</span><b id="o-gross"></b></div>
          <div><span>ROI</span><b id="o-roi"></b></div>
          <div><span>Cost-to-gross</span><b id="o-be"></b></div>
          <div><span>Opening weekend</span><b id="o-ow"></b></div>
        </div>
        <div class="mono" style="font-size:10px">Revenue waterfall ($M)</div>
        <div class="waterfall" id="o-wf"></div>
        <p style="font-size:11px;color:var(--dim);margin:14px 0 0">Simplified illustrative model: theatrical rentals ≈50% of gross, plus ancillary windows. Not financial advice, just very fun math.</p>
      </div>`;
    const m = (n) => (n < 0 ? "−" : "") + "$" + Math.abs(n).toFixed(Math.abs(n) < 10 ? 1 : 0) + "M";
    let lastVerdict = "";
    const draw = () => {
      const g = genres[st.genre], r = releases[st.release];
      const base = Math.pow(st.budget, 0.82) * g * 1.35 + Math.pow(st.pa, 0.9) * 1.9 * g * 0.55;
      const gross = base * r * (st.release === "Streaming" ? 0.35 : 1);
      const rentals = gross * 0.5;
      const ancillary = gross * 0.38 + (st.release !== "Theatrical" ? st.budget * 0.55 : 0);
      const dist = (rentals + ancillary) * 0.12;
      const profit = rentals + ancillary - dist - st.budget - st.pa;
      const roi = (profit / (st.budget + st.pa)) * 100;
      $("#o-budget").textContent = "$" + st.budget + "M";
      $("#o-pa").textContent = "$" + st.pa + "M";
      $$("#sim input[type=range]").forEach((el) => el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min)) * 100 + "%"));
      $("#o-profit").textContent = m(profit);
      $("#o-profit").style.color = profit >= 0 ? "var(--green)" : "var(--red-2)";
      $("#o-gross").textContent = m(gross);
      $("#o-roi").textContent = (roi >= 0 ? "+" : "") + roi.toFixed(0) + "%";
      $("#o-be").textContent = ((st.budget + st.pa) / (gross || 1)).toFixed(2) + "×";
      $("#o-ow").textContent = st.release === "Streaming" ? "N/A" : m(gross * (st.genre === "Horror" ? 0.38 : 0.3));
      const [txt, col] = roi > 60 ? ["GREENLIT ✦ FRANCHISE", "var(--green)"] : roi > 0 ? ["GREENLIT", "var(--gold)"] : roi > -25 ? ["DEVELOPMENT HELL", "#ffc75a"] : ["PASS", "var(--red-2)"];
      const v = $("#o-verdict");
      if (txt !== lastVerdict) { v.style.animation = "none"; void v.offsetWidth; v.style.animation = ""; lastVerdict = txt; }
      v.textContent = txt; v.style.color = col;
      const parts = [["Rentals", rentals, "var(--gold)"], ["Ancillary", ancillary, "var(--gold-2)"], ["Dist. fee", -dist, "#666"], ["Budget", -st.budget, "#8a2a2a"], ["P&A", -st.pa, "#b33a3a"], ["Profit", profit, profit >= 0 ? "var(--green)" : "var(--red-2)"]];
      const max = Math.max(...parts.map((p) => Math.abs(p[1])), 1);
      $("#o-wf").innerHTML = parts.map(([l, val, c]) => `<div class="bar"><i style="height:${Math.max(2, (Math.abs(val) / max) * 100)}%;background:${c}"></i><span>${l}</span></div>`).join("");
    };
    $("#s-budget").addEventListener("input", (e) => { st.budget = +e.target.value; draw(); });
    $("#s-pa").addEventListener("input", (e) => { st.pa = +e.target.value; draw(); });
    const seg = (id, key) => $$(`#${id} button`).forEach((b) => b.addEventListener("click", () => {
      st[key] = b.textContent;
      $$(`#${id} button`).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
      draw();
    }));
    seg("s-genre", "genre");
    seg("s-rel", "release");
    draw();
  }
});
