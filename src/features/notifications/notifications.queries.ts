import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../utils/supabaseClient";
import type { NotificationWithMeta } from "./notifications.api";
import {
	fetchMyNotifications,
	markAllMyNotificationsRead,
	clearMyNotifications,
} from "./notifications.api";

export function useMyNotifications(limit = 30, offset = 0) {
	return useQuery<NotificationWithMeta[]>({
		queryKey: ["myNotifications", limit, offset],
		queryFn: () => fetchMyNotifications(limit, offset),
	});
}

export function useUnreadCount() {
	return useQuery<number>({
		queryKey: ["myNotificationsUnreadCount"],
		queryFn: async () => {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();
			if (userError) throw userError;
			if (!user) return 0;

			const { count, error } = await supabase
				.from("notifications")
				.select("id", { count: "exact", head: true })
				.eq("user_id", user.id)
				.eq("is_read", false);

			if (error) throw error;
			return count ?? 0;
		},
	});
}

export function useNotificationsRealtime() {
	const queryClient = useQueryClient();

	useEffect(() => {
		let alive = true;

		async function setup(): Promise<() => void> {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) return () => {};

			const channel = supabase
				.channel(`notifications:${user.id}`)
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "notifications",
						filter: `user_id=eq.${user.id}`,
					},
					() => {
						queryClient.invalidateQueries({
							queryKey: ["myNotifications"],
						});
						queryClient.invalidateQueries({
							queryKey: ["myNotificationsUnreadCount"],
						});
					}
				)
				.subscribe();

			return () => {
				if (!alive) return;
				supabase.removeChannel(channel);
			};
		}

		let cleanup: (() => void) | null = null;

		setup()
			.then((fn) => {
				cleanup = fn;
			})
			.catch(() => {
				cleanup = null;
			});

		return () => {
			alive = false;
			if (cleanup) cleanup();
		};
	}, [queryClient]);
}

export function useMarkAllRead() {
	const queryClient = useQueryClient();

	return {
		markAll: async (): Promise<void> => {
			await markAllMyNotificationsRead();
			await queryClient.invalidateQueries({
				queryKey: ["myNotifications"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["myNotificationsUnreadCount"],
			});
		},
	};
}

export function useClearNotifications() {
	const queryClient = useQueryClient();

	return {
		clearAll: async (): Promise<void> => {
			await clearMyNotifications();
			await queryClient.invalidateQueries({
				queryKey: ["myNotifications"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["myNotificationsUnreadCount"],
			});
		},
	};
}
