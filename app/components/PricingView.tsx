'use client';

import { Check, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface PricingViewProps {
  onBack: () => void;
  onSelectPaidPlan: () => void;
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'AI 프롬프트 관리를 시작하는 입문자를 위한 기본 플랜.',
    features: ['최대 10개 프롬프트 저장', '기본 검색 기능', '커뮤니티 공유 프롬프트 열람'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    desc: '개인 생산성을 높이고 싶은 전문가를 위한 최적의 플랜.',
    features: ['무제한 프롬프트 저장', 'AI 추천 엔진 접근', '프라이빗 공유 및 권한 관리'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    desc: '팀 협업과 고급 보안 기능이 필요한 기업을 위한 완벽한 솔루션.',
    features: ['팀 워크스페이스 제공(최대 10명)', 'API 접근 및 연동', '무제한 버전 관리'],
    highlight: false,
  },
];

export default function PricingView({ onBack, onSelectPaidPlan }: PricingViewProps) {
  const { darkMode } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className={`flex w-fit items-center gap-1.5 text-xs font-bold ${darkMode ? 'text-[#9aa0a6] hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 돌아가기
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Prompt Vault 프리미엄</h2>
        <p className="mt-2 text-sm text-[#80868b]">AI 생산성을 극대화하는 강력한 기능을 경험하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
              plan.highlight
                ? 'border-indigo-500 bg-indigo-500/5 shadow-xl shadow-indigo-950/20'
                : darkMode ? 'border-[#22232a] bg-[#111217]' : 'border-slate-200 bg-white'
            }`}
          >
            {plan.name === 'Free' && (
              <span className="absolute right-5 top-5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black text-emerald-400">현재 사용 중</span>
            )}
            <h3 className="text-lg font-extrabold">{plan.name} 플랜</h3>
            <p className="mt-2 text-3xl font-black">{plan.price}<span className="text-sm font-semibold text-[#80868b]"> / 월</span></p>
            <p className="mt-3 text-xs leading-relaxed text-[#80868b]">{plan.desc}</p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs font-medium">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={plan.name === 'Free'}
              onClick={onSelectPaidPlan}
              className={`mt-6 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed ${
                plan.name === 'Free'
                  ? darkMode ? 'bg-[#1e1f24] text-[#606468]' : 'bg-slate-100 text-slate-400'
                  : plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : darkMode ? 'bg-[#1e1f24] text-white hover:bg-[#282a2d]' : 'bg-[#1f1f1f] text-white hover:bg-slate-800'
              }`}
            >
              {plan.name === 'Free' ? '현재 플랜' : '업그레이드 하기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
