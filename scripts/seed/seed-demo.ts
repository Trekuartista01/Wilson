// Loads the demo listings into Supabase, or removes them again.
//   npm run seed:demo              add the demo listings (skips ones already there)
//   npm run seed:demo -- --clear   delete the demo listings and their photos
//
// Development only: refuses to run with NODE_ENV=production. The project has one Supabase
// database, so demo listings are visible on any deployment until cleared: run --clear
// before launch (see docs/PROJECT_BRIEF.md).

import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { demoProperties } from "./demo-properties";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data with NODE_ENV=production.");
  process.exit(1);
}

loadEnvConfig(process.cwd(), true);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const slugs = demoProperties.map((p) => p.slug);

async function clear() {
  const { data: rows, error } = await db.from("properties").select("id, property_images(storage_path)").in("slug", slugs);
  if (error) throw error;
  const paths = rows.flatMap((r) => r.property_images.map((i) => i.storage_path));
  if (paths.length) {
    const { error: storageError } = await db.storage.from("property-images").remove(paths);
    if (storageError) throw storageError;
  }
  const { error: deleteError } = await db.from("properties").delete().in("slug", slugs);
  if (deleteError) throw deleteError;
  console.log(`Removed ${rows.length} demo listings and ${paths.length} photos.`);
}

async function seed() {
  const { data: existing, error } = await db.from("properties").select("slug").in("slug", slugs);
  if (error) throw error;
  const have = new Set(existing.map((r) => r.slug));

  // Oldest first, so the list page (newest first) shows them in the file's order.
  let added = 0;
  for (const p of [...demoProperties].reverse()) {
    if (have.has(p.slug)) continue;
    const { error: saveError } = await db.rpc("admin_save_property", {
      p_id: null,
      p_data: {
        slug_base: p.slug,
        zone: p.zone,
        type: p.type,
        status: p.status,
        area_sqm: p.areaSqm,
        price: p.price,
        lat: p.lat,
        lng: p.lng,
        municipality: p.municipality,
        feature: p.feature,
        featured: p.featured,
        published: true,
        translations: {
          sq: { title: p.title.sq, description: p.description.sq },
          en: { title: p.title.en, description: p.description.en },
          de: { title: p.title.de, description: p.description.de },
        },
      },
    });
    if (saveError) throw saveError;
    added++;
  }
  console.log(`Added ${added} demo listings (${have.size} were already there).`);
}

(process.argv.includes("--clear") ? clear() : seed()).catch((error) => {
  console.error("Seeding failed:", error.message ?? error);
  process.exit(1);
});
