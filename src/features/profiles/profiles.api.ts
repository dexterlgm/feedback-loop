import { supabase } from "../../utils/supabaseClient";
import type { Profile, Medal } from "../../types";

export interface CreateProfileParams {
	id: string;
	handle: string;
	displayName?: string | null;
}

export interface UpdateProfileParams {
	id: string;
	handle?: string;
	displayName?: string | null;
	bio?: string | null;
	avatarUrl?: string | null;
	socialLinks?: Record<string, string> | null;
}

// Create a profile row when a new user signs up
export async function createProfileForUser(
	params: CreateProfileParams
): Promise<Profile> {
	const { id, handle, displayName } = params;

	const { data, error } = await supabase
		.from("profiles")
		.insert({
			id,
			handle,
			display_name: displayName ?? null,
		})
		.select("*")
		.single<Profile>();

	if (error || !data) {
		throw error ?? new Error("Failed to create profile");
	}

	return data as Profile;
}

// Get a profile by user id
export async function getProfileById(id: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", id)
		.maybeSingle<Profile>();

	if (error) throw error;
	return data ? (data as Profile) : null;
}

// Get a profile by handle
export async function getProfileByHandle(
	handle: string
): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("handle", handle)
		.maybeSingle<Profile>();

	if (error) throw error;
	return data ? (data as Profile) : null;
}

// Update profile for the given user id
export async function updateProfile(
	params: UpdateProfileParams
): Promise<Profile> {
	const { id, handle, displayName, bio, avatarUrl, socialLinks } = params;

	const updateData: Partial<{
		handle: string;
		display_name: string | null;
		bio: string | null;
		avatar_url: string | null;
		social_links: Record<string, string> | null;
	}> = {};

	if (handle !== undefined) updateData.handle = handle;
	if (displayName !== undefined) updateData.display_name = displayName;
	if (bio !== undefined) updateData.bio = bio;
	if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
	if (socialLinks !== undefined) updateData.social_links = socialLinks;

	const { data, error } = await supabase
		.from("profiles")
		.update(updateData)
		.eq("id", id)
		.select("*")
		.single<Profile>();

	if (error || !data) {
		throw error ?? new Error("Failed to update profile");
	}

	return data as Profile;
}

// Search profiles by handle prefix
export async function searchProfilesByHandlePrefix(
	query: string,
	limit = 10
): Promise<Profile[]> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.ilike("handle", `${query}%`)
		.limit(limit);

	if (error) throw error;
	return (data ?? []) as Profile[];
}

// Get all medals (with duplicates) for a given user.
export async function getMedalsForUser(userId: string): Promise<Medal[]> {
	const { data, error } = await supabase
		.from("user_medals")
		.select(
			`
      user_id,
      medal:medal_id (
        id,
        code,
        name,
        description,
        icon,
        threshold
      )
    `
		)
		.eq("user_id", userId);

	if (error) throw error;
	if (!data) return [];

	const medals: Medal[] = [];

	for (const row of data) {
		const raw = row.medal;

		if (!raw) continue;

		const medal = Array.isArray(raw) ? raw[0] : raw;
		if (!medal) continue;

		medals.push(medal as Medal);
	}

	return medals;
}
