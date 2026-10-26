/* =========================================================================
   THE WORLD: you walk out of the theater and into the movies.
   · Establishing shots, scrubbed by scroll: Hollywood Hills → Manhattan →
     a rain-soaked stage-door alley. Every layer is hand-built vector art.
   · Transitions: tilt up into the night sky, a smash cut, a dolly through
     a single lit window, and a stage door that opens onto daylight.
   · The skies run on real local time (L.A. and New York), so the world
     looks different every time you come back.
   · Then: the Hall of Hits, a white gallery of one-sheets whose box office
     numbers roll in like a counting machine.
   ========================================================================= */
V.ready.then((C) => {
  const { $, $$, esc } = V;
  const RM = V.reduced;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eo = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  let seed = 1;
  const rs = (s) => (seed = s);
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const f1 = (n) => Math.round(n * 10) / 10;
  const em = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const safe = (u) => V.safeUrl(u) || "#";

  /* ---------- real local time ---------- */
  const hourIn = (tz) => {
    try {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
      return (+p.find((x) => x.type === "hour").value % 24) + +p.find((x) => x.type === "minute").value / 60;
    } catch { return 19; }
  };
  const clock = (tz) => { try { return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date()); } catch { return ""; } };
  const laH = hourIn("America/Los_Angeles");
  // ?tod=dawn|day|golden|dusk|night previews any time of day
  const forced = new URLSearchParams(location.search).get("tod");
  const TOD = ["dawn", "day", "golden", "dusk", "night"].includes(forced) ? forced : laH >= 5 && laH < 7.5 ? "dawn" : laH >= 7.5 && laH < 16 ? "day" : laH >= 16 && laH < 18.5 ? "golden" : laH >= 18.5 && laH < 20.5 ? "dusk" : "night";
  const TOD_LABEL = { dawn: "DAWN", day: "DAY", golden: "GOLDEN HOUR", dusk: "DUSK", night: "NIGHT" }[TOD];
  //            sky top    sky mid    horizon    sun        far ridge  sign hill  near hills haze
  const PAL = {
    dawn:   ["#24305a", "#9a6f9c", "#f6b58c", "#ffe2b0", "#6b5a83", "#3d3354", "#1e1a2c", "rgba(246,181,140,.35)"],
    day:    ["#3f7cc6", "#8fbbe6", "#e4edf3", "#fff8e2", "#7d8fa8", "#6b6f5c", "#3c3f30", "rgba(228,237,243,.45)"],
    golden: ["#36508f", "#df8c5e", "#ffcd7a", "#ffbe55", "#8a6a74", "#5a4436", "#2c2119", "rgba(255,205,122,.35)"],
    dusk:   ["#161a44", "#76406f", "#f2905f", "#ff8a5c", "#4b3a5f", "#2a2138", "#120e1a", "rgba(242,144,95,.3)"],
    night:  ["#03050c", "#0b1230", "#2a2747", "#f3ead2", "#171a2e", "#0f101b", "#07070d", "rgba(255,170,90,.16)"],
  }[TOD];
  const daylight = TOD === "day" || TOD === "golden";

  /* ---------- helpers for vector art ---------- */
  const smooth = (pts, base = 900) => {
    let d = `M${pts[0][0]} ${base}L${pts[0][0]} ${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      d += `Q${f1(x0)} ${f1(y0)} ${f1((x0 + x1) / 2)} ${f1((y0 + y1) / 2)}`;
    }
    const L = pts[pts.length - 1];
    return d + `L${f1(L[0])} ${f1(L[1])}L${L[0]} ${base}Z`;
  };
  const ridgePts = (x0, x1, step, base, amp, s, pull = 0.35) => {
    rs(s); const out = []; let y = base;
    for (let x = x0; x <= x1 + step; x += step) { y += (rnd() - 0.5) * amp; y = y * (1 - pull) + base * pull; out.push([x, y]); }
    return out;
  };
  const yAt = (pts, x) => {
    for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const [a, ay] = pts[i - 1], [b, by] = pts[i]; return lerp(ay, by, (x - a) / (b - a)); }
    return pts[pts.length - 1][1];
  };
  // chaparral: little scrub bushes that give the hills texture
  const scrub = (pts, s, n, col = "rgba(0,0,0,.22)") => {
    rs(s); let d = "";
    for (let i = 0; i < n; i++) { const x = rnd() * 1600, y = yAt(pts, x) + 8 + rnd() * 140, r = 2 + rnd() * 5; d += `M${f1(x - r)} ${f1(y)}a${f1(r)} ${f1(r * 0.7)} 0 0 1 ${f1(r * 2)} 0z`; }
    return `<path d="${d}" fill="${col}"/>`;
  };
  const palm = (x, base, h, lean, s, col) => {
    rs(s);
    const tx = x + lean, ty = base - h;
    let g = `<path d="M${x - 7} ${base} Q${x + lean * 0.35} ${base - h * 0.55} ${tx - 2.2} ${ty} L${tx + 2.2} ${ty} Q${x + lean * 0.35 + 6} ${base - h * 0.55} ${x + 7} ${base}Z" fill="${col}"/>`;
    for (let i = 0; i < 11; i++) {
      const a = (i / 10) * Math.PI * 1.15 - Math.PI * 0.07 + (rnd() - 0.5) * 0.2;
      const len = h * (0.24 + rnd() * 0.12), dir = Math.cos(a), up = Math.sin(a);
      const ex = tx + dir * len, ey = ty - up * len * 0.35 + len * 0.42;
      const cx = tx + dir * len * 0.5, cy = ty - len * (0.32 + up * 0.18);
      g += `<path d="M${f1(tx)} ${f1(ty)}Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}Q${f1(cx + dir * 4)} ${f1(cy + 10)} ${f1(tx)} ${f1(ty + 3)}Z" fill="${col}"/>`;
    }
    return g;
  };

  /* =====================================================================
     SCENE 1 · EXT. HOLLYWOOD HILLS
     ===================================================================== */
  const SIGN = "GREENLIGHT";
  const signHill = [[-60, 760], [240, 720], [480, 650], [700, 560], [900, 470], [1060, 418], [1170, 412], [1290, 446], [1440, 520], [1680, 590]];
  const farA = ridgePts(-40, 1640, 80, 470, 70, 4, 0.22);
  const nearA = ridgePts(-40, 1640, 60, 690, 60, 9, 0.3);
  function sceneLA() {
    // houses twinkling on the near hills
    rs(21); let homes = "";
    for (let i = 0; i < 90; i++) { const x = rnd() * 1600, y = yAt(nearA, x) + 14 + rnd() * 150; homes += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.9 + rnd() * 1.4)}" class="${rnd() < 0.3 ? "tw" : ""}" style="--d:${f1(rnd() * 6)}s"/>`; }
    // the sign: one letter at a time, planted on the slope
    const letters = [...SIGN].map((ch, i) => {
      const x = 700 + i * 46 + (i > 4 ? 8 : 0), y = 606 - i * 15.5;
      rs(40 + i); const r = (rnd() - 0.5) * 3;
      return `<g class="w-lt" style="--i:${i}" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(r)})"><g class="w-lt-in"><path d="M6 0V26M34 0V26M2 14H38" stroke="rgba(30,25,22,.75)" stroke-width="2"/><text x="20" y="0" text-anchor="middle">${ch}</text></g></g>`;
    }).join("");
    const palms = [palm(70, 900, 430, 24, 3, "#060507"), palm(170, 900, 330, -18, 5, "#060507"), palm(1430, 900, 470, -30, 7, "#060507"), palm(1530, 900, 360, 14, 8, "#060507"), palm(1290, 900, 300, 10, 11, "#08070a")].join("");
    let rail = `<path d="M-10 838 C 400 826 1200 826 1610 840" stroke="#2b2a2e" stroke-width="7" fill="none"/><path d="M-10 852 C 400 840 1200 840 1610 854" stroke="#18171a" stroke-width="5" fill="none"/>`;
    for (let x = 20; x < 1600; x += 92) rail += `<rect x="${x}" y="${f1(832 - Math.sin((x / 1600) * Math.PI) * 10)}" width="6" height="60" fill="#121114"/>`;
    return `
      <div class="w-sky" style="--s1:${PAL[0]};--s2:${PAL[1]};--s3:${PAL[2]}"></div>
      ${daylight || TOD === "dawn" ? `<div class="w-clouds" data-l="clouds"><i style="--x:8%;--y:16%;--w:34vw"></i><i style="--x:52%;--y:9%;--w:42vw"></i><i style="--x:30%;--y:28%;--w:26vw"></i><i style="--x:78%;--y:24%;--w:30vw"></i></div>` : ""}
      <div class="w-sun ${TOD === "night" ? "moon" : ""}" style="--sun:${PAL[3]}" data-l="sun"></div>
      <div class="w-beams ${daylight ? "faint" : ""}" data-l="beams"><i style="--a:-24deg;--d:9s"></i><i style="--a:8deg;--d:12s;--x:58%"></i><i style="--a:30deg;--d:10.5s;--x:76%"></i></div>
      <svg class="w-layer" data-l="far" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><path d="${smooth(farA)}" fill="${PAL[4]}"/><rect width="1600" height="900" fill="url(#hz-la)" opacity=".9"/><defs><linearGradient id="hz-la" x1="0" y1="0" x2="0" y2="1"><stop offset=".42" stop-color="${PAL[7]}" stop-opacity="0"/><stop offset=".62" stop-color="${PAL[7]}"/><stop offset="1" stop-color="${PAL[7]}" stop-opacity="0"/></linearGradient></defs></svg>
      <svg class="w-layer" data-l="sign" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="g-sign" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${PAL[5]}"/><stop offset="1" stop-color="${PAL[6]}"/></linearGradient><linearGradient id="g-rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${PAL[3]}" stop-opacity="0"/><stop offset=".7" stop-color="${PAL[3]}" stop-opacity=".35"/><stop offset="1" stop-color="${PAL[3]}" stop-opacity="0"/></linearGradient></defs><path d="${smooth(signHill)}" fill="url(#g-sign)"/><path d="${smooth(signHill.map(([x, y]) => [x, y + 3]))}" fill="none" stroke="url(#g-rim)" stroke-width="3"/>${scrub(signHill, 13, 160)}<g class="w-sign">${letters}</g><path d="M1150 414 l6 -64 l6 64z M1156 344 h2 v-8 h-2z" fill="#1a1620" opacity=".75"/></svg>
      <svg class="w-layer" data-l="near" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="g-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PAL[6]}"/><stop offset="1" stop-color="#050407"/></linearGradient></defs><path d="${smooth(nearA)}" fill="url(#g-near)"/>${scrub(nearA, 17, 120, "rgba(0,0,0,.35)")}<g class="w-homes" fill="#ffd38a">${homes}</g></svg>
      <svg class="w-layer" data-l="front" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><rect y="860" width="1600" height="40" fill="#060507"/>${rail}<path d="M1340 900 V600 q0 -18 18 -18 h44" stroke="#0b0a0c" stroke-width="8" fill="none"/><ellipse cx="1404" cy="586" rx="16" ry="6" fill="#fff1c9" class="w-lamp"/>${palms}</svg>
      <div class="w-car" aria-hidden="true"></div>`;
  }

  /* =====================================================================
     SCENE 2 · EXT. MANHATTAN · NIGHT
     ===================================================================== */
  const TARGET = { x: 812, y: 560 }; // the lit window we dolly through
  function sceneNY() {
    rs(77);
    let far = "", mid = "", warm = "", cool = "", flick = "", tops = "", lights = "";
    for (let x = -20; x < 1620;) { const w = 34 + rnd() * 52, h = 120 + rnd() * 190; far += `<rect x="${f1(x)}" y="${f1(720 - h)}" width="${f1(w)}" height="${f1(h + 120)}"/>`; x += w - 4; }
    const win = (x0, y0, w, h, dens, cols = 0) => {
      const cw = 11, ch = 15;
      for (let y = y0 + 10; y < y0 + h - 8; y += ch) for (let x = x0 + 6; x < x0 + w - 8; x += cw) {
        const r = rnd();
        if (r < dens) { const d = `M${f1(x)} ${f1(y)}h5v8h-5z`; if (rnd() < 0.82) warm += d; else cool += d; }
        else if (r < dens + 0.012 && cols < 26) { flick += `<rect x="${f1(x)}" y="${f1(y)}" width="5" height="8" class="fl" style="--d:${f1(rnd() * 9)}s"/>`; cols++; }
      }
    };
    const B = [];
    const box = (x, w, h, wt = false) => { B.push(`<rect x="${x}" y="${760 - h}" width="${w}" height="${h + 40}"/>`); win(x, 760 - h, w, h, 0.36); if (wt) tops += `<g transform="translate(${x + w * 0.6} ${760 - h})"><path d="M-12 -4 V-30 q12 -8 24 0 V-4z M-14 -30 l14 -12 l14 12z" /><path d="M-10 0 l-3 -6 M10 0 l3 -6" stroke="#06070c" stroke-width="2"/></g>`; };
    box(-10, 120, 300, true); box(100, 90, 230); box(560, 110, 330, true); box(1180, 100, 260, true); box(1270, 130, 340); box(1500, 120, 250, true); box(860, 80, 250);
    // the stepped tower with the mast (Empire-ish)
    B.push(`<path d="M190 760 V470 h20 V430 h18 V380 h14 V300 h8 V230 h2 V300 h8 V380 h14 V430 h18 V470 h20 V760z"/>`);
    win(190, 470, 140, 290, 0.42); win(208, 430, 104, 40, 0.3); win(228, 380, 64, 50, 0.3);
    lights += `<circle cx="261" cy="232" r="3" class="w-blink"/>`;
    // the crown tower (Chrysler-ish)
    B.push(`<path d="M980 760 V420 h8 V380 q32 -40 64 0 h8 V420 h8 V760z"/><path d="M1030 330 q0 -40 0 -110 q0 70 0 110z" stroke="#0a0d18" stroke-width="3"/>`);
    win(980, 420, 96, 340, 0.4);
    for (let i = 0; i < 5; i++) { const r = 34 - i * 6, y = 392 - i * 14; tops += `<path d="M${1028 - r} ${y} q${r} -${r * 0.9} ${r * 2} 0" stroke="#d9d3c4" stroke-width="2" fill="none" opacity=".75"/><path d="M${1028 - r + 6} ${y} l4 -6 M${1028 + r - 10} ${y} l4 -6" stroke="#ffe8b0" stroke-width="2" opacity=".55"/>`; }
    lights += `<circle cx="1028" cy="222" r="2.5" class="w-blink" style="animation-delay:.7s"/>`;
    // the tower with THE window
    B.push(`<rect x="700" y="400" width="200" height="400"/>`);
    win(700, 400, 200, 360, 0.3);
    B.push(`<rect x="380" y="480" width="160" height="320"/>`); win(380, 480, 160, 280, 0.38);
    B.push(`<rect x="1080" y="520" width="90" height="280"/>`); win(1080, 520, 90, 240, 0.4);
    mid = B.join("");
    const target = `<g class="w-target"><rect x="${TARGET.x - 9}" y="${TARGET.y - 12}" width="18" height="24" fill="#ffd27a"/><rect x="${TARGET.x - 9}" y="${TARGET.y - 12}" width="18" height="24" fill="url(#w-room)"/><path d="M${TARGET.x} ${TARGET.y - 12}v24M${TARGET.x - 9} ${TARGET.y}h18" stroke="#3b2a12" stroke-width=".8"/></g>`;
    // the bridge in the foreground
    let cables = "";
    for (let i = 0; i < 16; i++) { const t = i / 15; cables += `<path d="M300 520 L${f1(-60 + t * 360)} ${f1(790 - t * 6)}" /><path d="M420 520 L${f1(420 + t * 900)} ${f1(790 - Math.sin(t * Math.PI) * 30)}" />`; }
    const deck = `<path d="M-20 792 C 500 770 1100 770 1620 796" stroke="#05060b" stroke-width="14" fill="none"/>`;
    return `
      <div class="w-sky ny"></div>
      <div class="w-moon" data-l="moon"></div>
      <svg class="w-layer" data-l="far" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><g fill="#121a33">${far}</g><rect y="600" width="1600" height="200" fill="url(#glow-ny)"/><defs><linearGradient id="glow-ny" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9d4d" stop-opacity="0"/><stop offset="1" stop-color="#ff9d4d" stop-opacity=".22"/></linearGradient></defs></svg>
      <svg class="w-layer" data-l="mid" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
        <defs><radialGradient id="w-room" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff4d6"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>
        <g fill="#070a14">${mid}</g><g fill="#070a14">${tops}</g>
        <path d="${warm}" fill="#ffcf7a" opacity=".85"/><path d="${cool}" fill="#bcd6ff" opacity=".6"/><g fill="#ffd994">${flick}</g>${target}<g fill="#ff3b3b">${lights}</g>
        <rect y="790" width="1600" height="110" fill="#04050a"/><g class="w-refl">${[160, 260, 450, 760, 800, 1030, 1220, 1320].map((x, i) => `<rect x="${x}" y="800" width="${10 + (i % 3) * 8}" height="90" fill="url(#refl)"/>`).join("")}</g>
        <defs><linearGradient id="refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc56b" stop-opacity=".5"/><stop offset="1" stop-color="#ffc56b" stop-opacity="0"/></linearGradient></defs>
      </svg>
      <svg class="w-layer" data-l="bridge" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
        <g stroke="#4a5578" stroke-width="1.6" fill="none" opacity=".75">${cables}</g>
        <path d="M282 900 V520 h156 V900 h-40 V680 q-18 -60 -38 0 V900 h-0 V680 q-18 -60 -38 0 V900z" fill="#06070d"/>
        <path d="M300 600 q0 -50 20 -60 q20 10 20 60z M380 600 q0 -50 20 -60 q20 10 20 60z" fill="#ffcf8a" opacity=".22"/><path d="M282 520 h156 v10 h-156z" fill="#2c3352"/><rect x="282" y="530" width="156" height="370" fill="url(#uplight)"/><defs><linearGradient id="uplight" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".22"/><stop offset=".6" stop-color="#ffcf8a" stop-opacity="0"/></linearGradient></defs>
        ${deck}
        <g fill="#ffe7b5" class="w-bulbrow">${Array.from({ length: 14 }, (_, i) => `<circle cx="${60 + i * 118}" cy="${f1(770 - Math.sin((i / 13) * Math.PI) * 12)}" r="2.2" class="w-bulb" style="--d:${(i % 5) * 0.4}s"/>`).join("")}</g>
      </svg>
      <svg class="w-layer" data-l="trails" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><path class="w-trail w" d="M-20 784 C 500 762 1100 762 1620 788" /><path class="w-trail r" d="M1620 790 C 1100 768 500 768 -20 788" /></svg>`;
  }

  /* =====================================================================
     SCENE 3 · EXT. STAGE DOOR ALLEY · RAIN
     ===================================================================== */
  const VP = { x: 800, y: 470 };
  function sceneAlley() {
    // brick courses converge on the vanishing point
    let lw = "", rw = "";
    for (let i = 0; i <= 34; i++) {
      const y = -40 + i * 28, t = (y - VP.y) / (900 - VP.y + 400);
      const ny = VP.y + (y - VP.y) * 0.34;
      lw += `M0 ${y}L640 ${f1(ny)}`; rw += `M1600 ${y}L960 ${f1(ny)}`;
      void t;
    }
    for (let k = 0; k < 18; k++) {
      const x = 640 * (1 - Math.pow(0.84, k + 1)) / (1 - Math.pow(0.84, 19)) * 1, xr = 1600 - (x * 640) / 640;
      const top = lerp(-40, VP.y - (VP.y + 40) * 0.34, x / 640), bot = lerp(900, VP.y + (900 - VP.y) * 0.34, x / 640);
      lw += `M${f1(x)} ${f1(top)}L${f1(x)} ${f1(bot)}`; rw += `M${f1(xr)} ${f1(top)}L${f1(xr)} ${f1(bot)}`;
    }
    const L = { top: VP.y - (VP.y + 40) * 0.34, bot: VP.y + (900 - VP.y) * 0.34 };
    // fire escape on the left wall
    let esc_ = "";
    for (let f = 0; f < 3; f++) {
      const y0 = 120 + f * 150, x0 = 120 + f * 40, x1 = 360 + f * 30;
      const ty = (x) => lerp(y0, VP.y - (VP.y - y0) * 0.34, x / 640);
      esc_ += `<path d="M${x0} ${f1(ty(x0))}L${x1} ${f1(ty(x1))}M${x0} ${f1(ty(x0) - 34)}L${x1} ${f1(ty(x1) - 30)}" />`;
      for (let x = x0; x <= x1; x += 18) esc_ += `<path d="M${x} ${f1(ty(x))}V${f1(ty(x) - 32)}"/>`;
      esc_ += `<path d="M${x0 + 20} ${f1(ty(x0 + 20))}L${x1 - 30} ${f1(ty(x1 - 30) + 140)}"/>`;
    }
    const neon = [..."BOX OFFICE"].map((ch, i) => ch === " " ? "" : `<text x="1268" y="${236 + i * 40}" text-anchor="middle">${ch}</text>`).join("");
    return `
      <div class="w-sky alley"></div>
      <svg class="w-layer" data-l="walls" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="lwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a130f"/><stop offset=".7" stop-color="#170b09"/><stop offset="1" stop-color="#0a0606"/></linearGradient>
          <linearGradient id="rwall" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#2b1411"/><stop offset=".7" stop-color="#160a08"/><stop offset="1" stop-color="#0a0606"/></linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0c10"/><stop offset="1" stop-color="#1b1a20"/></linearGradient>
          <radialGradient id="doorlamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ffe2a6" stop-opacity=".75"/><stop offset="1" stop-color="#ffe2a6" stop-opacity="0"/></radialGradient>
          <radialGradient id="neonglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff2d55" stop-opacity=".55"/><stop offset="1" stop-color="#ff2d55" stop-opacity="0"/></radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <rect width="1600" height="900" fill="#07070a"/>
        <path d="M640 ${f1(L.top)}H960V${f1(L.bot)}H640z" fill="#120d0d"/>
        <rect x="748" y="352" width="104" height="${f1(L.bot - 352)}" fill="#fffaf0" class="w-doorlight"/>
        <g class="w-door"><rect class="w-leaf l" x="748" y="352" width="52" height="${f1(L.bot - 352)}" fill="#2a2a2f"/><rect class="w-leaf r" x="800" y="352" width="52" height="${f1(L.bot - 352)}" fill="#25252a"/><circle cx="792" cy="${f1((352 + L.bot) / 2 + 6)}" r="2.5" fill="#c9b27a"/></g>
        <rect x="738" y="318" width="124" height="22" fill="#141317"/><text x="800" y="334" text-anchor="middle" class="w-stencil">STAGE DOOR</text>
        <path d="M800 300 l-14 10 h28z" fill="#1d1c20"/><ellipse cx="800" cy="312" rx="10" ry="3" fill="#fff0c8"/>
        <path d="M790 314 L690 ${f1(L.bot)} H910 L810 314z" fill="url(#doorlamp)" opacity=".55"/>
        <path d="M0 -40L640 ${f1(L.top)}V${f1(L.bot)}L0 900z" fill="url(#lwall)"/>
        <path d="M1600 -40L960 ${f1(L.top)}V${f1(L.bot)}L1600 900z" fill="url(#rwall)"/>
        <path d="${lw}${rw}" stroke="#000" stroke-opacity=".38" stroke-width="2" fill="none"/>
        <path d="M0 900L640 ${f1(L.bot)}H960L1600 900z" fill="url(#ground)"/>
        <g stroke="#0c0b0e" stroke-width="5" fill="none">${esc_}</g>
        <path d="M640 ${f1(L.top)} C 760 ${f1(L.top + 40)} 860 ${f1(L.top + 30)} 960 ${f1(L.top)}" stroke="#0a0a0c" stroke-width="2" fill="none"/>
        <g class="w-bulbs">${Array.from({ length: 9 }, (_, i) => { const t = (i + 1) / 10; const x = lerp(640, 960, t), y = L.top + 4 + Math.sin(t * Math.PI) * 34; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="#ffd98f" style="--d:${f1(i * 0.37)}s"/>`; }).join("")}</g>
        <rect x="1190" y="180" width="156" height="460" fill="url(#neonglow)" class="w-neon-glow"/>
        <rect x="1236" y="196" width="64" height="410" rx="6" fill="#0d0b0e" stroke="#2a2328" stroke-width="3"/>
        <path d="M1300 240 h70 M1300 560 h70" stroke="#1a171b" stroke-width="6"/>
        <g class="w-neon">${neon}</g>
        <g class="w-neon-refl" filter="url(#soft)"><rect x="1220" y="760" width="96" height="140" fill="#ff2d55" opacity=".35"/><rect x="760" y="${f1(L.bot + 6)}" width="80" height="180" fill="#fff1c9" opacity=".25"/></g>
        <g fill="#0b0a0d"><rect x="1040" y="610" width="70" height="90" rx="4"/><rect x="1032" y="602" width="86" height="12" rx="3"/><rect x="455" y="640" width="120" height="70"/><rect x="470" y="600" width="90" height="42"/></g>
        <text x="515" y="682" text-anchor="middle" class="w-stencil small">PROPERTY OF GREENLIGHT PICTURES</text>
        <ellipse cx="800" cy="820" rx="120" ry="16" fill="#1e1d24"/><ellipse cx="800" cy="820" rx="100" ry="11" fill="#141318"/>
        <ellipse cx="520" cy="860" rx="180" ry="18" fill="#2a2730" opacity=".5"/><ellipse cx="1120" cy="800" rx="140" ry="12" fill="#2a2730" opacity=".45"/>
      </svg>
      <div class="w-steam" aria-hidden="true"><i></i><i></i><i></i></div>`;
  }

  /* =====================================================================
     BUILD THE STAGE
     ===================================================================== */
  const world = $("#world");
  const W = (C.world && C.world.length ? C.world : []).reduce((o, x) => ((o[x.scene] = x), o), {});
  const capFor = (k, i) => {
    const w = W[k] || {};
    const kicker = k === "la" ? String(w.kicker || "EXT. HOLLYWOOD HILLS").replace(/·\s*(DAWN|DAY|DUSK|NIGHT|GOLDEN HOUR)\s*$/i, "") .trim() + " · " + TOD_LABEL : w.kicker || "";
    return `<div class="w-cap" data-cap="${k}">
      <span class="w-cap-k mono"><i>${V.pad(i + 1)}</i>${esc(kicker)}</span>
      <h2 class="w-cap-t">${em(w.title || "")}</h2>
      <p>${esc(w.text || "")}</p>
      ${w.link ? `<a class="w-cap-a" href="${esc(safe(w.link))}" data-cursor="Go">${esc(w.label || "Learn more")} <span aria-hidden="true">→</span></a>` : ""}
    </div>`;
  };
  if (world) {
    world.innerHTML = `
      <div class="w-stage" id="w-stage">
        <div class="w-scene w-la" data-s="la">${sceneLA()}</div>
        <div class="w-stars" aria-hidden="true"></div>
        <div class="w-scene w-ny" data-s="ny">${sceneNY()}</div>
        <div class="w-scene w-alley" data-s="alley">${sceneAlley()}</div>
        <canvas class="w-rain" aria-hidden="true"></canvas>
        <div class="w-grade" aria-hidden="true"></div>
        <div class="w-cut mono" aria-hidden="true"><span></span></div>
        <div class="w-slate mono" aria-hidden="true"><span></span></div>
        <div class="w-white" aria-hidden="true"></div>
        <div class="w-caps">${["la", "ny", "alley"].map(capFor).join("")}</div>
        <div class="w-live mono" aria-live="off"><span class="dot"></span><span class="w-live-t"></span></div>
        <div class="w-path mono" aria-hidden="true"><span data-k="la">L.A.</span><i></i><span data-k="ny">N.Y.C.</span><i></i><span data-k="alley">Stage door</span></div>
      </div>`;
    // star field
    rs(5); $(".w-stars", world).innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${Array.from({ length: 170 }, () => `<circle cx="${f1(rnd() * 1600)}" cy="${f1(rnd() * 620)}" r="${f1(0.4 + rnd() * 1.2)}" style="--d:${f1(rnd() * 5)}s" class="${rnd() < 0.25 ? "tw" : ""}"/>`).join("")}</svg>`;
  }

  const stage = $("#w-stage");
  if (!stage) return hitsInit();
  const scenes = { la: $(".w-la", stage), ny: $(".w-ny", stage), alley: $(".w-alley", stage) };
  const L = (s, k) => $(`[data-l="${k}"]`, scenes[s]);
  const caps = Object.fromEntries($$(".w-cap", stage).map((c) => [c.dataset.cap, c]));
  const cut = $(".w-cut span", stage), slate = $(".w-slate span", stage), white = $(".w-white", stage), stars = $(".w-stars", stage), grade = $(".w-grade", stage);
  const letters = $$(".w-lt-in", stage);
  const leaves = $$(".w-leaf", stage);
  const live = $(".w-live-t", stage);
  const targetEl = $(".w-target rect", stage);
  const org = { x: 0, y: 0, z: 1 };
  const pathEls = $$(".w-path span", stage);

  if (RM) { world.classList.add("static"); hitsInit(); return; }

  /* ---------- rain ---------- */
  const rain = (() => {
    const cv = $(".w-rain", stage), ctx = cv.getContext("2d");
    let drops = [], w = 0, h = 0, amt = 0, on = false, last = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); w = cv.width = stage.clientWidth * d; h = cv.height = stage.clientHeight * d; ctx.setTransform(1, 0, 0, 1, 0, 0); };
    const N = innerWidth < 700 ? 160 : 320;
    for (let i = 0; i < N; i++) drops.push({ x: Math.random(), y: Math.random(), l: 0.02 + Math.random() * 0.04, v: 0.9 + Math.random() * 0.8, z: Math.random() });
    const loop = (t) => {
      if (!on) return;
      requestAnimationFrame(loop);
      if (t - last < 33) return; const dt = Math.min(0.05, (t - last) / 1000); last = t;
      ctx.clearRect(0, 0, w, h);
      if (amt <= 0.01) return;
      ctx.lineCap = "round";
      const n = Math.floor(drops.length * amt);
      for (let i = 0; i < n; i++) {
        const d = drops[i];
        d.y += d.v * dt * (1.4 + d.z); d.x -= 0.06 * dt;
        if (d.y > 1.05) { d.y = -0.05; d.x = Math.random() * 1.1; }
        const x = d.x * w, y = d.y * h, len = d.l * h * (0.6 + d.z);
        ctx.strokeStyle = `rgba(210,225,255,${(0.12 + d.z * 0.28) * amt})`;
        ctx.lineWidth = (0.6 + d.z * 1.2) * (w / innerWidth);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.12, y + len); ctx.stroke();
      }
    };
    addEventListener("resize", size); size();
    return { set(a) { amt = a; if (a > 0.01 && !on) { on = true; last = 0; requestAnimationFrame(loop); } else if (a <= 0.01 && on) { on = false; ctx.clearRect(0, 0, w, h); } } };
  })();

  /* ---------- the dolly target: where THE window sits on screen ---------- */
  let geo = { tx: 0, ty: 0, dx: 0, dy: 0 };
  const measure = () => {
    const Wd = stage.clientWidth, Hd = stage.clientHeight;
    const s = Math.max(Wd / 1600, Hd / 900);
    geo.tx = (Wd - 1600 * s) / 2 + TARGET.x * s; geo.ty = Hd - 900 * s + TARGET.y * s;
    const sd = Math.max(Wd / 1600, Hd / 900);
    geo.dx = (Wd - 1600 * sd) / 2 + 800 * sd; geo.dy = (Hd - 900 * sd) / 2 + 420 * sd;
    scenes.alley.style.transformOrigin = `${geo.dx}px ${geo.dy}px`;
  };
  // Portrait phones: frame the Hollywood sign instead of the middle of the panorama
  const signLayer = L("la", "sign"), signG = $(".w-sign", stage);
  const frameSign = () => {
    const portrait = innerWidth / innerHeight < 0.85;
    signLayer.setAttribute("viewBox", portrait ? "560 0 760 900" : "0 0 1600 900");
    signG.setAttribute("transform", portrait ? "translate(925 520) scale(.76) translate(-925 -560)" : "");
  };
  let worldH = 0;
  const sizeWorld = () => { worldH = 0; world.style.height = (innerWidth < 760 ? 560 : 680) + "vh"; frameSign(); measure(); };
  sizeWorld();
  addEventListener("resize", sizeWorld);

  /* ---------- typed script transitions ---------- */
  const typed = (el, txt, t) => { const n = Math.round(clamp(t) * txt.length); const s = txt.slice(0, n); if (el.textContent !== s) el.textContent = s; };

  const tf = (el, s) => { if (el && el.__t !== s) { el.style.transform = s; el.__t = s; } };
  const op = (el, o) => { if (!el) return; const v = o.toFixed(3); if (el.__o !== v) { el.style.opacity = v; el.__o = v; if (el.classList.contains("w-scene")) el.classList.toggle("off", o < 0.005); } };
  let lastScene = "", lastCap = "";
  const sceneName = { la: "SC.02 · EXT. HOLLYWOOD HILLS · " + TOD_LABEL, ny: "SC.02 · EXT. MANHATTAN · NIGHT", alley: "SC.02 · EXT. STAGE DOOR ALLEY · RAIN" };
  const zoneFor = (p) => (p < 0.418 ? "la" : p < 0.742 ? "ny" : "alley");

  function frame() {
    const r = world.getBoundingClientRect(), vh = innerHeight;
    if (!worldH) worldH = world.offsetHeight;
    const away = r.bottom < -vh * 0.2 || r.top > vh * 1.2;
    if (away !== world.__idle) { world.__idle = away; world.classList.toggle("idle", away); }
    if (away) { rain.set(0); return; }
    const p = clamp(-r.top / (worldH - vh));
    const tb = targetEl && p > 0.4 && p < 0.75 ? targetEl.getBoundingClientRect() : null, sb = tb ? stage.getBoundingClientRect() : null;

    /* --- 0.00–0.06 slate --- */
    typed(slate, `FADE IN:\n\nEXT. HOLLYWOOD HILLS - ${TOD_LABEL}`, seg(p, 0, 0.045));
    op($(".w-slate", stage), 1 - seg(p, 0.055, 0.08));

    /* --- LA: 0.03–0.40 --- */
    const la = seg(p, 0.03, 0.34), up = io(seg(p, 0.29, 0.42));
    op(scenes.la, seg(p, 0.05, 0.1) * (1 - seg(p, 0.37, 0.385)));
    const dl = eo(la);
    tf(L("la", "far"), `translate3d(0, ${f1(up * 26)}vh, 0) scale(${(1 + dl * 0.05).toFixed(4)})`);
    tf(L("la", "sign"), `translate3d(0, ${f1(up * 48)}vh, 0) scale(${(1 + dl * 0.12).toFixed(4)})`);
    tf(L("la", "near"), `translate3d(0, ${f1(up * 70)}vh, 0) scale(${(1 + dl * 0.2).toFixed(4)})`);
    tf(L("la", "front"), `translate3d(0, ${f1(up * 100 + dl * 4)}vh, 0) scale(${(1 + dl * 0.32).toFixed(4)})`);
    tf(L("la", "sun"), `translate3d(0, ${f1(dl * 7 + up * 20)}vh, 0)`);
    tf(L("la", "beams"), `translate3d(0, ${f1(up * 60)}vh, 0)`);
    letters.forEach((l, i) => { const t = eo(seg(p, 0.06 + i * 0.013, 0.1 + i * 0.013)); tf(l, `translate(0px, ${f1((1 - t) * 90)}px) rotate(${f1((1 - t) * (i % 2 ? 8 : -8))}deg)`); op(l, t); });
    op(stars, Math.max(TOD === "night" ? 0.7 : 0, seg(p, 0.3, 0.42)) * (1 - seg(p, 0.72, 0.76)));
    tf(stars, `translate3d(0, ${f1(up * 18 - seg(p, 0.4, 0.5) * 18)}vh, 0)`);

    /* --- SMASH CUT 0.37–0.45 --- */
    const cutA = seg(p, 0.385, 0.405), cutB = seg(p, 0.715, 0.735);
    if (cutB > 0) typed(cut, "MATCH CUT TO:", cutB); else typed(cut, "SMASH CUT TO:", cutA);
    op($(".w-cut", stage), Math.max(cutA * (1 - seg(p, 0.41, 0.418)), cutB * (1 - seg(p, 0.737, 0.742))));

    /* --- NY: 0.40–0.74 --- */
    const nyIn = io(seg(p, 0.418, 0.5)), ny = seg(p, 0.47, 0.615), dolly = seg(p, 0.62, 0.742);
    op(scenes.ny, seg(p, 0.415, 0.42) * (1 - seg(p, 0.742, 0.744)));
    // lock the dolly onto wherever THE window really is on screen right before we push in
    // (measured every frame and un-zoomed: P = O + (P' - O) / z, so even a fast scroll jump lands inside)
    if (tb) {
      const px = tb.left + tb.width / 2 - sb.left, py = tb.top + tb.height / 2 - sb.top;
      org.x = org.x + (px - org.x) / org.z; org.y = org.y + (py - org.y) / org.z;
    }
    const z = Math.pow(140, io(dolly));
    org.z = z;
    scenes.ny.style.transformOrigin = `${f1(org.x)}px ${f1(org.y)}px`;
    op(L("ny", "bridge"), 1 - seg(dolly, 0.05, 0.3)); op(L("ny", "trails"), 1 - seg(dolly, 0.05, 0.3));
    tf(scenes.ny, `translate3d(${f1((1 - nyIn) * 0)}px, 0, 0) scale(${z.toFixed(4)})`);
    tf(L("ny", "far"), `translate3d(0, ${f1((1 - nyIn) * 30 - ny * 2)}vh, 0) scale(${(1 + ny * 0.04).toFixed(4)})`);
    tf(L("ny", "mid"), `translate3d(0, ${f1((1 - nyIn) * 55 - ny * 3)}vh, 0) scale(${(1 + ny * 0.08).toFixed(4)})`);
    const bridgeT = `translate3d(${f1(-ny * 6)}vw, ${f1((1 - nyIn) * 90 + dolly * 40)}vh, 0) scale(${(1 + ny * 0.18).toFixed(4)})`;
    tf(L("ny", "bridge"), bridgeT); tf(L("ny", "trails"), bridgeT);
    tf(L("ny", "moon"), `translate3d(0, ${f1((1 - nyIn) * 40 - ny * 4)}vh, 0)`);

    /* --- ALLEY: 0.73–1.00 --- */
    const al = seg(p, 0.75, 0.93), door = io(seg(p, 0.9, 0.97));
    op(scenes.alley, p >= 0.742 ? 1 : 0);
    tf(scenes.alley, `scale(${(1.6 - eo(seg(p, 0.742, 0.8)) * 0.6 + io(al) * 0.55 + door * 1.6).toFixed(4)})`);
    leaves.forEach((lf, i) => tf(lf, `scaleX(${(1 - door * 0.94).toFixed(3)})`));
    op(white, seg(p, 0.935, 0.99));
    rain.set(Math.max(seg(p, 0.45, 0.55) * 0.55 * (1 - seg(p, 0.7, 0.76)), seg(p, 0.74, 0.79) * (1 - seg(p, 0.92, 0.97))));
    // a single flash frame right on the cut, like a splice going through the gate
    grade.style.setProperty("--g", Math.max(1 - Math.abs(p - 0.418) / 0.006, 1 - Math.abs(p - 0.742) / 0.006, 0).toFixed(3));

    /* --- captions --- */
    const capVis = { la: seg(p, 0.1, 0.14) * (1 - seg(p, 0.29, 0.33)), ny: seg(p, 0.48, 0.52) * (1 - seg(p, 0.62, 0.66)), alley: seg(p, 0.79, 0.83) * (1 - seg(p, 0.89, 0.92)) };
    for (const k in caps) {
      const v = capVis[k];
      op(caps[k], v); tf(caps[k], `translate3d(0, ${f1((1 - v) * 30)}px, 0)`);
      caps[k].style.pointerEvents = v > 0.5 ? "auto" : "none";
      caps[k].setAttribute("aria-hidden", v > 0.5 ? "false" : "true");
    }

    /* --- HUD + live clock --- */
    const zone = zoneFor(p);
    if (zone !== lastScene) {
      lastScene = zone;
      world.dataset.scene = sceneName[zone];
      pathEls.forEach((e) => e.classList.toggle("on", e.dataset.k === zone));
      tick();
    }
    op($(".w-live", stage), seg(p, 0.06, 0.1) * (1 - seg(p, 0.93, 0.96)));
    op($(".w-path", stage), seg(p, 0.06, 0.1) * (1 - seg(p, 0.93, 0.96)));
  }
  const tick = () => { live.textContent = lastScene === "la" ? `LIVE · LOS ANGELES · ${clock("America/Los_Angeles")}` : `LIVE · NEW YORK · ${clock("America/New_York")}`; };
  setInterval(tick, 20000);

  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; frame(); }); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();

  // Mouse look: the whole world breathes with the pointer (hand-held camera)
  if (matchMedia("(hover: hover)").matches) {
    let mx = 0, my = 0, cx = 0, cy = 0, run = false;
    const DEPTH = { far: [-8, -4], sign: [-18, -8], mid: [-18, -8], near: [-30, -12], front: [-52, -18], bridge: [-52, -18], trails: [-52, -18], walls: [-14, -8] };
    const depthLayers = $$("[data-l]", stage).filter((el) => DEPTH[el.dataset.l]).map((el) => [el, ...DEPTH[el.dataset.l]]);
    const look = () => {
      cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
      depthLayers.forEach(([el, dx, dy]) => { el.style.translate = `${f1(cx * dx)}px ${f1(cy * dy)}px`; });
      if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.001) requestAnimationFrame(look); else run = false;
    };
    stage.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; if (!run) { run = true; requestAnimationFrame(look); } }, { passive: true });
  }

  hitsInit();

  /* =====================================================================
     THE HALL OF HITS: white gallery, poster frames, counting machines
     ===================================================================== */
  function hitsInit() {
    const host = $("#hits");
    if (!host) return;
    const hits = (C.hits || []).filter((h) => h && h.title);
    if (!hits.length) { host.remove(); return; }
    const money = (n, metric) => {
      const views = /view|hour|stream/i.test(metric || "");
      const pre = views ? "" : "$";
      if (n >= 1e9) return { pre, n: (n / 1e9).toFixed(2), unit: views ? "B" : "B" };
      if (n >= 1e6) return { pre, n: (n / 1e6).toFixed(n >= 1e8 ? 0 : 1), unit: "M" };
      return { pre, n: String(Math.round(n)), unit: "" };
    };
    const full = (n) => Math.round(n).toLocaleString("en-US");
    const ranked = [...hits].sort((a, b) => (b.value || 0) - (a.value || 0));
    const rankOf = (h) => ranked.indexOf(h) + 1;
    const max = Math.max(...hits.map((h) => h.value || 0), 1);
    const drum = (ch, i) => /\d/.test(ch) ? `<span class="od-d" style="--i:${i}"><span class="od-strip">${Array.from({ length: 30 }, (_, k) => `<b>${k % 10}</b>`).join("")}</span></span>` : `<span class="od-s">${esc(ch)}</span>`;
    const src = (u) => { const x = V.safeUrl(u || ""); return /^https:\/\//.test(x) || /^\/[^/]/.test(x) ? x : ""; };
    const poster = (h) => src(h.image)
      ? `<img src="${esc(src(h.image))}" alt="${esc(h.title)} poster" loading="lazy" decoding="async" style="object-position:${+(h.imagePos?.x ?? 50)}% ${+(h.imagePos?.y ?? 50)}%">`
      : `<div class="hp-ph">${V.poster(h.palette || "gold", h.motif || "film", h.artSeed ?? h.title)}<div class="hp-ph-t"><span>${esc(h.studio || "")}</span><b>${esc(h.title)}</b><i>${esc(h.year || "")}</i></div><span class="hp-ph-tag mono">Poster coming soon</span></div>`;
    host.innerHTML = `
      <div class="hits-stage">
        <div class="hits-wall" aria-hidden="true"><div class="hits-big" id="hits-big"></div></div>
        <div class="hits-head">
          <p class="hits-k mono">INT. THE HALL OF HITS · DAY</p>
          <h2 class="hits-t">The <em>scoreboard</em> of the business.</h2>
          <p class="hits-d">Every one-sheet on this wall is a business case. Scroll the gallery and watch what they earned.</p>
        </div>
        <div class="hits-track" id="hits-track">
          ${hits.map((h, i) => {
            const m = money(h.value || 0, h.metric);
            const digits = [...(m.pre + m.n + m.unit)];
            return `<article class="hit" style="--i:${i}" data-i="${i}">
              <div class="hit-lamp" aria-hidden="true"><i></i></div>
              <div class="hit-frame" data-tilt-hit>
                <div class="hit-mat"><div class="hit-poster${src(h.image) ? " real" : ""}">${poster(h)}</div></div>
                <div class="hit-glass" aria-hidden="true"></div>
                <span class="hit-rank mono">No. ${rankOf(h)}</span>
              </div>
              <div class="hit-plaque">
                <div class="hit-od" aria-label="${esc(h.metric || "Box office")}: ${m.pre}${full(h.value || 0)}">${digits.map(drum).join("")}${h.estimate ? `<span class="hit-est mono">EST.</span>` : ""}</div>
                <div class="hit-meta"><b>${esc(h.title)}</b><span>${esc([h.studio, h.year].filter(Boolean).join(" · "))}</span><span class="mono">${esc(h.metric || "Worldwide box office")}</span></div>
                <div class="hit-bar" aria-hidden="true"><i style="--w:${((h.value || 0) / max).toFixed(4)}"></i></div>
              </div>
            </article>`;
          }).join("")}
          <div class="hit-end"><p class="mono">END OF EXHIBIT</p><a class="btn btn-dark" href="/workshops" data-cursor="Learn">Learn to read these numbers →</a></div>
        </div>
        <p class="hits-note mono">${esc(C.settings?.hitsNote || "")}</p>
        <div class="hits-floor" aria-hidden="true"></div>
      </div>`;
    const track = $("#hits-track"), items = $$(".hit", host), big = $("#hits-big"), head = $(".hits-head", host);
    const roll = (el) => {
      if (el.classList.contains("rolled")) return;
      el.classList.add("rolled");
      const h = hits[+el.dataset.i], m = money(h.value || 0, h.metric);
      const ds = [...(m.pre + m.n + m.unit)].filter((c) => /\d/.test(c));
      $$(".od-d", el).forEach((d, k) => { const n = +ds[k]; d.querySelector(".od-strip").style.setProperty("--to", 20 + n); });
      V.sfx?.tick?.();
    };
    const setBig = (i) => { const h = hits[i]; if (!h) return; const m = money(h.value || 0, h.metric); const s = m.pre + m.n + m.unit; if (big.textContent !== s) { big.textContent = s; big.classList.remove("swap"); void big.offsetWidth; big.classList.add("swap"); } };
    const pinned = () => innerWidth > 900 && !RM;
    const size = () => { host.style.height = pinned() ? innerHeight + Math.max(0, track.scrollWidth - innerWidth) + innerHeight * 0.35 + "px" : ""; };
    let active = -1;
    let dims = null, trackX = 0;
    const hf = () => {
      const r = host.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      if (!dims) dims = { H: host.offsetHeight, dist: Math.max(0, track.scrollWidth - innerWidth) };
      const boxes = items.map((el) => el.getBoundingClientRect()); // all reads first
      let shift = 0;
      if (pinned()) {
        const prog = clamp(-r.top / (dims.H - vh || 1)), x = -prog * dims.dist;
        shift = x - trackX; trackX = x;
        track.style.transform = `translate3d(${f1(x)}px,0,0)`;
        // the title steps aside once the frames start sliding under it
        const ho = (1 - clamp((prog - 0.015) / 0.05)).toFixed(3);
        if (head.__o !== ho) { head.__o = ho; head.style.opacity = ho; head.style.transform = `translate3d(0, ${f1((1 - ho) * -16)}px, 0)`; }
      }
      let best = -1, bd = 1e9;
      items.forEach((el, i) => {
        const b0 = boxes[i], b = { left: b0.left + shift, right: b0.right + shift, width: b0.width, top: b0.top };
        const c = b.left + b.width / 2, d = Math.abs(c - innerWidth / 2);
        const near = (1 - clamp(d / (innerWidth * 0.6))).toFixed(2);
        if (el.__near !== near) { el.__near = near; el.style.setProperty("--near", near); }
        if (b.left < innerWidth * 0.82 && b.right > innerWidth * 0.12 && b.top < vh * 0.85) roll(el);
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== active) { active = best; items.forEach((el, i) => el.classList.toggle("on", i === best)); setBig(best); }
    };
    let hr = 0;
    addEventListener("scroll", () => { if (!hr) hr = requestAnimationFrame(() => { hr = 0; hf(); }); }, { passive: true });
    track.addEventListener("scroll", () => { if (!hr) hr = requestAnimationFrame(() => { hr = 0; hf(); }); }, { passive: true });
    addEventListener("resize", () => { dims = null; size(); hf(); });
    size(); hf();
    // tactile frames: tilt toward the pointer, glass glare follows
    if (matchMedia("(hover: hover)").matches && !RM) $$("[data-tilt-hit]", host).forEach((f) => {
      f.addEventListener("pointermove", (e) => { const b = f.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5; f.style.setProperty("--rx", f1(-y * 10) + "deg"); f.style.setProperty("--ry", f1(x * 12) + "deg"); f.style.setProperty("--gx", f1((x + 0.5) * 100) + "%"); f.style.setProperty("--gy", f1((y + 0.5) * 100) + "%"); });
      f.addEventListener("pointerleave", () => { f.style.setProperty("--rx", "0deg"); f.style.setProperty("--ry", "0deg"); });
    });
  }
});
