import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getPublishedProperties } from "@/lib/server/catalog";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import FeaturedCarousel, { type FeaturedSlide } from "./FeaturedCarousel";

/** Up to this many listings go round the carousel. */
const MAX_SLIDES = 6;

/** First sentence-ish of the description, for the short text under the title. */
function excerpt(text: string, max = 150) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/**
 * Homepage "(Pronat e veçuara)" band ("Wilson Home Page" mockup): featured listings in a
 * carousel on near-black. Listings marked featured come first; if there are fewer than three,
 * the newest others fill in so the carousel always has neighbours to show.
 */
export default async function FirstPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.featured;
  const all = await getPublishedProperties();
  const featured = all.filter((p) => p.featured);
  const list = (featured.length >= 3 ? featured : [...featured, ...all.filter((p) => !p.featured)]).slice(
    0,
    MAX_SLIDES,
  );
  if (!list.length) return null;

  const slides: FeaturedSlide[] = list.map((p) => ({
    slug: p.slug,
    href: localePath(lang, `/properties/${p.slug}`),
    title: p.title[lang],
    text: excerpt(p.description[lang]),
    image: p.images[0]?.url ?? null,
  }));

  return (
    <section
      aria-labelledby="featured-title"
      className="overflow-hidden rounded-tr-band rounded-bl-band bg-surface-dark py-16 text-surface sm:py-20 lg:py-24"
    >
      <Container className="xl:px-30">
        <Reveal className="flex items-baseline justify-between gap-6">
          <h2
            id="featured-title"
            className="font-sans text-sm font-normal text-surface/80 uppercase italic sm:text-base"
          >
            {t.eyebrow}
          </h2>
          <Link
            href={localePath(lang, "/properties")}
            className="inline-flex min-h-11 items-center text-xs tracking-wide text-brand-accent/80 uppercase transition-colors hover:text-brand-accent sm:text-sm"
          >
            {t.viewAll}
          </Link>
        </Reveal>
      </Container>
      <div className="mt-8 sm:mt-12 lg:mt-14">
        <FeaturedCarousel
          slides={slides}
          labels={{
            view: t.view,
            previous: t.previous,
            next: t.next,
            show: t.show,
            image: dict.common.imagePlaceholder,
          }}
        />
      </div>
    </section>
  );
}
