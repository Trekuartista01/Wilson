# Trekuartista Project Conventions

This project is built by Trekuartista, a creative agency in Prishtina. Follow these conventions in every session. They are fixed defaults, not open questions.

Project-specific details (client, brand, pages, features, milestone progress) live in `docs/PROJECT_BRIEF.md`. Read it at the start of every session and keep its milestone checklist up to date.

---

## Stack & Conventions

**Framework** Use Next.js (App Router), not Create React App. CRA is deprecated and gives no SSR/SEO story, which matters for client-facing sites. Scaffold with:

npx create-next-app@latest \--typescript \--tailwind \--eslint \--app

**Language** TypeScript only, no plain .jsx. Every recent project in the agency's portfolio uses TypeScript; don't start a new one in plain JavaScript.

**Styling** Tailwind CSS is the house style. Use @tailwindcss/postcss for the Next.js setup. Don't introduce a second styling system (styled-components, CSS modules, etc.) unless the project has a specific reason.

**Animation** Framer Motion for scroll/interaction animation, not GSAP (GSAP belongs to the older CRA-era projects). Pair it with react-intersection-observer for scroll-triggered reveals; that combination is the standard pattern for fade-in-on-scroll sections.

**Icons** react-icons by default. Don't hand-roll SVGs or add a second icon library.

**Backend / data layer** Pick one, don't mix both in the same project:

- **Mongoose (MongoDB)** if the project needs a traditional server-controlled database.  
- **Supabase** if the project needs fast setup with built-in auth/storage and less backend code.

**Email / notifications** nodemailer for contact forms and transactional email.

**Linting** eslint \+ eslint-config-next, non-negotiable, already wired up by create-next-app.

### Layout & component conventions

Follow the structure that's already standard across the agency's sites, not a generic Next.js starter layout:

- Build the homepage as stacked, sequential full-width sections (FirstPart/SecondPart/ThirdPart... or FirstPage/SecondPage...) rather than a generic componentized grid.  
- Name the hero/top-of-page section `Banner`.  
- Every page is wrapped in a shared Header/Navbar and Footer component. No inline or per-page chrome.  
- Add a floating "scroll to top" button (ScrollToTop/ScrollToTopButton). Default, not optional.  
- Keep page-level compositions in their own folder (components/pages/ or Pages/) separate from the route file, e.g. HomePage.tsx composes sections, app/page.tsx just renders it.  
- For catalog-style content (portfolio work, products, activities, projects), pair a list page with a matching detail page named SinglePageOfX (SinglePageOfWork, SinglePageOfProduct, SinglePageOfActivity...).  
- Give the homepage a condensed "About Us" teaser section (AboutUsOnHomePage) separate from the full /about page.  
- Build the contact page as a ContactForm/Contact component paired with an embedded Map component, not a form alone.  
- If the project needs editable content and doesn't warrant a full third-party CMS, build a lightweight custom admin panel (XManager.tsx components per content type: ProjectManager, ServiceManager, TeamManager, BannerManager) rather than Sanity or Contentful.

### Config & infrastructure conventions

- Deploy target is Vercel by default (.gitignore accounts for .vercel; Vercel Blob assumes it).  
- If using Mongoose, use a cached connection singleton in lib/mongodb.ts (cache the connection on the global object) instead of calling mongoose.connect() per request. Required for serverless.  
- Fill in the Next.js Metadata export (title, description) in layout.tsx for every page before shipping. Never leave the "Create Next App" default title in production.  
- Decide the image-storage strategy at kickoff and stay consistent: local public/uploads, Cloudinary, or Vercel Blob. Don't mix approaches inside one project.  
- If the client's brand uses a font not on Google Fonts, self-host it under public/fonts rather than substituting a Google font.

### Security conventions

These come from real issues found in past agency projects. Don't repeat them:

- Never write a fallback default for a secret (`process.env.JWT_SECRET || 'some-string'`). If the env var is required, the app must fail to start or throw.  
- Never ship debug-*, test-*, or seed-\* API routes to production without an auth check. Gate them behind `if (process.env.NODE_ENV !== 'production')` or delete them before deploy.  
- Hash passwords with bcryptjs. Never store or log plaintext passwords.  
- Sign auth tokens with jsonwebtoken using a required env-sourced secret, set a real expiry, and store the token in an httpOnly cookie, not localStorage.  
- Validate and sanitize all user input server-side (contact forms, admin fields, file uploads). Client-side validation alone is not security.  
- On file uploads, restrict allowed types and enforce a size limit server-side, not just via the picker's accept attribute.  
- Add basic rate limiting on public forms and auth routes (login, contact).  
- Never expose internal error details (stack traces, DB connection strings, file paths) in an API response. Log server-side, return a generic message.  
- Run `npm audit` before launch and address high/critical vulnerabilities.  
- Restrict admin and dashboard routes with real auth/role checks on both the page and its API routes. A hidden URL is not access control.

---

## Must do

- **Every project MUST be fully responsive across all devices** (small phones, large phones, tablets, laptops, large desktops, ultrawide). This is mandatory, not a polish step:  
  - Design mobile-first: write base styles for the smallest screen, then layer up with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).  
  - Every component and page must be built responsive from the start, not retrofitted at the end.  
  - Test at minimum widths of 320px, 375px, 768px, 1024px, 1440px and 1920px before marking any section done.  
  - No horizontal scrolling at any width. No overflowing, clipped or overlapping content.  
  - Navbar collapses into a working mobile menu. Tap targets are at least 44x44px on touch devices.  
  - Text, spacing and images scale fluidly (responsive type, `next/image` with proper `sizes`, no fixed pixel widths that break small screens).  
  - Grids and multi-column layouts collapse sensibly to a single column on mobile.  
  - Forms, maps, tables, admin panels and dashboards are responsive too, not just the marketing pages.  
  - Animations must not cause layout shift or break on mobile, and should respect `prefers-reduced-motion`.  
- Set up TypeScript and Tailwind at project init, not retrofitted later.  
- Keep secrets (DB URIs, API keys, SMTP credentials) in .env.local, never committed.  
- Require every secret from process.env with no hardcoded fallback value.

## Must not do

- Don't start on Create React App or Vite-without-SSR for anything client-facing and SEO-relevant.  
- Don't mix Mongoose and Supabase in the same project.  
- Don't commit .env\*, node\_modules, or .next. Confirm .gitignore covers them before the first commit.  
- Don't leave debug, test, or seed API routes reachable in production.  
- Don't store JWTs or session tokens in localStorage for anything login-gated.  
- Don't ship any page or component that is desktop-only or breaks on mobile.

---

## Reference stack

| Layer | Choice |
| :---- | :---- |
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, mobile-first, fully responsive |
| Animation | Framer Motion \+ react-intersection-observer |
| Icons | react-icons |
| Data layer | Mongoose (MongoDB) or Supabase |
| Email | nodemailer |
| Linting | eslint \+ eslint-config-next |
| Layout | Stacked full-width homepage sections, Banner hero, shared Header/Footer, scroll-to-top button, list \+ SinglePageOfX detail pattern |
| Deploy | Vercel |
| DB connection | Cached Mongoose singleton (if using MongoDB) |
| Image storage | Pick one: local public/uploads, Cloudinary, or Vercel Blob |
| Fonts | Self-hosted in public/fonts if not on Google Fonts |
| Security | No hardcoded secret fallbacks, no live debug/seed routes, bcrypt for passwords, httpOnly cookies for tokens, server-side input validation, rate limiting on forms/auth |
