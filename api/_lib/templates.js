// Email templates: the Vanderbilt Greenlight "cinema" look, rebuilt for inboxes.
// Email clients have no JS, limited CSS, and (Gmail) no web fonts or SVG, so everything
// here is tables + inline styles with robust fallbacks. Each template returns
// { subject, preheader, html, text }.
import { esc } from "./email.js";

const C = {
  page: "#050505", card: "#0e0d0c", band: "#13110f", line: "#26221d",
  cream: "#f2ede4", text: "#e4ded2", muted: "#a8a296", dim: "#6f6a62",
  gold: "#cfae70", green: "#2fbf71", ink: "#1a1408", paper: "#f4ecda", stub: "#e9d9b2",
};
const F = {
  display: "'Bebas Neue',Impact,'Haettenschweiler','Arial Narrow Bold','Arial Narrow','Franklin Gothic Bold','Arial Black',sans-serif",
  serif: "'Playfair Display',Georgia,'Times New Roman',serif",
  mono: "'JetBrains Mono','SFMono-Regular',Menlo,Consolas,'Courier New',monospace",
  sans: "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif",
};
const pad = (n, l = 2) => String(n).padStart(l, "0");
const first = (name) => String(name || "").trim().split(/\s+/)[0] || "there";
const fmt = (iso, o, tz = "America/Chicago") => { try { return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...o }).format(new Date(iso)); } catch { return ""; } };

/* ---------------- building blocks ---------------- */
const sprockets = (n = 26) => `
  <tr><td style="background:#15120f;padding:7px 10px;font-size:0;line-height:0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${Array.from({ length: n }, (_, i) => i % 2 === 0
        ? `<td width="14" height="9" style="background:#e9e0cd;border-radius:2px;font-size:0;line-height:0">&nbsp;</td>`
        : `<td style="font-size:0;line-height:0">&nbsp;</td>`).join("")}
    </tr></table>
  </td></tr>`;

const kickerHTML = (txt, color = C.gold) =>
  `<div style="font-family:${F.mono};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${color};margin:0 0 14px">${txt}</div>`;

export function button(label, href, kind = "gold") {
  const bg = kind === "gold" ? C.gold : "transparent";
  const fg = kind === "gold" ? "#111111" : C.cream;
  const border = kind === "gold" ? C.gold : "#4a443c";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 10px 0"><tr>
    <td align="center" bgcolor="${kind === "gold" ? C.gold : C.card}" style="border-radius:999px;border:1px solid ${border};background:${bg}">
      <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${F.sans};font-size:15px;font-weight:700;letter-spacing:.2px;color:${fg};text-decoration:none;border-radius:999px">${esc(label)}</a>
    </td></tr></table>`;
}

const section = (inner, padY = "28px") => `<tr><td class="px" style="padding:${padY} 40px;background:${C.card}">${inner}</td></tr>`;
const rule = () => `<tr><td style="padding:0 40px;background:${C.card}"><div style="height:1px;line-height:1px;font-size:0;background:${C.line}">&nbsp;</div></td></tr>`;

const details = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${rows.filter(([, v]) => v).map(([k, v]) => `<tr>
      <td valign="top" width="120" style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${F.mono};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${C.dim}">${esc(k)}</td>
      <td valign="top" style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${F.sans};font-size:15px;line-height:1.5;color:${C.cream}">${v}</td></tr>`).join("")}
  </table>`;

const note = (html, color = C.green) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-left:3px solid ${color};background:${C.band};padding:14px 18px;border-radius:0 8px 8px 0;font-family:${F.sans};font-size:14px;line-height:1.55;color:${C.text}">${html}</td></tr></table>`;

function steps(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map((s, i) => {
    const done = s.state === "done", now = s.state === "now";
    const dotBg = done ? C.green : now ? C.gold : C.card, dotFg = done || now ? "#111" : C.muted, dotBorder = done ? C.green : now ? C.gold : "#4a443c";
    return `<tr>
      <td valign="top" width="44" style="padding:0 0 ${i === items.length - 1 ? 0 : 18}px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="30" height="30" align="center" valign="middle" style="width:30px;height:30px;border-radius:50%;border:1.5px solid ${dotBorder};background:${dotBg};font-family:${F.mono};font-size:12px;font-weight:700;color:${dotFg}">${done ? "✓" : i + 1}</td></tr></table>
      </td>
      <td valign="top" style="padding:4px 0 ${i === items.length - 1 ? 0 : 18}px">
        <div style="font-family:${F.sans};font-size:15px;font-weight:700;color:${now ? C.gold : done ? C.cream : C.text}">${esc(s.label)}${now ? ` <span style="font-family:${F.mono};font-size:10px;letter-spacing:2px;color:${C.gold}">· YOU ARE HERE</span>` : ""}</div>
        ${s.sub ? `<div style="font-family:${F.sans};font-size:13px;color:${C.muted};margin-top:2px">${esc(s.sub)}</div>` : ""}
      </td></tr>`;
  }).join("")}</table>`;
}

function ticketCard({ base, ev, t }) {
  const tz = ev.tz || "America/Chicago";
  const qr = t.token ? `${base}/api/qr?t=${encodeURIComponent(t.token)}` : "";
  const cell = (k, v, w = "") => `<td valign="top" ${w} style="padding:0 14px 12px 0"><div style="font-family:${F.mono};font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#8a7a58">${k}</div><div style="font-family:${F.sans};font-size:14px;font-weight:700;color:${C.ink};margin-top:3px">${v}</div></td>`;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:16px;background:${C.paper}" bgcolor="${C.paper}">
    <tr>
      <td class="stack" valign="top" width="66%" style="padding:24px 22px 14px 26px;border-right:2px dashed #c4b183;border-radius:16px 0 0 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7a6a48">${t.waitlist ? "Standby · Waitlist" : "Admit one"} · ${esc(ev.type || "Event")}</td>
          <td align="right"><img src="${base}/assets/brand/icon-192.png" width="28" height="28" alt="" style="display:block;border-radius:3px;border:0"></td>
        </tr></table>
        <div style="font-family:${F.display};font-size:34px;line-height:1;letter-spacing:.5px;text-transform:uppercase;color:${C.ink};margin:12px 0 16px">${esc(ev.title)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          ${cell("Date", fmt(ev.date, { weekday: "short", month: "short", day: "numeric" }, tz))}
          ${cell("Doors", fmt(ev.date, { hour: "numeric", minute: "2-digit" }, tz))}
          ${cell(t.waitlist ? "Waitlist" : "Admission", "No.&nbsp;" + pad(t.no || 0, 3))}
        </tr><tr>
          ${cell("Venue", esc(ev.location || "TBA"), 'colspan="2"')}
          ${cell("Guest", esc(first(t.name)))}
        </tr></table>
      </td>
      <td class="stack stub" valign="middle" align="center" width="34%" bgcolor="${C.stub}" style="padding:20px 14px;background:${C.stub};border-radius:0 16px 16px 0">
        ${qr ? `<img src="${qr}" width="128" height="128" alt="Ticket QR code ${esc(t.code)}" style="display:block;margin:0 auto;width:128px;height:128px;border:0;border-radius:6px">` : ""}
        <div style="font-family:${F.mono};font-size:12px;font-weight:700;letter-spacing:2px;color:${C.ink};margin-top:10px">${esc(t.code)}</div>
        <div style="font-family:${F.display};font-size:30px;line-height:1;color:#9a7b3c;margin-top:4px">No.&nbsp;${pad(t.no || 0, 3)}</div>
      </td>
    </tr>
  </table>`;
}

function shell({ base, preheader, scene, kicker, kickerColor, title, dek, body, reason, s = {} }) {
  const socials = [["Instagram", s.instagram], ["LinkedIn", s.linkedin], ["TikTok", s.tiktok], ["YouTube", s.youtube]].filter(([, u]) => /^https?:\/\//.test(u || ""));
  const link = (label, href) => `<a href="${esc(href)}" target="_blank" style="color:${C.muted};text-decoration:none">${label}</a>`;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@500;700&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: dark light; supported-color-schemes: dark light; }
  body { margin:0 !important; padding:0 !important; width:100% !important; background:${C.page}; }
  a { color:${C.gold}; }
  img { -ms-interpolation-mode:bicubic; }
  @media (max-width:620px) {
    .px { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:46px !important; }
    .stack { display:block !important; width:100% !important; box-sizing:border-box; border-right:0 !important; border-radius:16px 16px 0 0 !important; }
    .stub { border-top:2px dashed #c4b183 !important; border-radius:0 0 16px 16px !important; }
    .hide-sm { display:none !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:${C.page}" bgcolor="${C.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(preheader)}${"&#8199;&#65279;&#847; ".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page}"><tr><td align="center" style="padding:28px 10px 40px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-radius:14px;overflow:hidden;border:1px solid ${C.line}">
  ${sprockets()}
  <tr><td class="px" style="padding:22px 40px;background:${C.card};border-bottom:1px solid ${C.line}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" width="48"><a href="${base}" target="_blank"><img src="${base}/assets/brand/icon-192.png" width="40" height="40" alt="Vanderbilt Greenlight" style="display:block;border:0;border-radius:4px"></a></td>
      <td valign="middle" style="padding-left:10px;font-family:${F.display};font-size:15px;line-height:1.05;letter-spacing:3px;text-transform:uppercase">
        <span style="color:${C.cream}">Vanderbilt</span><br><span style="color:${C.green}">Greenlight</span></td>
      <td class="hide-sm" valign="middle" align="right" style="font-family:${F.mono};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${C.dim}"><span style="color:#ff4052">●</span> ${esc(scene)}</td>
    </tr></table>
  </td></tr>
  <tr><td class="px" style="padding:44px 40px 30px;background:${C.card};background-image:radial-gradient(90% 120% at 100% 0%, rgba(207,174,112,.16), rgba(207,174,112,0) 60%)">
    ${kickerHTML(kicker, kickerColor)}
    <div class="h1" style="font-family:${F.display};font-size:58px;line-height:.92;letter-spacing:.5px;text-transform:uppercase;color:${C.cream};margin:0">${title}</div>
    ${dek ? `<div style="font-family:${F.serif};font-style:italic;font-size:20px;line-height:1.4;color:${C.muted};margin:16px 0 0">${dek}</div>` : ""}
  </td></tr>
  ${body}
  <tr><td class="px" style="padding:34px 40px 30px;background:${C.band};border-top:1px solid ${C.line}" align="center">
    <div style="font-family:${F.mono};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.gold}">A Vanderbilt Greenlight Production</div>
    <div style="font-family:${F.serif};font-style:italic;font-size:15px;color:${C.muted};margin:8px 0 18px">The business of film &amp; media</div>
    <div style="font-family:${F.mono};font-size:11px;letter-spacing:2px;text-transform:uppercase">
      ${link("Events", `${base}/events`)} &nbsp;·&nbsp; ${link("Workshops", `${base}/workshops`)} &nbsp;·&nbsp; ${link("Journal", `${base}/journal`)} &nbsp;·&nbsp; ${link("My Studio", `${base}/portal`)}
    </div>
    ${socials.length ? `<div style="font-family:${F.mono};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:10px">${socials.map(([n, u]) => link(n, u)).join(" &nbsp;·&nbsp; ")}</div>` : ""}
    <div style="font-family:${F.sans};font-size:12px;line-height:1.6;color:${C.dim};margin-top:22px">${reason || ""}<br>Vanderbilt Greenlight · ${esc(s.location || "Vanderbilt University · Nashville, Tennessee")}</div>
    <div style="font-family:${F.serif};font-style:italic;font-size:22px;color:#4a443c;margin-top:18px">The End</div>
  </td></tr>
  ${sprockets()}
</table>
</td></tr></table>
</body></html>`;
}

const textFooter = (base) => `\n\n—\nVanderbilt Greenlight · The business of film & media\n${base}`;

function gcalLink(ev, base) {
  const z = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({ action: "TEMPLATE", text: `${ev.title} (Vanderbilt Greenlight)`, dates: `${z(ev.date)}/${z(ev.end || ev.date)}`, location: ev.location || "", details: `${ev.desc || ""}\n\n${base}/events#${ev.id}` });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/* ---------------- 1. Ticket (RSVP) ---------------- */
export function ticketEmail({ base, ev, t, s }) {
  const tz = ev.tz || "America/Chicago";
  const link = `${base}/ticket?t=${encodeURIComponent(t.token || "")}`;
  const when = `${fmt(ev.date, { weekday: "long", month: "long", day: "numeric" }, tz)}<br><span style="color:${C.muted}">${fmt(ev.date, { hour: "numeric", minute: "2-digit" }, tz)}${ev.end ? " – " + fmt(ev.end, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }, tz) : ""}</span>`;
  const shortDate = fmt(ev.date, { weekday: "short", month: "short", day: "numeric" }, tz);
  const subject = t.waitlist ? `You're on the waitlist · ${ev.title}` : `🎟 Your ticket · ${ev.title}`;
  const preheader = t.waitlist ? `The house is full. You're No. ${pad(t.no, 3)} on the waitlist for ${shortDate}.` : `${shortDate} · ${ev.location || ""}. Show the QR code at the door.`;
  const body = `
    ${section(`${ticketCard({ base, ev, t })}
      <div style="font-family:${F.mono};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${C.dim};text-align:center;margin-top:12px">${t.waitlist ? "Your standby pass · we'll email you if a seat opens" : "Show this QR code at the door · phone or printed"}</div>`, "6px")}
    ${section(`${button(t.waitlist ? "View my standby pass" : "Open my ticket", link)}${button("Add to Google Calendar", gcalLink(ev, base), "ghost")}`, "6px")}
    ${section(details([["When", when], ["Where", esc(ev.location || "TBA")], ["What", esc(ev.type || "Event") + (ev.membersOnly ? " · Members only" : "")], ["Bring", t.waitlist ? "Nothing yet. If a seat opens, we'll email you a confirmed ticket" : "This ticket (on your phone is fine) and your Vanderbilt ID"]]), "18px")}
    ${ev.desc ? section(`<div style="font-family:${F.serif};font-style:italic;font-size:17px;line-height:1.6;color:${C.text}">“${esc(ev.desc)}”</div>`, "12px") : ""}
    ${section(note(t.waitlist ? `<b style="color:${C.cream}">You're No.&nbsp;${pad(t.no, 3)} on standby.</b> If a seat opens up, we'll move you onto the guest list and email you right away.` : `<b style="color:${C.cream}">Can't make it?</b> Cancel from <a href="${base}/portal" style="color:${C.gold}">My Studio</a> so someone on the waitlist gets your seat.`), "12px 40px 36px")}`;
  const html = shell({
    base, s, preheader, scene: t.waitlist ? "Standby" : `Admit one · No. ${pad(t.no, 3)}`,
    kicker: t.waitlist ? "● Standby · Waitlist confirmed" : `<span style="color:${C.green}">●</span> You're on the list`,
    title: t.waitlist ? "You're on<br>standby." : "See you at<br>the premiere.",
    dek: `Hi ${esc(first(t.name))}, ${t.waitlist ? `the house for <b style="color:${C.cream};font-style:normal">${esc(ev.title)}</b> is full, but your name is on the list.` : `your seat for <b style="color:${C.cream};font-style:normal">${esc(ev.title)}</b> is reserved.`}`,
    body, reason: "You're receiving this because you RSVP'd on the Vanderbilt Greenlight website.",
  });
  const text = `${t.waitlist ? "You're on the waitlist" : "Your ticket"}: ${ev.title}\n\nHi ${first(t.name)},\n${t.waitlist ? `The house is full. You're No. ${pad(t.no, 3)} on the waitlist; we'll email you if a seat opens.` : "Your seat is reserved. Show the QR code on your ticket at the door."}\n\nWhen: ${fmt(ev.date, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }, tz)}\nWhere: ${ev.location || "TBA"}\nTicket: ${t.code} · No. ${pad(t.no, 3)}\n\nOpen your ticket: ${link}\nCan't make it? Cancel in My Studio: ${base}/portal${textFooter(base)}`;
  return { subject, preheader, html, text };
}

/* ---------------- 2. Membership application ---------------- */
export function applicationEmail({ base, app, id, token, tracks = [], s = {} }) {
  const link = `${base}/apply?t=${encodeURIComponent(token)}`;
  const name = app.pref || first(app.name);
  const future = (s.timeline || []).filter((x) => new Date(x.date) > new Date() && !/due|deadline/i.test(x.label));
  const items = [
    { label: "Application submitted", sub: `Confirmation ${id}`, state: "done" },
    { label: "Book your interview", sub: "Pick a 20-minute slot that works for you", state: "now" },
    ...(future.length ? future.map((x) => ({ label: x.label, sub: fmt(x.date, { weekday: "long", month: "long", day: "numeric" }) })) : [{ label: "Interviews", sub: "Short and conversational, no prep required" }, { label: "Decisions", sub: "Sent by email after interviews" }]),
  ];
  const trackName = (tid) => (tracks.find((t) => t.id === tid) || {}).name || tid;
  const body = `
    ${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="border:1px solid ${C.line};border-radius:12px;padding:18px 20px;background:${C.band}">
        <div style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.dim}">Confirmation number</div>
        <div style="font-family:${F.mono};font-size:26px;font-weight:700;letter-spacing:4px;color:${C.gold};margin-top:6px">${esc(id)}</div>
      </td></tr></table>`, "6px")}
    ${section(`<div style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};margin-bottom:16px">What happens next</div>${steps(items)}`, "22px")}
    ${section(`${button("Book my interview", link)}`, "4px")}
    ${rule()}
    ${section(details([["Name", esc(app.name)], ["Tracks", (app.tracks || []).map((t, i) => `${i + 1}. ${esc(trackName(t))}`).join("<br>")], ["Class", esc(`${app.year} · ${app.major}`)]]), "18px")}
    ${section(note(`<b style="color:${C.cream}">Keep this email.</b> The button above is your private link to book or change your interview, check your status, or withdraw.`, C.gold), "8px 40px 36px")}`;
  const html = shell({
    base, s, preheader: `Confirmation ${id}. Next step: book your interview slot.`, scene: "Casting call",
    kicker: `<span style="color:${C.green}">●</span> Casting call · Application received`,
    title: `That's a wrap,<br>${esc(name)}.`,
    dek: "Your application is in the screening room. One more scene to go: your interview.",
    body, reason: "You're receiving this because you applied to join Vanderbilt Greenlight.",
  });
  const text = `Application received: Vanderbilt Greenlight\n\nThat's a wrap, ${name}.\nConfirmation: ${id}\n\nNext step: book your interview slot:\n${link}\n\nKeep this email. That link lets you book or change your interview, check your status, or withdraw.${textFooter(base)}`;
  return { subject: `Application received · Vanderbilt Greenlight (${id})`, preheader: `Next step: book your interview.`, html, text };
}

/* ---------------- 3. Workshop application ---------------- */
export function workshopEmail({ base, ws, app, code, s = {} }) {
  const eps = (ws.episodes || []).slice(0, 8);
  const decide = ws.deadline ? `Shortly after applications close on ${fmt(ws.deadline, { weekday: "long", month: "long", day: "numeric" })}` : "Shortly after applications close";
  const body = `
    ${section(details([["Schedule", esc(ws.schedule || "TBA")], ["Where", esc(ws.location || "")], ["Level", esc(ws.level || "")], ["Seats", ws.seats ? String(ws.seats) : ""], ["Decision", esc(decide)], ["Reference", `<span style="font-family:${F.mono};letter-spacing:2px;color:${C.gold}">${esc(code)}</span>`]]), "6px")}
    ${eps.length ? section(`<div style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};margin-bottom:12px">Season 1 · ${eps.length} episodes</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${eps.map((e, i) => `<tr>
        <td valign="top" width="54" style="padding:12px 0;border-top:1px solid ${C.line};font-family:${F.display};font-size:26px;line-height:1;color:${i === eps.length - 1 ? C.gold : C.dim}">${pad(i + 1)}</td>
        <td valign="top" style="padding:12px 0;border-top:1px solid ${C.line}"><div style="font-family:${F.sans};font-size:15px;font-weight:700;color:${C.cream}">${esc(e.t)}</div>${e.s ? `<div style="font-family:${F.sans};font-size:13px;color:${C.muted};margin-top:3px">${esc(e.s)}</div>` : ""}</td>
        <td valign="top" align="right" width="64" style="padding:13px 0;border-top:1px solid ${C.line};font-family:${F.mono};font-size:11px;color:${C.dim}">${esc(e.d || "")}</td></tr>`).join("")}</table>`, "22px") : ""}
    ${section(`${button("Track my status", `${base}/portal`)}${button("See all workshops", `${base}/workshops`, "ghost")}`, "10px 40px 36px")}`;
  const html = shell({
    base, s, preheader: `${ws.title}: we've got your application. Decisions come ${decide.toLowerCase()}.`, scene: "Limited series",
    kicker: `<span style="color:${C.green}">●</span> Workshop · Application received`,
    title: esc(ws.title),
    dek: `Thanks, ${esc(first(app.name))}. ${ws.subtitle ? esc(ws.subtitle) + "." : ""} You're in the pitch meeting.`,
    body, reason: "You're receiving this because you applied to a Vanderbilt Greenlight workshop.",
  });
  const text = `Workshop application received: ${ws.title}\n\nThanks, ${first(app.name)}. We've got your application.\nSchedule: ${ws.schedule || "TBA"}\nDecision: ${decide}\nReference: ${code}\n\nTrack your status: ${base}/portal${textFooter(base)}`;
  return { subject: `Application received · ${ws.title}`, preheader: "", html, text };
}

/* ---------------- 4. Contact / sponsorship notification (to the board) ---------------- */
export function contactEmail({ base, msg, s = {} }) {
  const received = fmt(msg.ts || Date.now(), { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const reply = `mailto:${msg.email}?subject=${encodeURIComponent("Re: your message to Vanderbilt Greenlight")}`;
  const hot = msg.topic === "Sponsorship";
  const body = `
    ${section(details([["From", esc(msg.name)], ["Email", `<a href="${esc(reply)}" style="color:${C.gold};text-decoration:none">${esc(msg.email)}</a>`], ["Organization", esc(msg.org || "")], ["Topic", `<span style="display:inline-block;padding:3px 10px;border-radius:99px;background:${hot ? C.gold : C.band};color:${hot ? "#111" : C.cream};font-family:${F.mono};font-size:11px;letter-spacing:1.5px;text-transform:uppercase">${esc(msg.topic)}</span>`], ["Received", esc(received)]]), "6px")}
    ${section(`<div style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};margin-bottom:10px">Message</div>
      <div style="border:1px solid ${C.line};background:${C.band};border-radius:12px;padding:20px 22px;font-family:${F.sans};font-size:15px;line-height:1.65;color:${C.cream};white-space:pre-wrap">${esc(msg.message)}</div>`, "20px")}
    ${section(`${button(`Reply to ${first(msg.name)}`, reply)}${button("Open admin inbox", `${base}/admin#inbox`, "ghost")}`, "8px 40px 36px")}`;
  const html = shell({
    base, s, preheader: `${msg.name}${msg.org ? " · " + msg.org : ""}: ${String(msg.message).slice(0, 90)}`, scene: "Call sheet",
    kicker: `<span style="color:${hot ? C.gold : C.green}">●</span> Call sheet · New ${esc(msg.topic.toLowerCase())} inquiry`,
    title: esc(msg.name), dek: msg.org ? esc(msg.org) : "Sent through the website contact form",
    body, reason: "Board notification. Press Reply to answer the sender directly. A copy is saved in Admin → Inbox.",
  });
  const text = `New ${msg.topic} inquiry\n\nFrom: ${msg.name} <${msg.email}>${msg.org ? `\nOrganization: ${msg.org}` : ""}\nReceived: ${received}\n\n${msg.message}\n\nReply directly to this email to answer them. Admin inbox: ${base}/admin#inbox`;
  return { subject: `[Greenlight · ${msg.topic}] ${msg.name}${msg.org ? " · " + msg.org : ""}`, preheader: "", html, text };
}

/* ---------------- 5. Decision ready (membership or workshop) ---------------- */
// Deliberately neutral: the email never reveals the outcome, it points to the letter.
export function decisionReadyEmail({ base, name, ref, program, s = {} }) {
  const link = `${base}/decision`;
  const body = `
    ${section(`<div style="font-family:${F.sans};font-size:16px;line-height:1.7;color:${C.text}">
      Thank you for your patience while the board reviewed applications for ${esc(program)}. A decision letter about your application has been posted, and you can read it at any time using your confirmation number below.</div>`, "6px")}
    ${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="border:1px solid ${C.line};border-radius:12px;padding:18px 20px;background:${C.band}">
        <div style="font-family:${F.mono};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.dim}">Your confirmation number</div>
        <div style="font-family:${F.mono};font-size:26px;font-weight:700;letter-spacing:4px;color:${C.gold};margin-top:6px">${esc(ref)}</div>
      </td></tr></table>`, "14px")}
    ${section(`${button("View my decision", link)}`, "6px")}
    ${section(note(`<b style="color:${C.cream}">How it works.</b> Open the page, enter your confirmation number, and your letter will appear. For your privacy, the letter is only shown to someone with this number.`, C.gold), "8px 40px 36px")}`;
  const html = shell({
    base, s, preheader: `A decision on your application (${ref}) is ready to view.`, scene: "Final cut",
    kicker: `<span style="color:${C.green}">●</span> Application update`,
    title: "Your decision<br>is ready.",
    dek: `Hi ${esc(first(name))}, thank you for applying.`,
    body, reason: "You're receiving this because you applied to Vanderbilt Greenlight.",
  });
  const text = `Your decision is ready\n\nHi ${first(name)},\n\nThank you for your patience while the board reviewed applications for ${program}. A decision letter about your application has been posted.\n\nConfirmation number: ${ref}\nView your decision: ${link}\n\nEnter your confirmation number on that page to read your letter.${textFooter(base)}`;
  return { subject: `Your application decision is ready · ${ref}`, preheader: "", html, text };
}
