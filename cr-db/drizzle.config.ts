import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw "DATABASE_URL is not set";
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/**/*.ts",
  out: "./migrations/",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: process.env.NODE_ENV === "development",
  breakpoints: false,
  strict: true,
});
