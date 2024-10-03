import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateUser,
  CreateUserSchema,
  FindUserParams,
  FindUserParamsSchema,
  FoundUser,
  FoundUserSchema,
  ParamsWithUserId,
  ParamsWithUserIdSchema,
  PatchUser,
  PatchUserSchema,
  UpdateUser,
  UpdateUserSchema,
  UserDetails,
  UserDetailsSchema,
} from "../../types/schemaDefinitions";
import { Type } from "@sinclair/typebox";
import { findUser, getUser } from "../../services/users/find-user";
import { createUser } from "../../services/users/create-user";
import { getErrorMessage } from "@ogcio/shared-errors";
import { isNativeError } from "util/types";
import { Permissions } from "../../types/permissions";
import { ensureUserCanAccessUser } from "api-auth";

const USER_TAGS = ["Users"];

export default async function users(app: FastifyInstance) {
  app.get<{ Reply: UserDetails | Error; Params: ParamsWithUserId }>(
    "/:userId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.UserSelf.Read, Permissions.User.Read],
          { method: "OR" },
        ),
      schema: {
        params: ParamsWithUserIdSchema,
        tags: USER_TAGS,
        response: {
          200: UserDetailsSchema,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request) => {
      ensureUserCanAccessUser(request.userData, request.params.userId);

      return getUser({
        pool: app.pg.pool,
        id: request.params.userId,
      });
    },
  );

  /* Only firstname, lastname and email are required to create a user right now because 
 those are the only fields we always have access to via the current auth session -
 to be revised when we integrate with GOV ID
 */
  app.post<{ Body: CreateUser; Reply: { id: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.User.Write], {
          method: "OR",
        }),
      schema: {
        tags: USER_TAGS,
        body: CreateUserSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      try {
        reply.send(
          await createUser({
            pool: app.pg.pool,
            createUserData: request.body,
            userId: request.userData!.userId,
          }),
        );
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );

  app.put<{ Body: UpdateUser; Params: ParamsWithUserId }>(
    "/:userId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.UserSelf.Write, Permissions.User.Write],
          { method: "OR" },
        ),
      schema: {
        tags: USER_TAGS,
        params: ParamsWithUserIdSchema,
        body: UpdateUserSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      ensureUserCanAccessUser(request.userData, request.params.userId);
      let result;

      const columnsMapping: Record<keyof UpdateUser, string> = {
        firstname: "firstname",
        lastname: "lastname",
        email: "email",
        title: "title",
        dateOfBirth: "date_of_birth",
        ppsn: "ppsn",
        ppsnVisible: "ppsn_visible",
        gender: "gender",
        phone: "phone",
        consentToPrefillData: "consent_to_prefill_data",
        preferredLanguage: "preferred_language",
      };

      const values = [request.params.userId, ...Object.values(request.body)];
      const setClauses = Object.keys(request.body)
        .map(
          (key, index) =>
            `${columnsMapping[key as keyof typeof columnsMapping]} = $${index + 2}`,
        )
        .join(", ");

      try {
        result = await app.pg.query(
          `
            UPDATE user_details
            SET ${setClauses}, updated_at = now()
            WHERE user_id = $1
            RETURNING user_id as id
          `,
          values,
        );
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }

      if (!result?.rows.length) {
        throw app.httpErrors.notFound("User not found");
      }

      reply.send({ id: result.rows[0].id });
    },
  );

  app.patch<{ Body: PatchUser; Params: ParamsWithUserId }>(
    "/:userId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.UserSelf.Write, Permissions.User.Write],
          { method: "OR" },
        ),
      schema: {
        tags: USER_TAGS,
        body: PatchUserSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      ensureUserCanAccessUser(request.userData, request.params.userId);
      let result;

      const columnsMapping: Record<keyof PatchUser, string> = {
        ppsnVisible: "ppsn_visible",
        consentToPrefillData: "consent_to_prefill_data",
        preferredLanguage: "preferred_language",
      };

      const values = [request.params.userId, ...Object.values(request.body)];
      const setClauses = Object.keys(request.body)
        .map(
          (key, index) =>
            `${columnsMapping[key as keyof typeof columnsMapping]} = $${index + 2}`,
        )
        .join(", ");

      try {
        result = await app.pg.query(
          `
            UPDATE user_details
            SET ${setClauses}, updated_at = now()
            WHERE user_id = $1
            RETURNING user_id as id
          `,
          values,
        );
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }

      if (!result?.rows.length) {
        throw app.httpErrors.notFound("User not found");
      }

      reply.send({ id: result.rows[0].id });
    },
  );

  app.get<{ Reply: FoundUser | null; Querystring: FindUserParams }>(
    "/find",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.User.Read], {
          method: "OR",
        }),
      schema: {
        tags: USER_TAGS,
        querystring: FindUserParamsSchema,
        response: {
          200: FoundUserSchema,
          404: Type.Null(),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const foundUser = await findUser({
        pool: app.pg.pool,
        findUserParams: request.query,
      });

      if (foundUser) {
        reply.send(foundUser);
        return;
      }

      throw app.httpErrors.notFound("User not found");
    },
  );

  /**
   * Gets user general details. Add more fields as needed
   * todo: change to :id/details ?
   * todo: add ppsn
   */
  app.post<{ Body: { ids: string[] } }>(
    "/select",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.UserSelf.Read, Permissions.User.Read],
          { method: "OR" },
        ),
      schema: {
        tags: USER_TAGS,
        body: Type.Object({
          ids: Type.Array(Type.String()),
        }),
        response: {
          200: Type.Object({
            data: Type.Array(
              Type.Object({
                id: Type.String(),
                firstName: Type.String(),
                lastName: Type.String(),
                ppsn: Type.String(),
                email: Type.Optional(Type.String({ format: "email" })),
                phone: Type.Optional(Type.String()),
                preferredLanguage: Type.String(),
              }),
            ),
          }),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handler(request) {
      const ids = request.body.ids;
      type User = {
        id: string;
        firstName: string;
        lastName: string;
        ppsn: string;
        email: string;
        phone: string;
      };
      const users: User[] = [];
      try {
        const usersQueryResult = await app.pg.pool.query<User>(
          `
        select 
          user_id as "id", 
          firstname as "firstName", 
          lastname as "lastName", 
          ppsn,
          phone,
          email,
          preferred_language as "preferredLanguage"
        from user_details
        where user_id::text = any ($1)
      `,
          [ids],
        );

        users.push(...usersQueryResult.rows);
      } catch (err) {
        throw app.httpErrors.internalServerError(
          isNativeError(err) ? err.message : "failed to select users",
        );
      }

      if (!users.length) {
        throw app.httpErrors.notFound("User not found");
      }

      return { data: users };
    },
  );
}
