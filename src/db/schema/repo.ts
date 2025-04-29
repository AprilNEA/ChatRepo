import {
	pgTable,
	varchar,
	text,
	integer,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const repo = pgTable(
	"repo",
	{
		id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
		name: varchar("name", { length: 255 }).notNull(),
		owner: varchar("owner", { length: 255 }).notNull(),
		avatarUrl: varchar("avatar_url", { length: 255 }),

		fullName: varchar("full_name", { length: 255 }).notNull(),
		description: text("description"),
		stars: integer("stars").notNull(),
		url: varchar("url", { length: 255 }).notNull(),
		language: varchar("language", { length: 255 }),

		llmContext: text("llm_context"),
		llmConvertJobId: varchar("llm_convert_job_id"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at"),
	},
	// (t) => [uniqueIndex("repo_idx").on(t.fullName, t.owner)],
);

export type Repo = typeof repo.$inferSelect;
export type NewRepo = typeof repo.$inferInsert;
