import type { User } from "@supabase/supabase-js";
import { supabase } from "../../utils/supabaseClient";
import type { Profile } from "../../types";
import { createProfileForUser, getProfileById } from "../profiles/profiles.api";

export interface SignUpParams {
	email: string;
	password: string;
	handle: string;
	displayName?: string;
}

export interface SignInParams {
	email: string;
	password: string;
}

export interface AuthResult {
	user: User;
	profile: Profile;
}

// Sign up with email/password and create a profile row.
export async function signUpWithEmail(
	params: SignUpParams
): Promise<AuthResult> {
	const { email, password, handle, displayName } = params;

	// 1. Create auth user
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) throw error;

	const user = data.user;
	if (!user) {
		throw new Error(
			"No user returned from sign up. Check email confirmation settings."
		);
	}

	const profile = await createProfileForUser({
		id: user.id,
		handle,
		displayName: displayName ?? null,
	});

	return { user, profile };
}

// Sign in with email/password and return auth user + profile.
export async function signInWithEmail(
	params: SignInParams
): Promise<AuthResult> {
	const { email, password } = params;

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw error;
	const user = data.user;
	if (!user) throw new Error("No user returned from sign in.");

	const profile = await getProfileById(user.id);
	if (!profile) throw new Error("Profile not found for user.");

	return { user, profile };
}

// Sign out the current user.
export async function signOut(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

// Get the current authenticated Supabase user (or null).
export async function getCurrentUser(): Promise<User | null> {
	const { data, error } = await supabase.auth.getUser();
	if (error) throw error;
	return data.user ?? null;
}

// Get current user + profile, or null if not logged in.
export async function getCurrentUserWithProfile(): Promise<{
	user: User;
	profile: Profile;
} | null> {
	const { data, error } = await supabase.auth.getUser();
	if (error) throw error;

	const user = data.user;
	if (!user) return null;

	const profile = await getProfileById(user.id);
	if (!profile) throw new Error("Profile not found for current user.");

	return { user, profile };
}
