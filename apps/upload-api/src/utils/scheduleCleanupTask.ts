import { FastifyInstance } from "fastify";
import { getSchedulerSdk } from "./authentication-factory.js";
import { getConfigValue, SCHEDULER_TOKEN } from "./storeConfig.js";

const scheduleCleanupTask = async (app: FastifyInstance) => {
  const schedulerSdk = await getSchedulerSdk("ogcio");

  const schedulerToken = (await getConfigValue(
    app.pg.pool,
    SCHEDULER_TOKEN,
  )) as string;

  const hoursInterval = app.config.SCHEDULED_JOBS_HOURS_INTERVAL as number;
  const scheduleDate = new Date();
  scheduleDate.setHours(scheduleDate.getHours() + hoursInterval);

  try {
    await schedulerSdk.scheduleTasks([
      {
        executeAt: scheduleDate.toISOString(),
        webhookUrl: `${app.config.HOST}/api/v1/jobs`,
        webhookAuth: schedulerToken,
      },
    ]);

    app.log.info(`Scheduled next job at: ${scheduleDate.toISOString()}`);
  } catch (err) {
    app.log.error(err);
  }
};

export default scheduleCleanupTask;
