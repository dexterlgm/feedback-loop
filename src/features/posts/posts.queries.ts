import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostDetail } from "../../types";
import {
	createPostWithImages,
	deletePost,
	fetchPostDetail,
	type CreatePostParams,
	type DeletePostParams,
} from "./posts.api";

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
