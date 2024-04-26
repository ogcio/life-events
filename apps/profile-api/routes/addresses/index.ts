import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  AddressesList,
  CreateAddress,
  Address,
  ParamsWithAddressId,
  UpdateAddress,
  PatchAddress,
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
          `SELECT address_id AS "addressId", 
            address_line1 AS "addressLine1", 
            address_line2 AS "addressLine2", 
            town, county, eirecode, 
            move_in_date AS "moveInDate", 
            move_out_date AS "moveOutDate", 
            is_primary AS "isPrimary", 
            ownership_status AS "ownershipStatus", 
            updated_at AS "updatedAt"
            FROM user_addresses WHERE user_id = $1`,
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
        addressLine1,
        addressLine2,
        town,
        county,
        eirecode,
        moveInDate,
        moveOutDate,
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
            addressLine1,
            addressLine2,
            town,
            county,
            eirecode,
            moveInDate,
            moveOutDate,
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
          `SELECT address_id "addressId", 
            address_line1 AS "addressLine1", 
            address_line2 AS "addressLine2", 
            town, county, eirecode, 
            move_in_date AS "moveInDate", 
            move_out_date AS "moveOutDate", 
            is_primary AS "isPrimary", 
            ownership_status AS "ownershipStatus",
            updated_at AS "updatedAt"
           FROM user_addresses WHERE user_id = $1 AND address_id = $2`,
          [userId, addressId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!result?.rows.length) {
        const error = app.httpErrors.notFound("Address not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";

        throw error;
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
      const { addressId } = request.params;

      const columnsMapping: Record<keyof UpdateAddress, string> = {
        addressLine1: "address_line1",
        addressLine2: "address_line2",
        town: "town",
        county: "county",
        eirecode: "eirecode",
        moveInDate: "move_in_date",
        moveOutDate: "move_out_date",
        isPrimary: "is_primary",
        ownershipStatus: "ownership_status",
      };

      const values = [userId, addressId, ...Object.values(request.body)];
      const setClauses = Object.keys(request.body)
        .map(
          (key, index) =>
            `${columnsMapping[key as keyof typeof columnsMapping]} = $${index + 3}`,
        )
        .join(", ");

      try {
        const result = await app.pg.query(
          `
              UPDATE user_addresses
              SET ${setClauses}, updated_at = now()
              WHERE user_id = $1 AND address_id = $2
              RETURNING  address_id as id
            `,
          values,
        );

        if (!result?.rows.length) {
          const error = app.httpErrors.notFound("Address not found");
          error.statusCode = 404;
          error.code = "NOT_FOUND";

          throw error;
        }

        reply.send({ id: result.rows[0].id });
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );

  app.patch<{ Body: PatchAddress; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
        body: PatchAddress,
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
      const { addressId } = request.params;

      const columnsMapping: Record<keyof PatchAddress, string> = {
        isPrimary: "is_primary",
        ownershipStatus: "ownership_status",
      };

      const values = [userId, addressId, ...Object.values(request.body)];
      const setClauses = Object.keys(request.body)
        .map(
          (key, index) =>
            `${columnsMapping[key as keyof typeof columnsMapping]} = $${index + 3}`,
        )
        .join(", ");
      try {
        const result = await app.pg.query(
          `
            UPDATE user_addresses
            SET ${setClauses}, updated_at = now()
            WHERE user_id = $1 AND address_id = $2
            RETURNING  address_id as id
          `,
          values,
        );

        if (!result?.rows.length) {
          const error = app.httpErrors.notFound("Address not found");
          error.statusCode = 404;
          error.code = "NOT_FOUND";

          throw error;
        }

        reply.send({ id: result.rows[0].id });
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
        const error = app.httpErrors.notFound("Address not found");
        error.statusCode = 404;
        error.code = "NOT_FOUND";

        throw error;
      }

      reply.send({ id: result.rows[0].id });
    },
  );
}
