export interface Profile {
	id: string;
	handle: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	social_links: string[] | null;
	is_admin: boolean;
	created_at: string;
}

export interface Post {
	id: string;
	author_id: string;
	title: string;
	body: string | null;
	explore_score: number | null;
	is_deleted: boolean;
	created_at: string;
	updated_at: string | null;
}

export interface PostImage {
	id: string;
	post_id: string;
	image_url: string;
	sort_order: number;
}

export interface Comment {
	id: string;
	post_id: string;
	author_id: string;
	body: string;
	is_deleted: boolean;
	created_at: string;
	updated_at: string | null;
}

export type CommentReactionValue = 1 | -1;

export interface CommentReaction {
	user_id: string;
	comment_id: string;
	reaction: CommentReactionValue;
	created_at: string;
}

export interface Tag {
	id: number;
	name: string;
}

export interface PostTag {
	post_id: string;
	tag_id: number;
}

export interface Medal {
	id: number;
	code: string;
	name: string;
	description: string | null;
	icon: string | null;
	threshold: number;
}

export interface UserMedal {
	user_id: string;
	medal_id: number;
	earned_at: string;
}

export type NotificationType = "comment_on_post";

export interface Notification {
	id: string;
	user_id: string; // recipient
	actor_id: string; // who did the action
	type: NotificationType;
	post_id: string | null;
	comment_id: string | null;
	is_read: boolean;
	created_at: string;
}
