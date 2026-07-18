'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Plus } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { ActiveView, ActivityItem, Snippet } from '@/lib/types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightRail, { type CreatorRankEntry } from './RightRail';

interface AppShellProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onNewPrompt: () => void;
  user: User | null;
  isGuestMode: boolean;
  onLogout: () => void;
  onGoToLogin: () => void;
  mySnippetsCount: number;
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchSuggestions: Snippet[];
  onSelectSuggestion: (snippet: Snippet) => void;
  totalPublicCount: number;
  onOpenPricing: () => void;
  onNotification: () => void;
  popularTags: string[];
  onSelectTag: (tag: string) => void;
  recommendedModelIds: string[];
  activityLog: ActivityItem[];
  topCreators: CreatorRankEntry[];
  onClearActivity: () => void;
  children: React.ReactNode;
}

export default function AppShell({
  activeView,
  onChangeView,
  onNewPrompt,
  user,
  isGuestMode,
  onLogout,
  onGoToLogin,
  mySnippetsCount,
  isAdmin,
  searchQuery,
  onSearchChange,
  searchSuggestions,
  onSelectSuggestion,
  totalPublicCount,
  onOpenPricing,
  onNotification,
  popularTags,
  onSelectTag,
  recommendedModelIds,
  activityLog,
  topCreators,
  onClearActivity,
  children,
}: AppShellProps) {
  const { darkMode } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const searchDisabled = activeView !== 'shared' && activeView !== 'recommended';

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#0b0c10] text-[#e3e3e3]' : 'bg-[#f5f6f8] text-[#1f1f1f]'}`}>
      <Sidebar
        activeView={activeView}
        onChangeView={(view) => {
          onChangeView(view);
          setMobileSidebarOpen(false);
        }}
        onNewPrompt={onNewPrompt}
        user={user}
        isGuestMode={isGuestMode}
        onLogout={onLogout}
        onGoToLogin={onGoToLogin}
        mySnippetsCount={mySnippetsCount}
        isAdmin={isAdmin}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          suggestions={searchSuggestions}
          onSelectSuggestion={onSelectSuggestion}
          totalPublicCount={totalPublicCount}
          onOpenPricing={onOpenPricing}
          onNotification={onNotification}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          searchDisabled={searchDisabled}
        />

        <div className="flex min-h-0 min-w-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <RightRail
            popularTags={popularTags}
            onSelectTag={onSelectTag}
            recommendedModelIds={recommendedModelIds}
            activityLog={activityLog}
            topCreators={topCreators}
            onGoSettings={() => onChangeView('settings')}
            onClearActivity={onClearActivity}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onNewPrompt}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-950/40 transition-all duration-200 hover:bg-indigo-500 active:scale-90 lg:right-[19rem]"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
