'use client';

import type { User } from '@supabase/supabase-js';
import { Zap, Plus, FolderOpen, Share2, Sparkles, Settings, LogOut, ChevronsUpDown, X, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { ActiveView } from '@/lib/types';

interface SidebarProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onNewPrompt: () => void;
  user: User | null;
  isGuestMode: boolean;
  onLogout: () => void;
  onGoToLogin: () => void;
  mySnippetsCount: number;
  isAdmin: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const MENU_ITEMS: { view: ActiveView; label: string; icon: typeof FolderOpen }[] = [
  { view: 'library', label: '프롬프트 보관함', icon: FolderOpen },
  { view: 'shared', label: '공유됨', icon: Share2 },
  { view: 'recommended', label: '추천 프롬프트', icon: Sparkles },
];

export default function Sidebar({
  activeView,
  onChangeView,
  onNewPrompt,
  user,
  isGuestMode,
  onLogout,
  onGoToLogin,
  mySnippetsCount,
  isAdmin,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { darkMode } = useTheme();

  const initial = (user?.email ?? '게').charAt(0).toUpperCase();
  const displayName = user ? user.email?.split('@')[0] ?? '사용자' : '게스트';

  const navButtonClass = (view: ActiveView) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
      activeView === view
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30'
        : darkMode
          ? 'text-[#9aa0a6] hover:bg-[#1e1f24] hover:text-white'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const content = (
    <div className={`flex h-full w-64 flex-col border-r px-4 py-5 transition-colors duration-300 ${
      darkMode ? 'border-[#22232a] bg-[#111217] text-[#e3e3e3]' : 'border-slate-200 bg-white text-[#1f1f1f]'
    }`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-950/30">
            <Zap className="h-5 w-5" fill="currentColor" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight">Prompt Vault</p>
            <p className="text-[10px] font-medium text-[#80868b]">Prompt AI Workspace</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className={`rounded-lg p-1.5 lg:hidden ${darkMode ? 'text-[#9aa0a6] hover:bg-[#1e1f24]' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onNewPrompt}
        className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600/15 py-2.5 text-sm font-bold text-indigo-400 border border-indigo-500/30 transition-all duration-200 hover:bg-indigo-600/25 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" /> 새 프롬프트
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[#80868b]">메뉴</p>
        <nav className="flex flex-col gap-1">
          {MENU_ITEMS.map(({ view, label, icon: Icon }) => (
            <button key={view} type="button" onClick={() => onChangeView(view)} className={navButtonClass(view)}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {view === 'library' && user && (
                <span className="ml-auto text-[10px] font-bold opacity-80">{mySnippetsCount}</span>
              )}
            </button>
          ))}
        </nav>

        <p className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-[#80868b]">시스템</p>
        <nav className="flex flex-col gap-1">
          <button type="button" onClick={() => onChangeView('settings')} className={navButtonClass('settings')}>
            <Settings className="h-4 w-4 shrink-0" />
            <span>설정</span>
          </button>
        </nav>
      </div>

      <div className={`mt-4 flex shrink-0 items-center gap-2.5 rounded-xl border p-2.5 ${
        darkMode ? 'border-[#22232a] bg-[#16171b]' : 'border-slate-200 bg-slate-50'
      }`}>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          isAdmin ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-xs font-bold">
            {displayName}
            {isAdmin && <ShieldCheck className="h-3 w-3 shrink-0 text-amber-400" />}
          </p>
          <p className="truncate text-[10px] font-medium text-[#80868b]">
            {isAdmin ? '최고관리자' : user ? 'Free 플랜 사용중' : '게스트 모드'}
          </p>
        </div>
        {user ? (
          <button
            type="button"
            onClick={onLogout}
            title="로그아웃"
            className={`rounded-lg p-1.5 transition-colors ${darkMode ? 'text-[#80868b] hover:bg-[#22232a] hover:text-red-400' : 'text-slate-400 hover:bg-slate-200 hover:text-red-500'}`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToLogin}
            title="로그인"
            className={`rounded-lg p-1.5 transition-colors ${darkMode ? 'text-[#80868b] hover:bg-[#22232a] hover:text-indigo-400' : 'text-slate-400 hover:bg-slate-200 hover:text-indigo-600'}`}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        )}
      </div>
      {isGuestMode && (
        <button
          type="button"
          onClick={onGoToLogin}
          className="mt-2 text-center text-[10px] font-bold text-indigo-400 hover:underline"
        >
          로그인/가입 하러가기
        </button>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden shrink-0 lg:block">{content}</aside>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
}
