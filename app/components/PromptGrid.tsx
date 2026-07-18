'use client';

import { Globe } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants';
import type { Snippet, SortOrder } from '@/lib/types';
import PromptCard from './PromptCard';

interface PromptGridProps {
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
  canDeleteSnippet?: (snippet: Snippet) => boolean;
  onDeleteSnippet?: (snippet: Snippet) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubTag?: string;
  onSelectSubTag?: (subTag: string) => void;
  sortOrder: SortOrder;
  onChangeSort: (order: SortOrder) => void;
  showCategoryTabs?: boolean;
  emptyMessage: string;
}

export default function PromptGrid({
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
  selectedCategory,
  onSelectCategory,
  selectedSubTag = '전체',
  onSelectSubTag,
  sortOrder,
  onChangeSort,
  showCategoryTabs = true,
  emptyMessage,
}: PromptGridProps) {
  const { darkMode } = useTheme();
  const subTags = showCategoryTabs && selectedCategory !== '전체' ? CATEGORY_MAP[selectedCategory] : undefined;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        {showCategoryTabs ? (
          <div className="flex flex-wrap gap-1.5">
            {['전체', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : darkMode ? 'bg-[#1e1f24] text-[#c4c7c5] hover:bg-[#282a2d]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : <div />}

        <select
          value={sortOrder}
          onChange={(e) => onChangeSort(e.target.value as SortOrder)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold outline-none transition-colors ${
            darkMode ? 'border-[#282a2d] bg-[#16171b] text-[#c4c7c5]' : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          <option value="latest">정렬 기준: 최신순</option>
          <option value="popular">정렬 기준: 인기순</option>
          <option value="views">정렬 기준: 조회수순</option>
        </select>
      </div>

      {subTags && onSelectSubTag && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5 animate-fadeIn">
          <span className="mr-0.5 text-[10px] font-bold uppercase tracking-wider text-[#80868b]">세부 카테고리</span>
          <button
            type="button"
            onClick={() => onSelectSubTag('전체')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95 ${
              selectedSubTag === '전체'
                ? 'bg-indigo-500/20 text-indigo-300'
                : darkMode ? 'bg-[#16171b] text-[#80868b] hover:bg-[#1e1f24]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            전체
          </button>
          {subTags.map((subTag) => (
            <button
              key={subTag}
              type="button"
              onClick={() => onSelectSubTag(subTag)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95 ${
                selectedSubTag === subTag
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : darkMode ? 'bg-[#16171b] text-[#80868b] hover:bg-[#1e1f24]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              #{subTag}
            </button>
          ))}
        </div>
      )}

      {snippets.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center ${
          darkMode ? 'border-[#282a2d] bg-[#111217]/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="mb-3 rounded-full p-2.5 text-[#80868b]">
            <Globe className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-[#80868b]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {snippets.map((snippet, index) => (
            <PromptCard
              key={snippet.id}
              snippet={snippet}
              variant="grid"
              index={index}
              liked={isLikedByMe(snippet.id)}
              bookmarked={isBookmarkedByMe(snippet.id)}
              likeCount={getLikeCount(snippet.id)}
              commentCount={getCommentCount(snippet.id)}
              copied={copiedId === snippet.id}
              onToggleLike={() => onToggleLike(snippet.id)}
              onToggleBookmark={() => onToggleBookmark(snippet.id)}
              onCopy={() => onCopy(snippet)}
              onOpen={() => onOpenSnippet(snippet)}
              onDelete={canDeleteSnippet?.(snippet) ? () => onDeleteSnippet?.(snippet) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
