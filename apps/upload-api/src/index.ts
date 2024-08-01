import { writeFile } from "fs/promises";

import { build } from "./app.js";
import { getLoggingConfiguration } from "logging-wrapper";

const app = await build(getLoggingConfiguration());

app.listen({ host: "0.0.0.0", port: 8008 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
