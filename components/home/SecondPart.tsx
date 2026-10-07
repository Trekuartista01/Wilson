import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, homepageZones } from "@/data/properties";
import { getPublishedProperties } from "@/lib/server/catalog";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ZoneShowcase from "./ZoneShowcase";

/**
 * Homepage zones band ("Wilson Home Page" mockup: "Land where your next chapter begins").
 * The zones in data/properties.ts `homepageZones`, each with its listing count; picking one
 * shows its photo large in the middle (ZoneShowcase), with links to its listings.
 */
export default async function SecondPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.zones;
  const properties = await getPublishedProperties();

  const zones = homepageZones.map((slug) => {
    const count = properties.filter((p) => p.zone === slug).length;
    const name = getZone(slug).name[lang];
    return {
      slug,
      name,
      caption: format(t.caption, { zone: name }),
      countLabel: count ? format(t.count, { count }) : t.comingSoon,
      badge: count ? dict.propertyStatus.sale : t.comingSoon,
      href: `${localePath(lang, "/properties")}?zone=${slug}`,
    };
  });

  return (
    <section aria-labelledby="zones-title" className="bg-surface-cream py-16 sm:py-24 lg:py-28">
      <Container className="xl:px-30">
        <Reveal className="flex flex-col-reverse gap-4 border-b border-ink/10 pb-10 sm:flex-row sm:items-start sm:justify-between lg:pb-12">
          <h2
            id="zones-title"
            className="max-w-2xl font-sans text-[2rem] leading-[1.1] tracking-tight text-balance sm:text-[2.6rem] lg:text-[3.4rem]"
          >
            {t.title}
          </h2>
          <p className="text-sm sm:mt-1">{t.eyebrow}</p>
        </Reveal>
        <div className="mt-8 lg:mt-10">
          <ZoneShowcase
            zones={zones}
            allHref={localePath(lang, "/properties")}
            labels={{
              details: t.details,
              viewAll: t.viewAll,
              previous: t.previous,
              next: t.next,
              image: dict.common.imagePlaceholder,
            }}
          />
        </div>
      </Container>
    </section>
  );
}
