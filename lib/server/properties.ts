import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import type { Locale } from "@/i18n/config";
import { readNearby } from "@/data/properties";
import { lookupNearbyPlaces } from "@/lib/nearby-lookup";
import { PROPERTIES_TAG } from "./catalog";
import { ApiError, badRequest, notFound } from "./errors";
import type { PropertyInput, PropertyPatch } from "./schemas";
import { PROPERTY_IMAGES_BUCKET, supabaseAdmin } from "./supabase";

/** Admin data access for listings (tables from supabase/migrations). */

export type AdminPropertyImage = { id: string; url: string; width: number; height: number; position: number };

export type AdminProperty = Omit<PropertyInput, "translations"> & {
  id: string;
  slug: string;
  reference: string;
  translations: Record<Locale, { title: string; description: string }>;
  images: AdminPropertyImage[];
  /** When the close-by places were last looked up (null: never, or before the migration). */
  nearbyCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// "*": includes "nearby" once migration 20261005120000_nearby.sql has run, and still works before.
const SELECT = `
  *,
  property_translations ( locale, title, description ),
  property_images ( id, storage_path, width, height, position )
`;

type Row = {
  id: string;
  slug: string;
  reference: string;
  zone: string;
  type: AdminProperty["type"];
  status: AdminProperty["status"];
  area_sqm: number;
  price: number | null;
  lat: number;
  lng: number;
  municipality: string;
  feature: AdminProperty["feature"];
  nearby?: unknown;
  nearby_distances?: unknown;
  nearby_checked_at?: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  property_translations: { locale: Locale; title: string; description: string }[];
  property_images: { id: string; storage_path: string; width: number; height: number; position: number }[];
};

export function publicImageUrl(path: string): string {
  return supabaseAdmin().storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toProperty(row: Row): AdminProperty {
  const empty = { title: "", description: "" };
  const translations = { sq: empty, en: empty, de: empty };
  for (const t of row.property_translations) translations[t.locale] = { title: t.title, description: t.description };
  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    zone: row.zone,
    type: row.type,
    status: row.status,
    areaSqm: Number(row.area_sqm),
    price: row.price === null ? null : Number(row.price),
    lat: row.lat,
    lng: row.lng,
    municipality: row.municipality,
    feature: row.feature,
    ...readNearby(row.nearby, row.nearby_distances),
    featured: row.featured,
    published: row.published,
    translations,
    images: row.property_images
      .toSorted((a, b) => a.position - b.position)
      .map((img) => ({ id: img.id, url: publicImageUrl(img.storage_path), width: img.width, height: img.height, position: img.position })),
    nearbyCheckedAt: row.nearby_checked_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Postgres error codes raised by the tables and functions, mapped to API errors. */
export function dbError(error: { code?: string; message: string }): Error {
  switch (error.code) {
    case "P0002":
      return notFound("Property not found.");
    case "22023":
    case "23514":
    case "22P02":
      return badRequest("Some values are not allowed.");
    case "23505":
      return new ApiError(409, "conflict", "That already exists.");
    default:
      return Object.assign(new Error(`Database error: ${error.message}`), { cause: error });
  }
}

/** URL slug from the Albanian title: "Parcelë në Tale" -> "parcele-ne-tale". */
export function slugify(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "prone";
}

function toDbData(input: PropertyInput | (Omit<PropertyInput, "translations"> & { translations: PropertyPatch["translations"] })) {
  return {
    zone: input.zone,
    type: input.type,
    status: input.status,
    area_sqm: input.areaSqm,
    price: input.price,
    lat: input.lat,
    lng: input.lng,
    municipality: input.municipality,
    feature: input.feature,
    nearby: input.nearby,
    // Only distances for places that are ticked.
    nearby_distances: Object.fromEntries(
      Object.entries(input.nearbyDistances ?? {}).filter(([a]) => input.nearby?.includes(a as (typeof input.nearby)[number])),
    ),
    featured: input.featured,
    published: input.published,
    translations: input.translations ?? {},
  };
}

// After any change: drop the cached listings (next visitor gets fresh data, not a stale
// copy) and the statically rendered pages built from them.
export function refreshSite() {
  revalidateTag(PROPERTIES_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/**
 * Looks up the nearest real places around the pin (lib/nearby-lookup.ts) and stores them on
 * the listing. Runs after the admin's request has been answered, so a slow or busy OpenStreetMap
 * server never holds up saving; if the lookup fails the stored places stay as they were and
 * `npm run nearby:refresh` can fill them in later. Only writes if the pin hasn't moved since.
 */
function refreshNearbyPlacesLater(id: string, lat: number, lng: number) {
  after(async () => {
    try {
      const places = await lookupNearbyPlaces(lat, lng);
      const { error } = await supabaseAdmin()
        .from("properties")
        .update({ nearby_places: places, nearby_checked_at: new Date().toISOString() })
        .eq("id", id)
        .eq("lat", lat)
        .eq("lng", lng);
      if (error) throw error;
      refreshSite();
    } catch (error) {
      console.error("Close-by places lookup failed for property", id, error);
    }
  });
}

export async function listProperties({ page, pageSize, q }: { page: number; pageSize: number; q?: string }) {
  let query = supabaseAdmin()
    .from("properties")
    .select(SELECT, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (q) {
    // Only letters, digits, spaces and dashes reach the filter string (no PostgREST syntax).
    const term = q.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
    if (term) query = query.or(`reference.ilike.%${term}%,slug.ilike.%${slugify(term)}%`);
  }
  const { data, error, count } = await query.returns<Row[]>();
  if (error) throw dbError(error);
  return { items: data.map(toProperty), page, pageSize, total: count ?? 0 };
}

export async function getProperty(id: string): Promise<AdminProperty> {
  const { data, error } = await supabaseAdmin().from("properties").select(SELECT).eq("id", id).maybeSingle<Row>();
  if (error) throw dbError(error);
  if (!data) throw notFound("Property not found.");
  return toProperty(data);
}

export async function createProperty(input: PropertyInput): Promise<AdminProperty> {
  const { data, error } = await supabaseAdmin().rpc("admin_save_property", {
    p_id: null,
    p_data: { ...toDbData(input), slug_base: slugify(input.translations.sq.title) },
  });
  if (error) throw dbError(error);
  refreshSite();
  refreshNearbyPlacesLater(data as string, input.lat, input.lng);
  return getProperty(data as string);
}

export async function updateProperty(id: string, patch: PropertyPatch): Promise<AdminProperty> {
  // Merge onto the current values, so the function always receives a complete row.
  const current = await getProperty(id);
  const merged = { ...current, ...patch, translations: patch.translations };
  const { error } = await supabaseAdmin().rpc("admin_save_property", { p_id: id, p_data: toDbData(merged) });
  if (error) throw dbError(error);
  refreshSite();
  // Look the places up again when the pin moved, or if it never worked for this listing.
  if (merged.lat !== current.lat || merged.lng !== current.lng || !current.nearbyCheckedAt) {
    refreshNearbyPlacesLater(id, merged.lat, merged.lng);
  }
  return getProperty(id);
}

export async function deleteProperty(id: string): Promise<void> {
  const db = supabaseAdmin();
  const { data: images, error: imagesError } = await db.from("property_images").select("storage_path").eq("property_id", id);
  if (imagesError) throw dbError(imagesError);

  const { data: deleted, error } = await db.from("properties").delete().eq("id", id).select("id");
  if (error) throw dbError(error);
  if (!deleted.length) throw notFound("Property not found.");

  await removeFiles(images.map((i) => i.storage_path));
  refreshSite();
}

/** Deletes stored photos. A failure only leaves orphaned files, so it's logged, not thrown. */
export async function removeFiles(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const { error } = await supabaseAdmin().storage.from(PROPERTY_IMAGES_BUCKET).remove(paths);
  if (error) console.error("[storage] could not remove files", paths, error);
}
