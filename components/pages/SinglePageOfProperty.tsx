import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, properties, type Property } from "@/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Reveal from "@/components/ui/Reveal";
import Map from "@/components/map/Map";
import PropertyCard from "@/components/properties/PropertyCard";

type SinglePageOfPropertyProps = {
  property: Property;
  lang: Locale;
  dict: Dictionary;
};

/**
 * Property detail page, opened from a listing card or a map pin.
 * TODO: awaiting Figma. Neutral placeholder: gallery, key facts, description, map, contact CTA.
 */
export default function SinglePageOfProperty({ property, lang, dict }: SinglePageOfPropertyProps) {
  const t = dict.property;
  const zoneName = getZone(property.zone).name[lang];
  const price = property.price === null ? dict.common.priceOnRequest : formatPrice(lang, property.price);
  const more = properties.filter((p) => p.slug !== property.slug).slice(0, 3);

  const facts = [
    { label: t.price, value: price },
    { label: t.area, value: formatArea(lang, property.areaSqm) },
    { label: t.type, value: dict.propertyTypes[property.type] },
    { label: t.status, value: dict.propertyStatus[property.status] },
    { label: t.zone, value: zoneName },
    { label: t.reference, value: property.reference },
  ];

  return (
    <>
      <section className="bg-brand-dark text-surface">
        <Container className="pt-6 pb-10 sm:pt-8 sm:pb-14">
          <Link
            href={localePath(lang, "/properties")}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-surface/80 hover:text-surface"
          >
            <FiArrowLeft aria-hidden />
            {t.back}
          </Link>
          <p className="mt-4 text-base font-light sm:text-lg">{zoneName}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {property.title[lang]}
          </h1>
          <p className="mt-3 text-xl">{price}</p>
        </Container>
      </section>

      {/* Gallery. TODO: real images from Supabase Storage (Milestone 3). */}
      <Container className="pt-6 sm:pt-10">
        <div className="grid gap-2 sm:gap-3 md:grid-cols-4 md:grid-rows-2">
          <ImagePlaceholder
            aspect="aspect-[16/10] md:aspect-auto md:h-full"
            label={dict.common.imagePlaceholder}
            className="md:col-span-3 md:row-span-2"
          />
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:contents">
            {[1, 2, 3].map((n) => (
              <ImagePlaceholder
                key={n}
                aspect="aspect-[4/3]"
                className={n === 3 ? "md:hidden" : ""}
                label={`${n + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>

      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="min-w-0">
          <Reveal>
            <h2 className="text-2xl font-medium">{t.overview}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-surface p-4">
                  <dt className="text-xs tracking-wide text-ink-muted uppercase">{fact.label}</dt>
                  <dd className="mt-1 font-medium break-words">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="text-2xl font-medium">{t.description}</h2>
            <p className="mt-4 max-w-prose text-ink-muted">{property.description[lang]}</p>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="text-2xl font-medium">{t.location}</h2>
            <Map
              label={`${t.location}: ${property.title[lang]}`}
              loadingLabel={dict.map.loading}
              markers={[{ id: property.slug, lat: property.lat, lng: property.lng, title: property.title[lang], subtitle: zoneName }]}
              zoom={12}
              className="mt-4 aspect-[4/3] rounded-lg sm:aspect-video"
            />
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg bg-surface-subtle p-6">
            <h2 className="text-xl font-medium">{t.contactTitle}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t.contactText}</p>
            <Link
              href={localePath(lang, "/contact")}
              className="mt-5 flex min-h-12 items-center justify-center gap-2 bg-brand-primary px-4 text-surface transition-colors hover:bg-black"
            >
              {t.contactCta}
              <FiArrowRight aria-hidden />
            </Link>
          </div>
        </aside>
      </Container>

      <section className="border-t border-line py-12 sm:py-16">
        <Container>
          <h2 className="mb-8 text-2xl font-medium sm:text-3xl">{t.more}</h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <PropertyCard property={p} lang={lang} dict={dict} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
