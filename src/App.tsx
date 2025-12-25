import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./assets/scss/App.scss";
import { AppNavbar } from "./components/AppNavbar";
import ExplorePage from "./pages/ExplorePage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AppFooter from "./components/AppFooter";
import PostPage from "./pages/PostPage";
import { useNotificationsRealtime } from "./features/notifications/notifications.queries";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from "react";
import WelcomeModal from "./components/WelcomeModal";
import AuthModal, { type Mode } from "./components/AuthModal";
import { checkWelcomeModal, setWelcomeModalShown } from "./utils/welcomeModal";

const AUTH_GRACE_MS = 10 * 1000;

function App() {
	useNotificationsRealtime();

	const { user } = useAuth();

	const [showWelcome, setShowWelcome] = useState(false);
	const [showAuth, setShowAuth] = useState(false);
	const [authInitialMode, setAuthInitialMode] = useState<Mode>("login");

	useEffect(() => {
		if (user) {
			setShowWelcome(false);
			return;
		}

		const timer = window.setTimeout(() => {
			if (checkWelcomeModal()) {
				setShowWelcome(true);
				setWelcomeModalShown();
			}
		}, AUTH_GRACE_MS);

		return () => {
			window.clearTimeout(timer);
		};
	}, [user]);

	const openAuth = (mode: Mode) => {
		setAuthInitialMode(mode);
		setShowAuth(true);
	};

	return (
		<BrowserRouter>
			<WelcomeModal
				show={!user && showWelcome}
				onClose={() => setShowWelcome(false)}
				onOpenAuth={openAuth}
			/>

			<AuthModal
				show={!user && showAuth}
				onHide={() => setShowAuth(false)}
				initialMode={authInitialMode}
			/>

			<div className="d-flex flex-column min-vh-100">
				<main className="flex-grow-1">
					<AppNavbar />
					<Routes>
						<Route path="/" element={<ExplorePage />} />
						<Route path="/posts/new" element={<CreatePostPage />} />
						<Route path="/u/:handle" element={<ProfilePage />} />
						<Route
							path="/u/:handle/edit"
							element={<EditProfilePage />}
						/>
						<Route path="/posts/:id" element={<PostPage />} />
					</Routes>
				</main>
				<AppFooter />
			</div>
		</BrowserRouter>
	);
}

export default App;
