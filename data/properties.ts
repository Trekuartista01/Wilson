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
/** "Afër" filter: what is within easy reach of the listing. Translated in the dictionaries (`amenities`). */
export type Amenity =
  | "beach"
  | "supermarket"
  | "restaurant"
  | "hospital"
  | "pharmacy"
  | "school"
  | "cityCentre"
  | "publicTransport"
  | "airport";

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
  /** What is close by (beach, shops, hospital...). Set in the admin panel; empty if not filled in. */
  nearby: Amenity[];
  /** How far each close-by place is, in metres (only for some of `nearby`). */
  nearbyDistances: NearbyDistances;
  /**
   * The nearest real place of each kind (beach, supermarket, hospital, town, airport...),
   * looked up on OpenStreetMap from the pin when the listing is saved (lib/nearby-lookup.ts).
   * Empty until the lookup has run; the page then falls back to `nearby`.
   */
  nearbyPlaces: NearbyPlace[];
  /** Last update, ISO date. */
  updatedAt: string;
  /** Photos in display order (Supabase Storage). Empty: the gray placeholder is shown. */
  images: PropertyImage[];
};

export type PropertyImage = { url: string; width: number; height: number };

export type NearbyDistances = Partial<Record<Amenity, number>>;

/** One looked-up place: its kind, OpenStreetMap name (if any), position and straight-line distance. */
export type NearbyPlace = {
  amenity: Amenity;
  /** Local name; `names` has the English/German ones where OpenStreetMap has them. */
  name: string | null;
  names?: Partial<Record<"sq" | "en" | "de", string>>;
  lat: number;
  lng: number;
  metres: number;
};

/**
 * How far a looked-up place may be for the listing to count as "close by" it in the "Afër"
 * filter (straight line, metres). The Location section shows the nearest one whatever the distance.
 */
export const nearThreshold: Record<Amenity, number> = {
  beach: 3000,
  supermarket: 2000,
  restaurant: 2000,
  hospital: 15000,
  pharmacy: 3000,
  school: 3000,
  cityCentre: 10000,
  publicTransport: 1000,
  airport: 60000,
};

/** The listing is close to this kind of place: ticked in the admin, or found within `nearThreshold`. */
export function isNear(p: Pick<Property, "nearby" | "nearbyPlaces">, amenity: Amenity): boolean {
  return p.nearby.includes(amenity) || p.nearbyPlaces.some((n) => n.amenity === amenity && n.metres <= nearThreshold[amenity]);
}

/** The stored `nearby_places` jsonb, cleaned up; anything malformed is dropped. */
export function readNearbyPlaces(value: unknown): NearbyPlace[] {
  if (!Array.isArray(value)) return [];
  const out: NearbyPlace[] = [];
  for (const v of value) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    if (!amenities.includes(o.amenity as Amenity)) continue;
    if (![o.lat, o.lng, o.metres].every((n) => typeof n === "number" && Number.isFinite(n))) continue;
    const names: NearbyPlace["names"] = {};
    if (o.names && typeof o.names === "object") {
      for (const l of ["sq", "en", "de"] as const) {
        const n = (o.names as Record<string, unknown>)[l];
        if (typeof n === "string" && n) names[l] = n.slice(0, 120);
      }
    }
    out.push({
      amenity: o.amenity as Amenity,
      name: typeof o.name === "string" && o.name ? o.name.slice(0, 120) : null,
      names,
      lat: o.lat as number,
      lng: o.lng as number,
      metres: Math.round(o.metres as number),
    });
  }
  return out.sort((a, b) => amenities.indexOf(a.amenity) - amenities.indexOf(b.amenity));
}

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
export const amenities: Amenity[] = [
  "beach",
  "supermarket",
  "restaurant",
  "hospital",
  "pharmacy",
  "school",
  "cityCentre",
  "publicTransport",
  "airport",
];

/**
 * The "close by" columns as stored (nearby text[], nearby_distances jsonb), cleaned up: unknown
 * keys dropped, distances kept only for listed places and only as whole positive metres.
 * Both columns are missing until their migrations run; that reads as "nothing close by".
 */
export function readNearby(
  nearby: unknown,
  distances: unknown,
): { nearby: Amenity[]; nearbyDistances: NearbyDistances } {
  const list = Array.isArray(nearby) ? nearby.filter((a): a is Amenity => amenities.includes(a as Amenity)) : [];
  const nearbyDistances: NearbyDistances = {};
  if (distances && typeof distances === "object") {
    for (const a of list) {
      const m = (distances as Record<string, unknown>)[a];
      if (typeof m === "number" && Number.isFinite(m) && m > 0) nearbyDistances[a] = Math.round(m);
    }
  }
  return { nearby: list, nearbyDistances };
}

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
  /** Amenity the listing must be close to ("Afër"). */
  near?: string;
  /** Free text from the navbar search, matched by lib/property-search.ts (needs the labels of a language). */
  q?: string;
  sort?: string;
};

/** Filters and sorts listings by the search query params. Unknown values are ignored; `q` is applied separately (lib/property-search.ts). */
export function filterProperties(list: Property[], filters: PropertyFilters): Property[] {
  const results = list.filter((p) => {
    if (filters.zone && zones.some((z) => z.slug === filters.zone) && p.zone !== filters.zone) return false;
    if (filters.type && propertyTypes.includes(filters.type as PropertyType) && p.type !== filters.type) return false;
    if (filters.status && propertyStatuses.includes(filters.status as PropertyStatus) && p.status !== filters.status) return false;
    if (filters.area && areaRanges.includes(filters.area as AreaRange) && !inAreaRange(p.areaSqm, filters.area as AreaRange)) return false;
    if (filters.price && priceRanges.includes(filters.price as PriceRange) && !inPriceRange(p.price, filters.price as PriceRange)) return false;
    if (filters.near && amenities.includes(filters.near as Amenity) && !isNear(p, filters.near as Amenity)) return false;
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
