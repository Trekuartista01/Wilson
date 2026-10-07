-- Distances for the "close by" places on the property page ("Plazh 400 m", "Aeroport 35 km").
-- Run after 20261005120000_nearby.sql. Keys are amenity keys, values whole metres:
-- { "beach": 400, "airport": 35000 }. A missing key just shows the place without a distance.
-- The site keeps working before this runs (no distances are shown).

alter table public.properties
  add column if not exists nearby_distances jsonb not null default '{}'::jsonb
    check (jsonb_typeof(nearby_distances) = 'object');

-- Same function as in 20261005120000_nearby.sql, plus nearby_distances.
-- p_data.nearby_distances: object of amenity -> metres; left out, an update keeps the current value.
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
      (slug, zone, type, status, area_sqm, price, lat, lng, municipality, feature, nearby, nearby_distances,
       featured, published)
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
      coalesce(p_data -> 'nearby_distances', '{}'::jsonb),
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
      nearby_distances = case when p_data ? 'nearby_distances' then p_data -> 'nearby_distances' else nearby_distances end,
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
