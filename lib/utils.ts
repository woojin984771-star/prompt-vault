import type { Snippet } from './types';

export type SnippetRow = Omit<Snippet, 'summary' | 'ai_models' | 'image_url' | 'views'> &
  Partial<Pick<Snippet, 'summary' | 'ai_models' | 'image_url' | 'views'>>;

export const normalizeSnippet = (row: SnippetRow): Snippet => ({
  ...row,
  tags: row.tags ?? [],
  summary: row.summary ?? null,
  ai_models: row.ai_models ?? [],
  image_url: row.image_url ?? null,
  views: row.views ?? 0,
});

export const matchesSearch = (snippet: Pick<Snippet, 'title' | 'content' | 'tags'>, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    snippet.title.toLowerCase().includes(q) ||
    snippet.content.toLowerCase().includes(q) ||
    (snippet.tags || []).some((tag) => tag.toLowerCase().includes(q))
  );
};

export const formatCompactCount = (value: number): string => {
  if (!Number.isFinite(value) || value < 0) return '0';
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const compact = value / 1000;
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}K`;
  }
  const compact = value / 1_000_000;
  return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}M`;
};

export interface RegisterProgressFields {
  title: string;
  summary: string;
  content: string;
  subCategory: string;
  aiModels: string[];
}

export const computeRegisterProgress = (fields: RegisterProgressFields): number => {
  const checks = [
    fields.title.trim().length > 0,
    fields.summary.trim().length > 0,
    fields.content.trim().length >= 20,
    fields.subCategory.trim().length > 0,
    fields.aiModels.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

export const formatRelativeTime = (timestamp: number, now: number = Date.now()): string => {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatDate(new Date(timestamp).toISOString());
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const NEW_SNIPPET_WINDOW_MS = 48 * 60 * 60 * 1000;

export const isNewSnippet = (createdAt: string, now: number = Date.now()): boolean => {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return false;
  return now - createdTime < NEW_SNIPPET_WINDOW_MS;
};

const HOT_VIEWS_THRESHOLD = 30;
const HOT_LIKES_THRESHOLD = 5;

export const isHotSnippet = (views: number, likeCount: number): boolean =>
  views >= HOT_VIEWS_THRESHOLD || likeCount >= HOT_LIKES_THRESHOLD;

export const formatFallbackUsername = (userId: string): string => `user-${userId.slice(0, 8)}`;
