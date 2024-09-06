import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors.js";
import { Static, Type } from "@sinclair/typebox";
import { ServerError } from "shared-errors";

type RequestBody = {
  executeAt: string;
  webhookUrl: string;
  webhookAuth: string;
}[];

const SCHEDULE_TASK = "SCHEDULE_TASK";

export default async function tasks(app: FastifyInstance) {
  app.post<{ Body: RequestBody }>(
    "/",
    {
      schema: {
        body: Type.Array(
          Type.Object({
            webhookUrl: Type.String({ format: "uri" }),
            webhookAuth: Type.String(),
            executeAt: Type.String({ format: "date-time" }),
          }),
        ),
        tags: ["Tasks"],
        response: {
          202: Type.Null(),
          500: HttpError,
        },
      },
    },
    async function handleScheduleTasks(request, reply) {
      try {
        const values: string[] = [];
        const args: string[] = [];
        let i = 0;
        for (const set of request.body) {
          values.push(set.webhookUrl, set.webhookAuth, set.executeAt);
          args.push(`($${++i}, $${++i}, $${++i})`);
        }

        await app.pg.pool.query(
          `
            insert into scheduled_events(
                webhook_url, webhook_auth, execute_at
            ) values ${args.join(", ")}
        `,
          values,
        );
      } catch (err) {
        return new ServerError(SCHEDULE_TASK, "failed to parse request", err);
      }
      return reply.status(202);
    },
  );
}
