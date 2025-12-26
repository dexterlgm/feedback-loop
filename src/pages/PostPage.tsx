import { useEffect, useMemo, useState } from "react";
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
	Form,
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
import type { CommentWithMeta } from "../types";

type CommentSort = "newest" | "top";

const PostPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: postDetail, isLoading, error } = usePostDetail(id);
	const { user, profile: currentProfile } = useAuth();

	useEffect(() => {
		if (postDetail?.post.title) {
			document.title = `Feedback Loop - ${postDetail?.post.title}`;
		} else if (!isLoading) {
			document.title = `Post not found`;
		}
	});

	const { data: comments, isLoading: commentsLoading } = useCommentsForPost(
		id,
		user?.id
	);

	const createCommentMutation = useCreateCommentMutation(id ?? "");
	const deleteCommentMutation = useDeleteCommentMutation(id ?? "");
	const setReactionMutation = useSetCommentReactionMutation(id ?? "");

	const deletePostMutation = useDeletePostMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<{ body: string }>();

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [showDeletePostModal, setShowDeletePostModal] = useState(false);
	const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

	const [commentSort, setCommentSort] = useState<CommentSort>("top");

	const sortedComments = useMemo<CommentWithMeta[]>(() => {
		const list = comments ?? [];
		if (list.length === 0) return [];

		if (commentSort === "newest") {
			return [...list].sort(
				(a, b) =>
					new Date(b.comment.created_at).getTime() -
					new Date(a.comment.created_at).getTime()
			);
		}

		return [...list].sort((a, b) => {
			const aScore = a.reactions.likeCount - a.reactions.dislikeCount;
			const bScore = b.reactions.likeCount - b.reactions.dislikeCount;

			if (bScore !== aScore) return bScore - aScore;

			return (
				new Date(b.comment.created_at).getTime() -
				new Date(a.comment.created_at).getTime()
			);
		});
	}, [comments, commentSort]);

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

	const { post, author, images, tags, stats } = postDetail;

	const canDeletePost = () => {
		if (!user) return false;
		if (currentProfile?.is_admin) return true;
		return user.id === post.author_id;
	};

	const canDeleteComment = (authorId: string) => {
		if (!user) return false;
		if (currentProfile?.is_admin) return true;
		return user.id === authorId;
	};

	const requestDeleteComment = (commentId: string) => {
		setCommentToDelete(commentId);
		setShowDeleteCommentModal(true);
	};

	const confirmDeleteComment = () => {
		if (!commentToDelete) return;
		deleteCommentMutation.mutate({ commentId: commentToDelete });
		setShowDeleteCommentModal(false);
		setCommentToDelete(null);
	};

	const handleReact = (commentId: string, reaction: 1 | -1 | null) => {
		setReactionMutation.mutate({ commentId, reaction });
	};

	const onSubmitComment = async (values: { body: string }) => {
		const text = values.body.trim();
		if (!text) return;

		await createCommentMutation.mutateAsync({ body: text });
		reset();
	};

	const confirmDeletePost = async () => {
		await deletePostMutation.mutateAsync({ postId: post.id });
		setShowDeletePostModal(false);
		navigate("/");
	};

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

						{canDeletePost() && (
							<Button
								variant="link"
								className="p-0 text-danger"
								onClick={() => setShowDeletePostModal(true)}
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
									wordBreak: "break-all",
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

						<div className="d-flex align-items-center justify-content-between">
							<h5 className="mb-0">Comments</h5>

							<Form.Select
								size="sm"
								style={{ width: 140 }}
								value={commentSort}
								onChange={(e) =>
									setCommentSort(
										e.target.value as CommentSort
									)
								}
							>
								<option value="top">Top</option>
								<option value="newest">Newest</option>
							</Form.Select>
						</div>

						{!user && (
							<p className="text-muted mt-2">
								Log in to leave a comment.
							</p>
						)}

						{user && (
							<form
								onSubmit={handleSubmit(onSubmitComment)}
								className="mb-1 mt-2"
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

						{!commentsLoading && sortedComments.length === 0 && (
							<p className="text-muted">
								No comments yet. Be the first to comment.
							</p>
						)}

						{!commentsLoading && sortedComments.length > 0 && (
							<div className="text-muted small mb-1 text-end">
								{stats.commentCount} comments
							</div>
						)}

						{sortedComments.map((c) => (
							<Comment
								key={c.comment.id}
								item={c}
								canDelete={canDeleteComment(
									c.comment.author_id
								)}
								onDelete={requestDeleteComment}
								onReact={handleReact}
								currentUserId={user?.id ?? null}
							/>
						))}
					</div>
				</Col>
			</Row>

			<Modal
				show={showDeletePostModal}
				onHide={() => setShowDeletePostModal(false)}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Delete post?</Modal.Title>
				</Modal.Header>
				<Modal.Body>This action cannot be undone.</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setShowDeletePostModal(false)}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={() => void confirmDeletePost()}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={showDeleteCommentModal}
				onHide={() => setShowDeleteCommentModal(false)}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Delete comment?</Modal.Title>
				</Modal.Header>
				<Modal.Body>This action cannot be undone.</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setShowDeleteCommentModal(false)}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={() => confirmDeleteComment()}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default PostPage;
