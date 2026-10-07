-- "Afër" (close by): which amenities are within easy reach of a listing, for the properties
-- page filter. Keys match `amenities` in data/properties.ts. Run once in the Supabase SQL editor
-- (or `supabase db push`). The site keeps working before it runs: listings just have no
-- amenities, so the "close by" filter finds nothing.

alter table public.properties
  add column if not exists nearby text[] not null default '{}'
    check (
      cardinality(nearby) <= 20
      and nearby <@ array['beach', 'supermarket', 'restaurant', 'hospital', 'pharmacy', 'school',
                          'cityCentre', 'publicTransport', 'airport']::text[]
    );

-- The filter reads every published listing in memory today; this index is for when it moves
-- into the query (nearby @> '{beach}').
create index if not exists properties_nearby_idx on public.properties using gin (nearby);

-- Creates (p_id null) or updates a property and its translations in one transaction.
-- p_data: { slug_base?, zone, type, status, area_sqm, price, lat, lng, municipality, feature,
--           nearby?, featured, published, translations: { sq|en|de: { title, description } } }
-- nearby: JSON array of amenity keys; left out, an update keeps the current value.
-- On create, the slug is slug_base made unique with a -2, -3... suffix.
create or replace function public.admin_save_property(p_id uuid, p_data jsonb) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := p_id;
  v_slug text;
  v_n integer := 1;
  v_locale text;
begin
  if v_id is null then
    v_slug := p_data ->> 'slug_base';
    if v_slug is null or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      raise exception 'invalid slug_base' using errcode = '22023';
    end if;
    while exists (select 1 from public.properties where slug = v_slug) loop
      v_n := v_n + 1;
      v_slug := (p_data ->> 'slug_base') || '-' || v_n;
    end loop;

    insert into public.properties
      (slug, zone, type, status, area_sqm, price, lat, lng, municipality, feature, nearby, featured, published)
    values (
      v_slug,
      p_data ->> 'zone',
      p_data ->> 'type',
      p_data ->> 'status',
      (p_data ->> 'area_sqm')::numeric,
      (p_data ->> 'price')::numeric,
      (p_data ->> 'lat')::double precision,
      (p_data ->> 'lng')::double precision,
      p_data ->> 'municipality',
      p_data ->> 'feature',
      coalesce(array(select jsonb_array_elements_text(p_data -> 'nearby')), '{}'),
      (p_data ->> 'featured')::boolean,
      (p_data ->> 'published')::boolean
    )
    returning id into v_id;
  else
    update public.properties set
      zone = p_data ->> 'zone',
      type = p_data ->> 'type',
      status = p_data ->> 'status',
      area_sqm = (p_data ->> 'area_sqm')::numeric,
      price = (p_data ->> 'price')::numeric,
      lat = (p_data ->> 'lat')::double precision,
      lng = (p_data ->> 'lng')::double precision,
      municipality = p_data ->> 'municipality',
      feature = p_data ->> 'feature',
      nearby = case when p_data ? 'nearby' then array(select jsonb_array_elements_text(p_data -> 'nearby')) else nearby end,
      featured = (p_data ->> 'featured')::boolean,
      published = (p_data ->> 'published')::boolean
    where id = v_id;
    if not found then
      raise exception 'property not found' using errcode = 'P0002';
    end if;
  end if;

  for v_locale in select jsonb_object_keys(p_data -> 'translations') loop
    insert into public.property_translations (property_id, locale, title, description)
    values (
      v_id,
      v_locale,
      p_data -> 'translations' -> v_locale ->> 'title',
      coalesce(p_data -> 'translations' -> v_locale ->> 'description', '')
    )
    on conflict (property_id, locale) do update
      set title = excluded.title, description = excluded.description;
  end loop;

  return v_id;
end;
$$;

revoke execute on function public.admin_save_property(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_property(uuid, jsonb) to service_role;
