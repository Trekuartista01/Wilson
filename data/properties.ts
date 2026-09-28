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
  },
];

export const propertyTypes: PropertyType[] = ["land", "residential", "commercial"];
export const propertyStatuses: PropertyStatus[] = ["sale", "rent"];
export const areaRanges: AreaRange[] = ["lt1000", "1000-5000", "gt5000"];

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

export type PropertyFilters = {
  zone?: string;
  type?: string;
  area?: string;
  status?: string;
};

/** Filters the placeholder list by the search bar's query params. Unknown values are ignored. */
export function filterProperties(filters: PropertyFilters): Property[] {
  return properties.filter((p) => {
    if (filters.zone && zones.some((z) => z.slug === filters.zone) && p.zone !== filters.zone) return false;
    if (filters.type && propertyTypes.includes(filters.type as PropertyType) && p.type !== filters.type) return false;
    if (filters.status && propertyStatuses.includes(filters.status as PropertyStatus) && p.status !== filters.status) return false;
    if (filters.area && areaRanges.includes(filters.area as AreaRange) && !inAreaRange(p.areaSqm, filters.area as AreaRange)) return false;
    return true;
  });
}
