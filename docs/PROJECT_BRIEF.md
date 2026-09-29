# Project Brief

**PROJECT NAME:** \[Wilson Real Estate\] **CLIENT:** \[Wilson\] **Status:** Phase 1, skeleton/structure only. Design and brand are still being built. **Deadline:** Full design finished Oct 1, 2026\. Site build complete by Oct 9, 2026 at the latest.

---

## Client / brand

- **Business:** Real estate company, mostly land.  
- **Target audience:** TBD.  
- **Brand guidelines (logo, colors, fonts):** Not finished yet. Leave all of these as blank placeholders (see "Placeholders" below).  
- **Tone/personality:** TBD.  
- **References:** The Figma design (UI reference images provided per section; not all sections exist yet).

## Content & pages

- **Pages:** Home, Properties, Services, About Wilson, Contact.  
- **Catalog:** Properties catalog with a list page and a details page for each listing (SinglePageOfProperty).  
- **Languages:** English, Albanian, German.  
- **Editable content:** Yes. A custom admin panel is needed (reference images will be provided). Not part of Phase 1\.

## Visual assets

- Logo, photos, color palette and brand fonts are all still being built. Keep them blank/placeholder for now.

## Technical / features

- **Contact form:** On the Contact page. Submissions will probably go to email (nodemailer), but this is not confirmed. Build the form UI only in Phase 1\.  
- **Accounts/bookings/dashboard:** None for visitors.  
- **Database:** Supabase, used for image storage and for the property listings the admin panel manages.  
- **Image storage:** Supabase Storage.  
- **Domain:** The client already has a live site on the domain. This is a full rebuild; the domain gets reconnected on Vercel at launch.

## Security & access

- **Admin area:** One admin page behind a login (username \+ password), credentials stored in `.env` (no hardcoded fallbacks).  
- **Sensitive data:** None beyond name/email on the contact form. Cookies/consent banner may come later.  
- **Compliance:** Unknown (GDPR, hosting region, contract terms). Ask the client before launch.

---

## Placeholders (Phase 1\)

- Tailwind theme: neutral gray palette with clearly marked `TODO: brand color` tokens (e.g. `brand-primary`, `brand-secondary`, `brand-accent`).  
- Fonts: ~~system stack~~ done 2026-09-29, Gilmer (text) + Ego (h1/h2), self-hosted in `public/fonts`.  
- Logo: ~~text placeholder~~ done 2026-09-29, Logo-01 from the brand materials (`public/images/wilson-logo.png`).  
- Images: gray boxes with a fixed aspect ratio. No stock photos. Exception (2026-09-29): homepage hero uses the client photo `public/images/hero.jpg`.  
- Copy: short neutral placeholder text, marked as placeholder.

---

## Milestones

### Milestone 1: Frontend (Phase 1 \= skeleton only)

- [x] Project scaffold (create-next-app, TypeScript, Tailwind, ESLint wired up)  
- [x] i18n routing for English / Albanian / German (locale-prefixed routes, translation files with placeholder strings)  
- [x] Global layout shell (layout.tsx, fonts placeholder, base styles)  
- [x] Header / Navbar (working mobile menu, language switcher)  
- [x] Footer  
- [x] Banner (hero section)  
- [x] Homepage body sections (structure per Figma reference images)  
- [x] Scroll-to-top button  
- [x] Inner pages: Services, About Wilson, Contact (form UI \+ Map component)  
- [x] Properties list page \+ SinglePageOfProperty detail page  
- [x] Framer Motion \+ react-intersection-observer scroll reveals  
- [x] Full responsive verification (320px to 1920px), every page  
- [x] Metadata (title/description) per page

### Milestone 2: Backend

- [x] API route structure (app/api/...)  
- [x] Contact form endpoint \+ nodemailer delivery (destination: `CONTACT_TO`, still TBD with the client)  
- [x] CRUD endpoints for properties (tested end to end against the real Supabase project)  
- [x] Admin login endpoint (env-sourced credentials, signed token in an httpOnly cookie, no fallbacks)  
- [x] Image upload to Supabase Storage with server-side type/size validation (tested against real Supabase)  
- [x] Input validation/sanitization on every route  
- [x] Rate limiting on the contact form and login  
- [x] Centralized error handling that never leaks internals

### Milestone 3: Database (Supabase)

- [x] Tables for properties (with translations for the three languages) and image references (applied to project `rrxttjllwedwynvjwuhi`, 2026-09-29)  
- [x] Storage bucket \+ policies for property images  
- [x] Indexes for anything queried often  
- [x] Seed data for local development only, gated behind NODE\_ENV \!== 'production' (`npm run seed:demo`; 24 demo listings currently loaded, see launch checklist)  
- [x] Env vars for all keys, none hardcoded, none with fallbacks (`.env.example`)
- [x] Public site reads listings from Supabase (`lib/server/catalog.ts`)

### Before launch (checklist)

- [ ] Remove the demo listings: `npm run seed:demo -- --clear` (there is only one Supabase database, so they show on every deployment until cleared)  
- [ ] Reset the reference counter so the first real listing is WRE-001 (Supabase SQL Editor, once the table is empty): `alter sequence public.property_reference_seq restart with 1;`  
- [ ] Zoho SMTP details + `CONTACT_TO` in the environment (contact form)  
- [ ] Stronger admin password (`npm run hash-password`); the current one is 8 digits  
- [ ] To log every admin session out at once (e.g. a lost laptop): change `JWT_SECRET` (sessions are signed tokens, logout only clears the cookie on that device)  
- [ ] All env vars from `.env.example` set in the Vercel project

### Milestone 4: Admin panel

- [x] Auth-gated admin routes (page-level and API-level checks)  
- [x] PropertyManager (create/edit/delete listings, all three languages)  
- [x] Media/image manager tied to Supabase Storage  
- [x] Admin screens verified responsive on mobile and tablet  
- [x] Final security pass (2026-09-29; open items in the launch checklist)  
- [ ] Restyle to the admin reference images once they arrive (current design is a neutral placeholder)

---

## Decisions log

- Supabase is the single data layer (listings \+ images). No Mongoose.  
- Figma UI reference images are provided per section; follow them for structure, not for final styling.
- Phase 1 (2026-09-28): i18n is hand-rolled per the Next.js 16 guide (`app/[lang]`, `proxy.ts`, JSON dictionaries in `i18n/dictionaries/`), no i18n library. Default locale `sq` (switcher label "AL"); `/` redirects by cookie, then Accept-Language, then `sq`.
- Phase 1: maps use Leaflet + react-leaflet with OpenStreetMap tiles (no API key). Pick a production tile provider before launch.
- Phase 1: property data was hardcoded in `data/properties.ts`. Since 2026-09-29 it comes from Supabase; that file now only holds the catalog definitions (types, zones, filters) and the demo listings live in `scripts/seed/demo-properties.ts`.
- 2026-09-29: Properties list + SinglePageOfProperty rebuilt to the Figma ("Pronat", "Pronat Desc"). Header is sticky on every page (`--header-h` in globals.css, anything pinned to the top offsets by it) and turns light gray on the property pages to match Figma.
- 2026-09-29: Properties list shows 10 listings, "Shfaq më shumë" adds 10 more via `?show=`. On desktop the cards scroll inside a box exactly as tall as the map (never past its bottom). "Më shumë" holds a price filter and sorting (a guess, Figma doesn't say).
- 2026-09-29: Brand yellow `#ffb500` (from the logo) is `--color-brand-accent`, used for highlights only: map pins, active nav underline, scroll-to-top, active step circle, service tile hover, text selection. Always with dark text. Favicon set (`app/favicon.ico`, `icon.png`, `apple-icon.png`) is the yellow W, Logo-04.
- 2026-09-29: Backend (Milestone 2). Route handlers in `app/api` (contact, admin login/logout/session, admin properties + images); shared server code in `lib/server` (`server-only`). Supabase is used server-side only, with the service role key. Schema, RLS, storage bucket and SQL functions live in `supabase/migrations`. Rate limits are counted in Postgres (`hit_rate_limit`), so they hold across Vercel instances. Admin auth: one account from env (`ADMIN_USERNAME` + bcrypt `ADMIN_PASSWORD_HASH`), 8-hour JWT in an httpOnly SameSite=Strict cookie, Origin check on every write. Uploads: JPEG/PNG/WebP up to 4 MB (Vercel's body limit is 4.5 MB, so the admin panel must downscale big photos in the browser), re-encoded to WebP ≤ 2560 px with all metadata (including GPS) stripped. Missing env vars stop the server in production (`instrumentation.ts`).
- 2026-09-29: The public site reads listings from Supabase with the publishable key (`lib/server/catalog.ts`), so row level security limits it to published listings. Cached for an hour in production and refreshed immediately by every admin API change (`revalidateTag("properties")`); in development it always reads fresh data. Changes made outside the API (Supabase dashboard, seed script) appear on production within the hour. Listing photos render through `next/image`, allowed only from this project's `property-images` bucket.
- 2026-09-29: Albanian wording: "tokë" is "parcelë" everywhere (type label, titles, meta, "Sipërfaqja e parcelës"). English "land" and German "Grundstück" unchanged.
- 2026-09-29: Admin panel (Milestone 4) at `/admin`: its own root layout (no locale prefix, no public header/footer, noindex; `robots.txt` disallows `/admin` and `/api`). UI text in Albanian, all in `components/admin/strings.ts`. Three layers of access control: proxy.ts sends visitors without a session cookie to `/admin/login` (quick check only), every admin page calls `requireAdminPage()` (verifies the JWT), every admin API route calls `requireAdmin()`. Pages read data server-side; all changes go through the admin API. Big photos are shrunk in the browser (max 2560 px, under 4 MB) before upload. Design is provisional until the admin reference images arrive.
- 2026-09-29: Security pass. Checked: no secret fallbacks, no debug/test/seed routes, no secrets in git history, `npm audit` clean, every admin page and API handler checks the session, RLS and storage refuse the public key (read of unpublished rows, uploads, deletes, bucket listing), errors never leak internals. Added: security headers on every response (`next.config.ts`: frame-ancestors/X-Frame-Options against clickjacking, nosniff, Referrer-Policy, Permissions-Policy, HSTS; `X-Powered-By` off), and forms (login, contact, listing) render with the submit button disabled and `method="post"` until their JavaScript is ready, so an early click can't put a password or personal data into a URL. Not done (needs nonces from proxy.ts): a script-src Content Security Policy.
- 2026-09-29: Admin price field shows thousands separators while typing ("185,000", `components/admin/GroupedNumberInput.tsx`). Property gallery: photos close to the box's shape fill it, very different ones (panoramas, portraits) are shown whole on a blurred copy of themselves; phones/tablets use a 4:3 / 16:10 box; neighbouring photos preload.
