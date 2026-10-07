import type { Amenity, NearbyPlace } from "@/data/properties";

/**
 * Finds the nearest real place of each kind around a pin (beach, supermarket, restaurant,
 * hospital, pharmacy, school, town centre, bus stop, airport) on OpenStreetMap, through the
 * public Overpass API (no key). Used when a listing is saved (lib/server/properties.ts) and by
 * `npm run nearby:refresh`; the result is stored on the listing, so pages never wait on it.
 * Distances are in a straight line. Kept free of server-only imports so the script can use it.
 */

// Public Overpass servers, tried in turn: they are often busy, so one failing is normal.
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/** What counts as each kind of place, and how far out to look for it (metres). */
const KINDS: { amenity: Amenity; radius: number; filter: string; nodesOnly?: boolean }[] = [
  { amenity: "beach", radius: 10_000, filter: '["natural"="beach"]' },
  { amenity: "supermarket", radius: 5_000, filter: '["shop"~"^(supermarket|convenience|mall)$"]' },
  { amenity: "restaurant", radius: 3_000, filter: '["amenity"="restaurant"]' },
  { amenity: "hospital", radius: 30_000, filter: '["amenity"~"^(hospital|clinic)$"]' },
  { amenity: "pharmacy", radius: 10_000, filter: '["amenity"="pharmacy"]' },
  { amenity: "school", radius: 10_000, filter: '["amenity"="school"]' },
  { amenity: "cityCentre", radius: 30_000, filter: '["place"~"^(city|town)$"]', nodesOnly: true },
  { amenity: "publicTransport", radius: 2_000, filter: '["highway"="bus_stop"]', nodesOnly: true },
  { amenity: "airport", radius: 120_000, filter: '["aeroway"="aerodrome"]["iata"]' },
];

type Element = {
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function query(lat: number, lng: number): string {
  const parts = KINDS.map((k) => `${k.nodesOnly ? "node" : "nwr"}(around:${k.radius},${lat},${lng})${k.filter};`);
  return `[out:json][timeout:60];(${parts.join("")});out center tags;`;
}

function kindOf(tags: Record<string, string>): Amenity | null {
  if (tags.natural === "beach") return "beach";
  if (/^(supermarket|convenience|mall)$/.test(tags.shop ?? "")) return "supermarket";
  if (tags.amenity === "restaurant") return "restaurant";
  if (tags.amenity === "hospital" || tags.amenity === "clinic") return "hospital";
  if (tags.amenity === "pharmacy") return "pharmacy";
  if (tags.amenity === "school") return "school";
  if (tags.place === "city" || tags.place === "town") return "cityCentre";
  if (tags.highway === "bus_stop") return "publicTransport";
  if (tags.aeroway === "aerodrome" && tags.iata) return "airport";
  return null;
}

/** Great-circle distance in metres. */
export function distanceMetres(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

/** The nearest place of each kind in an Overpass answer. */
export function nearestPlaces(lat: number, lng: number, elements: Element[]): NearbyPlace[] {
  const best = new Map<Amenity, NearbyPlace>();
  for (const el of elements) {
    const tags = el.tags ?? {};
    const amenity = kindOf(tags);
    const pLat = el.lat ?? el.center?.lat;
    const pLng = el.lon ?? el.center?.lon;
    if (!amenity || pLat === undefined || pLng === undefined) continue;
    const metres = Math.round(distanceMetres(lat, lng, pLat, pLng));
    const current = best.get(amenity);
    if (current && current.metres <= metres) continue;
    const names: NearbyPlace["names"] = {};
    for (const l of ["sq", "en", "de"] as const) if (tags[`name:${l}`]) names[l] = tags[`name:${l}`];
    best.set(amenity, { amenity, name: tags.name ?? null, names, lat: pLat, lng: pLng, metres });
  }
  return [...best.values()];
}

/**
 * Looks the places up, trying each Overpass server until one answers. Throws if none does
 * (the caller keeps whatever was stored before).
 */
export async function lookupNearbyPlaces(lat: number, lng: number, timeoutMs = 60_000): Promise<NearbyPlace[]> {
  const body = new URLSearchParams({ data: query(lat, lng) });
  let lastError: unknown;
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body,
        headers: { "User-Agent": "WilsonRealEstate/1.0 (property listings)", Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const json = (await response.json()) as { elements?: Element[] };
      if (!Array.isArray(json.elements)) throw new Error("Overpass: unexpected answer");
      return nearestPlaces(lat, lng, json.elements);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Overpass lookup failed");
}
