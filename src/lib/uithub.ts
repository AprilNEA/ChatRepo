interface Author {
	login: string;
	avatarUrl: string;
	url?: string;
}

interface Comment {
	id: string;
	body: string;
	author: Author;
	createdAt: string;
	updatedAt: string;
	url: string;
}

interface ThreadItem {
	id: string;
	number: number;
	title: string;
	body: string;
	author: Author;
	createdAt: string;
	updatedAt: string;
	url: string;
	state: "open" | "closed";
	type: "issue" | "pull" | "discussion";
	labels: string[];
	reactions: {
		totalCount: number;
		types: Array<{
			type: string;
			count: number;
		}>;
	};
	comments: Comment[];
}

interface ListResponse {
	items: ThreadItem[];
	totalCount: number;
}

interface Error {
	error: string;
	status: number;
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch data");
	}
	return response.json();
};

export function getRepositoryContents(
	owner: string,
	repo: string,
	branch?: string,
	path?: string,
) {
	const url = `https://uithub.com/${owner}/${repo}/tree/${branch || "main"}/${path || ""}`;
	return fetcher(url);
}
