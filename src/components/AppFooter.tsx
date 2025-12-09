import { Container } from "react-bootstrap";

const AppFooter = () => {
	return (
		<Container
			fluid
			className="w-auto p-0 m-0 py-1 d-flex justify-content-center align-items-center bg-secondary mx-0"
		>
			<p className="m-0 p-2 text-center">© Feedback-Loop</p>
		</Container>
	);
};

export default AppFooter;
