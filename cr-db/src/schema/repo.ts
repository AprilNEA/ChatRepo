import { relations } from "drizzle-orm";
import {
	pgTable,
	varchar,
	text,
	integer,
	timestamp,
	uniqueIndex,
	jsonb,
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
		stars: integer("stars").notNull().default(0),
		url: varchar("url", { length: 255 }).notNull(),
		language: varchar("language", { length: 255 }),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at"),
	},
	(t) => [uniqueIndex("repo_idx").on(t.fullName, t.owner)],
);

export const repoRelations = relations(repo, ({ many }) => ({
	repoContext: many(repoContext),
}));

export type Repo = typeof repo.$inferSelect;
export type NewRepo = typeof repo.$inferInsert;

export const repoContext = pgTable("repo_context", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	repoId: integer("repo_id").references(() => repo.id),

	format: varchar("format", { length: 255 }).notNull().default("text/plain"),
	branch: varchar("branch", { length: 255 }).notNull().default("main"),
	other: jsonb("other"),

	content: text("content"),
	jobId: varchar("job_id"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at"),
});

export const repoContextRelations = relations(repoContext, ({ one }) => ({
	repo: one(repo, {
		fields: [repoContext.repoId],
		references: [repo.id],
	}),
}));

export type RepoContext = typeof repoContext.$inferSelect;
export type NewRepoContext = typeof repoContext.$inferInsert;
