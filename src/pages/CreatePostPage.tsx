import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useCreatePostMutation } from "../features/posts/posts.queries";
import { useAuth } from "../hooks/useAuth";
import { useTags } from "../features/tags/tags.queries";

type FormValues = {
	title: string;
	body: string;
};

type ImageItem = {
	file: File;
	previewUrl: string;
};

const MIN_TAGS = 1;
const MAX_TAGS = 3;

const CreatePostPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const createPost = useCreatePostMutation();
	const { data: tags, isLoading: tagsLoading, error: tagsError } = useTags();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormValues>();

	const [images, setImages] = useState<ImageItem[]>([]);
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [tagSearch, setTagSearch] = useState("");
	const [showAllTags, setShowAllTags] = useState(false);

	const MAX_VISIBLE_TAGS = 12;

	const normalizedSearch = tagSearch.trim().toLowerCase();

	let filteredTags = tags ?? [];

	if (normalizedSearch) {
		filteredTags = filteredTags.filter((tag) =>
			tag.name.toLowerCase().includes(normalizedSearch)
		);
	}

	const visibleTags = showAllTags
		? filteredTags
		: filteredTags.slice(0, MAX_VISIBLE_TAGS);

	if (!user) {
		return (
			<Container className="py-4">
				<Alert variant="warning">
					You must be logged in to create a post.
				</Alert>
			</Container>
		);
	}

	const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files);

		const newImageItems: ImageItem[] = [];

		for (const file of fileArray) {
			const previewUrl = URL.createObjectURL(file);
			newImageItems.push({ file, previewUrl });
		}

		setImages((prevImages) => [...prevImages, ...newImageItems]);

		e.target.value = "";
	};

	const handleRemoveImage = (index: number) => {
		setImages((prevImages) => {
			const updatedImages = [...prevImages];

			const imageToRemove = updatedImages[index];
			URL.revokeObjectURL(imageToRemove.previewUrl);

			updatedImages.splice(index, 1);

			return updatedImages;
		});
	};

	const toggleTag = (tagId: number) => {
		setSelectedTagIds((prevSelected) => {
			if (prevSelected.includes(tagId)) {
				return prevSelected.filter((id) => id !== tagId);
			}

			if (prevSelected.length >= MAX_TAGS) {
				return prevSelected;
			}

			return [...prevSelected, tagId];
		});
	};

	const onSubmit = async (values: FormValues) => {
		try {
			setErrorMessage(null);

			if (images.length === 0) {
				setErrorMessage("Please add at least one image.");
				return;
			}

			if (selectedTagIds.length < MIN_TAGS) {
				setErrorMessage("Please select at least one tag.");
				return;
			}

			const files = images.map((item) => item.file);

			const { post } = await createPost.mutateAsync({
				title: values.title.trim(),
				body: values.body.trim() || null,
				tagIds: selectedTagIds,
				files,
			});

			images.forEach((item) => URL.revokeObjectURL(item.previewUrl));

			navigate(`/posts/${post.id}`);
		} catch (err: any) {
			console.error(err);
			setErrorMessage(err.message ?? "Failed to create post.");
		}
	};

	return (
		<Container className="py-4">
			<h2 className="mb-3">Create a new post</h2>

			{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

			<Form onSubmit={handleSubmit(onSubmit)}>
				<Form.Group className="mb-3" controlId="title">
					<Form.Label>Title</Form.Label>
					<Form.Control
						type="text"
						placeholder="Please help me with..."
						isInvalid={!!errors.title}
						{...register("title", {
							required: "Title is required",
							maxLength: {
								value: 30,
								message: "Title cannot exceed 30 characters",
							},
						})}
					/>
					<Form.Control.Feedback type="invalid">
						{errors.title?.message}
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-3" controlId="body">
					<Form.Label>Description</Form.Label>
					<Form.Control
						as="textarea"
						rows={4}
						placeholder="A description of what you need help with/want feedback on..."
						isInvalid={!!errors.body}
						{...register("body", {
							required: "A description is required",
							maxLength: {
								value: 200,
								message:
									"Description cannot exceed 200 characters",
							},
						})}
					/>
					<div className="text-muted small mt-1">
						{watch("body")?.length ?? 0}/200 characters
					</div>

					<Form.Control.Feedback type="invalid">
						{errors.body?.message}
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Images (at least one)</Form.Label>
					<Form.Control
						type="file"
						accept="image/*"
						multiple
						onChange={handleImagesChange}
					/>
					{images.length > 0 && (
						<Row className="mt-3 g-2">
							{images.map((item, index) => (
								<Col key={index} xs={6} md={3}>
									<div className="position-relative border rounded overflow-hidden">
										<img
											src={item.previewUrl}
											alt={`preview-${index}`}
											style={{
												width: "100%",
												height: 120,
												objectFit: "cover",
											}}
										/>
										<Button
											variant="danger"
											size="sm"
											className="position-absolute top-0 end-0 m-1 py-0 px-1"
											onClick={() =>
												handleRemoveImage(index)
											}
										>
											×
										</Button>
									</div>
								</Col>
							))}
						</Row>
					)}
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Tags (1–3)</Form.Label>

					{tagsError && (
						<div className="text-danger small mb-2">
							Failed to load tags.
						</div>
					)}

					<Form.Control
						type="text"
						placeholder="Search tags..."
						className="mb-2"
						value={tagSearch}
						onChange={(e) => {
							setTagSearch(e.target.value);
							setShowAllTags(false);
						}}
					/>

					<div className="d-flex flex-wrap gap-2">
						{tagsLoading && (
							<span className="text-muted small">
								Loading tags...
							</span>
						)}

						{!tagsLoading &&
							visibleTags.map((tag) => {
								const selected = selectedTagIds.includes(
									tag.id
								);
								return (
									<Button
										key={tag.id}
										variant={
											selected
												? "primary"
												: "outline-secondary"
										}
										size="sm"
										type="button"
										onClick={() => toggleTag(tag.id)}
									>
										{tag.name}
									</Button>
								);
							})}
					</div>

					{!tagsLoading && filteredTags.length > MAX_VISIBLE_TAGS && (
						<button
							type="button"
							className="btn btn-link btn-sm mt-1 p-0"
							onClick={() => setShowAllTags((prev) => !prev)}
						>
							{showAllTags ? "Show fewer tags" : "Show all tags"}
						</button>
					)}
				</Form.Group>

				<Button
					type="submit"
					variant="primary"
					disabled={createPost.isPending}
				>
					{createPost.isPending ? "Publishing..." : "Publish post"}
				</Button>
			</Form>
		</Container>
	);
};

export default CreatePostPage;
