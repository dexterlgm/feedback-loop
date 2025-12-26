import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Container,
	Form,
	Button,
	Row,
	Col,
	Alert,
	Spinner,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
	useProfileByHandle,
	useUpdateProfileMutation,
} from "../features/profiles/profiles.queries";
import { useAuth } from "../hooks/useAuth";
import { UserAvatar } from "../components/common/UserAvatar";
import { uploadAvatar } from "../services/storage";

type FormValues = {
	displayName: string;
	bio: string;
	socialLinks: string[];
};

const MAX_SOCIAL_LINKS = 6;

const EditProfilePage = () => {
	const { handle } = useParams();
	const navigate = useNavigate();

	const { data: profile, isLoading: profileLoading } =
		useProfileByHandle(handle);
	const { user, profile: currentProfile } = useAuth();
	const updateProfileMutation = useUpdateProfileMutation();

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [avatarError, setAvatarError] = useState<string | null>(null);

	useEffect(() => {
		document.title = `Feedback Loop - Edit profile`;
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting, errors },
	} = useForm<FormValues>({
		defaultValues: {
			displayName: "",
			bio: "",
			socialLinks: Array(MAX_SOCIAL_LINKS).fill(""),
		},
	});

	// Load profile into form when ready
	useEffect(() => {
		if (!profile) return;

		const existingLinks = Array.isArray(profile.social_links)
			? profile.social_links
			: [];

		reset({
			displayName: profile.display_name ?? "",
			bio: profile.bio ?? "",
			socialLinks: [
				...existingLinks,
				...Array(
					Math.max(0, MAX_SOCIAL_LINKS - existingLinks.length)
				).fill(""),
			].slice(0, MAX_SOCIAL_LINKS),
		});
	}, [profile, reset]);

	const canEdit =
		user && profile && (currentProfile?.is_admin || user.id === profile.id);

	if (profileLoading) {
		return (
			<Container className="py-4">
				<p>Loading…</p>
			</Container>
		);
	}

	if (!profile) {
		return (
			<Container className="py-4">
				<Alert variant="danger">Profile not found.</Alert>
			</Container>
		);
	}

	if (!canEdit) {
		return (
			<Container className="py-4">
				<Alert variant="danger">
					You are not allowed to edit this profile.
				</Alert>
			</Container>
		);
	}

	const onSubmit = async (values: FormValues) => {
		try {
			setErrorMessage(null);

			let avatarUrl = profile!.avatar_url ?? null;

			if (avatarFile && user) {
				avatarUrl = await uploadAvatar(avatarFile, user.id);
			}

			const socialLinksRecord: Record<string, string> = {};

			for (const link of values.socialLinks) {
				const trimmed = link.trim();
				if (trimmed.length > 0) {
					socialLinksRecord[trimmed] = trimmed;
				}
			}

			await updateProfileMutation.mutateAsync({
				id: profile!.id,
				displayName: values.displayName || undefined,
				bio: values.bio || undefined,
				socialLinks:
					Object.keys(socialLinksRecord).length > 0
						? socialLinksRecord
						: null,
				avatarUrl: avatarUrl ?? undefined,
			});

			navigate(`/u/${profile!.handle}`);
		} catch (err: unknown) {
			console.error(err);

			const message =
				err instanceof Error ? err.message : "Failed to update profile";

			setErrorMessage(message);
		}
	};

	return (
		<Container className="pb-4 pt1">
			<h2 className="mb-3">Edit profile</h2>
			<p className="text-muted mb-4">@{profile.handle}</p>

			{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

			<Form onSubmit={handleSubmit(onSubmit)}>
				<Row className="mb-4 align-items-center">
					<Col xs="auto">
						<UserAvatar
							src={profile.avatar_url}
							alt={profile.handle}
							size={64}
						/>
					</Col>
					<Col>
						<Form.Label>Profile picture</Form.Label>
						<Form.Control
							type="file"
							accept="image/*"
							onChange={(e) => {
								const input = e.target as HTMLInputElement;
								const file = input.files?.[0] ?? null;

								if (!file) {
									setAvatarFile(null);
									setAvatarError(null);
									return;
								}

								const maxSize = 5 * 1024 * 1024;
								if (file.size > maxSize) {
									setAvatarFile(null);
									setAvatarError(
										"Image must be smaller than 5MB."
									);
									return;
								}

								if (!file.type.startsWith("image/")) {
									setAvatarFile(null);
									setAvatarError("File must be an image.");
									return;
								}

								setAvatarFile(file);
								setAvatarError(null);
							}}
						/>
						{avatarError && (
							<div className="text-danger small mt-1">
								{avatarError}
							</div>
						)}
						<Form.Text className="text-muted">
							Upload a new image to change your profile picture.
						</Form.Text>
					</Col>
				</Row>

				<Form.Group className="mb-3" controlId="displayName">
					<Form.Label>Username</Form.Label>
					<Form.Control
						type="text"
						placeholder="Your display name"
						isInvalid={!!errors.displayName}
						{...register("displayName", {
							maxLength: {
								value: 20,
								message:
									"Username must be at most 20 characters",
							},
							validate: (value) =>
								!value ||
								value.trim().length > 0 ||
								"Username cannot be only spaces",
						})}
					/>
					<Form.Control.Feedback type="invalid">
						{errors.displayName?.message}
					</Form.Control.Feedback>

					<Form.Text className="text-muted">
						This is your public name. Your handle (@{profile.handle}
						) cannot be changed.
					</Form.Text>
				</Form.Group>

				<Form.Group className="mb-3" controlId="bio">
					<Form.Label>Bio</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						placeholder="Tell people about yourself"
						isInvalid={!!errors.bio}
						{...register("bio", {
							maxLength: {
								value: 180,
								message:
									"Your bio can be at most 180 characters long",
							},
						})}
					/>
					<Form.Control.Feedback type="invalid">
						{errors.bio?.message}
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Social links</Form.Label>

					{Array.from({ length: MAX_SOCIAL_LINKS }).map(
						(_, index) => (
							<div key={index} className="mb-2">
								<Form.Control
									type="url"
									placeholder={`Link ${index + 1} (optional)`}
									isInvalid={!!errors.socialLinks?.[index]}
									{...register(
										`socialLinks.${index}` as const,
										{
											validate: (value) => {
												const trimmed = value.trim();
												if (!trimmed) return true;
												try {
													new URL(trimmed);
													return true;
												} catch {
													return "Must be a valid URL (e.g. https://...)";
												}
											},
										}
									)}
								/>
								<Form.Control.Feedback type="invalid">
									{errors.socialLinks?.[index]?.message}
								</Form.Control.Feedback>
							</div>
						)
					)}

					<Form.Text className="text-muted">
						Paste full URLs (e.g. https://instagram.com/yourname).
					</Form.Text>
				</Form.Group>

				<Button
					type="submit"
					variant="primary"
					disabled={isSubmitting || updateProfileMutation.isPending}
				>
					{isSubmitting || updateProfileMutation.isPending ? (
						<Spinner size="sm" />
					) : (
						"Save changes"
					)}
				</Button>
				<Button
					variant="outline-secondary"
					className="ms-2"
					type="button"
					onClick={() => navigate(`/u/${profile!.handle}`)}
				>
					Cancel
				</Button>
			</Form>
		</Container>
	);
};

export default EditProfilePage;
