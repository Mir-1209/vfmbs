# VFMBS · Vanderbilt Film & Media Business Society

The official website for VFMBS: a cinematic, streaming-inspired site with real event ticketing, applications, and a **no-code admin dashboard** for the board.

- **Public site:** home, events (RSVP → QR ticket), workshops, team, journal ("The Reel"), partners & sponsorship, about, apply, contact, My Studio, privacy/terms/code of conduct, 404
- **Admin dashboard** at `/admin`: edit every event, workshop, story, team member, partner, homepage section and setting, and manage RSVPs, door check-in (QR scanner), applications, workshop apps, inbox, subscribers, and version history. No coding needed.
- **Backend:** Vercel serverless functions + Upstash Redis. Tickets are cryptographically signed, and every form is validated, rate-limited and spam-protected.

---

## 🚀 Deploy to Vercel (about 10 minutes)

1. **Import the repo:** go to [vercel.com/new](https://vercel.com/new), pick this GitHub repo, and click **Deploy**. No build settings are needed (`vercel.json` handles everything).
2. **Add the database:** in your Vercel project go to **Storage → Create / Connect → Upstash for Redis** (free tier is plenty) and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. **Add two secrets:** go to **Settings → Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | A long passphrase to share only with board members |
   | `SESSION_SECRET` | A random string of 32+ characters (generate one with `openssl rand -base64 32` or any password generator) |
4. **Redeploy:** go to **Deployments → ⋯ → Redeploy** so the new variables load.
5. **Open `/admin`**, sign in, and press **Publish changes** once to save the starting content to the database.

That's it: RSVPs, applications and messages are now stored securely.

### Optional add-ons
| Feature | How |
|---|---|
| **Confirmation emails** (tickets, applications) | Create a free [Resend](https://resend.com) account, verify your domain, then add `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `VFMBS <hello@vfmbs.org>`) |
| **Email alerts for contact/sponsorship messages** | Add `NOTIFY_EMAIL` (requires Resend) |
| **Upload images in the admin** | Vercel → **Storage → Blob** → connect to the project (adds `BLOB_READ_WRITE_TOKEN`) |
| **Custom domain** | Vercel → **Settings → Domains**, then run `npm run set-domain -- https://your-domain.com`, commit and push. Also set `SITE_URL` so email links use it. |

See `.env.example` for the full list.

---

## 🎬 Using the admin dashboard

Go to **`/admin`** (there's also a small "Admin" link in the footer).

| Section | What you can do |
|---|---|
| **Dashboard** | Live RSVP counts, application pipeline, unread messages, quick actions |
| **Check-in** | Pick the event, then scan ticket QR codes with your phone camera (Chrome/Android) or type the code. It flags duplicates and wrong-event tickets |
| **RSVPs** | See who's coming (dietary needs, questions), check people in, promote from the waitlist, export CSV, copy emails |
| **Applications** | Read every application, set status, rate out of 5 stars, add private notes, and see booked interview slots. Export CSV |
| **Workshop apps** | Accept, waitlist or decline, copy accepted emails, export |
| **Inbox / Subscribers** | Contact and sponsorship inquiries (reply by email), newsletter list export |
| **Events, Workshops, Journal, Team, Partners, Tracks** | Add, edit, reorder, duplicate, hide or delete. Pick poster colors and icons, or upload a real photo |
| **Homepage** | Hero slides, stats, "script to screen" panels, Top 10, reviews, FAQ, ticker, sponsorship packages |
| **Settings** | Announcement bar, applications open/closed, deadline, recruitment timeline, **interview slot generator**, whether to show decisions to applicants, emails and socials |
| **Versions & backup** | Restore any of the last 15 published versions, export or import all content as a file |

**How publishing works:** edits are drafts (auto-saved in your browser) until you press **Publish changes** (or ⌘/Ctrl+S). The live site updates within about 30 seconds.

**Preview mode:** before the database is connected, `/admin` offers a preview mode. Edits are saved only in your browser, so you can see them on the site.

---

## 🔒 Security & privacy

- Tickets and applicant links are **HMAC-signed**, so they can't be forged or guessed. QR codes link to `/ticket?t=…`, which verifies against the database.
- Admin sessions use an **HttpOnly, Secure, SameSite=Strict** cookie (12h), a required CSRF header, timing-safe password checks, and **login rate limiting**.
- All forms have **server-side validation**, length limits, **per-IP rate limits**, a **honeypot** for bots, same-origin checks, and duplicate protection (one RSVP per email per event, one application per email).
- Strict **Content-Security-Policy**, HSTS, X-Frame-Options, Referrer-Policy and Permissions-Policy headers (see `vercel.json`).
- Everything rendered from the database or admin content is HTML-escaped, and links are restricted to `https://`, `mailto:` or site paths.
- CSV exports are protected against spreadsheet formula injection.
- `/admin`, `/api`, `/portal` and `/ticket` are excluded from search engines.

---

## 🛠 Local development

```bash
npm install
npm run dev        # http://localhost:3000, admin password: "admin"
```

Without Upstash credentials, the dev server uses an in-memory database saved to `.data/kv.json`. To test against a real database, put your env vars in `.env.local`.

```bash
npm run check      # syntax + content + deploy sanity checks
npm run pages      # regenerate the HTML pages from scripts/pages.py (only needed when changing page layouts)
```

## 📁 Project structure

```
api/                      Serverless functions (9, under the Vercel Hobby limit of 12)
  _lib/                   Shared: Redis client, auth/signing, validation, email, content
  admin.js                Admin API (login, content, RSVPs, check-in, applications, inbox…)
  content.js              Public content + live seat counts (edge-cached)
  rsvp.js  ticket.js      Ticketing
  apply.js workshop.js    Applications & interview booking
  contact.js subscribe.js health.js
public/                   The website (served as static files)
  *.html                  Pages (generated by scripts/pages.py)
  assets/css/             style.css (site), admin.css, fonts.css
  assets/js/core.js       Content loading, API client, storage, icons, poster art
  assets/js/ui.js         Nav, footer, modals, cards, RSVP/tickets, search
  assets/js/effects.js    Intro, page transitions, cursor, parallax, marquee, pipeline
  assets/js/pages/        One controller per page
  assets/js/admin.js      Admin dashboard
  assets/data/content.json  Default content (used until the first publish)
  assets/brand/           Logo, social image, app icons
scripts/                  dev server, checks, page generator, set-domain
vercel.json               Routing, security headers, caching
```

## ✏️ Placeholder content to replace

Board names ("Your Name Here"), headshots, the About-page timeline, member reviews, ticker values (labelled "Illustrative"), and event/workshop details. All of it can be edited in `/admin`.
