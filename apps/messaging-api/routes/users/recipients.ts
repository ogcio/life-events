import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import { Recipient, RecipientSchema } from "../../types/usersSchemaDefinitions";
import { getOrganisationIdFromRequest } from "../../utils/request-utils";
import {
  GenericResponse,
  PaginationParams,
  PaginationParamsSchema,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions";
import { getRecipients } from "../../services/users/recipients/recipients";
import { PaginationDetails, formatAPIResponse } from "../../utils/pagination";

const tags = ["Users", "Recipients"];

/*
 * The routes in this file are meant to be used when managing the users
 * as recipients
 */
export default async function recipients(app: FastifyInstance) {
  interface GetRecipientsSchema {
    Querystring: {
      organisationId?: string;
      search?: string;
      transports?: string;
    } & PaginationParams;
    Response: GenericResponse<Recipient>;
  }

  app.get<GetRecipientsSchema>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              organisationId: Type.Optional(Type.String({ format: "uuid" })),
              search: Type.Optional(Type.String()),
              transports: Type.Optional(Type.String()),
            }),
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(RecipientSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<GetRecipientsSchema>,
      _reply: FastifyReply,
    ) => {
      const query = request.query;
      const recipientsResponse = await getRecipients({
        pool: app.pg.pool,
        organisationId: getOrganisationIdFromRequest(request, "GET_RECIPIENTS"),
        search: query.search,
        pagination: {
          limit: query.limit,
          offset: query.offset,
        },
        transports: query.transports ? query.transports.trim().split(",") : [],
      });

      const paginationDetails: PaginationDetails = {
        offset: query.offset,
        limit: query.limit,
        totalCount: recipientsResponse.total,
        url: request.url,
      };

      return formatAPIResponse(
        recipientsResponse.recipients,
        paginationDetails,
      );
    },
  );
}
