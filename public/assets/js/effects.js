/* =========================================================================
   VFMBS effects. Every effect respects prefers-reduced-motion and touch devices.
   V.fx.scan(root) wires newly rendered content.
   ========================================================================= */
(() => {
  const { $, $$ } = V;
  const RM = V.reduced;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = V.page;
  const ssGet = (k) => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const ssSet = (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch {} };

  /* ---------------- Intro: film leader 3-2-1 → logo ---------------- */
  function intro() {
    if (page !== "home" || RM || ssGet("vfmbs:intro")) return;
    ssSet("vfmbs:intro", 1);
    V.introPlaying = true;
    const el = document.createElement("div");
    el.className = "intro";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
      <div class="intro-frame"></div>
      <div class="intro-meta"><span>VFMBS · REEL 01</span><span>${V.pad(new Date().getMonth() + 1)}.${V.pad(new Date().getDate())} · 24 FPS</span></div>
      <div class="leader"><div class="sweep"></div><div class="ring"></div><div class="ring r2"></div><b>3</b></div>
      <div class="intro-logo"><img src="/assets/brand/logo.svg" alt=""><p>Vanderbilt Film &amp; Media Business Society presents</p></div>
      <button class="intro-skip">Skip intro</button>`;
    document.body.append(el);
    document.body.classList.add("locked");
    const num = $("b", el), sweep = $(".sweep", el);
    let n = 3, t0 = performance.now(), done = false;
    const STEP = 520;
    const loop = (t) => {
      if (done) return;
      const p = ((t - t0) % STEP) / STEP;
      sweep.style.setProperty("--p", p * 360 + "deg");
      const k = 3 - Math.floor((t - t0) / STEP);
      if (k !== n && k > 0) { n = k; num.textContent = k; }
      if (k <= 0) return showLogo();
      requestAnimationFrame(loop);
    };
    const showLogo = () => {
      if (el.classList.contains("logo")) return;
      el.classList.add("logo");
      setTimeout(finish, 1300);
    };
    const finish = () => {
      if (done) return;
      done = true;
      el.classList.add("zoom");
      setTimeout(() => { el.classList.add("done"); document.body.classList.remove("locked"); V.introPlaying = false; }, 650);
      setTimeout(() => el.remove(), 1400);
    };
    $(".intro-skip", el).addEventListener("click", finish);
    el.addEventListener("click", (e) => { if (!e.target.closest(".intro-skip")) finish(); });
    requestAnimationFrame(loop);
  }

  /* ---------------- Page transitions: shutter curtain ---------------- */
  function curtain() {
    if (RM || page === "admin") return;
    const c = document.createElement("div");
    c.className = "curtain";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML = [0, 1, 2, 3, 4].map((i) => `<i style="--i:${i}"></i>`).join("");
    const logo = document.createElement("div");
    logo.className = "curtain-logo";
    logo.innerHTML = `<img src="/assets/brand/logo.svg" alt="">`;
    document.body.append(c, logo);
    if (ssGet("vfmbs:curtain")) {
      ssSet("vfmbs:curtain", null);
      c.classList.add("cover");
      $$("i", c).forEach((i) => (i.style.transition = "none"));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        $$("i", c).forEach((i) => (i.style.transition = ""));
        c.classList.add("lift");
        c.classList.remove("cover");
      }));
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (/\.(pdf|png|jpe?g|svg|ics|json|zip)$/i.test(url.pathname)) return;
      e.preventDefault();
      c.classList.remove("lift");
      c.classList.add("cover");
      ssSet("vfmbs:curtain", 1);
      setTimeout(() => (location.href = url.href), 520);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { c.classList.remove("cover"); ssSet("vfmbs:curtain", null); } });
  }

  /* ---------------- Cursor ---------------- */
  function cursor() {
    if (!FINE || RM || page === "admin") return;
    const ring = document.createElement("div"), dot = document.createElement("div");
    ring.className = "cursor";
    ring.innerHTML = "<span></span>";
    dot.className = "cursor-dot";
    document.body.append(ring, dot);
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      document.body.classList.add("cursor-on");
      dot.style.transform = `translate(${x}px,${y}px)`;
      const t = e.target.closest?.("[data-cursor], a, button, input, textarea, select, label, summary, [data-open]");
      const label = t?.closest?.("[data-cursor]")?.dataset.cursor;
      ring.classList.toggle("label", Boolean(label));
      ring.classList.toggle("hover", Boolean(t) && !label);
      $("span", ring).textContent = label || "";
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("cursor-on"));
    addEventListener("pointerdown", () => ring.classList.add("down"));
    addEventListener("pointerup", () => ring.classList.remove("down"));
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------------- Magnetic buttons & spotlight & tilt ---------------- */
  function pointerFx() {
    if (!FINE || RM) return;
    document.addEventListener("pointermove", (e) => {
      const m = e.target.closest?.(".magnetic");
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      }
      const s = e.target.closest?.(".spot");
      if (s) {
        const r = s.getBoundingClientRect();
        s.style.setProperty("--mx", e.clientX - r.left + "px");
        s.style.setProperty("--my", e.clientY - r.top + "px");
      }
      const t = e.target.closest?.("[data-tilt]");
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        t.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 10}deg)`;
        t.style.setProperty("--fx", px * 100 + "%");
        t.style.setProperty("--fy", py * 100 + "%");
      }
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const m = e.target.closest?.(".magnetic");
      if (m && !m.contains(e.relatedTarget)) m.style.transform = "";
      const t = e.target.closest?.("[data-tilt]");
      if (t && !t.contains(e.relatedTarget)) t.style.transform = "";
    });
  }

  /* ---------------- Split text ---------------- */
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = 1;
    let i = 0;
    const wrap = (node) => {
      const out = document.createDocumentFragment();
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return out.append(document.createTextNode(" "));
          const o = document.createElement("span"), inner = document.createElement("span");
          o.className = "split-line";
          inner.style.setProperty("--i", i++);
          inner.textContent = w;
          o.append(inner);
          out.append(o);
        });
      } else if (node.nodeName === "BR") out.append(node.cloneNode());
      else {
        const clone = node.cloneNode(false);
        [...node.childNodes].forEach((c) => clone.append(wrap(c)));
        out.append(clone);
      }
      return out;
    };
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((c) => frag.append(wrap(c)));
    el.innerHTML = "";
    el.append(frag);
  }

  /* ---------------- Scroll-driven effects ---------------- */
  let parallax = [], manifestos = [], pipes = [], marquees = [];
  function scan(root = document) {
    if (!RM) $$("[data-split]", root).forEach(split);
    parallax = $$("[data-parallax]");
    manifestos = $$(".manifesto").map((m) => {
      if (!m.dataset.wired) {
        m.dataset.wired = 1;
        $$(".m-text", m).forEach((p) => {
          const html = p.innerHTML;
          const tmp = document.createElement("div");
          tmp.innerHTML = html;
          const words = [];
          const walk = (n, gold) => {
            if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => w && words.push(/^\s+$/.test(w) ? " " : `<span class="w${gold ? " gold" : ""}">${V.esc(w)}</span>`));
            else [...n.childNodes].forEach((c) => walk(c, gold || n.nodeName === "EM"));
          };
          walk(tmp, false);
          p.innerHTML = words.join("");
        });
      }
      return { el: m, words: $$(".w", m) };
    });
    pipes = $$(".pipeline").map((p) => ({ el: p, track: $(".pipe-track", p), bar: $(".pipe-progress i", p) }));
    sizePipes();
    marquees = $$(".marquee-big .mq").map((m) => ({ el: m, x: 0, dir: m.dataset.dir === "right" ? 1 : -1 }));
    V.reveal?.(root);
    V.counters?.(root);
    onScroll();
  }
  function sizePipes() {
    pipes.forEach((p) => {
      if (innerWidth <= 900 || RM) { p.el.style.height = ""; return; }
      const extra = p.track.scrollWidth - innerWidth;
      p.el.style.height = innerHeight + Math.max(0, extra) + "px";
    });
  }
  let ticking = false, lastY = scrollY, vel = 0;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const vh = innerHeight;
      if (!RM) parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const f = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -f).toFixed(1)}px, 0)`;
      });
      manifestos.forEach(({ el, words }) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
        const n = RM ? words.length : Math.round(p * words.length * 1.15);
        words.forEach((w, i) => w.classList.toggle("lit", i < n));
      });
      pipes.forEach((p) => {
        if (innerWidth <= 900 || RM) return;
        const r = p.el.getBoundingClientRect();
        const total = p.el.offsetHeight - vh;
        const prog = Math.min(1, Math.max(0, -r.top / (total || 1)));
        const extra = p.track.scrollWidth - innerWidth;
        p.track.style.transform = `translate3d(${-prog * extra}px,0,0)`;
        if (p.bar) p.bar.style.transform = `scaleX(${prog})`;
      });
    });
  }

  function marqueeLoop() {
    if (RM) return;
    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min(64, t - last);
      last = t;
      const dy = scrollY - lastY;
      lastY = scrollY;
      vel += (dy - vel) * 0.1;
      marquees.forEach((m) => {
        const w = m.el.scrollWidth / 2;
        if (!w) return;
        m.x += m.dir * (0.05 * dt + Math.abs(vel) * 0.6) * (vel < -1 ? -1 : 1);
        if (m.x <= -w) m.x += w;
        if (m.x > 0) m.x -= w;
        m.el.style.transform = `translate3d(${m.x}px,0,0) skewX(${Math.max(-8, Math.min(8, -vel * 0.4))}deg)`;
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------------- HUD: timecode ---------------- */
  function hud() {
    if (page === "admin" || page === "ticket") return;
    const l = document.createElement("div"), r = document.createElement("div");
    l.className = "hud";
    r.className = "hud hud-r";
    l.setAttribute("aria-hidden", "true");
    r.setAttribute("aria-hidden", "true");
    l.innerHTML = `<span class="rec">REC</span><span class="tc">TC 00:00:00:00</span>`;
    r.innerHTML = `<span>2.39:1</span><span>24 FPS</span><span>${String(page || "").toUpperCase()}</span>`;
    document.body.append(l, r);
    const tc = $(".tc", l), t0 = performance.now();
    setInterval(() => {
      const f = Math.floor(((performance.now() - t0) / 1000) * 24);
      tc.textContent = `TC ${V.pad(Math.floor(f / 86400))}:${V.pad(Math.floor(f / 1440) % 60)}:${V.pad(Math.floor(f / 24) % 60)}:${V.pad(f % 24)}`;
    }, 1000 / 12);
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { sizePipes(); onScroll(); });

  V.fx = { scan, split };
  intro();
  curtain();
  cursor();
  pointerFx();
  hud();
  marqueeLoop();
  V.ready.then(() => requestAnimationFrame(() => scan()));
})();
