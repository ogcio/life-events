import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import { Recipient, RecipientSchema } from "../../types/usersSchemaDefinitions";
import {
  GenericResponse,
  PaginationParams,
  PaginationParamsSchema,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions";
import { getRecipients } from "../../services/users/recipients/recipients";
import { PaginationDetails, formatAPIResponse } from "../../utils/pagination";
import { Permissions } from "../../types/permissions";
import { NotFoundError, ServerError } from "shared-errors";

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

  interface GetRecipientShema {
    Params: {
      userId: string;
    };
    Response: GenericResponse<Recipient>;
  }

  app.get<GetRecipientsSchema>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              organisationId: Type.Optional(Type.String()),
              search: Type.Optional(Type.String()),
              transports: Type.Optional(Type.String()),
            }),
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(Type.Array(RecipientSchema)),
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
        organisationId: request.userData!.organizationId!,
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

  app.get<GetRecipientShema>(
    "/:userId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        tags,
        params: {
          userId: Type.String(),
        },
        response: {
          200: getGenericResponseSchema(RecipientSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function (request) {
      const errorProcess = "GET_USER";
      const userId = request.params.userId;

      let user: Recipient | undefined;
      try {
        const userQueryResult = await app.pg.pool.query<Recipient>(
          `
              select 
                id,
                user_profile_id as "userProfileId",
                (details ->> 'firstName') as "firstName",  
                (details ->> 'lastName') as "lastName",
                phone as "phoneNumber",
                email as "emailAddress",
                conf.preferred_transports as "preferredTransports",
                (details ->> 'publicIdentityId') as "ppsn"
              from users u
              join organisation_user_configurations conf on conf.user_id = u.id
              where
              invitation_status = 'accepted' 
              and id = $1
              `,
          [userId],
        );

        user = userQueryResult.rows.at(0);
      } catch (err) {
        app.log.error(err);
        throw new ServerError(
          errorProcess,
          "failed to query user from messages.users",
        );
      }

      if (!user) {
        throw new NotFoundError(errorProcess, "user not found");
      }

      // There's no import field for lang?
      user.lang = "en";

      if (user.userProfileId) {
        const profileApiUrl = new URL(
          "/api/v1/user/select",
          process.env.PROFILE_BACKEND_URL,
        );

        try {
          // TODO: Replace this with the profile GET Users/id which should have preferrenses by org sorted out
          const profileResponse = await fetch(profileApiUrl, {
            method: "POST",
            body: JSON.stringify({ ids: [user.userProfileId] }),
            headers: { "Content-Type": "application/json" },
          });
          const profile: {
            firstName: string;
            lastName: string;
            ppsn: string;
            lang: string;
            email: string;
            phone: string;
          } = await profileResponse.json();
          user.firstName = profile.firstName;
          user.lastName = profile.lastName;
          user.emailAddress = profile.email;
          user.phoneNumber = profile.phone;
          user.lang = profile.lang;
        } catch (err) {
          // We don't necessarily need to throw, we can use the messages.user data
          app.log.warn(errorProcess, "failed to get profile user");
        }
      }

      return { data: user };
    },
  );
}
