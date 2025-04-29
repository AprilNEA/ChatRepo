import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export const getTrend = async (date: Date) => {
	const response = await octokit.rest.search.repos({
		q: `created:>${date.toISOString().split("T")[0]} sort:stars-desc`,
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
		owner: repo.owner!.login,
		avatarUrl: repo.owner?.avatar_url,
	}));

	return trendingRepos;
};
