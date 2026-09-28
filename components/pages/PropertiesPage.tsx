import Link from "next/link";
import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { filterProperties, getZone, type PropertyFilters } from "@/data/properties";
import { formatArea } from "@/lib/format";
import Container from "@/components/ui/Container";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import Map from "@/components/map/Map";
import PropertyCard from "@/components/properties/PropertyCard";
import SearchBar from "@/components/properties/SearchBar";

type PropertiesPageProps = {
  lang: Locale;
  dict: Dictionary;
  filters: PropertyFilters;
};

/**
 * Properties list: search, a map of Albania with every listing pinned, and the card grid.
 * TODO: awaiting Figma. Layout is a neutral placeholder (list + sticky map on desktop).
 */
export default function PropertiesPage({ lang, dict, filters }: PropertiesPageProps) {
  const t = dict.propertiesPage;
  const results = filterProperties(filters);
  const hasFilters = Object.values(filters).some(Boolean);

  const markers = results.map((p) => ({
    id: p.slug,
    lat: p.lat,
    lng: p.lng,
    title: p.title[lang],
    subtitle: `${getZone(p.zone).name[lang]} · ${formatArea(lang, p.areaSqm)}`,
    href: localePath(lang, `/properties/${p.slug}`),
    linkLabel: dict.map.viewProperty,
  }));

  return (
    <>
      <PageBanner eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <div className="bg-[linear-gradient(to_bottom,var(--color-brand-dark)_50%,var(--color-surface)_50%)]">
        <Container>
          <SearchBar lang={lang} dict={dict} defaults={filters} applyOnChange />
        </Container>
      </div>

      {/* Anchor the homepage search jumps to, so the filtered listings are in view on arrival. */}
      <Container id="results" className="scroll-mt-4 py-10 sm:py-14 lg:py-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-medium" aria-live="polite">
            {results.length === 1 ? t.resultsOne : format(t.results, { count: results.length })}
          </p>
          {hasFilters && (
            <Link
              href={localePath(lang, "/properties")}
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              {t.reset}
            </Link>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:gap-10">
          {/* Map: first on mobile, sticky right column on desktop */}
          <div className="lg:order-2">
            <Map
              label={t.mapLabel}
              loadingLabel={dict.map.loading}
              markers={markers}
              fitAlbania
              className="h-[55svh] min-h-72 max-h-[36rem] rounded-lg lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)] lg:max-h-none"
            />
          </div>

          <div className="lg:order-1">
            {results.length === 0 ? (
              <p className="rounded-lg bg-surface-subtle p-8 text-center text-ink-muted">{t.empty}</p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {results.map((property, i) => (
                  <Reveal as="li" key={property.slug} delay={(i % 2) * 0.08}>
                    <PropertyCard property={property} lang={lang} dict={dict} headingLevel="h2" />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
