import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./assets/scss/App.scss";
import { AppNavbar } from "./components/AppNavbar";
import ExplorePage from "./pages/ExplorePage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
	return (
		<BrowserRouter>
			<AppNavbar />
			<Routes>
				<Route path="/" element={<ExplorePage />} />
				<Route path="/posts/new" element={<CreatePostPage />} />
				<Route path="/u/:handle" element={<ProfilePage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
