import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SignInParams, SignUpParams, AuthResult } from "./auth.api";
import { signInWithEmail, signUpWithEmail, signOut } from "./auth.api";

export function useSignUpMutation() {
	const queryClient = useQueryClient();

	return useMutation<AuthResult, unknown, SignUpParams>({
		mutationFn: signUpWithEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
		},
	});
}

export function useSignInMutation() {
	const queryClient = useQueryClient();

	return useMutation<AuthResult, unknown, SignInParams>({
		mutationFn: signInWithEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
		},
	});
}

export function useSignOutMutation() {
	const queryClient = useQueryClient();

	return useMutation<void, unknown, void>({
		mutationFn: () => signOut(),
		onSuccess: () => {
			queryClient.setQueryData(["currentUser"], {
				user: null,
				profile: null,
			});
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });
		},
	});
}
