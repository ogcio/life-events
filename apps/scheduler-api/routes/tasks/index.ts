import { FastifyInstance } from "fastify";

type RequestBody = {
  executeAt: string;
  webhookUrl: string;
  webhookAuth: string;
}[];

export default async function tasks(app: FastifyInstance) {
  app.post<{ Body: RequestBody }>(
    "/",
    {},
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
                webhook_url, webhoob_auth, execute_at
            ) values ${args.join(", ")}
        `,
        values,
      );
    },
  );
}
