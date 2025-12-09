import { supabase } from "../../utils/supabaseClient";
import type { PostDetail, PostStats } from "../../types";
import type { Post, Profile, PostImage, Tag } from "../../types";
import { uploadPostImage } from "../../services/storage";

export interface CreatePostParams {
	title: string;
	body?: string;
	tagIds?: number[];
	files: File[];
}

export interface DeletePostParams {
	postId: string;
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

	// Create post
	const { data: postData, error: postError } = await supabase
		.from("posts")
		.insert({
			author_id: user.id,
			title,
			body: body ?? null,
		})
		.select("*")
		.single();

	if (postError || !postData) {
		throw postError ?? new Error("Failed to create post");
	}

	const post = postData as Post;
	const postId = post.id;

	// Upload images and insert post_images rows
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

	// Add tags
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
	} catch (err) {
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

// Fetch a single post
export async function fetchPostDetail(postId: string): Promise<PostDetail> {
	const { data: postRow, error: postError } = await supabase
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

	if (postError || !postRow) {
		throw postError ?? new Error("Post not found");
	}

	if (postRow.is_deleted) throw new Error("Post deleted");

	const post: Post = {
		id: postRow.id,
		author_id: postRow.author_id,
		title: postRow.title,
		body: postRow.body,
		explore_score: postRow.explore_score,
		is_deleted: postRow.is_deleted,
		created_at: postRow.created_at,
		updated_at: postRow.updated_at,
	};

	const rawAuthor = Array.isArray(postRow.author)
		? postRow.author[0]
		: postRow.author;

	const author: Pick<
		Profile,
		"id" | "handle" | "display_name" | "avatar_url" | "bio"
	> = {
		id: rawAuthor.id,
		handle: rawAuthor.handle,
		display_name: rawAuthor.display_name,
		avatar_url: rawAuthor.avatar_url,
		bio: rawAuthor.bio,
	};

	const images: PostImage[] = postRow.images ?? [];
	const tags: Tag[] = (postRow.post_tags ?? []).map((pt: any) => pt.tag);

	const stats: PostStats = {
		commentCount: 0,
		totalCommentLikes: 0,
	};

	return {
		post,
		author,
		images,
		tags,
		stats,
		comments: [],
	};
}
