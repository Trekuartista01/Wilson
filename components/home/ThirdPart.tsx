import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, homepageZones, properties } from "@/data/properties";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Homepage section 3: zones, four cards (Figma "Body", top).
 * Each card opens the properties list filtered by that zone.
 */
export default function ThirdPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.zones;

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <Container>
        {/* TODO: there is no dedicated zones page yet, so "view all" goes to the properties list. */}
        <SectionHeader title={t.title} linkHref={localePath(lang, "/properties")} linkLabel={t.viewAll} />
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {homepageZones.map((slug, i) => {
            const zone = getZone(slug);
            const inZone = properties.filter((p) => p.zone === slug);
            const types = [...new Set(inZone.map((p) => dict.propertyTypes[p.type]))];
            return (
              <Reveal as="li" key={slug} delay={i * 0.08}>
                <Card
                  href={`${localePath(lang, "/properties")}?zone=${slug}`}
                  headline={zone.name[lang]}
                  subhead={format(t.count, { count: inZone.length })}
                  body={t.description}
                  tagsTitle={types.length ? dict.search.type : undefined}
                  tags={types}
                  buttonLabel={dict.common.view}
                  imageLabel={dict.common.imagePlaceholder}
                />
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
