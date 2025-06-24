import { appFactory } from "@server/factory";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { stream } from "hono/streaming";

const app = appFactory.createApp().post(
  "/",
  // zValidator(
  //   "json",
  //   z.object({
  //     fullName: z.string(),
  //     message: z.string(),
  //   })
  // ),
  async (c) => {
    // const db = c.get("db");
    // const { fullName, message } = c.req.valid("json");
    // const repo = await db.query.repo.findFirst({
    //   with: {
    //     repoContext: true,
    //   },
    //   where: (t, { eq }) => eq(t.fullName, fullName),
    // });

    // if (!repo) {
    //   throw new Error("Repository not found");
    // }
    const { messages } = await c.req.json();
    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      // prompt: `You are a helpful assistant that can answer questions about the repository ${repo.fullName}.
      // The repository content is: ${repo.repoContext[0].content}
      // The user message is: ${message}`,
      messages,
    });

    // Mark the response as a v1 data stream:
    c.header("X-Vercel-AI-Data-Stream", "v1");
    c.header("Content-Type", "text/plain; charset=utf-8");

    return stream(c, (stream) => stream.pipe(result.toDataStream()));
  }
);

export default app;
