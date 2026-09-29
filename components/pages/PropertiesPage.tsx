import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
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
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Map from "@/components/map/Map";
import FilterBar, { type FilterField } from "@/components/properties/FilterBar";
import ListingPane from "@/components/properties/ListingPane";
import PropertyCard from "@/components/properties/PropertyCard";

/** Listings shown at first, and added by each "Shfaq më shumë". */
export const PAGE_SIZE = 10;

type PropertiesPageProps = {
  lang: Locale;
  dict: Dictionary;
  filters: PropertyFilters;
  /** How many listings to show (a multiple of PAGE_SIZE, from ?show=). */
  show: number;
};

/**
 * Properties list (Figma "Pronat"): filter row, then the listing cards on the left and a map
 * of Albania with every result pinned on the right. On desktop the cards scroll inside a box
 * exactly as tall as the map; "Shfaq më shumë" below it loads the next 10.
 */
export default function PropertiesPage({ lang, dict, filters, show }: PropertiesPageProps) {
  const t = dict.propertiesPage;
  const s = dict.search;
  const action = localePath(lang, "/properties");
  const results = filterProperties(filters);
  const visible = results.slice(0, show);

  const activeFilters = Object.entries(filters).filter(([, v]) => v) as [string, string][];
  const nextQuery = new URLSearchParams([...activeFilters, ["show", String(show + PAGE_SIZE)]]);

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
    <div className="bg-surface-page">
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
              // Remounts when the filters change, so the box starts back at the top.
              <ListingPane
                key={JSON.stringify(filters)}
                count={visible.length}
                className="lg:h-(--listing-h) lg:overflow-y-auto lg:overscroll-y-auto lg:pr-2 lg:[scrollbar-width:thin]"
              >
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {visible.map((property, i) => (
                    <Reveal as="li" key={property.slug} delay={(i % 2) * 0.08}>
                      <PropertyCard property={property} lang={lang} dict={dict} headingLevel="h2" />
                    </Reveal>
                  ))}
                </ul>
              </ListingPane>
            )}

            {results.length > visible.length && (
              <div className="mt-6 flex flex-col items-center gap-1 sm:mt-8">
                <Link
                  href={`${action}?${nextQuery}`}
                  scroll={false}
                  className="group inline-flex min-h-12 items-center gap-3 px-2 text-lg font-medium"
                >
                  {t.showMore}
                  <FiArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="text-sm text-ink-muted">
                  {format(t.showing, { shown: visible.length, count: results.length })}
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
