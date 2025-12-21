import { supabase } from "../../utils/supabaseClient";
import type {
	Notification,
	NotificationType,
	Profile,
	Post,
	Comment,
} from "../../types";

export type ActorRow = Pick<
	Profile,
	"id" | "handle" | "display_name" | "avatar_url"
>;

export type PostRow = Pick<Post, "id" | "title" | "created_at">;

export type CommentRow = Pick<
	Comment,
	"id" | "post_id" | "body" | "created_at"
>;

export interface NotificationWithMeta {
	notification: Notification;
	actor: ActorRow | null;
	post: PostRow | null;
	comment: CommentRow | null;
}

type NotificationRow = {
	id: string;
	user_id: string;
	actor_id: string;
	type: NotificationType;
	post_id: string | null;
	comment_id: string | null;
	is_read: boolean;
	created_at: string;

	actor: ActorRow | ActorRow[] | null;
	post: PostRow | PostRow[] | null;
	comment: CommentRow | CommentRow[] | null;
};

const one = <T>(value: T | T[] | null | undefined): T | null => {
	if (!value) return null;
	return Array.isArray(value) ? value[0] ?? null : value;
};

const mapRow = (row: NotificationRow): NotificationWithMeta => {
	const notification: Notification = {
		id: row.id,
		user_id: row.user_id,
		actor_id: row.actor_id,
		type: row.type,
		post_id: row.post_id,
		comment_id: row.comment_id,
		is_read: row.is_read,
		created_at: row.created_at,
	};

	return {
		notification,
		actor: one(row.actor),
		post: one(row.post),
		comment: one(row.comment),
	};
};

export async function fetchMyNotifications(
	limit = 30,
	offset = 0
): Promise<NotificationWithMeta[]> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError) throw userError;
	if (!user) return [];

	const { data, error } = await supabase
		.from("notifications")
		.select(
			`
      id,
      user_id,
      actor_id,
      type,
      post_id,
      comment_id,
      is_read,
      created_at,
      actor:actor_id (
        id,
        handle,
        display_name,
        avatar_url
      ),
      post:post_id (
        id,
        title,
        created_at
      ),
      comment:comment_id (
        id,
        post_id,
        body,
        created_at
      )
    `
		)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) throw error;

	const rows = (data ?? []) as unknown as NotificationRow[];
	return rows.map(mapRow);
}

export async function markNotificationRead(
	notificationId: string
): Promise<void> {
	const { error } = await supabase
		.from("notifications")
		.update({ is_read: true })
		.eq("id", notificationId);

	if (error) throw error;
}

export async function markAllMyNotificationsRead(): Promise<void> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError) throw userError;
	if (!user) return;

	const { error } = await supabase
		.from("notifications")
		.update({ is_read: true })
		.eq("user_id", user.id)
		.eq("is_read", false);

	if (error) throw error;
}

export async function clearMyNotifications(): Promise<void> {
	const { error } = await supabase.rpc("clear_my_notifications");
	if (error) throw error;
}
