import { queue as repoQueue } from "./trend-tracker.js";

export default async () => {
	const { worker: repoWorker } = await import("./trend-tracker.js");
	const { worker: converterWorker } = await import("./converter.js");
	
	// Setup daily scheduled job for trend tracking
	repoQueue.upsertJobScheduler(
		"trend-tracker-daily",
		{
			pattern: "0 0 * * *", // Run daily at midnight
		},
		{},
	);
	
	// Start all workers
	await Promise.all([
		repoWorker.run(),
		converterWorker.run()
	]).then((workers) => {
		console.log(`[BullMQ] ${workers.length} Queue Workers started successfully`);
	});
};

const getQueues = () => {
	const { queue: converterQueue } = require("./converter.js");
	return [repoQueue, converterQueue];
};

export { getQueues };
