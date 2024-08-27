import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { PaginationParams } from "../../../types/pagination";
import { CitizenTransactionDO } from "./types";

export class CitizenRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getTransactions(
    userId: string,
    pagination: PaginationParams,
  ): Promise<QueryResult<CitizenTransactionDO[]>> {
    return this.pg.query(
      `SELECT
          t.transaction_id as "transactionId",
          t.status,
          pr.title,
          t.amount,
          t.ext_payment_id as "extPaymentId",
          t.updated_at as "updatedAt"
        FROM payment_transactions t
        INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
        WHERE t.user_id = $1
        ORDER BY t.updated_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, pagination.limit, pagination.offset],
    );
  }

  getTransactionsTotalCount(
    userId: string,
  ): Promise<QueryResult<{ totalCount: number }>> {
    return this.pg.query(
      `SELECT
          count(*) as "totalCount"
        FROM payment_transactions t
        INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
        WHERE t.user_id = $1`,
      [userId],
    );
  }
}
