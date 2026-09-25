/* Journal ("The Reel"): index + article view via ?p=<id> */
V.ready.then((C) => {
  const { $, $$, esc, icons } = V;
  const S = C.settings;
  const posts = C.posts || [];
  const date = (d) => (d ? V.fmt(d + "T12:00:00Z", { month: "long", day: "numeric", year: "numeric" }, "UTC") : "");
  const id = new URLSearchParams(location.search).get("p");
  const post = id && posts.find((p) => p.id === id);
  const main = $("#main");

  if (post) {
    document.title = `${post.title} · The Reel · VFMBS`;
    const paras = String(post.body || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
      .map((p) => p.startsWith("> ") ? `<blockquote>${esc(p.slice(2))}</blockquote>` : `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
    const words = String(post.body || "").split(/\s+/).length;
    const others = posts.filter((p) => p.id !== post.id).slice(0, 3);
    main.innerHTML = `
      <article class="article container">
        <header class="article-head">
          <div class="crumbs mono"><a href="/journal">The Reel</a> / ${esc(post.category)}</div>
          <h1 data-split>${esc(post.title)}</h1>
          <p class="dek">${esc(post.excerpt)}</p>
          <div class="post-meta">${date(post.date)} · By ${esc(post.author || "VFMBS")} · ${Math.max(1, Math.round(words / 220))} min read</div>
        </header>
        <div class="article-cover img-reveal">${V.art(post.palette, post.motif, { image: post.image, beam: true })}</div>
        <div class="article-body">${paras}</div>
        <div class="article-foot"><a class="link-arrow" href="/journal">${icons.chevL} All stories</a><button class="btn btn-outline btn-sm" data-share="/journal?p=${encodeURIComponent(post.id)}">${icons.link} Copy link</button></div>
      </article>
      ${others.length ? `<section class="section container"><div class="eyebrow">Keep reading</div><div class="post-grid">${others.map(V.postCard).join("")}</div></section>` : ""}`;
    V.fx.scan();
    return;
  }

  const cats = ["All", ...new Set(posts.map((p) => p.category))];
  let cat = "All";
  main.innerHTML = `
    <header class="journal-mast container">
      <div class="mono">Stories, breakdowns &amp; dispatches from the business of entertainment</div>
      <h1 class="masthead" data-split>The Reel</h1>
      <div class="issue-line"><span>${esc(S.issue || "")}</span><span>${esc(S.season || "")}</span><span>Vanderbilt Film &amp; Media Business Society</span></div>
    </header>
    <section class="section-tight container">
      <div class="toolbar"><div class="filters" id="cats">${cats.map((c) => `<button class="filter ${c === "All" ? "on" : ""}">${esc(c)}</button>`).join("")}</div></div>
      <div id="posts"></div>
    </section>`;
  const render = () => {
    const list = posts.filter((p) => cat === "All" || p.category === cat);
    if (!list.length) { $("#posts").innerHTML = `<div class="empty">No stories yet. Check back soon.</div>`; return; }
    const [first, ...rest] = list;
    $("#posts").innerHTML = `
      <div class="mag" style="margin-bottom:50px">
        <a class="mag-cover reveal" href="/journal?p=${encodeURIComponent(first.id)}" data-cursor="Read">${V.art(first.palette, first.motif, { image: first.image })}
          <div class="masthead-row"><span class="cat">Cover story</span><span class="mono">${date(first.date)}</span></div>
          <div><div class="cat">${esc(first.category)}</div><h3>${esc(first.title)}</h3><p style="color:#cfcac1;margin:0;max-width:540px">${esc(first.excerpt)}</p></div>
        </a>
        <div style="align-self:center" class="reveal reveal-d1"><div class="eyebrow">Editor's note</div><p class="serif-it" style="font-size:clamp(22px,2.4vw,32px);line-height:1.3;margin:0 0 20px">“Every great film has two scripts: the one on screen, and the one in the financing documents.”</p><span class="mono">The Board</span></div>
      </div>
      <div class="post-grid">${rest.map((p) => `<div class="reveal">${V.postCard(p)}</div>`).join("")}</div>`;
    V.reveal($("#posts"));
  };
  $$("#cats .filter").forEach((b) => b.addEventListener("click", () => { cat = b.textContent; $$("#cats .filter").forEach((x) => x.classList.toggle("on", x === b)); render(); }));
  render();
  V.fx.scan();
});
