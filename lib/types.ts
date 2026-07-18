export interface Snippet {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  ai_models: string[];
  image_url: string | null;
  views: number;
  created_at: string;
  category: string;
  is_public: boolean;
  user_id: string;
}

export interface LikeRow {
  id: string;
  user_id: string;
  snippet_id: string;
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  snippet_id: string;
}

export interface CommentRow {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface FollowRow {
  id: string;
  follower_id: string;
  following_id: string;
}

export interface Profile {
  id: string;
  username: string;
  is_admin: boolean;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  snippet_id: string;
}

export type ActivityKind = 'like' | 'unlike' | 'bookmark' | 'unbookmark' | 'copy' | 'create' | 'comment' | 'follow' | 'collect';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  message: string;
  timestamp: number;
}

export type ActiveView = 'shared' | 'recommended' | 'library' | 'settings' | 'pricing';

export type LibrarySubTab = 'mine' | 'bookmarks' | 'collections';

export type SortOrder = 'latest' | 'popular' | 'views';
