import { FastifyInstance } from "fastify";

const callbackStatus = { accepted: "accepted", rejected: "rejected" };

export async function workwork(app: FastifyInstance, id: string) {
  // Flytta ut och ta config som param
  const { interval, size } = await app.pg.pool
    .query<{ interval: number; size: number }>(
      `
  select 
    base_interval_ms as interval,
    select_size as size
  from config
  `,
    )
    .then((res) => res.rows.at(0) || { size: 200, interval: 60 * 1000 });

  return {
    start() {
      setInterval(async () => {
        try {
          console.log(
            id,
            "  -- vi tar en titt i databasen",
            new Date().toISOString(),
          );
          // for update skip locked will prevent deadlocks. Alebeit slower than a specific queue impleem
          const events = await app.pg.pool
            .query<{ id: string; webhookUrl: string; webhookAuth: string }>(
              `
                with selection as (
                  select id from scheduled_events 
                  where event_status = 'pending' and execute_at <= now()
                  for update skip locked
                  limit $1
                )
                update scheduled_events set event_status = 'handling'
                where id in (select id from selection)
                returning 
                  scheduled_events.id, 
                  scheduled_events.webhook_url as "webhookUrl", 
                  scheduled_events.webhoob_auth as "webhookAuth"
              
            `,
              [size],
            )
            .then((res) => res.rows);

          if (events.length) {
            console.log("Hittade ", JSON.stringify(events, null, 4));

            try {
              const eventsWithFetch = events.map((event) => ({
                id: event.id,
                fetch: fetch(event.webhookUrl, {
                  method: "POST",
                  headers: { "x-user-id": event.webhookAuth },
                }),
              }));

              // Associate success of fail callback with event id
              const results = await Promise.allSettled(
                eventsWithFetch.map((event) =>
                  event.fetch.then(
                    () => ({
                      fetchStatus: callbackStatus.accepted,
                      id: event.id,
                    }),
                    () => ({
                      fetchStatus: callbackStatus.rejected,
                      id: event.id,
                    }),
                  ),
                ),
              );

              const logValues: string[] = [];
              const logArgs: string[] = [];

              const updateValues: string[] = [];

              let logIndex = 0;

              console.log(results);

              for (const res of results) {
                // Since all fetch results are regarded as resolved, we check the custom fetch status value instead
                if (res.status === "fulfilled") {
                  if (res.value.fetchStatus === callbackStatus.accepted) {
                    // Success, update status to successful and insert the happy log code
                    logValues.push(res.value.id, "200");
                    updateValues.push(`('${res.value.id}', '200', 0)`);
                  } else {
                    // Actual rejection, update status back to pending and retries += 1, add unhappy log
                    logValues.push(res.value.id, "400");
                    updateValues.push(`('${res.value.id}', '400', 1)`);
                  }
                  logArgs.push(`($${++logIndex}, $${++logIndex})`);
                }
              }

              app.pg.pool.query(
                ` with logs as(
                    insert into event_logs(event_id, status_code)
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
      }, interval);
    },
  };
}
