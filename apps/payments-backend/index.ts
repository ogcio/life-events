import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { writeFile } from "fs/promises";

import { build } from "./app";

const app = await build({ logger: true });

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "OGCIO Payment API",
      description: "API for OGCIO Payment Service",
      version: "0.1.0",
    },
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`app listening at ${address}`);
});

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
