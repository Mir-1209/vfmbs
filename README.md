# VFMBS · Vanderbilt Film & Media Business Society

A cinematic, streaming-style website for VFMBS: Netflix-style browsing with film-poster aesthetics and a finance edge.

**No build step.** It's plain HTML/CSS/JS, so you can open `index.html` or host it anywhere (GitHub Pages, Netlify, Vercel).

## Pages
| Page | What's on it |
|---|---|
| `index.html` | "Ta-dum" intro, rotating billboard hero, Netflix rows (hover-expand cards), Top 10 row, industry ticker, track cards, the **Greenlight or Pass?** film-finance simulator, reviews, countdown, FAQ, newsletter signup |
| `events.html` | Filterable list and **month calendar**, live seat counts, **RSVP → admit-one ticket** with barcode and seat, `.ics` calendar download, waitlist when an event is full |
| `workshops.html` | Workshops presented as limited series with **episode lists**, track/level filters, deadlines, and an **apply-to-workshop** form |
| `apply.html` | Recruitment timeline, deadline countdown, a 4-step **casting call application** (autosaved drafts, track ranking, resume upload, review screen), then **interview slot booking** |
| `portal.html` | **My Studio**: a "Who's watching?" profile picker, tickets, application status tracker, workshop apps, My List, and data export |
| `about.html` | Mission, tracks, timeline and board ("cast & crew") |

Global extras: press `/` to search, a My Studio badge, toasts, confetti, scroll progress, film grain, reveal animations, and reduced-motion support.

## Editing content
Everything (events, workshops, tracks, board, FAQ, deadline, ticker) lives in **`assets/js/data.js`**. Board names, the timeline on the About page, reviews and ticker values are **placeholders**, so replace them before launch.

## Collecting real submissions
By default, RSVPs and applications are stored in the visitor's browser (`localStorage`) as a demo. To receive them yourself, set `config.formEndpoint` in `data.js` to any endpoint that accepts JSON POSTs (Formspree, a Google Apps Script web app writing to a Sheet, an Airtable/Zapier webhook). Every RSVP, workshop application, membership application, interview booking and newsletter signup is POSTed with a `kind` field.

## Deploy on GitHub Pages
Settings → Pages → Deploy from branch → select the branch and `/ (root)`.
