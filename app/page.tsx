'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Tag, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Snippet {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
}

export default function PromptSafePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // 1. Supabase에서 데이터 가져오기
  const fetchSnippets = async () => {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('불러오기 실패:', error.message);
    } else {
      setSnippets(data || []);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  // 2. 데이터 저장 기능
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert('제목과 본문을 입력하세요.');

    const tagsArray = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    const { error } = await supabase.from('snippets').insert([
      {
        title,
        content,
        tags: tagsArray,
      },
    ]);

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
      fetchSnippets(); // 목록 갱신
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 antialiased text-slate-800">
      {/* 메인 카드 컨테이너 */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/80 transition-all duration-300">
        
        {/* 상단 헤더 영역 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Bookmark className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Prompt Safe
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            나의 AI 비서가 영리해지는 시간
          </p>
        </div>

        {/* 입력 폼 영역 */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* 제목 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">제목</label>
            <div className="relative">
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 text-black"
              />
            </div>
          </div>

          {/* 프롬프트 내용 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">프롬프트 내용</label>
            <textarea
              rows={4}
              placeholder="프롬프트 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 text-black font-mono"
            />
          </div>

          {/* 태그 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">태그</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Tag className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="gpt, 블로그 (쉼표로 구분)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 text-black"
              />
            </div>
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            저장하기
          </button>
        </form>

        {/* 구분선 */}
        <hr className="my-8 border-dashed border-slate-200" />

        {/* 하단 스니펫 리스트 영역 */}
        <section className="space-y-4 max-h-60 overflow-y-auto pr-1">
          {snippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 py-8 px-4 text-center">
              <div className="mb-3 rounded-full bg-white p-2.5 shadow-sm text-slate-300">
                <FolderOpen className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-400">
                등록된 스니펫이 없습니다.
              </p>
              <p className="mt-0.5 text-xs text-slate-400/70">
                위 폼을 작성하여 첫 번째 프롬프트를 저장해 보세요!
              </p>
            </div>
          ) : (
            snippets.map((snippet) => (
              <div key={snippet.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                <h3 className="font-semibold text-sm text-slate-900 mb-1">{snippet.title}</h3>
                <p className="text-slate-600 text-xs bg-white p-2.5 border border-slate-100 rounded-lg font-mono whitespace-pre-wrap mb-2 text-black">
                  {snippet.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {snippet.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  );
}