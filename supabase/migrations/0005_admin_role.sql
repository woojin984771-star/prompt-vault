-- 관리자(최고관리자) 권한을 위한 컬럼과 RLS 정책, 그리고 지정된 계정을 관리자로 승격합니다.
-- 실행 방법: Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 직접 실행하세요.
-- (Claude Code는 이 프로젝트의 DB에 직접 접속할 수 있는 자격 증명이 없습니다.)
-- 0001~0004 마이그레이션이 먼저 실행돼 있어야 합니다(특히 0003의 profiles 테이블 필요).

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- profiles.is_admin은 클라이언트에서 직접 수정할 수 있는 정책을 만들지 않습니다.
-- (셀프 승격 방지 — 관리자 지정은 이 마이그레이션처럼 DB에 직접 접속해서만 가능합니다.)

-- 관리자는 다른 사람의 프롬프트도 삭제할 수 있도록 기존 정책에 추가로 허용 정책을 붙입니다.
-- (permissive 정책은 OR로 결합되므로 기존 본인 소유 삭제 정책은 그대로 유지됩니다.)
drop policy if exists "snippets_delete_admin" on public.snippets;
create policy "snippets_delete_admin" on public.snippets
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 관리자는 다른 사람의 댓글도 삭제(모더레이션)할 수 있게 합니다.
drop policy if exists "comments_delete_admin" on public.comments;
create policy "comments_delete_admin" on public.comments
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 지정한 계정을 최고관리자로 승격합니다.
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'woojin984771@gmail.com');
