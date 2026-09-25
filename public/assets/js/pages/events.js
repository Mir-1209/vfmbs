/* Events page */
V.ready.then((C) => {
  const { $, $$, esc, icons, Store } = V;
  const types = ["All", ...new Set(C.events.map((e) => e.type)), "My RSVPs"];
  let filter = "All", view = "list", q = "", month = null;
  $("#filters").innerHTML = types.map((t) => `<button class="filter ${t === "All" ? "on" : ""}" aria-pressed="${t === "All"}">${esc(t)}</button>`).join("");
  $$("#filters .filter").forEach((b) => b.addEventListener("click", () => { filter = b.textContent; $$("#filters .filter").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); }); render(); }));
  $$("#view button").forEach((b) => b.addEventListener("click", () => { view = b.dataset.v; $$("#view button").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
  $("#ev-q").addEventListener("input", (e) => { q = e.target.value.toLowerCase(); render(); });

  const list = () => C.events
    .filter((e) => filter === "All" || e.type === filter || (filter === "My RSVPs" && Store.tickets()[e.id]))
    .filter((e) => !q || JSON.stringify(e).toLowerCase().includes(q));

  const row = (ev) => {
    const tz = V.evTz(ev), going = Store.tickets()[ev.id], left = V.seatsLeft(ev), past = V.isPast(ev);
    const pct = ev.capacity ? (V.taken(ev) / ev.capacity) * 100 : 0;
    let action;
    if (past) action = `<button class="btn btn-outline btn-sm" disabled>Ended</button>`;
    else if (going) action = `<span class="going">${icons.check} ${going.waitlist ? "On waitlist" : "You're going"}</span><button class="btn btn-primary btn-sm" data-ticket="${ev.id}">View ticket</button>`;
    else if (ev.rsvpOpen === false) action = `<button class="btn btn-outline btn-sm" disabled>RSVPs closed</button>`;
    else action = `<button class="btn btn-gold btn-sm" data-rsvp="${ev.id}">${left ? "RSVP" : "Join waitlist"}</button>`;
    return `
      <article class="ev spot reveal ${past ? "past" : ""}" id="${ev.id}">
        <div class="ev-date"><div class="m">${V.fmt(ev.date, { month: "short" }, tz).toUpperCase()}</div><div class="d">${V.fmt(ev.date, { day: "numeric" }, tz)}</div><div class="w">${V.fmt(ev.date, { weekday: "long" }, tz)}</div></div>
        <button class="ev-thumb in-list" data-open="${ev.id}" aria-label="Details for ${esc(ev.title)}" data-cursor="View">${V.art(ev.palette, ev.motif, { image: ev.image })}</button>
        <div>
          <div class="ev-type">${esc(ev.type)}${(ev.tags || []).map((t) => ` · ${esc(t)}`).join("")}</div>
          <h3>${esc(ev.title)}</h3>
          <div class="ev-info"><span>${icons.clock}${V.fmtTime(ev)}</span><span>${icons.pin}${esc(ev.location)}</span></div>
          ${ev.capacity ? `<div class="ev-cap"><div class="seat-bar"><i style="width:${pct}%"></i></div><span class="${left <= 10 ? "hot" : ""}">${left ? `${left} of ${ev.capacity} seats left` : "Sold out · waitlist open"}</span></div>` : ""}
        </div>
        <div class="ev-actions">${action}<button class="btn btn-outline btn-sm" data-open="${ev.id}">Details</button></div>
      </article>`;
  };

  const render = () => {
    const out = $("#ev-out");
    const evs = list();
    if (view === "cal") return renderCal(out, evs);
    const up = evs.filter((e) => !V.isPast(e)), past = evs.filter(V.isPast).reverse();
    if (!evs.length) { out.innerHTML = `<div class="empty">No screenings match. ${filter === "My RSVPs" ? "RSVP to an event and it'll show up here." : "Try another filter."}</div>`; return; }
    out.innerHTML = (up.length ? `<div class="ev-list">${up.map(row).join("")}</div>` : `<div class="empty">No upcoming events match. New premieres are announced every few weeks. <a href="#newsletter">Get notified →</a></div>`) +
      (past.length ? `<details class="past-toggle"><summary>Past events (${past.length})</summary><div class="ev-list">${past.map(row).join("")}</div></details>` : "");
    V.reveal(out);
  };

  const dayKey = (iso, tz) => V.fmt(iso, { year: "numeric", month: "2-digit", day: "2-digit" }, tz);
  const renderCal = (out, evs) => {
    if (!month) {
      const first = evs.find((e) => !V.isPast(e)) || evs[0];
      const d = first ? new Date(first.date) : new Date();
      month = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const y = month.getFullYear(), mo = month.getMonth();
    const start = new Date(y, mo, 1 - new Date(y, mo, 1).getDay());
    const todayK = dayKey(new Date().toISOString(), V.TZ);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = `${V.pad(d.getMonth() + 1)}/${V.pad(d.getDate())}/${d.getFullYear()}`;
      const day = evs.filter((e) => { const s = dayKey(e.date, V.evTz(e)), en = dayKey(e.end || e.date, V.evTz(e)); const n = (x) => x.slice(6) + x.slice(0, 2) + x.slice(3, 5); return n(k) >= n(s) && n(k) <= n(en); });
      cells.push(`<div class="cal-day ${d.getMonth() !== mo ? "muted" : ""} ${k === todayK ? "today" : ""}"><div class="num">${d.getDate()}</div>${day.map((e) => `<button class="cal-ev ${Store.tickets()[e.id] ? "mine" : ""}" style="${V.vars(e.palette)}" data-open="${e.id}" title="${esc(e.title)}">${esc(e.title)}</button>`).join("")}</div>`);
    }
    out.innerHTML = `<div class="cal">
      <div class="cal-head"><button class="icon-btn" id="cal-prev" aria-label="Previous month">${icons.chevL}</button><h3>${month.toLocaleString("en-US", { month: "long", year: "numeric" })}</h3><button class="icon-btn" id="cal-next" aria-label="Next month">${icons.chevR}</button></div>
      <div class="cal-grid">${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => `<div class="cal-dow">${d}</div>`).join("")}${cells.join("")}</div></div>`;
    $("#cal-prev").addEventListener("click", () => { month = new Date(y, mo - 1, 1); render(); });
    $("#cal-next").addEventListener("click", () => { month = new Date(y, mo + 1, 1); render(); });
  };

  const next = C.events.find((e) => !V.isPast(e));
  if (next) {
    $("#next-up").innerHTML = `<div class="eyebrow">Next up · ${V.fmtDate(next)} · ${esc(next.location)}</div><h2 class="h2">${esc(next.title)}</h2><div class="countdown left" id="ev-count"></div><div class="actions">${Store.tickets()[next.id] ? `<button class="btn btn-primary" data-ticket="${next.id}">${icons.ticket} View ticket</button>` : `<button class="btn btn-primary magnetic" data-rsvp="${next.id}">${icons.play} RSVP</button>`}<button class="btn btn-ghost" data-open="${next.id}">${icons.info} Details</button></div>`;
    V.countdown($("#ev-count"), next.date);
  }
  render();
  V.onRefresh(render);
  V.fx.scan();
});
