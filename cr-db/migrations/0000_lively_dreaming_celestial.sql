CREATE TABLE "repo" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "repo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"owner" varchar(255) NOT NULL,
	"avatar_url" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"description" text,
	"stars" integer DEFAULT 0 NOT NULL,
	"url" varchar(255) NOT NULL,
	"language" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);

CREATE TABLE "repo_context" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "repo_context_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"repo_id" integer,
	"format" varchar(255) DEFAULT 'text/plain' NOT NULL,
	"branch" varchar(255) DEFAULT 'main' NOT NULL,
	"other" jsonb,
	"content" text,
	"job_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);

ALTER TABLE "repo_context" ADD CONSTRAINT "repo_context_repo_id_repo_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repo"("id") ON DELETE no action ON UPDATE no action;
CREATE UNIQUE INDEX "repo_idx" ON "repo" USING btree ("full_name","owner");