'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Moon, Sun, RefreshCw, AlertTriangle, Trash2, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { AI_MODELS } from '@/lib/constants';

interface SettingsViewProps {
  user: User | null;
  isAdmin: boolean;
  onGoToLogin: () => void;
  onGoPricing: () => void;
  recommendedModelIds: string[];
  onToggleRecommendedModel: (id: string) => void;
  onClearActivity: () => void;
  onDeleteAllSnippets: () => void;
  mySnippetsCount: number;
  deleting: boolean;
}

export default function SettingsView({
  user,
  isAdmin,
  onGoToLogin,
  onGoPricing,
  recommendedModelIds,
  onToggleRecommendedModel,
  onClearActivity,
  onDeleteAllSnippets,
  mySnippetsCount,
  deleting,
}: SettingsViewProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [confirmText, setConfirmText] = useState('');

  if (!user) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 block text-5xl">⚙️</span>
        <h3 className="mb-2 text-lg font-extrabold">설정은 로그인 후 이용할 수 있습니다</h3>
        <button
          type="button"
          onClick={onGoToLogin}
          className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500 active:scale-95"
        >
          로그인 및 가입 화면으로 가기
        </button>
      </div>
    );
  }

  const initial = (user.email ?? '?').charAt(0).toUpperCase();
  const cardClass = `rounded-2xl border p-5 ${darkMode ? 'border-[#22232a] bg-[#111217]' : 'border-slate-200 bg-white'}`;

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <h2 className="text-xl font-extrabold tracking-tight">설정</h2>

      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${
            isAdmin ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold">
              {user.email?.split('@')[0]}
              {isAdmin && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
            </p>
            <p className="truncate text-xs text-[#80868b]">{user.email}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {isAdmin ? (
              <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black text-amber-400">
                <ShieldCheck className="h-3 w-3" /> 최고관리자
              </span>
            ) : (
              <>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-600'}`}>FREE PLAN</span>
                <button type="button" onClick={onGoPricing} className="text-[10px] font-bold text-indigo-400 hover:underline">플랜 업그레이드</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="mb-3 text-sm font-bold">테마 설정</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { if (!darkMode) toggleDarkMode(); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
              darkMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Moon className="h-3.5 w-3.5" /> 다크 모드
          </button>
          <button
            type="button"
            onClick={() => { if (darkMode) toggleDarkMode(); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
              !darkMode ? 'bg-indigo-600 text-white' : darkMode ? 'bg-[#1e1f24] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Sun className="h-3.5 w-3.5" /> 라이트 모드
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="text-sm font-bold">추천 AI 모델 설정</h3>
        <p className="mb-3 mt-1 text-xs text-[#80868b]">사이드바에 표시될 추천 모델을 선택하세요.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AI_MODELS.filter((m) => m.id !== 'general').map((model) => {
            const checked = recommendedModelIds.includes(model.id);
            return (
              <label
                key={model.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  checked
                    ? model.accentClass
                    : darkMode ? 'border-[#22232a] bg-[#16171b] text-[#c4c7c5]' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => onToggleRecommendedModel(model.id)} className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500" />
                {model.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="text-sm font-bold">활동 기록 설정</h3>
        <p className="mb-3 mt-1 text-xs text-[#80868b]">대시보드의 최근 활동 기록을 관리합니다.</p>
        <button
          type="button"
          onClick={onClearActivity}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
            darkMode ? 'bg-[#1e1f24] text-[#c4c7c5] hover:bg-[#282a2d]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" /> 최근 활동 초기화
        </button>
      </div>

      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-red-400"><AlertTriangle className="h-4 w-4" /> DANGER ZONE</h3>
        <p className="mb-3 mt-1 text-xs text-red-400/80">
          내가 작성한 프롬프트 {mySnippetsCount}개가 모두 영구적으로 삭제됩니다. 계속하려면 아래 입력창에 &quot;삭제&quot;를 입력하세요.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="삭제"
            className="w-32 rounded-lg border border-red-500/40 bg-transparent px-3 py-1.5 text-xs outline-none placeholder-red-400/40 focus:border-red-500"
          />
          <button
            type="button"
            disabled={confirmText !== '삭제' || deleting || mySnippetsCount === 0}
            onClick={() => { onDeleteAllSnippets(); setConfirmText(''); }}
            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> {deleting ? '삭제 중...' : '내 프롬프트 전체 삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
