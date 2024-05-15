import { FastifyInstance } from "fastify";

export default async (app: FastifyInstance) => {
  app.get(
    "/",
    {
      schema: {
        tags: ["Users"],
      },
    },
    async () => {
      const res = await app.pg.query("select * from users");
      return { users: res.rows };
    },
  );
};
