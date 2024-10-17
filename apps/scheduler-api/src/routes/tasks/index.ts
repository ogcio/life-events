import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors.js";
import { Type } from "@sinclair/typebox";
import { Permissions } from "../../types/permissions.js";

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
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Scheduler.Write]),

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
        throw app.httpErrors.createError(500, "failed to parse request", {
          parent: err,
        });
      }

      reply.status(202);
    },
  );
}
