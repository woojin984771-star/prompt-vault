'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { Search, Bell, Menu, Sparkles, X } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { formatCompactCount } from '@/lib/utils';
import { CATEGORY_GRADIENTS } from '@/lib/constants';
import type { Snippet } from '@/lib/types';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalPublicCount: number;
  onOpenPricing: () => void;
  onNotification: () => void;
  onOpenMobileSidebar: () => void;
  searchDisabled?: boolean;
  suggestions: Snippet[];
  onSelectSuggestion: (snippet: Snippet) => void;
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  totalPublicCount,
  onOpenPricing,
  onNotification,
  onOpenMobileSidebar,
  searchDisabled,
  suggestions,
  onSelectSuggestion,
}: TopBarProps) {
  const { darkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const dropdownOpen = isFocused && !searchDisabled && searchQuery.trim().length > 0 && suggestions.length > 0;

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    setHighlightedIndex(-1);
  };

  const handleSelect = (snippet: Snippet) => {
    onSelectSuggestion(snippet);
    setIsFocused(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <header className={`sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md transition-colors duration-300 sm:px-6 ${
      darkMode ? 'border-[#22232a] bg-[#0b0c10]/85' : 'border-slate-200 bg-white/85'
    }`}>
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className={`shrink-0 rounded-lg p-2 lg:hidden ${darkMode ? 'text-[#9aa0a6] hover:bg-[#1e1f24]' : 'text-slate-500 hover:bg-slate-100'}`}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#80868b]">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          disabled={searchDisabled}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { setIsFocused(true); setHighlightedIndex(-1); }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          placeholder={`프롬프트 검색 (${formatCompactCount(totalPublicCount)})`}
          className={`w-full rounded-xl border py-2.5 pl-10 pr-16 text-sm outline-none transition-all duration-200 disabled:opacity-50 ${
            darkMode
              ? 'border-[#282a2d] bg-[#16171b] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500'
              : 'border-slate-200 bg-[#f0f4f9] text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
          }`}
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b] hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className={`absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[10px] font-bold sm:block ${
            darkMode ? 'border-[#3c4043] text-[#606468]' : 'border-slate-200 text-slate-400'
          }`}>
            ⌘K
          </span>
        )}

        {dropdownOpen && (
          <div
            ref={listRef}
            id="search-suggestions"
            role="listbox"
            className={`animate-fadeIn absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border shadow-2xl ${
              darkMode ? 'border-[#282a2d] bg-[#16171b] shadow-black/40' : 'border-slate-200 bg-white shadow-slate-300/50'
            }`}
          >
            <p className="px-3.5 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-[#80868b]">연관 검색어</p>
            <ul>
              {suggestions.map((snippet, index) => {
                const gradient = CATEGORY_GRADIENTS[snippet.category] ?? 'from-indigo-500 via-purple-500 to-fuchsia-500';
                const highlighted = index === highlightedIndex;
                return (
                  <li key={snippet.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={highlighted}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(snippet)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors duration-100 ${
                        highlighted ? (darkMode ? 'bg-[#1e1f24]' : 'bg-slate-100') : ''
                      }`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full bg-gradient-to-br ${gradient}`} />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{snippet.title}</span>
                      <span className="shrink-0 text-[10px] font-medium text-[#80868b]">{snippet.category}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onNotification}
          className={`rounded-full p-2.5 transition-colors ${darkMode ? 'text-[#9aa0a6] hover:bg-[#1e1f24]' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Bell className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={onOpenPricing}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 ${
            darkMode ? 'bg-white text-[#1f1f1f] hover:bg-slate-100' : 'bg-[#1f1f1f] text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> 업그레이드
        </button>
      </div>
    </header>
  );
}
