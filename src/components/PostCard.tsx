import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { PostFeedItem } from "./../types";
import { UserAvatar } from "./common/UserAvatar";

type Variant = "list" | "grid";

interface PostCardProps {
	item: PostFeedItem;
	variant?: Variant;
}

const timeAgo = (iso: string): string => {
	const then = new Date(iso).getTime();
	const diff = Date.now() - then;

	const sec = Math.max(0, Math.floor(diff / 1000));
	if (sec < 60) return `${sec}s ago`;

	const min = Math.floor(sec / 60);
	if (min < 60) return `${min}m ago`;

	const hr = Math.floor(min / 60);
	if (hr < 24) return `${hr}h ago`;

	const day = Math.floor(hr / 24);
	return `${day}d ago`;
};

const PostCard = ({ item, variant = "list" }: PostCardProps) => {
	const name = item.author.display_name ?? item.author.handle;
	const thumb = item.images[0]?.image_url ?? null;

	const imageHeight = variant === "grid" ? 180 : 260;

	return (
		<Card className="h-100">
			{thumb && (
				<Link to={`/posts/${item.post.id}`}>
					<Card.Img
						variant="top"
						src={thumb}
						alt={item.post.title}
						style={{ height: imageHeight, objectFit: "cover" }}
					/>
				</Link>
			)}

			<Card.Body className="d-flex flex-column">
				<div className="d-flex align-items-center gap-2 mb-2">
					<UserAvatar
						src={item.author.avatar_url}
						alt={item.author.handle}
						size={28}
					/>
					<div className="d-flex flex-column lh-sm">
						<strong className="text-truncate">{name}</strong>
						<small className="text-muted">
							@{item.author.handle}
						</small>
					</div>
					<div className="ms-auto text-muted small">
						{timeAgo(item.post.created_at)}
					</div>
				</div>

				<Card.Title className="mb-2 text-truncate">
					<Link
						to={`/posts/${item.post.id}`}
						className="text-decoration-none"
					>
						{item.post.title}
					</Link>
				</Card.Title>

				<div className="mt-auto d-flex justify-content-between text-muted small">
					<span>{item.stats.commentCount} comments</span>
				</div>
			</Card.Body>
		</Card>
	);
};

export default PostCard;
