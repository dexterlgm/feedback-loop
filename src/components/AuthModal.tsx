import { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
	useSignInMutation,
	useSignUpMutation,
} from "../features/auth/auth.queries";
import { useUpdateProfileMutation } from "../features/profiles/profiles.queries";

type Mode = "login" | "register";

interface AuthModalProps {
	show: boolean;
	onHide: () => void;
}

interface LoginFormInputs {
	email: string;
	password: string;
}

interface RegisterFormInputs {
	email: string;
	password: string;
	handle: string;
	displayName?: string;
}

export function AuthModal({ show, onHide }: AuthModalProps) {
	const [mode, setMode] = useState<Mode>("login");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const {
		register: registerLogin,
		handleSubmit: handleSubmitLogin,
		reset: resetLogin,
	} = useForm<LoginFormInputs>();

	const {
		register: registerRegister,
		handleSubmit: handleSubmitRegister,
		reset: resetRegister,
		formState: { errors: registerErrors },
	} = useForm<RegisterFormInputs>();

	const signInMutation = useSignInMutation();
	const signUpMutation = useSignUpMutation();
	const updateProfileMutation = useUpdateProfileMutation();

	function handleClose() {
		setErrorMessage(null);
		resetLogin();
		resetRegister();
		setMode("login");
		onHide();
	}

	async function onLoginSubmit(data: LoginFormInputs) {
		try {
			setErrorMessage(null);
			await signInMutation.mutateAsync({
				email: data.email,
				password: data.password,
			});
			handleClose();
		} catch (err: any) {
			console.error(err);
			setErrorMessage(err.message ?? "Failed to sign in");
		}
	}

	async function onRegisterSubmit(data: RegisterFormInputs) {
		try {
			setErrorMessage(null);

			await signUpMutation.mutateAsync({
				email: data.email,
				password: data.password,
				handle: data.handle.toLowerCase(),
				displayName: data.displayName,
			});

			handleClose();
		} catch (err: any) {
			console.error(err);
			const msg = err?.message ?? "Failed to create account";
			if (
				msg.toLowerCase().includes("duplicate key") ||
				msg.toLowerCase().includes("unique constraint")
			) {
				setErrorMessage("That handle is already taken.");
			} else {
				setErrorMessage(msg);
			}
		}
	}

	const isLoading =
		signInMutation.isPending ||
		signUpMutation.isPending ||
		updateProfileMutation.isPending;

	return (
		<Modal show={show} onHide={handleClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>
					{mode === "login" ? "Log in" : "Create account"}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{errorMessage && (
					<Alert variant="danger" className="mb-3">
						{errorMessage}
					</Alert>
				)}

				{mode === "login" ? (
					<Form onSubmit={handleSubmitLogin(onLoginSubmit)}>
						<Form.Group className="mb-3" controlId="loginEmail">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								{...registerLogin("email", { required: true })}
								placeholder="you@example.com"
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="loginPassword">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								{...registerLogin("password", {
									required: true,
								})}
								placeholder="••••••••"
							/>
						</Form.Group>

						<Button
							type="submit"
							variant="primary"
							className="w-100"
							disabled={isLoading}
						>
							{isLoading ? <Spinner size="sm" /> : "Log in"}
						</Button>
					</Form>
				) : (
					<Form onSubmit={handleSubmitRegister(onRegisterSubmit)}>
						<Form.Group className="mb-3" controlId="registerEmail">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								{...registerRegister("email", {
									required: true,
								})}
								placeholder="you@example.com"
							/>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="registerPassword"
						>
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								{...registerRegister("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message:
											"Password must be at least 8 characters",
									},
									validate: {
										noSpaces: (value) =>
											!/\s/.test(value) ||
											"Password cannot contain spaces",
									},
								})}
								isInvalid={!!registerErrors.password}
								placeholder="••••••••"
							/>
							<Form.Control.Feedback type="invalid">
								{registerErrors.password?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="mb-3" controlId="registerHandle">
							<Form.Label>Handle</Form.Label>
							<Form.Control
								type="text"
								{...registerRegister("handle", {
									required: "Handle is required",
									minLength: {
										value: 3,
										message:
											"Handle must be at least 3 characters",
									},
									pattern: {
										value: /^[a-z0-9_]+$/,
										message:
											"Handle can only contain a–z, 0–9, and underscores",
									},
								})}
								onChange={(e) => {
									e.target.value =
										e.target.value.toLowerCase();
								}}
								isInvalid={!!registerErrors.password}
								placeholder="coolartist123"
							/>
							<Form.Control.Feedback type="invalid">
								{registerErrors.handle?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="registerDisplayName"
						>
							<Form.Label>Display name</Form.Label>
							<Form.Control
								type="text"
								{...registerRegister("displayName", {
									required: true,
								})}
								placeholder="Can be changed later"
							/>
						</Form.Group>

						<Button
							type="submit"
							variant="primary"
							className="w-100"
							disabled={isLoading}
						>
							{isLoading ? (
								<Spinner size="sm" />
							) : (
								"Create account"
							)}
						</Button>
					</Form>
				)}

				<div className="mt-3 text-center">
					{mode === "login" ? (
						<small>
							Don&apos;t have an account?{" "}
							<button
								type="button"
								className="btn btn-link p-0 align-baseline"
								onClick={() => {
									setErrorMessage(null);
									setMode("register");
								}}
							>
								Register
							</button>
						</small>
					) : (
						<small>
							Already have an account?{" "}
							<button
								type="button"
								className="btn btn-link p-0 align-baseline"
								onClick={() => {
									setErrorMessage(null);
									setMode("login");
								}}
							>
								Log in
							</button>
						</small>
					)}
				</div>
			</Modal.Body>
		</Modal>
	);
}
