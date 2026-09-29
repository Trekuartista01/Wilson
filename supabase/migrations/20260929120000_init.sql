-- Wilson Real Estate: initial schema.
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor once.
--
-- Access model: the website server talks to the database with the service role key only
-- (lib/server/supabase.ts). Row level security is on everywhere; the only policies are
-- public reads of published listings, so the anon key can never write anything.

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------

create sequence public.property_reference_seq;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  -- URL slug, shared by all three languages. Set once on create, never changed (stable links).
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  -- Human reference shown on the listing ("ID e pronës"), e.g. WRE-001.
  reference text not null unique
    default ('WRE-' || lpad(nextval('public.property_reference_seq')::text, 3, '0')),
  zone text not null check (zone ~ '^[a-z0-9-]{1,40}$'),
  type text not null check (type in ('land', 'residential', 'commercial')),
  status text not null check (status in ('sale', 'rent')),
  area_sqm numeric(14, 2) not null check (area_sqm > 0),
  -- EUR. null = "price on request".
  price numeric(14, 2) check (price is null or price >= 0),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  municipality text not null check (length(municipality) between 1 and 80),
  feature text not null check (feature ~ '^[a-zA-Z]{1,40}$'),
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter sequence public.property_reference_seq owned by public.properties.reference;

create table public.property_translations (
  property_id uuid not null references public.properties (id) on delete cascade,
  locale text not null check (locale in ('sq', 'en', 'de')),
  title text not null check (length(title) between 1 and 160),
  description text not null default '' check (length(description) <= 5000),
  primary key (property_id, locale)
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  -- Object path inside the property-images bucket.
  storage_path text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now()
);

-- Indexes for what the site queries: the listing page (published, newest first, filtered
-- by zone / type / status), the homepage featured row, and a listing's photos in order.
create index properties_published_updated_idx on public.properties (updated_at desc) where published;
create index properties_zone_idx on public.properties (zone) where published;
create index properties_type_status_idx on public.properties (type, status) where published;
create index properties_featured_idx on public.properties (updated_at desc) where published and featured;
create index property_images_order_idx on public.property_images (property_id, position);

-- Keep updated_at current ("Përditësuar" on the listing page).
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin writes (called by the API with the service role)
-- ---------------------------------------------------------------------------

-- Creates (p_id null) or updates a property and its translations in one transaction.
-- p_data: { slug_base?, zone, type, status, area_sqm, price, lat, lng, municipality, feature,
--           featured, published, translations: { sq|en|de: { title, description } } }
-- On create, the slug is slug_base made unique with a -2, -3... suffix.
create function public.admin_save_property(p_id uuid, p_data jsonb) returns uuid
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
      (slug, zone, type, status, area_sqm, price, lat, lng, municipality, feature, featured, published)
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

-- Sets the photo order of a property. p_ids must be exactly that property's image ids.
create function public.admin_reorder_images(p_property_id uuid, p_ids uuid[]) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if cardinality(p_ids) <> (select count(*) from public.property_images where property_id = p_property_id)
     or cardinality(p_ids) <> (select count(distinct x) from unnest(p_ids) as x)
     or exists (
       select 1 from unnest(p_ids) as x
       where not exists (select 1 from public.property_images i where i.id = x and i.property_id = p_property_id)
     ) then
    raise exception 'image ids do not match the property' using errcode = '22023';
  end if;

  update public.property_images i
     set position = array_position(p_ids, i.id) - 1
   where i.property_id = p_property_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Rate limiting (contact form, admin login)
-- ---------------------------------------------------------------------------

-- Fixed-window counters, keyed by "scope:hashed-client". No raw IPs are stored.
create table public.rate_limits (
  key text primary key check (length(key) <= 200),
  hits integer not null,
  window_ends_at timestamptz not null
);

create function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits integer;
  v_ends timestamptz;
begin
  insert into public.rate_limits as rl (key, hits, window_ends_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    hits = case when rl.window_ends_at <= now() then 1 else rl.hits + 1 end,
    window_ends_at = case
      when rl.window_ends_at <= now() then now() + make_interval(secs => p_window_seconds)
      else rl.window_ends_at
    end
  returning rl.hits, rl.window_ends_at into v_hits, v_ends;

  -- Now and then, clear out long-expired windows so the table stays small.
  if random() < 0.01 then
    delete from public.rate_limits where window_ends_at < now() - interval '1 day';
  end if;

  return query select
    v_hits <= p_limit,
    greatest(0, ceil(extract(epoch from (v_ends - now())))::integer);
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security and privileges
-- ---------------------------------------------------------------------------

alter table public.properties enable row level security;
alter table public.property_translations enable row level security;
alter table public.property_images enable row level security;
alter table public.rate_limits enable row level security;

create policy "Published properties are public"
  on public.properties for select
  to anon, authenticated
  using (published);

create policy "Translations of published properties are public"
  on public.property_translations for select
  to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.published));

create policy "Images of published properties are public"
  on public.property_images for select
  to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.published));

-- rate_limits: no policies at all, so only the service role (and the function) touch it.

-- Functions are callable by the server (service role) only.
revoke execute on function public.admin_save_property(uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_reorder_images(uuid, uuid[]) from public, anon, authenticated;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_save_property(uuid, jsonb) to service_role;
grant execute on function public.admin_reorder_images(uuid, uuid[]) to service_role;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Storage: listing photos
-- ---------------------------------------------------------------------------

-- Public bucket: photos are readable by URL. No write policies, so only the service role
-- (the admin API, after its own type/size checks) can upload or delete. The API stores
-- re-encoded WebP only, max 4 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 4194304, array['image/webp'])
on conflict (id) do nothing;
