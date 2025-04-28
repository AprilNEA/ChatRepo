import useSWR from "swr";

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

export function useRepositoryContents(
	owner: string,
	repo: string,
	branch?: string,
	path?: string,
) {
	const url = `https://uithub.com/${owner}/${repo}/tree/${branch || "main"}/${path || ""}`;
	return useSWR(url, fetcher);
}

export function useRelevantContents(
	owner: string,
	repo: string,
	threadType: "issues" | "discussions",
	number: string,
) {
	const url = `https://uithub.com/${owner}/${repo}/${threadType}/${number}`;
	return useSWR(url, fetcher);
}

export function useListItems(
	owner: string,
	repo: string,
	itemType: "issues" | "pulls" | "discussions",
	page: number = 1,
	query?: string,
) {
	const params = new URLSearchParams();
	if (page > 1) params.append("page", page.toString());
	if (query) params.append("q", query);

	const url = `https://uithub.com/${owner}/${repo}/${itemType}?${params.toString()}`;
	return useSWR<ListResponse, Error>(url, fetcher);
}
