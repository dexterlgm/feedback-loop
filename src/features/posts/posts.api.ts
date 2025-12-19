import { supabase } from "../../utils/supabaseClient";
import type {
	PostFilter,
	PostFeedItem,
	PostDetail,
	PostStats,
} from "../../types";
import type { Post, Profile, PostImage, Tag } from "../../types";
import { uploadPostImage } from "../../services/storage";

export interface CreatePostParams {
	title: string;
	body: string | null;
	tagIds?: number[];
	files: File[];
}

export interface DeletePostParams {
	postId: string;
}

export interface FetchPostsParams {
	filter: PostFilter;
	limit: number;
	offset: number;
}

// Stopping Supabase from returning joined tables as an object
function one<T>(value: T | T[] | null | undefined): T | null {
	if (!value) return null;
	return Array.isArray(value) ? value[0] ?? null : value;
}

type FeedRow = {
	id: string;
	author_id: string;
	title: string;
	body: string | null;
	explore_score: number | null;
	is_deleted: boolean;
	created_at: string;
	updated_at: string | null;
	comment_count: number | null;

	author:
		| {
				id: string;
				handle: string;
				display_name: string | null;
				avatar_url: string | null;
		  }
		| {
				id: string;
				handle: string;
				display_name: string | null;
				avatar_url: string | null;
		  }[];

	images: PostImage[] | null;

	post_tags: Array<{
		tag: { id: number; name: string } | { id: number; name: string }[];
	}> | null;
};

type DetailRow = {
	id: string;
	author_id: string;
	title: string;
	body: string | null;
	explore_score: number | null;
	is_deleted: boolean;
	created_at: string;
	updated_at: string | null;
	comment_count: number | null;

	author:
		| {
				id: string;
				handle: string;
				display_name: string | null;
				avatar_url: string | null;
				bio: string | null;
		  }
		| {
				id: string;
				handle: string;
				display_name: string | null;
				avatar_url: string | null;
				bio: string | null;
		  }[];

	images: PostImage[] | null;

	post_tags: Array<{
		tag: { id: number; name: string } | { id: number; name: string }[];
	}> | null;
};

function mapTags(
	post_tags: FeedRow["post_tags"] | DetailRow["post_tags"]
): Tag[] {
	const tags: Tag[] = [];

	if (!post_tags) return tags;

	for (const pt of post_tags) {
		const tag = one(pt.tag);
		if (!tag) continue;

		tags.push({ id: tag.id, name: tag.name });
	}

	return tags;
}

function toPost(row: FeedRow | DetailRow): Post {
	return {
		id: row.id,
		author_id: row.author_id,
		title: row.title,
		body: row.body,
		explore_score: row.explore_score,
		is_deleted: row.is_deleted,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

function toStats(row: FeedRow | DetailRow): PostStats {
	return {
		commentCount: row.comment_count ?? 0,
		totalCommentLikes: 0,
	};
}

function mapFeedRow(row: FeedRow): PostFeedItem {
	const author = one(row.author);

	const safeAuthor: Pick<
		Profile,
		"id" | "handle" | "display_name" | "avatar_url"
	> = author ?? { id: "", handle: "", display_name: null, avatar_url: null };

	return {
		post: toPost(row),
		author: safeAuthor,
		images: row.images ?? [],
		tags: mapTags(row.post_tags),
		stats: toStats(row),
	};
}

// Create a post, upload images, and attach tags.
export async function createPostWithImages(
	params: CreatePostParams
): Promise<{ post: Post; imageUrls: string[] }> {
	const { title, body, tagIds, files } = params;

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError) throw userError;
	if (!user) throw new Error("Not logged in");

	const { data: postData, error: postError } = await supabase
		.from("posts")
		.insert({
			author_id: user.id,
			title,
			body: body ?? null,
		})
		.select("*")
		.single<Post>();

	if (postError || !postData) {
		throw postError ?? new Error("Failed to create post");
	}

	const post = postData;
	const postId = post.id;

	const uploadedUrls: string[] = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const publicUrl = await uploadPostImage(file, user.id, postId);
		uploadedUrls.push(publicUrl);

		const { error: imgError } = await supabase.from("post_images").insert({
			post_id: postId,
			image_url: publicUrl,
			sort_order: i,
		});

		if (imgError) throw imgError;
	}

	if (tagIds && tagIds.length > 0) {
		const postTags = tagIds.map((tagId) => ({
			post_id: postId,
			tag_id: tagId,
		}));

		const { error: tagsError } = await supabase
			.from("post_tags")
			.insert(postTags);
		if (tagsError) throw tagsError;
	}

	try {
		await supabase.rpc("update_explore_score", { p_post_id: postId });
	} catch (err: unknown) {
		console.warn("update_explore_score failed (optional):", err);
	}

	return { post, imageUrls: uploadedUrls };
}

// Soft-delete a post
export async function deletePost({ postId }: DeletePostParams): Promise<void> {
	const { error } = await supabase
		.from("posts")
		.update({ is_deleted: true })
		.eq("id", postId);

	if (error) throw error;
}

// Fetch several posts
export async function fetchPostsFeed(
	params: FetchPostsParams
): Promise<PostFeedItem[]> {
	const { filter, limit, offset } = params;
	const { sort, searchQuery, tags } = filter;

	const useInnerTags = Boolean(tags && tags.length > 0);

	const selectSql = `
  id,
  author_id,
  title,
  body,
  explore_score,
  is_deleted,
  created_at,
  updated_at,
  comment_count,
  author:author_id (
    id,
    handle,
    display_name,
    avatar_url
  ),
  images:post_images (*),
  post_tags:${useInnerTags ? "post_tags!inner" : "post_tags"} (
    tag:tag_id (
      id,
      name
    )
  )
`;

	let query = supabase
		.from("posts")
		.select(selectSql)
		.eq("is_deleted", false);

	if (searchQuery && searchQuery.trim() !== "") {
		query = query.or(
			`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`
		);
	}

	if (tags && tags.length > 0) {
		const { data: tagRows, error: tagError } = await supabase
			.from("tags")
			.select("id")
			.in("name", tags);

		if (tagError) throw tagError;

		const tagIds = (tagRows ?? []).map((r) => r.id);

		// If no tag ids match, return empty result
		if (tagIds.length === 0) return [];

		const { data: postTagRows, error: postTagError } = await supabase
			.from("post_tags")
			.select("post_id")
			.in("tag_id", tagIds);

		if (postTagError) throw postTagError;

		const postIds = Array.from(
			new Set((postTagRows ?? []).map((r) => r.post_id))
		);

		if (postIds.length === 0) return [];

		query = query.in("id", postIds);
	}

	if (sort === "newest") {
		query = query.order("created_at", { ascending: false });
	} else {
		query = query.order("explore_score", { ascending: false });
	}

	const { data, error } = await query.range(offset, offset + limit - 1);
	if (error) throw error;

	const rows = (data ?? []) as unknown as FeedRow[];
	return rows.map(mapFeedRow);
}

export async function fetchPostsByUser(
	userId: string,
	limit: number,
	offset: number
): Promise<PostFeedItem[]> {
	let query = supabase
		.from("posts")
		.select(
			`
      id,
      author_id,
      title,
      body,
      explore_score,
      is_deleted,
      created_at,
      updated_at,
	  comment_count,
      author:author_id (
        id,
        handle,
        display_name,
        avatar_url
      ),
      images:post_images (*),
      post_tags:post_tags!inner (
		tag:tag_id (
			id,
			name
		)
	)
    `
		)
		.eq("is_deleted", false)
		.eq("author_id", userId)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	const { data, error } = await query;
	if (error) throw error;

	const rows = (data ?? []) as unknown as FeedRow[];
	return rows.map(mapFeedRow);
}

// Fetch a single post
export async function fetchPostDetail(postId: string): Promise<PostDetail> {
	const { data, error } = await supabase
		.from("posts")
		.select(
			`
      id,
      author_id,
      title,
      body,
      explore_score,
      is_deleted,
      created_at,
      updated_at,
	  comment_count,
      author:author_id (
        id,
        handle,
        display_name,
        avatar_url,
        bio
      ),
      images:post_images (*),
      post_tags (
        tag:tag_id (
          id,
          name
        )
      )
    `
		)
		.eq("id", postId)
		.single();

	if (error || !data) {
		throw error ?? new Error("Post not found");
	}

	const row = data as unknown as DetailRow;

	if (row.is_deleted) throw new Error("Post deleted");

	const author = one(row.author);
	const safeAuthor: Pick<
		Profile,
		"id" | "handle" | "display_name" | "avatar_url" | "bio"
	> = author ?? {
		id: "",
		handle: "",
		display_name: null,
		avatar_url: null,
		bio: null,
	};

	return {
		post: toPost(row),
		author: safeAuthor,
		images: row.images ?? [],
		tags: mapTags(row.post_tags),
		stats: toStats(row),
		comments: [],
	};
}
