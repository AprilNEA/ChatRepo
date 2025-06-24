import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN, // Optional: for higher rate limits
});

export interface GitHubFile {
	name: string;
	path: string;
	sha: string;
	size: number;
	url: string;
	html_url: string;
	git_url: string;
	download_url: string | null;
	type: "file" | "dir";
	content?: string;
	encoding?: string;
}

export interface RepositoryContents {
	readme: string | null;
	files: GitHubFile[];
	languages: Record<string, number>;
	topics: string[];
	license: string | null;
}

export const getRepositoryContents = async (
	owner: string,
	repo: string,
	branch = "main"
): Promise<RepositoryContents> => {
	try {
		console.log(`Fetching contents for ${owner}/${repo}`);
		
		const [repoInfo, languages, contents] = await Promise.allSettled([
			// Get repository information
			octokit.rest.repos.get({ owner, repo }),
			// Get programming languages
			octokit.rest.repos.listLanguages({ owner, repo }),
			// Get repository contents (root directory)
			octokit.rest.repos.getContent({ owner, repo, path: "", ref: branch }),
		]);

		const result: RepositoryContents = {
			readme: null,
			files: [],
			languages: {},
			topics: [],
			license: null,
		};

		// Process repository info
		if (repoInfo.status === "fulfilled") {
			result.topics = repoInfo.value.data.topics ?? [];
			result.license = repoInfo.value.data.license?.name ?? null;
		}

		// Process languages
		if (languages.status === "fulfilled") {
			result.languages = languages.value.data;
		}

		// Process contents
		if (contents.status === "fulfilled" && Array.isArray(contents.value.data)) {
			result.files = contents.value.data as GitHubFile[];
			
			// Try to get README content
			const readmeFile = result.files.find(file => 
				file.type === "file" && 
				file.name.toLowerCase().startsWith("readme")
			);
			
			if (readmeFile && readmeFile.download_url) {
				try {
					const readmeResponse = await fetch(readmeFile.download_url);
					if (readmeResponse.ok) {
						result.readme = await readmeResponse.text();
					}
				} catch (error) {
					console.warn(`Failed to fetch README for ${owner}/${repo}:`, error);
				}
			}
		}

		return result;
	} catch (error) {
		console.error(`Error fetching repository contents for ${owner}/${repo}:`, error);
		throw error;
	}
};

export const getRepositoryDetails = async (owner: string, repo: string) => {
	try {
		const response = await octokit.rest.repos.get({ owner, repo });
		return response.data;
	} catch (error) {
		console.error(`Error fetching repository details for ${owner}/${repo}:`, error);
		throw error;
	}
}; 