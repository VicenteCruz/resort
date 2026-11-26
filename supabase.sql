-- ============================================================================
-- Platinum Yucatán Princess — Configuração Supabase (Base de Dados + Fotos)
-- Cole este ficheiro inteiro no "SQL Editor" do seu projeto Supabase e clique "Run".
-- ============================================================================

-- 1. Tabela de estado partilhado da viagem (plano, voos, mala, restaurantes, despesas)
create table if not exists public.trip_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Tabela de metadados das fotos da viagem
create table if not exists public.trip_photos (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null default 1,
  caption text default '',
  storage_path text not null,
  uploaded_by text default '',
  created_at timestamptz not null default now()
);

-- 3. Ativar Row Level Security (RLS) — apenas utilizadores autenticados (vocês os dois)
alter table public.trip_state enable row level security;
alter table public.trip_photos enable row level security;

create policy "Authenticated read trip_state"
  on public.trip_state for select to authenticated using (true);

create policy "Authenticated upsert trip_state"
  on public.trip_state for insert to authenticated with check (true);

create policy "Authenticated update trip_state"
  on public.trip_state for update to authenticated using (true);

create policy "Authenticated read trip_photos"
  on public.trip_photos for select to authenticated using (true);

create policy "Authenticated insert trip_photos"
  on public.trip_photos for insert to authenticated with check (true);

create policy "Authenticated delete trip_photos"
  on public.trip_photos for delete to authenticated using (true);

-- 4. Bucket privado para guardar as fotografias da viagem
insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', false)
on conflict (id) do nothing;

create policy "Authenticated upload trip photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'trip-photos');

create policy "Authenticated view trip photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'trip-photos');

create policy "Authenticated delete trip photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'trip-photos');
