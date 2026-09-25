/* Team page */
V.ready.then((C) => {
  const { $, $$, esc, icons } = V;
  const team = C.team || [];
  const groups = [...new Set(team.map((m) => m.group || "Team"))];
  let active = "All";
  $("#team-filters").innerHTML = ["All", ...groups].map((g) => `<button class="filter ${g === "All" ? "on" : ""}">${esc(g)}</button>`).join("");
  $$("#team-filters .filter").forEach((b) => b.addEventListener("click", () => { active = b.textContent; $$("#team-filters .filter").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
  const track = (id) => C.tracks.find((t) => t.id === id) || { palette: "gold" };

  const card = (m) => {
    const t = track(m.track);
    const ini = String(m.name || "").split(" ").map((w) => w[0]).join("").slice(0, 2);
    const photo = V.safeUrl(m.photo);
    return `<button class="cast-card spot reveal" style="${V.vars(t.palette)}" data-member="${esc(m.id)}" data-cursor="Bio">
      ${V.art(t.palette, null, { image: photo })}${photo ? "" : `<div class="initials">${esc(ini)}</div>`}
      <div class="cast-info"><div class="r">${esc(m.role)}</div><div class="n">${esc(m.name)} <span class="y">${esc(m.year || "")}</span></div><div class="bio">${esc(m.bio || "")}</div></div>
    </button>`;
  };
  const render = () => {
    const gs = active === "All" ? groups : [active];
    $("#team-out").innerHTML = gs.map((g) => {
      const ms = team.filter((m) => (m.group || "Team") === g);
      return `<section class="team-group"><div class="team-group-head"><h2>${esc(g)}</h2><span class="mono">${ms.length} ${ms.length === 1 ? "member" : "members"}</span></div><div class="cast">${ms.map(card).join("")}</div></section>`;
    }).join("") || `<div class="empty">The cast list is coming soon.</div>`;
    V.reveal($("#team-out"));
  };
  render();

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-member]");
    if (!b) return;
    const m = team.find((x) => x.id === b.dataset.member);
    if (!m) return;
    const t = track(m.track);
    const photo = V.safeUrl(m.photo);
    V.openModal(`
      <div class="modal-hero" style="aspect-ratio:16/7">${V.art(t.palette, photo ? null : t.motif, { image: photo, beam: !photo })}
        <div class="modal-hero-content"><div class="kicker"><img src="/assets/brand/logo.svg" alt="">${esc(m.group || "Team")}</div><h2>${esc(m.name)}</h2></div></div>
      <div class="modal-body">
        <div class="meta-line"><span class="match">${esc(m.role)}</span>${m.year ? `<span>Class of ${esc(m.year)}</span>` : ""}${m.major ? `<span>${esc(m.major)}</span>` : ""}${m.track ? `<span class="rating">${esc(V.trackName(m.track).toUpperCase())}</span>` : ""}</div>
        <p style="font-size:17px;white-space:pre-line">${esc(m.bio || "")}</p>
        <div class="actions" style="margin-top:18px">
          ${V.safeUrl(m.linkedin) ? `<a class="btn btn-outline btn-sm" href="${esc(V.safeUrl(m.linkedin))}" target="_blank" rel="noopener noreferrer">${icons.li} LinkedIn</a>` : ""}
          ${m.email ? `<a class="btn btn-outline btn-sm" href="mailto:${esc(m.email)}">${icons.mail} Email</a>` : ""}
        </div>
      </div>`);
  });

  // Credits roll
  const roll = groups.map((g) => `<div class="gh">${esc(g)}</div>` + team.filter((m) => (m.group || "Team") === g).map((m) => `<div class="role">${esc(m.role)}</div><div class="name">${esc(m.name)}</div>`).join("")).join("");
  $("#roll").innerHTML = roll + `<div class="gh">And introducing</div><div class="name">You</div><div class="role"><a href="/apply" style="color:var(--gold)">Apply to join the cast →</a></div>`;
  V.fx.scan();
});
