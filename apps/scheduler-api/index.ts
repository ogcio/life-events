import { writeFile } from "fs/promises";

import { build } from "./app";
import { workwork } from "./worker";

const app = await build({ logger: true });
const scheduler = await workwork(app, "1");
const scheduler2 = await workwork(app, "2");
const scheduler3 = await workwork(app, "3");

app.listen({ host: "0.0.0.0", port: 8004 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`app listening at ${address}`);
});

// Put in env so we can start N amount of schedulers
scheduler.start();
scheduler2.start();
scheduler3.start();

await app.ready();
await writeFile("./openapi-definition.yml", app.swagger({ yaml: true }));
