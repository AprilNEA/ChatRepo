import { appFactory } from "@server/factory";
import { queue as trendTrackerQueue } from "../queues/trend-tracker";

const app = appFactory.createApp().post("/config/trend", async (c) => {
  try {
    // Manually trigger the trend tracker job
    const job = await trendTrackerQueue.add(
      "manual-trend-config",
      {},
      {
        priority: 1, // High priority for manual imports
      }
    );

    return c.json({
      success: true,
      message: "Trend tracker job triggered successfully",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Failed to trigger trend tracker:", error);
    return c.json(
      {
        success: false,
        message: "Failed to trigger trend tracker job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default app;
