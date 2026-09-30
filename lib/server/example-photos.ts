import "server-only";
import type { Property, PropertyImage } from "@/data/properties";

// DEVELOPMENT ONLY. Stand-in photos from public/images/listings, so the site can be previewed
// with pictures instead of gray boxes. A listing with real photos (uploaded in the admin panel)
// is left alone, and none of this runs in a production build. To stop using them, delete this
// file, its call in lib/server/catalog.ts and the public/images/listings folder.

const photos: Record<string, PropertyImage> = {
  farke: { url: "/images/listings/farke.jpg", width: 4000, height: 3000 },
  golem: { url: "/images/listings/golem.jpg", width: 3977, height: 2651 },
  himare: { url: "/images/listings/himare.jpg", width: 2500, height: 2894 },
  korce: { url: "/images/listings/korce.jpg", width: 5472, height: 3648 },
  sarande: { url: "/images/listings/sarande.jpg", width: 4032, height: 2268 },
  shengjin: { url: "/images/listings/shengjin.jpg", width: 6015, height: 3669 },
  shkoder: { url: "/images/listings/shkoder.jpg", width: 4000, height: 2250 },
  tale: { url: "/images/listings/tale.jpg", width: 5039, height: 2498 },
  vlore: { url: "/images/listings/vlore.jpg", width: 4000, height: 5602 },
};
const names = Object.keys(photos);

/** Zones with no photo of their own borrow a nearby place's. */
const zonePhoto: Partial<Record<Property["zone"], string>> = {
  tirana: "farke",
  durres: "golem",
  vain: "shengjin",
  kune: "shengjin",
};

function mainPhoto(p: Property): string {
  // A place named in the slug wins ("truall-ne-farke" -> farke), then the zone, then a
  // stable pick from the slug so the same listing always gets the same photo.
  const named = names.find((name) => p.slug.includes(name));
  if (named) return named;
  if (p.zone in photos) return p.zone;
  const borrowed = zonePhoto[p.zone];
  if (borrowed) return borrowed;
  let hash = 0;
  for (const ch of p.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return names[hash % names.length];
}

/** Gives every listing without photos three stand-ins: its own place first, then two others. */
export function withExamplePhotos(list: Property[]): Property[] {
  return list.map((p) => {
    if (p.images.length) return p;
    const first = names.indexOf(mainPhoto(p));
    const picks = [0, 1, 2].map((k) => photos[names[(first + k) % names.length]]);
    return { ...p, images: picks };
  });
}
