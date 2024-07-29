import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import { NotFoundError, ServerError } from "shared-errors";
import {
  AddressesList,
  AddressesListSchema,
  CreateAddress,
  CreateAddressSchema,
  Address,
  AddressSchema,
  ParamsWithAddressId,
  ParamsWithAddressIdSchema,
  UpdateAddress,
  UpdateAddressSchema,
  PatchAddress,
  PatchAddressSchema,
} from "../../types/schemaDefinitions";
import { getErrorMessage } from "../../utils/error-utils";
import { Permissions } from "../../types/permissions";

const ADDRESSES_TAGS = ["Addresses"];
const ERROR_PROCESS = "USER_PROFILE_ADDRESSES";

export default async function addresses(app: FastifyInstance) {
  app.get<{ Reply: AddressesList }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.AddressSelf.Read, Permissions.Address.Read],
          { method: "OR" },
        ),
      schema: {
        tags: ADDRESSES_TAGS,
        response: {
          200: AddressesListSchema,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

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
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }
    },
  );

  app.post<{ Body: CreateAddress; Reply: { id: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.AddressSelf.Write, Permissions.Address.Write],
          { method: "OR" },
        ),
      schema: {
        tags: ADDRESSES_TAGS,
        body: CreateAddressSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
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
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }
    },
  );

  app.get<{ Reply: Address | Error; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.AddressSelf.Read, Permissions.Address.Read],
          { method: "OR" },
        ),
      schema: {
        tags: ADDRESSES_TAGS,
        params: ParamsWithAddressIdSchema,
        response: {
          200: AddressSchema,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
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
        app.log.error({ error: err });
      }

      if (!result?.rows.length) {
        throw new NotFoundError(ERROR_PROCESS, "Address not found");
      }

      reply.send(result.rows[0]);
    },
  );

  app.put<{ Body: UpdateAddress; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.AddressSelf.Write, Permissions.Address.Write],
          { method: "OR" },
        ),
      schema: {
        tags: ADDRESSES_TAGS,
        body: UpdateAddressSchema,
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
      const userId = request.userData?.userId;
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
          throw new NotFoundError(ERROR_PROCESS, "Address not found");
        }

        reply.send({ id: result.rows[0].id });
      } catch (error) {
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }
    },
  );

  app.patch<{ Body: PatchAddress; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.AddressSelf.Write, Permissions.Address.Write],
          { method: "OR" },
        ),
      schema: {
        tags: ADDRESSES_TAGS,
        body: PatchAddressSchema,
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
      const userId = request.userData?.userId;
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
          throw new NotFoundError(ERROR_PROCESS, "Address not found");
        }

        reply.send({ id: result.rows[0].id });
      } catch (error) {
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }
    },
  );

  app.delete<{ Reply: { id: string } | Error; Params: ParamsWithAddressId }>(
    "/:addressId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          [Permissions.AddressSelf.Read, Permissions.Address.Read],
          { method: "OR" },
        ),
      schema: {
        tags: ADDRESSES_TAGS,
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
      const userId = request.userData?.userId;
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
        throw new ServerError(ERROR_PROCESS, getErrorMessage(error));
      }

      if (!result?.rows.length) {
        throw new NotFoundError(ERROR_PROCESS, "Address not found");
      }

      reply.send({ id: result.rows[0].id });
    },
  );
}
