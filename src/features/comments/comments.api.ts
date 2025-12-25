import { supabase } from "../../utils/supabaseClient";
import type { CommentWithMeta, CommentReactionsSummary } from "../../types";
import type {
	Comment,
	Profile,
	Medal,
	CommentReactionValue,
} from "../../types";

export interface CreateCommentParams {
	postId: string;
	body: string;
}

export interface DeleteCommentParams {
	commentId: string;
}

export interface SetCommentReactionParams {
	commentId: string;
	reaction: CommentReactionValue | null;
}

type AuthorRow = Pick<Profile, "id" | "handle" | "display_name" | "avatar_url">;

type CommentRow = Pick<
	Comment,
	| "id"
	| "post_id"
	| "author_id"
	| "body"
	| "is_deleted"
	| "created_at"
	| "updated_at"
> & {
	author: AuthorRow | AuthorRow[] | null;
};

type CommentReactionRow = {
	user_id: string;
	comment_id: string;
	reaction: CommentReactionValue;
};

type UserMedalRow = {
	user_id: string;
	medal: Medal | Medal[] | null;
};

function normalizeAuthor(author: AuthorRow | AuthorRow[] | null): AuthorRow {
	if (!author) {
		return { id: "", handle: "", display_name: null, avatar_url: null };
	}
	return Array.isArray(author) ? author[0] : author;
}

// Create a comment on a post
export async function createComment(
	params: CreateCommentParams
): Promise<Comment> {
	const { postId, body } = params;

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError) throw userError;
	if (!user) throw new Error("Not logged in");

	const { data, error } = await supabase
		.from("comments")
		.insert({
			post_id: postId,
			author_id: user.id,
			body,
		})
		.select("*")
		.single<Comment>();

	if (error || !data) throw error ?? new Error("Failed to create comment");

	try {
		await supabase.rpc("update_explore_score", { p_post_id: postId });
	} catch (err: unknown) {
		console.warn("update_explore_score failed (optional):", err);
	}

	return data as Comment;
}

// Delete a comment
export async function deleteComment(
	params: DeleteCommentParams
): Promise<void> {
	const { commentId } = params;

	const { error } = await supabase
		.from("comments")
		.update({ is_deleted: true })
		.eq("id", commentId);

	if (error) throw error;
}

// Add a like/dislike on a comment, or clear it
export async function setCommentReaction(
	params: SetCommentReactionParams
): Promise<void> {
	const { commentId, reaction } = params;

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError) throw userError;
	if (!user) throw new Error("Not logged in");

	if (reaction === null) {
		const { error } = await supabase
			.from("comment_reactions")
			.delete()
			.eq("comment_id", commentId)
			.eq("user_id", user.id);

		if (error) throw error;
		return;
	}

	const { error } = await supabase.from("comment_reactions").upsert({
		user_id: user.id,
		comment_id: commentId,
		reaction,
	});

	if (error) throw error;
}

// Fetch comments for a post
export async function fetchCommentsForPost(
	postId: string,
	currentUserId: string | undefined
): Promise<CommentWithMeta[]> {
	const { data, error } = await supabase
		.from("comments")
		.select(
			`
      id,
      post_id,
      author_id,
      body,
      is_deleted,
      created_at,
      updated_at,
      author:author_id (
        id,
        handle,
        display_name,
        avatar_url
      )
    `
		)
		.eq("post_id", postId)
		.eq("is_deleted", false)
		.order("created_at", { ascending: true });

	if (error) throw error;

	const comments: CommentRow[] = (data ?? []) as unknown as CommentRow[];

	const commentIds = comments.map((c) => c.id);
	const authorIds = Array.from(new Set(comments.map((c) => c.author_id)));

	let reactionsByCommentId: Record<string, CommentReactionsSummary> = {};

	if (commentIds.length > 0) {
		const { data: reactionsRaw, error: reactionsError } = await supabase
			.from("comment_reactions")
			.select("user_id, comment_id, reaction")
			.in("comment_id", commentIds);

		if (reactionsError) throw reactionsError;

		const reactions = (reactionsRaw ??
			[]) as unknown as CommentReactionRow[];

		reactionsByCommentId = commentIds.reduce<
			Record<string, CommentReactionsSummary>
		>((acc, commentId) => {
			const related = reactions.filter((r) => r.comment_id === commentId);

			const likeCount = related.filter((r) => r.reaction === 1).length;
			const dislikeCount = related.filter(
				(r) => r.reaction === -1
			).length;

			const viewerReaction =
				currentUserId != null
					? related.find((r) => r.user_id === currentUserId)
							?.reaction ?? null
					: null;

			acc[commentId] = {
				likeCount,
				dislikeCount,
				viewerReaction,
			};

			return acc;
		}, {});
	}

	let medalsByUserId: Record<string, Medal[]> = {};

	if (authorIds.length > 0) {
		const { data: userMedalsRowsRaw, error: userMedalsError } =
			await supabase
				.from("user_medals")
				.select(
					`
        user_id,
        medal:medal_id (
          id,
          code,
          name,
          description,
          icon,
          threshold
        )
      `
				)
				.in("user_id", authorIds);

		if (userMedalsError) throw userMedalsError;

		const userMedalsRows = (userMedalsRowsRaw ??
			[]) as unknown as UserMedalRow[];

		medalsByUserId = userMedalsRows.reduce<Record<string, Medal[]>>(
			(acc, row) => {
				if (!row.medal) return acc;

				const medals = Array.isArray(row.medal)
					? row.medal
					: [row.medal];

				if (!acc[row.user_id]) acc[row.user_id] = [];
				acc[row.user_id].push(...medals);

				return acc;
			},
			{}
		);
	}

	const result: CommentWithMeta[] = comments.map((row) => {
		const comment: Comment = {
			id: row.id,
			post_id: row.post_id,
			author_id: row.author_id,
			body: row.body,
			is_deleted: row.is_deleted,
			created_at: row.created_at,
			updated_at: row.updated_at,
		};

		const author = normalizeAuthor(row.author);

		const reactions = reactionsByCommentId[row.id] ?? {
			likeCount: 0,
			dislikeCount: 0,
			viewerReaction: null,
		};

		const medals = medalsByUserId[row.author_id] ?? [];

		return {
			comment,
			author,
			medals,
			reactions,
		};
	});

	return result;
}
