import { matchesSearch, formatCompactCount, computeRegisterProgress, normalizeSnippet, formatRelativeTime, formatDate, isNewSnippet, isHotSnippet, formatFallbackUsername } from './utils';
import type { Snippet } from './types';

describe('matchesSearch', () => {
  const base = { title: 'React 컴포넌트 생성기', content: 'Tailwind CSS로 컴포넌트를 만들어줘', tags: ['React', 'Tailwind'] };

  it('빈 검색어는 항상 true를 반환한다', () => {
    expect(matchesSearch(base, '')).toBe(true);
    expect(matchesSearch(base, '   ')).toBe(true);
  });

  it('제목에 검색어가 포함되면 true를 반환한다', () => {
    expect(matchesSearch(base, 'react')).toBe(true);
  });

  it('본문에 검색어가 포함되면 true를 반환한다', () => {
    expect(matchesSearch(base, 'tailwind css')).toBe(true);
  });

  it('태그에 검색어가 포함되면 true를 반환한다', () => {
    expect(matchesSearch(base, 'Tailwind')).toBe(true);
  });

  it('일치하는 항목이 없으면 false를 반환한다', () => {
    expect(matchesSearch(base, '파이썬')).toBe(false);
  });
});

describe('formatCompactCount', () => {
  it('1000 미만은 그대로 표시한다', () => {
    expect(formatCompactCount(0)).toBe('0');
    expect(formatCompactCount(999)).toBe('999');
  });

  it('천 단위는 K로 축약한다', () => {
    expect(formatCompactCount(1000)).toBe('1K');
    expect(formatCompactCount(1284)).toBe('1.3K');
  });

  it('백만 단위는 M으로 축약한다', () => {
    expect(formatCompactCount(1_000_000)).toBe('1M');
    expect(formatCompactCount(2_500_000)).toBe('2.5M');
  });

  it('음수나 비정상 값은 0으로 처리한다', () => {
    expect(formatCompactCount(-5)).toBe('0');
  });
});

describe('computeRegisterProgress', () => {
  it('아무것도 입력하지 않으면 0%이다', () => {
    expect(computeRegisterProgress({ title: '', summary: '', content: '', subCategory: '', aiModels: [] })).toBe(0);
  });

  it('항목이 하나씩 채워질 때마다 20%씩 증가한다', () => {
    expect(computeRegisterProgress({ title: '제목', summary: '', content: '', subCategory: '', aiModels: [] })).toBe(20);
    expect(computeRegisterProgress({ title: '제목', summary: '요약', content: '', subCategory: '', aiModels: [] })).toBe(40);
  });

  it('본문은 20자 이상이어야 완료로 인정한다', () => {
    const short = computeRegisterProgress({ title: '제목', summary: '요약', content: '짧은 본문', subCategory: '', aiModels: [] });
    const long = computeRegisterProgress({ title: '제목', summary: '요약', content: '이 본문은 스무 글자를 훌쩍 넘기는 충분히 긴 본문입니다.', subCategory: '', aiModels: [] });
    expect(short).toBe(40);
    expect(long).toBe(60);
  });

  it('모든 항목이 채워지면 100%이다', () => {
    const progress = computeRegisterProgress({
      title: '제목',
      summary: '요약',
      content: '이 본문은 스무 글자를 훌쩍 넘기는 충분히 긴 본문입니다.',
      subCategory: 'React',
      aiModels: ['chatgpt'],
    });
    expect(progress).toBe(100);
  });
});

describe('normalizeSnippet', () => {
  const baseRow: Omit<Snippet, 'summary' | 'ai_models' | 'image_url' | 'views'> = {
    id: '1',
    title: '제목',
    content: '내용',
    tags: ['tag'],
    created_at: '2026-01-01T00:00:00.000Z',
    category: 'Development',
    is_public: true,
    user_id: 'user-1',
  };

  it('마이그레이션 전 컬럼이 없어도 안전한 기본값으로 채운다', () => {
    const normalized = normalizeSnippet(baseRow);
    expect(normalized.summary).toBeNull();
    expect(normalized.ai_models).toEqual([]);
    expect(normalized.image_url).toBeNull();
    expect(normalized.tags).toEqual(['tag']);
    expect(normalized.views).toBe(0);
  });

  it('이미 값이 있으면 그대로 유지한다', () => {
    const normalized = normalizeSnippet({ ...baseRow, summary: '요약', ai_models: ['claude'], image_url: 'https://example.com/a.png', views: 42 });
    expect(normalized.summary).toBe('요약');
    expect(normalized.ai_models).toEqual(['claude']);
    expect(normalized.image_url).toBe('https://example.com/a.png');
    expect(normalized.views).toBe(42);
  });
});

describe('isNewSnippet', () => {
  const now = new Date('2026-07-18T12:00:00.000Z').getTime();

  it('48시간 이내면 true를 반환한다', () => {
    expect(isNewSnippet(new Date(now - 60_000).toISOString(), now)).toBe(true);
    expect(isNewSnippet(new Date(now - 47 * 3600_000).toISOString(), now)).toBe(true);
  });

  it('48시간이 지나면 false를 반환한다', () => {
    expect(isNewSnippet(new Date(now - 49 * 3600_000).toISOString(), now)).toBe(false);
  });

  it('유효하지 않은 날짜는 false를 반환한다', () => {
    expect(isNewSnippet('invalid-date', now)).toBe(false);
  });
});

describe('isHotSnippet', () => {
  it('조회수 또는 좋아요가 임계값 이상이면 true를 반환한다', () => {
    expect(isHotSnippet(30, 0)).toBe(true);
    expect(isHotSnippet(0, 5)).toBe(true);
  });

  it('임계값 미만이면 false를 반환한다', () => {
    expect(isHotSnippet(10, 2)).toBe(false);
  });
});

describe('formatFallbackUsername', () => {
  it('프로필이 없을 때 익명 대신 사용자 ID 기반 표시명을 만든다', () => {
    expect(formatFallbackUsername('abcdef1234567890')).toBe('user-abcdef12');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-18T12:00:00.000Z').getTime();

  it('1분 미만은 방금 전으로 표시한다', () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe('방금 전');
  });

  it('분/시간 단위로 표시한다', () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5분 전');
    expect(formatRelativeTime(now - 3 * 3600_000, now)).toBe('3시간 전');
  });

  it('하루 이상 30일 미만은 일 단위로 표시한다', () => {
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe('2일 전');
  });

  it('30일 이상이면 절대 날짜로 표시한다', () => {
    expect(formatRelativeTime(now - 40 * 86_400_000, now)).toBe(formatDate(new Date(now - 40 * 86_400_000).toISOString()));
  });
});

describe('formatDate', () => {
  it('ISO 문자열을 한글 날짜로 변환한다', () => {
    expect(formatDate('2026-07-18T00:00:00.000Z')).toMatch(/^2026년 7월 (17|18)일$/);
  });

  it('유효하지 않은 값은 빈 문자열을 반환한다', () => {
    expect(formatDate('invalid-date')).toBe('');
  });
});
