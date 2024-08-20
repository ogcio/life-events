import fastifyEnv from "@fastify/env";
import fastify from "fastify";
import t from "tap";
import { envSchema } from "../../../config.js";
import s3Client from "../../../plugins/s3Client.js";

t.test("s3Plugin", async (t) => {
  t.test("registers s3 plugin with credentials", async (t) => {
    const app = fastify();

    await app.register(fastifyEnv, {
      schema: envSchema,
      dotenv: true,
    });

    await app.register(s3Client);

    t.hasProp(app.s3Client.config, "credentials");

    t.match(app.s3Client.config.credentials, {
      accessKeyId: "123",
      secretAccessKey: "432",
    });
  });

  t.test("registers s3 plugin without credentials", async (t) => {
    const app = fastify();

    await app.register(fastifyEnv, {
      schema: envSchema,
      dotenv: true,
    });

    delete app.config.S3_ACCESS_KEY_ID;

    await app.register(s3Client);

    t.match(app.s3Client.config.credentials, undefined);
  });
});
