import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import { executeJob } from "../../services/messages/messages";
export const prefix = "/jobs";

export default async function jobs(app: FastifyInstance) {
  app.post<{ Params: { id: string }; Body: { token: string } }>(
    "/:id",
    {
      schema: {
        description: "Executes the requested job",
        tags: ["Jobs"],
        body: Type.Object({
          token: Type.String({
            description:
              "The security token used to ensure you are allowed to execute this job",
          }),
        }),
        response: {
          202: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function jobHandler(request, reply) {
      await executeJob({
        pg: app.pg,
        logger: request.log,
        jobId: request.params!.id,
        token: request.body.token,
      });

      reply.statusCode = 202;
    },
  );
}
