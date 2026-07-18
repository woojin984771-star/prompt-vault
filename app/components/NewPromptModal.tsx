'use client';

import { useEffect, useState, type DragEvent } from 'react';
import { X, Camera, ImageOff } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CATEGORY_MAP, CATEGORIES, AI_MODELS } from '@/lib/constants';
import { computeRegisterProgress } from '@/lib/utils';

export interface NewPromptPayload {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  aiModels: string[];
  isPublic: boolean;
  imageFile: File | null;
}

interface NewPromptModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewPromptPayload) => void;
  submitting: boolean;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function NewPromptModal({ open, onClose, onSubmit, submitting }: NewPromptModalProps) {
  const { darkMode } = useTheme();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [extraTags, setExtraTags] = useState<string[]>([]);
  const [aiModels, setAiModels] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');

  // imageFile 변경에 맞춰 미리보기 objectURL을 동기화하는 이펙트(생성/해제 쌍이 필요해 effect 밖으로 뺄 수 없다).
  useEffect(() => {
    if (!imageFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setCategory(CATEGORIES[0]);
    setSubCategory('');
    setTagInput('');
    setExtraTags([]);
    setAiModels([]);
    setIsPublic(false);
    setImageFile(null);
    setImageError('');
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const progress = computeRegisterProgress({ title, summary, content, subCategory, aiModels });

  const handleCategoryChange = (next: string) => {
    setCategory(next);
    setSubCategory('');
  };

  const toggleAiModel = (id: string) => {
    setAiModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(',', '');
      if (clean && !extraTags.includes(clean)) {
        setExtraTags((prev) => [...prev, clean]);
      }
      setTagInput('');
    }
  };

  const applyImageFile = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImageError('');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('이미지 용량은 5MB 이하여야 합니다.');
      return;
    }
    setImageError('');
    setImageFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    applyImageFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !subCategory) return;
    const tags = [subCategory, ...extraTags.filter((t) => t !== subCategory)];
    onSubmit({ title: title.trim(), summary: summary.trim(), content, category, tags, aiModels, isPublic, imageFile });
    resetForm();
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && subCategory.length > 0 && !submitting;

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 ${
    darkMode
      ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500'
      : 'border-slate-200 bg-[#f0f4f9] text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
  }`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-backdropFadeIn bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className={`relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border shadow-2xl animate-modalSlideUp ${
        darkMode ? 'border-[#282a2d] bg-[#16171b] text-[#e3e3e3]' : 'border-slate-200 bg-white text-[#1f1f1f]'
      }`}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${darkMode ? 'border-[#22232a]' : 'border-slate-100'}`}>
          <div>
            <h2 className="text-base font-extrabold">새 프롬프트 등록</h2>
            <div className="mt-2 flex items-center gap-2">
              <div className={`h-1.5 w-40 overflow-hidden rounded-full ${darkMode ? 'bg-[#282a2d]' : 'bg-slate-100'}`}>
                <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-[#80868b]">{progress}% 완료</span>
            </div>
          </div>
          <button type="button" onClick={handleClose} className={`rounded-lg p-1.5 ${darkMode ? 'text-[#80868b] hover:bg-[#22232a]' : 'text-slate-400 hover:bg-slate-100'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">제목</label>
            <input type="text" placeholder="프롬프트의 이름을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">핵심 요약</label>
            <input type="text" placeholder="프롬프트의 주요 기능을 한 줄로 설명해주세요" value={summary} onChange={(e) => setSummary(e.target.value)} className={inputClass} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">프롬프트 본문</label>
            <textarea
              rows={4}
              placeholder="프롬프트 내용을 입력하세요 (Markdown 지원)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClass} resize-none font-mono`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">대분류</label>
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className={`${inputClass} font-semibold`}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">소분류</label>
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={`${inputClass} font-semibold`}>
                <option value="">선택하세요</option>
                {CATEGORY_MAP[category].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">추가 태그</label>
            <input
              type="text"
              placeholder="그 외 태그 입력 후 엔터"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className={inputClass}
            />
            {extraTags.length > 0 && (
              <div className={`flex flex-wrap gap-1 rounded-xl border p-2 ${darkMode ? 'border-[#282a2d] bg-[#131314]' : 'border-slate-100 bg-slate-50'}`}>
                {extraTags.map((tag) => (
                  <span key={tag} className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                    darkMode ? 'border-[#3c4043] bg-[#1e1f20] text-indigo-400' : 'border-slate-200 bg-white text-indigo-600'
                  }`}>
                    #{tag}
                    <button type="button" onClick={() => setExtraTags((prev) => prev.filter((t) => t !== tag))} className="ml-1 font-bold text-slate-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">지원 AI 모델</label>
            <div className="flex flex-wrap gap-2">
              {AI_MODELS.map((model) => {
                const selected = aiModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => toggleAiModel(model.id)}
                    className={`flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                      selected
                        ? `scale-105 shadow-sm ${model.accentClass}`
                        : darkMode ? 'border-[#3c4043] text-[#c4c7c5] hover:bg-[#1e1f20]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {model.name}
                    {model.badge && <span className="rounded bg-indigo-500 px-1 text-[8px] font-black text-white">{model.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">대표 이미지</label>
            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors duration-150 ${
                isDragging ? 'border-indigo-500 bg-indigo-500/5' : darkMode ? 'border-[#3c4043]' : 'border-slate-200'
              }`}
            >
              <input type="file" accept="image/*" className="hidden" onChange={(e) => applyImageFile(e.target.files?.[0] ?? null)} />
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="대표 이미지 미리보기" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <Camera className="h-5 w-5 text-[#80868b]" />
                  <span className="text-xs font-semibold text-[#80868b]">이미지 파일을 여기에 드래그하거나 클릭하여 업로드하세요</span>
                  <span className="text-[10px] text-[#606468]">(5MB 이하, 미선택 시 대표 컬러가 자동 지정)</span>
                </>
              )}
            </label>
            {imageError && (
              <p className="flex items-center gap-1 text-[10px] font-semibold text-red-500"><ImageOff className="h-3 w-3" /> {imageError}</p>
            )}
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-[#3c4043] text-indigo-600 focus:ring-indigo-500" />
            <span className={`text-xs font-bold ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-600'}`}>모두에게 공유하기</span>
          </label>
        </div>

        <div className={`flex gap-3 border-t px-6 py-4 ${darkMode ? 'border-[#22232a]' : 'border-slate-100'}`}>
          <button
            type="button"
            onClick={handleClose}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${darkMode ? 'bg-[#1e1f24] text-[#c4c7c5] hover:bg-[#282a2d]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:bg-indigo-500"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
