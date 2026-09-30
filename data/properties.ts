// Property catalog definitions shared by the site, the API and the demo seed: types, zones,
// option lists, and the list filtering/sorting used by the properties page.
// The listings themselves live in Supabase (read through lib/server/catalog.ts).

import type { Locale } from "@/i18n/config";

export type Localized<T = string> = Record<Locale, T>;

export type ZoneSlug =
  | "tirana"
  | "durres"
  | "vlore"
  | "sarande"
  | "shkoder"
  | "tale"
  | "shengjin"
  | "vain"
  | "kune"
  | "korce"
  | "himare";

export type PropertyType = "land" | "residential" | "commercial";
export type PropertyStatus = "sale" | "rent";
export type AreaRange = "lt1000" | "1000-5000" | "gt5000";
export type PriceRange = "lt100k" | "100k-250k" | "gt250k";
export type SortOrder = "newest" | "priceAsc" | "priceDesc" | "areaDesc";
/** "Cilësi shtesë" on the detail page: the listing's standout extra. Translated in the dictionaries. */
export type PropertyFeature = "seaView" | "roadAccess" | "buildingPermit" | "utilities" | "flatTerrain" | "cityView";

export type Property = {
  slug: string;
  reference: string;
  title: Localized;
  description: Localized;
  zone: ZoneSlug;
  type: PropertyType;
  status: PropertyStatus;
  areaSqm: number;
  /** EUR. null means "price on request". */
  price: number | null;
  lat: number;
  lng: number;
  featured: boolean;
  /** Municipality (Komuna). A proper name, the same in every language. */
  municipality: string;
  feature: PropertyFeature;
  /** Last update, ISO date. */
  updatedAt: string;
  /** Photos in display order (Supabase Storage). Empty: the gray placeholder is shown. */
  images: PropertyImage[];
};

export type PropertyImage = { url: string; width: number; height: number };

export type Zone = {
  slug: ZoneSlug;
  name: Localized;
};

export const zones: Zone[] = [
  { slug: "tirana", name: { sq: "Tiranë", en: "Tirana", de: "Tirana" } },
  { slug: "durres", name: { sq: "Durrës", en: "Durrës", de: "Durrës" } },
  { slug: "tale", name: { sq: "Tale", en: "Tale", de: "Tale" } },
  { slug: "shengjin", name: { sq: "Shëngjin", en: "Shëngjin", de: "Shëngjin" } },
  { slug: "vain", name: { sq: "Vain", en: "Vain", de: "Vain" } },
  { slug: "kune", name: { sq: "Kunë", en: "Kunë", de: "Kunë" } },
  { slug: "vlore", name: { sq: "Vlorë", en: "Vlora", de: "Vlora" } },
  { slug: "sarande", name: { sq: "Sarandë", en: "Saranda", de: "Saranda" } },
  { slug: "himare", name: { sq: "Himarë", en: "Himara", de: "Himara" } },
  { slug: "shkoder", name: { sq: "Shkodër", en: "Shkodra", de: "Shkodra" } },
  { slug: "korce", name: { sq: "Korçë", en: "Korça", de: "Korça" } },
];

/** Zones listed in the homepage "Zonat" section, in order (from the homepage mockup). */
export const homepageZones: ZoneSlug[] = ["tale", "shengjin", "vain", "kune"];

export const propertyTypes: PropertyType[] = ["land", "residential", "commercial"];
export const propertyStatuses: PropertyStatus[] = ["sale", "rent"];
export const areaRanges: AreaRange[] = ["lt1000", "1000-5000", "gt5000"];
export const priceRanges: PriceRange[] = ["lt100k", "100k-250k", "gt250k"];
export const sortOrders: SortOrder[] = ["newest", "priceAsc", "priceDesc", "areaDesc"];
export const propertyFeatures: PropertyFeature[] = ["seaView", "roadAccess", "buildingPermit", "utilities", "flatTerrain", "cityView"];

export function getZone(slug: ZoneSlug): Zone {
  const zone = zones.find((z) => z.slug === slug);
  if (!zone) throw new Error(`Unknown zone: ${slug}`);
  return zone;
}

function inAreaRange(area: number, range: AreaRange): boolean {
  if (range === "lt1000") return area < 1000;
  if (range === "gt5000") return area > 5000;
  return area >= 1000 && area <= 5000;
}

function inPriceRange(price: number | null, range: PriceRange): boolean {
  if (price === null) return false; // "price on request" fits no range
  if (range === "lt100k") return price < 100_000;
  if (range === "gt250k") return price > 250_000;
  return price >= 100_000 && price <= 250_000;
}

export type PropertyFilters = {
  zone?: string;
  type?: string;
  area?: string;
  status?: string;
  price?: string;
  sort?: string;
};

/** Filters and sorts listings by the search query params. Unknown values are ignored. */
export function filterProperties(list: Property[], filters: PropertyFilters): Property[] {
  const results = list.filter((p) => {
    if (filters.zone && zones.some((z) => z.slug === filters.zone) && p.zone !== filters.zone) return false;
    if (filters.type && propertyTypes.includes(filters.type as PropertyType) && p.type !== filters.type) return false;
    if (filters.status && propertyStatuses.includes(filters.status as PropertyStatus) && p.status !== filters.status) return false;
    if (filters.area && areaRanges.includes(filters.area as AreaRange) && !inAreaRange(p.areaSqm, filters.area as AreaRange)) return false;
    if (filters.price && priceRanges.includes(filters.price as PriceRange) && !inPriceRange(p.price, filters.price as PriceRange)) return false;
    return true;
  });
  return sortProperties(results, filters.sort);
}

// "Price on request" listings go last whichever way prices are sorted.
const priceKey = (p: Property, dir: 1 | -1) => (p.price === null ? Infinity : p.price * dir);

function sortProperties(list: Property[], sort: string | undefined): Property[] {
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "priceAsc":
      return list.sort((a, b) => priceKey(a, 1) - priceKey(b, 1));
    case "priceDesc":
      return list.sort((a, b) => priceKey(a, -1) - priceKey(b, -1));
    case "areaDesc":
      return list.sort((a, b) => b.areaSqm - a.areaSqm);
    default:
      return list;
  }
}

/** "Prona të ngjashme": same zone first, then same type, never the listing itself. */
export function getSimilarProperties(list: Property[], property: Property, count = 3): Property[] {
  const score = (p: Property) => (p.zone === property.zone ? 2 : 0) + (p.type === property.type ? 1 : 0);
  return list
    .filter((p) => p.slug !== property.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}
