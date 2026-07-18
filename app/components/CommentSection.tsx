'use client';

import { useState, type FormEvent } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { formatRelativeTime } from '@/lib/utils';
import type { CommentRow } from '@/lib/types';

interface CommentSectionProps {
  comments: CommentRow[];
  getUsername: (userId: string) => string;
  currentUserId: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  posting: boolean;
  onSubmit: (content: string) => void;
  onDelete: (commentId: string) => void;
}

export default function CommentSection({
  comments,
  getUsername,
  currentUserId,
  isLoggedIn,
  isAdmin,
  posting,
  onSubmit,
  onDelete,
}: CommentSectionProps) {
  const { darkMode } = useTheme();
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };

  const sorted = [...comments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#80868b]">
        <MessageCircle className="h-3.5 w-3.5" /> 댓글 {comments.length}개
      </h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 남겨보세요"
            disabled={posting}
            className={`flex-1 rounded-xl border px-3.5 py-2 text-sm outline-none transition-all duration-200 disabled:opacity-50 ${
              darkMode ? 'border-[#3c4043] bg-[#131314] text-[#e3e3e3] placeholder-[#606468] focus:border-indigo-500' : 'border-slate-200 bg-[#f0f4f9] text-[#1f1f1f] placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-indigo-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className={`mb-4 rounded-xl border border-dashed px-3.5 py-2.5 text-xs font-medium ${darkMode ? 'border-[#282a2d] text-[#80868b]' : 'border-slate-200 text-slate-500'}`}>
          로그인 후 댓글을 남길 수 있습니다.
        </p>
      )}

      {sorted.length === 0 ? (
        <p className="py-2 text-center text-xs text-[#80868b]">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white">
                {getUsername(comment.user_id).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">{getUsername(comment.user_id)}</span>
                  <span className="text-[10px] text-[#80868b]">{formatRelativeTime(new Date(comment.created_at).getTime())}</span>
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-[#c4c7c5]' : 'text-slate-600'}`}>{comment.content}</p>
              </div>
              {(currentUserId === comment.user_id || isAdmin) && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="shrink-0 rounded-lg p-1 text-[#80868b] transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
