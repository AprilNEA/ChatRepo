import { appFactory } from "@/factory";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = appFactory.createApp().get(
	"/",
	// zValidator(
	// 	"query",
	// 	z.object({
	// 		query: z.string(),
	// 	}),
	// ),
	async (c) => {
		const db = c.get("db");
		const repos = db.query.repo.findMany({});
		return c.json(repos);
	},
);

export default app;
