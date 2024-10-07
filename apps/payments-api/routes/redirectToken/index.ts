import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  GenericResponse,
  ParamsWithTransactionId,
  RedirectTokenObject,
} from "../schemas";

import { formatAPIResponse } from "../../utils/responseFormatter";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { authPermissions } from "../../types/authPermissions";
import { createSignedJWT, readOrGenerateKeyPair } from "api-auth";

export default async function redirectToken(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<unknown> | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_SELF_READ]),
      schema: {
        response: {
          200: GenericResponse(RedirectTokenObject),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const { transactionId } = request.params;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const transactionDetails = await app.transactions.getTransactionById(
        transactionId,
        userId,
      );

      const { privateKey } = await readOrGenerateKeyPair("payments-api");
      const jwt = await createSignedJWT(
        {
          userId: userId,
          transactionId: transactionDetails.transactionId,
        },
        privateKey,
        {
          issuer: "payments-api",
        },
      );

      reply.send(formatAPIResponse({ token: jwt }));
    },
  );
}
