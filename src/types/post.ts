import type { Post, Profile, PostImage, Tag } from "./db";
import type { SortMode, PaginationParams, PaginatedResult } from "./common";
import type { CommentWithMeta } from "./comment";

export interface PostFilter {
	sort: SortMode;
	tags?: string[];
	searchQuery?: string;
}

export interface PostStats {
	commentCount: number;
	totalCommentLikes: number;
}

export interface PostFeedItem {
	post: Post;
	author: Pick<Profile, "id" | "handle" | "display_name" | "avatar_url">;
	images: PostImage[];
	tags: Tag[];
	stats: PostStats;
	viewerHasCommented?: boolean;
}

export type PostFeedResponse = PaginatedResult<PostFeedItem>;

export interface ExploreFeedRequest extends PaginationParams {
	filter: PostFilter;
}

export interface NewestFeedRequest extends PaginationParams {
	filter: PostFilter;
}

export type ExploreFeedResponse = PostFeedResponse;
export type NewestFeedResponse = PostFeedResponse;

export interface PostDetail {
	post: Post;
	author: Pick<
		Profile,
		"id" | "handle" | "display_name" | "avatar_url" | "bio"
	>;
	images: PostImage[];
	tags: Tag[];
	stats: PostStats;
	comments: CommentWithMeta[];
}

export interface PostDetailResponse {
	item: PostDetail;
}
