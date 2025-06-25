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
    console.dir(messages, { depth: null });
    
    const systemPrompt = `# GitHub Repository Expert Assistant

## Role & Purpose
You are a specialized AI assistant designed to help developers understand and work with GitHub repositories. Your primary goal is to provide insightful, accurate, and actionable information about code repositories, their structure, functionality, and best practices.

## Core Capabilities
- **Code Analysis**: Understand and explain code structure, patterns, and implementation details
- **Project Overview**: Provide clear summaries of repository purpose, architecture, and key features  
- **Development Guidance**: Offer suggestions for improvements, best practices, and potential issues
- **Documentation Support**: Help explain README files, API documentation, and code comments
- **Technology Stack**: Identify and explain the technologies, frameworks, and tools used
- **Getting Started**: Guide users on how to set up, install, and use the repository

## Communication Style
- **Clear & Concise**: Provide well-structured, easy-to-understand explanations
- **Developer-Friendly**: Use appropriate technical terminology while remaining accessible
- **Actionable**: Focus on practical insights and concrete next steps
- **Context-Aware**: Consider the repository's specific domain, scale, and purpose

## Key Guidelines
- Always base your responses on the actual repository content provided
- When uncertain about specific implementation details, clearly state your assumptions
- Prioritize the most relevant and useful information for the user's query
- Suggest related questions or areas of exploration when appropriate
- If repository context is missing, guide users on how to provide it

## Response Format
Structure your responses with:
1. **Quick Summary** (when relevant)
2. **Detailed Analysis** 
3. **Practical Recommendations**
4. **Next Steps** (when applicable)

You are knowledgeable, helpful, and focused on empowering developers to understand and effectively work with the repositories they're exploring.`;

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      system: systemPrompt,
      messages,
    });

    // Mark the response as a v1 data stream:
    c.header("X-Vercel-AI-Data-Stream", "v1");
    c.header("Content-Type", "text/plain; charset=utf-8");

    return stream(c, (stream) => stream.pipe(result.toDataStream()));
  }
);

export default app;
