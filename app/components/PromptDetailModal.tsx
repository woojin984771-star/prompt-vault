'use client';

import { useEffect, useState } from 'react';
import { X, Heart, Bookmark, Check, Globe, Lock, Zap, CalendarDays, Eye, FolderPlus, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CATEGORY_GRADIENTS, AI_MODEL_MAP } from '@/lib/constants';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/categoryIcons';
import { formatDate, formatCompactCount } from '@/lib/utils';
import type { Snippet, CommentRow, Collection } from '@/lib/types';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';

interface PromptDetailModalProps {
  snippet: Snippet | null;
  onClose: () => void;
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  copied: boolean;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onCopy: () => void;
  canDelete: boolean;
  onDelete: () => void;

  authorUsername: string;
  authorFollowerCount: number;
  isFollowingAuthor: boolean;
  isOwnPrompt: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onToggleFollowAuthor: () => void;

  comments: CommentRow[];
  getUsername: (userId: string) => string;
  currentUserId: string | null;
  commentPosting: boolean;
  onSubmitComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;

  collections: Collection[];
  snippetCollectionIds: Set<string>;
  onToggleCollection: (collectionId: string) => void;
  onCreateCollectionAndAdd: (name: string) => void;
}

export default function PromptDetailModal({
  snippet,
  onClose,
  liked,
  bookmarked,
  likeCount,
  copied,
  onToggleLike,
  onToggleBookmark,
  onCopy,
  canDelete,
  onDelete,
  authorUsername,
  authorFollowerCount,
  isFollowingAuthor,
  isOwnPrompt,
  isLoggedIn,
  isAdmin,
  onToggleFollowAuthor,
  comments,
  getUsername,
  currentUserId,
  commentPosting,
  onSubmitComment,
  onDeleteComment,
  collections,
  snippetCollectionIds,
  onToggleCollection,
  onCreateCollectionAndAdd,
}: PromptDetailModalProps) {
  const { darkMode } = useTheme();
  const [collectionPanelOpen, setCollectionPanelOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    if (!snippet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snippet, onClose]);

  if (!snippet) return null;

  const gradient = CATEGORY_GRADIENTS[snippet.category] ?? 'from-indigo-500 via-purple-500 to-fuchsia-500';
  const CategoryIcon = CATEGORY_ICONS[snippet.category] ?? DEFAULT_CATEGORY_ICON;

  const handleCreateCollection = () => {
    const name = newCollectionName.trim();
    if (!name) return;
    onCreateCollectionAndAdd(name);
    setNewCollectionName('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-backdropFadeIn bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl animate-modalSlideUp ${
        darkMode ? 'border-[#282a2d] bg-[#16171b] text-[#e3e3e3]' : 'border-slate-200 bg-white text-[#1f1f1f]'
      }`}>
        <div className={`relative h-36 shrink-0 overflow-hidden bg-gradient-to-br sm:h-44 ${gradient}`}>
          {snippet.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snippet.image_url} alt={snippet.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <CategoryIcon className="h-16 w-16 text-white/25" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute left-4 top-4 rounded-md bg-black/35 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            {snippet.category}
          </span>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-lg font-extrabold text-white drop-shadow sm:text-xl">{snippet.title}</h2>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {snippet.summary && (
            <p className={`text-sm font-semibold ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-600'}`}>{snippet.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#80868b]">
            <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(snippet.created_at)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> 조회 {formatCompactCount(snippet.views)}</span>
            {snippet.is_public ? (
              <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-500"><Globe className="h-3 w-3" /> 공유됨</span>
            ) : (
              <span className="flex items-center gap-1 rounded bg-slate-500/10 px-1.5 py-0.5"><Lock className="h-3 w-3" /> 비공개</span>
            )}
          </div>

          <FollowButton
            username={authorUsername}
            followerCount={authorFollowerCount}
            isFollowing={isFollowingAuthor}
            isOwnPrompt={isOwnPrompt}
            isLoggedIn={isLoggedIn}
            onToggleFollow={onToggleFollowAuthor}
          />

          {snippet.ai_models.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {snippet.ai_models.map((modelId) => {
                const model = AI_MODEL_MAP[modelId];
                if (!model) return null;
                return (
                  <span key={modelId} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${model.accentClass}`}>
                    {model.name}
                  </span>
                );
              })}
            </div>
          )}

          <div className={`whitespace-pre-wrap rounded-xl border p-4 font-mono text-sm leading-relaxed ${
            darkMode ? 'border-[#282a2d] bg-[#1a1b1f]/70 text-[#e3e3e3]' : 'border-slate-100 bg-slate-50 text-slate-800'
          }`}>
            {snippet.content}
          </div>

          {snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {snippet.tags.map((tag) => (
                <span key={tag} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                  darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-600'
                }`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {isLoggedIn && (
            <div>
              <button
                type="button"
                onClick={() => setCollectionPanelOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  darkMode ? 'border-[#282a2d] text-[#c4c7c5] hover:bg-[#1e1f24]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FolderPlus className="h-3.5 w-3.5" /> 컬렉션에 담기 {snippetCollectionIds.size > 0 && `(${snippetCollectionIds.size})`}
              </button>

              {collectionPanelOpen && (
                <div className={`mt-2 flex flex-col gap-1.5 rounded-xl border p-3 animate-fadeIn ${darkMode ? 'border-[#22232a] bg-[#111217]' : 'border-slate-200 bg-slate-50'}`}>
                  {collections.length === 0 && (
                    <p className="px-1 text-[11px] text-[#80868b]">아직 만든 컬렉션이 없습니다.</p>
                  )}
                  {collections.map((collection) => {
                    const checked = snippetCollectionIds.has(collection.id);
                    return (
                      <label key={collection.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold hover:bg-black/5">
                        <input type="checkbox" checked={checked} onChange={() => onToggleCollection(collection.id)} className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500" />
                        {collection.name}
                      </label>
                    );
                  })}
                  <div className="mt-1 flex items-center gap-1.5 border-t pt-2" style={{ borderColor: darkMode ? '#22232a' : '#e2e8f0' }}>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCollection(); } }}
                      placeholder="새 컬렉션 이름"
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs outline-none ${darkMode ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3]' : 'border-slate-200 bg-white text-[#1f1f1f]'}`}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCollection}
                      disabled={!newCollectionName.trim()}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all active:scale-90 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <CommentSection
            comments={comments}
            getUsername={getUsername}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            posting={commentPosting}
            onSubmit={onSubmitComment}
            onDelete={onDeleteComment}
          />
        </div>

        <div className={`flex items-center gap-2 border-t px-6 py-4 ${darkMode ? 'border-[#22232a]' : 'border-slate-100'}`}>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="프롬프트 삭제"
              className={`flex items-center justify-center rounded-xl border px-3 py-2.5 transition-all duration-200 active:scale-95 ${
                darkMode ? 'border-[#282a2d] text-[#c4c7c5] hover:border-red-500/40 hover:text-red-400' : 'border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLike}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
              liked ? 'border-rose-500 bg-rose-500 text-white' : darkMode ? 'border-[#282a2d] text-[#c4c7c5] hover:bg-[#1e1f24]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} /> {likeCount}
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`flex items-center justify-center rounded-xl border px-3 py-2.5 transition-all duration-200 active:scale-95 ${
              bookmarked ? 'border-amber-500 bg-amber-500 text-white' : darkMode ? 'border-[#282a2d] text-[#c4c7c5] hover:bg-[#1e1f24]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={onCopy}
            className={`ml-auto flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 active:scale-95 ${
              copied ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" fill="currentColor" />}
            {copied ? '복사 완료' : '프롬프트 사용하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
