-- ============================================================================
-- Platinum Yucatán Princess — Políticas Públicas (Fotos) & Privadas (Resto)
-- Execute este bloco no SQL Editor do Supabase para tornar as Fotos públicas
-- para leitura, mantendo uploads e todos os outros dados 100% privados.
-- ============================================================================

-- 1. Tornar o bucket trip-photos público para visualização (upload/apagar continua privado)
update storage.buckets set public = true where id = 'trip-photos';

-- 2. Permitir que visitantes (anon) vejam a galeria de fotos
drop policy if exists "Public read trip_photos" on public.trip_photos;
create policy "Public read trip_photos"
  on public.trip_photos for select to anon, authenticated using (true);

drop policy if exists "Public view trip photos" on storage.objects;
create policy "Public view trip photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'trip-photos');

-- 3. Garantir que trip_state (plano, restaurantes, cocktails, mala) fica 100% privado
-- (Apenas utilizadores autenticados conseguem ler ou escrever)
drop policy if exists "Public read trip_state" on public.trip_state;
