-- 예시 프롬프트 10개를 시드 데이터로 추가합니다.
-- 실행 방법: Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 직접 실행하세요.
-- (Claude Code는 이 프로젝트의 DB에 직접 접속할 수 있는 자격 증명이 없습니다 — .env.local에는
--  anon key만 있고 service role key/DB 비밀번호/Supabase CLI 연결이 없어 SQL을 대신 실행할 수 없습니다.
--  0001~0003 마이그레이션을 먼저 실행한 뒤 이 파일을 실행하세요.)
--
-- 작성자(user_id)는 별도로 지정하지 않고, 가장 먼저 가입한 계정(auth.users 중 created_at이 가장 빠른 사용자)
-- 앞으로 자동 귀속됩니다. 즉, 앱에서 회원가입을 최소 1번은 미리 해두어야 합니다.
-- 다른 계정으로 귀속시키고 싶다면 아래 select ... order by created_at asc limit 1 부분을
-- select id from auth.users where email = '원하는이메일' 로 바꿔서 실행하세요.
-- 이미 실행한 뒤 다시 실행해도 title이 같은 행은 중복 삽입되지 않습니다(where not exists 가드).

do $$
declare
  seed_user_id uuid;
begin
  select id into seed_user_id from auth.users order by created_at asc limit 1;

  if seed_user_id is null then
    raise notice '가입된 사용자가 없어 시드 프롬프트를 건너뜁니다. 앱에서 회원가입 후 이 스크립트를 다시 실행하세요.';
    return;
  end if;

  insert into public.snippets (title, content, summary, tags, ai_models, category, is_public, user_id)
  select v.title, v.content, v.summary, v.tags, v.ai_models, v.category, true, seed_user_id
  from (
    values
      (
        'React 컴포넌트 자동 생성기',
        E'너는 10년 차 시니어 React/TypeScript 엔지니어야.\n아래 조건에 맞는 React 컴포넌트를 만들어줘.\n\n[컴포넌트 요구사항]\n- 이름: {컴포넌트명}\n- 목적: {한 줄 설명}\n- Props: {필요한 props 나열}\n- 스타일: Tailwind CSS 사용, 다크모드 지원\n\n[출력 규칙]\n1. TypeScript(.tsx)로 작성, any 타입 금지\n2. 접근성(aria-*)을 기본으로 챙길 것\n3. 컴포넌트 코드만 출력하고, 마지막에 사용 예시를 3줄 이내로 덧붙일 것',
        '요구사항만 적으면 TypeScript + Tailwind 컴포넌트를 바로 만들어주는 프롬프트',
        ARRAY['프로그래밍', 'React', 'TypeScript'],
        ARRAY['chatgpt', 'claude'],
        'Development'
      ),
      (
        'SQL 쿼리 최적화 코치',
        E'너는 데이터베이스 성능 튜닝 전문가야.\n내가 아래 SQL 쿼리와 실행 계획(EXPLAIN 결과)을 붙여넣으면:\n\n1. 병목 구간을 짚어주고 이유를 설명해줘\n2. 인덱스 추가/쿼리 재작성 등 구체적인 개선안을 2~3가지 제시해줘\n3. 각 개선안의 트레이드오프(쓰기 성능, 저장 공간 등)를 알려줘\n4. 최종 추천 쿼리를 코드 블록으로 정리해줘\n\n쿼리:\n{여기에 SQL 붙여넣기}\n\n실행 계획:\n{여기에 EXPLAIN 결과 붙여넣기}',
        'SQL과 실행 계획만 넣으면 병목을 짚고 개선안을 제안해주는 튜닝 코치',
        ARRAY['데이터 분석', 'SQL', '성능튜닝'],
        ARRAY['chatgpt', 'deepseek'],
        'Development'
      ),
      (
        'RAG 파이프라인 설계 어시스턴트',
        E'너는 RAG(Retrieval-Augmented Generation) 시스템 아키텍트야.\n아래 정보를 참고해서 RAG 파이프라인 설계안을 제안해줘.\n\n- 데이터 종류: {문서/이미지/코드 등}\n- 데이터 규모: {대략적인 문서 수/용량}\n- 요구 응답 속도: {실시간/배치 등}\n- 예산 제약: {있다면 기재}\n\n다음 항목을 포함해서 답변해줘:\n1. 청크(chunking) 전략과 사이즈 추천\n2. 임베딩 모델 추천(오픈소스/상용 각 1개 이상)\n3. 벡터 DB 선택지 비교 (최소 2개)\n4. 검색 정확도를 높이는 리랭킹/하이브리드 서치 적용 여부\n5. 예상되는 실패 케이스와 대응 방안',
        '데이터 특성만 알려주면 청크 전략부터 벡터 DB까지 설계안을 짜주는 프롬프트',
        ARRAY['RAG', '에이전트 설계', 'AI 개발'],
        ARRAY['claude', 'chatgpt'],
        'AI & Prompt'
      ),
      (
        '블로그 글 초안 3분 완성',
        E'너는 10년 차 콘텐츠 마케터야. 아래 주제로 블로그 글 초안을 작성해줘.\n\n주제: {주제}\n타깃 독자: {예: 초보 개발자, 예비 창업가 등}\n톤앤매너: {친근함/전문적/유머러스 등}\n분량: 소제목 4개 기준 1500자 내외\n\n[출력 형식]\n1. 클릭을 유도하는 제목 3개 제안\n2. 도입부(공감 포인트 + 이 글을 읽어야 하는 이유)\n3. 소제목 4개와 각 본문\n4. 마무리 CTA(다음 행동 유도 문구)',
        '주제와 타깃만 알려주면 소제목까지 짜인 블로그 초안을 뽑아주는 프롬프트',
        ARRAY['글쓰기', '콘텐츠'],
        ARRAY['chatgpt', 'claude', 'gemini'],
        'Creation'
      ),
      (
        '지브리풍 캐릭터 일러스트',
        E'studio ghibli style, warm watercolor lighting, {캐릭터 설명, 예: young girl with short brown hair, red scarf},\n{배경 설명, 예: standing on a hill overlooking a countryside village at sunset},\nsoft pastel color palette, hand-painted texture, gentle wind blowing through grass,\nhighly detailed background, cinematic composition, nostalgic atmosphere\n--ar 3:4 --v 6',
        '지브리 애니메이션 감성의 인물 일러스트를 뽑는 미드저니용 프롬프트',
        ARRAY['이미지', '디자인'],
        ARRAY['midjourney', 'stable-diffusion'],
        'Creation'
      ),
      (
        'SNS 마케팅 카피 10종 세트',
        E'너는 퍼포먼스 마케터야. 아래 제품/서비스에 대한 SNS 광고 카피를 10개 만들어줘.\n\n제품/서비스: {설명}\n핵심 셀링 포인트: {최대 3개}\n타깃: {연령대/관심사}\n채널: {인스타그램/틱톡/페이스북 등}\n\n[요청사항]\n- 후킹 문장(첫 줄)이 서로 겹치지 않게 10개 모두 다른 각도로 작성\n- 각 카피는 3줄 이내, 이모지는 과하지 않게 1~2개만\n- 마지막 줄에는 항상 명확한 CTA를 넣을 것\n- 표 형식으로 [번호 | 카피 | 사용 각도(예: 공감형/숫자강조형 등)] 정리',
        '핵심 셀링포인트만 넣으면 각도가 다른 SNS 광고 카피 10개를 뽑아주는 프롬프트',
        ARRAY['마케팅', '브랜딩'],
        ARRAY['chatgpt'],
        'Business'
      ),
      (
        '면접 예상 질문 & 모범답안 생성기',
        E'너는 채용 15년 차 HR 담당자이자 커리어 코치야.\n아래 정보를 바탕으로 면접을 준비시켜줘.\n\n지원 직무: {직무명}\n지원 회사(선택): {회사명 또는 업종}\n내 경력 요약: {2~3줄}\n\n[요청사항]\n1. 이 직무에서 자주 나오는 예상 질문 8개 (기술/인성 질문 섞어서)\n2. 각 질문마다 STAR 기법을 활용한 모범 답변 스켈레톤 제공\n3. 지원자가 자주 하는 실수 3가지와 개선 팁\n4. 마지막에 내가 면접관에게 되물을 만한 좋은 질문 3개 추천',
        '직무와 경력 요약만 넣으면 예상 질문과 STAR 답변 스켈레톤까지 짜주는 코치',
        ARRAY['커리어', '자기계발'],
        ARRAY['chatgpt', 'claude'],
        'Life'
      ),
      (
        '논문 요약 & 핵심 인사이트 추출',
        E'너는 해당 분야의 리서처야. 아래 논문 초록(또는 본문 일부)을 분석해줘.\n\n{논문 텍스트 붙여넣기}\n\n[출력 형식]\n1. 세 줄 요약 (문제 정의 / 방법 / 결과)\n2. 이 논문의 핵심 기여(contribution) 2~3가지\n3. 기존 연구 대비 차별점\n4. 한계점 또는 후속 연구로 이어질 만한 지점\n5. 비전공자도 이해할 수 있는 쉬운 비유 1개',
        '논문 텍스트만 붙여넣으면 세 줄 요약부터 한계점까지 정리해주는 리서치 어시스턴트',
        ARRAY['논문', '연구'],
        ARRAY['claude', 'perplexity'],
        'Knowledge'
      ),
      (
        '영어 이메일 톤 교정기',
        E'너는 원어민 비즈니스 라이팅 에디터야.\n아래 영어 이메일 초안을 교정해줘.\n\n원문:\n{영어 이메일 붙여넣기}\n\n[요청사항]\n1. 문법/어색한 표현을 자연스러운 비즈니스 영어로 교정\n2. 원하는 톤: {정중함/친근함/단호함 중 선택}\n3. 교정된 전체 문장을 먼저 보여주고,\n4. 그 아래에 "무엇을 왜 바꿨는지" 표로 정리(원문 표현 | 수정 표현 | 이유)',
        '영어 이메일을 붙여넣으면 톤에 맞게 교정하고 변경 이유까지 표로 정리해주는 프롬프트',
        ARRAY['번역', '학습'],
        ARRAY['chatgpt', 'gemini'],
        'Knowledge'
      ),
      (
        '일일 회고 & 다음날 우선순위 코치',
        E'너는 생산성 코치야. 아래 오늘 하루 기록을 바탕으로 회고를 도와줘.\n\n오늘 한 일: {목록}\n잘 된 점: {있으면 기재}\n아쉬웠던 점: {있으면 기재}\n\n[요청사항]\n1. 오늘의 기록을 3줄로 객관적으로 요약\n2. 잘한 점 1가지는 구체적으로 칭찬하고 이유를 짚어줄 것\n3. 아쉬운 점 중 딱 1가지만 골라 "내일 바로 적용 가능한" 개선 행동으로 바꿔줄 것\n4. 내일의 우선순위 Top 3를 중요도·긴급도 기준으로 제안',
        '하루 기록만 남기면 객관적 회고와 내일의 우선순위 Top 3를 뽑아주는 코치',
        ARRAY['생산성', '자기계발'],
        ARRAY['chatgpt', 'general'],
        'Life'
      )
  ) as v(title, content, summary, tags, ai_models, category)
  where not exists (
    select 1 from public.snippets s where s.title = v.title and s.user_id = seed_user_id
  );
end $$;
