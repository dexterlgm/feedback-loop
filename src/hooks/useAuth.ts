import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types";
import { supabase } from "../utils/supabaseClient";
import { getCurrentUserWithProfile } from "../features/auth/auth.api";

interface AuthState {
	user: User | null;
	profile: Profile | null;
	loading: boolean;
}

// Fetch current user + profile,
export function useAuth(): AuthState {
	const queryClient = useQueryClient();

	// Subscribe to auth changes once and invalidate the query
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(() => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [queryClient]);

	const { data, isLoading } = useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUserWithProfile,
		// On first load return null if not logged in
		staleTime: 1000 * 60,
	});

	return {
		user: data?.user ?? null,
		profile: data?.profile ?? null,
		loading: isLoading,
	};
}
