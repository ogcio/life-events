import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  AddressesList,
  CreateAddress,
  Address,
  ParamsWithAddressId,
  UpdateAddress,
} from "../../types/schemaDefinitions";

export default async function addresses(app: FastifyInstance) {
  app.get<{ Reply: AddressesList }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
        response: {
          200: AddressesList,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      try {
        const result = await app.pg.query(
          `SELECT address_id, address_line1, address_line2, town, county, eirecode, move_in_date, move_out_date, updated_at FROM user_addresses WHERE user_id = $1`,
          [userId],
        );

        reply.send(result.rows);
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );

  app.post<{ Body: CreateAddress; Reply: { id: string } }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
        body: CreateAddress,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const {
        address_line1,
        address_line2,
        town,
        county,
        eirecode,
        move_in_date,
        move_out_date,
      } = request.body;

      try {
        const result = await app.pg.query(
          `
            INSERT INTO user_addresses (user_id, address_line1, address_line2, town, county, eirecode, move_in_date, move_out_date)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING address_id as id
        `,
          [
            userId,
            address_line1,
            address_line2,
            town,
            county,
            eirecode,
            move_in_date,
            move_out_date,
          ],
        );

        reply.send({ id: result.rows[0].id });
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );

  app.get<{ Reply: Address | Error; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
        response: {
          200: Address,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { addressId } = request.params;

      let result;
      try {
        result = await app.pg.query(
          `SELECT address_id, address_line1, address_line2, town, county, eirecode, move_in_date, move_out_date, updated_at FROM user_addresses WHERE user_id = $1 AND address_id = $2`,
          [userId, addressId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!result?.rows.length) {
        throw app.httpErrors.notFound("The requested address was not found");
      }

      reply.send(result.rows[0]);
    },
  );

  app.put<{ Body: UpdateAddress; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
        body: UpdateAddress,
        response: {
          200: Type.Object({}),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { addressId } = request.params;
      const {
        address_line1,
        address_line2,
        town,
        county,
        eirecode,
        move_in_date,
        move_out_date,
      } = request.body;

      try {
        const result = await app.pg.query(
          `
        UPDATE user_addresses
        SET address_line1 = $3, address_line2 = $4, town = $5, county = $6, eirecode = $7, move_in_date = $8, move_out_date = $9, updated_at = now()
        WHERE user_id = $1 AND address_id = $2
        RETURNING  address_id as id
    `,
          [
            userId,
            addressId,
            address_line1,
            address_line2,
            town,
            county,
            eirecode,
            move_in_date,
            move_out_date,
          ],
        );

        if (!result?.rows.length) {
          const error = app.httpErrors.notFound("The address was not found");
          error.statusCode = 404;
          error.code = "NOT_FOUND";

          throw error;
        }

        reply.send();
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );

  app.delete<{ Reply: {} | Error; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
        response: {
          200: Type.Object({}),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { addressId } = request.params;

      let result;
      try {
        result = await app.pg.query(
          ` DELETE FROM user_addresses
            WHERE user_id = $1 AND address_id = $2
            RETURNING address_id as id
          `,
          [userId, addressId],
        );
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }

      if (!result?.rows.length) {
        const error = app.httpErrors.notFound("The address was not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";

        throw error;
      }

      reply.send();
    },
  );
}
