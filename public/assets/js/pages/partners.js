/* Partners page */
V.ready.then((C) => {
  const { $, esc, icons } = V;
  const partners = C.partners || [];
  const tiers = C.sponsorTiers || [];
  const cell = (p) => {
    const url = V.safeUrl(p.url), logo = V.safeUrl(p.logo);
    return `<a class="logo-cell" href="${esc(url || "#")}" ${url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""} title="${esc(p.blurb || p.name)}"><span class="tier">${esc(p.tier || "")}</span>${logo ? `<img src="${esc(logo)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="nm">${esc(p.name)}</span>`}</a>`;
  };
  const open = Math.max(0, 8 - partners.length);
  $("#wall").innerHTML = partners.map(cell).join("") + Array.from({ length: open }, (_, i) => `<a class="logo-cell open" href="#inquire" data-cursor="Partner"><span class="tier">Slot ${V.pad(partners.length + i + 1)}</span><span class="nm">Your logo here</span></a>`).join("");
  $("#tiers").innerHTML = tiers.map((t, i) => `
    <div class="tier-card reveal reveal-d${i} ${i === 0 ? "featured" : ""}" data-tilt>
      <span class="no">No. ${V.pad(i + 1, 3)}</span>
      <div class="admit">Admit · Partner</div>
      <h3>${esc(t.name)}</h3>
      <div class="price">${esc(t.price)}</div>
      <ul>${(t.perks || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      <a class="btn ${i === 0 ? "btn-primary" : "btn-gold"} btn-sm" href="#inquire" data-tier="${esc(t.name)}">Inquire about ${esc(t.name)}</a>
    </div>`).join("");
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tier]");
    if (b) setTimeout(() => { const m = $("#c-message"); if (m && !m.value) m.value = `Hi VFMBS team, we're interested in the ${b.dataset.tier} partnership.`; }, 50);
  });
  const S = C.settings;
  $("#sponsor-email").innerHTML = `<a class="link-arrow" href="mailto:${esc(S.sponsorEmail || S.email)}">${esc(S.sponsorEmail || S.email)} ${icons.arrowUR}</a>`;
  $("#reach").innerHTML = (C.stats || []).map((s, i) => `<div class="stat reveal reveal-d${i}"><div class="stat-n"><span data-count-to="${Number(s.n) || 0}">0</span><small>${esc(s.suffix)}</small></div><div class="stat-l">${esc(s.label)}</div></div>`).join("");
  V.contactForm($("#inquiry"), "Sponsorship");
  V.fx.scan();
});
