import {
	FaInstagram,
	FaTwitter,
	FaTiktok,
	FaPinterest,
	FaYoutube,
	FaFacebook,
	FaReddit,
	FaBehance,
	FaDribbble,
	FaDeviantart,
	FaTumblr,
	FaDiscord,
	FaTwitch,
	FaGlobe,
} from "react-icons/fa";
import { SiArtstation } from "react-icons/si";
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
import type { JSX } from "react";
import { groupMedals } from "../utils/medals";

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
		socialLinks: string[];
	}

	const ProfileInfo = ({
		profile,
		medals,
		socialLinks,
	}: ProfileInfoProps) => {
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
				<SocialLinks links={socialLinks} />
			</div>
		);
	};

	// SOCIAL LINKS HELPER
	type SocialPlatform =
		| "instagram"
		| "twitter"
		| "tiktok"
		| "pinterest"
		| "youtube"
		| "facebook"
		| "reddit"
		| "behance"
		| "dribbble"
		| "artstation"
		| "deviantart"
		| "tumblr"
		| "discord"
		| "twitch"
		| "other";

	interface ParsedSocialLink {
		platform: SocialPlatform;
		icon: JSX.Element;
		label: string;
		displayText: string;
		url: string;
	}

	const truncateUrl = (url: string, maxLength = 32): string => {
		if (url.length <= maxLength) return url;
		return url.slice(0, maxLength - 2) + "..";
	};

	const parseSocialLink = (raw: string): ParsedSocialLink | null => {
		const trimmed = raw.trim();
		if (!trimmed) return null;

		let url: URL;
		try {
			url = new URL(trimmed);
		} catch {
			try {
				url = new URL(`https://${trimmed}`);
			} catch {
				return null;
			}
		}

		const host = url.hostname.toLowerCase();
		const pathParts = url.pathname.split("/").filter(Boolean);
		const username = pathParts[0] ?? "";

		if (host.includes("instagram.com")) {
			return {
				platform: "instagram",
				icon: <FaInstagram />,
				label: "Instagram",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("twitter.com") || host.includes("x.com")) {
			return {
				platform: "twitter",
				icon: <FaTwitter />,
				label: "Twitter",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("tiktok.com")) {
			return {
				platform: "tiktok",
				icon: <FaTiktok />,
				label: "TikTok",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("pinterest.")) {
			return {
				platform: "pinterest",
				icon: <FaPinterest />,
				label: "Pinterest",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("youtube.com") || host.includes("youtu.be")) {
			return {
				platform: "youtube",
				icon: <FaYoutube />,
				label: "YouTube",
				displayText: username ? username : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("facebook.com")) {
			return {
				platform: "facebook",
				icon: <FaFacebook />,
				label: "Facebook",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("reddit.com")) {
			return {
				platform: "reddit",
				icon: <FaReddit />,
				label: "Reddit",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("behance.net")) {
			return {
				platform: "behance",
				icon: <FaBehance />,
				label: "Behance",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("dribbble.com")) {
			return {
				platform: "dribbble",
				icon: <FaDribbble />,
				label: "Dribbble",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("artstation.com")) {
			return {
				platform: "artstation",
				icon: <SiArtstation />,
				label: "ArtStation",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("deviantart.com")) {
			return {
				platform: "deviantart",
				icon: <FaDeviantart />,
				label: "DeviantArt",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("tumblr.com")) {
			return {
				platform: "tumblr",
				icon: <FaTumblr />,
				label: "Tumblr",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("twitch.tv")) {
			return {
				platform: "twitch",
				icon: <FaTwitch />,
				label: "Twitch",
				displayText: username ? `@${username}` : url.hostname,
				url: url.toString(),
			};
		}

		if (host.includes("discord.gg") || host.includes("discord.com")) {
			return {
				platform: "discord",
				icon: <FaDiscord />,
				label: "Discord",
				displayText: username ? username : url.hostname,
				url: url.toString(),
			};
		}

		return {
			platform: "other",
			icon: <FaGlobe />,
			label: url.hostname,
			displayText: truncateUrl(url.toString()),
			url: url.toString(),
		};
	};

	interface SocialLinksProps {
		links: string[];
	}

	const SocialLinks = ({ links }: SocialLinksProps) => {
		const rawLinks = Array.isArray(links)
			? links
			: links && typeof links === "object"
			? Object.values(links as Record<string, string>)
			: [];

		const parsed = rawLinks
			.map((link) => parseSocialLink(link))
			.filter((x): x is ParsedSocialLink => x !== null);

		if (parsed.length === 0) return null;

		return (
			<div className="mt-3">
				<strong>Socials</strong>
				<div className="mt-2 d-flex flex-column gap-1">
					{parsed.map((item, idx) => (
						<a
							key={idx}
							href={item.url}
							target="_blank"
							rel="noreferrer"
							className="d-flex align-items-center text-decoration-none"
						>
							<span className="me-2" style={{ fontSize: 18 }}>
								{item.icon}
							</span>
							<span className="text-muted me-1">
								{item.platform === "other"
									? ""
									: `${item.label}: `}
							</span>
							<span>{item.displayText}</span>
						</a>
					))}
				</div>
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
						<ProfileInfo
							profile={profile}
							medals={medals ?? []}
							socialLinks={profile.social_links ?? []}
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

					<div className="row">
						<div className="col-12 col-md-8">{/* posts */}</div>
						<div className="col-md-4 d-none d-md-block">
							<ProfileInfo
								profile={profile}
								medals={medals ?? []}
								socialLinks={profile.social_links ?? []}
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
