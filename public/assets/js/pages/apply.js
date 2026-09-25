/* Apply page: 4-step casting call → submission → interview booking */
V.ready.then(async (C) => {
  const { $, $$, esc, icons, Store } = V;
  const S = C.settings;
  const host = $("#apply-host");
  const deadline = S.applicationDeadline;
  const isOpen = S.applicationsOpen !== false && (!deadline || new Date(deadline) > new Date());

  if (isOpen && deadline) V.countdown($("#countdown"), deadline); else $("#countdown").remove();
  $("#apply-season").textContent = `${S.season || ""} · ${isOpen ? "Casting call" : "Applications closed"}`;

  // Recruitment timeline
  const tl = S.timeline || [];
  const now = Date.now();
  const idx = tl.findIndex((x) => new Date(x.date) > now);
  const nowI = idx === -1 ? tl.length : idx;
  $("#timeline").style.gridTemplateColumns = `repeat(${Math.max(tl.length, 1)}, 1fr)`;
  $("#timeline").innerHTML = (tl.length > 1 ? `<div class="fill" style="width:${Math.max(0, Math.min(100, (nowI / (tl.length - 1)) * 100 - 6))}%"></div>` : "") +
    tl.map((x, i) => `<div class="tl ${i < nowI ? "done" : i === nowI ? "now" : ""}"><b>${esc(x.label)}</b><span>${V.fmt(x.date, { month: "short", day: "numeric" })}</span></div>`).join("");

  // Returning via emailed link: /apply?t=<token>
  const urlToken = new URLSearchParams(location.search).get("t");
  if (urlToken && V.live) {
    const local = Store.app();
    if (!local?.token || local.token !== urlToken) Store.set("app", { submitted: true, token: urlToken, id: urlToken.split(".")[0], draft: local?.draft || {} });
    history.replaceState(null, "", "/apply");
  }

  const existing = Store.app();
  if (existing?.submitted) return submittedView(existing);
  if (!isOpen) {
    host.innerHTML = `<div class="panel closed-card">${V.clapperSVG()}<div class="eyebrow center">Between seasons</div><h2 class="h2">Applications are closed.</h2><p class="lede" style="margin:0 auto 26px">Join the list and you'll be the first to know when the next casting call opens.</p><form class="signup" data-signup="apply-closed" novalidate><input class="hp" name="website" tabindex="-1" autocomplete="off"><input type="email" name="email" placeholder="you@vanderbilt.edu" aria-label="Email" required><button class="btn btn-gold" type="submit">Notify me</button></form></div>`;
    return;
  }
  formView(existing?.draft || {});

  /* ================= Form ================= */
  function formView(draft) {
    const STEPS = [["The Basics", "Who you are"], ["Your Tracks", "Where you fit"], ["The Pitch", "How you think"], ["Final Cut", "Review & submit"]];
    const p = Store.profile() || {};
    const d = { name: p.name || "", email: p.email || "", year: p.year || "", ...draft };
    d.tracks = d.tracks || [];
    let step = Math.min(d.step || 0, 3);
    const Q = [
      ["why", "Why VFMBS, and why now?", 1500, "What draws you to the business side of entertainment?"],
      ["pitch", "Greenlight it: pitch us one film, show, deal or company you'd bet on.", 1500, "What is it, who is it for, and why does it make money?"],
      ["news", "What's a recent entertainment or media business story you can't stop thinking about?", 1000, "A merger, a flop, a breakout hit, a strategy shift. Anything."],
    ];
    host.innerHTML = `
      <div class="apply-wrap">
        <aside class="steps" aria-label="Application steps">
          ${STEPS.map(([t, s], i) => `<button class="step-link" data-step="${i}"><span class="n">${i + 1}</span><span>${t}<small>${s}</small></span></button>`).join("")}
          <div class="save-note" id="save-note">Drafts auto-save on this device.</div>
        </aside>
        <form class="panel" id="app-form" novalidate>
          ${V.demoNote()}
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <section class="fstep" data-s="0">
            <div class="scene">Scene 01 · Take 1</div><h2>The Basics</h2><p style="color:var(--muted);margin:0 0 24px">Roll camera. Tell us who you are.</p>
            <div class="row2">
              <div class="field"><label for="a-name">Full name *</label><input class="input" id="a-name" name="name" required maxlength="80" value="${esc(d.name)}" autocomplete="name"></div>
              <div class="field"><label for="a-pref">Preferred name</label><input class="input" id="a-pref" name="pref" maxlength="40" value="${esc(d.pref || "")}"></div>
            </div>
            <div class="row2">
              <div class="field"><label for="a-email">Vanderbilt email *</label><input class="input" id="a-email" name="email" type="email" required value="${esc(d.email)}" placeholder="you@vanderbilt.edu" autocomplete="email"></div>
              <div class="field"><label for="a-phone">Phone</label><input class="input" id="a-phone" name="phone" type="tel" maxlength="30" value="${esc(d.phone || "")}" autocomplete="tel"></div>
            </div>
            <div class="row2">
              <div class="field"><label for="a-year">Class year *</label><select class="select" id="a-year" name="year" required><option value="">Select…</option>${V.YEARS.map((y) => `<option ${d.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
              <div class="field"><label for="a-major">Major(s) / Minor(s) *</label><input class="input" id="a-major" name="major" required maxlength="120" value="${esc(d.major || "")}"></div>
            </div>
            <div class="field"><span class="label">How did you hear about us?</span>
              <div class="opts">${["Instagram", "Info session", "A friend", "Activities fair", "Class / professor", "This website"].map((o) => `<label class="opt"><input type="radio" name="heard" value="${o}" ${d.heard === o ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
          </section>
          <section class="fstep" data-s="1">
            <div class="scene">Scene 02 · Take 1</div><h2>Your Tracks</h2><p style="color:var(--muted);margin:0 0 24px">Pick up to two tracks, in order of preference. Click again to remove.</p>
            <div class="pick-tracks" id="picks">${C.tracks.map((t) => `<button type="button" class="pick" data-id="${t.id}" style="${V.vars(t.palette)}" aria-pressed="false"><span class="rank"></span><b>${esc(t.name)}</b><span>${esc(t.genre)}</span></button>`).join("")}</div>
            <div class="err" id="pick-err" style="margin-top:10px" role="alert"></div>
            <div class="field" style="margin-top:22px"><span class="label">Which areas excite you most?</span>
              <div class="opts">${["Film", "TV & Streaming", "Music", "Sports", "Gaming", "Creator economy", "News & publishing", "Live events"].map((o) => `<label class="opt"><input type="checkbox" name="areas" value="${o}" ${(d.areas || []).includes(o) ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
            <div class="field"><span class="label">Finance experience</span>
              <div class="opts">${["None yet", "Intro courses", "Modeling experience", "Internship"].map((o) => `<label class="opt"><input type="radio" name="finexp" value="${o}" ${d.finexp === o ? "checked" : ""}><span>${o}</span></label>`).join("")}</div></div>
          </section>
          <section class="fstep" data-s="2">
            <div class="scene">Scene 03 · Take 1</div><h2>The Pitch</h2><p style="color:var(--muted);margin:0 0 24px">No right answers. We want to see how you think.</p>
            ${Q.map(([k, l, max, h]) => `<div class="field"><label for="a-${k}">${l} *</label><div class="hint">${h}</div><textarea class="textarea" id="a-${k}" name="${k}" required maxlength="${max}">${esc(d[k] || "")}</textarea><div class="counter"></div></div>`).join("")}
            <div class="row2">
              <div class="field"><label for="a-resume">Resume link (optional)</label><input class="input" id="a-resume" name="resume" type="url" value="${esc(d.resume || "")}" placeholder="https://drive.google.com/…"><div class="hint">Google Drive / Box / Dropbox link set to "anyone with the link".</div></div>
              <div class="field"><label for="a-li">LinkedIn (optional)</label><input class="input" id="a-li" name="linkedin" type="url" value="${esc(d.linkedin || "")}" placeholder="https://linkedin.com/in/…"></div>
            </div>
          </section>
          <section class="fstep" data-s="3">
            <div class="scene">Scene 04 · Final cut</div><h2>Final Cut</h2><p style="color:var(--muted);margin:0 0 24px">Review your application before it goes to the screening room.</p>
            <div id="review"></div>
            <label class="check" style="margin-top:22px"><input type="checkbox" id="a-agree"> I confirm this application is my own work, and I'm available for a short interview during interview week.</label>
            <div class="err" id="final-err" style="margin-top:8px" role="alert"></div>
          </section>
          <div class="panel-foot">
            <button type="button" class="btn btn-outline" id="prev">${icons.chevL} Back</button>
            <button type="button" class="btn btn-gold" id="next">Continue ${icons.chevR}</button>
          </div>
        </form>
      </div>`;

    const form = $("#app-form");
    V.wireCounters(form);
    const collect = () => {
      const fd = new FormData(form);
      const o = Object.fromEntries(fd);
      o.areas = fd.getAll("areas");
      o.tracks = d.tracks;
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

    const drawPicks = () => $$("#picks .pick").forEach((b) => {
      const r = d.tracks.indexOf(b.dataset.id);
      b.classList.toggle("on", r >= 0);
      b.setAttribute("aria-pressed", r >= 0);
      $(".rank", b).textContent = r >= 0 ? r + 1 : "";
    });
    $$("#picks .pick").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.id, i = d.tracks.indexOf(id);
      if (i >= 0) d.tracks.splice(i, 1);
      else if (d.tracks.length < 2) d.tracks.push(id);
      else V.toast("You can rank up to two tracks", "error");
      $("#pick-err").textContent = "";
      drawPicks(); save();
    }));
    drawPicks();

    const validStep = (i) => {
      const sec = $(`.fstep[data-s="${i}"]`, form);
      if (i === 1 && !d.tracks.length) { $("#pick-err").textContent = "Pick at least one track."; return false; }
      if (i === 3) {
        if (!$("#a-agree").checked) { $("#final-err").textContent = "Please confirm to submit."; return false; }
        return true;
      }
      const msg = V.validate(sec);
      if (msg) V.toast(msg, "error");
      return !msg;
    };
    const show = (i) => {
      step = i;
      $$(".fstep", form).forEach((s) => s.classList.toggle("on", +s.dataset.s === i));
      $$(".step-link").forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.toggle("ok", k < i); b.setAttribute("aria-current", k === i ? "step" : "false"); });
      $("#prev").style.visibility = i === 0 ? "hidden" : "visible";
      $("#next").innerHTML = i === 3 ? `Submit application ${icons.check}` : `Continue ${icons.chevR}`;
      if (i === 3) drawReview();
      const top = host.getBoundingClientRect().top + scrollY - 100;
      if (scrollY > top) scrollTo({ top, behavior: "smooth" });
    };
    const drawReview = () => {
      const o = collect();
      const rows = [["Name", o.name + (o.pref ? ` (${o.pref})` : "")], ["Email", o.email], ["Class / Major", `${o.year} · ${o.major}`],
        ["Tracks", d.tracks.map((t, i) => `${i + 1}. ${V.trackName(t)}`).join("\n")], ["Areas", (o.areas || []).join(", ")],
        ["Why VFMBS", o.why], ["Your pitch", o.pitch], ["Story", o.news], ["Resume", o.resume], ["LinkedIn", o.linkedin]];
      $("#review").innerHTML = rows.map(([k, v]) => `<div class="review-item"><span>${k}</span><p>${esc(v || "—")}</p></div>`).join("");
    };
    $$(".step-link").forEach((b) => b.addEventListener("click", () => {
      const to = +b.dataset.step;
      if (to > step) for (let i = step; i < to; i++) if (!validStep(i)) return show(i);
      show(to);
    }));
    $("#prev").addEventListener("click", () => show(Math.max(0, step - 1)));
    $("#next").addEventListener("click", async () => {
      if (!validStep(step)) return;
      if (step < 3) return show(step + 1);
      for (let i = 0; i < 3; i++) if (!validStep(i)) return show(i);
      clearTimeout(saveT);
      const data = collect();
      delete data.step;
      const btn = $("#next");
      V.busy(btn, true);
      let rec;
      try {
        if (!V.live) throw { demo: true };
        const r = await V.api("apply", data);
        rec = { submitted: true, id: r.id, token: r.token, draft: data, ts: Date.now() };
      } catch (err) {
        if (!err.demo) { V.busy(btn, false); $("#final-err").textContent = err.message; return; }
        rec = { submitted: true, id: V.demoCode("VF"), token: "", demo: true, draft: data, ts: Date.now(), interview: null };
      }
      Store.set("app", rec);
      Store.remember(data);
      V.confetti(160);
      V.popcorn(btn, 30);
      submittedView(rec, true);
    });
    show(step);
  }

  /* ================= After submission ================= */
  async function submittedView(rec, fresh) {
    const name = String(rec.draft?.pref || rec.draft?.name || "").split(" ")[0];
    let status = "In review", interview = rec.interview || null, slots = [];
    if (V.live && rec.token) {
      try { const s = await V.api("apply?t=" + encodeURIComponent(rec.token)); status = s.status; interview = s.interview; rec.interview = interview; Store.set("app", rec); }
      catch (e) { if (e.status === 404) { Store.set("app", { draft: rec.draft, submitted: false }); V.toast("We couldn't find that application. You can submit again.", "error"); return formView(rec.draft || {}); } }
      try { slots = (await V.api("apply?slots=1")).slots; } catch {}
    } else {
      slots = (S.interviewSlots || []).filter((s) => new Date(s) > new Date()).map((iso) => ({ iso, taken: V.hash(iso) % 3 === 0 && iso !== interview }));
    }
    const byDay = {};
    slots.forEach((s) => { const k = V.fmt(s.iso, { weekday: "short", month: "short", day: "numeric" }); (byDay[k] = byDay[k] || []).push(s); });
    const stageIdx = interview ? 1 : 0;
    host.innerHTML = `
      <div class="panel wrap-screen" style="max-width:860px;margin:0 auto">
        ${rec.demo ? V.demoNote() : ""}
        ${V.clapperSVG()}
        <div class="eyebrow center">${fresh ? "Application submitted" : "Application on file"}</div>
        <h2 class="h2">That's a wrap${name ? ", " + esc(name) : ""}.</h2>
        <p style="color:var(--muted);max-width:540px;margin:0 auto 10px">Your application is in the screening room. Confirmation <b style="color:var(--gold);font-family:var(--mono)">${esc(rec.id)}</b>${V.live ? ". We've emailed you a copy" : ""}.</p>
        <p><span class="status-pill ${/Accepted|Interview/.test(status) ? "st-good" : /Not selected/.test(status) ? "st-bad" : /Waitlist/.test(status) ? "st-wait" : "st-review"}">${esc(status)}</span></p>
        <div class="progress-steps" style="max-width:440px;margin:24px auto 6px">${[0, 1, 2, 3].map((i) => `<i class="${i <= stageIdx ? "on" : ""}"></i>`).join("")}</div>
        <div style="display:flex;justify-content:space-between;max-width:440px;margin:0 auto 34px" class="mono"><span>Submitted</span><span>Interview</span><span>Decision</span><span>Offer</span></div>
        <div style="text-align:left;border-top:1px solid var(--line);padding-top:28px">
          <div class="eyebrow">Book your screen test</div>
          ${slots.length ? `
          <p style="color:var(--muted);margin:-6px 0 18px">Choose a 20-minute interview slot (Central Time). You can change it anytime before interviews begin.</p>
          <form id="slot-form"><div style="display:grid;gap:18px">${Object.entries(byDay).map(([day, ss]) => `
            <fieldset style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">${day}</legend><div class="opts">${ss.map((s) => `<label class="opt"><input type="radio" name="slot" value="${s.iso}" ${s.taken && s.iso !== interview ? "disabled" : ""} ${interview === s.iso ? "checked" : ""}><span>${V.fmt(s.iso, { hour: "numeric", minute: "2-digit" })}</span></label>`).join("")}</div></fieldset>`).join("")}</div>
            <div class="err" id="slot-err" role="alert" style="margin-top:12px"></div>
            <div class="actions" style="margin-top:24px"><button class="btn btn-gold" type="submit">${interview ? "Update slot" : "Confirm slot"}</button><a class="btn btn-outline" href="/portal">Go to My Studio</a><button class="btn btn-outline" type="button" id="withdraw" style="margin-left:auto">Withdraw</button></div>
          </form>` : `<p style="color:var(--muted)">Interview slots will open soon. We'll email you when they do.</p><div class="actions"><a class="btn btn-outline" href="/portal">Go to My Studio</a><button class="btn btn-outline" type="button" id="withdraw">Withdraw</button></div>`}
        </div>
      </div>`;
    $("#slot-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = new FormData(e.target).get("slot");
      if (!v) return V.toast("Pick a time slot", "error");
      const btn = $("button[type=submit]", e.target);
      V.busy(btn, true);
      try {
        if (V.live && rec.token) await V.api("apply", { action: "book", t: rec.token, slot: v });
        rec.interview = v;
        Store.set("app", rec);
        V.toast("Interview booked: " + V.fmt(v, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
        submittedView(rec);
      } catch (err) { V.busy(btn, false); $("#slot-err").textContent = err.message; }
    });
    $("#withdraw").addEventListener("click", async () => {
      if (!confirm("Withdraw your application? This can't be undone, but your answers will be kept as a draft on this device.")) return;
      try { if (V.live && rec.token) await V.api("apply", { action: "withdraw", t: rec.token }); } catch (err) { if (err.status !== 404) return V.toast(err.message, "error"); }
      Store.set("app", { draft: rec.draft, submitted: false });
      V.refresh();
      formView(rec.draft || {});
    });
    const top = host.getBoundingClientRect().top + scrollY - 100;
    if (fresh) scrollTo({ top, behavior: "smooth" });
    V.refresh();
  }
  V.fx.scan();
});
