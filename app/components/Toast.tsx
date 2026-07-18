'use client';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info';
}

export default function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={`fixed top-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-2xl px-5 py-3.5 shadow-xl border backdrop-blur-md transition-all duration-300 ease-out ${
        toast.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      } ${toast.type === 'success' ? 'bg-[#1e1f20] border-[#282a2d] text-white' : 'bg-red-500/95 border-red-400 text-white'}`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${toast.type === 'success' ? 'bg-indigo-500 text-white' : 'bg-white text-red-500'}`}>
        {toast.type === 'success' ? '✓' : '!'}
      </span>
      <span className="text-xs font-semibold tracking-tight whitespace-nowrap">{toast.message}</span>
    </div>
  );
}

export type { ToastState };
