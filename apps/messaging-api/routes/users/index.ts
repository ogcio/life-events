import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  User,
  UserPerOrganisationSchema,
} from "../../types/usersSchemaDefinitions";
import {
  GenericResponse,
  PaginationParams,
  PaginationParamsSchema,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions";
import { getUsers } from "../../services/users/users";
import {
  PaginationDetails,
  formatAPIResponse,
  sanitizePagination,
} from "../../utils/pagination";
import { Permissions } from "../../types/permissions";
import { NotFoundError, ServerError } from "shared-errors";
import { Profile } from "building-blocks-sdk";

const tags = ["Users"];

export default async function users(app: FastifyInstance) {
  interface GetUsersSchema {
    Querystring: {
      organisationId?: string;
      search?: string;
      transports?: string;
      importId?: string;
    } & PaginationParams;
    Response: GenericResponse<User>;
  }

  interface GetUserSchema {
    Params: {
      userId: string;
    };
    Response: GenericResponse<User>;
  }

  app.get<GetUsersSchema>(
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
              importId: Type.Optional(Type.String()),
            }),
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(Type.Array(UserPerOrganisationSchema)),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async (request: FastifyRequest<GetUsersSchema>, _reply: FastifyReply) => {
      const query = request.query;
      const recipientsResponse = await getUsers({
        pool: app.pg.pool,
        organisationId: request.userData!.organizationId!,
        search: query.search,
        pagination: {
          limit: query.limit,
          offset: query.offset,
        },
        //TODO Here manage filter per importId
        transports: query.transports ? query.transports.trim().split(",") : [],
      });

      const paginationDetails: PaginationDetails = {
        ...sanitizePagination(query),
        totalCount: recipientsResponse.total,
        url: request.url,
      };

      return formatAPIResponse(
        recipientsResponse.recipients,
        paginationDetails,
      );
    },
  );

  app.get<GetUserSchema>(
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
          200: getGenericResponseSchema(UserPerOrganisationSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function (request) {
      const errorProcess = "GET_USER";
      const userId = request.params.userId;
      //TODO IMPLEMENT THIS
      let user: User | undefined;
      try {
        const userQueryResult = await app.pg.pool.query<User>(
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

      user.lang = "en";

      if (user.userProfileId) {
        const profileSdk = new Profile(request.userData!.accessToken);
        const { data, error } = await profileSdk.selectUsers([
          user.userProfileId,
        ]);

        if (error) {
          throw error;
        }

        const profile = data?.at(0);
        if (!profile) {
          throw new NotFoundError(errorProcess, "profile user not found");
        }

        user.firstName = profile.firstName;
        user.lastName = profile.lastName;
        user.emailAddress = profile.email || null;
        user.phoneNumber = profile.phone || null;
      }

      return { data: user };
    },
  );
}
