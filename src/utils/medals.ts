import type { Medal } from "../types";

export interface GroupedMedal {
	medal: Medal;
	count: number;
}

// Groups duplicate medals by id and counts them.
export const groupMedals = (medals: Medal[]): GroupedMedal[] => {
	const grouped: Record<number, GroupedMedal> = {};

	for (const medal of medals) {
		if (!grouped[medal.id]) {
			grouped[medal.id] = { medal, count: 0 };
		}
		grouped[medal.id].count += 1;
	}

	return Object.values(grouped);
};
