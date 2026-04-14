create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists public.ateliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branch_name text,
  public_slug text not null unique default concat('store-', substr(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.ateliers add column if not exists public_slug text;

update public.ateliers
set public_slug = concat('store-', substr(id::text, 1, 8))
where public_slug is null or public_slug = '';

alter table public.ateliers alter column public_slug set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ateliers_public_slug_key'
  ) then
    alter table public.ateliers
      add constraint ateliers_public_slug_key unique (public_slug);
  end if;
end $$;

create table if not exists public.atelier_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  atelier_id uuid not null references public.ateliers(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint atelier_memberships_user_atelier_unique unique (user_id, atelier_id)
);

create table if not exists public.dress_images (
  id uuid primary key default gen_random_uuid(),
  atelier_id uuid references public.ateliers(id) on delete cascade,
  dress_id uuid not null references public.dresses(id) on delete cascade,
  storage_path text not null,
  shot_type text not null default 'general' check (shot_type in ('general', 'front', 'side', 'back', 'detail', 'mannequin', 'model')),
  sort_order integer not null default 0 check (sort_order >= 0 and sort_order < 4),
  created_at timestamptz not null default timezone('utc', now()),
  constraint dress_images_unique_order unique (dress_id, sort_order),
  constraint dress_images_unique_path unique (dress_id, storage_path)
);

alter table public.customers add column if not exists atelier_id uuid references public.ateliers(id) on delete cascade;
alter table public.dresses add column if not exists atelier_id uuid references public.ateliers(id) on delete cascade;
alter table public.bookings add column if not exists atelier_id uuid references public.ateliers(id) on delete cascade;
alter table public.dresses add column if not exists image_path text not null default '';
alter table public.dress_images add column if not exists shot_type text not null default 'general';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dress_images_shot_type_check'
  ) then
    alter table public.dress_images
      add constraint dress_images_shot_type_check
      check (shot_type in ('general', 'front', 'side', 'back', 'detail', 'mannequin', 'model'));
  end if;
end $$;

alter table public.customers drop constraint if exists phone_unique;
alter table public.dresses drop constraint if exists dresses_code_key;
alter table public.bookings drop constraint if exists bookings_no_overlapping_dates;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_phone_per_atelier_unique'
  ) then
    alter table public.customers
      add constraint customers_phone_per_atelier_unique unique (atelier_id, phone);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dresses_code_per_atelier_unique'
  ) then
    alter table public.dresses
      add constraint dresses_code_per_atelier_unique unique (atelier_id, code);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_no_overlapping_dates'
  ) then
    alter table public.bookings
      add constraint bookings_no_overlapping_dates
      exclude using gist (
        atelier_id with =,
        dress_id with =,
        daterange(pickup_date, return_date, '[]') with &&
      )
      where (status <> 'تم الاسترجاع');
  end if;
end $$;

update public.bookings bookings
set atelier_id = dresses.atelier_id
from public.dresses dresses
where bookings.dress_id = dresses.id
  and bookings.atelier_id is null
  and dresses.atelier_id is not null;

create or replace function public.is_atelier_member(target_atelier_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.atelier_memberships membership
    where membership.user_id = auth.uid()
      and membership.atelier_id = target_atelier_id
  );
$$;

alter table public.ateliers enable row level security;
alter table public.atelier_memberships enable row level security;
alter table public.customers enable row level security;
alter table public.dresses enable row level security;
alter table public.dress_images enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "authenticated customers full access" on public.customers;
drop policy if exists "authenticated dresses full access" on public.dresses;
drop policy if exists "authenticated bookings full access" on public.bookings;

drop policy if exists "users can read their ateliers" on public.ateliers;
create policy "users can read their ateliers"
  on public.ateliers
  for select
  to authenticated
  using (public.is_atelier_member(id));

drop policy if exists "users can read their memberships" on public.atelier_memberships;
create policy "users can read their memberships"
  on public.atelier_memberships
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can manage their customers" on public.customers;
create policy "users can manage their customers"
  on public.customers
  for all
  to authenticated
  using (public.is_atelier_member(atelier_id))
  with check (public.is_atelier_member(atelier_id));

drop policy if exists "users can manage their dresses" on public.dresses;
create policy "users can manage their dresses"
  on public.dresses
  for all
  to authenticated
  using (public.is_atelier_member(atelier_id))
  with check (public.is_atelier_member(atelier_id));

drop policy if exists "users can manage their dress images" on public.dress_images;
create policy "users can manage their dress images"
  on public.dress_images
  for all
  to authenticated
  using (public.is_atelier_member(atelier_id))
  with check (public.is_atelier_member(atelier_id));

drop policy if exists "users can manage their bookings" on public.bookings;
create policy "users can manage their bookings"
  on public.bookings
  for all
  to authenticated
  using (public.is_atelier_member(atelier_id))
  with check (public.is_atelier_member(atelier_id));
