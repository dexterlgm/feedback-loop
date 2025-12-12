import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Badge } from "react-bootstrap";
import { usePostDetail } from "../features/posts/posts.queries";
import { UserAvatar } from "../components/common/UserAvatar";

const PostPage = () => {
	const { id } = useParams<{ id: string }>();

	const { data: postDetail, isLoading, error } = usePostDetail(id);

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
		<Container className="py-4">
			<Row className="mb-3">
				<Col>
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
									{author.display_name ?? author.handle}
								</div>
								<div className="small">
									@{author.handle}
									{createdAt && (
										<> · {createdAt.toLocaleDateString()}</>
									)}
								</div>
							</div>
						</Link>
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
									key={img.id ?? index}
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
							<p style={{ whiteSpace: "pre-wrap" }}>
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

					{/* TODO: ADD COMMENTS */}
					<div className="mt-4 text-muted small">Comments</div>
				</Col>
			</Row>
		</Container>
	);
};

export default PostPage;
