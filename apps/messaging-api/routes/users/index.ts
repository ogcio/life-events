import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  UserPerOrganisation,
  UserPerOrganisationSchema,
} from "../../types/usersSchemaDefinitions";
import {
  GenericResponse,
  PaginationParams,
  PaginationParamsSchema,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions";
import { getUser, getUsers } from "../../services/users/users";
import {
  PaginationDetails,
  formatAPIResponse,
  sanitizePagination,
} from "../../utils/pagination";
import { Permissions } from "../../types/permissions";
import { NotFoundError } from "shared-errors";
import { Profile } from "building-blocks-sdk";
import { ensureUserIsOrganisationMember } from "../../utils/error-utils";

const tags = ["Users"];

export default async function users(app: FastifyInstance) {
  interface GetUsersSchema {
    Querystring: {
      organisationId?: string;
      search?: string;
      transports?: string;
      importId?: string;
      activeOnly?: boolean;
    } & PaginationParams;
    Response: GenericResponse<UserPerOrganisation[]>;
  }

  interface GetUserSchema {
    Params: {
      userId: string;
    };
    Querystring: {
      activeOnly?: boolean;
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
              organisationId: Type.Optional(Type.String()),
              search: Type.Optional(Type.String()),
              transports: Type.Optional(Type.String()),
              importId: Type.Optional(Type.String()),
              activeOnly: Type.Optional(Type.Boolean()),
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
      const recipientsResponse = await getUsers({
        pool: app.pg.pool,
        organisationId: request.userData!.organizationId!,
        search: query.search,
        pagination,
        importId: query.importId,
        transports: query.transports ? query.transports.trim().split(",") : [],
      });

      const paginationDetails: PaginationDetails = {
        ...pagination,
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
        querystring: Type.Optional(
          Type.Object({
            activeOnly: Type.Optional(Type.Boolean()),
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
      const errorProcess = "GET_USER";
      const organisationId = ensureUserIsOrganisationMember(
        request.userData,
        errorProcess,
      );
      const userId = request.params.userId;
      const user = await getUser({
        pool: app.pg.pool,
        organisationId,
        userId,
        activeOnly:
          typeof request.query.activeOnly === "undefined"
            ? true
            : request.query.activeOnly,
      });

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
