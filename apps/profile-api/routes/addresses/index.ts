import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  AddressesList,
  AddressesListSchema,
  CreateAddress,
  CreateAddressSchema,
  Address,
  AddressSchema,
  GenericResponse,
  ParamsWithAddressId,
  ParamsWithAddressIdSchema,
  UpdateAddress,
  UpdateAddressSchema,
  PatchAddress,
  PatchAddressSchema,
  getGenericResponseSchema,
} from "../../types/schemaDefinitions";
import { getErrorMessage } from "@ogcio/shared-errors";
import { Permissions } from "../../types/permissions";
import {
  formatAPIListResponse,
  formatAPIResponse,
} from "../../types/pagination";

const ADDRESSES_TAGS = ["Addresses"];

export default async function addresses(app: FastifyInstance) {
  app.get<{ Reply: GenericResponse<AddressesList> }>(
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
          200: getGenericResponseSchema(AddressesListSchema),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      try {
        const result = await app.pg.query<Address>(
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

        reply.send(
          formatAPIListResponse({
            data: result.rows,
            totalCount: result.rowCount ?? 0,
            request,
          }),
        );
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );

  app.post<{
    Body: CreateAddress;
    Reply: GenericResponse<{ id: string }>;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Address.Write], {
          method: "OR",
        }),
      schema: {
        tags: ADDRESSES_TAGS,
        body: CreateAddressSchema,
        response: {
          200: getGenericResponseSchema(
            Type.Object({
              id: Type.String(),
            }),
          ),
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
        const result = await app.pg.query<{ id: string }>(
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

        reply.send(formatAPIResponse({ id: result.rows[0].id }));
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );

  app.get<{
    Reply: GenericResponse<Address>;
    Params: ParamsWithAddressId;
  }>(
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
          200: getGenericResponseSchema(AddressSchema),
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
        result = await app.pg.query<Address>(
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
        throw app.httpErrors.notFound("Address not found");
      }

      reply.send(formatAPIResponse(result.rows[0]));
    },
  );

  app.put<{
    Body: UpdateAddress;
    Params: ParamsWithAddressId;
    Reply: GenericResponse<{ id: string }>;
  }>(
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
          200: getGenericResponseSchema(
            Type.Object({
              id: Type.String(),
            }),
          ),
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
        const result = await app.pg.query<{ id: string }>(
          `
              UPDATE user_addresses
              SET ${setClauses}, updated_at = now()
              WHERE user_id = $1 AND address_id = $2
              RETURNING  address_id as id
            `,
          values,
        );

        if (!result?.rows.length) {
          throw app.httpErrors.notFound("Address not found");
        }

        reply.send(formatAPIResponse({ id: result.rows[0].id }));
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );

  app.patch<{
    Body: PatchAddress;
    Params: ParamsWithAddressId;
    Reply: GenericResponse<{ id: string }>;
  }>(
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
          200: getGenericResponseSchema(
            Type.Object({
              id: Type.String(),
            }),
          ),
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
        const result = await app.pg.query<{ id: string }>(
          `
            UPDATE user_addresses
            SET ${setClauses}, updated_at = now()
            WHERE user_id = $1 AND address_id = $2
            RETURNING  address_id as id
          `,
          values,
        );

        if (!result?.rows.length) {
          throw app.httpErrors.notFound("Address not found");
        }

        reply.send(formatAPIResponse({ id: result.rows[0].id }));
      } catch (error) {
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }
    },
  );

  app.delete<{
    Reply: GenericResponse<{ id: string }>;
    Params: ParamsWithAddressId;
  }>(
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
          200: getGenericResponseSchema(
            Type.Object({
              id: Type.String(),
            }),
          ),
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
        throw app.httpErrors.internalServerError(getErrorMessage(error));
      }

      if (!result?.rows.length) {
        throw app.httpErrors.notFound("Address not found");
      }

      reply.send(formatAPIResponse({ id: result.rows[0].id }));
    },
  );
}
