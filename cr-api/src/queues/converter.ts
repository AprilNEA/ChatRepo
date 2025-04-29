import type { Job } from "bullmq";
import { QueueEnum, createQueue, createWorker } from "./utils";
import { type Repo, repo as repoTable } from "../db/schema";
import { getRepositoryContents } from "@/lib/uithub";
import db from "../db";
import { eq } from "drizzle-orm";

const queue = createQueue(QueueEnum.CONVERTER);

const worker = createWorker(QueueEnum.CONVERTER, async (job: Job) => {
	const repo = job.data as Repo;
	const contents = await getRepositoryContents(repo.owner, repo.name);

	await db
		.update(repoTable)
		.set({
			llmContext: contents,
		})
		.where(eq(repoTable.id, repo.id));
});

export { worker, queue };
