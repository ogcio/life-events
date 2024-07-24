import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateUser,
  CreateUserSchema,
  DEFAULT_LANGUAGE,
  FindUserParams,
  FindUserParamsSchema,
  FoundUser,
  FoundUserSchema,
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
import { NotFoundError, ServerError } from "shared-errors";
import { getErrorMessage } from "../../utils/error-utils";
import { isNativeError } from "util/types";

const USER_TAGS = ["user"];
const ERROR_PROCESS = "USER_PROFILE_DETAILS";

export default async function user(app: FastifyInstance) {
  app.get<{ Reply: UserDetails | Error }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: USER_TAGS,
        response: {
          200: UserDetailsSchema,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;

      /**  NOTE: the defaults below are for demo purposes only given we don't have access to real user data yet */
      const defaultData = {
        firstname: "Name",
        lastname: "Surname",
        email: "test@email.com",
        title: "Mr",
        date_of_birth: String(new Date("1990-01-01T00:00:00Z")),
        ppsn: "9876543W",
        ppsn_visible: false,
        gender: "male",
        phone: "01234567891",
        consent_to_prefill_data: false,
        preferred_language: DEFAULT_LANGUAGE,
      };

      const data = await getUser({ pool: app.pg.pool, id: userId });

      const dataWithDefaults = {
        firstName: data.firstName || defaultData.firstname,
        lastName: data.lastName || defaultData.lastname,
        email: data.email || defaultData.email,
        title: data.title || defaultData.title,
        dateOfBirth: data.dateOfBirth || defaultData.date_of_birth,
        ppsn: data.ppsn || defaultData.ppsn,
        ppsnVisible:
          data.ppsnVisible !== undefined
            ? data.ppsnVisible
            : defaultData.ppsn_visible,
        gender: data.gender || defaultData.gender,
        phone: data.phone || defaultData.phone,
        consentToPrefillData:
          data.consentToPrefillData || defaultData.consent_to_prefill_data,
        preferredLanguage:
          data.preferredLanguage || defaultData.preferred_language,
      };

      reply.send(dataWithDefaults);
    },
  );

  /* Only firstname, lastname and email are required to create a user right now because 
 those are the only fields we always have access to via the current auth session -
 to be revised when we integrate with GOV ID
 */
  app.post<{ Body: CreateUser; Reply: { id: string } }>(
    "/",
    {
      preValidation: app.verifyUser,
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
            userId: request.user!.id,
          }),
        );
      } catch (error) {
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }
    },
  );

  app.put<{ Body: UpdateUser }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: USER_TAGS,
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
      const userId = request.user?.id;
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

      const values = [userId, ...Object.values(request.body)];
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
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }

      if (!result?.rows.length) {
        throw new NotFoundError(ERROR_PROCESS, "User not found");
      }

      reply.send({ id: result.rows[0].id });
    },
  );

  app.patch<{ Body: PatchUser }>(
    "/",
    {
      preValidation: app.verifyUser,
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
      const userId = request.user?.id;
      let result;

      const columnsMapping: Record<keyof PatchUser, string> = {
        ppsnVisible: "ppsn_visible",
        consentToPrefillData: "consent_to_prefill_data",
        preferredLanguage: "preferred_language",
      };

      const values = [userId, ...Object.values(request.body)];
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
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }

      if (!result?.rows.length) {
        throw new NotFoundError(ERROR_PROCESS, "User not found");
      }

      reply.send({ id: result.rows[0].id });
    },
  );

  app.get<{ Reply: FoundUser | null; Querystring: FindUserParams }>(
    "/find",
    {
      preValidation: app.verifyUser,
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

      throw new NotFoundError(ERROR_PROCESS, "User not found");
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
          email
        from user_details
        where user_id::text = any ($1)
      `,
          [ids],
        );

        users.push(...usersQueryResult.rows);
      } catch (err) {
        throw new ServerError(
          ERROR_PROCESS,
          isNativeError(err) ? err.message : "failed to select users",
        );
      }

      if (!users.length) {
        throw new NotFoundError(ERROR_PROCESS, "User not found");
      }

      return { data: users };
    },
  );
}
