const TAGS_KEY = "explore_filters_tags";
const SORT_KEY = "explore_filters_sort";

export type SortValue = "newest" | "explore";

export const loadSavedTags = (): string[] => {
	try {
		const raw = localStorage.getItem(TAGS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((x): x is string => typeof x === "string");
	} catch {
		return [];
	}
};

export const saveTags = (tags: string[]): void => {
	localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
};

export const loadSavedSort = (): SortValue => {
	const raw = localStorage.getItem(SORT_KEY);
	return raw === "newest" || raw === "explore" ? raw : "explore";
};

export const saveSort = (sort: SortValue): void => {
	localStorage.setItem(SORT_KEY, sort);
};
