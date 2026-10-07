// DEMO LISTINGS for development and design review (not real client listings).
// Loaded into Supabase by `npm run seed:demo`; `npm run seed:demo -- --clear` removes them.
// Photos are left out: demo listings show the gray placeholders.

import type {
  Amenity,
  Localized,
  Property,
  PropertyFeature,
  PropertyStatus,
  PropertyType,
  ZoneSlug,
} from "@/data/properties";

export type DemoProperty = Omit<Property, "images" | "reference" | "updatedAt" | "nearby" | "nearbyDistances" | "nearbyPlaces"> & {
  updatedAt: string;
};

/** Plausible demo distances in metres, so the property page has something to show. */
export const demoDistances: Partial<Record<Amenity, number>> = {
  beach: 400,
  supermarket: 900,
  restaurant: 600,
  hospital: 6000,
  pharmacy: 1500,
  school: 2000,
  cityCentre: 12000,
  publicTransport: 800,
  airport: 35000,
};

/** "Afër" values for the demo listings, a plausible guess from the zone. */
export function demoNearby(p: DemoProperty): Amenity[] {
  const coast: ZoneSlug[] = ["tale", "shengjin", "vain", "kune", "durres", "vlore", "sarande", "himare"];
  const city: ZoneSlug[] = ["tirana", "durres", "vlore", "shkoder", "korce"];
  const near = new Set<Amenity>(["supermarket"]);
  if (coast.includes(p.zone)) ["beach", "restaurant"].forEach((a) => near.add(a as Amenity));
  if (city.includes(p.zone)) ["hospital", "pharmacy", "school", "cityCentre", "publicTransport"].forEach((a) => near.add(a as Amenity));
  if (p.zone === "tirana" || p.zone === "tale" || p.zone === "shengjin") near.add("airport");
  return [...near];
}

const placeholderDescription: Localized = {
  sq: "Përshkrim i përkohshëm i pronës. Vendndodhja, qasja, dokumentacioni dhe potenciali i zhvillimit do të shtohen këtu.",
  en: "Placeholder property description. Location, access, documentation and development potential will go here.",
  de: "Platzhalterbeschreibung der Immobilie. Lage, Zugang, Unterlagen und Entwicklungspotenzial folgen hier.",
};

export const demoProperties: DemoProperty[] = [
  {
    slug: "parcele-ne-tale",
    title: { sq: "Parcelë pranë detit në Tale", en: "Seaside land in Tale", de: "Grundstück am Meer in Tale" },
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
  },
  {
    slug: "truall-ne-farke",
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
  },
  {
    slug: "parcele-ne-golem",
    title: { sq: "Parcelë në Golem, Durrës", en: "Land in Golem, Durrës", de: "Grundstück in Golem, Durrës" },
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
  },
  {
    slug: "parcele-bregdetare-vlore",
    title: { sq: "Parcelë bregdetare në Vlorë", en: "Coastal land in Vlora", de: "Küstengrundstück in Vlora" },
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
  },
  {
    slug: "parcele-ne-kodrat-e-sarandes",
    title: { sq: "Parcelë në kodrat e Sarandës", en: "Hillside land in Saranda", de: "Hanggrundstück in Saranda" },
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
  },
  {
    slug: "parcele-ne-himare",
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
  },
  {
    slug: "parcele-ne-shkoder",
    title: { sq: "Parcelë bujqësore në Shkodër", en: "Agricultural land in Shkodra", de: "Agrarland in Shkodra" },
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
  },
  {
    slug: "ambient-komercial-korce",
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
  },
  ...generatedListings(),
];

/**
 * Extra placeholder listings so the list page has enough to paginate (10 per page).
 * Compact rows instead of full objects; titles are built from the type and the place.
 */
function generatedListings(): DemoProperty[] {
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
    land: { sq: (p) => `Parcelë në ${p}`, en: (p) => `Land in ${p}`, de: (p) => `Grundstück in ${p}` },
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
    };
  });
}
