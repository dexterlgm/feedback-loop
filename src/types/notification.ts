import type { Notification, Profile, Post, Comment } from "./db";

export interface NotificationWithMeta {
	notification: Notification;
	actor: Pick<Profile, "id" | "handle" | "display_name" | "avatar_url">;
	post: Pick<Post, "id" | "title"> | null;
	comment: Pick<Comment, "id" | "body"> | null;
}
