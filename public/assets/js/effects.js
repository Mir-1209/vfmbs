/* =========================================================================
   VFMBS CINEMA ENGINE
   · FilmLayer   WebGL celluloid overlay (grain, scratches, dust, flicker,
                 light leaks) + film-burn transitions, 24fps like real film
   · Theater     WebGL projector beam, volumetric haze & dust for the hero
   · Sound       synthesized projector, shutter clicks, whoosh (opt-in)
   · Pre-show    gate → leader countdown → velvet curtains
   · Viewfinder  autofocus cursor that locks onto whatever you point at
   · Letterbox   aspect-ratio bars that change per scene
   · Scroll      parallax, scroll-lit words, pinned reels & title sequences
   Respects prefers-reduced-motion and touch devices throughout.
   ========================================================================= */
(() => {
  const { $, $$ } = V;
  const RM = V.reduced;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = V.page;
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch {} } };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (ms, fn) => new Promise((res) => { const t0 = performance.now(); const step = (t) => { const p = clamp((t - t0) / ms); fn(p); p < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });

  /* =====================================================================
     SOUND (WebAudio, synthesized: no files)
     ===================================================================== */
  const Sound = (() => {
    let ctx, master, proj, on = V.LS.get("sound", false);
    const init = () => {
      if (ctx) return ctx;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      } catch { ctx = null; }
      return ctx;
    };
    const noise = (sec) => { const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
    const env = (g, t, a, peak, dcy) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy); };
    function projector(start) {
      if (!ctx) return;
      if (!start) { if (proj) { proj.g.gain.setTargetAtTime(0, ctx.currentTime, 0.2); const p = proj; setTimeout(() => { try { p.src.stop(); p.lfo.stop(); } catch {} }, 800); proj = null; } return; }
      if (proj) return;
      const src = ctx.createBufferSource(); src.buffer = noise(2); src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.8;
      const g = ctx.createGain(); g.gain.value = 0;
      const clk = ctx.createGain(); clk.gain.value = 0.5;
      const lfo = ctx.createOscillator(); lfo.type = "square"; lfo.frequency.value = 24;
      const lg = ctx.createGain(); lg.gain.value = 0.5;
      lfo.connect(lg).connect(clk.gain);
      src.connect(bp).connect(clk).connect(g).connect(master);
      src.start(); lfo.start();
      g.gain.setTargetAtTime(0.035, ctx.currentTime, 0.6);
      proj = { src, lfo, g };
    }
    const api = {
      get on() { return on; },
      set(v) { on = v; V.LS.set("sound", v); if (v) { init(); ctx?.resume(); if (document.body.dataset.projector) projector(true); } else projector(false); document.dispatchEvent(new CustomEvent("sound", { detail: v })); },
      unlock() { if (on) { init(); ctx?.resume(); } },
      tick() { if (!on || !init()) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = 2400; env(g, t, 0.002, 0.03, 0.03); o.connect(g).connect(master); o.start(t); o.stop(t + 0.05); },
      click() { if (!on || !init()) return; const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise(0.08); f.type = "highpass"; f.frequency.value = 2500; env(g, t, 0.001, 0.25, 0.06); s.connect(f).connect(g).connect(master); s.start(t); },
      whoosh() { if (!on || !init()) return; const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise(1); f.type = "bandpass"; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4000, t + 0.55); env(g, t, 0.25, 0.22, 0.4); s.connect(f).connect(g).connect(master); s.start(t); },
      boom() { if (!on || !init()) return; const t = ctx.currentTime; [[0, 90], [0.28, 62]].forEach(([dt, f]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f, t + dt); o.frequency.exponentialRampToValueAtTime(f / 2.4, t + dt + 0.9); env(g, t + dt, 0.015, 0.7, 1.1); o.connect(g).connect(master); o.start(t + dt); o.stop(t + dt + 1.3); }); },
      beep() { if (!on || !init()) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 1000; env(g, t, 0.005, 0.12, 0.18); o.connect(g).connect(master); o.start(t); o.stop(t + 0.25); },
      projector,
    };
    return api;
  })();
  V.sfx = Sound;

  /* =====================================================================
     WEBGL HELPERS
     ===================================================================== */
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const NOISE = `
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}`;
  function gl(canvas, fs, opts = {}) {
    const g = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: opts.power || "default" });
    if (!g) return null;
    const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) { console.warn(g.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(g.VERTEX_SHADER, VERT), f = sh(g.FRAGMENT_SHADER, "precision highp float;varying vec2 uv;" + NOISE + fs);
    if (!v || !f) return null;
    const prog = g.createProgram(); g.attachShader(prog, v); g.attachShader(prog, f); g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
    g.useProgram(prog);
    const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = {};
    const u = (name) => (U[name] ??= g.getUniformLocation(prog, name));
    return {
      g,
      set(name, ...vals) { const l = u(name); if (l == null) return; [g.uniform1f, g.uniform2f, g.uniform3f, g.uniform4f][vals.length - 1].call(g, l, ...vals); },
      size(scale) { const w = Math.max(1, Math.round(canvas.clientWidth * scale)), h = Math.max(1, Math.round(canvas.clientHeight * scale)); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; g.viewport(0, 0, w, h); } return [w, h]; },
      draw() { g.drawArrays(g.TRIANGLES, 0, 3); },
    };
  }

  /* =====================================================================
     FILM LAYER: celluloid over the whole site + film-burn transitions
     ===================================================================== */
  const FILM_FS = `
    uniform vec2 res;uniform float t;uniform float burn;uniform vec2 bo;uniform float amt;uniform float flick;
    vec4 over(vec4 a,vec4 b){float o=a.a+b.a*(1.-a.a);return vec4((a.rgb*a.a+b.rgb*b.a*(1.-a.a))/max(o,1e-4),o);}
    void main(){
      vec2 p=uv;float ar=res.x/res.y;float fr=floor(t*24.);
      vec4 c=vec4(0.);
      float vig=smoothstep(.55,1.25,length((p-.5)*vec2(ar*.75,1.)));
      c=over(vec4(0.,0.,0.,vig*.55*amt),c);
      c=over(vec4(0.,0.,0.,flick),c);
      float leak=smoothstep(.62,.95,fbm(vec2(p.x*1.3+t*.04,p.y*1.1-t*.025)+fr*.0));
      c=over(vec4(1.,.45,.12,leak*.10*amt),c);
      float g=h(gl_FragCoord.xy+fr*17.13)-.5;
      c=over(vec4(vec3(step(0.,g)),abs(g)*.11*amt),c);
      float s=0.;
      for(int i=0;i<3;i++){float fi=float(i);float r=h(vec2(fr*.37,fi));if(r>.72){float x=h(vec2(fi*9.1,floor(fr/3.)));float w=.0006+.0012*h(vec2(fr,fi*3.));s+=smoothstep(w,0.,abs(p.x-x-.002*sin(p.y*40.+fr)))*(.35+.65*n(vec2(p.y*30.,fr)));}}
      c=over(vec4(1.,.97,.9,clamp(s,0.,1.)*.35*amt),c);
      vec2 dp=p*vec2(ar,1.)*14.;vec2 cell=floor(dp+vec2(h(vec2(fr,1.))*40.,h(vec2(fr,2.))*40.));float d=h(cell+fr);
      float dust=d>.9965?smoothstep(.28,.05,length(fract(dp)-.5+(h(cell)-.5)*.3)):0.;
      float hair=0.;if(h(vec2(fr*.11,7.))>.93){vec2 hp=p-vec2(h(vec2(fr,3.)),h(vec2(fr,4.)));float cu=abs(hp.y-.03*sin(hp.x*60.)-.6*hp.x*hp.x);hair=smoothstep(.0015,0.,cu)*step(abs(hp.x),.06);}
      c=over(vec4(0.,0.,0.,max(dust,hair)*.8*amt),c);
      if(burn>0.){
        float f=fbm(p*vec2(ar,1.)*3.2+vec2(t*.2,0.));
        float dist=length((p-bo)*vec2(ar,1.))/max(ar,1.);
        float m=burn*1.9-(dist*1.1+f*.8);
        float core=smoothstep(.0,.12,m);
        float ring=smoothstep(-.06,0.,m)*(1.-core);
        float char=smoothstep(-.14,-.04,m)*(1.-smoothstep(-.04,0.,m));
        vec3 hot=mix(vec3(1.,.55,.12),vec3(1.,.97,.88),core);
        c=over(vec4(.08,.03,.01,char*.9),c);
        c=over(vec4(hot,max(core,ring)),c);
      }
      gl_FragColor=c;
    }`;
  const Film = (() => {
    if (page === "admin") return null;
    const cv = document.createElement("canvas");
    cv.className = "film-layer";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const G = RM ? null : gl(cv, FILM_FS);
    if (!G) { cv.remove(); return null; }
    document.documentElement.classList.add("has-film");
    const st = { burn: 0, bo: [0.5, 0.5], amt: 1, flick: 0, last: 0 };
    const t0 = performance.now();
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (document.hidden || now - st.last < 1000 / 24) return;
      st.last = now;
      const [w, h] = G.size(Math.min(devicePixelRatio, 1.25) * 0.75);
      st.flick = RM ? 0 : Math.random() < 0.06 ? 0.05 + Math.random() * 0.06 : 0;
      G.set("res", w, h); G.set("t", (now - t0) / 1000); G.set("burn", st.burn); G.set("bo", st.bo[0], st.bo[1]); G.set("amt", st.amt); G.set("flick", st.flick);
      G.draw();
    };
    requestAnimationFrame(frame);
    return {
      st,
      burnIn(ms = 700, x = 0.5, y = 0.5) { st.bo = [x, 1 - y]; return tween(ms, (p) => (st.burn = ease(p))); },
      burnOut(ms = 900) { st.burn = 1; return tween(ms, (p) => (st.burn = 1 - ease(p))); },
    };
  })();
  V.film = Film;

  /* =====================================================================
     PAGE TRANSITIONS: film burn → cut → frame roll
     ===================================================================== */
  function transitions() {
    if (RM || page === "admin") return;
    const arriving = ss.get("vfmbs:burn");
    ss.set("vfmbs:burn", null);
    if (arriving) {
      if (Film) { Film.st.burn = 1; requestAnimationFrame(() => Film.burnOut(900)); }
      document.documentElement.classList.add("frame-roll");
      setTimeout(() => document.documentElement.classList.remove("frame-roll"), 700);
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/") || /\.\w+$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      Sound.whoosh();
      ss.set("vfmbs:burn", 1);
      const go = () => (location.href = url.href);
      if (Film) Film.burnIn(620, e.clientX / innerWidth, e.clientY / innerHeight).then(go);
      else { document.body.style.transition = "opacity .3s"; document.body.style.opacity = 0; setTimeout(go, 300); }
    });
    addEventListener("pageshow", (e) => { if (e.persisted && Film) Film.st.burn = 0; });
  }

  /* =====================================================================
     THEATER: projector beam, volumetric haze, dust motes, screen spill
     ===================================================================== */
  const THEATER_FS = `
    uniform vec2 res;uniform float t;uniform vec2 m;uniform vec4 scr;uniform float flick;uniform float pw;uniform float lights;
    void main(){
      vec2 p=uv;float ar=res.x/res.y;
      vec3 col=mix(vec3(.010,.008,.007),vec3(.09,.06,.045),lights*(1.-p.y*.5));
      vec2 sc=(scr.xy+scr.zw)*.5;vec2 sh=(scr.zw-scr.xy)*.5;
      vec2 src=vec2(.5+(m.x-.5)*.06,1.18);
      float s=(src.y-p.y)/(src.y-scr.w);
      float cx=mix(src.x,sc.x,s);float hw=mix(.002,sh.x*1.04,s);
      float dx=(p.x-cx)*ar;float W=hw*ar;
      float inside=(1.-smoothstep(W*.82,W*1.04,abs(dx)))*step(0.,s)*step(scr.y,p.y);
      float ang=dx/max(W,.001);
      float rays=.45+.55*n(vec2(ang*7.+t*.12,s*1.5-t*.04));
      float haze=.55+.45*fbm(vec2(ang*1.6+t*.05,p.y*3.5+t*.07));
      float beam=inside*rays*haze*(.10+.34*clamp(s,0.,1.))*pw*flick;
      float halo=exp(-abs(dx)/max(W,.02)*1.4)*step(scr.y,p.y)*step(0.,s)*.05*pw;
      col+=vec3(1.,.9,.75)*halo;
      col+=vec3(1.,.93,.8)*beam;
      float mo=0.;
      for(int i=0;i<3;i++){float fi=float(i);
        vec2 g=p*vec2(ar,1.)*(38.+fi*26.)+vec2(t*(.18+fi*.1),-t*(.12+fi*.05))+(m-.5)*(4.+fi*4.);
        vec2 id=floor(g);vec2 f=fract(g)-.5;float r=h(id+fi*31.7);
        vec2 off=vec2(sin(t*.5+r*6.28),cos(t*.43+r*9.))*.32;
        mo+=smoothstep(.06+.05*r,0.,length(f-off))*step(.8,r)*(.5+.5*sin(t*2.+r*40.));}
      col+=vec3(1.,.95,.85)*mo*inside*2.2*pw;
      vec2 dd=max(abs(p-sc)-sh,0.)*vec2(ar,1.);
      float spill=exp(-length(dd)*5.)*.22*flick*pw;
      col+=vec3(1.,.88,.7)*spill;
      float floorGlow=exp(-abs(p.y-scr.y+.04)*14.)*smoothstep(sh.x*1.6,0.,abs(p.x-sc.x))*.1*pw;
      col+=vec3(1.,.85,.65)*floorGlow;
      col*=1.-.55*length((p-vec2(.5,.55))*vec2(.9,1.1));
      col+=(h(gl_FragCoord.xy+t)-.5)*.02;
      gl_FragColor=vec4(col,1.);
    }`;
  V.Theater = function (canvas, screenEl) {
    const G = gl(canvas, THEATER_FS, { power: "high-performance" });
    const st = { m: [0.5, 0.5], tm: [0.5, 0.5], pw: 0, lights: 0, flick: 1, visible: true, running: true };
    if (!G) { canvas.classList.add("no-gl"); return { st, powerUp() {}, stop() {} }; }
    const t0 = performance.now();
    addEventListener("pointermove", (e) => { st.tm = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }, { passive: true });
    new IntersectionObserver(([en]) => (st.visible = en.isIntersecting)).observe(canvas);
    const scale = innerWidth < 700 ? 0.55 : Math.min(devicePixelRatio, 1.5) * 0.7;
    const loop = (now) => {
      if (!st.running) return;
      requestAnimationFrame(loop);
      if (!st.visible || document.hidden) return;
      const [w, h] = G.size(scale);
      const cr = canvas.getBoundingClientRect(), r = screenEl.getBoundingClientRect();
      st.m[0] += (st.tm[0] - st.m[0]) * 0.05; st.m[1] += (st.tm[1] - st.m[1]) * 0.05;
      if (Math.random() < 0.05) st.flick = 0.86 + Math.random() * 0.14; else st.flick += (1 - st.flick) * 0.2;
      G.set("res", w, h); G.set("t", RM ? 1 : (now - t0) / 1000); G.set("m", st.m[0], st.m[1]);
      G.set("scr", (r.left - cr.left) / cr.width, 1 - (r.bottom - cr.top) / cr.height, (r.right - cr.left) / cr.width, 1 - (r.top - cr.top) / cr.height);
      G.set("flick", st.flick); G.set("pw", st.pw); G.set("lights", st.lights);
      G.draw();
    };
    requestAnimationFrame(loop);
    return { st, powerUp(ms = 1600) { return tween(ms, (p) => (st.pw = ease(p))); }, stop() { st.running = false; } };
  };

  /* =====================================================================
     PRE-SHOW: gate → leader → curtains (home, once per session)
     ===================================================================== */
  function preshow() {
    if (page !== "home") return Promise.resolve(false);
    if (RM || ss.get("vfmbs:seen")) return Promise.resolve(false);
    ss.set("vfmbs:seen", 1);
    V.introPlaying = true;
    document.body.classList.add("locked", "preshow-on");
    const el = document.createElement("div");
    el.className = "preshow";
    el.innerHTML = `
      <div class="ps-gate">
        <img src="/assets/brand/logo.svg" alt="" class="ps-logo">
        <p class="ps-kicker">Vanderbilt Film &amp; Media Business Society presents</p>
        <p class="ps-rule">Please silence your phones.<br>The feature is about to begin.</p>
        <div class="ps-actions">
          <button class="ps-btn" data-s="1"><span class="ps-dot"></span>Enter with sound</button>
          <button class="ps-btn ghost" data-s="0">Enter silently</button>
        </div>
        <p class="ps-meta">RUNTIME ∞ · RATED TV-FIN · 2.39:1</p>
      </div>
      <div class="ps-leader" hidden><div class="ps-sweep"></div><div class="ps-ring"></div><div class="ps-ring r2"></div><b>8</b></div>
      <div class="curtain-l"></div><div class="curtain-r"></div>`;
    document.body.append(el);
    return new Promise((resolve) => {
      $$(".ps-btn", el).forEach((b) => b.addEventListener("click", async () => {
        Sound.set(b.dataset.s === "1");
        Sound.click();
        $(".ps-gate", el).classList.add("out");
        await new Promise((r) => setTimeout(r, 500));
        const L = $(".ps-leader", el), num = $("b", L), sw = $(".ps-sweep", L);
        L.hidden = false;
        Sound.projector(true);
        for (const k of [5, 4, 3, 2]) {
          num.textContent = k;
          Sound.tick();
          await tween(560, (p) => sw.style.setProperty("--p", p * 360 + "deg"));
        }
        L.classList.add("flash");
        Sound.boom();
        await new Promise((r) => setTimeout(r, 180));
        L.remove();
        el.classList.add("open");
        resolve(true);
        setTimeout(() => { el.remove(); document.body.classList.remove("locked", "preshow-on"); V.introPlaying = false; }, 2600);
      }));
    });
  }
  V.preshow = preshow();

  /* =====================================================================
     VIEWFINDER CURSOR: corner brackets that autofocus onto targets
     ===================================================================== */
  function viewfinder() {
    if (!FINE || RM || page === "admin") return;
    const vf = document.createElement("div");
    vf.className = "vf";
    vf.innerHTML = `<i></i><i></i><i></i><i></i><span class="vf-x"></span><span class="vf-l"></span>`;
    document.body.append(vf);
    document.documentElement.classList.add("has-cursor");
    const lab = $(".vf-l", vf);
    let x = innerWidth / 2, y = innerHeight / 2, target = null, lastT = null;
    const cur = { x, y, w: 26, h: 26 };
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      vf.classList.add("on");
      const t = e.target.closest?.("[data-cursor], a, button, summary, label, input, select, textarea, [data-open], .card, .frame");
      target = t && !t.closest(".vf-ignore") ? t : null;
      if (target !== lastT) {
        lastT = target;
        if (target) { Sound.tick(); lab.textContent = "AF · " + (target.dataset.cursor || (target.matches("input,textarea,select") ? "TYPE" : target.matches("a") ? "GO" : "SELECT")).toUpperCase(); }
        vf.classList.toggle("lock", Boolean(target));
      }
    }, { passive: true });
    document.addEventListener("pointerleave", () => vf.classList.remove("on"));
    addEventListener("pointerdown", () => { vf.classList.add("down"); Sound.click(); });
    addEventListener("pointerup", () => vf.classList.remove("down"));
    const loop = () => {
      let tx = x - 13, ty = y - 13, tw = 26, th = 26;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        if (r.width < innerWidth * 0.9 && r.height < innerHeight * 0.8) { tx = r.left - 6; ty = r.top - 6; tw = r.width + 12; th = r.height + 12; }
      }
      const k = target ? 0.22 : 0.35;
      cur.x += (tx - cur.x) * k; cur.y += (ty - cur.y) * k; cur.w += (tw - cur.w) * k; cur.h += (th - cur.h) * k;
      vf.style.transform = `translate(${cur.x}px,${cur.y}px)`;
      vf.style.width = cur.w + "px"; vf.style.height = cur.h + "px";
      vf.style.setProperty("--cx", x - cur.x + "px"); vf.style.setProperty("--cy", y - cur.y + "px");
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* =====================================================================
     HUD + LETTERBOX
     ===================================================================== */
  function hud() {
    if (page === "admin") return;
    const bars = document.createElement("div");
    bars.className = "letterbox-bars";
    bars.setAttribute("aria-hidden", "true");
    bars.innerHTML = "<i></i><i></i>";
    document.body.append(bars);
    const l = document.createElement("div"), r = document.createElement("div");
    l.className = "hud"; r.className = "hud hud-r";
    l.innerHTML = `<span class="rec">REC</span><span class="tc">TC 00:00:00:00</span><span class="scene"></span>`;
    r.innerHTML = `<span class="aspect">1.85:1</span><span>24 FPS</span><button class="snd" aria-pressed="false" aria-label="Toggle sound"><i></i><i></i><i></i><i></i><span>SOUND OFF</span></button>`;
    document.body.append(l, r);
    const tc = $(".tc", l), t0 = performance.now();
    setInterval(() => {
      const f = Math.floor(((performance.now() - t0) / 1000) * 24);
      tc.textContent = `TC ${V.pad(Math.floor(f / 86400) % 24)}:${V.pad(Math.floor(f / 1440) % 60)}:${V.pad(Math.floor(f / 24) % 60)}:${V.pad(f % 24)}`;
    }, 1000 / 12);
    const snd = $(".snd", r);
    const paint = () => { snd.classList.toggle("on", Sound.on); snd.setAttribute("aria-pressed", Sound.on); $("span", snd).textContent = Sound.on ? "SOUND ON" : "SOUND OFF"; };
    snd.addEventListener("click", () => { Sound.set(!Sound.on); Sound.click(); paint(); });
    document.addEventListener("sound", paint);
    paint();
    V.hudScene = (s) => { $(".scene", l).textContent = s || ""; };
    V.hudAspect = (a) => { $(".aspect", r).textContent = a; };
  }
  const ASPECT = { "2.39": 2.39, "2.00": 2, "1.85": 1.85, "1.43": 1.43, "0": 0 };
  let aspectNow = "0";
  function setAspect(a) {
    if (a === aspectNow) return;
    aspectNow = a;
    const ratio = ASPECT[a] || 0;
    const barH = ratio ? Math.max(0, (innerHeight - innerWidth / ratio) / 2) : 0;
    document.documentElement.style.setProperty("--lb", Math.min(barH, innerHeight * 0.16) + "px");
    V.hudAspect?.(ratio ? a + ":1" : "OPEN GATE");
  }

  /* =====================================================================
     SPLIT TEXT
     ===================================================================== */
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
          o.className = "split-line"; inner.style.setProperty("--i", i++); inner.textContent = w;
          o.append(inner); out.append(o);
        });
      } else if (node.nodeName === "BR") out.append(node.cloneNode());
      else { const c = node.cloneNode(false); [...node.childNodes].forEach((x) => c.append(wrap(x))); out.append(c); }
      return out;
    };
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((c) => frag.append(wrap(c)));
    el.innerHTML = ""; el.append(frag);
  }

  /* =====================================================================
     POINTER FX: magnetic, spotlight, ticket tilt
     ===================================================================== */
  function pointerFx() {
    if (!FINE || RM) return;
    document.addEventListener("pointermove", (e) => {
      const m = e.target.closest?.(".magnetic");
      if (m) { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`; }
      const s = e.target.closest?.(".spot");
      if (s) { const r = s.getBoundingClientRect(); s.style.setProperty("--mx", e.clientX - r.left + "px"); s.style.setProperty("--my", e.clientY - r.top + "px"); }
      const t = e.target.closest?.("[data-tilt]");
      if (t) { const r = t.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; t.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 10}deg)`; t.style.setProperty("--fx", px * 100 + "%"); t.style.setProperty("--fy", py * 100 + "%"); }
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const m = e.target.closest?.(".magnetic"); if (m && !m.contains(e.relatedTarget)) m.style.transform = "";
      const t = e.target.closest?.("[data-tilt]"); if (t && !t.contains(e.relatedTarget)) t.style.transform = "";
    });
  }

  /* =====================================================================
     SCROLL CHOREOGRAPHY
     ===================================================================== */
  let parallax = [], manifestos = [], pipes = [], marquees = [], seqs = [], scenes = [];
  function scan(root = document) {
    if (!RM) $$("[data-split]", root).forEach(split);
    parallax = $$("[data-parallax]");
    manifestos = $$(".manifesto").map((m) => {
      if (!m.dataset.wired) {
        m.dataset.wired = 1;
        $$(".m-text", m).forEach((p) => {
          const tmp = document.createElement("div"); tmp.innerHTML = p.innerHTML;
          const words = [];
          const walk = (n, gold) => { if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => w && words.push(/^\s+$/.test(w) ? " " : `<span class="w${gold ? " gold" : ""}">${V.esc(w)}</span>`)); else [...n.childNodes].forEach((c) => walk(c, gold || n.nodeName === "EM")); };
          walk(tmp, false);
          p.innerHTML = words.join("");
        });
      }
      return { el: m, words: $$(".w", m) };
    });
    pipes = $$(".pipeline").map((p) => ({ el: p, track: $(".pipe-track", p), bar: $(".pipe-progress i", p) }));
    seqs = $$("[data-seq]").map((el) => ({ el, cards: $$(".seq-card", el), last: -1 }));
    scenes = $$("[data-scene], [data-aspect]");
    sizePinned();
    marquees = $$(".marquee-big .mq").map((m) => ({ el: m, x: 0, dir: m.dataset.dir === "right" ? 1 : -1 }));
    V.reveal?.(root);
    V.counters?.(root);
    onScroll();
  }
  function sizePinned() {
    pipes.forEach((p) => {
      if (innerWidth <= 900 || RM) { p.el.style.height = ""; return; }
      p.el.style.height = innerHeight + Math.max(0, p.track.scrollWidth - innerWidth) + "px";
    });
    seqs.forEach((s) => { s.el.style.height = (RM ? 1 : s.cards.length * 0.9 + 0.6) * innerHeight + "px"; });
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const vh = innerHeight;
      if (!RM) parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        const f = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -f).toFixed(1)}px, 0)`;
      });
      manifestos.forEach(({ el, words }) => {
        const r = el.getBoundingClientRect();
        const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
        const n = RM ? words.length : Math.round(p * words.length * 1.15);
        words.forEach((w, i) => w.classList.toggle("lit", i < n));
      });
      pipes.forEach((p) => {
        if (innerWidth <= 900 || RM) return;
        const r = p.el.getBoundingClientRect();
        const prog = clamp(-r.top / (p.el.offsetHeight - vh || 1));
        p.track.style.transform = `translate3d(${-prog * Math.max(0, p.track.scrollWidth - innerWidth)}px,0,0)`;
        if (p.bar) p.bar.style.transform = `scaleX(${prog})`;
      });
      seqs.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        const prog = clamp(-r.top / (s.el.offsetHeight - vh || 1));
        const f = prog * s.cards.length;
        const i = Math.min(s.cards.length - 1, Math.floor(f));
        s.el.style.setProperty("--sp", prog.toFixed(4));
        s.cards.forEach((c, k) => { c.style.setProperty("--cp", clamp(f - k).toFixed(3)); c.classList.toggle("on", k === i); });
        if (i !== s.last && r.top < vh * 0.5 && r.bottom > vh * 0.5) { s.last = i; Sound.click(); }
      });
      let best = null;
      for (const el of scenes) { const r = el.getBoundingClientRect(); if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) best = el; }
      setAspect(best?.dataset.aspect || "0");
      V.hudScene?.(best?.dataset.scene || "");
    });
  }
  function marqueeLoop() {
    if (RM) return;
    let last = performance.now(), lastY = scrollY, vel = 0;
    const loop = (t) => {
      const dt = Math.min(64, t - last); last = t;
      const dy = scrollY - lastY; lastY = scrollY; vel += (dy - vel) * 0.1;
      marquees.forEach((m) => {
        const w = m.el.scrollWidth / 2; if (!w) return;
        m.x += m.dir * (0.05 * dt + Math.abs(vel) * 0.6) * (vel < -1 ? -1 : 1);
        if (m.x <= -w) m.x += w; if (m.x > 0) m.x -= w;
        m.el.style.transform = `translate3d(${m.x}px,0,0) skewX(${clamp(-vel * 0.4, -8, 8)}deg)`;
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { sizePinned(); aspectNow = null; onScroll(); });
  document.addEventListener("pointerdown", () => Sound.unlock(), { once: true });
  if (page !== "admin") document.addEventListener("mouseover", (e) => { if (e.target.closest?.(".btn, .nav-links a")) Sound.tick(); });

  V.fx = { scan, split, setAspect, tween, ease };
  transitions();
  viewfinder();
  pointerFx();
  hud();
  marqueeLoop();
  V.ready.then(() => requestAnimationFrame(() => scan()));
})();
