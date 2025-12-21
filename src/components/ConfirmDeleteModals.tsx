import { Modal, Button } from "react-bootstrap";

export interface ConfirmDeleteModalProps {
	show: boolean;
	title: string;
	body: string;
	confirmText?: string;
	cancelText?: string;
	isBusy?: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
	const {
		show,
		title,
		body,
		confirmText = "Delete",
		cancelText = "Cancel",
		isBusy = false,
		onCancel,
		onConfirm,
	} = props;

	return (
		<Modal show={show} onHide={onCancel} centered>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>

			<Modal.Body>{body}</Modal.Body>

			<Modal.Footer>
				<Button
					variant="secondary"
					onClick={onCancel}
					disabled={isBusy}
				>
					{cancelText}
				</Button>
				<Button variant="danger" onClick={onConfirm} disabled={isBusy}>
					{confirmText}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmDeleteModal;
