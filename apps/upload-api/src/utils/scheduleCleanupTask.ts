import { FastifyInstance } from "fastify";
import { getSchedulerSdk } from "./authentication-factory.js";
import { getConfigValue, SCHEDULER_TOKEN } from "./storeConfig.js";

const scheduleCleanupTask = async (app: FastifyInstance) => {
  const profileSdk = await getSchedulerSdk("ogcio");

  const schedulerToken = (await getConfigValue(
    app.pg.pool,
    SCHEDULER_TOKEN,
  )) as string;

  const hoursInterval = app.config.SCHEDULED_JOBS_HOURS_INTERVAL as number;
  const schduleDate = new Date();
  schduleDate.setHours(schduleDate.getHours() + hoursInterval);

  try {
    await profileSdk.scheduleTasks([
      {
        executeAt: schduleDate.toISOString(),
        webhookUrl: `${app.config.HOST}/api/v1/jobs`,
        webhookAuth: schedulerToken,
      },
    ]);

    app.log.info(`Scheduled next job at: ${schduleDate.toISOString()}`);
  } catch (err) {
    app.log.error(err);
  }
};

export default scheduleCleanupTask;
