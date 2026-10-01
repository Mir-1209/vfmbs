/* Decision page: /decision. Applicants enter their confirmation number and read their letter. */
V.ready.then(() => {
  const { $, esc } = V;
  const host = $("#decision-host");
  const s = V.C.settings || {};
  const longDate = (ts) => new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(new Date(ts));
  const paras = (txt) => String(txt || "").split(/\n\s*\n/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`).join("");

  function lookup(prefill = "", error = "") {
    document.title = "Application Decision · Greenlight";
    host.innerHTML = `
      <div class="dc-lookup">
        <p class="eyebrow">Application status</p>
        <h1 class="h2">View your decision</h1>
        <p class="lede">Enter the confirmation number from the email you received when you applied.</p>
        <form id="dc-form" class="dc-form" novalidate>
          <label class="dc-label" for="dc-code">Confirmation number</label>
          <div class="dc-row">
            <input id="dc-code" name="code" class="dc-input" value="${esc(prefill)}" placeholder="VF-3FQ2K3" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" required>
            <button class="btn btn-gold" type="submit">View decision</button>
          </div>
          <p class="dc-error" role="alert" ${error ? "" : "hidden"}>${esc(error)}</p>
          <p class="dc-hint">Membership numbers look like <b>VF-3FQ2K3</b>. Workshop codes are 6 characters, like <b>K7M2QX</b>.</p>
        </form>
      </div>`;
    const input = $("#dc-code");
    input.addEventListener("input", () => { input.value = input.value.toUpperCase(); });
    $("#dc-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = input.value.trim();
      const err = $(".dc-error");
      if (code.replace(/[^A-Z0-9]/gi, "").length < 6) { err.hidden = false; err.textContent = "Please enter your full confirmation number."; input.focus(); return; }
      if (!V.live) { err.hidden = false; err.textContent = "Decisions can be checked once the site's database is connected."; return; }
      const btn = $("button", e.target);
      V.busy(btn, true);
      try {
        const r = await V.api("decision", { code });
        history.replaceState(null, "", "/decision");
        r.status === "pending" ? pending(r) : letter(r);
      } catch (ex) { err.hidden = false; err.textContent = ex.message; }
      V.busy(btn, false);
    });
    if (!prefill) setTimeout(() => input.focus({ preventScroll: true }), 300);
  }

  function pending(r) {
    host.innerHTML = `
      <div class="dc-lookup dc-pending">
        <p class="eyebrow">Application ${esc(r.ref)}</p>
        <h1 class="h2">Still in review</h1>
        <p class="lede">Thank you, ${esc(r.first)}. Your application to ${esc(r.program)} is still being reviewed. We'll email you as soon as your decision is ready, and you can read it here with your confirmation number.</p>
        <div class="actions"><a class="btn btn-outline" href="/portal">My Studio</a><button class="btn btn-ghost" id="dc-back">Check another number</button></div>
      </div>`;
    $("#dc-back").addEventListener("click", () => lookup());
  }

  function letter(r) {
    document.title = "Your Decision · Greenlight";
    const signer = r.signer || "The Board of Vanderbilt Greenlight";
    host.innerHTML = `
      <article class="dc-letter" aria-label="Decision letter">
        <header class="dc-head">
          <div class="dc-brand"><img src="/assets/brand/logo.svg" alt="" width="46" height="46"><div class="dc-word"><span>Vanderbilt</span><span>Greenlight</span></div></div>
          <div class="dc-addr">The Business of Film &amp; Media<br>${esc(s.location || "Vanderbilt University · Nashville, Tennessee")}${r.contact ? `<br>${esc(r.contact)}` : ""}</div>
        </header>
        <div class="dc-meta">
          <p>${esc(longDate(r.date))}</p>
          <p><span>Ref.</span> ${esc(r.ref)}<br><span>Re:</span> Your application to ${esc(r.program)}</p>
        </div>
        <div class="dc-body">
          <p>Dear ${esc(r.first)},</p>
          ${paras(r.body)}
        </div>
        <footer class="dc-sign">
          <p>With warm regards,</p>
          <p class="dc-signame">${esc(signer)}</p>
          ${r.signerTitle && r.signerTitle !== signer ? `<p class="dc-sigtitle">${esc(r.signerTitle)}</p>` : ""}
        </footer>
      </article>
      <div class="dc-tools">
        <button class="btn btn-outline btn-sm" id="dc-print">${V.icons.print} Print or save as PDF</button>
        <a class="btn btn-outline btn-sm" href="/events">See upcoming events</a>
        <button class="btn btn-ghost btn-sm" id="dc-back">Check another number</button>
      </div>`;
    $("#dc-print").addEventListener("click", () => print());
    $("#dc-back").addEventListener("click", () => lookup());
    scrollTo({ top: 0, behavior: "smooth" });
    if (r.status === "accepted") setTimeout(confetti, 450);
  }

  /* Paper confetti, accepted letters only. */
  function confetti() {
    if (V.reduced) return;
    const cv = document.createElement("canvas");
    cv.className = "dc-confetti";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    addEventListener("resize", size);
    const cols = ["#2FBF71", "#1f8f53", "#cfae70", "#e6cc94", "#f2ede4", "#ffffff"];
    const W = () => innerWidth, H = () => innerHeight;
    const make = (burst) => {
      const fromLeft = Math.random() < 0.5;
      return burst
        ? { x: fromLeft ? -10 : W() + 10, y: H() * (0.55 + Math.random() * 0.2), vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9), vy: -(9 + Math.random() * 9), w: 6 + Math.random() * 6, h: 9 + Math.random() * 9, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, t: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] }
        : { x: Math.random() * W(), y: -20 - Math.random() * H() * 0.6, vx: (Math.random() - 0.5) * 2, vy: 1.5 + Math.random() * 2.5, w: 6 + Math.random() * 6, h: 9 + Math.random() * 9, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, t: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] };
    };
    const ps = [...Array.from({ length: 140 }, () => make(true)), ...Array.from({ length: 110 }, () => make(false))];
    const t0 = performance.now();
    const tick = (now) => {
      const el = now - t0;
      ctx.clearRect(0, 0, W(), H());
      let alive = 0;
      for (const p of ps) {
        p.vy += 0.18; p.vx *= 0.985; p.vy = Math.min(p.vy, 4.2);
        p.x += p.vx + Math.sin((p.t += 0.05)) * 0.6; p.y += p.vy; p.r += p.vr;
        if (p.y > H() + 30) continue;
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(1, Math.cos(p.t * 2));
        ctx.globalAlpha = el > 5200 ? Math.max(0, 1 - (el - 5200) / 900) : 1;
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive && el < 6100) requestAnimationFrame(tick);
      else { cv.remove(); removeEventListener("resize", size); }
    };
    requestAnimationFrame(tick);
  }

  lookup((new URLSearchParams(location.search).get("code") || "").toUpperCase().slice(0, 20));
});
