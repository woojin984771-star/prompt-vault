'use client';

import { useState } from 'react';
import { FolderClosed, ChevronDown, Trash2, Plus, X } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { Collection, CollectionItem, Snippet } from '@/lib/types';
import PromptCard from './PromptCard';

interface CollectionsViewProps {
  collections: Collection[];
  collectionItems: CollectionItem[];
  snippets: Snippet[];
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onRemoveFromCollection: (collectionId: string, snippetId: string) => void;
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
}

export default function CollectionsView({
  collections,
  collectionItems,
  snippets,
  onCreateCollection,
  onDeleteCollection,
  onRemoveFromCollection,
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
}: CollectionsViewProps) {
  const { darkMode } = useTheme();
  const [newName, setNewName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    onCreateCollection(name);
    setNewName('');
  };

  const itemCountOf = (collectionId: string) => collectionItems.filter((ci) => ci.collection_id === collectionId).length;

  const snippetsOf = (collectionId: string): Snippet[] =>
    collectionItems
      .filter((ci) => ci.collection_id === collectionId)
      .map((ci) => snippets.find((s) => s.id === ci.snippet_id))
      .filter((s): s is Snippet => Boolean(s));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
          placeholder="새 컬렉션 이름 (예: 나만의 코딩 프롬프트)"
          className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
            darkMode ? 'border-[#282a2d] bg-[#16171b] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500' : 'border-slate-200 bg-white text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500'
          }`}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> 만들기
        </button>
      </div>

      {collections.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center ${
          darkMode ? 'border-[#282a2d] bg-[#111217]/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <FolderClosed className="mb-3 h-6 w-6 text-[#80868b]" />
          <p className="text-sm font-medium text-[#80868b]">아직 컬렉션이 없습니다. 마음에 드는 프롬프트를 폴더처럼 모아보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((collection) => {
            const isExpanded = expandedId === collection.id;
            const items = isExpanded ? snippetsOf(collection.id) : [];
            return (
              <div key={collection.id} className={`overflow-hidden rounded-2xl border ${darkMode ? 'border-[#22232a] bg-[#111217]' : 'border-slate-200 bg-white'}`}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : collection.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5"
                >
                  <FolderClosed className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span className="flex-1 text-sm font-bold">{collection.name}</span>
                  <span className="text-[11px] font-semibold text-[#80868b]">{itemCountOf(collection.id)}개</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDeleteCollection(collection.id); }}
                    className="rounded-lg p-1.5 text-[#80868b] transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#80868b] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className={`space-y-3 border-t p-4 ${darkMode ? 'border-[#22232a]' : 'border-slate-100'}`}>
                    {items.length === 0 ? (
                      <p className="py-2 text-center text-xs text-[#80868b]">이 컬렉션에 담긴 프롬프트가 없습니다.</p>
                    ) : (
                      items.map((snippet) => (
                        <div key={snippet.id} className="relative">
                          <button
                            type="button"
                            onClick={() => onRemoveFromCollection(collection.id, snippet.id)}
                            title="컬렉션에서 제거"
                            className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all active:scale-90 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <PromptCard
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
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
