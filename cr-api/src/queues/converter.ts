import type { Job } from "bullmq";
import { QueueEnum, createQueue, createWorker } from "./utils";
import {
  type Repo,
  repoContext as repoContextTable,
} from "@chatrepo/db/schema";
import { getRepositoryContents } from "../lib/github";
import { convertRepoToLLMText } from "../lib/llm-converter";
import db from "../db";
import { eq } from "drizzle-orm";

const queue = createQueue(QueueEnum.CONVERTER);

const worker = createWorker(QueueEnum.CONVERTER, async (job: Job) => {
  const repo = job.data as Repo;
  console.log(`Processing repository: ${repo.fullName}`);

  try {
    // Get repository contents from GitHub API
    const contents = await getRepositoryContents(repo.owner, repo.name);

    // Convert repository information to LLM-readable text
    const llmText = await convertRepoToLLMText(repo, contents);

    // Update the repoContext entry with the converted content
    if (job.id) {
      await db
        .update(repoContextTable)
        .set({
          content: llmText,
          updatedAt: new Date(),
        })
        .where(eq(repoContextTable.jobId, job.id));
    } else {
      console.warn(`Job ID is missing for repository: ${repo.fullName}`);
    }

    console.log(`Successfully processed repository: ${repo.fullName}`);
  } catch (error) {
    console.error(`Failed to process repository ${repo.fullName}:`, error);
    throw error; // This will mark the job as failed
  }
});

export { worker, queue };
