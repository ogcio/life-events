import { FastifyInstance } from "fastify";

import t from "tap";
import { CONFIG_TYPE, SCHEDULER_TOKEN } from "../utils/storeConfig.js";

t.test("under pressure handler should throw an error", async (t) => {
  let pressureHandler = (
    _req: string | null,
    _res: string | null,
    _type: string,
    _value: string,
  ) => {};
  const { build } = await t.mockImport<typeof import("../app.js")>(
    "../app.js",
    {
      "@fastify/under-pressure": {
        default: async (
          _fastify: FastifyInstance,
          opts: { pressureHandler: () => void },
        ) => {
          pressureHandler = opts.pressureHandler;
        },
      },
      "@fastify/autoload": {
        default: async () => {},
      },
      "../utils/storeConfig.js": {
        storeConfig: () => Promise.resolve(),
        CONFIG_TYPE,
        SCHEDULER_TOKEN,
      },
      "../utils/scheduleCleanupTask.js": {
        default: () => Promise.resolve(),
      },
    },
  );

  await build();

  t.throws(
    () => pressureHandler(null, null, "type", "value"),
    /System is under pressure. Pressure type: type. Pressure value: value/,
  );
});
