import { hc } from "hono/client";
import type { routes } from ".";

// import type
// assign the client to a variable to calculate the type when compiling
const client = hc<typeof routes>("/api");
export type Client = typeof client;
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof routes>(...args);