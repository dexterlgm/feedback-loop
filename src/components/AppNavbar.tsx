import { useState } from "react";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn, FiBell, FiPlus } from "react-icons/fi";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../hooks/useAuth";
import { useSignOutMutation } from "../features/auth/auth.queries";
import { UserAvatar } from "../components/common/UserAvatar";

export function AppNavbar() {
	const [showAuthModal, setShowAuthModal] = useState(false);
	const { user, profile } = useAuth();
	const signOutMutation = useSignOutMutation();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await signOutMutation.mutateAsync();
			navigate("/");
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<>
			<Navbar expand="lg" className="mb-3">
				<Container>
					<Navbar.Brand as={Link} to="/">
						FB-Loop
					</Navbar.Brand>

					<Nav className="ms-auto d-flex flex-row align-items-center gap-2">
						{!user && (
							<Button
								variant="outline-primary"
								onClick={() => setShowAuthModal(true)}
							>
								<FiLogIn className="me-2" />
								Log in
							</Button>
						)}

						{user && (
							<>
								<Button
									variant="primary"
									className="d-flex align-items-center p-2"
									onClick={() => navigate("/posts/new")}
								>
									<FiPlus className="mx-1" />
								</Button>

								<Button
									variant="link"
									className="p-2 border-0"
									// onClick={...}
								>
									<FiBell size={28} />
								</Button>

								<Dropdown align="end">
									<Dropdown.Toggle
										as={Button}
										variant="link"
										className="p-0 border-0"
									>
										<UserAvatar
											src={profile?.avatar_url}
											alt={profile?.handle ?? "Profile"}
											size={32}
										/>
									</Dropdown.Toggle>

									<Dropdown.Menu>
										<Dropdown.Item
											as={Link}
											to={
												profile
													? `/u/${profile.handle}`
													: "#"
											}
										>
											Profile
										</Dropdown.Item>
										<Dropdown.Divider />
										<Dropdown.Item onClick={handleLogout}>
											Log out
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</>
						)}
					</Nav>
				</Container>
			</Navbar>

			<AuthModal
				show={showAuthModal}
				onHide={() => setShowAuthModal(false)}
			/>
		</>
	);
}
