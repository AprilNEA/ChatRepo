import { appFactory } from "@/factory";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { stream } from "hono/streaming";

const app = appFactory.createApp().post("/chat", async (c) => {
	const result = streamText({
		model: anthropic("claude-3-5-sonnet-latest"),
		prompt: "Invent a new holiday and describe its traditions.",
	});

	// Mark the response as a v1 data stream:
	c.header("X-Vercel-AI-Data-Stream", "v1");
	c.header("Content-Type", "text/plain; charset=utf-8");

	return stream(c, (stream) => stream.pipe(result.toDataStream()));
});

export default app;
