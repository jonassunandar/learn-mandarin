-- Hanzi100: apply before supabase/seed.sql.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null default 'learner',
 created_at timestamptz not null default now()
);
create table public.vocabulary (
 id text primary key,
 hanzi text not null,
 pinyin text not null,
 meaning_en text not null,
 meaning_id text not null,
 characters text[] not null,
 example_hanzi text,
 example_pinyin text,
 example_meaning_en text,
 example_meaning_id text,
 level integer not null default 1,
 sort_order integer not null unique
);
create table public.user_vocabulary (
 user_id uuid not null references auth.users(id) on delete cascade,
 vocabulary_id text not null references public.vocabulary(id),
 card jsonb not null check (card ?& array['due','stability','difficulty','elapsed_days','scheduled_days','learning_steps','reps','lapses','state']),
 due_at timestamptz not null,
 introduced_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (user_id,vocabulary_id)
);
create table public.review_history (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 vocabulary_id text not null references public.vocabulary(id),
 rating smallint not null check (rating between 1 and 4),
 reviewed_at timestamptz not null,
 log jsonb not null
);
create table public.handwriting_sessions (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 vocabulary_id text not null references public.vocabulary(id),
 character text not null,
 repetitions integer not null check (repetitions > 0),
 created_at timestamptz not null
);
create index user_vocabulary_due on public.user_vocabulary(user_id,due_at);
create index review_history_user_date on public.review_history(user_id,reviewed_at);
create index handwriting_user_date on public.handwriting_sessions(user_id,created_at);
alter table public.profiles enable row level security;
alter table public.vocabulary enable row level security;
alter table public.user_vocabulary enable row level security;
alter table public.review_history enable row level security;
alter table public.handwriting_sessions enable row level security;
create policy "Public vocabulary" on public.vocabulary for select to anon,authenticated using (true);
create policy "Own profile read" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "Own profile update" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "Own vocabulary read" on public.user_vocabulary for select to authenticated using ((select auth.uid())=user_id);
create policy "Own vocabulary insert" on public.user_vocabulary for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Own vocabulary update" on public.user_vocabulary for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Own reviews read" on public.review_history for select to authenticated using ((select auth.uid())=user_id);
create policy "Own reviews insert" on public.review_history for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Own handwriting read" on public.handwriting_sessions for select to authenticated using ((select auth.uid())=user_id);
create policy "Own handwriting insert" on public.handwriting_sessions for insert to authenticated with check ((select auth.uid())=user_id);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,username) values(new.id,coalesce(new.raw_user_meta_data->>'username','learner'));
 return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
-- SECURITY INVOKER keeps every operation subject to the caller's RLS policies.
create function public.sync_learning(payload jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare
 uid uuid := auth.uid();
 item jsonb;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 for item in select value from jsonb_each(coalesce(payload->'words','{}'::jsonb)) loop
  insert into public.user_vocabulary(user_id,vocabulary_id,card,due_at,introduced_at,updated_at)
  values(uid,item->>'vocabularyId',item->'card',(item->'card'->>'due')::timestamptz,(item->>'introducedAt')::timestamptz,(item->>'updatedAt')::timestamptz)
  on conflict(user_id,vocabulary_id) do update set card=excluded.card,due_at=excluded.due_at,updated_at=excluded.updated_at,
  introduced_at=least(public.user_vocabulary.introduced_at,excluded.introduced_at)
  where excluded.updated_at>public.user_vocabulary.updated_at;
 end loop;
 for item in select value from jsonb_array_elements(coalesce(payload->'reviews','[]'::jsonb)) loop
  insert into public.review_history(id,user_id,vocabulary_id,rating,reviewed_at,log)
  values((item->>'id')::uuid,uid,item->>'vocabularyId',(item->>'rating')::smallint,(item->>'at')::timestamptz,item->'log')
  on conflict(id) do nothing;
 end loop;
 for item in select value from jsonb_array_elements(coalesce(payload->'writing','[]'::jsonb)) loop
  insert into public.handwriting_sessions(id,user_id,vocabulary_id,character,repetitions,created_at)
  values((item->>'id')::uuid,uid,item->>'vocabularyId',item->>'character',(item->>'repetitions')::integer,(item->>'at')::timestamptz)
  on conflict(id) do nothing;
 end loop;
end;
$$;
revoke all on function public.sync_learning(jsonb) from public,anon;
grant execute on function public.sync_learning(jsonb) to authenticated;
grant select on public.vocabulary to anon,authenticated;
grant select,update on public.profiles to authenticated;
grant select,insert,update on public.user_vocabulary to authenticated;
grant select,insert on public.review_history,public.handwriting_sessions to authenticated;
