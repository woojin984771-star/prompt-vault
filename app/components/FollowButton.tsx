'use client';

import { UserPlus, UserCheck } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface FollowButtonProps {
  username: string;
  followerCount: number;
  isFollowing: boolean;
  isOwnPrompt: boolean;
  isLoggedIn: boolean;
  onToggleFollow: () => void;
}

export default function FollowButton({
  username,
  followerCount,
  isFollowing,
  isOwnPrompt,
  isLoggedIn,
  onToggleFollow,
}: FollowButtonProps) {
  const { darkMode } = useTheme();

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${darkMode ? 'border-[#22232a] bg-[#16171b]' : 'border-slate-200 bg-slate-50'}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
        {username.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{username}</p>
        <p className="truncate text-[10px] text-[#80868b]">팔로워 {followerCount}명</p>
      </div>
      {!isOwnPrompt && isLoggedIn && (
        <button
          type="button"
          onClick={onToggleFollow}
          className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 active:scale-95 ${
            isFollowing
              ? darkMode ? 'bg-[#282a2d] text-[#c4c7c5]' : 'bg-slate-200 text-slate-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
          {isFollowing ? '팔로잉' : '팔로우'}
        </button>
      )}
    </div>
  );
}
