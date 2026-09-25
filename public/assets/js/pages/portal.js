/* My Studio: profiles, tickets, applications, saved list */
V.ready.then((C) => {
  const { $, $$, esc, icons, Store } = V;
  const host = $("#main");
  const COLORS = ["crimson", "gold", "cobalt", "emerald", "violet", "ember"];
  const ssGet = () => { try { return sessionStorage.getItem("vfmbs:who"); } catch { return null; } };
  const ssSet = (v) => { try { v ? sessionStorage.setItem("vfmbs:who", 1) : sessionStorage.removeItem("vfmbs:who"); } catch {} };
  let chosen = ssGet() || Store.profiles().length <= 1;
  const render = () => (chosen ? dashboard() : whosWatching());

  function whosWatching() {
    const profiles = Store.profiles();
    host.innerHTML = `
      <div class="profiles"><div>
        <h1 data-split>Who's watching?</h1>
        <div class="profile-list">
          ${profiles.map((p) => `<button class="profile" data-pid="${esc(p.id)}"><div class="avatar" style="background:${V.palettes[p.color || "gold"][2]}">${esc((p.name || "G")[0].toUpperCase())}</div>${esc(p.name || "Guest")}</button>`).join("")}
          ${profiles.length < 5 ? `<button class="profile" id="add-profile"><div class="avatar add">+</div>Add profile</button>` : ""}
        </div>
        <p class="mono" style="margin-top:40px">Profiles are saved on this device only</p>
      </div></div>`;
    $$("[data-pid]", host).forEach((b) => b.addEventListener("click", () => { Store.setActive(b.dataset.pid); ssSet(1); chosen = true; render(); }));
    $("#add-profile", host)?.addEventListener("click", () => editProfile());
    V.fx.scan(host);
  }

  function editProfile(p) {
    let color = p?.color || COLORS[Store.profiles().length % COLORS.length];
    V.openModal(`
      <div class="modal-pad">
        <div class="eyebrow">${p ? "Edit" : "Add"} profile</div><h2>${p ? "Edit profile" : "New profile"}</h2>
        <form id="prof-form" novalidate style="margin-top:20px">
          <div class="field"><label for="p-name">Name *</label><input class="input" id="p-name" name="name" required maxlength="60" value="${esc(p?.name || "")}"></div>
          <div class="field"><label for="p-email">Email</label><input class="input" id="p-email" name="email" type="email" value="${esc(p?.email || "")}"></div>
          <div class="field"><label for="p-year">Class year</label><select class="select" id="p-year" name="year"><option value="">Select…</option>${V.YEARS.map((y) => `<option ${p?.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div>
          <div class="field"><span class="label">Avatar color</span><div class="opts" id="p-colors">${COLORS.map((c) => `<button type="button" data-c="${c}" style="width:38px;height:38px;border-radius:8px;background:${V.palettes[c][2]};outline:${c === color ? "3px solid #fff" : "none"};outline-offset:2px" aria-label="${c}"></button>`).join("")}</div></div>
          <button class="btn btn-gold btn-block" type="submit">Save profile</button>
        </form>
      </div>`, { size: "sm" });
    $$("#p-colors button").forEach((b) => b.addEventListener("click", () => { color = b.dataset.c; $$("#p-colors button").forEach((x) => (x.style.outline = x === b ? "3px solid #fff" : "none")); }));
    $("#prof-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = V.validate(e.target);
      if (msg) return V.toast(msg, "error");
      const fd = Object.fromEntries(new FormData(e.target));
      const list = Store.profiles();
      if (p) Object.assign(list.find((x) => x.id === p.id), fd, { color });
      else { const id = "p" + Date.now().toString(36); list.push({ id, ...fd, color }); Store.saveProfiles(list); Store.setActive(id); ssSet(1); chosen = true; }
      Store.saveProfiles(list);
      V.closeModal();
      render();
    });
  }

  async function dashboard() {
    const p = Store.profile() || { name: "Guest", color: "gold" };
    const rs = Store.tickets(), ws = Store.wsApps(), app = Store.app(), list = Store.list();
    const rsIds = Object.keys(rs).filter((id) => C.events.some((e) => e.id === id)).sort((a, b) => new Date(V.byId(a).date) - new Date(V.byId(b).date));
    const wsIds = Object.keys(ws).filter((id) => C.workshops.some((w) => w.id === id));
    host.innerHTML = `
      <section class="page-hero" style="min-height:44vh">${V.art(p.color || "gold", "ticket", { beam: true })}
        <div class="container">
          <div class="dash-head">
            <div class="avatar" style="background:${V.palettes[p.color || "gold"][2]}">${esc((p.name || "G")[0].toUpperCase())}</div>
            <div><div class="eyebrow" style="margin-bottom:8px">My Studio</div><h1>${esc(p.name || "Guest")}'s Studio</h1></div>
            <div class="actions" style="margin-left:auto">
              ${Store.profile() ? `<button class="btn btn-outline btn-sm" id="edit-prof">Edit profile</button>` : `<button class="btn btn-outline btn-sm" id="new-prof">Create profile</button>`}
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
          <h2>Membership application <span id="app-pill"></span></h2>
          ${app?.submitted ? `
            <div class="status-card">
              <div class="ev-thumb">${V.art("crimson", "clapper")}</div>
              <div><h3>${esc(C.settings.season || "")} Casting Call · ${esc(app.id)}</h3>
                <p id="app-line">Tracks: ${(app.draft?.tracks || []).map((t) => esc(V.trackName(t))).join(" → ") || "—"}${app.interview ? ` · Interview: <b style="color:#fff">${V.fmt(app.interview, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} CT</b>` : ""}</p>
                <div class="progress-steps"><i class="on"></i><i class="${app.interview ? "on" : ""}"></i><i></i><i></i></div></div>
              <a class="btn btn-outline btn-sm" href="/apply">${app.interview ? "Manage" : "Book interview"}</a>
            </div>` : app?.draft ? `
            <div class="status-card"><div class="ev-thumb">${V.art("crimson", "clapper")}</div><div><h3>Draft in progress</h3><p>Pick up where you left off.${C.settings.applicationDeadline ? ` Deadline ${V.fmt(C.settings.applicationDeadline, { month: "short", day: "numeric" })}.` : ""}</p><div class="progress-steps">${[0, 1, 2, 3].map((i) => `<i class="${i <= (app.draft.step || 0) ? "on" : ""}"></i>`).join("")}</div></div><a class="btn btn-gold btn-sm" href="/apply">Continue</a></div>` :
            `<div class="empty">You haven't started an application. <a href="/apply">Start your casting call →</a></div>`}
        </div>

        <div class="dash-section">
          <h2>My tickets</h2>
          ${rsIds.length ? `<div class="tickets">${rsIds.map((id) => `<div>${V.ticketHTML(V.byId(id), rs[id], { stamp: V.isPast(V.byId(id)) ? ["ENDED", "stamp-used"] : rs[id].waitlist ? ["WAITLIST", "stamp-wait"] : null })}<div class="ticket-tools">${rs[id].token ? `<a class="btn btn-primary btn-sm" href="/ticket?t=${encodeURIComponent(rs[id].token)}">${icons.ticket} Open</a>` : ""}<button class="btn btn-outline btn-sm" data-ics="${id}">${icons.cal} Calendar</button><button class="btn btn-outline btn-sm" data-open="${id}">Details</button><button class="btn btn-outline btn-sm" data-cancel="${id}" style="margin-left:auto">Cancel</button></div></div>`).join("")}</div>` : `<div class="empty">No tickets yet. <a href="/events">Browse events →</a></div>`}
        </div>

        <div class="dash-section">
          <h2>Workshop applications</h2>
          ${wsIds.length ? wsIds.map((id) => { const w = V.byId(id), a = ws[id]; return `
            <div class="status-card"><div class="ev-thumb">${V.art(w.palette, w.motif, { image: w.image })}</div>
              <div><h3>${esc(w.title)} <span class="status-pill st-review" data-ws-status="${id}" style="margin-left:6px">Under review</span></h3>
                <p>Submitted ${new Date(a.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · <span style="font-family:var(--mono)">${esc(a.code)}</span></p>
                <div class="progress-steps"><i class="on"></i><i class="on"></i><i></i></div></div>
              <button class="btn btn-outline btn-sm" data-open="${id}">Episodes</button>
            </div>`; }).join("") : `<div class="empty">No workshop applications yet. <a href="/workshops">Explore workshops →</a></div>`}
        </div>

        <div class="dash-section">
          <h2>My List</h2>
          ${list.length ? `<div class="ws-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${list.map(V.byId).filter(Boolean).map((x) => x.body !== undefined ? V.postCard(x) : V.anyCard(x).replace('class="card"', 'class="card" style="--w:auto"')).join("")}</div>` : `<div class="empty">Tap <b>+</b> on anything to save it here.</div>`}
        </div>

        <div class="dash-section actions">
          <button class="btn btn-outline btn-sm" id="export">${icons.download} Export my data</button>
          <button class="btn btn-outline btn-sm" id="reset">${icons.trash} Clear this profile's data</button>
        </div>
      </div>`;
    $("#switch").addEventListener("click", () => { ssSet(null); chosen = false; render(); });
    $("#edit-prof")?.addEventListener("click", () => editProfile(Store.profile()));
    $("#new-prof")?.addEventListener("click", () => editProfile());
    $("#export").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ profile: Store.profile(), tickets: Store.tickets(), workshops: Store.wsApps(), application: Store.app(), list: Store.list() }, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "vfmbs-my-studio.json"; a.click();
    });
    $("#reset").addEventListener("click", () => {
      if (!confirm("Clear tickets, applications and saved items stored on this device for this profile? (Your RSVPs stay valid on our side.)")) return;
      ["rsvps", "ws", "list"].forEach((k) => Store.set(k, k === "list" ? [] : {}));
      Store.set("app", null);
      V.toast("Profile data cleared");
      render();
    });
    V.fx.scan(host);

    // Live statuses
    if (!V.live) return;
    if (app?.submitted && app.token) {
      V.api("apply?t=" + encodeURIComponent(app.token)).then((s) => {
        const cls = /Accepted|Interview/.test(s.status) ? "st-good" : /Not selected/.test(s.status) ? "st-bad" : /Waitlist/.test(s.status) ? "st-wait" : "st-review";
        $("#app-pill").innerHTML = `<span class="status-pill ${cls}">${esc(s.status)}</span>`;
      }).catch(() => {});
    }
    wsIds.forEach((id) => {
      const t = ws[id].token;
      if (!t) return;
      V.api("workshop?t=" + encodeURIComponent(t)).then((s) => {
        const map = { review: ["Under review", "st-review"], accepted: ["Accepted", "st-good"], waitlisted: ["Waitlisted", "st-wait"], declined: ["Not selected", "st-bad"] };
        const [l, c] = map[s.status] || map.review;
        const el = $(`[data-ws-status="${id}"]`);
        if (el) { el.textContent = l; el.className = "status-pill " + c; }
      }).catch(() => {});
    });
  }
  render();
  V.onRefresh(() => chosen && dashboard());
});
