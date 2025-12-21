import { useMemo, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import {
	useSignInMutation,
	useSignUpMutation,
} from "../features/auth/auth.queries";

type Mode = "login" | "signup";

type LoginValues = {
	email: string;
	password: string;
};

type SignupValues = {
	email: string;
	password: string;
	handle: string;
	displayName: string;
};

const errorMessageFromUnknown = (err: unknown): string => {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	if (typeof err === "object" && err !== null) {
		const maybe = err as { message?: unknown };
		if (typeof maybe.message === "string") return maybe.message;
	}
	return "Something went wrong";
};

const containsInsensitive = (haystack: string, needle: string): boolean => {
	return haystack.toLowerCase().includes(needle.toLowerCase());
};

interface AuthModalProps {
	show: boolean;
	onHide: () => void;
}

const AuthModal = ({ show, onHide }: AuthModalProps) => {
	const [mode, setMode] = useState<Mode>("login");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { user } = useAuth();

	const signInMutation = useSignInMutation();
	const signUpMutation = useSignUpMutation();

	const {
		register: registerLogin,
		handleSubmit: handleSubmitLogin,
		formState: { errors: loginErrors },
		reset: resetLogin,
	} = useForm<LoginValues>({
		defaultValues: { email: "", password: "" },
	});

	const {
		register: registerSignup,
		handleSubmit: handleSubmitSignup,
		formState: { errors: signupErrors },
		reset: resetSignup,
	} = useForm<SignupValues>({
		defaultValues: { email: "", password: "", handle: "", displayName: "" },
	});

	const isBusy = signInMutation.isPending || signUpMutation.isPending;

	const title = useMemo(() => {
		return mode === "login" ? "Log in" : "Create account";
	}, [mode]);

	const closeAndReset = (): void => {
		setErrorMessage(null);
		resetLogin();
		resetSignup();
		setMode("login");
		onHide();
	};

	const onSubmitLogin = async (values: LoginValues): Promise<void> => {
		try {
			setErrorMessage(null);
			await signInMutation.mutateAsync(values);
			closeAndReset();
		} catch (err: unknown) {
			setErrorMessage(errorMessageFromUnknown(err));
		}
	};

	const onSubmitSignup = async (values: SignupValues): Promise<void> => {
		try {
			setErrorMessage(null);

			const handle = values.handle.trim();
			const password = values.password;

			if (handle.includes(" ")) {
				setErrorMessage("Handle must not contain spaces.");
				return;
			}
			if (password.includes(" ")) {
				setErrorMessage("Password must not contain spaces.");
				return;
			}

			await signUpMutation.mutateAsync({
				email: values.email,
				password: values.password,
				handle: values.handle,
				displayName: values.displayName,
			});

			closeAndReset();
		} catch (err: unknown) {
			const msg = errorMessageFromUnknown(err);

			if (containsInsensitive(msg, "already registered")) {
				setErrorMessage("That email is already registered.");
				return;
			}
			if (
				containsInsensitive(msg, "handle") &&
				containsInsensitive(msg, "duplicate")
			) {
				setErrorMessage("That handle is already taken.");
				return;
			}

			setErrorMessage(msg);
		}
	};

	if (user) return null;

	return (
		<Modal show={show} onHide={closeAndReset} centered>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

				{mode === "login" ? (
					<Form onSubmit={handleSubmitLogin(onSubmitLogin)}>
						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								autoComplete="email"
								disabled={isBusy}
								{...registerLogin("email", {
									required: "Email is required",
								})}
								isInvalid={!!loginErrors.email}
							/>
							<Form.Control.Feedback type="invalid">
								{loginErrors.email?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								autoComplete="current-password"
								disabled={isBusy}
								{...registerLogin("password", {
									required: "Password is required",
								})}
								isInvalid={!!loginErrors.password}
							/>
							<Form.Control.Feedback type="invalid">
								{loginErrors.password?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<div className="d-grid gap-2">
							<Button type="submit" disabled={isBusy}>
								{isBusy ? "Loading…" : "Log in"}
							</Button>

							<Button
								type="button"
								variant="link"
								disabled={isBusy}
								onClick={() => {
									setErrorMessage(null);
									setMode("signup");
								}}
							>
								Don’t have an account? Sign up
							</Button>
						</div>
					</Form>
				) : (
					<Form onSubmit={handleSubmitSignup(onSubmitSignup)}>
						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								autoComplete="email"
								disabled={isBusy}
								{...registerSignup("email", {
									required: "Email is required",
								})}
								isInvalid={!!signupErrors.email}
							/>
							<Form.Control.Feedback type="invalid">
								{signupErrors.email?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Handle</Form.Label>
							<Form.Control
								disabled={isBusy}
								{...registerSignup("handle", {
									required: "Handle is required",
									minLength: {
										value: 3,
										message:
											"Handle must be at least 3 characters",
									},
									maxLength: {
										value: 16,
										message:
											"Handle must be at most 16 characters",
									},
									pattern: {
										value: /^[a-z0-9_]+$/,
										message:
											"Only a-z, 0-9, and underscores",
									},
									validate: (v) =>
										v.includes(" ")
											? "No spaces allowed"
											: true,
								})}
								isInvalid={!!signupErrors.handle}
							/>
							<Form.Control.Feedback type="invalid">
								{signupErrors.handle?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Display name</Form.Label>
							<Form.Control
								disabled={isBusy}
								{...registerSignup("displayName", {
									required: "Display name is required",
									maxLength: {
										value: 20,
										message:
											"Username must be at most 20 characters",
									},
									minLength: {
										value: 3,
										message:
											"Username must be at least 3 characters",
									},
								})}
								isInvalid={!!signupErrors.displayName}
							/>
							<Form.Control.Feedback type="invalid">
								{signupErrors.displayName?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								autoComplete="new-password"
								disabled={isBusy}
								{...registerSignup("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message:
											"Password must be at least 8 characters",
									},
									validate: (v) =>
										v.includes(" ")
											? "No spaces allowed"
											: true,
								})}
								isInvalid={!!signupErrors.password}
							/>
							<Form.Control.Feedback type="invalid">
								{signupErrors.password?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<div className="d-grid gap-2">
							<Button type="submit" disabled={isBusy}>
								{isBusy ? "Loading…" : "Create account"}
							</Button>

							<Button
								type="button"
								variant="link"
								disabled={isBusy}
								onClick={() => {
									setErrorMessage(null);
									setMode("login");
								}}
							>
								Already have an account? Log in
							</Button>
						</div>
					</Form>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default AuthModal;
