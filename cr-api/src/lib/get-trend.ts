import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN, // Optional: for higher rate limits
});

export const getTrend = async (date: Date) => {
	console.log(`Fetching trending repositories since ${date.toISOString().split("T")[0]}`);
	
	try {
		// Get repositories created in the last week with good activity
		const response = await octokit.rest.search.repos({
			q: `created:>${date.toISOString().split("T")[0]} stars:>5 sort:stars-desc`,
			sort: "stars",
			order: "desc",
			per_page: 30, // Increased to get more repositories
		});

		console.log(`Found ${response.data.items.length} trending repositories`);

		const trendingRepos = response.data.items
			.filter(repo => 
				repo.full_name && 
				repo.owner?.login && 
				!repo.private && 
				repo.description // Filter out repos without description
			)
			.map((repo) => ({
				name: repo.name,
				fullName: repo.full_name,
				description: repo.description,
				stars: repo.stargazers_count,
				url: repo.html_url,
				language: repo.language,
				owner: repo.owner?.login ?? "",
				avatarUrl: repo.owner?.avatar_url,
			}));

		console.log(`Filtered to ${trendingRepos.length} valid repositories`);
		return trendingRepos;
	} catch (error) {
		console.error("Error fetching trending repositories:", error);
		throw error;
	}
};
