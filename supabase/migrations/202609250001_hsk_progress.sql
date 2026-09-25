-- Independent, per-entry updates keep offline checklist changes mergeable.
create table public.hsk_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 entry_key text not null check (entry_key in ('start','minutes') or entry_key ~ '^day-([1-9]|[1-8][0-9]|90)-[0-3]$' or entry_key ~ '^check-([1-9]|1[0-2])$'),
 value text not null check (length(value) <= 100),
 updated_at timestamptz not null,
 primary key (user_id,entry_key)
);
alter table public.hsk_progress enable row level security;
create policy "Own HSK read" on public.hsk_progress for select to authenticated using ((select auth.uid())=user_id);
create policy "Own HSK insert" on public.hsk_progress for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Own HSK update" on public.hsk_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update on public.hsk_progress to authenticated;
create function public.sync_hsk(entries jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare uid uuid := auth.uid(); item record;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 for item in select key,value from jsonb_each(entries) loop
  insert into public.hsk_progress(user_id,entry_key,value,updated_at)
  values(uid,item.key,item.value->>'value',(item.value->>'updatedAt')::timestamptz)
  on conflict(user_id,entry_key) do update set value=excluded.value,updated_at=excluded.updated_at
  where excluded.updated_at > public.hsk_progress.updated_at;
 end loop;
end;
$$;
revoke all on function public.sync_hsk(jsonb) from public,anon;
grant execute on function public.sync_hsk(jsonb) to authenticated;
