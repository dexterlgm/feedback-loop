import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./assets/scss/App.scss";
import { AppNavbar } from "./components/AppNavbar";
import ExplorePage from "./pages/ExplorePage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AppFooter from "./components/AppFooter";
import PostPage from "./pages/PostPage";

function App() {
	return (
		<BrowserRouter>
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
