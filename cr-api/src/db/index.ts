import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../../../cr-db/src/schema.js";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const getQueryClient = () => postgres(process.env.DATABASE_URL);

const globalForDB = globalThis as unknown as {
	queryClient: ReturnType<typeof getQueryClient> | undefined;
};

const queryClient = globalForDB?.queryClient ?? getQueryClient();

const db = drizzle(queryClient, { schema });

export type DataBase = ReturnType<typeof drizzle<typeof schema>>;

export default db;

if (process.env.NODE_ENV !== "production") {
	globalForDB.queryClient = queryClient;
}
