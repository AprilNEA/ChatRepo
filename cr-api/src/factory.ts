import { createFactory } from "hono/factory";
import type { DataBase } from "./db/index";
import type { Context, Next } from "hono";
import type { MiddlewareHandler } from "hono";
import db from "./db/index";

const contextMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
	c.set("db", db);
	await next();
};

export const appFactory = createFactory<{
	Variables: {
		db: DataBase;
	};
}>({
	initApp: (app) => {
		app.use(contextMiddleware);
	},
});
