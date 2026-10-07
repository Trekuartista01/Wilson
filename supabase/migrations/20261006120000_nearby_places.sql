-- The nearest real places around each listing (beach, supermarket, hospital, town, airport...),
-- looked up on OpenStreetMap when a listing is saved and by `npm run nearby:refresh`.
-- An array of { amenity, name, names, lat, lng, metres }. Written by the server with the
-- service role (not through admin_save_property). The site keeps working before this runs.

alter table public.properties
  add column if not exists nearby_places jsonb not null default '[]'::jsonb
    check (jsonb_typeof(nearby_places) = 'array'),
  -- When the lookup last succeeded; null = never (the refresh script fills those first).
  add column if not exists nearby_checked_at timestamptz;
