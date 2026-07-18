'use client';

import { Tag, Settings2, RefreshCw, Heart, Bookmark, Copy, FilePlus, Sparkles, History, MessageCircle, UserPlus, FolderPlus, Trophy } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { AI_MODEL_MAP } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityItem } from '@/lib/types';

export interface CreatorRankEntry {
  userId: string;
  username: string;
  followerCount: number;
}

interface RightRailProps {
  popularTags: string[];
  onSelectTag: (tag: string) => void;
  recommendedModelIds: string[];
  activityLog: ActivityItem[];
  topCreators: CreatorRankEntry[];
  onGoSettings: () => void;
  onClearActivity: () => void;
}

const ACTIVITY_ICON: Record<ActivityItem['kind'], typeof Heart> = {
  like: Heart,
  unlike: Heart,
  bookmark: Bookmark,
  unbookmark: Bookmark,
  copy: Copy,
  create: FilePlus,
  comment: MessageCircle,
  follow: UserPlus,
  collect: FolderPlus,
};

const RANK_BADGE_CLASS = [
  'bg-amber-400 text-amber-950',
  'bg-slate-300 text-slate-800',
  'bg-orange-400 text-orange-950',
];

export default function RightRail({
  popularTags,
  onSelectTag,
  recommendedModelIds,
  activityLog,
  topCreators,
  onGoSettings,
  onClearActivity,
}: RightRailProps) {
  const { darkMode } = useTheme();

  const sectionCard = darkMode ? 'border-[#22232a] bg-[#111217]' : 'border-slate-200 bg-white';

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l px-4 py-5 lg:flex"
      style={{ borderColor: darkMode ? '#22232a' : '#e2e8f0' }}
    >
      <section className={`rounded-2xl border p-4 animate-slideInRight ${sectionCard}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#80868b]">인기 크리에이터</h3>
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
        </div>
        {topCreators.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-3 text-center">
            <Trophy className="h-5 w-5 text-[#3c4043]" />
            <p className="text-xs text-[#80868b]">아직 랭킹에 오른 크리에이터가 없습니다.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {topCreators.map((creator, index) => (
              <li key={creator.userId} className="flex items-center gap-2.5">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                  RANK_BADGE_CLASS[index] ?? (darkMode ? 'bg-[#282a2d] text-[#c4c7c5]' : 'bg-slate-100 text-slate-500')
                }`}>
                  {index + 1}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white">
                  {creator.username.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold">{creator.username}</span>
                <span className="shrink-0 text-[10px] font-semibold text-[#80868b]">팔로워 {creator.followerCount}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`rounded-2xl border p-4 animate-slideInRight ${sectionCard}`} style={{ animationDelay: '30ms', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#80868b]">인기 태그</h3>
          <Tag className="h-3.5 w-3.5 text-[#80868b]" />
        </div>
        {popularTags.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-3 text-center">
            <Tag className="h-5 w-5 text-[#3c4043]" />
            <p className="text-xs text-[#80868b]">아직 공유된 태그가 없습니다.<br />첫 프롬프트를 공유해 보세요!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 active:scale-95 ${
                  darkMode ? 'bg-[#1e1f24] text-[#c4c7c5] hover:bg-indigo-600/30 hover:text-indigo-300' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={`rounded-2xl border p-4 animate-slideInRight ${sectionCard}`} style={{ animationDelay: '60ms', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#80868b]">추천 AI 모델</h3>
          <button type="button" onClick={onGoSettings} title="설정에서 변경" className="text-[#80868b] transition-colors hover:text-indigo-400">
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {recommendedModelIds.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <Sparkles className="h-5 w-5 text-[#3c4043]" />
            <p className="text-xs text-[#80868b]">표시할 모델이 없습니다.</p>
            <button type="button" onClick={onGoSettings} className="text-[11px] font-bold text-indigo-400 hover:underline">설정에서 선택하기</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recommendedModelIds.map((modelId) => {
              const model = AI_MODEL_MAP[modelId];
              if (!model) return null;
              return (
                <div key={modelId} className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 transition-all duration-150 hover:-translate-y-0.5 ${model.accentClass}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/10 text-[11px] font-black">
                    {model.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{model.name}</p>
                    <p className="truncate text-[10px] opacity-80">{model.vendor} · {model.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={`rounded-2xl border p-4 animate-slideInRight ${sectionCard}`} style={{ animationDelay: '120ms', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#80868b]">최근 활동</h3>
          <button type="button" onClick={onClearActivity} title="초기화" className="text-[#80868b] transition-colors hover:text-indigo-400">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        {activityLog.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-3 text-center">
            <History className="h-5 w-5 text-[#3c4043]" />
            <p className="text-xs text-[#80868b]">아직 활동 내역이 없습니다.<br />좋아요, 북마크, 복사가 여기 기록돼요.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {activityLog.slice(0, 6).map((item) => {
              const Icon = ACTIVITY_ICON[item.kind];
              return (
                <li key={item.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400">
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs leading-snug">{item.message}</p>
                    <p className="text-[10px] text-[#80868b]">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
