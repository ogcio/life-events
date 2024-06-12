import { writeFile } from "fs/promises";

import { build } from "./app";

import { getLoggingConfiguration } from "logging-wrapper";
import { newMessagingEventLogger } from "./types/messageLogs";

const app = await build(getLoggingConfiguration());
export const messagingLogger = newMessagingEventLogger(app.pg.pool);

app.listen({ host: "0.0.0.0", port: 8002 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`app listening at ${address}`);
});

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
