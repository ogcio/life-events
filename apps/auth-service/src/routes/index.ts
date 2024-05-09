// import * as url from "url";
import { FastifyInstance } from "fastify";
// import path from "path";
import auth from "./auth/index.js";
import healthCheck from "./healthcheck.js";

// const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
export default async function routes(app: FastifyInstance) {
  app.register(healthCheck);

  // app.register(import("@fastify/static"), {
  //   root: path.join(__dirname, "static"),
  //   prefix: "/",
  //   index: "index.html",
  //   list: false,
  //   constraints: {},
  // });

  app.register(auth, { prefix: "/auth" });
}
