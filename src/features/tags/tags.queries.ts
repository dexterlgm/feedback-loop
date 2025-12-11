import { useQuery } from "@tanstack/react-query";
import { getTags, type Tag } from "./tags.api";

export function useTags() {
	return useQuery<Tag[]>({
		queryKey: ["tags"],
		queryFn: getTags,
	});
}
