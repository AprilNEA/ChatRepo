import type { Job } from "bullmq";
import { QueueEnum, createQueue, createWorker } from "./utils";
import { getTrend } from "../lib/get-trend";
import db from "../db";
import { repo as repoTable, repoContext as repoContextTable } from "@chatrepo/db/schema";
import { eq } from "drizzle-orm";
import { queue as converterQueue } from "./converter";

const queue = createQueue(QueueEnum.TREND_TRACKER);

const worker = createWorker(QueueEnum.TREND_TRACKER, async (job: Job) => {
	console.log("Starting trend tracker job...");
	
	const lastWeek = new Date();
	lastWeek.setDate(lastWeek.getDate() - 7);
	const trendingRepos = await getTrend(lastWeek);

	console.log(`Found ${trendingRepos.length} trending repositories`);

	await db.transaction(async (tx) => {
		// Insert repositories, ignore conflicts
		const repos = await tx
			.insert(repoTable)
			.values(trendingRepos)
			.onConflictDoNothing({
				target: [repoTable.fullName, repoTable.owner],
			})
			.returning();

		console.log(`Inserted/updated ${repos.length} repositories`);

		// Create converter jobs for each repository
		const jobs = await converterQueue.addBulk(
			repos.map((repo) => ({
				name: QueueEnum.CONVERTER,
				data: repo,
			})),
		);

		// Create repoContext entries with job IDs
		const repoContextEntries = jobs.map((jobInfo, index) => ({
			repoId: repos[index].id,
			jobId: jobInfo.id,
			format: "text/llm-readable",
			branch: "main",
		}));

		await tx
			.insert(repoContextTable)
			.values(repoContextEntries)
			.onConflictDoNothing();

		console.log(`Created ${repoContextEntries.length} context entries`);
	});
});

export { worker, queue };
