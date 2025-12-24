import { Modal, Button, Row, Col } from "react-bootstrap";
import type { Mode } from "./AuthModal";

interface WelcomeModalProps {
	show: boolean;
	onClose: () => void;
	onOpenAuth: (mode: Mode) => void;
}

const WelcomeModal = ({ show, onClose, onOpenAuth }: WelcomeModalProps) => {
	const openLogin = () => {
		onClose();
		onOpenAuth("login");
	};

	const openSignup = () => {
		onClose();
		onOpenAuth("signup");
	};

	const browse = () => {
		onClose();
	};

	return (
		<Modal show={show} onHide={onClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Welcome!</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Row className="g-3">
					<p>
						Create an account to join the conversation, or browse
						posts without signing up.
					</p>
					<Col xs={12} md={6}>
						<div className="border rounded p-3 h-100 d-flex flex-column">
							<h5 className="mb-2">Log in</h5>
							<div
								className="text-muted mb-3"
								style={{ fontSize: 14 }}
							>
								or create an account
							</div>

							<div className="mt-auto d-flex gap-2">
								<Button variant="primary" onClick={openLogin}>
									Log in
								</Button>
								<Button
									variant="outline-primary"
									onClick={openSignup}
								>
									Create account
								</Button>
							</div>
						</div>
					</Col>

					<Col xs={12} md={6}>
						<div className="border rounded p-3 h-100 d-flex flex-column">
							<h5 className="mb-2">Start browsing</h5>
							<div
								className="text-muted mb-3"
								style={{ fontSize: 14 }}
							>
								Explore posts right away, log in later.
							</div>

							<div className="mt-auto">
								<Button variant="success" onClick={browse}>
									Start browsing
								</Button>
							</div>
						</div>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	);
};

export default WelcomeModal;
