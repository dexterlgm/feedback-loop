import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostFeedItem, PostDetail, PostFilter } from "../../types";
import {
	createPostWithImages,
	deletePost,
	fetchPostsFeed,
	fetchPostDetail,
	type CreatePostParams,
	type DeletePostParams,
	fetchPostsByUser,
} from "./posts.api";

export function usePostsFeed(
	filter: PostFilter,
	limit: number,
	offset: number
) {
	return useQuery<PostFeedItem[]>({
		queryKey: ["postsFeed", filter, limit, offset],
		queryFn: () => fetchPostsFeed({ filter, limit, offset }),
		placeholderData: (prev) => prev,
	});
}

export function usePostDetail(postId: string | undefined) {
	return useQuery<PostDetail>({
		queryKey: ["postDetail", postId],
		enabled: !!postId,
		queryFn: () => fetchPostDetail(postId!),
	});
}

export function useCreatePostMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreatePostParams) => createPostWithImages(params),
		onSuccess: () => {
			// Invalidate feeds so new post appears
			queryClient.invalidateQueries({ queryKey: ["postsFeed"] });
		},
	});
}

export function usePostsByUser(
	userId: string | undefined,
	limit: number,
	offset: number
) {
	return useQuery<PostFeedItem[]>({
		queryKey: ["postsByUser", userId, limit, offset],
		enabled: !!userId,
		queryFn: () => fetchPostsByUser(userId!, limit, offset),
	});
}

export function useDeletePostMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: DeletePostParams) => deletePost(params),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["postsFeed"] });
			queryClient.invalidateQueries({
				queryKey: ["postDetail", variables.postId],
			});
		},
	});
}
