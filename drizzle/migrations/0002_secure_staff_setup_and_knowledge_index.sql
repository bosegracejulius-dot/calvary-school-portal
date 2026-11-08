create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path = public as $$ begin return new; end $$;
comment on function public.handle_first_admin() is 'Automatic administrator assignment disabled. Administrators are provisioned explicitly by the project owner.';
drop policy "Public reads settings" on public.site_settings;
create policy "Public reads contact settings" on public.site_settings for select to anon, authenticated using (key = 'contact' or public.has_role(auth.uid(), 'admin'));
create or replace function public.index_knowledge_document() returns trigger language plpgsql security definer set search_path = public as $$ begin delete from public.kb_chunks where document_id = new.id; insert into public.kb_chunks(document_id, content) select new.id, substring(new.content from n for 900) from generate_series(1, char_length(new.content), 900) as n; return new; end $$;
create trigger kb_index_after_save after insert or update of content on public.kb_documents for each row execute function public.index_knowledge_document();
revoke execute on function public.handle_first_admin() from public, anon, authenticated;
revoke execute on function public.index_knowledge_document() from public, anon, authenticated;