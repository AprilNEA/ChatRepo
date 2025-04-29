import type { Job } from "bullmq";
import { QueueEnum, createQueue, createWorker } from "./utils";
import { getTrend } from "@/lib/get-trend";
import db from "../db";
import { type NewRepo, repo as repoTable } from "../../../cr-db/src/schema";
import { eq } from "drizzle-orm";
import { queue as converterQueue } from "./converter";

const queue = createQueue(QueueEnum.TREND_TRACKER);

const worker = createWorker(QueueEnum.TREND_TRACKER, async (job: Job) => {
	const lastWeek = new Date();
	lastWeek.setDate(lastWeek.getDate() - 7);
	const trendingRepos = await getTrend(lastWeek);

	await db.transaction(async (tx) => {
		const repos = await tx
			.insert(repoTable)
			.values(trendingRepos)
			.onConflictDoNothing({
				target: [repoTable.fullName, repoTable.owner],
			})
			.returning();

		const jobs = await converterQueue.addBulk(
			repos.map((repo) => ({
				name: QueueEnum.CONVERTER,
				data: repo,
			})),
		);

		for (const _job of jobs) {
			const job = _job as Job<NewRepo>;
			const repoId = Number(job.data.id);
			await tx
				.update(repoTable)
				.set({
					llmConvertJobId: job.id,
				})
				.where(eq(repoTable.id, repoId));
		}
	});
});

export { worker, queue };
