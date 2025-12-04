import { OverlayTrigger, Tooltip, Badge } from "react-bootstrap";
import type { Medal } from "../../types";

interface MedalIconProps {
	medal: Medal;
	count?: number;
	size?: number;
	className?: string;
}

export const MedalIcon = ({
	medal,
	count = 1,
	size = 40,
	className,
}: MedalIconProps) => {
	const icon = medal.icon ?? "🏅";
	const hasMultiple = count > 1;

	return (
		<OverlayTrigger
			placement="top"
			overlay={
				<Tooltip id={`medal-${medal.id}`}>
					<div className="fw-bold">{medal.name}</div>
					{medal.description && (
						<div className="small">{medal.description}</div>
					)}
				</Tooltip>
			}
		>
			<div
				className={
					"position-relative d-inline-flex align-items-center justify-content-center rounded-circle bg-light border " +
					(className ?? "")
				}
				style={{
					width: size,
					height: size,
					fontSize: size * 0.5,
					cursor: "default",
				}}
			>
				<span>{icon}</span>

				{hasMultiple && (
					<Badge
						bg="dark"
						pill
						className="position-absolute"
						style={{
							bottom: -2,
							right: -2,
							fontSize: size * 0.3,
							padding: "0.1rem 0.3rem",
						}}
					>
						x{count}
					</Badge>
				)}
			</div>
		</OverlayTrigger>
	);
};
