/* Contact form (also used on the partners page) */
V.contactForm = (host, topic = "General") => {
  const { $, esc } = V;
  const topics = ["General", "Sponsorship", "Speaking", "Press", "Alumni", "Other"];
  host.innerHTML = `
    ${V.demoNote()}
    <form id="contact-form" novalidate>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="row2">
        <div class="field"><label for="c-name">Name *</label><input class="input" id="c-name" name="name" required maxlength="80" autocomplete="name"></div>
        <div class="field"><label for="c-email">Email *</label><input class="input" id="c-email" name="email" type="email" required autocomplete="email"></div>
      </div>
      <div class="row2">
        <div class="field"><label for="c-org">Organization</label><input class="input" id="c-org" name="org" maxlength="120" autocomplete="organization"></div>
        <div class="field"><label for="c-topic">Topic</label><select class="select" id="c-topic" name="topic">${topics.map((t) => `<option ${t === topic ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label for="c-message">Message *</label><textarea class="textarea" id="c-message" name="message" required minlength="10" maxlength="3000"></textarea><div class="counter"></div></div>
      <div class="err" id="c-err" role="alert"></div>
      <button class="btn btn-gold btn-lg" type="submit">Send message</button>
      <p class="form-note">We usually reply within 2–3 business days.</p>
    </form>`;
  V.wireCounters(host);
  $("#contact-form", host).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, btn = $("button[type=submit]", f);
    let bad = V.validate(f);
    if (!bad && $("#c-message").value.trim().length < 10) bad = "Please write a slightly longer message.";
    if (bad) { $("#c-err").textContent = bad; return; }
    V.busy(btn, true);
    try {
      if (V.live) await V.api("contact", Object.fromEntries(new FormData(f)));
      host.innerHTML = `<div class="wrap-screen" style="padding:30px 0">${V.clapperSVG()}<div class="eyebrow center">Message received</div><h2 class="h2">Thanks, ${esc(String(new FormData(f).get("name")).split(" ")[0])}.</h2><p style="color:var(--muted)">${V.live ? "Our team will get back to you soon." : "Preview mode: messages will be delivered once the database is connected."}</p></div>`;
      V.popcorn(host);
    } catch (err) { V.busy(btn, false); $("#c-err").textContent = err.message; }
  });
};
if (V.page === "contact") V.ready.then((C) => {
  const { $, esc, icons } = V;
  const S = C.settings;
  const socials = [["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["tiktok", "TikTok"], ["youtube", "YouTube"]].filter(([k]) => V.safeUrl(S[k]));
  $("#contact-list").innerHTML = `
    <a href="mailto:${esc(S.email)}"><span>General</span>${esc(S.email)} ${icons.arrowUR}</a>
    <a href="mailto:${esc(S.sponsorEmail || S.email)}"><span>Partnerships</span>${esc(S.sponsorEmail || S.email)} ${icons.arrowUR}</a>
    ${socials.map(([k, l]) => `<a href="${esc(V.safeUrl(S[k]))}" target="_blank" rel="noopener noreferrer"><span>${l}</span>Follow ${icons.arrowUR}</a>`).join("")}
    <div><span>Based at</span>${esc(S.location || "")}</div>`;
  V.contactForm($("#contact-host"), new URLSearchParams(location.search).get("topic") || "General");
  V.fx.scan();
});
