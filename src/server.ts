import "dotenv/config";
import "zod-openapi/extend";

import http from "node:http";

import next from "next";
import packageJson from "../package.json";
import { env } from "node:process";

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

/**
 * Prepare the app and start the server
 */
void app.prepare().then(async () => {
  try {
    // if (env.NODE_ENV === "production") {
    //   import("./db/migrate").then(({ runMigrate }) => runMigrate());
    // }

    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.on("listening", () => {
      console.log(
        `[VMBoard] v${packageJson.version} running on http://${process.env.HOSTNAME}:${process.env.PORT}`,
      );
    });

    server.listen(process.env.PORT, process.env.HOSTNAME);

    // if (env.ENABLE_ALERT_QUEUE) {
    //   if (!env.REDIS_URL) {
    //     throw new Error("REDIS_URL is not set which is required for alert queue");
    //   }
    //   await (await import("./queues")).default();
    // }
  } catch (e) {
    console.error("[VMBoard] failed to start with error:", e);
  }
});