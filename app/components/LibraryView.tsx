'use client';

import type { User } from '@supabase/supabase-js';
import { Search, X, FolderOpen, Bookmark, FolderClosed } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { LibrarySubTab, Snippet, Collection, CollectionItem } from '@/lib/types';
import PromptCard from './PromptCard';
import CollectionsView from './CollectionsView';

interface LibraryViewProps {
  user: User | null;
  onGoToLogin: () => void;
  librarySubTab: LibrarySubTab;
  onChangeSubTab: (tab: LibrarySubTab) => void;
  mySnippetsCount: number;
  bookmarksCount: number;
  collectionsCount: number;
  filteredMySnippets: Snippet[];
  filteredBookmarkedSnippets: Snippet[];
  allSnippets: Snippet[];
  collections: Collection[];
  collectionItems: CollectionItem[];
  uniqueTags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
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
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onRemoveFromCollection: (collectionId: string, snippetId: string) => void;
}

export default function LibraryView({
  user,
  onGoToLogin,
  librarySubTab,
  onChangeSubTab,
  mySnippetsCount,
  bookmarksCount,
  collectionsCount,
  filteredMySnippets,
  filteredBookmarkedSnippets,
  allSnippets,
  collections,
  collectionItems,
  uniqueTags,
  selectedTag,
  onSelectTag,
  searchQuery,
  onSearchChange,
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
  onCreateCollection,
  onDeleteCollection,
  onRemoveFromCollection,
}: LibraryViewProps) {
  const { darkMode } = useTheme();

  if (!user) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 block text-5xl">💼</span>
        <h3 className="mb-2 text-lg font-extrabold">안전한 보관함 열기</h3>
        <p className="mb-6 max-w-[320px] text-xs leading-relaxed text-[#80868b]">
          내 보관함은 로그인한 사용자만 볼 수 있는 프라이빗 공간입니다. 계정을 만들어 로그인하면 바로 활성화됩니다.
        </p>
        <button
          type="button"
          onClick={onGoToLogin}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500 active:scale-95"
        >
          로그인 및 가입 화면으로 가기
        </button>
      </div>
    );
  }

  const activeList = librarySubTab === 'mine' ? filteredMySnippets : filteredBookmarkedSnippets;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold tracking-tight">프롬프트 보관함</h2>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChangeSubTab('mine')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all duration-200 active:scale-95 sm:flex-initial sm:px-6 ${
            librarySubTab === 'mine' ? 'bg-indigo-600 text-white shadow-md' : darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
          }`}
        >
          내가 쓴 글 ({mySnippetsCount})
        </button>
        <button
          type="button"
          onClick={() => onChangeSubTab('bookmarks')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all duration-200 active:scale-95 sm:flex-initial sm:px-6 ${
            librarySubTab === 'bookmarks' ? 'bg-amber-500 text-white shadow-md' : darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
          }`}
        >
          북마크 ({bookmarksCount})
        </button>
        <button
          type="button"
          onClick={() => onChangeSubTab('collections')}
          className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-all duration-200 active:scale-95 sm:flex-initial sm:px-6 ${
            librarySubTab === 'collections' ? 'bg-emerald-600 text-white shadow-md' : darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <FolderClosed className="h-3.5 w-3.5" /> 컬렉션 ({collectionsCount})
        </button>
      </div>

      {librarySubTab === 'collections' ? (
        <CollectionsView
          collections={collections}
          collectionItems={collectionItems}
          snippets={allSnippets}
          onCreateCollection={onCreateCollection}
          onDeleteCollection={onDeleteCollection}
          onRemoveFromCollection={onRemoveFromCollection}
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
        />
      ) : (
        <>
          <div className="relative max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#80868b]">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="제목, 내용, 태그로 검색"
              className={`w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm outline-none transition-all duration-200 ${
                darkMode ? 'border-[#282a2d] bg-[#16171b] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500' : 'border-slate-200 bg-white text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b] hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {librarySubTab === 'mine' && uniqueTags.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(tag)}
                  className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    selectedTag === tag ? 'bg-indigo-600 text-white shadow-md' : darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tag === '전체' ? tag : `#${tag}`}
                </button>
              ))}
            </div>
          )}

          {activeList.length === 0 ? (
            <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center ${
              darkMode ? 'border-[#282a2d] bg-[#111217]/40' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="mb-3 text-slate-400">
                {librarySubTab === 'mine' ? <FolderOpen className="h-6 w-6" /> : <Bookmark className="h-6 w-6" />}
              </div>
              <p className="text-sm font-medium text-[#80868b]">
                {searchQuery
                  ? '검색 결과가 없습니다.'
                  : librarySubTab === 'mine'
                    ? (selectedTag === '전체' ? '등록된 프롬프트가 없습니다.' : '해당 태그의 프롬프트가 없습니다.')
                    : '북마크한 프롬프트가 없습니다. 공유됨 탭에서 마음에 드는 프롬프트를 북마크해 보세요!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {activeList.map((snippet) => (
                <PromptCard
                  key={snippet.id}
                  snippet={snippet}
                  variant="row"
                  liked={isLikedByMe(snippet.id)}
                  bookmarked={isBookmarkedByMe(snippet.id)}
                  likeCount={getLikeCount(snippet.id)}
                  commentCount={getCommentCount(snippet.id)}
                  copied={copiedId === snippet.id}
                  onToggleLike={() => onToggleLike(snippet.id)}
                  onToggleBookmark={() => onToggleBookmark(snippet.id)}
                  onCopy={() => onCopy(snippet)}
                  onOpen={() => onOpenSnippet(snippet)}
                  onDelete={canDeleteSnippet(snippet) ? () => onDeleteSnippet(snippet) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
