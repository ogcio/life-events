import { writeFile } from "fs/promises";

import { build } from "./app.js";
import { getLoggingConfiguration } from "logging-wrapper";

const app = await build(getLoggingConfiguration());

app.listen({ host: "0.0.0.0", port: 8006 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`app listening at ${address}`);
});

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
