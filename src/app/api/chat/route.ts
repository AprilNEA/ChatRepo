import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
	const { messages } = await req.json();

	const result = streamText({
		model: anthropic("claude-3-5-sonnet-latest"),
		messages,
	});

	return result.toDataStreamResponse();
}
