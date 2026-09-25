/* Workshops page */
V.ready.then((C) => {
  const { $, $$, esc, Store } = V;
  let track = "all", level = "all";
  $("#ws-tracks").innerHTML = [["all", "All tracks"], ...C.tracks.map((t) => [t.id, t.name])].map(([id, n]) => `<button class="filter ${id === "all" ? "on" : ""}" data-t="${id}">${esc(n)}</button>`).join("");
  $$("#ws-tracks .filter").forEach((b) => b.addEventListener("click", () => { track = b.dataset.t; $$("#ws-tracks .filter").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
  const levels = [...new Set(C.workshops.map((w) => w.level))];
  $("#ws-level").innerHTML = `<option value="all">All levels</option>` + levels.map((l) => `<option>${esc(l)}</option>`).join("");
  $("#ws-level").addEventListener("change", (e) => { level = e.target.value; render(); });

  const render = () => {
    const list = C.workshops.filter((w) => (track === "all" || w.track === track) && (level === "all" || w.level === level));
    $("#ws-out").innerHTML = list.length ? list.map((ws, i) => {
      const app = Store.wsApps()[ws.id];
      const closed = ws.open === false || new Date(ws.deadline) < new Date();
      const days = Math.ceil((new Date(ws.deadline) - Date.now()) / 864e5);
      return `
      <article class="ws spot reveal reveal-d${i % 3}" style="${V.vars(ws.palette)}" id="${ws.id}">
        <button class="ws-media" data-open="${ws.id}" aria-label="Episodes for ${esc(ws.title)}" data-cursor="Episodes">${V.art(ws.palette, ws.motif, { image: ws.image })}<span class="card-tag">${esc(V.trackName(ws.track))}</span>${app ? `<span class="card-flag gold">APPLIED</span>` : ""}<div class="card-label">${esc(ws.title)}</div></button>
        <div class="ws-body">
          <h3>${esc(ws.subtitle)}</h3>
          <div class="sub">${esc(ws.schedule)}</div>
          <div class="facts"><div><span>Level</span><b>${esc(ws.level)}</b></div><div><span>Seats</span><b>${ws.seats}</b></div><div><span>Deadline</span><b class="${days <= 5 && !closed ? "hot" : ""}">${closed ? "Closed" : days <= 1 ? "Today" : days + " days"}</b></div></div>
          ${app ? `<div><span class="status-pill st-review">Application under review</span></div>` : ""}
          <div class="ws-foot">
            ${app ? `<a class="btn btn-outline btn-sm" href="/portal">View status</a>` : closed ? `<button class="btn btn-outline btn-sm" disabled>Closed</button>` : `<button class="btn btn-gold btn-sm" data-apply-ws="${ws.id}">Apply</button>`}
            <button class="btn btn-outline btn-sm" data-open="${ws.id}">${(ws.episodes || []).length} Episodes</button>
          </div>
        </div>
      </article>`;
    }).join("") : `<div class="empty">No workshops match those filters.</div>`;
    V.reveal($("#ws-out"));
  };
  render();
  V.onRefresh(render);
  V.fx.scan();
});
