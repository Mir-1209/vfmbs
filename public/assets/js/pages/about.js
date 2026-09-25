/* About page */
V.ready.then((C) => {
  const { $, esc } = V;
  $("#tracks-grid").innerHTML = C.tracks.map((t, i) => `
    <a class="track spot reveal reveal-d${i}" style="${V.vars(t.palette)}" href="#tracks" data-open="${t.id}" data-cursor="Open">
      ${V.art(t.palette, t.motif)}<span class="track-no">TRACK ${V.pad(i + 1)}</span><h3>${esc(t.name)}</h3><div class="genre">${esc(t.genre)}</div><p>${esc(t.blurb)}</p>
      <div class="chips">${(t.skills || []).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></a>`).join("");
  $("#stats").innerHTML = (C.stats || []).map((s, i) => `<div class="stat reveal reveal-d${i}"><div class="stat-n"><span data-count-to="${Number(s.n) || 0}">0</span><small>${esc(s.suffix)}</small></div><div class="stat-l">${esc(s.label)}</div></div>`).join("");
  $("#pipe-track").innerHTML = (C.pipeline || []).map((p) => `
    <article class="pipe-card spot" style="${V.vars(p.palette)}">${V.art(p.palette, p.motif)}<div class="pipe-n">${esc(p.n)}</div><div><div class="sub">${esc(p.sub)}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></article>`).join("");
  $("#dues").textContent = C.settings.membershipDues || "";
  V.fx.scan();
});
