-- Neva Shop Havale/EFT ve dekont altyapısı
-- Bu dosya Neva Shop'un bağlı olduğu Supabase projesinde bir kez çalıştırılmalıdır.

alter table public.site_ayarlari
  add column if not exists hesap_sahibi text,
  add column if not exists iban text;

alter table public.siparisler
  add column if not exists odeme_yontemi text default 'whatsapp',
  add column if not exists dekont_path text,
  add column if not exists siparis_grup_id uuid;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'dekontlar',
  'dekontlar',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Neva dekont yukleme" on storage.objects;
create policy "Neva dekont yukleme"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'dekontlar');

drop policy if exists "Neva admin dekont goruntuleme" on storage.objects;
create policy "Neva admin dekont goruntuleme"
on storage.objects
for select
to authenticated
using (bucket_id = 'dekontlar');
