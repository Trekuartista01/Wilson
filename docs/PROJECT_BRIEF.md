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

- [ ] API route structure (app/api/...)  
- [ ] Contact form endpoint \+ nodemailer delivery (destination TBD)  
- [ ] CRUD endpoints for properties  
- [ ] Admin login endpoint (env-sourced credentials, signed token in an httpOnly cookie, no fallbacks)  
- [ ] Image upload to Supabase Storage with server-side type/size validation  
- [ ] Input validation/sanitization on every route  
- [ ] Rate limiting on the contact form and login  
- [ ] Centralized error handling that never leaks internals

### Milestone 3: Database (Supabase)

- [ ] Tables for properties (with translations for the three languages) and image references  
- [ ] Storage bucket \+ policies for property images  
- [ ] Indexes for anything queried often  
- [ ] Seed data for local development only, gated behind NODE\_ENV \!== 'production'  
- [ ] Env vars for all keys, none hardcoded, none with fallbacks

### Milestone 4: Admin panel

- [ ] Auth-gated admin routes (page-level and API-level checks)  
- [ ] PropertyManager (create/edit/delete listings, all three languages)  
- [ ] Media/image manager tied to Supabase Storage  
- [ ] Admin screens verified responsive on mobile and tablet  
- [ ] Final security pass

---

## Decisions log

- Supabase is the single data layer (listings \+ images). No Mongoose.  
- Figma UI reference images are provided per section; follow them for structure, not for final styling.
- Phase 1 (2026-09-28): i18n is hand-rolled per the Next.js 16 guide (`app/[lang]`, `proxy.ts`, JSON dictionaries in `i18n/dictionaries/`), no i18n library. Default locale `sq` (switcher label "AL"); `/` redirects by cookie, then Accept-Language, then `sq`.
- Phase 1: maps use Leaflet + react-leaflet with OpenStreetMap tiles (no API key). Pick a production tile provider before launch.
- Phase 1: property data is hardcoded in `data/properties.ts` (replaced by Supabase in Milestone 3). The search bar filters it via query params on `/[lang]/properties`.
- 2026-09-29: Properties list + SinglePageOfProperty rebuilt to the Figma ("Pronat", "Pronat Desc"). Header is sticky on every page (`--header-h` in globals.css, anything pinned to the top offsets by it) and turns light gray on the property pages to match Figma.
- 2026-09-29: Properties list shows 10 listings, "Shfaq më shumë" adds 10 more via `?show=`. On desktop the cards scroll inside a box exactly as tall as the map (never past its bottom). "Më shumë" holds a price filter and sorting (a guess, Figma doesn't say).
- 2026-09-29: Brand yellow `#ffb500` (from the logo) is `--color-brand-accent`, used for highlights only: map pins, active nav underline, scroll-to-top, active step circle, service tile hover, text selection. Always with dark text. Favicon set (`app/favicon.ico`, `icon.png`, `apple-icon.png`) is the yellow W, Logo-04.
