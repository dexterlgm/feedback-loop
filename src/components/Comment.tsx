import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FiThumbsUp, FiThumbsDown, FiTrash2 } from "react-icons/fi";
import type { CommentWithMeta, CommentReactionValue } from "../types";
import { UserAvatar } from "./common/UserAvatar";
import { MedalIcon } from "./common/MedalIcon";
import { groupMedals } from "../utils/medals";

interface CommentProps {
	item: CommentWithMeta;
	canDelete: boolean;
	onDelete: () => void;
	onReact: (commentId: string, reaction: CommentReactionValue | null) => void;
}

const Comment = ({ item, canDelete, onDelete, onReact }: CommentProps) => {
	const { comment, author, medals, reactions } = item;

	const createdAt = new Date(comment.created_at);

	const handleLike = () => {
		onReact(comment.id, reactions.viewerReaction === 1 ? null : 1);
	};

	const handleDislike = () => {
		onReact(comment.id, reactions.viewerReaction === -1 ? null : -1);
	};

	return (
		<div className="border rounded p-2 mb-2">
			<div className="d-flex">
				<Link
					to={`/u/${author.handle}`}
					className="me-2 text-decoration-none"
				>
					<UserAvatar
						src={author.avatar_url}
						alt={author.handle}
						size={32}
					/>
				</Link>

				<div className="flex-grow-1">
					<div className="d-flex justify-content-between align-items-start">
						<div>
							<Link
								to={`/u/${author.handle}`}
								className="fw-semibold text-decoration-none text-reset"
							>
								{author.display_name ?? author.handle}
							</Link>
							<span className="text-muted ms-1">
								@{author.handle}
							</span>

							{medals.length > 0 && (
								<span className="ms-2 d-inline-flex gap-1">
									{groupMedals(medals).map(
										({ medal, count }) => (
											<MedalIcon
												key={medal.id}
												medal={medal}
												count={count}
												size={16}
											/>
										)
									)}
								</span>
							)}

							<div className="text-muted small">
								{createdAt.toLocaleString()}
							</div>
						</div>

						<div className="d-flex gap-2">
							<div className="d-flex align-items-center gap-1">
								<Button
									variant="link"
									size="sm"
									className={`p-0 ${
										reactions.viewerReaction === 1
											? "text-primary"
											: ""
									}`}
									onClick={handleLike}
								>
									<FiThumbsUp size={16} />
								</Button>

								<span className="small">
									{reactions.likeCount}
								</span>

								<Button
									variant="link"
									size="sm"
									className={`p-0 ${
										reactions.viewerReaction === -1
											? "text-danger"
											: ""
									}`}
									onClick={handleDislike}
								>
									<FiThumbsDown size={16} />
								</Button>
							</div>

							{canDelete && (
								<Button
									variant="link"
									size="sm"
									className="p-0 text-danger"
									onClick={onDelete}
									aria-label="Delete comment"
								>
									<FiTrash2 size={16} />
								</Button>
							)}
						</div>
					</div>

					<p className="mt-2 mb-0" style={{ whiteSpace: "pre-wrap" }}>
						{comment.body}
					</p>
				</div>
			</div>
		</div>
	);
};

export default Comment;
