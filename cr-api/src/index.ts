import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import repo from "./routes/repo";
import chat from "./routes/chat";
import { showRoutes } from "hono/dev";

const app = new Hono().basePath("/api");

export const routes = new Hono().route("/repo", repo).route("/chat", chat);

app.route("/", routes);

const run = async () => {
	const port = process.env.PORT ? Number(process.env.PORT) : 3001;
	const server = serve({ fetch: app.fetch, port }, ({ address, port }) => {
		console.log(`Server is running on ${address}:${port}...`);
		showRoutes(app);
	});
};

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
