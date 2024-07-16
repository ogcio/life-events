import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { CreateProviderDO, ProviderDO, UpdateProviderDO } from "./types";

export class ProvidersRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getProviderById(
    providerId: string,
    organizationId: string,
  ): Promise<QueryResult<ProviderDO>> {
    return this.pg.query(
      `
            SELECT
              provider_id as id,
              provider_name as name,
              provider_type as type,
              provider_data as data,
              status
            FROM payment_providers
            WHERE provider_id = $1
            AND organization_id = $2`,
      [providerId, organizationId],
    );
  }

  updateProvider(
    providerId: string,
    provider: UpdateProviderDO,
    organizationId: string,
  ): Promise<QueryResult> {
    return this.pg.query(
      `
            UPDATE payment_providers
            SET provider_name = $1,
                provider_data = $2,
                status = $3
            WHERE provider_id = $4
            AND organization_id = $5`,
      [
        provider.name,
        provider.data,
        provider.status,
        providerId,
        organizationId,
      ],
    );
  }

  getProvidersList(organizationId: string): Promise<QueryResult<ProviderDO>> {
    return this.pg.query(
      `
        SELECT
          provider_id as id,
          provider_name as name,
          provider_type as type,
          provider_data as data,
          status
        FROM payment_providers
        WHERE organization_id = $1
      `,
      [organizationId],
    );
  }

  createProvider(
    provider: CreateProviderDO,
    userId: string,
    organizationId: string,
  ): Promise<QueryResult<{ id: string }>> {
    return this.pg.query(
      `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data, organization_id)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING provider_id as id
      `,
      [
        userId,
        provider.name,
        provider.type,
        "connected",
        provider.data,
        organizationId,
      ],
    );
  }
}
