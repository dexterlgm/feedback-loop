import { supabase } from "../../utils/supabaseClient";
import type { Profile, Medal } from "../../types";

export interface CreateProfileParams {
	id: string;
	handle: string;
	displayName?: string | null;
}

// Create a profile row when a new user signs up.
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
		.single();

	if (error) throw error;
	return data as Profile;
}

// Get a profile by user id
export async function getProfileById(id: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (error) throw error;
	return (data as Profile) ?? null;
}

// Get a profile by handle
export async function getProfileByHandle(
	handle: string
): Promise<Profile | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("handle", handle)
		.maybeSingle();

	if (error) throw error;
	return (data as Profile) ?? null;
}

export interface UpdateProfileParams {
	id: string;
	handle?: string;
	displayName?: string | null;
	bio?: string | null;
	avatarUrl?: string | null;
	socialLinks?: string[] | null;
}

// Update profile for the given user id
export async function updateProfile(
	params: UpdateProfileParams
): Promise<Profile> {
	const { id, handle, displayName, bio, avatarUrl, socialLinks } = params;

	const updateData: Record<string, unknown> = {};
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
		.single();

	if (error) throw error;
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

	return (data ?? []).map((row: any) => row.medal as Medal);
}
