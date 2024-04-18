import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import { UpdateUser, UserDetails } from "../../types/schemaDefinitions";
import { Type } from "@sinclair/typebox";

export default async function entitlements(app: FastifyInstance) {
  app.get<{ Reply: UserDetails | Error }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["UserDetails"],
        response: {
          200: UserDetails,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

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
      };

      let result;
      try {
        result = await app.pg.query(
          `SELECT title, firstName, lastName, date_of_birth, ppsn, ppsn_visible, gender, email, phone FROM user_details WHERE user_id = $1`,
          [userId],
        );

        if (result.rows.length > 0) {
          const data = result.rows[0];

          const dataWithDefaults = {
            firstname: data.firstname || defaultData.firstname,
            lastname: data.lastname || defaultData.lastname,
            email: data.email || defaultData.email,
            title: data.title || defaultData.title,
            date_of_birth: data.date_of_birth || defaultData.date_of_birth,
            ppsn: data.ppsn || defaultData.ppsn,
            ppsn_visible:
              data.ppsn_visible !== undefined
                ? data.ppsn_visible
                : defaultData.ppsn_visible,
            gender: data.gender || defaultData.gender,
            phone: data.phone || defaultData.phone,
          };

          return reply.send(dataWithDefaults);
        }

        //TODO: add 404 for user not found but right now we return a default instead

        return defaultData;
      } catch (err) {
        throw app.log.error((err as Error).message);
      }
    },
  );

  app.put<{ Body: UpdateUser }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["UserDetails"],
        body: UpdateUser,
        response: {
          200: Type.Object({}),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      try {
        const keys = Object.keys(request.body);
        const values = Object.values(request.body);

        const setClause = keys
          .map((key, index) => `${key} = $${index + 1}`)
          .join(", ");

        const result = await app.pg.query(
          `
            UPDATE user_details
            SET ${setClause}, updated_at = now()
            WHERE user_id = $${keys.length + 1}
            RETURNING user_id as id
          `,
          [...values, userId],
        );

        if (!result?.rows.length) {
          throw app.httpErrors.notFound("The user was not found");
        }

        reply.send();
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );
}
