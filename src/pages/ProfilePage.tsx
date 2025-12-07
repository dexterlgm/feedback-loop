import { useParams, Link } from "react-router-dom";
import {
	useProfileByHandle,
	useMedalsForUser,
} from "../features/profiles/profiles.queries";
import { useAuth } from "../hooks/useAuth";
import type { Medal, Profile } from "../types";
import { MedalIcon } from "../components/common/MedalIcon";
import { Button } from "react-bootstrap";
import { UserAvatar } from "../components/common/UserAvatar";

const ProfilePage = () => {
	const { handle } = useParams();
	const { data: profile } = useProfileByHandle(handle);
	const { data: medals } = useMedalsForUser(profile?.id);
	const { user, profile: currentProfile } = useAuth();

	const canEdit =
		user && profile && (currentProfile?.is_admin || user.id === profile.id);

	console.log(
		{ profile },
		{ user },
		{ currentProfile },
		{ canEdit },
		{ medals }
	);

	interface ProfileInfoProps {
		profile: Profile;
		medals: Medal[];
	}

	const groupMedals = (medals: Medal[]) => {
		return Object.values(
			medals.reduce<Record<string, { medal: Medal; count: number }>>(
				(acc, medal) => {
					const key = String(medal.id);
					if (!acc[key]) {
						acc[key] = { medal, count: 0 };
					}
					acc[key].count += 1;
					return acc;
				},
				{}
			)
		);
	};

	const ProfileInfo = ({ profile, medals }: ProfileInfoProps) => {
		return (
			<div className="p-3 border rounded">
				<div className="d-flex align-items-center mb-3">
					<UserAvatar
						src={profile.avatar_url}
						alt={profile.handle}
						size={64}
						className="me-3"
					/>
					<div>
						<h3 className="mb-0">
							{profile.display_name ?? profile.handle}
						</h3>
						<p className="text-muted mb-0">@{profile.handle}</p>
					</div>
				</div>

				{medals.length > 0 && (
					<div className="mt-3">
						<strong>Medals</strong>
						<div className="d-flex flex-wrap gap-2 mt-2">
							{groupMedals(medals).map(({ medal, count }) => (
								<MedalIcon
									key={medal.id}
									medal={medal}
									count={count}
									size={32}
								/>
							))}
						</div>
					</div>
				)}

				{profile.bio && <p className="mt-3">{profile.bio}</p>}
			</div>
		);
	};

	return (
		<div className="container py-4">
			{!profile ? (
				<p>Loading…</p>
			) : (
				<div>
					<div className="d-md-none mb-4">
						<ProfileInfo profile={profile} medals={medals ?? []} />
						{canEdit && (
							<div className="mt-2">
								<Button
									as={Link as any}
									to={`/u/${profile.handle}/edit`}
									variant="outline-secondary"
									size="sm"
								>
									Edit profile
								</Button>
							</div>
						)}
					</div>

					<div className="row">
						<div className="col-12 col-md-8">{/* posts */}</div>
						<div className="col-md-4 d-none d-md-block">
							<ProfileInfo
								profile={profile}
								medals={medals ?? []}
							/>
							{canEdit && (
								<div className="mt-2">
									<Button
										as={Link as any}
										to={`/u/${profile.handle}/edit`}
										variant="outline-secondary"
										size="sm"
									>
										Edit profile
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProfilePage;
