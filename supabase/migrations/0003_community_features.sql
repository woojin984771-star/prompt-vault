-- 조회수 / 댓글 / 팔로우 / 컬렉션 기능을 위한 테이블, 함수, RLS 정책
-- 실행 방법: Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 직접 실행하세요.
-- (Claude Code는 DB에 직접 접근할 수 없으며, CLAUDE.md 정책상 마이그레이션은 사용자 확인 후 사용자가 직접 실행합니다.)

-- =========================================================
-- 1. 조회수
-- =========================================================
alter table public.snippets
  add column if not exists views integer not null default 0;

-- 동시 조회 시 lost update를 막기 위한 원자적 증가 함수
create or replace function public.increment_snippet_views(snippet_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.snippets set views = views + 1 where id = snippet_id;
$$;

grant execute on function public.increment_snippet_views(uuid) to anon, authenticated;

-- =========================================================
-- 2. 프로필 (공개 username — 이메일을 그대로 노출하지 않기 위함)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- insert/update는 아래 트리거(security definer)로만 처리하고, 클라이언트용 쓰기 정책은 만들지 않는다.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 이 마이그레이션 이전에 이미 가입한 사용자들을 위한 1회성 백필
insert into public.profiles (id, username)
select id, split_part(email, '@', 1) from auth.users
on conflict (id) do nothing;

-- =========================================================
-- 3. 댓글
-- =========================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  snippet_id uuid not null references public.snippets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_snippet_id_idx on public.comments (snippet_id);

alter table public.comments enable row level security;

drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments
  for select using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

-- =========================================================
-- 4. 팔로우
-- =========================================================
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all" on public.follows
  for select using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows
  for delete using (auth.uid() = follower_id);

-- =========================================================
-- 5. 컬렉션 (개인 보관함 — 소유자만 조회/수정 가능)
-- =========================================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

drop policy if exists "collections_select_own" on public.collections;
create policy "collections_select_own" on public.collections
  for select using (auth.uid() = user_id);

drop policy if exists "collections_insert_own" on public.collections;
create policy "collections_insert_own" on public.collections
  for insert with check (auth.uid() = user_id);

drop policy if exists "collections_delete_own" on public.collections;
create policy "collections_delete_own" on public.collections
  for delete using (auth.uid() = user_id);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  snippet_id uuid not null references public.snippets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (collection_id, snippet_id)
);

alter table public.collection_items enable row level security;

drop policy if exists "collection_items_select_own" on public.collection_items;
create policy "collection_items_select_own" on public.collection_items
  for select using (
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
  );

drop policy if exists "collection_items_insert_own" on public.collection_items;
create policy "collection_items_insert_own" on public.collection_items
  for insert with check (
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
  );

drop policy if exists "collection_items_delete_own" on public.collection_items;
create policy "collection_items_delete_own" on public.collection_items
  for delete using (
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
  );
