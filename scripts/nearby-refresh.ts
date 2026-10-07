// Looks up the nearest real places (beach, supermarket, hospital, town, airport...) for the
// listings on OpenStreetMap and stores them (properties.nearby_places). Saving a listing in the
// admin does this too; this script fills in existing listings, or retries ones that failed.
//   npm run nearby:refresh           listings that have never been looked up
//   npm run nearby:refresh -- --all  every listing again
//
// Needs migration 20261006120000_nearby_places.sql. The public Overpass servers are often busy:
// each listing gets a few tries with a pause in between, so a run can take a few minutes.

import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { lookupNearbyPlaces } from "../lib/nearby-lookup";

loadEnvConfig(process.cwd(), true);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const all = process.argv.includes("--all");
const ATTEMPTS = 4;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  let query = db.from("properties").select("id, slug, lat, lng").order("created_at");
  if (!all) query = query.is("nearby_checked_at", null);
  const { data: rows, error } = await query;
  if (error) throw error;
  console.log(`${rows.length} listing(s) to look up.`);

  let done = 0;
  for (const row of rows) {
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      try {
        const places = await lookupNearbyPlaces(row.lat, row.lng, 90_000);
        const { error: updateError } = await db
          .from("properties")
          .update({ nearby_places: places, nearby_checked_at: new Date().toISOString() })
          .eq("id", row.id);
        if (updateError) throw updateError;
        console.log(`✓ ${row.slug}: ${places.map((p) => `${p.amenity} ${p.metres} m`).join(", ") || "nothing found"}`);
        done++;
        break;
      } catch (e) {
        console.warn(`  ${row.slug}: try ${attempt}/${ATTEMPTS} failed (${e instanceof Error ? e.message : e})`);
        if (attempt < ATTEMPTS) await sleep(15_000 * attempt);
      }
    }
    // Be polite to the shared servers between listings.
    await sleep(2_000);
  }
  console.log(
    `Done: ${done}/${rows.length} updated. The site picks the changes up within the hour, or on the next admin save.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
