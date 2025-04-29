import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { streamText } from 'ai';
import { anthropic } from "@ai-sdk/anthropic";
import { stream } from 'hono/streaming';

const app = new Hono()

app.post('/chat', async c => {
  const result = streamText({
 		model: anthropic("claude-3-5-sonnet-latest"),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  // Mark the response as a v1 data stream:
  c.header('X-Vercel-AI-Data-Stream', 'v1');
  c.header('Content-Type', 'text/plain; charset=utf-8');

  return stream(c, stream => stream.pipe(result.toDataStream()));
});


serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
