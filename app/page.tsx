'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/lib/theme';
import { matchesSearch, normalizeSnippet, formatFallbackUsername } from '@/lib/utils';
import type {
  Snippet,
  LikeRow,
  BookmarkRow,
  CommentRow,
  FollowRow,
  Profile,
  Collection,
  CollectionItem,
  ActivityItem,
  ActivityKind,
  ActiveView,
  LibrarySubTab,
  SortOrder,
} from '@/lib/types';

import Toast, { type ToastState } from './components/Toast';
import AuthScreen from './components/AuthScreen';
import AppShell from './components/AppShell';
import SharedView from './components/SharedView';
import RecommendedView from './components/RecommendedView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';
import PricingView from './components/PricingView';
import NewPromptModal, { type NewPromptPayload } from './components/NewPromptModal';
import PromptDetailModal from './components/PromptDetailModal';
import type { CreatorRankEntry } from './components/RightRail';

const DEFAULT_RECOMMENDED_MODELS = ['chatgpt', 'claude', 'deepseek'];

function PromptVaultApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [likes, setLikes] = useState<LikeRow[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [follows, setFollows] = useState<FollowRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [commentPosting, setCommentPosting] = useState(false);
  const viewedSnippetIdsRef = useRef<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);

  const [activeView, setActiveView] = useState<ActiveView>('shared');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [submittingPrompt, setSubmittingPrompt] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const [librarySubTab, setLibrarySubTab] = useState<LibrarySubTab>('mine');
  const [selectedTag, setSelectedTag] = useState('전체');
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [selectedSharedCategory, setSelectedSharedCategory] = useState('전체');
  const [selectedSharedSubTag, setSelectedSharedSubTag] = useState('전체');
  const [sharedSortOrder, setSharedSortOrder] = useState<SortOrder>('latest');
  const [recommendedSortOrder, setRecommendedSortOrder] = useState<SortOrder>('popular');

  const [recommendedModelIds, setRecommendedModelIds] = useState<string[]>(DEFAULT_RECOMMENDED_MODELS);

  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2300);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const stored = localStorage.getItem('recommendedModels');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // 클라이언트 마운트 이후에만 localStorage 값을 반영해 hydration mismatch를 피한다.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setRecommendedModelIds(parsed);
      } catch {
        // 저장된 값이 손상된 경우 기본값 유지
      }
    }
  }, []);

  const toggleRecommendedModel = (id: string) => {
    setRecommendedModelIds((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      localStorage.setItem('recommendedModels', JSON.stringify(next));
      return next;
    });
  };

  const pushActivity = (kind: ActivityKind, message: string) => {
    setActivityLog((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind, message, timestamp: Date.now() },
      ...prev,
    ].slice(0, 20));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) setIsGuestMode(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setIsGuestMode(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSnippets = async () => {
    try {
      const { data: publicData, error: publicError } = await supabase
        .from('snippets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (publicError) {
        console.error('데이터 에러:', publicError);
        return;
      }

      const fetchedPublicData = (publicData || []).map(normalizeSnippet);

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

        const fetchedMyData = (myData || []).map(normalizeSnippet);
        setSnippets([...fetchedMyData, ...fetchedPublicData.filter((ps) => ps.user_id !== user.id)]);

        const tagsArray = fetchedMyData.flatMap((s) => s.tags || []);
        setUniqueTags(['전체', ...Array.from(new Set(tagsArray))]);
      } else {
        setSnippets(fetchedPublicData);
      }
    } catch (err) {
      console.error('스니펫 로딩 실패:', err);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase.from('likes').select('*');
      if (error) {
        console.error('좋아요 데이터 에러:', error);
        return;
      }
      setLikes(data || []);
    } catch (err) {
      console.error('좋아요 로딩 실패:', err);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    try {
      const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', user.id);
      if (error) {
        console.error('북마크 데이터 에러:', error);
        return;
      }
      setBookmarks(data || []);
    } catch (err) {
      console.error('북마크 로딩 실패:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase.from('comments').select('*');
      if (error) {
        console.error('댓글 데이터 에러:', error);
        return;
      }
      setComments(data || []);
    } catch (err) {
      console.error('댓글 로딩 실패:', err);
    }
  };

  const fetchFollows = async () => {
    try {
      const { data, error } = await supabase.from('follows').select('*');
      if (error) {
        console.error('팔로우 데이터 에러:', error);
        return;
      }
      setFollows(data || []);
    } catch (err) {
      console.error('팔로우 로딩 실패:', err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('프로필 데이터 에러:', error);
        return;
      }
      setProfiles(data || []);
    } catch (err) {
      console.error('프로필 로딩 실패:', err);
    }
  };

  const fetchCollections = async () => {
    if (!user) {
      setCollections([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('컬렉션 데이터 에러:', error);
        return;
      }
      setCollections(data || []);
    } catch (err) {
      console.error('컬렉션 로딩 실패:', err);
    }
  };

  const fetchCollectionItems = async () => {
    if (!user) {
      setCollectionItems([]);
      return;
    }
    try {
      const { data, error } = await supabase.from('collection_items').select('*');
      if (error) {
        console.error('컬렉션 아이템 데이터 에러:', error);
        return;
      }
      setCollectionItems(data || []);
    } catch (err) {
      console.error('컬렉션 아이템 로딩 실패:', err);
    }
  };

  useEffect(() => {
    // user(로그인 상태) 변경 시 Supabase에서 최신 데이터를 다시 불러오는 데이터 패칭 이펙트.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSnippets();
    fetchLikes();
    fetchBookmarks();
    fetchComments();
    fetchFollows();
    fetchProfiles();
    fetchCollections();
    fetchCollectionItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return showToast('이메일과 비밀번호를 입력해 주세요.', 'info');

    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) {
          showToast(error.message, 'info');
        } else {
          setShowWelcome(true);
          setTimeout(() => setIsFadingOut(true), 1500);
          setTimeout(() => {
            setShowWelcome(false);
            setIsFadingOut(false);
          }, 2000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) {
          showToast('로그인 실패: 정보를 확인하세요.', 'info');
        } else {
          showToast('로그인에 성공했습니다! 환영합니다. 🎉');
        }
      }
    } catch {
      showToast('처리 중 오류가 발생했습니다.', 'info');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
    setIsGuestMode(false);
    setActiveView('shared');
    showToast('로그아웃되었습니다.');
  };

  const handleEnterGuestMode = () => {
    setIsGuestMode(true);
    setActiveView('shared');
    showToast('둘러보기 모드로 진입했습니다. 프롬프트 복사가 가능합니다!');
  };

  const handleGoToLogin = () => setIsGuestMode(false);

  const handleOpenNewPromptModal = () => {
    if (!user) {
      showToast('로그인해야 새 프롬프트를 등록할 수 있습니다.', 'info');
      return;
    }
    setModalOpen(true);
  };

  const handleCreatePrompt = async (payload: NewPromptPayload) => {
    if (!user) {
      showToast('로그인해야 새 프롬프트를 등록할 수 있습니다.', 'info');
      return;
    }

    setSubmittingPrompt(true);
    try {
      let imageUrl: string | null = null;

      if (payload.imageFile) {
        const ext = payload.imageFile.name.split('.').pop() || 'png';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('snippet-images').upload(path, payload.imageFile);
        if (uploadError) {
          showToast('이미지 업로드에 실패해 이미지 없이 저장합니다.', 'info');
        } else {
          const { data: publicUrlData } = supabase.storage.from('snippet-images').getPublicUrl(path);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase.from('snippets').insert([{
        title: payload.title,
        content: payload.content,
        summary: payload.summary || null,
        tags: payload.tags,
        ai_models: payload.aiModels,
        image_url: imageUrl,
        category: payload.category,
        is_public: payload.isPublic,
        user_id: user.id,
      }]);

      if (error) {
        showToast('저장에 실패했습니다.', 'info');
        return;
      }

      setModalOpen(false);
      await fetchSnippets();
      pushActivity('create', `"${payload.title}" 프롬프트를 등록했습니다.`);
      showToast(payload.isPublic ? '모두에게 프롬프트를 공유했습니다! 🚀' : '보관함에 안전하게 저장 완료! 🔒');
      setActiveView(payload.isPublic ? 'shared' : 'library');
    } catch (err) {
      console.error('프롬프트 저장 실패:', err);
      showToast('저장 중 오류가 발생했습니다.', 'info');
    } finally {
      setSubmittingPrompt(false);
    }
  };

  const handleCopy = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopiedId(snippet.id);
      pushActivity('copy', `"${snippet.title}" 프롬프트를 복사했습니다.`);
      showToast(`"${snippet.title}" 프롬프트가 복사되었습니다! 🎉`);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showToast('복사에 실패했습니다. 다시 시도해 주세요.', 'info');
    }
  };

  const handleToggleLike = async (snippetId: string) => {
    if (!user) return showToast('좋아요는 로그인 후 이용할 수 있습니다.', 'info');

    const target = snippets.find((s) => s.id === snippetId);
    const existing = likes.find((l) => l.snippet_id === snippetId && l.user_id === user.id);

    try {
      if (existing) {
        const { error } = await supabase.from('likes').delete().eq('id', existing.id);
        if (error) return showToast('좋아요 취소에 실패했습니다.', 'info');
        setLikes((prev) => prev.filter((l) => l.id !== existing.id));
        if (target) pushActivity('unlike', `"${target.title}" 좋아요를 취소했습니다.`);
      } else {
        const { data, error } = await supabase
          .from('likes')
          .insert([{ user_id: user.id, snippet_id: snippetId }])
          .select()
          .single();
        if (error || !data) return showToast('좋아요에 실패했습니다.', 'info');
        setLikes((prev) => [...prev, data]);
        if (target) pushActivity('like', `"${target.title}" 프롬프트를 좋아요 했습니다.`);
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      showToast('좋아요 처리 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleToggleBookmark = async (snippetId: string) => {
    if (!user) return showToast('북마크는 로그인 후 이용할 수 있습니다.', 'info');

    const target = snippets.find((s) => s.id === snippetId);
    const existing = bookmarks.find((b) => b.snippet_id === snippetId);

    try {
      if (existing) {
        const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id);
        if (error) return showToast('북마크 해제에 실패했습니다.', 'info');
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
        if (target) pushActivity('unbookmark', `"${target.title}" 북마크를 해제했습니다.`);
        showToast('북마크에서 제거했습니다.');
      } else {
        const { data, error } = await supabase
          .from('bookmarks')
          .insert([{ user_id: user.id, snippet_id: snippetId }])
          .select()
          .single();
        if (error || !data) return showToast('북마크에 실패했습니다.', 'info');
        setBookmarks((prev) => [...prev, data]);
        if (target) pushActivity('bookmark', `"${target.title}" 프롬프트를 북마크했습니다.`);
        showToast('북마크에 저장했습니다! 🔖');
      }
    } catch (err) {
      console.error('북마크 처리 실패:', err);
      showToast('북마크 처리 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleDeleteAllSnippets = async () => {
    if (!user) return;
    setDeletingAll(true);
    try {
      const { error } = await supabase.from('snippets').delete().eq('user_id', user.id);
      if (error) {
        showToast('삭제에 실패했습니다.', 'info');
        return;
      }
      await fetchSnippets();
      showToast('내 프롬프트를 모두 삭제했습니다.');
    } catch (err) {
      console.error('전체 삭제 실패:', err);
      showToast('삭제 중 오류가 발생했습니다.', 'info');
    } finally {
      setDeletingAll(false);
    }
  };

  const getLikeCount = (snippetId: string) => likes.filter((l) => l.snippet_id === snippetId).length;
  const isLikedByMe = (snippetId: string) => !!user && likes.some((l) => l.snippet_id === snippetId && l.user_id === user.id);
  const isBookmarkedByMe = (snippetId: string) => bookmarks.some((b) => b.snippet_id === snippetId);
  const getCommentCount = (snippetId: string) => comments.filter((c) => c.snippet_id === snippetId).length;
  const getUsername = (userId: string) => profiles.find((p) => p.id === userId)?.username ?? formatFallbackUsername(userId);
  const getFollowerCount = (userId: string) => follows.filter((f) => f.following_id === userId).length;
  const isFollowingUser = (userId: string) => !!user && follows.some((f) => f.follower_id === user.id && f.following_id === userId);
  const isCurrentUserAdmin = !!user && (profiles.find((p) => p.id === user.id)?.is_admin ?? false);
  const canDeleteSnippet = (snippet: Snippet) => !!user && (snippet.user_id === user.id || isCurrentUserAdmin);

  const handleDeleteSnippet = async (snippet: Snippet) => {
    if (!canDeleteSnippet(snippet)) return;
    if (!window.confirm(`"${snippet.title}" 프롬프트를 삭제하시겠습니까? 되돌릴 수 없습니다.`)) return;
    try {
      const { error } = await supabase.from('snippets').delete().eq('id', snippet.id);
      if (error) {
        showToast('삭제에 실패했습니다.', 'info');
        return;
      }
      setSnippets((prev) => prev.filter((s) => s.id !== snippet.id));
      if (selectedSnippetId === snippet.id) setSelectedSnippetId(null);
      showToast('프롬프트를 삭제했습니다.');
    } catch (err) {
      console.error('프롬프트 삭제 실패:', err);
      showToast('삭제 중 오류가 발생했습니다.', 'info');
    }
  };

  const handlePostComment = async (content: string) => {
    if (!user || !selectedSnippet) return;
    setCommentPosting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ snippet_id: selectedSnippet.id, user_id: user.id, content }])
        .select()
        .single();
      if (error || !data) {
        showToast('댓글 등록에 실패했습니다.', 'info');
        return;
      }
      setComments((prev) => [...prev, data]);
      pushActivity('comment', `"${selectedSnippet.title}"에 댓글을 남겼습니다.`);
    } catch (err) {
      console.error('댓글 등록 실패:', err);
      showToast('댓글 등록 중 오류가 발생했습니다.', 'info');
    } finally {
      setCommentPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
        showToast('댓글 삭제에 실패했습니다.', 'info');
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      showToast('댓글 삭제 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleToggleFollow = async (authorId: string) => {
    if (!user) return showToast('팔로우는 로그인 후 이용할 수 있습니다.', 'info');
    if (user.id === authorId) return;

    const existing = follows.find((f) => f.follower_id === user.id && f.following_id === authorId);
    try {
      if (existing) {
        const { error } = await supabase.from('follows').delete().eq('id', existing.id);
        if (error) return showToast('언팔로우에 실패했습니다.', 'info');
        setFollows((prev) => prev.filter((f) => f.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: authorId }])
          .select()
          .single();
        if (error || !data) return showToast('팔로우에 실패했습니다.', 'info');
        setFollows((prev) => [...prev, data]);
        pushActivity('follow', `${getUsername(authorId)}님을 팔로우했습니다.`);
        showToast(`${getUsername(authorId)}님을 팔로우했습니다!`);
      }
    } catch (err) {
      console.error('팔로우 처리 실패:', err);
      showToast('팔로우 처리 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleCreateCollection = async (name: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('collections').insert([{ user_id: user.id, name }]).select().single();
      if (error || !data) {
        showToast('컬렉션 생성에 실패했습니다.', 'info');
        return;
      }
      setCollections((prev) => [data, ...prev]);
      showToast(`"${name}" 컬렉션을 만들었습니다!`);
    } catch (err) {
      console.error('컬렉션 생성 실패:', err);
      showToast('컬렉션 생성 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleCreateCollectionAndAdd = async (name: string) => {
    if (!user || !selectedSnippet) return;
    try {
      const { data, error } = await supabase.from('collections').insert([{ user_id: user.id, name }]).select().single();
      if (error || !data) {
        showToast('컬렉션 생성에 실패했습니다.', 'info');
        return;
      }
      setCollections((prev) => [data, ...prev]);

      const { data: itemData, error: itemError } = await supabase
        .from('collection_items')
        .insert([{ collection_id: data.id, snippet_id: selectedSnippet.id }])
        .select()
        .single();
      if (itemError || !itemData) {
        showToast('컬렉션에 담는 데 실패했습니다.', 'info');
        return;
      }
      setCollectionItems((prev) => [...prev, itemData]);
      pushActivity('collect', `"${selectedSnippet.title}"을(를) "${name}" 컬렉션에 담았습니다.`);
      showToast(`"${name}" 컬렉션에 담았습니다!`);
    } catch (err) {
      console.error('컬렉션 생성/담기 실패:', err);
      showToast('컬렉션 생성 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleToggleCollection = async (collectionId: string) => {
    if (!selectedSnippet) return;
    const existing = collectionItems.find((ci) => ci.collection_id === collectionId && ci.snippet_id === selectedSnippet.id);
    try {
      if (existing) {
        const { error } = await supabase.from('collection_items').delete().eq('id', existing.id);
        if (error) return showToast('컬렉션에서 제거하지 못했습니다.', 'info');
        setCollectionItems((prev) => prev.filter((ci) => ci.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from('collection_items')
          .insert([{ collection_id: collectionId, snippet_id: selectedSnippet.id }])
          .select()
          .single();
        if (error || !data) return showToast('컬렉션에 담지 못했습니다.', 'info');
        setCollectionItems((prev) => [...prev, data]);
        pushActivity('collect', `"${selectedSnippet.title}"을(를) 컬렉션에 담았습니다.`);
      }
    } catch (err) {
      console.error('컬렉션 담기 처리 실패:', err);
      showToast('컬렉션 처리 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase.from('collections').delete().eq('id', collectionId);
      if (error) {
        showToast('컬렉션 삭제에 실패했습니다.', 'info');
        return;
      }
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setCollectionItems((prev) => prev.filter((ci) => ci.collection_id !== collectionId));
      showToast('컬렉션을 삭제했습니다.');
    } catch (err) {
      console.error('컬렉션 삭제 실패:', err);
      showToast('컬렉션 삭제 중 오류가 발생했습니다.', 'info');
    }
  };

  const handleRemoveFromCollection = async (collectionId: string, snippetId: string) => {
    const existing = collectionItems.find((ci) => ci.collection_id === collectionId && ci.snippet_id === snippetId);
    if (!existing) return;
    try {
      const { error } = await supabase.from('collection_items').delete().eq('id', existing.id);
      if (error) {
        showToast('컬렉션에서 제거하지 못했습니다.', 'info');
        return;
      }
      setCollectionItems((prev) => prev.filter((ci) => ci.id !== existing.id));
    } catch (err) {
      console.error('컬렉션 아이템 제거 실패:', err);
      showToast('컬렉션 처리 중 오류가 발생했습니다.', 'info');
    }
  };

  const sortSnippets = (list: Snippet[], order: SortOrder): Snippet[] => {
    const arr = [...list];
    if (order === 'popular') {
      arr.sort((a, b) => getLikeCount(b.id) - getLikeCount(a.id));
    } else {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return arr;
  };

  const mySnippets = snippets.filter((s) => s.user_id === user?.id);
  const filteredMySnippets = mySnippets
    .filter((s) => selectedTag === '전체' || (s.tags && s.tags.includes(selectedTag)))
    .filter((s) => matchesSearch(s, librarySearchQuery));

  const bookmarkedSnippetIds = new Set(bookmarks.map((b) => b.snippet_id));
  const bookmarkedSnippets = snippets
    .filter((s) => bookmarkedSnippetIds.has(s.id))
    .filter((s) => matchesSearch(s, librarySearchQuery));

  const publicSnippets = snippets.filter((s) => s.is_public === true);

  const sharedFiltered = sortSnippets(
    publicSnippets
      .filter((s) => selectedSharedCategory === '전체' || s.category === selectedSharedCategory)
      .filter((s) => selectedSharedSubTag === '전체' || (s.tags && s.tags.includes(selectedSharedSubTag)))
      .filter((s) => matchesSearch(s, publicSearchQuery)),
    sharedSortOrder,
  );

  const handleSelectSharedCategory = (category: string) => {
    setSelectedSharedCategory(category);
    setSelectedSharedSubTag('전체');
  };

  const recommendedFiltered = sortSnippets(
    publicSnippets.filter((s) => matchesSearch(s, publicSearchQuery)),
    recommendedSortOrder,
  );

  const heroSnippet = publicSnippets.length > 0
    ? [...publicSnippets].sort((a, b) => getLikeCount(b.id) - getLikeCount(a.id))[0]
    : null;

  const tagFrequency = new Map<string, number>();
  publicSnippets.forEach((s) => {
    (s.tags || []).forEach((tag) => tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1));
  });
  const popularTags = Array.from(tagFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  const handleSelectPopularTag = (tag: string) => {
    setActiveView('shared');
    setPublicSearchQuery(tag);
  };

  const communityStats = {
    totalPrompts: publicSnippets.length,
    totalLikes: publicSnippets.reduce((sum, s) => sum + getLikeCount(s.id), 0),
    totalContributors: new Set(publicSnippets.map((s) => s.user_id)).size,
  };

  const selectedSnippet = snippets.find((s) => s.id === selectedSnippetId) ?? null;

  const handleOpenSnippetDetail = async (snippet: Snippet) => {
    setSelectedSnippetId(snippet.id);
    if (viewedSnippetIdsRef.current.has(snippet.id)) return;
    viewedSnippetIdsRef.current.add(snippet.id);
    setSnippets((prev) => prev.map((s) => (s.id === snippet.id ? { ...s, views: s.views + 1 } : s)));
    try {
      const { error } = await supabase.rpc('increment_snippet_views', { snippet_id: snippet.id });
      if (error) console.error('조회수 증가 실패:', error);
    } catch (err) {
      console.error('조회수 증가 실패:', err);
    }
  };

  const handleCloseSnippetDetail = () => setSelectedSnippetId(null);

  const handlePreviewSnippet = (snippet: Snippet) => {
    handleEnterGuestMode();
    handleOpenSnippetDetail(snippet);
  };

  const topCreators: CreatorRankEntry[] = (() => {
    const creatorMap = new Map<string, CreatorRankEntry>();
    publicSnippets.forEach((s) => {
      // s.user_id가 없으면 하위 코드를 실행하지 않고 건너뜁니다.
      if (!s.user_id) return;

      if (!creatorMap.has(s.user_id)) {
        creatorMap.set(s.user_id, {
          userId: s.user_id,
          username: getUsername(s.user_id),
          followerCount: getFollowerCount(s.user_id),
        });
      }
    });
    return Array.from(creatorMap.values())
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, 5);
  })();

  const previewSnippets = [...publicSnippets]
    .sort((a, b) => (getLikeCount(b.id) + b.views) - (getLikeCount(a.id) + a.views))
    .slice(0, 3);

  const snippetCollectionIds = new Set(
    collectionItems.filter((ci) => ci.snippet_id === selectedSnippet?.id).map((ci) => ci.collection_id),
  );

  const topBarSearchQuery = activeView === 'shared' || activeView === 'recommended' ? publicSearchQuery : '';
  const searchSuggestions = topBarSearchQuery.trim()
    ? publicSnippets.filter((s) => matchesSearch(s, topBarSearchQuery)).slice(0, 5)
    : [];
  const handleSelectSearchSuggestion = (snippet: Snippet) => {
    setActiveView('shared');
    handleOpenSnippetDetail(snippet);
  };

  return (
    <>
      <Toast toast={toast} />

      {!user && !isGuestMode ? (
        <AuthScreen
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          authLoading={authLoading}
          handleAuth={handleAuth}
          handleEnterGuestMode={handleEnterGuestMode}
          showWelcome={showWelcome}
          isFadingOut={isFadingOut}
          previewSnippets={previewSnippets}
          stats={communityStats}
          getLikeCount={getLikeCount}
          onPreviewSnippet={handlePreviewSnippet}
        />
      ) : (
        <>
          <AppShell
            activeView={activeView}
            onChangeView={setActiveView}
            onNewPrompt={handleOpenNewPromptModal}
            user={user}
            isGuestMode={isGuestMode}
            onLogout={handleLogout}
            onGoToLogin={handleGoToLogin}
            mySnippetsCount={mySnippets.length}
            isAdmin={isCurrentUserAdmin}
            searchQuery={topBarSearchQuery}
            onSearchChange={setPublicSearchQuery}
            searchSuggestions={searchSuggestions}
            onSelectSuggestion={handleSelectSearchSuggestion}
            totalPublicCount={publicSnippets.length}
            onOpenPricing={() => setActiveView('pricing')}
            onNotification={() => showToast('알림 기능은 준비 중입니다.', 'info')}
            popularTags={popularTags}
            onSelectTag={handleSelectPopularTag}
            recommendedModelIds={recommendedModelIds}
            activityLog={activityLog}
            topCreators={topCreators}
            onClearActivity={() => setActivityLog([])}
          >
            {activeView === 'shared' && (
              <SharedView
                heroSnippet={heroSnippet}
                gridSnippets={sharedFiltered}
                stats={communityStats}
                getLikeCount={getLikeCount}
                getCommentCount={getCommentCount}
                isLikedByMe={isLikedByMe}
                isBookmarkedByMe={isBookmarkedByMe}
                copiedId={copiedId}
                onToggleLike={handleToggleLike}
                onToggleBookmark={handleToggleBookmark}
                onCopy={handleCopy}
                onOpenSnippet={handleOpenSnippetDetail}
                canDeleteSnippet={canDeleteSnippet}
                onDeleteSnippet={handleDeleteSnippet}
                selectedCategory={selectedSharedCategory}
                onSelectCategory={handleSelectSharedCategory}
                selectedSubTag={selectedSharedSubTag}
                onSelectSubTag={setSelectedSharedSubTag}
                sortOrder={sharedSortOrder}
                onChangeSort={setSharedSortOrder}
              />
            )}

            {activeView === 'recommended' && (
              <RecommendedView
                snippets={recommendedFiltered}
                getLikeCount={getLikeCount}
                getCommentCount={getCommentCount}
                isLikedByMe={isLikedByMe}
                isBookmarkedByMe={isBookmarkedByMe}
                copiedId={copiedId}
                onToggleLike={handleToggleLike}
                onToggleBookmark={handleToggleBookmark}
                onCopy={handleCopy}
                onOpenSnippet={handleOpenSnippetDetail}
                canDeleteSnippet={canDeleteSnippet}
                onDeleteSnippet={handleDeleteSnippet}
                sortOrder={recommendedSortOrder}
                onChangeSort={setRecommendedSortOrder}
              />
            )}

            {activeView === 'library' && (
              <LibraryView
                user={user}
                onGoToLogin={handleGoToLogin}
                librarySubTab={librarySubTab}
                onChangeSubTab={setLibrarySubTab}
                mySnippetsCount={mySnippets.length}
                bookmarksCount={bookmarks.length}
                collectionsCount={collections.length}
                filteredMySnippets={filteredMySnippets}
                filteredBookmarkedSnippets={bookmarkedSnippets}
                allSnippets={snippets}
                collections={collections}
                collectionItems={collectionItems}
                uniqueTags={uniqueTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                searchQuery={librarySearchQuery}
                onSearchChange={setLibrarySearchQuery}
                getLikeCount={getLikeCount}
                getCommentCount={getCommentCount}
                isLikedByMe={isLikedByMe}
                isBookmarkedByMe={isBookmarkedByMe}
                copiedId={copiedId}
                onToggleLike={handleToggleLike}
                onToggleBookmark={handleToggleBookmark}
                onCopy={handleCopy}
                onOpenSnippet={handleOpenSnippetDetail}
                canDeleteSnippet={canDeleteSnippet}
                onDeleteSnippet={handleDeleteSnippet}
                onCreateCollection={handleCreateCollection}
                onDeleteCollection={handleDeleteCollection}
                onRemoveFromCollection={handleRemoveFromCollection}
              />
            )}

            {activeView === 'settings' && (
              <SettingsView
                user={user}
                isAdmin={isCurrentUserAdmin}
                onGoToLogin={handleGoToLogin}
                onGoPricing={() => setActiveView('pricing')}
                recommendedModelIds={recommendedModelIds}
                onToggleRecommendedModel={toggleRecommendedModel}
                onClearActivity={() => setActivityLog([])}
                onDeleteAllSnippets={handleDeleteAllSnippets}
                mySnippetsCount={mySnippets.length}
                deleting={deletingAll}
              />
            )}

            {activeView === 'pricing' && (
              <PricingView
                onBack={() => setActiveView('shared')}
                onSelectPaidPlan={() => showToast('결제 연동은 준비 중입니다. 조금만 기다려 주세요!', 'info')}
              />
            )}
          </AppShell>

          <NewPromptModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleCreatePrompt}
            submitting={submittingPrompt}
          />

          <PromptDetailModal
            key={selectedSnippet?.id ?? 'none'}
            snippet={selectedSnippet}
            onClose={handleCloseSnippetDetail}
            liked={selectedSnippet ? isLikedByMe(selectedSnippet.id) : false}
            bookmarked={selectedSnippet ? isBookmarkedByMe(selectedSnippet.id) : false}
            likeCount={selectedSnippet ? getLikeCount(selectedSnippet.id) : 0}
            copied={selectedSnippet ? copiedId === selectedSnippet.id : false}
            onToggleLike={() => selectedSnippet && handleToggleLike(selectedSnippet.id)}
            onToggleBookmark={() => selectedSnippet && handleToggleBookmark(selectedSnippet.id)}
            onCopy={() => selectedSnippet && handleCopy(selectedSnippet)}
            canDelete={!!selectedSnippet && canDeleteSnippet(selectedSnippet)}
            onDelete={() => selectedSnippet && handleDeleteSnippet(selectedSnippet)}
            authorUsername={selectedSnippet ? getUsername(selectedSnippet.user_id) : ''}
            authorFollowerCount={selectedSnippet ? getFollowerCount(selectedSnippet.user_id) : 0}
            isFollowingAuthor={selectedSnippet ? isFollowingUser(selectedSnippet.user_id) : false}
            isOwnPrompt={!!selectedSnippet && !!user && selectedSnippet.user_id === user.id}
            isLoggedIn={!!user}
            isAdmin={isCurrentUserAdmin}
            onToggleFollowAuthor={() => selectedSnippet && handleToggleFollow(selectedSnippet.user_id)}
            comments={selectedSnippet ? comments.filter((c) => c.snippet_id === selectedSnippet.id) : []}
            getUsername={getUsername}
            currentUserId={user?.id ?? null}
            commentPosting={commentPosting}
            onSubmitComment={handlePostComment}
            onDeleteComment={handleDeleteComment}
            collections={collections}
            snippetCollectionIds={snippetCollectionIds}
            onToggleCollection={handleToggleCollection}
            onCreateCollectionAndAdd={handleCreateCollectionAndAdd}
          />
        </>
      )}
    </>
  );
}

export default function PromptSafePage() {
  return (
    <ThemeProvider>
      <PromptVaultApp />
    </ThemeProvider>
  );
}
