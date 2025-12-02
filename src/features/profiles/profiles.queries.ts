// src/features/profiles/profiles.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../../types";
import {
	getProfileByHandle,
	getProfileById,
	updateProfile,
	type UpdateProfileParams,
} from "./profiles.api";

export function useProfileByHandle(handle: string | undefined) {
	return useQuery<Profile | null>({
		queryKey: ["profileByHandle", handle],
		enabled: !!handle,
		queryFn: () => getProfileByHandle(handle!),
	});
}

export function useProfileById(id: string | undefined) {
	return useQuery<Profile | null>({
		queryKey: ["profileById", id],
		enabled: !!id,
		queryFn: () => getProfileById(id!),
	});
}

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();

	return useMutation<Profile, unknown, UpdateProfileParams>({
		mutationFn: updateProfile,
		onSuccess: (updatedProfile) => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			queryClient.invalidateQueries({
				queryKey: ["profileById", updatedProfile.id],
			});
			queryClient.invalidateQueries({
				queryKey: ["profileByHandle", updatedProfile.handle],
			});
		},
	});
}
