import { FastifyInstance } from "fastify";
import t from "tap";
import { SCHEDULER_TOKEN } from "../../utils/storeConfig.js";

t.test("scheduleCleanupTask", async (t) => {
  const OriginalDate = Date;

  t.beforeEach(() => {
    Date = class extends Date {
      constructor() {
        super(OriginalDate.UTC(2024, 0, 1, 0, 0, 0));
      }
    };
  });

  t.afterEach(() => {
    Date = OriginalDate;
  });

  t.test(
    "scheduleCleanupTask should call scheduler SDK with the correct parameters",
    async (t) => {
      const usedParams: string[] = [];

      const { default: scheduleCleanupTask } = await t.mockImport<
        typeof import("../../utils/scheduleCleanupTask.js")
      >("../../utils/scheduleCleanupTask.js", {
        "../../utils/authentication-factory.js": {
          getSchedulerSdk: () =>
            Promise.resolve({
              scheduleTasks: (...params: string[]) => {
                usedParams.push(...params);
                return Promise.resolve();
              },
            }),
        },
        "../../utils/storeConfig.js": {
          SCHEDULER_TOKEN,
          getConfigValue: () => Promise.resolve("token"),
        },
      });

      const app = {
        pg: {
          pool: {},
        },
        log: { info: () => {}, error: () => {} },
        config: {
          SCHEDULED_JOBS_HOURS_INTERVAL: 5,
          HOST: "http://foo.com",
        },
      } as unknown as FastifyInstance;
      await scheduleCleanupTask(app);

      t.match(usedParams[0], [
        {
          executeAt: new OriginalDate(
            OriginalDate.UTC(2024, 0, 1, 5, 0, 0),
          ).toISOString(),
          webhookUrl: `http://foo.com/api/v1/jobs`,
          webhookAuth: "token",
        },
      ]);
    },
  );

  t.test(
    "scheduleCleanupTask errors should be logged when schedulerSdk throws",
    async (t) => {
      const usedParams: string[] = [];

      const { default: scheduleCleanupTask } = await t.mockImport<
        typeof import("../../utils/scheduleCleanupTask.js")
      >("../../utils/scheduleCleanupTask.js", {
        "../../utils/authentication-factory.js": {
          getSchedulerSdk: () =>
            Promise.resolve({
              scheduleTasks: (...params: string[]) => {
                usedParams.push(...params);
                return Promise.reject("error");
              },
            }),
        },
        "../../utils/storeConfig.js": {
          SCHEDULER_TOKEN,
          getConfigValue: () => Promise.resolve("token"),
        },
      });

      let errorLogged = false;
      const app = {
        pg: {
          pool: {},
        },
        log: {
          info: () => {},
          error: () => {
            errorLogged = true;
          },
        },
        config: {
          SCHEDULED_JOBS_HOURS_INTERVAL: 5,
          HOST: "http://foo.com",
        },
      } as unknown as FastifyInstance;
      await scheduleCleanupTask(app);

      t.match(usedParams[0], [
        {
          executeAt: new OriginalDate(
            OriginalDate.UTC(2024, 0, 1, 5, 0, 0),
          ).toISOString(),
          webhookUrl: `http://foo.com/api/v1/jobs`,
          webhookAuth: "token",
        },
      ]);

      t.equal(errorLogged, true);
    },
  );
});
