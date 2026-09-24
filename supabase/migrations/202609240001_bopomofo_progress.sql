-- Additive: vocabulary and FSRS data are unchanged.
create table public.bopomofo_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null check (lesson_id in (
  'first-symbols','open-vowels','tones','tongue-tip','back-sounds','three-medials',
  'front-sounds','raised-tongue','near-teeth','gliding-vowels','nasal-endings',
  'blend-syllables','three-symbols','pinyin-bridges','rounded-front-vowel',
  'sound-contrasts','tone-changes','neutral-and-er','read-phrases','independent-reading'
 )),
 completed_at timestamptz not null,
 primary key (user_id,lesson_id)
);
alter table public.bopomofo_progress enable row level security;
create policy "Own Bopomofo read" on public.bopomofo_progress for select to authenticated using ((select auth.uid())=user_id);
create policy "Own Bopomofo insert" on public.bopomofo_progress for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Own Bopomofo update" on public.bopomofo_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update on public.bopomofo_progress to authenticated;
create function public.sync_bopomofo(completions jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare uid uuid := auth.uid(); item record;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 for item in select key,value from jsonb_each_text(completions) loop
  insert into public.bopomofo_progress(user_id,lesson_id,completed_at)
  values(uid,item.key,item.value::timestamptz)
  on conflict(user_id,lesson_id) do update set completed_at=greatest(public.bopomofo_progress.completed_at,excluded.completed_at);
 end loop;
end;
$$;
revoke all on function public.sync_bopomofo(jsonb) from public,anon;
grant execute on function public.sync_bopomofo(jsonb) to authenticated;
