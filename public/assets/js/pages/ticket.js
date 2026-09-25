/* Ticket page: /ticket?t=<token>. Verified against the server. */
V.ready.then(async () => {
  const { $, esc, icons } = V;
  const host = $("#ticket-host");
  const token = new URLSearchParams(location.search).get("t");
  const fail = (msg) => {
    host.innerHTML = `<div class="center">${V.clapperSVG()}<div class="eyebrow center">Ticket</div><h1 class="h2">${esc(msg)}</h1><p class="lede" style="margin:0 auto 26px">If you RSVP'd, your ticket link is in your confirmation email and in My Studio on the device you used.</p><div class="actions" style="justify-content:center"><a class="btn btn-gold" href="/events">Browse events</a><a class="btn btn-outline" href="/portal">My Studio</a></div></div>`;
  };
  if (!token) return fail("No ticket found.");
  if (!V.live) return fail("Tickets can't be verified in preview mode.");
  let data;
  try { data = await V.api("ticket?t=" + encodeURIComponent(token)); }
  catch (e) { return fail(e.message); }
  const { ticket: t, event: ev } = data;
  const past = ev.end && new Date(ev.end) < new Date();
  const stamp = t.checkedIn ? ["ADMITTED", "stamp-used"] : t.waitlist ? ["WAITLIST", "stamp-wait"] : past ? ["ENDED", "stamp-used"] : ["VALID", "stamp-valid"];
  document.title = `Ticket · ${ev.title} · VFMBS`;
  host.innerHTML = `
    <div class="eyebrow">${t.waitlist ? "Standby ticket" : "Your ticket"} · No. ${V.pad(t.no, 3)}</div>
    <h1 class="h2" style="margin-bottom:26px">${esc(ev.title)}</h1>
    ${V.ticketHTML(ev, { ...t, token }, { stamp })}
    <div class="ticket-tools" style="margin-top:20px">
      <button class="btn btn-gold btn-sm" id="add-cal">${icons.cal} Add to calendar</button>
      <button class="btn btn-outline btn-sm" id="print">${icons.print} Print</button>
      <a class="btn btn-outline btn-sm" href="/events#${esc(ev.id)}">Event details</a>
    </div>
    <div class="ticket-help">
      <div><b>At the door</b>Show this QR code. We'll scan it to check you in.</div>
      <div><b>Save it</b>Screenshot this page or bookmark the link from your email.</div>
      <div><b>Can't make it?</b>Cancel from My Studio so someone on the waitlist gets your seat.</div>
    </div>`;
  $("#print").addEventListener("click", () => print());
  $("#add-cal").addEventListener("click", () => {
    if (!V.C.events.some((e) => e.id === ev.id)) V.C.events.push(ev);
    const b = document.createElement("button"); b.dataset.ics = ev.id; b.hidden = true; document.body.append(b); b.click(); b.remove();
  });
});
