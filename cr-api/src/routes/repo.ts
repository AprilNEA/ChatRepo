import { appFactory } from "../factory";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { queue as trendTrackerQueue } from "../queues/trend-tracker";

const app = appFactory
  .createApp()
  .get("/", async (c) => {
    const db = c.get("db");
    const repos = await db.query.repo.findMany({});
    return c.json(repos);
  })
  .post("/trigger-import", async (c) => {
    try {
      // Manually trigger the trend tracker job
      const job = await trendTrackerQueue.add(
        "manual-trend-import",
        {},
        {
          priority: 1, // High priority for manual imports
        }
      );

      return c.json({
        success: true,
        message: "Trend import job queued successfully",
        jobId: job.id,
      });
    } catch (error) {
      console.error("Failed to queue trend import:", error);
      return c.json(
        {
          success: false,
          message: "Failed to queue trend import job",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  })
  .get("/with-context", async (c) => {
    const db = c.get("db");
    const repos = await db.query.repo.findMany({
      with: {
        repoContext: true,
      },
    });
    return c.json(repos);
  })
  .get("/list", async (c) => {
    const db = c.get("db");
    const repos = await db.query.repo.findMany({
      with: {
        repoContext: true,
      },
      orderBy: (t, { desc }) => [
        desc(t.updatedAt),
        desc(t.createdAt),
        desc(t.stars),
      ],
      limit: 10,
    });
    return c.json(repos);
  });

export default app;
