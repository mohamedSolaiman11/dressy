create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists public.ateliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branch_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.atelier_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  atelier_id uuid not null references public.ateliers(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint atelier_memberships_user_atelier_unique unique (user_id, atelier_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  atelier_id uuid references public.ateliers(id) on delete cascade,
  name text not null,
  phone text not null,
  area text not null default '',
  preferred_size text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  constraint customers_phone_per_atelier_unique unique (atelier_id, phone)
);

create table if not exists public.dresses (
  id uuid primary key default gen_random_uuid(),
  atelier_id uuid references public.ateliers(id) on delete cascade,
  code text not null,
  name text not null,
  category text not null,
  size text not null,
  color text not null,
  price integer not null check (price >= 0),
  status text not null default 'متاح' check (status in ('متاح', 'محجوز')),
  image_tone text not null default 'rose',
  image_path text not null default '',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  constraint dresses_code_per_atelier_unique unique (atelier_id, code)
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

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  atelier_id uuid references public.ateliers(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  dress_id uuid not null references public.dresses(id) on delete restrict,
  pickup_date date not null,
  return_date date not null,
  time_label text not null default '12:00 م',
  status text not null default 'محجوز' check (status in ('محجوز', 'تم التسليم', 'تم الاسترجاع')),
  deposit integer not null default 0 check (deposit >= 0),
  total integer not null default 0 check (total >= 0),
  payment_status text not null default 'غير مدفوع' check (payment_status in ('مدفوع', 'غير مدفوع')),
  note text not null default '',
  fitting_stage text not null default 'حجز جديد',
  created_at timestamptz not null default timezone('utc', now()),
  constraint bookings_date_order_check check (return_date >= pickup_date)
);

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
