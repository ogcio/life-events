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
    userId: string,
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
            AND user_id = $2`,
      [providerId, userId],
    );
  }

  updateProvider(
    providerId: string,
    provider: UpdateProviderDO,
    userId: string,
  ): Promise<QueryResult> {
    return this.pg.query(
      `
            UPDATE payment_providers
            SET provider_name = $1,
                provider_data = $2,
                status = $3
            WHERE provider_id = $4
            AND user_id = $5`,
      [provider.name, provider.data, provider.status, providerId, userId],
    );
  }

  getProvidersList(userId: string): Promise<QueryResult<ProviderDO>> {
    return this.pg.query(
      `
        SELECT
          provider_id as id,
          provider_name as name,
          provider_type as type,
          provider_data as data,
          status
        FROM payment_providers
        WHERE user_id = $1
      `,
      [userId],
    );
  }

  createProvider(
    provider: CreateProviderDO,
    userId: string,
  ): Promise<QueryResult<{ id: string }>> {
    return this.pg.query(
      `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
      `,
      [userId, provider.name, provider.type, "connected", provider.data],
    );
  }
}
