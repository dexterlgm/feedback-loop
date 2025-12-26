import { Button } from "react-bootstrap";
import type { Medal, Profile } from "../types";
import { groupMedals } from "../utils/medals";
import { MedalIcon } from "./common/MedalIcon";
import { UserAvatar } from "./common/UserAvatar";
import SocialLinks from "./SocialLinks";
import { Link } from "react-router-dom";

interface ProfileInfoProps {
	profile: Profile;
	medals: Medal[];
	socialLinks: string[];
	canEdit: boolean | null | undefined;
}

const ProfileInfo = ({
	profile,
	medals,
	socialLinks,
	canEdit,
}: ProfileInfoProps) => {
	return (
		<div className="p-3 border rounded sticky-top">
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
			<SocialLinks links={socialLinks} />
			{canEdit && (
				<Button
					as={Link as any}
					to={`/u/${profile.handle}/edit`}
					variant="outline-secondary"
					size="sm"
					className="mt-3"
				>
					Edit profile
				</Button>
			)}
		</div>
	);
};

export default ProfileInfo;
