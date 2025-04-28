import { pgTable, serial, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

export const repo = pgTable("repo", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  owner: varchar("owner", { length: 255 }).notNull(),

  fullName: varchar("full_name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  stars: integer("stars").notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  language: varchar("language", { length: 255 }).notNull(),

  llmContext: text("llm_context"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull(),
});