import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import { Type } from "@sinclair/typebox";

type RequestBody = {
  executeAt: string;
  webhookUrl: string;
  webhookAuth: string;
}[];

export default async function tasks(app: FastifyInstance) {
  app.post<{ Body: RequestBody }>(
    "/",
    {
      preValidation: app.verifyUser,
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
          202: Type.Void(),
          500: HttpError,
        },
      },
    },
    async function handleScheduleTasks(request, reply) {
      const data = JSON.parse(request.body.toString());

      // Let's insert this thing first off. Any worker will pick it up

      const values: string[] = [];
      const args: string[] = [];
      let i = 0;
      for (const set of data) {
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
    },
  );
}
