import { useParams } from "react-router-dom";
import {
	useProfileByHandle,
	useMedalsForUser,
} from "../features/profiles/profiles.queries";
import { useAuth } from "../hooks/useAuth";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { usePostsByUser } from "../features/posts/posts.queries";
import PostCard from "../components/PostCard";
import ProfileInfo from "../components/ProfileInfo";

const ProfilePage = () => {
	const { handle } = useParams();
	const { data: profile } = useProfileByHandle(handle);
	const { data: medals } = useMedalsForUser(profile?.id);
	const { user, profile: currentProfile } = useAuth();

	const PAGE_SIZE = 12;
	const [limit, setLimit] = useState(PAGE_SIZE);

	const {
		data: posts,
		isLoading: postsLoading,
		isFetching,
	} = usePostsByUser(profile?.id, limit, 0);

	const canEdit =
		user && profile && (currentProfile?.is_admin || user.id === profile.id);

	return (
		<div className="container pb-4 pt-1">
			{!profile ? (
				<p>Loading…</p>
			) : (
				<div>
					<div className="d-md-none mb-4">
						<ProfileInfo
							profile={profile}
							medals={medals ?? []}
							socialLinks={profile.social_links ?? []}
							canEdit={canEdit}
						/>
					</div>

					<div className="row">
						<div className="col-12 col-md-8">
							{postsLoading && <p>Loading posts…</p>}

							{posts && posts.length === 0 && (
								<p className="text-muted">No posts yet.</p>
							)}

							{posts && posts.length > 0 && (
								<div className="d-flex flex-column gap-3">
									<h3>{profile.display_name}'s posts:</h3>
									{posts.map((item) => (
										<PostCard
											key={item.post.id}
											item={item}
											variant="list"
										/>
									))}
								</div>
							)}
						</div>

						<div className="col-md-4 d-none d-md-block">
							<ProfileInfo
								profile={profile}
								medals={medals ?? []}
								socialLinks={profile.social_links ?? []}
								canEdit={canEdit}
							/>
						</div>

						{posts && posts.length >= limit && (
							<div className="d-grid mt-3">
								<Button
									variant="outline-primary"
									disabled={isFetching}
									onClick={() =>
										setLimit((prev) => prev + PAGE_SIZE)
									}
								>
									{isFetching ? "Loading…" : "Load more"}
								</Button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ProfilePage;
