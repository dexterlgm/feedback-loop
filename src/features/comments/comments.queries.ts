import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommentWithMeta } from "../../types";
import {
	createComment,
	deleteComment,
	setCommentReaction,
	fetchCommentsForPost,
	type CreateCommentParams,
	type DeleteCommentParams,
	type SetCommentReactionParams,
} from "./comments.api";

export function useCommentsForPost(postId: string | undefined) {
	return useQuery<CommentWithMeta[]>({
		queryKey: ["commentsForPost", postId],
		enabled: !!postId,
		queryFn: () => fetchCommentsForPost(postId!),
	});
}

export function useCreateCommentMutation(postId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: Omit<CreateCommentParams, "postId">) =>
			createComment({ ...params, postId }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["commentsForPost", postId],
			});
			queryClient.invalidateQueries({
				queryKey: ["postDetail", postId],
			});
		},
	});
}

export function useDeleteCommentMutation(postId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: DeleteCommentParams) => deleteComment(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["commentsForPost", postId],
			});
			queryClient.invalidateQueries({
				queryKey: ["postDetail", postId],
			});
		},
	});
}

export function useSetCommentReactionMutation(postId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: SetCommentReactionParams) =>
			setCommentReaction(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["commentsForPost", postId],
			});
		},
	});
}
