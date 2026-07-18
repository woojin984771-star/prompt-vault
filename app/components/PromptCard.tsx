'use client';

import { Heart, Bookmark, Copy, Check, Globe, Lock, Eye, MessageCircle, Flame, Sparkle, Trash2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CATEGORY_GRADIENTS, CATEGORY_BADGE_CLASS, AI_MODEL_MAP } from '@/lib/constants';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/categoryIcons';
import { formatCompactCount, isNewSnippet, isHotSnippet } from '@/lib/utils';
import type { Snippet } from '@/lib/types';

interface PromptCardProps {
  snippet: Snippet;
  variant: 'grid' | 'row';
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  commentCount: number;
  copied: boolean;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onCopy: () => void;
  onOpen?: () => void;
  onDelete?: () => void;
  index?: number;
}

export default function PromptCard({
  snippet,
  variant,
  liked,
  bookmarked,
  likeCount,
  commentCount,
  copied,
  onToggleLike,
  onToggleBookmark,
  onCopy,
  onOpen,
  onDelete,
  index = 0,
}: PromptCardProps) {
  const { darkMode } = useTheme();
  const gradient = CATEGORY_GRADIENTS[snippet.category] ?? 'from-indigo-500 via-purple-500 to-fuchsia-500';
  const categoryBadgeClass = CATEGORY_BADGE_CLASS[snippet.category] ?? 'bg-indigo-500/15 text-indigo-400';
  const CategoryIcon = CATEGORY_ICONS[snippet.category] ?? DEFAULT_CATEGORY_ICON;
  const primaryModel = snippet.ai_models[0] ? AI_MODEL_MAP[snippet.ai_models[0]] : undefined;
  const isNew = isNewSnippet(snippet.created_at);
  const isHot = isHotSnippet(snippet.views, likeCount);

  const statRow = (
    <div className={`flex h-8 items-center gap-2.5 rounded-lg border px-2 text-[10px] font-bold ${
      darkMode ? 'bg-[#16171b] border-[#282a2d] text-[#80868b]' : 'bg-white border-slate-200 text-slate-400'
    }`}>
      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatCompactCount(snippet.views)}</span>
      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {commentCount}</span>
    </div>
  );

  const trendBadges = (
    <>
      {isHot && (
        <span className="flex items-center gap-0.5 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
          <Flame className="h-2.5 w-2.5" fill="currentColor" /> HOT
        </span>
      )}
      {isNew && (
        <span className="flex items-center gap-0.5 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
          <Sparkle className="h-2.5 w-2.5" fill="currentColor" /> NEW
        </span>
      )}
    </>
  );

  const likeButton = (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
      className={`flex h-8 items-center gap-1 rounded-lg border px-2 transition-all duration-200 active:scale-90 ${
        liked
          ? 'bg-rose-500 border-rose-500 text-white'
          : darkMode ? 'bg-[#16171b] border-[#282a2d] text-[#80868b]' : 'bg-white border-slate-200 text-slate-400'
      }`}
    >
      <Heart className="h-3.5 w-3.5" fill={liked ? 'currentColor' : 'none'} />
      <span className="text-[10px] font-bold">{likeCount}</span>
    </button>
  );

  const bookmarkButton = (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 active:scale-90 ${
        bookmarked
          ? 'bg-amber-500 border-amber-500 text-white'
          : darkMode ? 'bg-[#16171b] border-[#282a2d] text-[#80868b]' : 'bg-white border-slate-200 text-slate-400'
      }`}
    >
      <Bookmark className="h-3.5 w-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
    </button>
  );

  const copyButton = (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onCopy(); }}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 active:scale-75 ${
        copied
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : darkMode ? 'bg-[#16171b] border-[#282a2d] text-[#80868b]' : 'bg-white border-slate-200 text-slate-400'
      }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );

  const deleteButton = onDelete ? (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      title="삭제"
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 active:scale-90 ${
        darkMode ? 'bg-[#16171b] border-[#282a2d] text-[#80868b] hover:border-red-500/40 hover:text-red-400' : 'bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500'
      }`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  ) : null;

  const fallbackThumbnail = (
    <div className="absolute inset-0 flex items-center justify-center">
      <CategoryIcon className="h-12 w-12 text-white/25" strokeWidth={1.5} />
    </div>
  );

  if (variant === 'grid') {
    return (
      <div
        onClick={onOpen}
        style={{ animationDelay: `${Math.min(index, 12) * 40}ms`, opacity: 0, animationFillMode: 'forwards' }}
        className={`group animate-fadeIn cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
          darkMode ? 'border-[#22232a] bg-[#111217] hover:shadow-black/40' : 'border-slate-200 bg-white hover:shadow-slate-200/80'
        }`}
      >
        <div className={`relative h-28 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
          {snippet.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snippet.image_url} alt={snippet.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : fallbackThumbnail}
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1">
            <span className="rounded-md bg-black/35 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {snippet.category}
            </span>
            {trendBadges}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-sm transition-all duration-150 active:scale-90 ${
              bookmarked ? 'bg-amber-500 text-white' : 'bg-black/35 text-white hover:bg-black/50'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          {primaryModel && (
            <span className={`absolute bottom-2.5 right-2.5 rounded-md border px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm ${primaryModel.accentClass}`}>
              {primaryModel.name}
            </span>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="mb-1 truncate text-sm font-bold">{snippet.title}</h3>
          <p className={`mb-3 line-clamp-2 text-xs leading-relaxed ${darkMode ? 'text-[#9aa0a6]' : 'text-slate-500'}`}>
            {snippet.summary || snippet.content}
          </p>
          <div className="flex items-center justify-between gap-2">
            {likeButton}
            {statRow}
            <div className="flex items-center gap-1.5">
              {deleteButton}
              {copyButton}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`animate-fadeIn flex overflow-hidden rounded-xl border-y border-r transition-all duration-200 ${
        darkMode ? 'border-y-[#22232a] border-r-[#22232a]' : 'border-y-slate-200 border-r-slate-200'
      }`}
    >
      <div className={`w-1.5 shrink-0 bg-gradient-to-b ${gradient}`} />
      <div className={`flex-1 p-4 ${darkMode ? 'bg-[#111217]/60' : 'bg-slate-50/50'}`}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3
              onClick={onOpen}
              className={`text-sm font-semibold ${onOpen ? 'cursor-pointer hover:text-indigo-400 hover:underline' : ''}`}
            >
              {snippet.title}
            </h3>
            {snippet.is_public ? (
              <span className="flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500">
                <Globe className="h-2.5 w-2.5" /> 공유됨
              </span>
            ) : (
              <span className="flex items-center gap-0.5 rounded bg-slate-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#80868b]">
                <Lock className="h-2.5 w-2.5" /> 비공개
              </span>
            )}
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${categoryBadgeClass}`}>
              {snippet.category}
            </span>
            {trendBadges}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {likeButton}
            {bookmarkButton}
            {copyButton}
            {deleteButton}
          </div>
        </div>

        <div className="mb-1.5">{statRow}</div>

        {snippet.summary && (
          <p className={`mb-1.5 text-xs font-medium ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-600'}`}>{snippet.summary}</p>
        )}

        <p className={`mb-2 whitespace-pre-wrap rounded-lg border p-2.5 font-mono text-xs ${
          darkMode ? 'border-[#282a2d] bg-[#1a1b1f]/60 text-[#e3e3e3]' : 'border-slate-100 bg-white text-slate-800'
        }`}>
          {snippet.content}
        </p>

        <div className="flex flex-wrap gap-1">
          {snippet.tags?.map((tag) => (
            <span key={tag} className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
              darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-600'
            }`}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
