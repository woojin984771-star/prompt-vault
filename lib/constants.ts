export const CATEGORY_MAP: Record<string, string[]> = {
  'AI & Prompt': ['GPT 제작', '시스템 프롬프트', '에이전트 설계', 'RAG', '자동화', '프롬프트 최적화'],
  'Business': ['마케팅', '세일즈', '전략', '브랜딩', '고객관리'],
  'Creation': ['글쓰기', '콘텐츠', '디자인', '이미지', '영상', '음악'],
  'Development': ['프로그래밍', '데이터 분석', 'AI 개발', '시스템 설계', '보안'],
  'Knowledge': ['교육', '연구', '논문', '번역', '학습'],
  'Life': ['생산성', '자기계발', '커리어', '금융', '건강'],
};

export const CATEGORIES = Object.keys(CATEGORY_MAP);

export interface AiModelInfo {
  id: string;
  name: string;
  vendor: string;
  desc: string;
  badge?: 'New';
  accentClass: string;
}

export const AI_MODELS: AiModelInfo[] = [
  { id: 'chatgpt', name: 'ChatGPT', vendor: 'OpenAI', desc: '멀티모달', accentClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  { id: 'claude', name: 'Claude', vendor: 'Anthropic', desc: '코딩 특화', accentClass: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
  { id: 'gemini', name: 'Gemini', vendor: 'Google', desc: '멀티모달', accentClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  { id: 'deepseek', name: 'DeepSeek', vendor: 'DeepSeek', desc: '추론 특화', accentClass: 'bg-sky-500/15 text-sky-500 border-sky-500/30' },
  { id: 'midjourney', name: 'Midjourney', vendor: 'Midjourney', desc: '이미지 생성', badge: 'New', accentClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', vendor: 'Stability AI', desc: '이미지 생성', badge: 'New', accentClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  { id: 'perplexity', name: 'Perplexity', vendor: 'Perplexity', desc: '검색 특화', accentClass: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30' },
  { id: 'grok', name: 'Grok', vendor: 'xAI', desc: '실시간 정보', accentClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  { id: 'llama', name: 'Llama', vendor: 'Meta', desc: '오픈소스', accentClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  { id: 'general', name: 'General', vendor: '범용', desc: '모델 무관', accentClass: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30' },
];

export const AI_MODEL_MAP: Record<string, AiModelInfo> = Object.fromEntries(
  AI_MODELS.map((model) => [model.id, model])
);

export const CATEGORY_GRADIENTS: Record<string, string> = {
  'AI & Prompt': 'from-indigo-500 via-purple-500 to-fuchsia-500',
  'Business': 'from-amber-500 via-orange-500 to-rose-500',
  'Creation': 'from-pink-500 via-rose-500 to-red-500',
  'Development': 'from-sky-500 via-blue-500 to-indigo-500',
  'Knowledge': 'from-emerald-500 via-teal-500 to-cyan-500',
  'Life': 'from-violet-500 via-purple-500 to-indigo-500',
};

export const CATEGORY_BADGE_CLASS: Record<string, string> = {
  'AI & Prompt': 'bg-indigo-500/15 text-indigo-400',
  'Business': 'bg-amber-500/15 text-amber-400',
  'Creation': 'bg-rose-500/15 text-rose-400',
  'Development': 'bg-sky-500/15 text-sky-400',
  'Knowledge': 'bg-emerald-500/15 text-emerald-400',
  'Life': 'bg-violet-500/15 text-violet-400',
};

export const CATEGORY_ACCENT_TEXT: Record<string, string> = {
  'AI & Prompt': 'text-indigo-400',
  'Business': 'text-amber-400',
  'Creation': 'text-rose-400',
  'Development': 'text-sky-400',
  'Knowledge': 'text-emerald-400',
  'Life': 'text-violet-400',
};
