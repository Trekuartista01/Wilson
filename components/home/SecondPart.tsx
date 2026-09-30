import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, homepageZones } from "@/data/properties";
import { getPublishedProperties } from "@/lib/server/catalog";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import ZoneList from "./ZoneList";

/**
 * Homepage section 2: "Vendndodhja e pronave", the zone list with listing counts.
 * Each row opens the properties list filtered by that zone.
 */
export default async function SecondPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.zones;
  const properties = await getPublishedProperties();

  const zones = homepageZones.map((slug) => {
    const count = properties.filter((p) => p.zone === slug).length;
    return {
      slug,
      name: getZone(slug).name[lang],
      countLabel: count ? format(t.count, { count }) : t.comingSoon,
      href: `${localePath(lang, "/properties")}?zone=${slug}`,
    };
  });

  return (
    <section className="bg-surface-cream py-16 sm:py-24 lg:py-32">
      <Container>
        <Reveal>
          <ZoneList
            zones={zones}
            imageLabel={dict.common.imagePlaceholder}
            header={
              <>
                <Eyebrow>{t.eyebrow}</Eyebrow>
                <h2 className="mt-3 mb-8 font-sans text-3xl font-bold tracking-tight sm:mb-10 sm:text-4xl">{t.title}</h2>
              </>
            }
          />
        </Reveal>
      </Container>
    </section>
  );
}
