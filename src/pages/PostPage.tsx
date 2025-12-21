import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
	Container,
	Row,
	Col,
	Spinner,
	Alert,
	Badge,
	Button,
	Modal,
} from "react-bootstrap";
import { FiTrash2 } from "react-icons/fi";
import {
	usePostDetail,
	useDeletePostMutation,
} from "../features/posts/posts.queries";
import { UserAvatar } from "../components/common/UserAvatar";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import {
	useCommentsForPost,
	useCreateCommentMutation,
	useDeleteCommentMutation,
	useSetCommentReactionMutation,
} from "../features/comments/comments.queries";
import Comment from "../components/Comment";
import type { CommentReactionValue } from "../types";

type CommentFormValues = { body: string };

type ConfirmState =
	| { open: false }
	| { open: true; kind: "post"; postId: string }
	| { open: true; kind: "comment"; commentId: string };

const PostPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// Hooks (must always run, even when id is missing)
	const { data: postDetail, isLoading, error } = usePostDetail(id);
	const { user, profile: currentProfile } = useAuth();

	const { data: comments, isLoading: commentsLoading } =
		useCommentsForPost(id);

	const createCommentMutation = useCreateCommentMutation(id ?? "");
	const deleteCommentMutation = useDeleteCommentMutation(id ?? "");
	const setReactionMutation = useSetCommentReactionMutation(id ?? "");
	const deletePostMutation = useDeletePostMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CommentFormValues>();

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [confirm, setConfirm] = useState<ConfirmState>({ open: false });

	const canDeletePost = useMemo((): boolean => {
		if (!user || !postDetail) return false;
		if (currentProfile?.is_admin) return true;
		return user.id === postDetail.post.author_id;
	}, [user, currentProfile?.is_admin, postDetail]);

	const canDeleteComment = (authorId: string): boolean => {
		if (!user) return false;
		if (currentProfile?.is_admin) return true;
		return user.id === authorId;
	};

	const openDeleteCommentModal = (commentId: string) => {
		setConfirm({ open: true, kind: "comment", commentId });
	};

	const openDeletePostModal = (postId: string) => {
		setConfirm({ open: true, kind: "post", postId });
	};

	const closeConfirm = () => {
		setConfirm({ open: false });
	};

	const confirmDelete = async (): Promise<void> => {
		if (!confirm.open) return;

		if (confirm.kind === "comment") {
			deleteCommentMutation.mutate({ commentId: confirm.commentId });
			closeConfirm();
			return;
		}

		try {
			await deletePostMutation.mutateAsync({ postId: confirm.postId });
			closeConfirm();
			navigate("/", { replace: true });
		} catch (err: unknown) {
			closeConfirm();
			console.error(err);
		}
	};

	const handleReact = (
		commentId: string,
		reaction: CommentReactionValue | null
	) => {
		setReactionMutation.mutate({ commentId, reaction });
	};

	const onSubmitComment = async (values: CommentFormValues) => {
		const text = values.body.trim();
		if (!text) return;

		await createCommentMutation.mutateAsync({ body: text });
		reset();
	};

	if (!id) {
		return (
			<Container className="py-4">
				<Alert variant="danger">No post id provided.</Alert>
			</Container>
		);
	}

	if (isLoading) {
		return (
			<Container className="py-4 d-flex justify-content-center">
				<Spinner animation="border" />
			</Container>
		);
	}

	if (error || !postDetail) {
		return (
			<Container className="py-4">
				<Alert variant="danger">Failed to load post.</Alert>
			</Container>
		);
	}

	const { post, author, images, tags } = postDetail;

	const mainImage =
		images && images.length > 0 ? images[selectedImageIndex] : null;

	const createdAt = post.created_at ? new Date(post.created_at) : null;

	return (
		<Container className="pb-4 pt-1">
			<Row className="mb-3">
				<Col>
					<div className="d-flex align-items-start justify-content-between gap-3">
						<div className="flex-grow-1">
							<h2 className="mb-2">{post.title}</h2>

							<div className="d-flex align-items-center text-muted">
								<Link
									to={`/u/${author.handle}`}
									className="d-flex align-items-center text-decoration-none text-reset"
								>
									<UserAvatar
										src={author.avatar_url}
										alt={author.handle}
										size={40}
										className="me-2"
									/>
									<div>
										<div className="fw-semibold">
											{author.display_name ??
												author.handle}
										</div>
										<div className="small">
											@{author.handle}
											{createdAt && (
												<>
													{" "}
													·{" "}
													{createdAt.toLocaleDateString()}
												</>
											)}
										</div>
									</div>
								</Link>
							</div>
						</div>

						{canDeletePost && (
							<Button
								variant="link"
								className="p-0 text-danger"
								onClick={() => openDeletePostModal(post.id)}
								aria-label="Delete post"
							>
								<FiTrash2 size={20} />
							</Button>
						)}
					</div>
				</Col>
			</Row>

			<Row>
				<Col md={8} className="mb-3">
					{mainImage && (
						<div className="mb-3 border rounded overflow-hidden">
							<img
								src={mainImage.image_url}
								alt={post.title}
								style={{
									width: "100%",
									maxHeight: 500,
									objectFit: "contain",
									backgroundColor: "#000",
								}}
							/>
						</div>
					)}

					{images && images.length > 1 && (
						<div className="d-flex flex-wrap gap-2">
							{images.map((img, index) => (
								<button
									key={img.id}
									type="button"
									className="border-0 p-0 rounded overflow-hidden"
									style={{
										width: 80,
										height: 80,
										boxShadow:
											index === selectedImageIndex
												? "0 0 0 2px #0d6efd"
												: "none",
									}}
									onClick={() => setSelectedImageIndex(index)}
								>
									<img
										src={img.image_url}
										alt={`thumb-${index}`}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								</button>
							))}
						</div>
					)}

					{post.body && (
						<div className="mt-4">
							<p
								style={{
									whiteSpace: "pre-wrap",
									overflowWrap: "break-word",
									wordBreak: "break-word",
								}}
							>
								{post.body}
							</p>
						</div>
					)}
				</Col>

				<Col md={4}>
					{tags && tags.length > 0 && (
						<div className="mb-3">
							<h5 className="mb-2">Tags</h5>
							<div className="d-flex flex-wrap gap-2">
								{tags.map((tag) => (
									<Badge bg="secondary" key={tag.id}>
										{tag.name}
									</Badge>
								))}
							</div>
						</div>
					)}

					<div className="mt-4 text-muted small">
						<hr />

						<h5>Comments</h5>

						{!user && (
							<p className="text-muted">
								Log in to leave a comment.
							</p>
						)}

						{user && (
							<form
								onSubmit={handleSubmit(onSubmitComment)}
								className="mb-3"
							>
								<textarea
									className="form-control mb-2"
									rows={3}
									placeholder="Write a comment..."
									{...register("body", {
										required: "Comment cannot be empty",
										maxLength: {
											value: 500,
											message: "Max 500 characters",
										},
									})}
								/>
								{errors.body && (
									<div className="text-danger small">
										{errors.body.message}
									</div>
								)}
								<button
									type="submit"
									className="btn btn-primary btn-sm"
									disabled={isSubmitting}
								>
									Post comment
								</button>
							</form>
						)}

						{commentsLoading && (
							<p className="text-muted">Loading comments…</p>
						)}

						{!commentsLoading && (comments?.length ?? 0) === 0 && (
							<p className="text-muted">
								No comments yet. Be the first to comment.
							</p>
						)}

						{comments?.map((c) => (
							<Comment
								key={c.comment.id}
								item={c}
								canDelete={canDeleteComment(
									c.comment.author_id
								)}
								onDelete={() =>
									openDeleteCommentModal(c.comment.id)
								}
								onReact={handleReact}
							/>
						))}
					</div>
				</Col>
			</Row>

			<Modal show={confirm.open} onHide={closeConfirm} centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{confirm.open && confirm.kind === "post"
							? "Delete post?"
							: "Delete comment?"}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>This action can’t be undone.</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={closeConfirm}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={() => {
							void confirmDelete();
						}}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default PostPage;
