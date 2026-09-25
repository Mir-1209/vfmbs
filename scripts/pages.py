# Generates public/*.html from one template. Re-run after editing: python3 scripts/pages.py
import os, json
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")
SITE = "https://vfmbs.vercel.app"

def head(title, desc, path, extra=""):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#070707">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="VFMBS">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:image" content="{SITE}/assets/brand/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}/assets/brand/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/BebasNeue-normal-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Inter-normal-300-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/style.css">
{extra}</head>'''

def scripts(*pages):
    s = "\n".join(f'<script defer src="/assets/js/pages/{p}.js"></script>' for p in pages)
    return f'''
<noscript><p>This site needs JavaScript for events, RSVPs and applications. Email us at vfmbs@vanderbilt.edu.</p></noscript>
<script defer src="/assets/vendor/qrcode.js"></script>
<script defer src="/assets/js/core.js"></script>
<script defer src="/assets/js/ui.js"></script>
<script defer src="/assets/js/effects.js"></script>
{s}
</body>
</html>
'''

def hero(palette, motif, crumb, eyebrow, title, lede, extra="", scene=""):
    return f'''  <section class="page-hero">
    <div class="art" style="{{v}}" data-palette="{palette}"><div class="beam"></div><div class="glow"></div><div class="motif" data-motif="{motif}"></div></div>
    <div class="container">
      <div class="crumbs"><a href="/">VFMBS</a> / {crumb}</div>
      <p class="eyebrow">{eyebrow}</p>
      <h1 class="h-display" data-split>{title}</h1>
      <p class="lede reveal">{lede}</p>
      {extra}
    </div>
    <div class="scene-no">{scene}</div>
  </section>'''

PAL = {"gold": ("#1a1408", "#4a3814", "#cfae70"), "crimson": ("#1a0306", "#5c0a14", "#ff3b4e"), "cobalt": ("#030a1a", "#0e2a5c", "#5aa9ff"), "emerald": ("#021410", "#0b4a3a", "#3ee0a8"), "violet": ("#0c0418", "#3b1466", "#b884ff"), "ember": ("#1a0a02", "#6a2a08", "#ff9a3c"), "cream": ("#2a2620", "#6b6252", "#f2ede4"), "teal": ("#01151a", "#0a4250", "#4fe3ff")}
def fill(html):
    for k, (a, b, c) in PAL.items():
        html = html.replace(f'style="{{v}}" data-palette="{k}"', f'style="--a1:{a};--a2:{b};--a3:{c}"')
    return html

ORG_LD = json.dumps({"@context": "https://schema.org", "@type": "Organization", "name": "Vanderbilt Film & Media Business Society", "alternateName": "VFMBS", "url": SITE, "logo": SITE + "/assets/brand/logo.svg", "email": "vfmbs@vanderbilt.edu", "parentOrganization": {"@type": "CollegeOrUniversity", "name": "Vanderbilt University"}, "address": {"@type": "PostalAddress", "addressLocality": "Nashville", "addressRegion": "TN", "addressCountry": "US"}})

LAUREL = '<svg viewBox="0 0 40 70" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M35 68C12 55 4 30 14 4M14 14c-6-2-9 2-9 2s4 3 9 0M11 26c-6-1-9 3-9 3s5 3 9-1M10 38c-6 0-8 5-8 5s5 2 9-2M13 50c-5 1-7 6-7 6s5 1 8-3M19 60c-4 2-5 7-5 7s5 0 7-4"/></svg>'
def laurel(a, b, c):
    return f'<div class="laurel">{LAUREL}<div class="laurel-txt">{a}<b>{b}</b>{c}</div><div style="transform:scaleX(-1)">{LAUREL}</div></div>'

MARQ = '<span>FINANCE <img src="/assets/brand/logo.svg" alt=""> <em>film</em> <img src="/assets/brand/logo.svg" alt=""></span><span class="outline">MEDIA ✦ ENTERTAINMENT ✦</span><span>DEALS <img src="/assets/brand/logo.svg" alt=""> <em>&amp; dollars</em> <img src="/assets/brand/logo.svg" alt=""></span><span class="outline">BEHIND THE SCREEN ✦</span>'

pages = {}

pages["index.html"] = head("VFMBS · Vanderbilt Film & Media Business Society", "The business behind the screen. Vanderbilt's society for film finance, media strategy, streaming, music and sports business: events, workshops and industry treks.", "/", f'<script type="application/ld+json">{ORG_LD}</script>\n') + f'''
<body data-page="home">
<main id="main">
  <section class="billboard letterbox" id="billboard" aria-label="Featured">
    <div class="frame-marks" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </section>
  <div class="rows" id="rows"></div>
  <div class="ticker" id="ticker" aria-label="Illustrative industry index"></div>

  <section class="marquee-big" aria-hidden="true"><div class="mq">{MARQ}{MARQ}</div></section>

  <section class="section manifesto">
    <div class="container">
      <p class="eyebrow reveal">Our mission</p>
      <p class="m-text">We study the business behind the screen: the <em>deals,</em> the dollars and the decisions that decide what the world watches. Finance, film, media and entertainment, <em>all in one room.</em></p>
      <div class="sign reveal"><img src="/assets/brand/logo.svg" alt=""><div><div class="serif-it" style="font-size:20px">The Board</div><div class="mono">Vanderbilt Film &amp; Media Business Society</div></div></div>
    </div>
  </section>

  <section class="pipeline" aria-label="From script to screen">
    <div class="pipe-sticky">
      <div class="pipe-head">
        <div><p class="eyebrow">From script to screen</p><h2 class="h2" style="margin:0">How a film <em>gets made</em><br>(and paid for).</h2></div>
        <p class="lede" style="margin:0;max-width:420px">Five stages, five chances to learn the business. Keep scrolling. Every stage maps to a VFMBS track, workshop or trek.</p>
      </div>
      <div class="pipe-track" id="pipe-track"></div>
      <div class="pipe-progress"><i></i></div>
    </div>
  </section>

  <section class="section-tight"><div class="container"><div class="stats" id="stats"></div></div></section>

  <section class="section" id="tracks-section">
    <div class="container">
      <div class="sec-head">
        <div><p class="eyebrow">Now casting · Four tracks</p><h2 class="h-display" data-split style="margin:0">Pick your <em>role</em><br>in the industry.</h2></div>
        <p class="lede reveal">Every member joins a track: a small team that meets weekly, runs real projects and goes deep on one corner of the entertainment economy.</p>
      </div>
      <div class="tracks" id="tracks"></div>
    </div>
  </section>

  <section class="section pt0"><div class="container"><div class="sim reveal spot" id="sim"></div></div></section>

  <section class="section pt0" id="mag-section">
    <div class="container">
      <div class="sec-head"><div><p class="eyebrow">The Journal</p><h2 class="h2" style="margin:0">The <em>Reel.</em></h2></div><a class="link-arrow" href="/journal">All stories →</a></div>
      <div class="mag" id="mag"></div>
    </div>
  </section>

  <section class="section pt0">
    <div class="container">
      <div class="sec-head"><div><p class="eyebrow">Partners</p><h2 class="h2" style="margin:0">In good <em>company.</em></h2></div><a class="btn btn-outline btn-sm" href="/partners">Partner with us</a></div>
      <div id="partners-strip" class="reveal"></div>
    </div>
  </section>

  <section class="section pt0">
    <div class="container">
      <div class="laurels reveal">{laurel("Now casting", "Fall 2026", "All majors welcome")}{laurel("Where", "Finance × Film", "Meet")}{laurel("Filmed on location", "Nashville", "Music City")}</div>
      <div class="reviews" id="reviews"></div>
    </div>
  </section>

  <section class="section pt0">
    <div class="container">
      <div class="cta-band reveal">
        <div class="art" style="--a1:#2a2620;--a2:#4a3814;--a3:#cfae70"><div class="beam"></div><div class="glow"></div></div>
        <p class="eyebrow center" id="cta-eyebrow">Casting call closes in</p>
        <div class="countdown" id="countdown"></div>
        <h2 class="h2">Your first credit <em>starts here.</em></h2>
        <p class="lede" style="margin:0 auto 28px">No experience required. Just curiosity about how the entertainment business really works.</p>
        <div class="actions" style="justify-content:center"><a class="btn btn-gold btn-lg magnetic" href="/apply">Apply now</a><a class="btn btn-ghost btn-lg" href="/events">See events</a></div>
      </div>
    </div>
  </section>

  <section class="section pt0" id="faq">
    <div class="container">
      <h2 class="h2 center reveal">Frequently asked <em>questions</em></h2>
      <div class="faq reveal" id="faq-list" style="margin-top:30px"></div>
      <p class="center" style="margin:44px 0 16px;font-size:18px">Ready to watch? Get event drops and deadlines in your inbox.</p>
      <form class="signup" data-signup="home" novalidate><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="email" name="email" placeholder="Email address" aria-label="Email address" required><button class="btn btn-gold" type="submit">Get started</button></form>
    </div>
  </section>
</main>''' + scripts("home")

pages["events.html"] = head("Events · VFMBS", "Speaker series, screenings, industry treks and the Greenlight Summit. RSVP in one click and get your ticket.", "/events") + fill(f'''
<body data-page="events">
<main id="main">
{hero("cobalt", "spotlight", "Events", "Fall 2026 season", "Now <em>showing.</em>", "Speaker series, screenings with the numbers on screen, industry treks and our flagship Greenlight Summit. RSVP in one click and your ticket lands in My Studio.", '<div id="next-up" style="margin-top:40px"></div>', "SCENE 02<br>INT. SARRATT CINEMA · NIGHT")}
  <section class="section-tight">
    <div class="container">
      <div class="toolbar">
        <div class="filters" id="filters" aria-label="Filter events"></div>
        <div class="actions">
          <input class="input search-pill" id="ev-q" type="search" placeholder="Search events…" aria-label="Search events">
          <div class="view-toggle" id="view">
            <button class="on" data-v="list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>List</button>
            <button data-v="cal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Calendar</button>
          </div>
        </div>
      </div>
      <div id="ev-out"></div>
    </div>
  </section>
  <section class="section pt0" id="newsletter"><div class="container narrow center"><p class="eyebrow center">Never miss a premiere</p><h2 class="h2">Get event drops <em>first.</em></h2><form class="signup" data-signup="events" novalidate><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="email" name="email" placeholder="you@vanderbilt.edu" aria-label="Email" required><button class="btn btn-gold" type="submit">Notify me</button></form></div></section>
</main>''') + scripts("events")

pages["workshops.html"] = head("Workshops · VFMBS", "Limited-series workshops in entertainment M&A, box office analytics, pitching, the creator economy, music rights and sports media.", "/workshops") + fill(f'''
<body data-page="workshops">
<main id="main">
{hero("gold", "chart", "Workshops", "Season 1 · Limited series", "Binge-worthy <em>skills.</em>", "Every workshop is a limited series: a few episodes, a real deliverable and a finale in front of judges. Open to all Vanderbilt students by application. Members get priority.", "", "SCENE 03<br>INT. THE DEAL ROOM · DAY")}
  <section class="section-tight">
    <div class="container">
      <div class="steps3" style="margin-bottom:60px">
        <div class="pillar spot reveal"><span class="big-n">01</span><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg></div><h3>Apply</h3><p>A short application: who you are, why this topic, and a commitment to show up.</p></div>
        <div class="pillar spot reveal reveal-d1"><span class="big-n">02</span><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="m10 8 5 3-5 3Z"/><path d="M8 21h8"/></svg></div><h3>Watch &amp; build</h3><p>Weekly episodes taught by upperclassmen and guest operators, with hands-on models and decks.</p></div>
        <div class="pillar spot reveal reveal-d2"><span class="big-n">03</span><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0Z"/></svg></div><h3>The finale</h3><p>Present to a panel. Top performers get resume-book priority and a spot on the next trek.</p></div>
      </div>
      <div class="toolbar">
        <div class="filters" id="ws-tracks"></div>
        <select class="select" id="ws-level" style="width:auto;border-radius:99px;padding:9px 40px 9px 16px" aria-label="Level"></select>
      </div>
      <div class="ws-grid" id="ws-out"></div>
    </div>
  </section>
</main>''') + scripts("workshops")

pages["team.html"] = head("Team · VFMBS", "Meet the board, track leads and directors of the Vanderbilt Film & Media Business Society.", "/team") + fill(f'''
<body data-page="team">
<main id="main">
{hero("violet", "camera", "Team", "Cast &amp; crew", "Meet the <em>cast.</em>", "The students running the show: our executive board, track leads and directors. Click anyone for their story.", "", "SCENE 04<br>EXT. ALUMNI LAWN · GOLDEN HOUR")}
  <section class="section-tight">
    <div class="container">
      <div class="toolbar"><div class="filters" id="team-filters"></div><a class="btn btn-gold btn-sm" href="/apply">Join the cast</a></div>
      <div id="team-out"></div>
    </div>
  </section>
  <section class="section pt0">
    <div class="container narrow">
      <p class="eyebrow center">Full credits</p>
      <div class="credits-roll"><div class="roll" id="roll"></div></div>
    </div>
  </section>
</main>''') + scripts("team")

pages["partners.html"] = head("Partners & Sponsorship · VFMBS", "Partner with the Vanderbilt Film & Media Business Society: recruiting, speaker events, treks, case competitions and the Greenlight Summit.", "/partners") + fill(f'''
<body data-page="partners">
<main id="main">
{hero("gold", "handshake", "Partners", "For studios, streamers, agencies, banks &amp; funds", "The next generation <em>of dealmakers.</em>", "VFMBS connects the entertainment industry with Vanderbilt's most curious finance, film and media students. Here's how we work with partners.", '<div class="actions"><a class="btn btn-gold btn-lg magnetic" href="#inquire">Become a partner</a><a class="btn btn-ghost btn-lg" href="#tiers">See packages</a></div>', "SCENE 05<br>INT. BOARDROOM · DAY")}
  <section class="section-tight"><div class="container"><div class="stats" id="reach"></div></div></section>
  <section class="section">
    <div class="container">
      <div class="sec-head"><div><p class="eyebrow">Partner wall</p><h2 class="h2" style="margin:0">Our <em>partners.</em></h2></div><p class="lede">Founding partner slots are open for this season.</p></div>
      <div class="logo-wall" id="wall"></div>
    </div>
  </section>
  <section class="section pt0">
    <div class="container">
      <p class="eyebrow">What we offer</p>
      <h2 class="h2" style="margin-bottom:36px">Why partner <em>with us.</em></h2>
      <div class="benefits">
        <div class="benefit reveal"><div class="n">01</div><div><h3>Recruit early</h3><p>Resume books, private info sessions and first looks at students building media models and pitch decks.</p></div></div>
        <div class="benefit reveal"><div class="n">02</div><div><h3>Shape the curriculum</h3><p>Sponsor a Deal Room case or judge a workshop finale built on a real deal your team worked on.</p></div></div>
        <div class="benefit reveal"><div class="n">03</div><div><h3>Host a trek</h3><p>Welcome a curated group of members to your office in LA, New York or Nashville.</p></div></div>
        <div class="benefit reveal"><div class="n">04</div><div><h3>Headline the Summit</h3><p>Put your executives on stage at the Greenlight Summit in front of 300+ students and faculty.</p></div></div>
      </div>
      <div class="sectors reveal" style="margin-top:40px"><span>Film studios</span><span>Streaming platforms</span><span>Talent agencies</span><span>Media investment banks</span><span>Private equity &amp; VC</span><span>Music publishers &amp; labels</span><span>Sports media</span><span>Gaming</span><span>Production companies</span><span>Creator-economy startups</span></div>
    </div>
  </section>
  <section class="section pt0" id="tiers">
    <div class="container">
      <div class="sec-head"><div><p class="eyebrow">Packages</p><h2 class="h2" style="margin:0">Pick your <em>billing.</em></h2></div><p class="lede">Every partnership is custom. These are starting points.</p></div>
      <div class="tiers" id="tiers-list"></div>
    </div>
  </section>
  <section class="section pt0" id="inquire">
    <div class="container contact-grid">
      <div><p class="eyebrow">Inquire</p><h2 class="h2">Let's make something <em>together.</em></h2><p class="lede">Tell us about your organization and what you'd like to do. Our Director of Partnerships will reply within a few days.</p><div id="sponsor-email"></div></div>
      <div class="panel" id="inquiry"></div>
    </div>
  </section>
</main>''').replace('id="tiers-list"', 'id="tiers"').replace('<section class="section pt0" id="tiers">', '<section class="section pt0" id="packages">').replace('href="#tiers"', 'href="#packages"') + scripts("contact", "partners")

pages["journal.html"] = head("The Reel · Journal · VFMBS", "Stories, deal breakdowns and dispatches from the business of entertainment, by VFMBS members.", "/journal") + '''
<body data-page="journal">
<main id="main"></main>''' + scripts("journal")

pages["about.html"] = head("About · VFMBS", "Our mission, tracks and story. The Vanderbilt Film & Media Business Society studies the business behind the screen.", "/about") + fill(f'''
<body data-page="about">
<main id="main">
{hero("violet", "film", "About", "Our story", "Where Wall Street<br>meets <em>the Walk of Fame.</em>", "VFMBS is Vanderbilt's home for students who love what's on screen and want to understand the money, strategy and dealmaking behind it.", "", "SCENE 01<br>EXT. VANDERBILT · DAWN")}
  <section class="section-tight"><div class="container"><div class="stats" id="stats"></div></div></section>
  <section class="section manifesto"><div class="container"><p class="eyebrow">Mission</p><p class="m-text">Entertainment runs on <em>finance.</em> Every franchise, every streaming deal and every hit song sits on a stack of contracts, models and bets. We exist to teach that stack, and to put our members <em>in the room where it happens.</em></p></div></section>
  <section class="section pt0">
    <div class="container">
      <p class="eyebrow reveal">What we believe</p>
      <h2 class="h2 reveal">Three <em>acts.</em></h2>
      <div class="steps3" style="margin-top:36px">
        <div class="pillar spot reveal"><span class="big-n">I</span><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/></svg></div><h3>Act I · Learn</h3><p>Slate deals, library valuations, rights auctions. We teach entertainment finance from zero, hands-on.</p></div>
        <div class="pillar spot reveal reveal-d1"><span class="big-n">II</span><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"/></svg></div><h3>Act II · Connect</h3><p>Treks to LA and New York, speakers from across the industry and alumni who pick up the phone.</p></div>
        <div class="pillar spot reveal reveal-d2"><span class="big-n">III</span><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg></div><h3>Act III · Launch</h3><p>Resume books, interview prep and project work that turns into internships in media banking, studios, streaming and venture.</p></div>
      </div>
    </div>
  </section>
  <section class="pipeline" aria-label="From script to screen">
    <div class="pipe-sticky">
      <div class="pipe-head"><div><p class="eyebrow">What you'll learn</p><h2 class="h2" style="margin:0">From script <em>to screen.</em></h2></div><p class="lede" style="margin:0;max-width:420px">The full life of a project, and the business decisions at every stage.</p></div>
      <div class="pipe-track" id="pipe-track"></div>
      <div class="pipe-progress"><i></i></div>
    </div>
  </section>
  <section class="section" id="tracks">
    <div class="container">
      <p class="eyebrow reveal">The tracks</p>
      <h2 class="h2 reveal" style="margin-bottom:36px">Four ways <em>in.</em></h2>
      <div class="tracks" id="tracks-grid"></div>
    </div>
  </section>
  <section class="section pt0">
    <div class="container">
      <p class="eyebrow">Membership</p>
      <h2 class="h2" style="margin-bottom:36px">What members <em>get.</em></h2>
      <div class="benefits">
        <div class="benefit reveal"><div class="n">01</div><div><h3>A track team</h3><p>Weekly meetings with a small team and a real project each semester.</p></div></div>
        <div class="benefit reveal"><div class="n">02</div><div><h3>Workshop priority</h3><p>First seats in every workshop series, from the Deal Room to the Pitch Room.</p></div></div>
        <div class="benefit reveal"><div class="n">03</div><div><h3>Industry treks</h3><p>Subsidized trips to studios, agencies and banks in LA and New York.</p></div></div>
        <div class="benefit reveal"><div class="n">04</div><div><h3>Recruiting support</h3><p>Resume book, mock interviews and 1:1 mentorship from upperclassmen.</p></div></div>
        <div class="benefit reveal"><div class="n">05</div><div><h3>Screenings &amp; socials</h3><p>Screenings with deal breakdowns, the Winter Gala and plenty of popcorn.</p></div></div>
        <div class="benefit reveal"><div class="n">06</div><div><h3>Dues</h3><p id="dues"></p></div></div>
      </div>
    </div>
  </section>
  <section class="section pt0">
    <div class="container split" style="align-items:start">
      <div class="reveal"><p class="eyebrow">Timeline</p><h2 class="h2">Previously <em>on</em> VFMBS…</h2><p class="lede">How we got here. Edit these milestones as the story grows.</p></div>
      <div class="story reveal reveal-d1">
        <div><b>Pilot</b><p>A handful of students who couldn't choose between a finance club and a film club start their own.</p></div>
        <div><b>Season 1</b><p>First speaker series and the first Deal Room workshop. Standing room only.</p></div>
        <div><b>Season 2</b><p>First industry trek. Four tracks formalized.</p></div>
        <div><b>Now streaming</b><p>A growing society with six workshop series and the annual Greenlight Summit.</p></div>
      </div>
    </div>
  </section>
  <section class="section pt0"><div class="container"><div class="cta-band reveal"><div class="art" style="--a1:#0c0418;--a2:#3b1466;--a3:#b884ff"><div class="beam"></div><div class="glow"></div></div><h2 class="h2">Ready for your <em>close-up?</em></h2><div class="actions" style="justify-content:center"><a class="btn btn-gold btn-lg magnetic" href="/apply">Apply now</a><a class="btn btn-ghost btn-lg" href="/team">Meet the team</a></div></div></div></section>
</main>''') + scripts("about")

pages["apply.html"] = head("Apply · VFMBS", "Join the Vanderbilt Film & Media Business Society. All majors welcome. No experience required.", "/apply") + fill(f'''
<body data-page="apply">
<main id="main">
{hero("crimson", "clapper", "Apply", '<span id="apply-season">Casting call</span>', "Your first <em>credit</em><br>starts here.", "We recruit curious people from every major. No finance or film experience required. It takes about 20 minutes, and your draft auto-saves.", '<div class="countdown left" id="countdown"></div><div class="timeline" id="timeline"></div>', "SCENE 06<br>INT. CASTING OFFICE · DAY")}
  <section class="section-tight"><div class="container" id="apply-host"></div></section>
</main>''') + scripts("apply")

pages["contact.html"] = head("Contact · VFMBS", "Get in touch with the Vanderbilt Film & Media Business Society: general questions, sponsorships, speaking and press.", "/contact") + fill(f'''
<body data-page="contact">
<main id="main">
{hero("teal", "mic", "Contact", "Get in touch", "Let's <em>talk.</em>", "Questions about joining, a speaker idea, a partnership or a press inquiry: we'd love to hear from you.", "", "SCENE 07<br>INT. PRODUCTION OFFICE · NIGHT")}
  <section class="section-tight">
    <div class="container contact-grid">
      <div><div class="contact-list" id="contact-list"></div><p class="lede" style="margin-top:30px">Looking for membership info? Try the <a class="gold" href="/#faq">FAQ</a> or <a class="gold" href="/apply">apply</a> directly.</p></div>
      <div class="panel" id="contact-host"></div>
    </div>
  </section>
</main>''') + scripts("contact")

pages["portal.html"] = head("My Studio · VFMBS", "Your tickets, applications, interview and saved list.", "/portal", '<meta name="robots" content="noindex">\n') + '''
<body data-page="portal">
<main id="main"></main>''' + scripts("portal")

pages["ticket.html"] = head("Your Ticket · VFMBS", "Your VFMBS event ticket.", "/ticket", '<meta name="robots" content="noindex">\n') + '''
<body data-page="ticket">
<main id="main" class="ticket-page"><div class="inner" id="ticket-host"><p class="mono center">Loading your ticket…</p></div></main>''' + scripts("ticket")

pages["404.html"] = head("Scene Missing · VFMBS", "This page ended up on the cutting room floor.", "/404", '<meta name="robots" content="noindex">\n') + '''
<body data-page="404">
<main id="main" class="nf">
  <div class="burn" aria-hidden="true"></div>
  <div>
    <div class="code" aria-hidden="true">404</div>
    <p class="eyebrow center">Scene missing</p>
    <h1 class="h2">This one ended up on the <em>cutting room floor.</em></h1>
    <p class="lede" style="margin:0 auto 30px">The page you're looking for was moved, renamed, or never made it past development.</p>
    <div class="actions" style="justify-content:center"><a class="btn btn-gold" href="/">Back to the premiere</a><a class="btn btn-outline" href="/events">See events</a></div>
  </div>
</main>''' + scripts()

LEGAL_DATE = "September 25, 2026"
pages["privacy.html"] = head("Privacy, Terms & Code of Conduct · VFMBS", "How VFMBS handles your data, our site terms, community code of conduct and accessibility statement.", "/privacy") + fill(f'''
<body data-page="privacy">
<main id="main">
{hero("cream", "star", "Legal", "The fine print", "Privacy &amp; <em>policies.</em>", "Plain-language policies for our website, events and community. Last updated {LEGAL_DATE}.", "", "")}
  <section class="section-tight">
    <div class="container legal">
      <div class="toc"><a class="filter" href="#privacy">Privacy</a><a class="filter" href="#terms">Terms</a><a class="filter" href="#conduct">Code of Conduct</a><a class="filter" href="#accessibility">Accessibility</a></div>
      <h2 id="privacy">Privacy policy</h2>
      <h3>What we collect</h3>
      <ul><li><b>Event RSVPs:</b> name, email, class year, dietary needs, interests and optional questions.</li><li><b>Applications:</b> the information you enter in the membership or workshop application, including optional resume and LinkedIn links.</li><li><b>Messages &amp; newsletter:</b> your name, email, organization and message, or just your email for the newsletter.</li><li><b>On your device:</b> My Studio stores your tickets, drafts and saved items in your browser's local storage. We don't use advertising or tracking cookies.</li></ul>
      <h3>How we use it</h3>
      <p>Only to run VFMBS: managing event capacity and check-in, reviewing applications, contacting you about events you signed up for, and sending the newsletter if you subscribed. We never sell your data. With your consent (e.g., the resume book), we may share application materials with partner organizations for recruiting.</p>
      <h3>Who can see it</h3>
      <p>Current VFMBS board members with admin access. Data is stored with our hosting and database providers (Vercel and Upstash) and, if enabled, our email provider.</p>
      <h3>Retention &amp; your rights</h3>
      <p>RSVP data is kept for the academic year; applications for one recruiting cycle. You can ask us to access, correct or delete your data at any time by emailing <a class="gold" href="mailto:vfmbs@vanderbilt.edu">vfmbs@vanderbilt.edu</a>. You can clear on-device data from My Studio.</p>
      <h2 id="terms">Terms of use</h2>
      <p>This website is operated by students of the Vanderbilt Film &amp; Media Business Society. Content is provided for educational purposes and is not financial advice. The Greenlight simulator and industry ticker are illustrative. Tickets are free, non-transferable and may be cancelled if capacity or safety requires. Don't attempt to misuse the site, submit false information or interfere with its operation.</p>
      <p>VFMBS is a student organization at Vanderbilt University. Content on this site does not necessarily represent the views of Vanderbilt University.</p>
      <h2 id="conduct">Code of conduct</h2>
      <p>VFMBS is a community for everyone who is curious about the business of entertainment. At every event, trek, workshop and online space we expect members and guests to:</p>
      <ul><li>Treat everyone with respect, regardless of background, identity, major or experience level.</li><li>Represent Vanderbilt and VFMBS professionally with speakers, partners and hosts.</li><li>Respect confidentiality: what's shared off the record at industry events stays there.</li><li>Follow all University policies, including those on alcohol, hazing and harassment.</li></ul>
      <p>Report concerns to any board member or at <a class="gold" href="mailto:vfmbs@vanderbilt.edu">vfmbs@vanderbilt.edu</a>. We'll handle reports promptly and confidentially.</p>
      <h2 id="accessibility">Accessibility</h2>
      <p>We want this site and our events to work for everyone. The site supports keyboard navigation, screen readers and reduced-motion settings. If something isn't accessible, or you need an event accommodation, email us and we'll make it right.</p>
    </div>
  </section>
</main>''') + scripts()

for n, h in pages.items():
    with open(os.path.join(ROOT, n), "w") as f:
        f.write(h)
print("wrote", len(pages), "pages")

admin = head("Admin · VFMBS", "VFMBS control room.", "/admin", '<meta name="robots" content="noindex, nofollow">\n<link rel="stylesheet" href="/assets/css/admin.css">\n') + '''
<body data-page="admin">
<div id="admin"><div class="login"><p class="mono">Loading control room…</p></div></div>
<noscript><p>The admin dashboard needs JavaScript.</p></noscript>
<script defer src="/assets/vendor/qrcode.js"></script>
<script defer src="/assets/js/core.js"></script>
<script defer src="/assets/js/admin.js"></script>
</body>
</html>
'''
with open(os.path.join(ROOT, "admin.html"), "w") as f:
    f.write(admin)
