# Phase 1 Summary (skeleton)

## Run it

```
npm run dev
```

Open http://localhost:3000. It redirects to `/sq`. Other languages: `/en`, `/de`.

Lint, typecheck and the production build all pass. Milestone 1 is ticked in `docs/PROJECT_BRIEF.md`.

**Please check first:** during scaffolding, create-next-app overwrote `CLAUDE.md`. It was restored from the copy read at the start of the session. Compare it against your original.

## Homepage, in Figma order

1. **Banner**: dark hero, headline, two buttons, and the search bar (Zona / Lloji / Sipërfaqja / Statusi / Kërko) overlapping its bottom edge.
2. **Highlights**: 3 items with icon boxes.
3. **Featured properties**: 3 cards.
4. **Zonat**: 4 cards.
5. **6-step scroll section**: stays fixed on screen while you scroll. Each scroll moves to the next step: numbers slide up, the active circle turns black, the image changes. Works on desktop and mobile. Shows as a plain list if the visitor has reduced motion turned on.
6. **Shërbimet Wilson**: gray band with 4 service tiles.
7. **About Us teaser**: TODO, awaiting Figma.
8. **Footer**: matches the Figma.

## Other pages

- **Properties:** map of Albania with a pin for each of 8 placeholder listings, plus cards. Clicking a card or a pin's popup link opens the detail page (`SinglePageOfProperty`). The search bar filters the listings.
- **Services, About, Contact:** placeholders marked TODO, awaiting Figma. Contact has the form (UI only, nothing is sent) and a map of the office.

Every page was checked at 320, 375, 768, 1024, 1440 and 1920px: no sideways scrolling, and all tap targets are at least 44px.

## Things I guessed, please check

1. **Default language is Albanian**, because the Figma is in Albanian.
2. **Scroll section layout:** statement heading above, steps on the left, image on the right. Scroll.png also shows the statement on the right partway through. If that text should animate in there, say so.
3. **Heading:** used "Pronat e veçanta" (Figma says "vecanta/ vecuara").
4. **Footer contact details** (phone, email, address) are copied from the Figma. Social links are placeholders. All of it is in `lib/site.ts`.
5. **English and German text** are draft translations and need proofreading.
6. **"Shiko të gjitha zonat"** goes to the properties list, because there's no zones page.
7. **The 8 placeholder properties** are in real towns with approximate map positions (`data/properties.ts`).
8. **Header:**
   - It doesn't stay fixed at the top when you scroll.
   - The active link is white and underlined rather than black, so it's readable on the gray.
   - The "Shiko Pronat" button only shows on wide screens (1280px+) so the German labels fit.
9. **Map tiles** are OpenStreetMap's free ones. A paid tile provider is needed before launch.
10. **Privacy and Terms links** in the footer go nowhere yet, because those pages don't exist.
11. **Languages** use Next.js's built-in approach, not an extra library.

## Next

Send the reference images for the Properties, Services, About and Contact pages and the placeholders will be replaced.
