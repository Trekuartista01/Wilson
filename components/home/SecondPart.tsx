import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { properties } from "@/data/properties";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import PropertyCard from "@/components/properties/PropertyCard";

/** Homepage section 2: featured properties, three cards (Figma "Hero", bottom). */
export default function SecondPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const featured = properties.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <Container>
        <SectionHeader
          title={dict.home.featured.title}
          linkHref={localePath(lang, "/properties")}
          linkLabel={dict.home.featured.viewAll}
        />
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-16">
          {featured.map((property, i) => (
            <Reveal as="li" key={property.slug} delay={i * 0.1}>
              <PropertyCard property={property} lang={lang} dict={dict} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
