// HARDCODED PLACEHOLDER DATA (Phase 1).
// Milestone 3 replaces this with Supabase tables (properties + translations + images).
// Coordinates are approximate town locations, not real parcels.

import type { Locale } from "@/i18n/config";

export type Localized<T = string> = Record<Locale, T>;

export type ZoneSlug =
  | "tirana"
  | "durres"
  | "vlore"
  | "sarande"
  | "shkoder"
  | "tale"
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
  /** Number of gallery photos. TODO: real images from Supabase Storage (Milestone 3). */
  imageCount: number;
};

export type Zone = {
  slug: ZoneSlug;
  name: Localized;
};

export const zones: Zone[] = [
  { slug: "tirana", name: { sq: "Tiranë", en: "Tirana", de: "Tirana" } },
  { slug: "durres", name: { sq: "Durrës", en: "Durrës", de: "Durrës" } },
  { slug: "tale", name: { sq: "Tale", en: "Tale", de: "Tale" } },
  { slug: "vlore", name: { sq: "Vlorë", en: "Vlora", de: "Vlora" } },
  { slug: "sarande", name: { sq: "Sarandë", en: "Saranda", de: "Saranda" } },
  { slug: "himare", name: { sq: "Himarë", en: "Himara", de: "Himara" } },
  { slug: "shkoder", name: { sq: "Shkodër", en: "Shkodra", de: "Shkodra" } },
  { slug: "korce", name: { sq: "Korçë", en: "Korça", de: "Korça" } },
];

/** Zones shown in the homepage "Zonat" section (Figma shows four cards). */
export const homepageZones: ZoneSlug[] = ["tirana", "durres", "tale", "vlore"];

const placeholderDescription: Localized = {
  sq: "Përshkrim i përkohshëm i pronës. Vendndodhja, qasja, dokumentacioni dhe potenciali i zhvillimit do të shtohen këtu.",
  en: "Placeholder property description. Location, access, documentation and development potential will go here.",
  de: "Platzhalterbeschreibung der Immobilie. Lage, Zugang, Unterlagen und Entwicklungspotenzial folgen hier.",
};

export const properties: Property[] = [
  {
    slug: "toke-ne-tale",
    reference: "WRE-001",
    title: { sq: "Tokë pranë detit në Tale", en: "Seaside land in Tale", de: "Grundstück am Meer in Tale" },
    description: placeholderDescription,
    zone: "tale",
    type: "land",
    status: "sale",
    areaSqm: 12000,
    price: null,
    lat: 41.868,
    lng: 19.585,
    featured: true,
    municipality: "Lezhë",
    feature: "seaView",
    updatedAt: "2026-05-04",
    imageCount: 5,
  },
  {
    slug: "truall-ne-farke",
    reference: "WRE-002",
    title: { sq: "Truall në Farkë, Tiranë", en: "Building plot in Farka, Tirana", de: "Baugrundstück in Farka, Tirana" },
    description: placeholderDescription,
    zone: "tirana",
    type: "land",
    status: "sale",
    areaSqm: 2400,
    price: 180000,
    lat: 41.302,
    lng: 19.878,
    featured: true,
    municipality: "Tiranë",
    feature: "buildingPermit",
    updatedAt: "2026-06-12",
    imageCount: 4,
  },
  {
    slug: "toke-ne-golem",
    reference: "WRE-003",
    title: { sq: "Tokë në Golem, Durrës", en: "Land in Golem, Durrës", de: "Grundstück in Golem, Durrës" },
    description: placeholderDescription,
    zone: "durres",
    type: "land",
    status: "sale",
    areaSqm: 1500,
    price: 150000,
    lat: 41.244,
    lng: 19.518,
    featured: true,
    municipality: "Kavajë",
    feature: "seaView",
    updatedAt: "2026-07-01",
    imageCount: 5,
  },
  {
    slug: "toke-bregdetare-vlore",
    reference: "WRE-004",
    title: { sq: "Tokë bregdetare në Vlorë", en: "Coastal land in Vlora", de: "Küstengrundstück in Vlora" },
    description: placeholderDescription,
    zone: "vlore",
    type: "land",
    status: "sale",
    areaSqm: 5000,
    price: 320000,
    lat: 40.425,
    lng: 19.49,
    featured: false,
    municipality: "Vlorë",
    feature: "seaView",
    updatedAt: "2026-04-18",
    imageCount: 6,
  },
  {
    slug: "toke-ne-kodrat-e-sarandes",
    reference: "WRE-005",
    title: { sq: "Tokë në kodrat e Sarandës", en: "Hillside land in Saranda", de: "Hanggrundstück in Saranda" },
    description: placeholderDescription,
    zone: "sarande",
    type: "land",
    status: "sale",
    areaSqm: 3200,
    price: 210000,
    lat: 39.878,
    lng: 20.012,
    featured: false,
    municipality: "Sarandë",
    feature: "cityView",
    updatedAt: "2026-03-22",
    imageCount: 4,
  },
  {
    slug: "parcele-ne-himare",
    reference: "WRE-006",
    title: { sq: "Parcelë për vilë në Himarë", en: "Villa plot in Himara", de: "Villengrundstück in Himara" },
    description: placeholderDescription,
    zone: "himare",
    type: "residential",
    status: "sale",
    areaSqm: 600,
    price: 95000,
    lat: 40.102,
    lng: 19.745,
    featured: false,
    municipality: "Himarë",
    feature: "seaView",
    updatedAt: "2026-08-09",
    imageCount: 5,
  },
  {
    slug: "toke-ne-shkoder",
    reference: "WRE-007",
    title: { sq: "Tokë bujqësore në Shkodër", en: "Agricultural land in Shkodra", de: "Agrarland in Shkodra" },
    description: placeholderDescription,
    zone: "shkoder",
    type: "land",
    status: "sale",
    areaSqm: 8000,
    price: 120000,
    lat: 42.068,
    lng: 19.512,
    featured: false,
    municipality: "Shkodër",
    feature: "flatTerrain",
    updatedAt: "2026-02-14",
    imageCount: 3,
  },
  {
    slug: "ambient-komercial-korce",
    reference: "WRE-008",
    title: { sq: "Ambient komercial në Korçë", en: "Commercial space in Korça", de: "Gewerbefläche in Korça" },
    description: placeholderDescription,
    zone: "korce",
    type: "commercial",
    status: "rent",
    areaSqm: 900,
    price: null,
    lat: 40.618,
    lng: 20.781,
    featured: false,
    municipality: "Korçë",
    feature: "utilities",
    updatedAt: "2026-09-02",
    imageCount: 4,
  },
  ...generatedListings(),
];

/**
 * Extra placeholder listings so the list page has enough to paginate (10 per page).
 * Compact rows instead of full objects; titles are built from the type and the place.
 */
function generatedListings(): Property[] {
  type Row = [
    place: string,
    zone: ZoneSlug,
    type: PropertyType,
    status: PropertyStatus,
    areaSqm: number,
    price: number | null,
    lat: number,
    lng: number,
    municipality: string,
    feature: PropertyFeature,
    updatedAt: string,
  ];
  const rows: Row[] = [
    ["Shëngjin", "tale", "land", "sale", 8400, 260000, 41.814, 19.594, "Lezhë", "seaView", "2026-09-10"],
    ["Kune-Vain", "tale", "land", "sale", 15000, null, 41.79, 19.59, "Lezhë", "flatTerrain", "2026-08-28"],
    ["Ishëm", "tale", "residential", "sale", 750, 68000, 41.55, 19.58, "Durrës", "seaView", "2026-07-19"],
    ["Kamëz", "tirana", "residential", "sale", 480, 85000, 41.381, 19.76, "Kamëz", "utilities", "2026-09-15"],
    ["Petrelë", "tirana", "land", "sale", 6200, 140000, 41.255, 19.866, "Tiranë", "cityView", "2026-06-30"],
    ["Rinas", "tirana", "commercial", "rent", 2000, null, 41.415, 19.72, "Kavajë", "roadAccess", "2026-08-03"],
    ["Qerret", "durres", "residential", "sale", 520, 110000, 41.207, 19.492, "Kavajë", "seaView", "2026-09-20"],
    ["Shkozet", "durres", "commercial", "sale", 1800, 390000, 41.33, 19.47, "Durrës", "roadAccess", "2026-05-27"],
    ["Radhimë", "vlore", "land", "sale", 2600, 240000, 40.37, 19.49, "Vlorë", "seaView", "2026-07-08"],
    ["Orikum", "vlore", "residential", "sale", 900, 130000, 40.325, 19.47, "Vlorë", "seaView", "2026-04-02"],
    ["Ksamil", "sarande", "land", "sale", 1100, 280000, 39.77, 20.0, "Sarandë", "seaView", "2026-09-05"],
    ["Lukovë", "sarande", "land", "sale", 4300, 175000, 39.98, 19.91, "Sarandë", "seaView", "2026-03-11"],
    ["Dhërmi", "himare", "land", "sale", 2100, 420000, 40.153, 19.64, "Himarë", "seaView", "2026-08-17"],
    ["Velipojë", "shkoder", "land", "sale", 3600, 90000, 41.87, 19.43, "Shkodër", "flatTerrain", "2026-06-05"],
    ["Vau i Dejës", "shkoder", "commercial", "rent", 650, null, 42.01, 19.63, "Vau i Dejës", "roadAccess", "2026-01-29"],
    ["Voskopojë", "korce", "residential", "sale", 1200, 72000, 40.633, 20.59, "Korçë", "buildingPermit", "2026-07-24"],
  ];
  const titles: Record<PropertyType, Localized<(place: string) => string>> = {
    land: { sq: (p) => `Tokë në ${p}`, en: (p) => `Land in ${p}`, de: (p) => `Grundstück in ${p}` },
    residential: {
      sq: (p) => `Parcelë banimi në ${p}`,
      en: (p) => `Residential plot in ${p}`,
      de: (p) => `Wohngrundstück in ${p}`,
    },
    commercial: {
      sq: (p) => `Ambient komercial në ${p}`,
      en: (p) => `Commercial space in ${p}`,
      de: (p) => `Gewerbefläche in ${p}`,
    },
  };
  return rows.map(([place, zone, type, status, areaSqm, price, lat, lng, municipality, feature, updatedAt], i) => {
    const id = String(i + 9).padStart(3, "0");
    return {
      slug: `prone-${id}`,
      reference: `WRE-${id}`,
      title: { sq: titles[type].sq(place), en: titles[type].en(place), de: titles[type].de(place) },
      description: placeholderDescription,
      zone,
      type,
      status,
      areaSqm,
      price,
      lat,
      lng,
      featured: false,
      municipality,
      feature,
      updatedAt,
      imageCount: 4,
    };
  });
}

export const propertyTypes: PropertyType[] = ["land", "residential", "commercial"];
export const propertyStatuses: PropertyStatus[] = ["sale", "rent"];
export const areaRanges: AreaRange[] = ["lt1000", "1000-5000", "gt5000"];
export const priceRanges: PriceRange[] = ["lt100k", "100k-250k", "gt250k"];
export const sortOrders: SortOrder[] = ["newest", "priceAsc", "priceDesc", "areaDesc"];

export function getProperty(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
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
  sort?: string;
};

/** Filters and sorts the placeholder list by the search query params. Unknown values are ignored. */
export function filterProperties(filters: PropertyFilters): Property[] {
  const results = properties.filter((p) => {
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
export function getSimilarProperties(property: Property, count = 3): Property[] {
  const score = (p: Property) => (p.zone === property.zone ? 2 : 0) + (p.type === property.type ? 1 : 0);
  return properties
    .filter((p) => p.slug !== property.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}
