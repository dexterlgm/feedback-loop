import { useMemo, useState } from "react";
import { Button, Dropdown, Spinner, Badge } from "react-bootstrap";
import { FiBell } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import {
	useMyNotifications,
	useUnreadCount,
	useMarkAllRead,
	useClearNotifications,
} from "../features/notifications/notifications.queries";
import type { NotificationWithMeta } from "../features/notifications/notifications.api";

const formatNotificationText = (n: NotificationWithMeta): string => {
	const actorName = n.actor?.display_name ?? n.actor?.handle ?? "Someone";

	if (n.notification.type === "comment_on_post") {
		const title = n.post?.title ?? "your post";
		return `${actorName} commented on ${title}`;
	}

	return "You have a new notification";
};

const NotificationsBell = () => {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const { data: unreadCount = 0 } = useUnreadCount();
	const { data, isLoading } = useMyNotifications(20, 0);
	const { markAll } = useMarkAllRead();
	const { clearAll } = useClearNotifications();

	const notifications = useMemo<NotificationWithMeta[]>(
		() => data ?? [],
		[data]
	);

	const handleToggle = async (nextOpen: boolean) => {
		setOpen(nextOpen);

		if (nextOpen && unreadCount > 0) {
			try {
				await markAll();
				await queryClient.invalidateQueries({
					queryKey: ["myNotifications"],
				});
				await queryClient.invalidateQueries({
					queryKey: ["myNotificationsUnreadCount"],
				});
			} catch {
				// ignore
			}
		}
	};

	const handleClear = async () => {
		try {
			await clearAll();
		} finally {
			setOpen(false);
		}
	};

	return (
		<Dropdown
			show={open}
			onToggle={(v) => void handleToggle(Boolean(v))}
			align="end"
		>
			<Dropdown.Toggle
				as={Button}
				variant="link"
				className="p-2 border-0 no-caret notif-toggle"
			>
				<span className="notif-icon-wrapper">
					<FiBell size={28} />

					{unreadCount > 0 && (
						<Badge bg="danger" pill className="notif-badge">
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</span>
			</Dropdown.Toggle>

			<Dropdown.Menu
				style={{ width: 360, maxWidth: "90vw" }}
				className="position-absolute notif-dropdown"
			>
				<div className="px-3 py-2 d-flex align-items-center justify-content-between">
					<strong>Notifications</strong>

					<div className="d-flex align-items-center gap-2">
						{unreadCount > 0 && (
							<span
								className="text-muted"
								style={{ fontSize: 12 }}
							>
								{unreadCount} new
							</span>
						)}

						<Button
							variant="outline-secondary"
							size="sm"
							onClick={() => void handleClear()}
						>
							Clear
						</Button>
					</div>
				</div>

				<Dropdown.Divider />

				{isLoading && (
					<div className="px-3 py-3 text-center">
						<Spinner animation="border" size="sm" />
					</div>
				)}

				{!isLoading && notifications.length === 0 && (
					<div className="px-3 py-3 text-muted">
						No notifications yet.
					</div>
				)}

				{notifications.map((n) => (
					<Dropdown.Item
						key={n.notification.id}
						as="a"
						href={
							n.notification.post_id
								? `/posts/${n.notification.post_id}`
								: "#"
						}
						className="py-2"
					>
						<div className="d-flex gap-2">
							<div className="flex-grow-1">
								<div style={{ fontSize: 14 }}>
									{formatNotificationText(n)}
								</div>
								<div
									className="text-muted"
									style={{ fontSize: 12 }}
								>
									{new Date(
										n.notification.created_at
									).toLocaleString()}
								</div>
							</div>

							{!n.notification.is_read && (
								<span
									className="align-self-center"
									style={{
										width: 8,
										height: 8,
										borderRadius: 999,
										background: "var(--bs-danger)",
									}}
								/>
							)}
						</div>
					</Dropdown.Item>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default NotificationsBell;
