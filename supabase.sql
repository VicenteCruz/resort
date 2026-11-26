-- ============================================================================
-- Companheiro de Viagem — Políticas Públicas (Viagem + Fotos) & Privadas (Resto)
-- Execute este bloco no SQL Editor do Supabase para:
--   1) Permitir que amigos/família vejam SEMPRE os dados atualizados da viagem
--      (destino, datas, voos, escalas, nota de estado) via tabela `public_trip`.
--   2) Manter as fotos públicas para leitura (upload/apagar continua privado).
--   3) Manter `trip_state` (carteira, PNR, lugares, despesas, mala, plano) 100% privado.
-- ============================================================================

-- 1. Tabela pública só-leitura para partilha da viagem atualizada em tempo real
create table if not exists public.public_trip (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.public_trip enable row level security;

drop policy if exists "Public read public_trip" on public.public_trip;
create policy "Public read public_trip"
  on public.public_trip for select to anon, authenticated using (true);

drop policy if exists "Auth insert public_trip" on public.public_trip;
create policy "Auth insert public_trip"
  on public.public_trip for insert to authenticated with check (true);

drop policy if exists "Auth update public_trip" on public.public_trip;
create policy "Auth update public_trip"
  on public.public_trip for update to authenticated using (true) with check (true);

-- 2. Tornar o bucket trip-photos público para visualização (upload/apagar continua privado)
update storage.buckets set public = true where id = 'trip-photos';

-- 3. Permitir que visitantes (anon) vejam a galeria de fotos
drop policy if exists "Public read trip_photos" on public.trip_photos;
create policy "Public read trip_photos"
  on public.trip_photos for select to anon, authenticated using (true);

drop policy if exists "Public view trip photos" on storage.objects;
create policy "Public view trip photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'trip-photos');

-- 4. Comentários públicos nas fotografias (qualquer pessoa pode ler e comentar com nome + mensagem; apagar é privado)
create table if not exists public.trip_photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id text not null,
  author_name text not null check (char_length(trim(author_name)) between 1 and 60),
  message text not null check (char_length(trim(message)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_photo_comments_photo_id
  on public.trip_photo_comments (photo_id, created_at asc);

alter table public.trip_photo_comments enable row level security;

drop policy if exists "Public read trip_photo_comments" on public.trip_photo_comments;
create policy "Public read trip_photo_comments"
  on public.trip_photo_comments for select to anon, authenticated using (true);

drop policy if exists "Public insert trip_photo_comments" on public.trip_photo_comments;
create policy "Public insert trip_photo_comments"
  on public.trip_photo_comments for insert to anon, authenticated
  with check (char_length(trim(author_name)) >= 1 and char_length(trim(message)) >= 1);

drop policy if exists "Auth delete trip_photo_comments" on public.trip_photo_comments;
create policy "Auth delete trip_photo_comments"
  on public.trip_photo_comments for delete to authenticated using (true);

-- 5. Garantir que trip_state (plano, carteira, PNR, despesas, restaurantes, cocktails, mala) fica 100% privado
drop policy if exists "Public read trip_state" on public.trip_state;
