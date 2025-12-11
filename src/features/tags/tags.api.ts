import { supabase } from "../../utils/supabaseClient";

export interface Tag {
	id: number;
	name: string;
}

export async function getTags(): Promise<Tag[]> {
	const { data, error } = await supabase
		.from("tags")
		.select("id, name")
		.order("name", { ascending: true });

	if (error) throw error;
	return data ?? [];
}
