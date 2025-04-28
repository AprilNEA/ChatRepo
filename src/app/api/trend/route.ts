import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export async function GET() {
	try {
		// Get trending repositories for the last week
		const response = await octokit.rest.search.repos({
			q: "created:>2024-01-01 sort:stars-desc", // Adjust date as needed
			sort: "stars",
			order: "desc",
			per_page: 10,
		});

		const trendingRepos = response.data.items.map((repo) => ({
			name: repo.name,
			fullName: repo.full_name,
			description: repo.description,
			stars: repo.stargazers_count,
			url: repo.html_url,
			language: repo.language,
			owner: {
				login: repo.owner.login,
				avatarUrl: repo.owner.avatar_url,
			},
		}));

		return NextResponse.json({
			success: true,
			data: trendingRepos,
		});
	} catch (error) {
		console.error("Error fetching trending repos:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch trending repositories" },
			{ status: 500 },
		);
	}
}
