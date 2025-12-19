import { useMemo, useState } from "react";
import { Offcanvas, Button, Form } from "react-bootstrap";
import type { Tag } from "../types";
import type { SortValue } from "../utils/exploreFiltersStorage";

interface ExploreFiltersSidebarProps {
	show: boolean;
	onHide: () => void;

	allTags: Tag[];
	selectedTags: string[];
	onChangeSelectedTags: (next: string[]) => void;

	sort: SortValue;
	onChangeSort: (next: SortValue) => void;
}

const COLLAPSED_COUNT = 10;

const toggleNameInList = (list: string[], name: string): string[] => {
	if (list.includes(name)) return list.filter((x) => x !== name);
	return [...list, name];
};

const ExploreFiltersSidebar = ({
	show,
	onHide,
	allTags,
	selectedTags,
	onChangeSelectedTags,
	sort,
	onChangeSort,
}: ExploreFiltersSidebarProps) => {
	const [tagSearch, setTagSearch] = useState("");
	const [expanded, setExpanded] = useState(false);

	const { selectedFirst, unselected } = useMemo(() => {
		const selectedSet = new Set(selectedTags);

		const selected = allTags
			.map((t) => t.name)
			.filter((name) => selectedSet.has(name));

		const rest = allTags
			.map((t) => t.name)
			.filter((name) => !selectedSet.has(name));

		return { selectedFirst: selected, unselected: rest };
	}, [allTags, selectedTags]);

	const filteredUnselected = useMemo(() => {
		const q = tagSearch.trim().toLowerCase();

		if (q.length === 0) return unselected;

		return unselected.filter((name) => name.toLowerCase().includes(q));
	}, [unselected, tagSearch]);

	const visibleUnselected = expanded
		? filteredUnselected
		: filteredUnselected.slice(0, COLLAPSED_COUNT);

	const showExpandButton = filteredUnselected.length > COLLAPSED_COUNT;

	return (
		<Offcanvas show={show} onHide={onHide} placement="start">
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Filters</Offcanvas.Title>
			</Offcanvas.Header>

			<Offcanvas.Body>
				<Form.Group className="mb-3">
					<Form.Label>Sort</Form.Label>
					<Form.Select
						value={sort}
						onChange={(e) => {
							const v =
								e.target.value === "newest"
									? "newest"
									: "explore";
							onChangeSort(v);
						}}
					>
						<option value="explore">Explore</option>
						<option value="newest">Newest</option>
					</Form.Select>
				</Form.Group>

				<hr />

				<Form.Group className="mb-2">
					<Form.Label>Tags</Form.Label>
					<Form.Control
						placeholder="Search tags…"
						value={tagSearch}
						onChange={(e) => setTagSearch(e.target.value)}
					/>
				</Form.Group>

				<div className="d-flex flex-column gap-1">
					{selectedFirst.length > 0 && (
						<>
							<div className="text-muted small mt-2">
								Selected
							</div>
							{selectedFirst.map((name) => (
								<Form.Check
									key={`selected-${name}`}
									type="checkbox"
									id={`tag-${name}`}
									label={name}
									checked
									onChange={() =>
										onChangeSelectedTags(
											toggleNameInList(selectedTags, name)
										)
									}
								/>
							))}

							<hr />
						</>
					)}

					<div className="text-muted small">All tags</div>

					<div
						className={expanded ? "overflow-auto" : ""}
						style={expanded ? { maxHeight: 320 } : undefined}
					>
						{visibleUnselected.map((name) => (
							<Form.Check
								key={`tag-${name}`}
								type="checkbox"
								id={`tag-${name}`}
								label={name}
								checked={selectedTags.includes(name)}
								onChange={() =>
									onChangeSelectedTags(
										toggleNameInList(selectedTags, name)
									)
								}
							/>
						))}

						{filteredUnselected.length === 0 && (
							<div className="text-muted small mt-2">
								No tags match your search.
							</div>
						)}
					</div>

					{showExpandButton && (
						<Button
							variant="link"
							className="px-0 mt-2 text-start"
							onClick={() => setExpanded((v) => !v)}
						>
							{expanded ? "Show fewer tags" : "Show all tags"}
						</Button>
					)}
				</div>

				{selectedTags.length > 0 && (
					<div className="mt-3">
						<Button
							variant="outline-secondary"
							size="sm"
							onClick={() => onChangeSelectedTags([])}
						>
							Clear tags
						</Button>
					</div>
				)}
			</Offcanvas.Body>
		</Offcanvas>
	);
};

export default ExploreFiltersSidebar;
