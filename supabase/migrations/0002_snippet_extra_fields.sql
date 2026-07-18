-- 새 프롬프트 등록 폼(핵심 요약 / 지원 AI 모델 / 대표 이미지)을 위한 컬럼 및 이미지 스토리지 버킷
-- 실행 방법: Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 직접 실행하세요.
-- (Claude Code는 DB에 직접 접근할 수 없으며, CLAUDE.md 정책상 마이그레이션은 사용자 확인 후 사용자가 직접 실행합니다.)

alter table public.snippets
  add column if not exists summary text,
  add column if not exists ai_models text[] not null default '{}',
  add column if not exists image_url text;

-- 대표 이미지 업로드용 공개 버킷 (public read, 인증된 사용자만 자신의 user_id 하위 경로에 업로드/삭제 가능)
insert into storage.buckets (id, name, public)
values ('snippet-images', 'snippet-images', true)
on conflict (id) do nothing;

drop policy if exists "snippet_images_select_all" on storage.objects;
create policy "snippet_images_select_all" on storage.objects
  for select using (bucket_id = 'snippet-images');

drop policy if exists "snippet_images_insert_own" on storage.objects;
create policy "snippet_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'snippet-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "snippet_images_delete_own" on storage.objects;
create policy "snippet_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'snippet-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
