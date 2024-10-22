import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import {
  UserPerOrganisation,
  UserPerOrganisationSchema,
} from "../../types/usersSchemaDefinitions.js";
import {
  GenericResponse,
  PaginationParams,
  PaginationParamsSchema,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions.js";
import { getUser, getUsers } from "../../services/users/users.js";
import {
  formatAPIResponse,
  sanitizePagination,
} from "../../utils/pagination.js";
import { Permissions } from "../../types/permissions.js";
import { ensureUserIsOrganisationMember } from "../../utils/error-utils.js";
import {
  ensureOrganizationIdIsSet,
  getProfileSdk,
} from "../../utils/authentication-factory.js";

const tags = ["Users"];

export default async function users(app: FastifyInstance) {
  interface GetUsersSchema {
    Querystring: {
      organisationId?: string;
      search?: string;
      transports?: string;
      importId?: string;
      activeOnly?: string;
    } & PaginationParams;
    Response: GenericResponse<UserPerOrganisation[]>;
  }

  interface GetUserSchema {
    Params: {
      userId: string;
    };
    Querystring: {
      activeOnly?: string;
    };
    Response: GenericResponse<UserPerOrganisation>;
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
              search: Type.Optional(
                Type.String({
                  description:
                    "If set, the endpoint searches for users whom contain this value in either the name, the surname, or the email address",
                }),
              ),
              transports: Type.Optional(
                Type.String({
                  description:
                    "If set, it must contain a list of transports divided by ',' and the endpoint searches for users whom have selected at least one of them as preferred for the organisation",
                }),
              ),
              importId: Type.Optional(
                Type.String({
                  description:
                    "If set, the endpoint returns the users whom have imported by that specific batch",
                }),
              ),
              activeOnly: Type.Optional(
                Type.String({
                  description:
                    "If true, the endpoint returns active only users",
                  pattern: "^true|false$",
                }),
              ),
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
      const pagination = sanitizePagination(query);
      const params = {
        pool: app.pg.pool,
        organisationId: ensureOrganizationIdIsSet(request),
        search: query.search,
        pagination,
        importId: query.importId,
        transports: query.transports ? query.transports.trim().split(",") : [],
        activeOnly: parseActiveOnlyParam(query.activeOnly),
      };
      const recipientsResponse = await getUsers(params);

      return formatAPIResponse({
        data: recipientsResponse.recipients,
        request,
        totalCount: recipientsResponse.total,
      });
    },
  );

  app.get<GetUserSchema>(
    "/:userId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Citizen.Read]),
      schema: {
        description: "Returns the requested user",
        querystring: Type.Optional(
          Type.Object({
            activeOnly: Type.Optional(
              Type.String({
                description: "If true, the endpoint returns active only users",
                pattern: "^true|false$",
              }),
            ),
          }),
        ),
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
      const organisationId = ensureUserIsOrganisationMember(request.userData);
      const userId = request.params.userId;
      const user = await getUser({
        pool: app.pg.pool,
        organisationId,
        userId,
        activeOnly: parseActiveOnlyParam(request.query.activeOnly),
      });

      if (user.userProfileId) {
        // organizationId is optional here, so is right
        // to have it set or not based on the fact
        // that a user is a public servant or not
        const profileSdk = await getProfileSdk(
          request.userData?.organizationId,
        );
        const { data, error } = await profileSdk.selectUsers([
          user.userProfileId,
        ]);

        if (error) {
          throw error;
        }

        const profile = data?.at(0);
        if (!profile) {
          throw app.httpErrors.notFound("profile user not found");
        }

        user.firstName = profile.firstName;
        user.lastName = profile.lastName;
        user.emailAddress = profile.email || null;
        user.phoneNumber = profile.phone || null;
      }

      return { data: user };
    },
  );

  const parseActiveOnlyParam = (activeOnly?: string): boolean =>
    activeOnly !== "false";
}
