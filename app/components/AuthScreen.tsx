'use client';

import type { FormEvent } from 'react';
import { Bookmark, Compass, Mail, Key, Zap, Heart, Layers, Users, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CATEGORY_GRADIENTS, CATEGORIES } from '@/lib/constants';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/categoryIcons';
import { formatCompactCount } from '@/lib/utils';
import type { Snippet } from '@/lib/types';
import type { CommunityStats } from './SharedView';

interface AuthScreenProps {
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  authLoading: boolean;
  handleAuth: (e: FormEvent) => void;
  handleEnterGuestMode: () => void;
  showWelcome: boolean;
  isFadingOut: boolean;
  previewSnippets: Snippet[];
  stats: CommunityStats;
  getLikeCount: (id: string) => number;
  onPreviewSnippet: (snippet: Snippet) => void;
}

export default function AuthScreen({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  isSignUp,
  setIsSignUp,
  authLoading,
  handleAuth,
  handleEnterGuestMode,
  showWelcome,
  isFadingOut,
  previewSnippets,
  stats,
  getLikeCount,
  onPreviewSnippet,
}: AuthScreenProps) {
  const { darkMode } = useTheme();

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-[#0b0c10] text-[#e3e3e3]' : 'bg-[#f5f6f8] text-[#1f1f1f]'
    }`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blobFloat absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="animate-blobFloatSlow absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="animate-blobFloat absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      {showWelcome && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } ${darkMode ? 'bg-[#0b0c10]' : 'bg-[#f5f6f8]'}`}
        >
          <div className="text-center animate-bounce">
            <span className="text-6xl block mb-4">🎉</span>
          </div>
          <div className="text-center">
            <h1 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>
              회원가입을 진심으로 환영합니다!
            </h1>
            <p className={`text-sm font-medium ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-500'}`}>
              이제 나만의 프롬프트 워크스페이스, Prompt Vault를 시작해 보세요.
            </p>
          </div>
        </div>
      )}

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-16">
        {/* 로그인 폼 — 모바일에서는 먼저 노출 */}
        <div className="order-1 flex justify-center lg:order-2">
          <div className={`w-full max-w-md overflow-hidden rounded-3xl border p-8 shadow-2xl transition-all duration-300 animate-modalSlideUp ${
            darkMode ? 'border-[#282a2d] bg-[#16171b]/95 shadow-black/40 backdrop-blur-xl' : 'border-[#e0e2e6] bg-white/95 shadow-slate-200/80 backdrop-blur-xl'
          }`}>
            <div className="mb-6 text-center">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
                darkMode ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Bookmark className="h-6 w-6" />
              </div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>Prompt Vault</h1>
              <p className="mt-1 text-xs font-bold text-indigo-500 tracking-tight">
                나만의 프롬프트를 발견하고, 공유하고, 성장시키세요
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">이메일</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#80868b]"><Mail className="h-4 w-4" /></span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition-all ${
                      darkMode
                        ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500'
                        : 'border-slate-200 bg-[#f0f4f9] text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">비밀번호</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#80868b]"><Key className="h-4 w-4" /></span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition-all ${
                      darkMode
                        ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500'
                        : 'border-slate-200 bg-[#f0f4f9] text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full rounded-xl py-3 text-sm font-semibold shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                  darkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-[#1f1f1f] hover:bg-slate-800 text-white'
                }`}
              >
                {authLoading ? '처리 중...' : isSignUp ? '이메일로 회원가입' : '이메일로 로그인'}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-semibold text-indigo-500 hover:underline"
              >
                {isSignUp ? '이미 계정이 있으신가요? 로그인하기' : '처음이신가요? 회원가입하기'}
              </button>

              <div className={`border-t pt-4 flex flex-col items-center ${darkMode ? 'border-[#282a2d]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={handleEnterGuestMode}
                  className={`flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-xl transition-all active:scale-95 border ${
                    darkMode
                      ? 'bg-[#2d2f31] border-[#3c4043] text-emerald-400 hover:bg-[#3c4043]'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  <Compass className="h-4 w-4" /> 로그인 없이 둘러보기
                </button>
                <p className="text-[10px] text-[#80868b] mt-2">
                  공유된 프롬프트를 탐색하고 클립보드에 자유롭게 복사할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 마케팅 히어로 */}
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <div>
            <span className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
              darkMode ? 'bg-indigo-600/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Sparkles className="h-3 w-3" /> AI 프롬프트 커뮤니티
            </span>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              프롬프트를 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">발견</span>하고,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">공유</span>하고,
              함께 성장하세요
            </h1>
            <p className={`mt-4 max-w-lg text-sm leading-relaxed sm:text-base ${darkMode ? 'text-[#9aa0a6]' : 'text-slate-600'}`}>
              ChatGPT, Claude, Midjourney 등 모든 AI 모델을 위한 프롬프트를 한곳에서 찾고, 저장하고, 다른 크리에이터와 함께 나눠보세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-2xl font-black sm:text-3xl">
                <Layers className="h-5 w-5 text-indigo-400" /> {formatCompactCount(stats.totalPrompts)}
              </p>
              <p className="text-xs font-semibold text-[#80868b]">공유된 프롬프트</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-2xl font-black sm:text-3xl">
                <Heart className="h-5 w-5 text-rose-400" /> {formatCompactCount(stats.totalLikes)}
              </p>
              <p className="text-xs font-semibold text-[#80868b]">누적 좋아요</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-2xl font-black sm:text-3xl">
                <Users className="h-5 w-5 text-emerald-400" /> {formatCompactCount(stats.totalContributors)}
              </p>
              <p className="text-xs font-semibold text-[#80868b]">활동 중인 크리에이터</p>
            </div>
          </div>

          {previewSnippets.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#80868b]">지금 인기 있는 프롬프트</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {previewSnippets.map((snippet) => {
                  const gradient = CATEGORY_GRADIENTS[snippet.category] ?? 'from-indigo-500 via-purple-500 to-fuchsia-500';
                  return (
                    <button
                      key={snippet.id}
                      type="button"
                      onClick={() => onPreviewSnippet(snippet)}
                      className={`group overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                        darkMode ? 'border-[#22232a] bg-[#111217] hover:shadow-black/40' : 'border-slate-200 bg-white hover:shadow-slate-200/80'
                      }`}
                    >
                      <div className={`relative h-16 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
                        {snippet.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={snippet.image_url} alt={snippet.title} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {(() => {
                              const CategoryIcon = CATEGORY_ICONS[snippet.category] ?? DEFAULT_CATEGORY_ICON;
                              return <CategoryIcon className="h-6 w-6 text-white/30" strokeWidth={1.5} />;
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-bold">{snippet.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#80868b]">
                          <Heart className="h-3 w-3" /> {getLikeCount(snippet.id)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            {CATEGORIES.map((cat) => (
              <span key={cat} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#80868b]">
                <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${CATEGORY_GRADIENTS[cat]}`} />
                {cat}
              </span>
            ))}
          </div>

          <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-[#606468]' : 'text-slate-400'}`}>
            <Zap className="h-3.5 w-3.5" /> 로그인 없이도 둘러보기로 바로 체험할 수 있어요
          </div>
        </div>
      </div>
    </div>
  );
}
