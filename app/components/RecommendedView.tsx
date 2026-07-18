'use client';

import { Sparkles } from 'lucide-react';
import type { Snippet, SortOrder } from '@/lib/types';
import PromptGrid from './PromptGrid';

interface RecommendedViewProps {
  snippets: Snippet[];
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
  sortOrder: SortOrder;
  onChangeSort: (order: SortOrder) => void;
}

export default function RecommendedView({
  snippets,
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
  sortOrder,
  onChangeSort,
}: RecommendedViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <Sparkles className="h-5 w-5 text-indigo-400" /> 추천 프롬프트
        </h2>
        <p className="mt-1 text-xs font-semibold text-[#80868b]">좋아요를 가장 많이 받은 공유 프롬프트를 모았습니다.</p>
      </div>

      <PromptGrid
        snippets={snippets}
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
        selectedCategory="전체"
        onSelectCategory={() => {}}
        sortOrder={sortOrder}
        onChangeSort={onChangeSort}
        showCategoryTabs={false}
        emptyMessage="아직 추천할 만큼 좋아요를 받은 프롬프트가 없습니다."
      />
    </div>
  );
}
