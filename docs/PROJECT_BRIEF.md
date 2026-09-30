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
- Logo: ~~text placeholder~~ done 2026-09-29, Logo-01 from the brand materials (`public/images/wilson-logo.png`). Replaced 2026-09-30 by `1-01.png` (uppercase WILSON wordmark), cropped to `public/images/logo.png`.  
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
- 2026-09-29: Properties list shows 10 listings per page. (2026-09-30: "Shfaq më shumë" now opens the next page, `?page=2`, `?page=3`..., and scrolls back to the top of the list; "Më parë" goes back.) On desktop the cards scroll inside a box exactly as tall as the map (never past its bottom). "Më shumë" holds a price filter and sorting (a guess, Figma doesn't say).
- 2026-09-29: Brand yellow `#ffb500` (from the logo) is `--color-brand-accent`, used for highlights only: map pins, active nav underline, scroll-to-top, active step circle, service tile hover, text selection. Always with dark text. Favicon set (`app/favicon.ico`, `icon.png`, `apple-icon.png`) is the yellow W, Logo-04.
- 2026-09-29: Backend (Milestone 2). Route handlers in `app/api` (contact, admin login/logout/session, admin properties + images); shared server code in `lib/server` (`server-only`). Supabase is used server-side only, with the service role key. Schema, RLS, storage bucket and SQL functions live in `supabase/migrations`. Rate limits are counted in Postgres (`hit_rate_limit`), so they hold across Vercel instances. Admin auth: one account from env (`ADMIN_USERNAME` + bcrypt `ADMIN_PASSWORD_HASH`), 8-hour JWT in an httpOnly SameSite=Strict cookie, Origin check on every write. Uploads: JPEG/PNG/WebP up to 4 MB (Vercel's body limit is 4.5 MB, so the admin panel must downscale big photos in the browser), re-encoded to WebP ≤ 2560 px with all metadata (including GPS) stripped. Missing env vars stop the server in production (`instrumentation.ts`).
- 2026-09-29: The public site reads listings from Supabase with the publishable key (`lib/server/catalog.ts`), so row level security limits it to published listings. Cached for an hour in production and refreshed immediately by every admin API change (`revalidateTag("properties")`); in development it always reads fresh data. Changes made outside the API (Supabase dashboard, seed script) appear on production within the hour. Listing photos render through `next/image`, allowed only from this project's `property-images` bucket.
- 2026-09-29: Albanian wording: "tokë" is "parcelë" everywhere (type label, titles, meta, "Sipërfaqja e parcelës"). English "land" and German "Grundstück" unchanged.
- 2026-09-29: Admin panel (Milestone 4) at `/admin`: its own root layout (no locale prefix, no public header/footer, noindex; `robots.txt` disallows `/admin` and `/api`). UI text in Albanian, all in `components/admin/strings.ts`. Three layers of access control: proxy.ts sends visitors without a session cookie to `/admin/login` (quick check only), every admin page calls `requireAdminPage()` (verifies the JWT), every admin API route calls `requireAdmin()`. Pages read data server-side; all changes go through the admin API. Big photos are shrunk in the browser (max 2560 px, under 4 MB) before upload. Design is provisional until the admin reference images arrive.
- 2026-09-29: Security pass. Checked: no secret fallbacks, no debug/test/seed routes, no secrets in git history, `npm audit` clean, every admin page and API handler checks the session, RLS and storage refuse the public key (read of unpublished rows, uploads, deletes, bucket listing), errors never leak internals. Added: security headers on every response (`next.config.ts`: frame-ancestors/X-Frame-Options against clickjacking, nosniff, Referrer-Policy, Permissions-Policy, HSTS; `X-Powered-By` off), and forms (login, contact, listing) render with the submit button disabled and `method="post"` until their JavaScript is ready, so an early click can't put a password or personal data into a URL. Not done (needs nonces from proxy.ts): a script-src Content Security Policy.
- 2026-09-29: Admin price field shows thousands separators while typing ("185,000", `components/admin/GroupedNumberInput.tsx`). Property gallery: photos close to the box's shape fill it, very different ones (panoramas, portraits) are shown whole on a blurred copy of themselves; phones/tablets use a 4:3 / 16:10 box; neighbouring photos preload.
- 2026-09-30: Homepage rebuilt to the "Wilson - Home Page" mockup. Order: Banner, FirstPart (Pronat e veçanta: one large + two stacked cards), AboutUsOnHomePage (white band, text + large photo), SecondPart (Vendndodhja e pronave: zone rows, click opens `/properties?zone=`; 0 listings shows "së shpejti"), ThirdPart (services; moved above the scroll section 2026-09-30), FourthPart (six-step scroll), FifthPart ("Jeni në duar të sigurta!" CTA above the footer). The three-highlight row was dropped (not in the mockup). Header is transparent over the homepage hero and turns solid on scroll; "Shiko Pronat" is a yellow outline button on every page. Hero search is a frosted bar (`SearchForm` variant `hero`). Zones Shëngjin, Vain and Kunë added (`data/properties.ts`); homepage lists Tale, Shëngjin, Vain, Kunë. New colour tokens in globals.css (cream, gold, CTA gray) were sampled from the mockup PNG, pending exact codes from the designer.
- 2026-09-30: Header is green `#1f3327` (`--color-brand-green`) on every page (the light-gray property-page header is gone). On the homepage it stays transparent until the visitor scrolls past half of the hero (`[data-hero]` on Banner). Page background is cream `#fbf6ed` everywhere (the gray `surface-page` token was removed); the About page "Si punojmë" band is white. The homepage scroll statement uses Gilmer Regular.
- 2026-09-30: Listing cards on the properties page are `#f4e9d7` (`--color-surface-card`).
- 2026-09-30: Site grid follows the mockups: `Container` is full width with 56px gutters on desktop (`lg:px-14`; 16/24px on phones/tablets), capped at 1920px and centred beyond that. Header, hero and every section use it, so all content lines up at 56px. Hero search bar is green `#1f3327` at 70% with a backdrop blur. Listing cards: green "Shiko" button, gold detail-tag outlines. Services page rebuilt to the "Sherbimet" mockup (cream intro, numbered rows with photo on the right, thin `#ebe0ca` dividers); "Mëso më shumë" goes to Contact until per-service pages exist. The "Jeni në duar të sigurta!" band is now `components/ui/CtaBand.tsx`, shared by the homepage and Services.
- 2026-09-30: Green `#1f3327` dropped from the palette. Navbar is now brown `#6e4639` (`--color-brand-brown`). New palette colours to place from the upcoming page mockups: slate `#2b3748`, olive gray `#6b6753`. Green remains on the hero search bar and listing "Shiko" buttons until then.
- 2026-09-30: "New Colors" mockups applied (Home, Pronat, Sherbimet). Palette: slate `#2b3748` (navbar, homepage Rreth Wilson band), brown `#6e4639` (buttons, eyebrows/accents on cream, CTA band), olive `#6b6753` (active step). Green removed entirely. All buttons have 4px corners (`rounded`); listing "Shiko" buttons are brown with no hover change. Homepage service tiles show "Mëso më shumë" and a vignette on hover (always shown on touch screens). Property page contact card: WhatsApp (`siteConfig.whatsapp`, TODO confirm number), phone, and an enquiry form posting to `/api/inquiry` (name, phone, prefilled message; validated, rate limited 5/15 min, honeypot, emailed to CONTACT_TO; only published listings). Price kept in the card though the mockup omits it.
- 2026-09-30: Example listing photos in `public/images/listings` (Farkë, Golem, Himarë, Korçë, Sarandë, Shëngjin, Shkodër, Tale, Vlorë). Development only: `lib/server/example-photos.ts` gives each listing without real photos three stand-ins (its own place first); production builds never use them. Separator lines use `--color-divider` (brown at 30%). The "Test" listing (WRE-029) was deleted from Supabase with its photo.
- 2026-09-30: Featured row: large left photo is 4:3 again (the "end where the second right photo starts" version was reverted); title and area are brown. Property page details table: ID across the top, then 2 rows x 3 columns (2 columns on phones), full width of the left column.
- 2026-09-30: Homepage featured section (heading + cards) uses the earlier centred column (max-w-7xl / 88rem on 2xl), not the full-width 56px grid. The listings page links ("Shfaq më shumë", "Më parë") are plain `<a>` links: each page loads fresh and opens at the top. Scripted scrolling after an in-app navigation proved unreliable in real browsers.
- 2026-09-30: Filter dropdowns (listings filter bar and homepage hero search) use the site's own `components/ui/Dropdown` (WAI-ARIA select-only combobox, list in a portal) instead of native <select>. About page rebuilt to the "Rreth Wilson" mockup: photo banner (Filozofia jonë), statement + intro and the four "Qasja jonë" steps on cream, "Forca kryesore" on white, full-width photo, Misioni & vizioni on slate, CTA band. Navbar stays solid slate (not the mockup's overlay). The old story section was removed. "Zyrat" (from the ZYRAT mockup) sits under Misioni & vizioni: office rows (Tale/Shëngjin, Tiranë, Kosovë with addresses) next to a photo that switches on hover/focus/tap, like the homepage zones (`components/about/OfficeList.tsx`).
