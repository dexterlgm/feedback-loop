const TAGS_KEY = "explore_filters_tags";
const SORT_KEY = "explore_filters_sort";

export type SortValue = "newest" | "explore";

export const loadSavedTags = (): string[] => {
	try {
		const raw = localStorage.getItem(TAGS_KEY);
		if (!raw) return [];

		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		const values: unknown[] = parsed;
		const tags: string[] = [];

		for (let i = 0; i < values.length; i++) {
			const value: unknown = values[i];
			if (typeof value === "string") {
				tags.push(value);
			}
		}

		return tags;
	} catch {
		return [];
	}
};

export const saveTags = (tags: string[]): void => {
	localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
};

export const loadSavedSort = (): SortValue => {
	const raw = localStorage.getItem(SORT_KEY);

	if (raw === "newest") return "newest";
	if (raw === "explore") return "explore";
	return "explore";
};

export const saveSort = (sort: SortValue): void => {
	localStorage.setItem(SORT_KEY, sort);
};
