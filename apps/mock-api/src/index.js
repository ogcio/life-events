import Fastify from "fastify";
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async function handler() {
  return { ping: "pong" };
});

fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, "stubs"),
  prefix: "/",
  index: "index.html",
  list: false,
  constraints: {},
});

fastify.register(import("@fastify/autoload"), {
  dir: path.join(__dirname, 'stubs')
})

try {
  await fastify.listen({ host: "0.0.0.0", port: 80 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
