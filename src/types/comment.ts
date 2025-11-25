import type { Comment, Profile, Medal, CommentReactionValue } from "./db";

export interface CommentReactionsSummary {
	likeCount: number;
	dislikeCount: number;
	viewerReaction: CommentReactionValue | null;
}

export interface CommentWithMeta {
	comment: Comment;
	author: Pick<Profile, "id" | "handle" | "display_name" | "avatar_url">;
	medals: Medal[];
	reactions: CommentReactionsSummary;
}

export type CommentsResponse = CommentWithMeta[];
