/* =========================================================================
   HOME: a night at the movies, in twelve scenes
   ========================================================================= */
V.ready.then(async (C) => {
  const { $, $$, esc, icons, Store } = V;
  const S = C.settings;
  const upcoming = C.events.filter((e) => !V.isPast(e));

  /* ================= SC.01 THE THEATER ================= */
  const theater = V.Theater($("#theater-gl"), $("#screen"));
  buildSeats();
  const cards = [
    { k: "presents", html: `<div class="sc-presents"><img src="/assets/brand/logo.svg" alt=""><p>${esc(S.orgName || "Vanderbilt Film & Media Business Society")}</p><span>presents</span></div>` },
    { k: "title", html: `<div class="sc-title"><span class="sc-k">A ${esc(S.season || "")} production</span><h2>The Business<br><em>behind the</em> Screen</h2></div>` },
    ...(C.featured || []).map((f) => ({ k: "feat", href: V.safeUrl(f.cta?.href) || "/apply", html: `<div class="sc-feat"><div class="sc-poster">${V.poster(f.palette, f.motif, f.id)}</div><div class="sc-copy"><span class="sc-k">${esc(f.kicker)}</span><h2>${esc(f.title)}</h2><p>${esc(f.tagline)}</p><span class="sc-cta">${esc(f.cta?.label || "Learn more")} ▸</span></div></div>` })),
    { k: "fin", html: `<div class="sc-title"><span class="sc-k">Now casting · all majors</span><h2>Your first<br><em>credit</em> starts here</h2></div>` },
  ];
  const inner = $("#screen-inner");
  let ci = -1, cardTimer;
  const showCard = (i) => {
    ci = (i + cards.length) % cards.length;
    const c = cards[ci];
    const scr = $("#screen");
    scr.classList.remove("splice"); void scr.offsetWidth; scr.classList.add("splice");
    inner.innerHTML = `<div class="sc sc-${c.k}">${c.html}</div>`;
    scr.dataset.href = c.href || "";
    $("#screen-count").textContent = `${V.pad(ci + 1)} / ${V.pad(cards.length)}`;
    clearTimeout(cardTimer);
    cardTimer = setTimeout(() => showCard(ci + 1), c.k === "presents" ? 3200 : 5200);
  };
  $("#screen").addEventListener("click", () => { const h = $("#screen").dataset.href; if (h) location.href = h; else showCard(ci + 1); });
  // Gate weave: the image jitters a hair at 24fps, like film through a gate
  if (!V.reduced) setInterval(() => { inner.style.transform = `translate(${(Math.random() - 0.5) * 1.2}px, ${(Math.random() - 0.5) * 1.6}px)`; }, 1000 / 24);
  $("#house").textContent = upcoming[0] ? `Next screening · ${V.fmtDate(upcoming[0])} · ${upcoming[0].title}` : `${S.season || ""} season`;

  const started = await V.preshow;
  theater.powerUp(started ? 2400 : 1200);
  setTimeout(() => { $("#theater").classList.add("lit"); showCard(0); }, started ? 700 : 150);
  document.body.dataset.projector = 1;
  V.sfx.on && V.sfx.projector(true);
  new IntersectionObserver(([e]) => { if (V.sfx.on) V.sfx.projector(e.isIntersecting); }).observe($("#theater"));

  function buildSeats() {
    const rows = [
      { y: 46, s: 1.3, n: 12, heads: 0.6 },
      { y: 62, s: 1.8, n: 9, heads: 0.55 },
      { y: 80, s: 2.6, n: 6, heads: 0.5 },
    ];
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const svg = rows.map((row, ri) => {
      const w = 100 / row.n;
      let g = "";
      for (let i = -1; i <= row.n; i++) {
        const x = i * w + (ri % 2 ? w / 2 : 0), sw = w * 0.86, sh = 9 * row.s;
        g += `<rect x="${x.toFixed(2)}" y="${row.y}" width="${sw.toFixed(2)}" height="${sh + 20}" rx="${2.2 * row.s}" fill="#050404"/><rect x="${(x + 0.6).toFixed(2)}" y="${row.y}" width="${(sw - 1.2).toFixed(2)}" height="0.35" fill="rgba(255,236,205,.28)"/>`;
        if (r() < row.heads) {
          const hx = x + sw / 2 + (r() - 0.5) * 2, hr = 2.6 * row.s, hy = row.y - hr * 1.1;
          g += `<ellipse cx="${hx.toFixed(2)}" cy="${(row.y + 1).toFixed(2)}" rx="${(hr * 2).toFixed(2)}" ry="${(hr * 0.9).toFixed(2)}" fill="#030303"/><circle cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="${hr.toFixed(2)}" fill="#030303"/><path d="M${(hx - hr * 0.8).toFixed(2)} ${(hy - hr * 0.55).toFixed(2)} a${hr.toFixed(2)} ${hr.toFixed(2)} 0 0 1 ${(hr * 1.6).toFixed(2)} 0" fill="none" stroke="rgba(255,236,205,.4)" stroke-width="${(0.25 * row.s).toFixed(2)}"/>`;
        }
      }
      return `<svg class="seat-row" data-depth="${ri + 1}" viewBox="0 0 100 100" preserveAspectRatio="none">${g}</svg>`;
    }).join("");
    $("#seats").innerHTML = svg;
    if (!V.reduced) addEventListener("pointermove", (e) => {
      const mx = e.clientX / innerWidth - 0.5, my = e.clientY / innerHeight - 0.5;
      $$(".seat-row").forEach((s) => { const d = +s.dataset.depth; s.style.transform = `translate3d(${-mx * d * 14}px, ${-my * d * 5}px, 0)`; });
      $("#screen").style.transform = `translate3d(${mx * 6}px, ${my * 3}px, 0)`;
    }, { passive: true });
  }

  /* ================= SC.02 MARQUEE ================= */
  const lines = upcoming.slice(0, 3);
  const tiles = (txt) => [...String(txt).toUpperCase()].map((ch, i) => ch === " " ? `<span class="sp"></span>` : `<span class="tile" style="--i:${i};--r:${((V.hash(txt + i) % 7) - 3) * 0.6}deg">${esc(ch)}</span>`).join("");
  $("#marquee-rows").innerHTML = lines.length ? lines.map((e) => `
    <button class="mq-row" data-open="${e.id}" data-cursor="Tickets">
      <span class="mq-line">${tiles(e.title.length > 26 ? e.title.slice(0, 25).replace(/\s+\S*$/, "") : e.title)}</span>
      <span class="mq-line small">${tiles(`${V.fmt(e.date, { month: "short", day: "numeric" }, V.evTz(e))} · ${V.fmt(e.date, { hour: "numeric", minute: "2-digit" }, V.evTz(e)).replace(":00", "")}`)}</span>
    </button>`).join("") : `<div class="mq-row"><span class="mq-line">${tiles("COMING SOON")}</span></div>`;
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { $(".marquee-sign").classList.add("hung"); o.disconnect(); } }, { threshold: 0.35 }).observe($(".marquee-sign"));

  /* ================= SC.03 THE REEL (35mm film strip) ================= */
  const reelItems = [...upcoming.map((e) => ({ ...e, _k: "ev" })), ...C.workshops.map((w) => ({ ...w, _k: "ws" }))];
  $("#reel-strip").innerHTML = reelItems.map((x, i) => {
    const going = x._k === "ev" && Store.tickets()[x.id];
    const sub = x._k === "ev" ? `${V.fmtDate(x)} · ${esc(x.location)}` : `${(x.episodes || []).length} episodes · ${esc(x.level)}`;
    return `<article class="frame" data-open="${x.id}" data-cursor="${x._k === "ev" ? "Screen it" : "Episodes"}" style="--i:${i}">
      <div class="frame-img">${V.art(x.palette, x.motif, { image: x.image, seed: x.id })}${going ? `<span class="frame-badge">You're going</span>` : ""}</div>
      <div class="frame-cap"><span class="frame-no">${V.pad(i + 1)}A</span><b>${esc(x.title)}</b><span>${sub}</span></div>
    </article>`;
  }).join("");
  $("#reel-edge-t").textContent = $("#reel-edge-b").textContent = Array.from({ length: 40 }, (_, i) => `VFMBS 5219 ▸ ${V.pad(i * 4 + 12)}  ◆  `).join("");
  dragScroll($("#reel-viewport"));

  function dragScroll(vp) {
    let down = false, sx = 0, sl = 0, v = 0, lx = 0, moved = false;
    vp.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = lx = e.clientX; sl = vp.scrollLeft; v = 0; vp.classList.add("dragging"); });
    addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; vp.scrollLeft = sl - dx; v = e.clientX - lx; lx = e.clientX; });
    addEventListener("pointerup", () => {
      if (!down) return; down = false; vp.classList.remove("dragging");
      const glide = () => { if (Math.abs(v) < 0.5) return; vp.scrollLeft -= v; v *= 0.93; requestAnimationFrame(glide); };
      glide();
    });
    vp.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
    vp.addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.shiftKey) { vp.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
    const upd = () => { const p = vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth); $("#reel-meter i").style.transform = `scaleX(${p})`; $("#reel-ft").textContent = `${String(Math.round(p * 1000)).padStart(4, "0")} FT`; };
    vp.addEventListener("scroll", upd, { passive: true }); upd();
    $("#reel-prev").addEventListener("click", () => vp.scrollBy({ left: -vp.clientWidth * 0.8, behavior: "smooth" }));
    $("#reel-next").addEventListener("click", () => vp.scrollBy({ left: vp.clientWidth * 0.8, behavior: "smooth" }));
  }

  /* ================= SC.05 STORYBOARD ================= */
  const shots = ["WS", "CU", "OTS", "INSERT", "CRANE"];
  $("#pipe-track").innerHTML = (C.pipeline || []).map((p, i) => `
    <article class="board" style="--rot:${((i % 3) - 1) * 0.8}deg">
      <div class="board-head"><span>SC. ${esc(p.n)}</span><span>SHOT ${shots[i % 5]}</span><span>${esc(p.title).toUpperCase()}</span></div>
      <div class="board-frame">${V.poster(p.palette, p.motif, p.title)}<svg class="board-arrow" viewBox="0 0 100 40" aria-hidden="true"><path d="M5 30 Q50 ${i % 2 ? 2 : 38} 90 20" /><path d="M82 13 L91 20 L81 25"/></svg><span class="board-cam">${["PUSH IN", "PAN →", "DOLLY", "TILT ↑", "PULL OUT"][i % 5]}</span></div>
      <div class="board-notes"><h3>${esc(p.title)}</h3><div class="board-sub">${esc(p.sub)}</div><p>${esc(p.text)}</p></div>
    </article>`).join("");

  /* ================= SC.06 BOX OFFICE (split-flap) ================= */
  const flap = (str) => [...String(str)].map((ch) => `<span class="flap" data-ch="${esc(ch)}"><i>${esc(ch)}</i></span>`).join("");
  $("#board").innerHTML = (C.stats || []).map((s) => `<div class="board-row"><span class="board-lbl">${esc(s.label)}</span><span class="board-val">${flap(String(s.n).padStart(3, " ") + (s.suffix || " "))}</span></div>`).join("");
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    const chars = " 0123456789+%$ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $$("#board .flap").forEach((f, idx) => {
      const target = f.dataset.ch; let n = 6 + Math.floor(Math.random() * 10);
      const i = $("i", f);
      const step = () => {
        if (n-- <= 0) { i.textContent = target; f.classList.remove("flip"); return; }
        f.classList.remove("flip"); void f.offsetWidth; f.classList.add("flip");
        i.textContent = chars[Math.floor(Math.random() * chars.length)];
        if (idx % 3 === 0) V.sfx.tick();
        setTimeout(step, 70);
      };
      setTimeout(step, idx * 40);
    });
  }, { threshold: 0.4 }).observe($("#board"));

  /* ================= SC.07 STARRING ================= */
  const roles = { deal: "The Financier", studio: "The Studio Chief", content: "The Showrunner", venture: "The Producer" };
  $("#billing").innerHTML = C.tracks.map((t, i) => `
    <button class="bill" data-open="${t.id}" data-cursor="Casting" data-i="${i}">
      <span class="bill-no">${V.pad(i + 1)}</span><span class="bill-name">${esc(t.name)}</span><span class="bill-as">as</span><span class="bill-role">${esc(roles[t.id] || t.genre)}</span>
    </button>`).join("");
  const peek = $("#bill-peek");
  $$("#billing .bill").forEach((b) => b.addEventListener("pointerenter", () => {
    const t = C.tracks[+b.dataset.i];
    peek.innerHTML = `${V.art(t.palette, t.motif, { seed: t.id })}<div class="peek-cap"><span>${esc(t.genre)}</span><p>${esc(t.blurb)}</p></div>`;
    peek.classList.add("on");
  }));
  $("#billing").addEventListener("pointerleave", () => peek.classList.remove("on"));
  addEventListener("pointermove", (e) => { if (peek.classList.contains("on")) peek.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 140}px) rotate(${Math.max(-6, Math.min(6, (e.movementX || 0) * 0.3))}deg)`; }, { passive: true });

  simulator();

  /* ================= SC.09 THE TRADES ================= */
  const posts = C.posts.slice(0, 4);
  const today = new Date();
  $("#trades").innerHTML = posts.length ? `
    <div class="tp-mast"><span>${esc(S.issue || "")}</span><h2>The Reel <em>Daily</em></h2><span>${today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span></div>
    <div class="tp-strap"><span>Finance</span><span>Film</span><span>Media</span><span>Entertainment</span><span>Nashville ed.</span><span>Price: free for members</span></div>
    <div class="tp-grid">
      <a class="tp-lead" href="/journal?p=${encodeURIComponent(posts[0].id)}" data-cursor="Read">
        <span class="tp-cat">${esc(posts[0].category)}</span><h3>${esc(posts[0].title)}</h3>
        <div class="tp-photo">${V.art(posts[0].palette, posts[0].motif, { image: posts[0].image, seed: posts[0].id })}</div>
        <p class="tp-dek">${esc(posts[0].excerpt)}</p><span class="tp-more">Continued on page 2 ▸</span>
      </a>
      <div class="tp-side">${posts.slice(1).map((p) => `<a class="tp-item" href="/journal?p=${encodeURIComponent(p.id)}" data-cursor="Read"><span class="tp-cat">${esc(p.category)}</span><h4>${esc(p.title)}</h4><p>${esc(p.excerpt)}</p></a>`).join("")}
        <div class="tp-box"><b>Box office</b>${upcoming.slice(0, 3).map((e) => `<div><span>${esc(e.title)}</span><span>${V.fmt(e.date, { month: "numeric", day: "numeric" }, V.evTz(e))}</span></div>`).join("")}</div>
      </div>
    </div>` : "";

  /* ================= SC.10 REVIEWS ================= */
  $("#reviews").innerHTML = (C.reviews || []).map((r, i) => `<figure class="blurb reveal reveal-d${i}"><div class="stars">${"★".repeat(r.stars || 5)}</div><blockquote>“${esc(r.q)}”</blockquote><figcaption>${esc(r.who)}</figcaption></figure>`).join("");

  /* ================= SC.11 TICKET BOOTH ================= */
  const open = S.applicationsOpen !== false && new Date(S.applicationDeadline) > new Date();
  $("#booth-line").textContent = open ? `Casting call closes ${V.fmt(S.applicationDeadline, { weekday: "long", month: "long", day: "numeric" })}` : "Applications are closed · join the list for next season";
  if (open) V.countdown($("#countdown"), S.applicationDeadline); else $("#countdown").remove();
  tearable($("#big-ticket"), () => { location.href = "/apply"; });

  function tearable(t, done) {
    const stub = $(".bt-stub", t);
    let sx = 0, dx = 0, drag = false;
    const tear = () => {
      t.classList.add("torn"); V.sfx.whoosh(); V.popcorn?.(stub, 30);
      setTimeout(done, 900);
    };
    stub.addEventListener("pointerdown", (e) => { drag = true; sx = e.clientX; stub.setPointerCapture(e.pointerId); });
    stub.addEventListener("pointermove", (e) => { if (!drag) return; dx = Math.max(0, e.clientX - sx); stub.style.transform = `translateX(${dx}px) rotate(${dx * 0.08}deg)`; });
    stub.addEventListener("pointerup", () => { drag = false; if (dx > 70) tear(); else stub.style.transform = ""; dx = 0; });
    stub.addEventListener("click", () => { if (!t.classList.contains("torn")) tear(); });
    stub.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tear(); } });
  }

  /* ================= SC.12 Q&A ================= */
  $("#faq-list").innerHTML = (C.faq || []).map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  $$("#faq-list details").forEach((d) => d.addEventListener("toggle", () => { if (d.open) $$("#faq-list details").forEach((o) => o !== d && (o.open = false)); }));

  V.fx.scan();

  /* ================= SC.08 THE PITCH (simulator) ================= */
  function simulator() {
    const root = $("#sim");
    const st = { budget: 40, pa: 25, genre: "Horror", release: "Theatrical" };
    const genres = { Horror: 3.6, Comedy: 2.2, Drama: 1.6, Action: 2.6, Animation: 3.0 };
    const releases = { Theatrical: 1, Streaming: 0.75, Hybrid: 0.9 };
    root.innerHTML = `
      <div class="sim-controls">
        <div class="eyebrow">Interactive · Deal Desk</div>
        <h2 class="h2" style="font-size:clamp(40px,4.4vw,62px)">Greenlight <em>or</em> Pass?</h2>
        <p style="color:var(--muted);margin:0 0 26px">You're the studio. Set the budget, pick a genre and a release strategy, and watch the money flow. This is the model you'll build in the Deal Room.</p>
        <div class="range"><div class="range-top"><label for="s-budget">Production budget</label><output id="o-budget"></output></div><input type="range" min="2" max="250" value="${st.budget}" id="s-budget"></div>
        <div class="range"><div class="range-top"><label for="s-pa">Prints &amp; advertising</label><output id="o-pa"></output></div><input type="range" min="1" max="150" value="${st.pa}" id="s-pa"></div>
        <div class="range"><div class="range-top"><span>Genre</span></div><div class="seg" id="s-genre" role="radiogroup" aria-label="Genre">${Object.keys(genres).map((g) => `<button role="radio" aria-checked="${g === st.genre}" class="${g === st.genre ? "on" : ""}">${g}</button>`).join("")}</div></div>
        <div class="range"><div class="range-top"><span>Release strategy</span></div><div class="seg" id="s-rel" role="radiogroup" aria-label="Release strategy">${Object.keys(releases).map((g) => `<button role="radio" aria-checked="${g === st.release}" class="${g === st.release ? "on" : ""}">${g}</button>`).join("")}</div></div>
      </div>
      <div class="sim-out" aria-live="polite">
        <div class="stamp" id="o-verdict"></div>
        <div class="mono">Projected studio profit</div>
        <div class="sim-big" id="o-profit"></div>
        <div class="sim-grid"><div><span>Worldwide gross</span><b id="o-gross"></b></div><div><span>ROI</span><b id="o-roi"></b></div><div><span>Cost-to-gross</span><b id="o-be"></b></div><div><span>Opening weekend</span><b id="o-ow"></b></div></div>
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
      const rentals = gross * 0.5, ancillary = gross * 0.38 + (st.release !== "Theatrical" ? st.budget * 0.55 : 0);
      const dist = (rentals + ancillary) * 0.12, profit = rentals + ancillary - dist - st.budget - st.pa, roi = (profit / (st.budget + st.pa)) * 100;
      $("#o-budget").textContent = "$" + st.budget + "M"; $("#o-pa").textContent = "$" + st.pa + "M";
      $$("#sim input[type=range]").forEach((el) => el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min)) * 100 + "%"));
      $("#o-profit").textContent = m(profit); $("#o-profit").style.color = profit >= 0 ? "var(--green)" : "var(--red-2)";
      $("#o-gross").textContent = m(gross); $("#o-roi").textContent = (roi >= 0 ? "+" : "") + roi.toFixed(0) + "%";
      $("#o-be").textContent = ((st.budget + st.pa) / (gross || 1)).toFixed(2) + "×";
      $("#o-ow").textContent = st.release === "Streaming" ? "N/A" : m(gross * (st.genre === "Horror" ? 0.38 : 0.3));
      const [txt, col] = roi > 60 ? ["GREENLIT ✦ FRANCHISE", "var(--green)"] : roi > 0 ? ["GREENLIT", "var(--gold)"] : roi > -25 ? ["DEVELOPMENT HELL", "#ffc75a"] : ["PASS", "var(--red-2)"];
      const v = $("#o-verdict");
      if (txt !== lastVerdict) { v.style.animation = "none"; void v.offsetWidth; v.style.animation = ""; lastVerdict = txt; V.sfx.click(); }
      v.textContent = txt; v.style.color = col;
      const parts = [["Rentals", rentals, "var(--gold)"], ["Ancillary", ancillary, "var(--gold-2)"], ["Dist. fee", -dist, "#666"], ["Budget", -st.budget, "#8a2a2a"], ["P&A", -st.pa, "#b33a3a"], ["Profit", profit, profit >= 0 ? "var(--green)" : "var(--red-2)"]];
      const max = Math.max(...parts.map((p) => Math.abs(p[1])), 1);
      $("#o-wf").innerHTML = parts.map(([l, val, c]) => `<div class="bar"><i style="height:${Math.max(2, (Math.abs(val) / max) * 100)}%;background:${c}"></i><span>${l}</span></div>`).join("");
    };
    $("#s-budget").addEventListener("input", (e) => { st.budget = +e.target.value; draw(); });
    $("#s-pa").addEventListener("input", (e) => { st.pa = +e.target.value; draw(); });
    const seg = (id, key) => $$(`#${id} button`).forEach((b) => b.addEventListener("click", () => { st[key] = b.textContent; $$(`#${id} button`).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); draw(); }));
    seg("s-genre", "genre"); seg("s-rel", "release");
    draw();
  }
});
