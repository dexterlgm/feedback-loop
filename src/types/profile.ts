import type { Profile, Medal } from "./db";
import type { PostFeedItem } from "./post";

export interface ProfileStats {
	postCount: number;
	commentCount: number;
	totalCommentLikes: number;
}

export interface ProfileData {
	profile: Profile;
	medals: Medal[];
	stats: ProfileStats;
	recentPosts: PostFeedItem[];
}

export interface ProfileResponse {
	item: ProfileData;
}
