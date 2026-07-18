'use client';

import { Sparkles, Heart, Tag, Zap, Layers, Users, Eye, MessageCircle } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { formatCompactCount } from '@/lib/utils';
import type { Snippet, SortOrder } from '@/lib/types';
import PromptGrid from './PromptGrid';

export interface CommunityStats {
  totalPrompts: number;
  totalLikes: number;
  totalContributors: number;
}

interface SharedViewProps {
  heroSnippet: Snippet | null;
  gridSnippets: Snippet[];
  stats: CommunityStats;
  getLikeCount: (id: string) => number;
  getCommentCount: (id: string) => number;
  isLikedByMe: (id: string) => boolean;
  isBookmarkedByMe: (id: string) => boolean;
  copiedId: string | null;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onCopy: (snippet: Snippet) => void;
  onOpenSnippet: (snippet: Snippet) => void;
  canDeleteSnippet: (snippet: Snippet) => boolean;
  onDeleteSnippet: (snippet: Snippet) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubTag: string;
  onSelectSubTag: (subTag: string) => void;
  sortOrder: SortOrder;
  onChangeSort: (order: SortOrder) => void;
}

export default function SharedView({
  heroSnippet,
  gridSnippets,
  stats,
  getLikeCount,
  getCommentCount,
  isLikedByMe,
  isBookmarkedByMe,
  copiedId,
  onToggleLike,
  onToggleBookmark,
  onCopy,
  onOpenSnippet,
  canDeleteSnippet,
  onDeleteSnippet,
  selectedCategory,
  onSelectCategory,
  selectedSubTag,
  onSelectSubTag,
  sortOrder,
  onChangeSort,
}: SharedViewProps) {
  const { darkMode } = useTheme();

  const statChipClass = `flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
    darkMode ? 'border-[#22232a] bg-[#111217] text-[#c4c7c5]' : 'border-slate-200 bg-white text-slate-600'
  }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">공유됨</h2>
          <p className="mt-1 text-xs font-semibold text-[#80868b]">모두가 함께 만드는 공개 프롬프트 라이브러리</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={statChipClass}><Layers className="h-3.5 w-3.5 text-indigo-400" /> 프롬프트 {stats.totalPrompts}개</span>
          <span className={statChipClass}><Heart className="h-3.5 w-3.5 text-rose-400" /> 좋아요 {stats.totalLikes}개</span>
          <span className={statChipClass}><Users className="h-3.5 w-3.5 text-emerald-400" /> 크리에이터 {stats.totalContributors}명</span>
        </div>
      </div>

      {heroSnippet && (
        <div className={`relative overflow-hidden rounded-3xl border p-6 animate-fadeIn sm:p-8 ${
          darkMode ? 'border-indigo-500/20 bg-gradient-to-br from-[#161227] via-[#131320] to-[#0f1420]' : 'border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50'
        }`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-600/15 px-3 py-1 text-[11px] font-bold text-indigo-400">
                <Sparkles className="h-3 w-3" /> AI 추천 프롬프트
              </span>
              <h2 className="mb-2 text-xl font-extrabold tracking-tight sm:text-2xl">{heroSnippet.title}</h2>
              <p className={`mb-4 line-clamp-2 text-sm leading-relaxed ${darkMode ? 'text-[#9aa0a6]' : 'text-slate-600'}`}>
                {heroSnippet.summary || heroSnippet.content}
              </p>
              <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#80868b]">
                <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> 조회 {formatCompactCount(heroSnippet.views)}</span>
                <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> 좋아요 {getLikeCount(heroSnippet.id)}</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> 댓글 {getCommentCount(heroSnippet.id)}</span>
                <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> 태그 {heroSnippet.tags.length}개</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onCopy(heroSnippet)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-200 hover:bg-indigo-500 active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" fill="currentColor" /> 프롬프트 사용하기
                </button>
                <button
                  type="button"
                  onClick={() => onOpenSnippet(heroSnippet)}
                  className={`rounded-xl border px-5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    darkMode ? 'border-[#282a2d] text-[#c4c7c5] hover:bg-[#1e1f24]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  상세 보기
                </button>
              </div>
            </div>
            <div className={`hidden h-40 w-56 shrink-0 rounded-2xl border sm:block ${
              darkMode ? 'border-[#282a2d] bg-[#0d0e13]' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex h-full flex-col justify-between p-4">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className={`h-2 w-full rounded-full ${darkMode ? 'bg-[#22232a]' : 'bg-slate-100'}`} />
                  <span className={`h-2 w-4/5 rounded-full ${darkMode ? 'bg-[#22232a]' : 'bg-slate-100'}`} />
                  <span className={`h-2 w-3/5 rounded-full ${darkMode ? 'bg-[#22232a]' : 'bg-slate-100'}`} />
                </div>
                <Sparkles className="h-6 w-6 self-end text-indigo-400/60" />
              </div>
            </div>
          </div>
        </div>
      )}

      <PromptGrid
        snippets={gridSnippets}
        getLikeCount={getLikeCount}
        getCommentCount={getCommentCount}
        isLikedByMe={isLikedByMe}
        isBookmarkedByMe={isBookmarkedByMe}
        copiedId={copiedId}
        onToggleLike={onToggleLike}
        onToggleBookmark={onToggleBookmark}
        onCopy={onCopy}
        onOpenSnippet={onOpenSnippet}
        canDeleteSnippet={canDeleteSnippet}
        onDeleteSnippet={onDeleteSnippet}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        selectedSubTag={selectedSubTag}
        onSelectSubTag={onSelectSubTag}
        sortOrder={sortOrder}
        onChangeSort={onChangeSort}
        emptyMessage="공유된 프롬프트가 없습니다."
      />
    </div>
  );
}
