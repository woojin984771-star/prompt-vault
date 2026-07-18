-- 좋아요 / 북마크 기능을 위한 테이블 및 RLS 정책
-- 실행 방법: Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 직접 실행하세요.
-- (Claude Code는 DB에 직접 접근할 수 없으며, CLAUDE.md 정책상 마이그레이션은 사용자 확인 후 사용자가 직접 실행합니다.)
--
-- 전제: public.snippets.id 컬럼이 uuid 타입이라고 가정합니다.
-- 만약 snippets.id 가 bigint/uuid가 아니라면 아래 snippet_id 컬럼 타입을 맞춰서 수정하세요.

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snippet_id uuid not null references public.snippets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, snippet_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snippet_id uuid not null references public.snippets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, snippet_id)
);

create index if not exists likes_snippet_id_idx on public.likes (snippet_id);
create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);

alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;

-- 좋아요 수는 모든 방문자(비로그인 포함)가 볼 수 있어야 하므로 select는 전체 공개
drop policy if exists "likes_select_all" on public.likes;
create policy "likes_select_all" on public.likes
  for select using (true);

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- 북마크는 본인 것만 조회/등록/삭제 가능 (다른 사람의 북마크 목록은 비공개)
drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (auth.uid() = user_id);
