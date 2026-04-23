create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  role text not null check (role in ('admin', 'vendedor')),
  avatar_url text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null default 'General',
  marca text,
  descripcion text,
  precio numeric(10,2) not null default 0,
  stock integer not null default 0,
  imagen_url text,
  activo boolean not null default true,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists marca text;

create table if not exists public.distributors (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  telefono text,
  notas text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_movements (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ajuste', 'venta', 'egreso')),
  monto numeric(10,2) not null,
  descripcion text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_state (
  id text primary key default 'principal',
  saldo_actual numeric(10,2) not null default 0,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  user_name text,
  saldo_inicial numeric(10,2) not null default 0,
  saldo_final numeric(10,2),
  total_ventas numeric(10,2) not null default 0,
  estado text not null default 'abierto' check (estado in ('abierto', 'cerrado')),
  started_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references public.shifts(id),
  user_id uuid not null references public.profiles(id),
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  nombre text not null,
  precio numeric(10,2) not null,
  cantidad integer not null,
  subtotal numeric(10,2) not null
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  descripcion text not null,
  detalle_oferta text,
  distributor_id uuid references public.distributors(id),
  distributor_name text,
  evidence_url text,
  evidence_name text,
  cantidad integer not null default 1,
  unit_cost numeric(10,2) not null default 0,
  confirmation_accepted boolean not null default false,
  monto numeric(10,2) not null,
  user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists detalle_oferta text;
alter table public.expenses add column if not exists distributor_id uuid references public.distributors(id);
alter table public.expenses add column if not exists distributor_name text;
alter table public.expenses add column if not exists evidence_url text;
alter table public.expenses add column if not exists evidence_name text;
alter table public.expenses add column if not exists cantidad integer not null default 1;
alter table public.expenses add column if not exists unit_cost numeric(10,2) not null default 0;
alter table public.expenses add column if not exists confirmation_accepted boolean not null default false;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'inventario',
  mensaje text not null,
  actor_id uuid references public.profiles(id),
  actor_name text,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  inicio text not null,
  fin text not null,
  responsable text not null,
  turno text not null default 'Mañana',
  notas text,
  estado text not null default 'programado' check (estado in ('programado', 'completado', 'cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_feedback (
  id uuid primary key default gen_random_uuid(),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.public_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_visit', 'whatsapp_click')),
  page_path text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.wallet_movements enable row level security;
alter table public.wallet_state enable row level security;
alter table public.shifts enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.distributors enable row level security;
alter table public.expenses enable row level security;
alter table public.notifications enable row level security;
alter table public.schedules enable row level security;
alter table public.community_feedback enable row level security;
alter table public.public_analytics_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'vendedor')
  );
$$;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role in ('admin', 'vendedor')
);

drop policy if exists "profiles_update_admin" on public.profiles;

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (
  auth.uid() = id
  and role in ('admin', 'vendedor')
);

drop policy if exists "products_select_public_active" on public.products;
create policy "products_select_public_active"
on public.products for select
to public
using (activo = true);

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products for select
to authenticated
using (true);

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "shifts_select_authenticated" on public.shifts;
create policy "shifts_select_authenticated"
on public.shifts for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "shifts_insert_self" on public.shifts;
create policy "shifts_insert_self"
on public.shifts for insert
to authenticated
with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "shifts_update_self" on public.shifts;
create policy "shifts_update_self"
on public.shifts for update
to authenticated
using (public.is_admin() or auth.uid() = user_id)
with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "sales_select_authenticated" on public.sales;
create policy "sales_select_authenticated"
on public.sales for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "sales_insert_self" on public.sales;
create policy "sales_insert_self"
on public.sales for insert
to authenticated
with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "sale_items_select_authenticated" on public.sale_items;
create policy "sale_items_select_authenticated"
on public.sale_items for select
to authenticated
using (
  exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and (public.is_admin() or sales.user_id = auth.uid())
  )
);

drop policy if exists "sale_items_insert_authenticated" on public.sale_items;
create policy "sale_items_insert_authenticated"
on public.sale_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.sales
    where sales.id = sale_items.sale_id
      and (public.is_admin() or sales.user_id = auth.uid())
  )
);

drop policy if exists "expenses_superadmin_all" on public.expenses;
drop policy if exists "expenses_select_staff" on public.expenses;
create policy "expenses_select_staff"
on public.expenses for select
to authenticated
using (public.is_staff());

drop policy if exists "expenses_insert_staff" on public.expenses;
create policy "expenses_insert_staff"
on public.expenses for insert
to authenticated
with check (public.is_staff() and auth.uid() = user_id);

drop policy if exists "distributors_select_staff" on public.distributors;
create policy "distributors_select_staff"
on public.distributors for select
to authenticated
using (public.is_staff());

drop policy if exists "distributors_insert_staff" on public.distributors;
create policy "distributors_insert_staff"
on public.distributors for insert
to authenticated
with check (public.is_staff());

drop policy if exists "wallet_movements_select_authenticated" on public.wallet_movements;
create policy "wallet_movements_select_authenticated"
on public.wallet_movements for select
to authenticated
using (public.is_admin());

drop policy if exists "wallet_movements_insert_staff" on public.wallet_movements;
create policy "wallet_movements_insert_staff"
on public.wallet_movements for insert
to authenticated
with check (
  (
    created_by = auth.uid()
    and tipo in ('venta', 'egreso')
    and public.is_staff()
  )
  or public.is_admin()
);

drop policy if exists "wallet_state_select_authenticated" on public.wallet_state;
create policy "wallet_state_select_authenticated"
on public.wallet_state for select
to authenticated
using (public.is_staff());

drop policy if exists "wallet_state_superadmin_all" on public.wallet_state;
drop policy if exists "wallet_state_staff_all" on public.wallet_state;
create policy "wallet_state_staff_all"
on public.wallet_state for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "notifications_select_authenticated" on public.notifications;
create policy "notifications_select_authenticated"
on public.notifications for select
to authenticated
using (public.is_staff());

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
on public.notifications for insert
to authenticated
with check (public.is_admin());

drop policy if exists "schedules_select_authenticated" on public.schedules;
create policy "schedules_select_authenticated"
on public.schedules for select
to authenticated
using (public.is_staff());

drop policy if exists "schedules_superadmin_all" on public.schedules;
drop policy if exists "schedules_admin_all" on public.schedules;
create policy "schedules_admin_all"
on public.schedules for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "community_feedback_select_public" on public.community_feedback;
create policy "community_feedback_select_public"
on public.community_feedback for select
to public
using (true);

drop policy if exists "community_feedback_insert_public" on public.community_feedback;
create policy "community_feedback_insert_public"
on public.community_feedback for insert
to public
with check (length(trim(comment)) >= 3);

drop policy if exists "community_feedback_delete_admin" on public.community_feedback;
create policy "community_feedback_delete_admin"
on public.community_feedback for delete
to authenticated
using (public.is_admin());

drop policy if exists "public_analytics_insert_public" on public.public_analytics_events;
create policy "public_analytics_insert_public"
on public.public_analytics_events for insert
to public
with check (event_type in ('page_visit', 'whatsapp_click'));

drop policy if exists "public_analytics_select_staff" on public.public_analytics_events;
create policy "public_analytics_select_staff"
on public.public_analytics_events for select
to authenticated
using (public.is_staff());

insert into public.wallet_state (id, saldo_actual)
values ('principal', 0)
on conflict (id) do nothing;
