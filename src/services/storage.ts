import { supabase } from "../utils/supabaseClient";

export async function uploadAvatar(
	file: File,
	userId: string
): Promise<string> {
	const ext = file.name.split(".").pop() ?? "png";
	const fileName = `avatar-${Date.now()}.${ext}`;
	const filePath = `${userId}/${fileName}`;

	const { error: uploadError } = await supabase.storage
		.from("avatars")
		.upload(filePath, file, {
			// Overwrite if path is same
			upsert: true,
		});

	if (uploadError) {
		throw uploadError;
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from("avatars").getPublicUrl(filePath);

	return publicUrl;
}

export async function uploadPostImage(
	file: File,
	userId: string,
	postId: string
): Promise<string> {
	const ext = file.name.split(".").pop() ?? "png";
	const fileName = `${crypto.randomUUID()}.${ext}`;
	const filePath = `${userId}/${postId}/${fileName}`;

	const { error: uploadError } = await supabase.storage
		.from("post-images")
		.upload(filePath, file);

	if (uploadError) {
		throw uploadError;
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from("post-images").getPublicUrl(filePath);

	return publicUrl;
}
