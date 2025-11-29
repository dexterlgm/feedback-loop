import { Image } from "react-bootstrap";
import defaultAvatar from "../../assets/default-avatar.png";

interface UserAvatarProps {
	src?: string | null;
	alt?: string;
	size?: number;
	className?: string;
}

export function UserAvatar({
	src,
	alt = "User avatar",
	size = 36,
	className,
}: UserAvatarProps) {
	const finalSrc = src && src.trim() !== "" ? src : (defaultAvatar as string);

	return (
		<Image
			src={finalSrc}
			alt={alt}
			roundedCircle
			width={size}
			height={size}
			className={className}
			style={{ objectFit: "cover" }}
		/>
	);
}
