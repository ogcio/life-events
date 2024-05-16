import { FastifyInstance, FastifyRequest } from "fastify";
import { Type, Static } from "@sinclair/typebox";

const QueryStringSchema = Type.Object({
  sessionId: Type.String(),
});

type QueryString = Static<typeof QueryStringSchema>;

export default async (app: FastifyInstance) => {
  app.get(
    "/validate",
    {
      schema: {
        querystring: QueryStringSchema,
      },
    },
    async (request: FastifyRequest<{ Querystring: QueryString }>) => {
      const { sessionId } = request.query;

      const query = await app.pg.query<
        {
          userId: string;
          publicServant: boolean;
        },
        [string]
      >(
        `
          SELECT
            s.user_id AS "userId",
            u.is_public_servant as "publicServant"
          FROM govid_sessions s
          JOIN users u on u.id = s.user_id
          WHERE s.id=$1`,
        [sessionId],
      );

      if (!query.rowCount) {
        return undefined;
      }

      const [{ userId, publicServant }] = query.rows;
      return { userId, publicServant };
    },
  );
};
