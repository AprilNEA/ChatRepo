import type { Repo } from "../../../cr-db/src/schema";
import type { RepositoryContents } from "./github";

export const convertRepoToLLMText = async (
	repo: Repo,
	contents: RepositoryContents
): Promise<string> => {
	const sections = [];

	// Repository Header
	sections.push(`# Repository: ${repo.fullName}`);
	sections.push(`**Owner**: ${repo.owner}`);
	sections.push(`**Name**: ${repo.name}`);
	sections.push(`**URL**: ${repo.url}`);
	sections.push(`**Stars**: ${repo.stars}`);
	
	if (repo.description) {
		sections.push(`**Description**: ${repo.description}`);
	}

	if (repo.language) {
		sections.push(`**Primary Language**: ${repo.language}`);
	}

	sections.push(""); // Empty line for separation

	// Programming Languages
	if (Object.keys(contents.languages).length > 0) {
		sections.push("## Programming Languages");
		const totalBytes = Object.values(contents.languages).reduce((sum, bytes) => sum + bytes, 0);
		const languagePercentages = Object.entries(contents.languages)
			.map(([lang, bytes]) => `${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`)
			.join(", ");
		sections.push(languagePercentages);
		sections.push("");
	}

	// Topics/Tags
	if (contents.topics.length > 0) {
		sections.push("## Topics");
		sections.push(contents.topics.join(", "));
		sections.push("");
	}

	// License
	if (contents.license) {
		sections.push("## License");
		sections.push(contents.license);
		sections.push("");
	}

	// Project Structure
	if (contents.files.length > 0) {
		sections.push("## Project Structure");
		
		// Categorize files
		const categories = {
			documentation: [] as string[],
			configuration: [] as string[],
			source: [] as string[],
			other: [] as string[]
		};

		for (const file of contents.files) {
			if (file.type === "file") {
				const fileName = file.name.toLowerCase();
				if (fileName.includes("readme") || fileName.includes("doc") || fileName.includes("changelog") || fileName.includes("license")) {
					categories.documentation.push(file.name);
				} else if (fileName.includes("config") || fileName.includes(".json") || fileName.includes(".yml") || fileName.includes(".yaml") || fileName.includes("package") || fileName.includes("requirements")) {
					categories.configuration.push(file.name);
				} else if (fileName.includes(".js") || fileName.includes(".ts") || fileName.includes(".py") || fileName.includes(".go") || fileName.includes(".java") || fileName.includes(".cpp") || fileName.includes(".c") || fileName.includes(".rs")) {
					categories.source.push(file.name);
				} else {
					categories.other.push(file.name);
				}
			}
		}

		if (categories.documentation.length > 0) {
			sections.push("### Documentation Files");
			sections.push(categories.documentation.join(", "));
		}

		if (categories.configuration.length > 0) {
			sections.push("### Configuration Files");
			sections.push(categories.configuration.join(", "));
		}

		if (categories.source.length > 0) {
			sections.push("### Source Files");
			sections.push(`${categories.source.slice(0, 10).join(", ")}${categories.source.length > 10 ? " ..." : ""}`);
		}

		if (categories.other.length > 0) {
			sections.push("### Other Files");
			sections.push(`${categories.other.slice(0, 5).join(", ")}${categories.other.length > 5 ? " ..." : ""}`);
		}

		sections.push("");
	}

	// README Content
	if (contents.readme) {
		sections.push("## README Content");
		// Truncate README if it's too long
		const truncatedReadme = contents.readme.length > 2000 
			? contents.readme.substring(0, 2000) + "\n\n[README truncated...]"
			: contents.readme;
		sections.push(truncatedReadme);
		sections.push("");
	}

	// Repository Analysis Summary
	sections.push("## Repository Analysis");
	const analysis = [];
	
	if (repo.stars > 1000) {
		analysis.push("This is a popular repository with significant community interest.");
	}
	
	if (Object.keys(contents.languages).length > 3) {
		analysis.push("This is a multi-language project.");
	}
	
	if (contents.topics.some(topic => topic.includes("framework") || topic.includes("library"))) {
		analysis.push("This appears to be a framework or library project.");
	}
	
	if (contents.files.some(file => file.name.toLowerCase().includes("test"))) {
		analysis.push("The project includes test files, indicating good development practices.");
	}

	if (analysis.length > 0) {
		sections.push(analysis.join(" "));
	} else {
		sections.push("This repository contains a software project with the above characteristics.");
	}

	return sections.join("\n");
}; 