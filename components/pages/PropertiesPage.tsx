import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  areaRanges,
  filterProperties,
  getZone,
  priceRanges,
  propertyStatuses,
  propertyTypes,
  sortOrders,
  zones,
  type PropertyFilters,
} from "@/data/properties";
import { formatArea } from "@/lib/format";
import { getPublishedProperties } from "@/lib/server/catalog";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Map from "@/components/map/Map";
import FilterBar, { type FilterField } from "@/components/properties/FilterBar";
import PropertyCard from "@/components/properties/PropertyCard";

/** Listings per page; "Shfaq më shumë" opens the next page. */
export const PAGE_SIZE = 10;

type PropertiesPageProps = {
  lang: Locale;
  dict: Dictionary;
  filters: PropertyFilters;
  /** Which page of PAGE_SIZE listings to show (1-based, from ?page=). */
  page: number;
};

/**
 * Properties list (Figma "Pronat"): filter row, then the listing cards on the left and a map
 * of Albania with every result pinned on the right. On desktop the cards scroll inside a box
 * exactly as tall as the map; "Shfaq më shumë" below it opens the next 10 (11-20, 21-30, ...).
 * The page links are plain <a> links, so each page loads fresh and always opens at the very
 * top: an in-app navigation kept the scroll position, and scrolling back up by script was
 * unreliable in real browsers.
 */
export default async function PropertiesPage({ lang, dict, filters, page: requestedPage }: PropertiesPageProps) {
  const t = dict.propertiesPage;
  const s = dict.search;
  const action = localePath(lang, "/properties");
  const results = filterProperties(await getPublishedProperties(), filters);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount); // e.g. an old link after listings were removed
  const from = (page - 1) * PAGE_SIZE;
  const visible = results.slice(from, from + PAGE_SIZE);

  const activeFilters = Object.entries(filters).filter(([, v]) => v) as [string, string][];
  const pageHref = (n: number) => {
    const query = new URLSearchParams(n > 1 ? [...activeFilters, ["page", String(n)]] : activeFilters).toString();
    return `${action}${query ? `?${query}` : ""}`;
  };

  const fields: FilterField[] = [
    { name: "zone", label: s.zone, placeholder: s.all, options: zones.map((z) => ({ value: z.slug, label: z.name[lang] })) },
    {
      name: "type",
      label: s.type,
      placeholder: s.all,
      options: propertyTypes.map((v) => ({ value: v, label: dict.propertyTypes[v] })),
    },
    {
      name: "status",
      label: s.status,
      placeholder: s.all,
      options: propertyStatuses.map((v) => ({ value: v, label: dict.propertyStatus[v] })),
    },
    { name: "area", label: s.area, placeholder: s.all, options: areaRanges.map((v) => ({ value: v, label: s.areaRanges[v] })) },
  ];
  const moreFields: FilterField[] = [
    { name: "price", label: s.price, placeholder: s.all, options: priceRanges.map((v) => ({ value: v, label: s.priceRanges[v] })) },
    { name: "sort", label: s.sort, placeholder: s.sortDefault, options: sortOrders.map((v) => ({ value: v, label: s.sortOrders[v] })) },
  ];

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
    <div>
      <Container className="pt-6 pb-14 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-28">
        <h1 className="sr-only">{t.title}</h1>

        <FilterBar
          action={action}
          fields={fields}
          moreFields={moreFields}
          values={filters}
          moreLabel={s.more}
          resetLabel={t.reset}
          ariaLabel={t.filtersLabel}
        />

        {/* Anchor the homepage search jumps to. --listing-h: shared height of the map and the
            card box on desktop, about one screen below the sticky header. */}
        <div
          id="results"
          className="mt-8 grid gap-6 [--listing-h:min(48rem,calc(100svh-var(--header-h)-3rem))] sm:mt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]"
        >
          {/* Map: first on mobile, right column on desktop */}
          <div className="lg:order-2">
            <Map
              label={t.mapLabel}
              loadingLabel={dict.map.loading}
              markers={markers}
              fitAlbania
              className="h-72 rounded-xl sm:h-96 lg:h-(--listing-h)"
            />
          </div>

          <div className="min-w-0 lg:order-1">
            <p className="sr-only" aria-live="polite">
              {results.length === 1 ? t.resultsOne : format(t.results, { count: results.length })}
            </p>

            {results.length === 0 ? (
              <p className="rounded-lg bg-surface p-8 text-center text-ink-muted">{t.empty}</p>
            ) : (
              // Remounts when the filters change, so the box starts back at the top. On desktop it is
              // exactly as tall as the map and scrolls on its own, so the list never runs past it.
              <div
                key={JSON.stringify(filters)}
                className="lg:h-(--listing-h) lg:overflow-y-auto lg:overscroll-y-auto lg:pr-2 lg:[scrollbar-width:thin]"
              >
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {visible.map((property, i) => (
                    <Reveal as="li" key={property.slug} delay={(i % 2) * 0.08}>
                      <PropertyCard property={property} lang={lang} dict={dict} headingLevel="h2" />
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {pageCount > 1 && (
              <div className="mt-6 flex flex-col items-center gap-1 sm:mt-8">
                <div className="flex flex-wrap items-center justify-center gap-x-6">
                  {page > 1 && (
                    <a
                      href={pageHref(page - 1)}
                      className="group inline-flex min-h-12 items-center gap-2 px-2 text-base text-ink-muted hover:text-ink"
                    >
                      <FiArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-1" />
                      {t.previous}
                    </a>
                  )}
                  {page < pageCount && (
                    <a
                      href={pageHref(page + 1)}
                      className="group inline-flex min-h-12 items-center gap-3 px-2 text-lg font-medium"
                    >
                      {t.showMore}
                      <FiArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-ink-muted">
                  {format(t.showing, { from: from + 1, to: from + visible.length, count: results.length })}
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
