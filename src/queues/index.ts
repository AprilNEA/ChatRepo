import { queue as repoQueue } from "./trend-tracker";

export default async () => {
	const { worker: repoWorker } = await import("./trend-tracker");
	repoQueue.upsertJobScheduler(
		"trend-tracker-daily-trend-tracker-daily",
		{
			pattern: "0 0 * * *",
		},
		{},
	);
	await Promise.all([repoWorker.run()]).then((n) => {
		console.log(`[BullMQ] Queue Workers(${n.length}) started`);
	});
};

const getQueues = () => [repoQueue];

export { getQueues };
