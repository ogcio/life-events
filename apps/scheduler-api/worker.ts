import { FastifyInstance } from "fastify";

type WebhookCallbackStatus = "delivered" | "error" | "timeout";

async function callbackWebHooks(
  callbackTimeoutMs: number,
  events: {
    id: string;
    webhookUrl: string;
    webhookAuth: string;
  }[],
) {
  const eventsWithFetch = events.map((event) => ({
    id: event.id,
    fetch: fetch(event.webhookUrl, {
      method: "POST",
      headers: { "x-user-id": event.webhookAuth },
      signal: AbortSignal.timeout(callbackTimeoutMs),
    }),
  }));

  const settled = await Promise.allSettled(
    eventsWithFetch.map((event) =>
      event.fetch.then(
        (res) => ({
          id: event.id,
          status: res.status,
          headers: res.headers,
        }),
        (err) => ({
          id: event.id,
          status: err,
        }),
      ),
    ),
  );

  const results: { status: WebhookCallbackStatus; id: string }[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      if ([200, 202, 204].includes(result.value.status)) {
        results.push({ id: result.value.id, status: "delivered" });
      } else {
        let error = String(result.value.status);
        let logStatus: WebhookCallbackStatus = "error";
        if (error.startsWith("TimeoutError")) {
          logStatus = "timeout";
        }

        results.push({ id: result.value.id, status: logStatus });
      }
    }
  }

  return results;
}

async function unitOfWork(
  app: FastifyInstance,
  processId: string,
  batchSize: number,
  callbackTimeoutMs: number,
) {
  try {
    // Todo add some identitifcation for the process to scheduled events table so we know who is locking the row
    // for update skip locked will prevent deadlocks. Alebeit slower than a specific queue impleem
    const events = await app.pg.pool
      .query<{ id: string; webhookUrl: string; webhookAuth: string }>(
        `
        with selection as (
          select id from scheduled_events 
          where event_status = 'pending' and execute_at <= now()
          order by 
            case when retries > 0 then retries end desc,
            case when retries = 0 then 0 end,
            execute_at
          for update skip locked
          limit $1
        )
        update scheduled_events set event_status = 'handling'
        where id in (select id from selection)
        returning 
          scheduled_events.id, 
          scheduled_events.webhook_url as "webhookUrl", 
          scheduled_events.webhook_auth as "webhookAuth"
      
    `,
        [batchSize],
      )
      .then((res) => res.rows);

    if (events.length) {
      // Perform all http POST web hook calls for each the events
      const callbackResults = await callbackWebHooks(callbackTimeoutMs, events);

      const logValues: string[] = [processId];
      const logArgs: string[] = [];

      const updateValues: string[] = [];

      let logIndex = 1;
      for (const result of callbackResults) {
        const id = result.id;
        if (result.status === "delivered") {
          logValues.push(id, "delivered");
          updateValues.push(`('${id}', 'delivered', 0)`);
        } else {
          logValues.push(id, result.status);
          updateValues.push(`('${id}', 'pending', 1)`);
        }
        logArgs.push(`($1, $${++logIndex}, $${++logIndex})`);
      }

      try {
        app.pg.pool.query(
          ` with logs as(
            insert into event_logs(process_id, event_id, status_code)
            values ${logArgs.join(", ")}
            )
            update scheduled_events as e set
                event_status = c.new_status,
                retries = e.retries + c.retries
            from (values ${updateValues.join(", ")})
            as c(id, new_status, retries)
            where c.id::uuid = e.id
      `,
          logValues,
        );
      } catch (err) {
        console.log("Massivt fel\n", err);
      }
    } else {
      console.log("Hittade ingenting");
    }
  } catch (err) {
    console.log("Det blev tokigt tyvarr", err);
  }
}

function workWithTimeoutRecursive(
  id: string,
  app: FastifyInstance,
  config: { size: number; intervalMs: number; callbackLimitMs: number },
) {
  const timeout = setTimeout(async () => {
    const { size, callbackLimitMs } = config;
    unitOfWork(app, id, size, callbackLimitMs);
    clearTimeout(timeout);
    workWithTimeoutRecursive(id, app, config);
  }, config.intervalMs);
}

export async function workwork(app: FastifyInstance, id: string) {
  const { interval, size } = await app.pg.pool
    .query<{ interval: number; size: number }>(
      `
  select 
    base_interval_ms as interval,
    select_size as size
  from config
  `,
    )
    .then((res) => res.rows.at(0) || { size: 200, interval: 10 * 1000 });

  return {
    start() {
      workWithTimeoutRecursive(id, app, {
        intervalMs: interval,
        size,
        callbackLimitMs: 5000,
      });
    },
  };
}
