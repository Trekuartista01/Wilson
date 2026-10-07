import "server-only";
import type { Property, PropertyImage } from "@/data/properties";

// PREVIEW ONLY. Stand-in photos from public/images/listings, so the site can be shown with
// pictures instead of gray boxes. A listing with real photos (uploaded in the admin panel) is
// left alone. Runs in production too for now (team preview, 2026-10-07): remove before launch
// by deleting this file, its call in lib/server/catalog.ts and the public/images/listings folder.
//
// Photos (2026-10-06): picked from 50 beach + 50 land Unsplash photos (Examples/new images,
// credits in photo-credits.txt there), resized to 2000 px WebP. Coastal listings get two beach
// photos and one land photo, inland ones (Tiranë, Korçë, Shkodër town) two land and one beach;
// every listing has its own cover.

const photo = (file: string, width: number, height: number): PropertyImage => ({
  url: `/images/listings/${file}`,
  width,
  height,
});

const photos: Record<string, PropertyImage> = {
  "beach-02": photo("beach-02.webp", 2000, 1499),
  "beach-03": photo("beach-03.webp", 2000, 1333),
  "beach-07": photo("beach-07.webp", 2000, 1333),
  "beach-10": photo("beach-10.webp", 2000, 1500),
  "beach-11": photo("beach-11.webp", 2000, 1499),
  "beach-12": photo("beach-12.webp", 2000, 1311),
  "beach-13": photo("beach-13.webp", 2000, 1333),
  "beach-14": photo("beach-14.webp", 2000, 1311),
  "beach-21": photo("beach-21.webp", 2000, 1500),
  "beach-22": photo("beach-22.webp", 2000, 1500),
  "beach-24": photo("beach-24.webp", 2000, 1333),
  "beach-26": photo("beach-26.webp", 2000, 1333),
  "beach-29": photo("beach-29.webp", 2000, 1600),
  "beach-30": photo("beach-30.webp", 2000, 1125),
  "beach-31": photo("beach-31.webp", 2000, 1500),
  "beach-33": photo("beach-33.webp", 2000, 1333),
  "beach-34": photo("beach-34.webp", 2000, 1500),
  "beach-35": photo("beach-35.webp", 2000, 1333),
  "beach-38": photo("beach-38.webp", 2000, 1284),
  "beach-39": photo("beach-39.webp", 2000, 1125),
  "beach-42": photo("beach-42.webp", 2000, 1500),
  "beach-45": photo("beach-45.webp", 2000, 1500),
  "beach-46": photo("beach-46.webp", 2000, 1333),
  "beach-49": photo("beach-49.webp", 2000, 1333),
  "beach-50": photo("beach-50.webp", 2000, 1333),
  "land-01": photo("land-01.webp", 2000, 1250),
  "land-02": photo("land-02.webp", 2000, 1499),
  "land-03": photo("land-03.webp", 2000, 1125),
  "land-04": photo("land-04.webp", 2000, 1200),
  "land-05": photo("land-05.webp", 2000, 1123),
  "land-11": photo("land-11.webp", 2000, 1331),
  "land-12": photo("land-12.webp", 2000, 1500),
  "land-13": photo("land-13.webp", 2000, 1333),
  "land-14": photo("land-14.webp", 2000, 1333),
  "land-19": photo("land-19.webp", 2000, 1500),
  "land-20": photo("land-20.webp", 2000, 1499),
  "land-21": photo("land-21.webp", 2000, 1313),
  "land-25": photo("land-25.webp", 2000, 1333),
  "land-26": photo("land-26.webp", 2000, 1500),
  "land-30": photo("land-30.webp", 2000, 1333),
  "land-31": photo("land-31.webp", 2000, 1499),
  "land-32": photo("land-32.webp", 2000, 1333),
  "land-35": photo("land-35.webp", 2000, 1125),
  "land-36": photo("land-36.webp", 2000, 1329),
  "land-37": photo("land-37.webp", 2000, 1333),
  "land-38": photo("land-38.webp", 2000, 1500),
  "land-39": photo("land-39.webp", 2000, 1125),
  "land-42": photo("land-42.webp", 2000, 1331),
  "land-45": photo("land-45.webp", 2000, 1333),
};

/** Three photos per demo listing, cover first. */
const byListing: Record<string, string[]> = {
  "parcele-ne-tale": ["beach-35", "land-01", "beach-02"],
  "prone-009": ["beach-10", "land-03", "beach-03"],
  "prone-010": ["beach-13", "land-05", "beach-07"],
  "prone-011": ["beach-21", "land-11", "beach-12"],
  "parcele-ne-golem": ["beach-22", "land-12", "beach-14"],
  "prone-015": ["beach-26", "land-13", "beach-42"],
  "prone-016": ["beach-38", "land-19", "beach-45"],
  "parcele-bregdetare-vlore": ["beach-29", "land-20", "beach-46"],
  "prone-017": ["beach-31", "land-21", "beach-49"],
  "prone-018": ["beach-33", "land-25", "beach-10"],
  "parcele-ne-kodrat-e-sarandes": ["beach-39", "land-26", "beach-11"],
  "prone-019": ["beach-34", "land-31", "beach-13"],
  "prone-020": ["beach-24", "land-32", "beach-21"],
  "parcele-ne-himare": ["beach-11", "land-35", "beach-22"],
  "prone-021": ["beach-50", "land-37", "beach-24"],
  "prone-022": ["beach-30", "land-45", "beach-26"],
  "truall-ne-farke": ["land-04", "beach-29", "land-02"],
  "prone-012": ["land-36", "beach-30", "land-04"],
  "prone-013": ["land-02", "beach-31", "land-14"],
  "prone-014": ["land-38", "beach-33", "land-30"],
  "ambient-komercial-korce": ["land-42", "beach-34", "land-36"],
  "prone-024": ["land-39", "beach-35", "land-38"],
  "parcele-ne-shkoder": ["land-14", "beach-38", "land-39"],
  "prone-023": ["land-30", "beach-39", "land-42"],
};

const keys = Object.keys(photos);

/** Gives every listing without photos three stand-ins: its own set, or a stable pick from the slug. */
export function withExamplePhotos(list: Property[]): Property[] {
  return list.map((p) => {
    if (p.images.length) return p;
    const set = byListing[p.slug];
    if (set) return { ...p, images: set.map((k) => photos[k]) };
    let hash = 0;
    for (const ch of p.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return { ...p, images: [0, 1, 2].map((k) => photos[keys[(hash + k * 7) % keys.length]]) };
  });
}
