import { useEffect, useMemo, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { FiFilter } from "react-icons/fi";
import { usePostsFeed } from "../features/posts/posts.queries";
import type { PostFilter, Tag } from "../types";
import PostCard from "../components/PostCard";
import ExploreFiltersSidebar from "../components/ExploreFiltersSidebar";
import {
	loadSavedSort,
	loadSavedTags,
	saveSort,
	saveTags,
	type SortValue,
} from "../utils/exploreFiltersStorage";
import { useTags } from "../features/tags/tags.queries";

const PAGE_SIZE = 12;

const ExplorePage = () => {
	const [showFilters, setShowFilters] = useState(false);

	const [selectedTags, setSelectedTags] = useState<string[]>(() =>
		loadSavedTags()
	);
	const [sort, setSort] = useState<SortValue>(() => loadSavedSort());
	const [searchQuery, setSearchQuery] = useState("");

	const [limit, setLimit] = useState(PAGE_SIZE);

	const { data: tagsData } = useTags();
	const allTags: Tag[] = tagsData ?? [];

	useEffect(() => {
		document.title = `Feedback Loop - Explore`;
	});

	useEffect(() => {
		saveTags(selectedTags);
	}, [selectedTags]);

	useEffect(() => {
		saveSort(sort);
	}, [sort]);

	const filter: PostFilter = useMemo(() => {
		return {
			sort,
			tags: selectedTags,
			searchQuery,
		};
	}, [sort, selectedTags, searchQuery]);

	const {
		data: posts,
		isLoading,
		isFetching,
	} = usePostsFeed(filter, limit, 0);

	return (
		<Container className="pb-4 pt-1">
			<h2>Browse posts</h2>
			<div className="d-flex flex-column gap-3 mb-3">
				<div className="d-flex align-items-center gap-2">
					<Button
						variant="outline-secondary"
						onClick={() => setShowFilters(true)}
						className="d-flex align-items-center gap-2"
					>
						<FiFilter />
						Filters
					</Button>

					<InputGroup>
						<Form.Control
							placeholder="Search posts…"
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setLimit(PAGE_SIZE);
							}}
						/>
						{searchQuery.trim().length > 0 && (
							<Button
								variant="outline-secondary"
								onClick={() => {
									setSearchQuery("");
									setLimit(PAGE_SIZE);
								}}
							>
								Clear
							</Button>
						)}
					</InputGroup>
				</div>
			</div>

			<ExploreFiltersSidebar
				show={showFilters}
				onHide={() => setShowFilters(false)}
				allTags={allTags}
				selectedTags={selectedTags}
				onChangeSelectedTags={(next) => {
					setSelectedTags(next);
					setLimit(PAGE_SIZE);
				}}
				sort={sort}
				onChangeSort={(next) => {
					setSort(next);
					setLimit(PAGE_SIZE);
				}}
			/>

			{isLoading && <p>Loading…</p>}

			{posts && posts.length === 0 && (
				<p className="text-muted">No posts match your filters.</p>
			)}

			{posts && posts.length > 0 && (
				<>
					<div className="row g-3">
						{posts.map((item) => (
							<div
								key={item.post.id}
								className="col-12 col-md-6 col-lg-4 col-xl-3"
							>
								<PostCard item={item} variant="grid" />
							</div>
						))}
					</div>

					{posts.length >= limit && (
						<div className="d-grid mt-3">
							<Button
								variant="outline-primary"
								disabled={isFetching}
								onClick={() => setLimit((v) => v + PAGE_SIZE)}
							>
								{isFetching ? "Loading…" : "Load more"}
							</Button>
						</div>
					)}
				</>
			)}
		</Container>
	);
};

export default ExplorePage;
