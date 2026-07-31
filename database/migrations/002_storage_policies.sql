-- Storage policies
update storage.buckets set "public" = true where "id" = 'thumbnails';

do $$
declare b text;
begin
  foreach b in array array['uploads','videos','images','thumbnails','sessions','reports','imports'] loop
    execute format('create policy "p_%s_all" on storage.objects for all to anon, authenticated using (bucket_id = %L) with check (bucket_id = %L)', b, b, b);
  end loop;
end $$;
