import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/config";
import { zones, type Localized, type Property } from "@/data/properties";
import { supabasePublicEnv } from "./env";
import { withExamplePhotos } from "./example-photos";

/**
 * What visitors see: published listings, read with the publishable key. Row level security
 * only lets that key read published rows, so an unpublished listing can't leak here even by
 * mistake. Cached for an hour and refreshed at once when the admin changes anything
 * (revalidateTag(PROPERTIES_TAG) in lib/server/properties.ts).
 */

export const PROPERTIES_TAG = "properties";
const BUCKET = "property-images";

let client: SupabaseClient | undefined;
function publicClient(): SupabaseClient {
  if (!client) {
    const { url, publishableKey } = supabasePublicEnv();
    client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

type Row = {
  slug: string;
  reference: string;
  zone: string;
  type: Property["type"];
  status: Property["status"];
  area_sqm: number;
  price: number | null;
  lat: number;
  lng: number;
  municipality: string;
  feature: Property["feature"];
  featured: boolean;
  updated_at: string;
  property_translations: { locale: Locale; title: string; description: string }[];
  property_images: { storage_path: string; width: number; height: number; position: number }[];
};

const knownZones = new Set<string>(zones.map((z) => z.slug));

function toProperty(row: Row): Property {
  const title: Localized = { sq: "", en: "", de: "" };
  const description: Localized = { sq: "", en: "", de: "" };
  for (const t of row.property_translations) {
    title[t.locale] = t.title;
    description[t.locale] = t.description;
  }
  const storage = publicClient().storage.from(BUCKET);
  return {
    slug: row.slug,
    reference: row.reference,
    title,
    description,
    zone: row.zone as Property["zone"],
    type: row.type,
    status: row.status,
    areaSqm: Number(row.area_sqm),
    price: row.price === null ? null : Number(row.price),
    lat: row.lat,
    lng: row.lng,
    featured: row.featured,
    municipality: row.municipality,
    feature: row.feature,
    updatedAt: row.updated_at,
    images: row.property_images
      .toSorted((a, b) => a.position - b.position)
      .map((img) => ({ url: storage.getPublicUrl(img.storage_path).data.publicUrl, width: img.width, height: img.height })),
  };
}

async function fetchPublishedProperties(): Promise<Property[]> {
  const { data, error } = await publicClient()
    .from("properties")
    .select(
      `slug, reference, zone, type, status, area_sqm, price, lat, lng, municipality, feature, featured, updated_at,
       property_translations ( locale, title, description ),
       property_images ( storage_path, width, height, position )`,
    )
    .eq("published", true) // RLS enforces this too; kept explicit for clarity
    .order("updated_at", { ascending: false })
    .returns<Row[]>();
  if (error) throw Object.assign(new Error(`Could not load listings: ${error.message}`), { cause: error });

  return data
    .filter((row) => {
      // The admin API only accepts known zones; skip anything else rather than break a page.
      if (knownZones.has(row.zone)) return true;
      console.error(`[catalog] listing ${row.slug} has unknown zone "${row.zone}", skipped`);
      return false;
    })
    .map(toProperty);
}

/**
 * All published listings, newest first. The catalog is small enough to filter in memory.
 * Production: cached, refreshed hourly and immediately after any admin API change. Changes
 * made outside the API (seed script, Supabase dashboard) show up within the hour.
 * Development: always fresh, so seeding or editing in Supabase shows up on reload, and
 * listings without photos get stand-ins from public/images/listings (example-photos.ts).
 */
export const getPublishedProperties =
  process.env.NODE_ENV === "development"
    ? async () => withExamplePhotos(await fetchPublishedProperties())
    : unstable_cache(fetchPublishedProperties, ["published-properties"], {
        tags: [PROPERTIES_TAG],
        revalidate: 3600,
      });

export async function getPublishedProperty(slug: string): Promise<Property | undefined> {
  return (await getPublishedProperties()).find((p) => p.slug === slug);
}
