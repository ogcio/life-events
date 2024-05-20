import { writeFile } from "fs/promises";

import { build } from "./app";
import { worker } from "./worker";
import { randomUUID } from "crypto";

const app = await build({ logger: true });

const scheduler = await worker(app, randomUUID().toString());

app.listen({ host: "0.0.0.0", port: 8005 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`app listening at ${address}`);
});

scheduler.start();

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
