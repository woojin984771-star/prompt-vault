'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Tag, FolderOpen, PenTool, Folder, Copy, Check, Compass, Globe, Lock, LogOut, Mail, Key, Sun, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Snippet {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  category: string;
  is_public: boolean;
  user_id: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'AI & Prompt': ['GPT 제작', '시스템 프롬프트', '에이전트 설계', 'RAG', '자동화', '프롬프트 최적화'],
  'Business': ['마케팅', '세일즈', '전략', '브랜딩', '고객관리'],
  'Creation': ['글쓰기', '콘텐츠', '디자인', '이미지', '영상', '음악'],
  'Development': ['프로그래밍', '데이터 분석', 'AI 개발', '시스템 설계', '보안'],
  'Knowledge': ['교육', '연구', '논문', '번역', '학습'],
  'Life': ['생산성', '자기계발', '커리어', '금융', '건강']
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

export default function PromptSafePage() {
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // 💡 비로그인 유저를 위한 "둘러보기(게스트) 모드" 상태
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  const [showWelcome, setShowWelcome] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [category, setCategory] = useState('AI & Prompt');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // 기본 활성 탭: 비로그인 게스트 모드일 경우 'explore' 고정
  const [activeTab, setActiveTab] = useState<'write' | 'library' | 'explore'>('write');

  const [selectedTag, setSelectedTag] = useState<string>('전체');
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);

  const [selectedExploreCategory, setSelectedExploreCategory] = useState<string>('전체');
  const [selectedExploreSubTag, setSelectedExploreSubTag] = useState<string>('전체');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('darkMode', String(nextMode));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuestMode(false); // 로그인 성공 시 게스트 모드 해제
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuestMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 비로그인 상태여도 공용 프롬프트는 불러올 수 있도록 수정
  const fetchSnippets = async () => {
    // 1. 공용 프롬프트 로딩 (로그인 여부와 무관하게 허용)
    const { data: publicData, error: publicError } = await supabase
      .from('snippets')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (publicError) {
      console.error('데이터 에러:', publicError);
      return;
    }

    const fetchedPublicData = publicData || [];

    // 2. 로그인 유저인 경우 개인 프롬프트도 함께 로딩
    if (user) {
      const { data: myData, error: myError } = await supabase
        .from('snippets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (myError) {
        console.error('내 데이터 에러:', myError);
        return;
      }

      const fetchedMyData = myData || [];
      setSnippets([...fetchedMyData, ...fetchedPublicData.filter(ps => ps.user_id !== user.id)]);

      const tagsArray = fetchedMyData.flatMap((s: Snippet) => s.tags || []);
      setUniqueTags(['전체', ...Array.from(new Set(tagsArray))]);
    } else {
      // 비로그인 게스트인 경우 공용 데이터만 바인딩
      setSnippets(fetchedPublicData);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return showToast('이메일과 비밀번호를 입력해 주세요.', 'info');
    
    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        showToast(error.message, 'info');
      } else {
        setShowWelcome(true);
        setTimeout(() => {
          setIsFadingOut(true);
        }, 1500);
        setTimeout(() => {
          setShowWelcome(false);
          setIsFadingOut(false);
        }, 2000);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        showToast('로그인 실패: 정보를 확인하세요.', 'info');
      } else {
        showToast('로그인에 성공했습니다! 환영합니다. 🎉');
      }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsGuestMode(false);
    setActiveTab('write');
    showToast('로그아웃되었습니다. 안전하게 잠금 처리 완료!');
  };

  // 게스트 모드로 즉시 진입하는 핸들러
  const handleEnterGuestMode = () => {
    setIsGuestMode(true);
    setActiveTab('explore'); // 게스트 전용은 '탐색' 탭이 기본
    showToast('둘러보기 모드로 진입했습니다. 프롬프트 복사가 가능합니다!');
  };

  const handleExploreCategoryChange = (cat: string) => {
    setSelectedExploreCategory(cat);
    setSelectedExploreSubTag('전체');
  };

  const handleTagChipClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCustomTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = customTagInput.trim().replace(',', '');
      if (cleanTag && !selectedTags.includes(cleanTag)) {
        setSelectedTags([...selectedTags, cleanTag]);
        setCustomTagInput('');
        showToast(`#${cleanTag} 태그가 추가되었습니다.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('로그인해야 나만의 보관함을 생성하고 저장할 수 있습니다.', 'info');
      return;
    }
    if (!title || !content) return showToast('제목과 내용을 모두 입력해 주세요.', 'info');

    let finalTags = [...selectedTags];
    if (customTagInput.trim()) {
      const cleanTag = customTagInput.trim();
      if (!finalTags.includes(cleanTag)) {
        finalTags.push(cleanTag);
      }
    }

    const { error } = await supabase.from('snippets').insert([
      {
        title,
        content,
        tags: finalTags,
        category,
        is_public: isPublic,
        user_id: user.id
      },
    ]);

    if (error) {
      showToast('저장에 실패했습니다.', 'info');
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setCustomTagInput('');
      setCategory('AI & Prompt');
      setIsPublic(false);
      fetchSnippets();
      
      showToast(isPublic ? '모두에게 프롬프트를 공유했습니다! 🚀' : '내 보관함에 안전하게 저장 완료! 🔒');
      
      if (isPublic) {
        setActiveTab('explore');
      } else {
        setActiveTab('library');
      }
    }
  };

  const handleCopy = async (id: string, text: string, snippetTitle: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast(`"${snippetTitle}" 프롬프트가 복사되었습니다! 🎉`);
      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (err) {
      showToast('복사에 실패했습니다. 다시 시도해 주세요.', 'info');
    }
  };

  const mySnippets = snippets.filter((s) => s.user_id === user?.id);
  const filteredMySnippets = selectedTag === '전체'
    ? mySnippets
    : mySnippets.filter((s) => s.tags && s.tags.includes(selectedTag));

  const publicSnippets = snippets.filter((s) => s.is_public === true);
  const filteredExploreSnippets = publicSnippets.filter((s) => {
    const matchesCategory = selectedExploreCategory === '전체' || s.category === selectedExploreCategory;
    const matchesSubTag = selectedExploreSubTag === '전체' || (s.tags && s.tags.includes(selectedExploreSubTag));
    return matchesCategory && matchesSubTag;
  });

  const getSubTitle = () => {
    if (isGuestMode) return '지식인들이 공유한 꿀 프롬프트를 자유롭게 복사해 가세요!';
    if (activeTab === 'write') return '나만의 새로운 치트키 프롬프트 쓰기';
    if (activeTab === 'library') return '안전하게 나만 볼 수 있게 모아둔 금고';
    if (activeTab === 'explore') return '지식인들의 개꿀 공유 프롬프트 탐색';
    return '분야별 개꿀 프롬프트 둘러보기';
  };

  return (
    <div className={`relative flex min-h-screen items-center justify-center p-4 antialiased transition-colors duration-300 ${
      darkMode ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#f0f4f9] text-[#1f1f1f]'
    }`}>
      
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;   
          height: 4px;  
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'};
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)'};
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? 'rgba(255, 255, 255, 0.12) transparent' : 'rgba(0, 0, 0, 0.12) transparent'};
        }
      `}</style>
      
      {/* 테마 토글 */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 z-40 p-3 rounded-full border shadow-md transition-all duration-300 active:scale-90 ${
          darkMode 
            ? 'bg-[#1e1f20] border-[#282a2d] text-[#e3e3e3] hover:bg-[#2d2f31]' 
            : 'bg-white border-[#e0e2e6] text-[#1f1f1f] hover:bg-[#f0f4f9]'
        }`}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* 토스트 */}
      <div
        className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl px-5 py-3.5 shadow-xl border backdrop-blur-md transition-all duration-300 ease-out ${
          toast.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
        } ${toast.type === 'success' ? 'bg-[#1e1f20] border-[#282a2d] text-white' : 'bg-red-500/95 border-red-400 text-white'}`}
      >
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${toast.type === 'success' ? 'bg-indigo-500 text-white' : 'bg-white text-red-500'}`}>
          {toast.type === 'success' ? '✓' : '!'}
        </span>
        <span className="text-xs font-semibold tracking-tight whitespace-nowrap">{toast.message}</span>
      </div>

      {showWelcome && (
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } ${darkMode ? 'bg-[#131314]' : 'bg-[#f0f4f9]'}`}
        >
          <div className="text-center animate-bounce">
            <span className="text-6xl block mb-4">🎉</span>
          </div>
          <div className="text-center">
            <h1 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>
              회원가입을 진심으로 환영합니다!
            </h1>
            <p className={`text-sm font-medium ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-500'}`}>
              이제 안전한 영감 보관소, Prompt Safe를 시작해 보세요.
            </p>
          </div>
        </div>
      )}

      {/* 🔒 1. 비로그인 상태이면서 둘러보기 모드도 아닐 때 (기본 로그인 카드) */}
      {!user && !isGuestMode ? (
        <div className={`w-full max-w-md overflow-hidden rounded-3xl border p-8 shadow-2xl transition-all duration-300 ${
          darkMode ? 'border-[#282a2d] bg-[#1e1f20] shadow-black/40' : 'border-[#e0e2e6] bg-white shadow-slate-200/80'
        }`}>
          <div className="mb-6 text-center">
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
              darkMode ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Bookmark className="h-6 w-6" />
            </div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>Prompt Safe</h1>
            <p className="mt-1 text-xs font-bold text-indigo-500 tracking-tight">
              안전한 개인 프롬프트 영감 보관소
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

            {/* ✨ 로그인 없이 둘러보기 전용 버튼 추가 */}
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
      ) : (
        /* 🔓 2. 로그인된 상태이거나 비로그인 "둘러보기(게스트)" 모드일 때 메인 앱 노출 */
        <div className={`w-full max-w-md overflow-hidden rounded-3xl border p-8 pb-6 shadow-2xl transition-all duration-300 ${
          darkMode ? 'border-[#282a2d] bg-[#1e1f20] shadow-black/40' : 'border-[#e0e2e6] bg-white shadow-slate-200/80'
        }`}>
          
          {/* 상단 헤더 영역 */}
          <div className="mb-6 relative">
            <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#80868b] hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-3 w-3" /> 로그아웃
                  </button>
                  <span className="text-[9px] text-[#80868b] font-medium max-w-[100px] truncate" title={user.email}>
                    {user.email}
                  </span>
                </>
              ) : (
                /* 게스트 전용 UI 분기 */
                <button
                  type="button"
                  onClick={() => setIsGuestMode(false)}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:underline"
                >
                  로그인/가입 하러가기
                </button>
              )}
            </div>
            
            <div className="text-center">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
                darkMode ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Bookmark className="h-6 w-6" />
              </div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>
                Prompt Safe {isGuestMode && <span className="text-xs font-bold text-emerald-500 ml-1">(게스트)</span>}
              </h1>
              <p className="mt-1 text-xs font-bold text-indigo-500 tracking-tight">
                {getSubTitle()}
              </p>
            </div>
          </div>

          {/* ----------------- [탭 1. 작성하기] ----------------- */}
          {activeTab === 'write' && (
            user ? (
              <form className="space-y-4 min-h-[420px]" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">제목</label>
                  <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-all duration-200 ${
                      darkMode 
                        ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500' 
                        : 'border-slate-200 bg-[#f0f4f9] text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">프롬프트 내용</label>
                  <textarea
                    rows={3}
                    placeholder="프롬프트 내용을 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm font-mono outline-none transition-all duration-200 ${
                      darkMode 
                        ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500' 
                        : 'border-slate-200 bg-[#f0f4f9] text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">카테고리 대분류</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSelectedTags([]); 
                      }}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200 ${
                        darkMode 
                          ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] focus:border-indigo-500' 
                          : 'border-[#e0e2e6] bg-[#f0f4f9] text-[#1f1f1f] focus:border-indigo-500 focus:bg-white'
                      }`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className={darkMode ? 'bg-[#1e1f20]' : 'bg-white'}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 rounded border-[#3c4043] text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-xs font-bold ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-600'}`}>모두에게 공유하기</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">추천 태그</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
                    {CATEGORY_MAP[category].map((subTag) => {
                      const isSelected = selectedTags.includes(subTag);
                      return (
                        <button
                          key={subTag}
                          type="button"
                          onClick={() => handleTagChipClick(subTag)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 ${
                            isSelected ? 'bg-indigo-600 text-white shadow-sm' : darkMode ? 'bg-[#2d2f31] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isSelected ? `✓ ${subTag}` : `+ ${subTag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#80868b] uppercase tracking-wider">직접 태그 입력</label>
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-[#80868b]">
                        <Tag className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="그 외 태그 입력 후 엔터"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={handleCustomTagAdd}
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-200 ${
                          darkMode ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3]' : 'border-slate-200 bg-[#f0f4f9] text-[#1f1f1f]'
                        }`}
                      />
                    </div>
                    
                    {selectedTags.length > 0 && (
                      <div className={`flex flex-wrap gap-1 p-2 rounded-xl border ${
                        darkMode ? 'bg-[#131314] border-[#282a2d]' : 'bg-slate-50 border-slate-100'
                      }`}>
                        {selectedTags.map((tag) => (
                          <span key={tag} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                            darkMode ? 'bg-[#1e1f20] border-[#3c4043] text-indigo-400' : 'bg-white border-slate-200 text-indigo-600'
                          }`}>
                            #{tag}
                            <button type="button" onClick={() => handleTagChipClick(tag)} className="text-slate-400 hover:text-red-500 font-bold ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98] ${
                    darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-[#1f1f1f] text-white hover:bg-slate-800'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  저장하기 {isPublic ? '(공개 공유)' : '(나만 보기)'}
                </button>
              </form>
            ) : (
              /* 비로그인 게스트가 '만들기' 누를 시 로그인 안내 뷰 */
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center px-4">
                <span className="text-5xl block mb-4">🔒</span>
                <h3 className={`text-lg font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  나만의 프롬프트 보관소 만들기
                </h3>
                <p className={`text-xs max-w-[280px] leading-relaxed mb-6 ${darkMode ? 'text-[#80868b]' : 'text-slate-500'}`}>
                  이메일 로그인 후 나만의 특급 레시피 프롬프트를 보관하고 자유롭게 분류해보세요!
                </p>
                <button
                  type="button"
                  onClick={() => setIsGuestMode(false)}
                  className="rounded-xl px-6 py-2.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md transition-all"
                >
                  로그인 및 가입 화면으로 가기
                </button>
              </div>
            )
          )}

          {/* ----------------- [탭 2. 내 보관함] ----------------- */}
          {activeTab === 'library' && (
            user ? (
              <div className="min-h-[420px] flex flex-col">
                {uniqueTags.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 select-none">
                    {uniqueTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${
                          selectedTag === tag
                            ? 'bg-indigo-600 text-white shadow-md'
                            : darkMode ? 'bg-[#2d2f31] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tag === '전체' ? tag : `#${tag}`}
                      </button>
                    ))}
                  </div>
                )}

                <section className="space-y-4 max-h-[350px] overflow-y-auto pr-1 flex-1">
                  {filteredMySnippets.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 px-4 text-center ${
                      darkMode ? 'border-[#282a2d] bg-[#131314]/30' : 'border-slate-200 bg-slate-50/30'
                    }`}>
                      <div className="mb-3 rounded-full p-2.5 text-slate-300">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-[#80868b]">
                        {selectedTag === '전체' ? '등록된 스니펫이 없습니다.' : '해당 태그의 스니펫이 없습니다.'}
                      </p>
                    </div>
                  ) : (
                    filteredMySnippets.map((snippet) => (
                      <div key={snippet.id} className={`p-4 border rounded-xl transition-all duration-200 animate-fadeIn ${
                        darkMode ? 'border-[#282a2d] bg-[#131314]/40' : 'border-slate-100 bg-slate-50/50'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>{snippet.title}</h3>
                            {snippet.is_public ? (
                              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                <Globe className="h-2.5 w-2.5" /> 공유됨
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-[#80868b] bg-slate-150/10 px-1.5 py-0.5 rounded">
                                <Lock className="h-2.5 w-2.5" /> 비공개
                              </span>
                            )}
                            <span className="text-[9px] font-semibold text-indigo-450 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              {snippet.category}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleCopy(snippet.id, snippet.content, snippet.title)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 active:scale-75 ${
                              copiedId === snippet.id
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : darkMode ? 'bg-[#131314] border-[#282a2d] text-[#80868b]' : 'bg-white border-slate-150 text-slate-400'
                            }`}
                          >
                            {copiedId === snippet.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>

                        <p className={`text-xs p-2.5 border rounded-lg font-mono whitespace-pre-wrap mb-2 ${
                          darkMode ? 'bg-[#1e1f20]/60 border-[#282a2d] text-[#e3e3e3]' : 'bg-white border-slate-100 text-slate-800'
                        }`}>
                          {snippet.content}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {snippet.tags?.map((tag) => (
                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                              darkMode ? 'bg-[#2d2f31] text-[#c4c7c5]' : 'bg-slate-100 text-slate-600'
                            }`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </section>
              </div>
            ) : (
              /* 비로그인 게스트가 '내 보관함' 누를 시 로그인 안내 뷰 */
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center px-4">
                <span className="text-5xl block mb-4">💼</span>
                <h3 className={`text-lg font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  안전한 금고 열기
                </h3>
                <p className={`text-xs max-w-[280px] leading-relaxed mb-6 ${darkMode ? 'text-[#80868b]' : 'text-slate-500'}`}>
                  내 보관함은 암호화 잠금 처리되는 개인 프라이빗 공간입니다. 계정을 만들어 로그인 하시면 바로 활성화됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => setIsGuestMode(false)}
                  className="rounded-xl px-6 py-2.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md transition-all"
                >
                  로그인 및 가입 화면으로 가기
                </button>
              </div>
            )
          )}

          {/* ----------------- [탭 3. 탐색] (로그인, 비로그인 관계없이 모두 자유롭게 제공!) ----------------- */}
          {activeTab === 'explore' && (
            <div className="min-h-[420px] flex flex-col">
              {/* 대분류 가로 스크롤바 활성화 */}
              <div className={`flex gap-1.5 overflow-x-auto pb-3 mb-2 select-none border-b ${
                darkMode ? 'border-[#282a2d]' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => handleExploreCategoryChange('전체')}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${
                    selectedExploreCategory === '전체' ? 'bg-emerald-600 text-white shadow-md' : darkMode ? 'bg-[#2d2f31] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  전체
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleExploreCategoryChange(cat)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${
                      selectedExploreCategory === cat ? 'bg-emerald-600 text-white shadow-md' : darkMode ? 'bg-[#2d2f31] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {selectedExploreCategory !== '전체' && (
                /* 소분류 가로 스크롤바 활성화 */
                <div className="flex gap-1 overflow-x-auto pb-3 mb-2.5 select-none animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => setSelectedExploreSubTag('전체')}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                      selectedExploreSubTag === '전체' 
                        ? 'bg-[#2d2f31] text-white' 
                        : darkMode ? 'bg-[#131314] text-[#80868b]' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    소분류 전체
                  </button>
                  {CATEGORY_MAP[selectedExploreCategory].map((subTag) => (
                    <button
                      key={subTag}
                      type="button"
                      onClick={() => setSelectedExploreSubTag(subTag)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                        selectedExploreSubTag === subTag 
                          ? 'bg-indigo-600 text-white' 
                          : darkMode ? 'bg-[#131314] text-[#80868b]' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      #{subTag}
                    </button>
                  ))}
                </div>
              )}

              <section className="space-y-4 max-h-[310px] overflow-y-auto pr-1 flex-1">
                {filteredExploreSnippets.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 px-4 text-center ${
                    darkMode ? 'border-[#282a2d] bg-[#131314]/30' : 'border-slate-200 bg-slate-50/30'
                  }`}>
                    <div className="mb-3 rounded-full p-2.5 text-[#80868b]">
                      <Globe className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-[#80868b]">
                      {selectedExploreSubTag === '전체'
                        ? `'${selectedExploreCategory}' 분야에 공유된 프롬프트가 없습니다.`
                        : `'${selectedExploreCategory} > #${selectedExploreSubTag}'에 해당하는 프롬프트가 없습니다.`}
                    </p>
                  </div>
                ) : (
                  filteredExploreSnippets.map((snippet) => (
                    <div key={snippet.id} className={`p-4 border rounded-xl transition-all duration-200 animate-fadeIn ${
                      darkMode ? 'border-emerald-950/20 bg-emerald-950/10' : 'border-emerald-50 bg-emerald-50/10'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-[#1f1f1f]'}`}>{snippet.title}</h3>
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {snippet.category}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleCopy(snippet.id, snippet.content, snippet.title)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 active:scale-75 ${
                            copiedId === snippet.id
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : darkMode ? 'bg-[#131314] border-[#282a2d] text-[#80868b]' : 'bg-white border-slate-150 text-slate-400'
                          }`}
                        >
                          {copiedId === snippet.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>

                      <p className={`text-xs p-2.5 border rounded-lg font-mono whitespace-pre-wrap mb-2 ${
                        darkMode ? 'bg-[#131314]/60 border-[#282a2d] text-[#e3e3e3]' : 'bg-white border-slate-100 text-slate-800'
                      }`}>
                        {snippet.content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags?.map((tag) => (
                          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            darkMode ? 'bg-indigo-950/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </section>
            </div>
          )}

          <hr className={`my-4 border-dashed ${darkMode ? 'border-[#282a2d]' : 'border-slate-100'}`} />

          {/* 하단 탭 메뉴 */}
          <div className="flex items-center justify-around pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex flex-col items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                activeTab === 'write' ? 'text-indigo-500 scale-105' : 'text-[#80868b] hover:text-[#c4c7c5]'
              }`}
            >
              <PenTool className="h-5 w-5" />
              <span>만들기</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex flex-col items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                activeTab === 'library' ? 'text-indigo-500 scale-105' : 'text-[#80868b] hover:text-[#c4c7c5]'
              }`}
            >
              <Folder className="h-5 w-5" />
              <span>내보관함 ({user ? mySnippets.length : 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`flex flex-col items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                activeTab === 'explore' ? 'text-emerald-500 scale-105' : 'text-[#80868b] hover:text-[#c4c7c5]'
              }`}
            >
              <Compass className="h-5 w-5" />
              <span>탐색 ({publicSnippets.length})</span>
            </button>

            <a
              href="https://www.threads.net/@jinsiokr"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1.5 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                darkMode ? 'text-[#80868b] hover:text-white' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <img 
                src="/threads-logo.png" 
                alt="Threads" 
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.nextSibling as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <span className="hidden h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-black">
                @
              </span>
              <span>제작자 Threads</span>
            </a>
          </div>

        </div>
      )}
    </div>
  );
}