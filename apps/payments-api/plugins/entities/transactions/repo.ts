import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import {
  CreateTransactionBodyDO,
  TransactionDetailsDO,
  TransactionDO,
} from "./types";
import { TransactionStatusesEnum } from ".";
import { PaginationParams } from "../../../types/pagination";

export class TransactionsRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getTransactionById(
    transactionId: string,
    userId?: string,
  ): Promise<QueryResult<TransactionDetailsDO>> {
    const params = [transactionId];

    if (userId) {
      params.push(userId);
    }

    return this.pg.query(
      `SELECT
        t.transaction_id as "transactionId",
        t.status,
        t.user_id as "userId",
        t.user_data as "userData",
        pr.title,
        pr.payment_request_id as "paymentRequestId",
        t.ext_payment_id as "extPaymentId",
        t.amount,
        t.updated_at as "updatedAt",
        pp.provider_name as "providerName",
        pp.provider_type as "providerType"
      FROM payment_transactions t
      LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
      JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id
      WHERE t.transaction_id = $1
      ${userId ? "AND t.user_id = $2" : ""}`,
      params,
    );
  }

  updateTransactionStatus(
    transactionId: string,
    status: TransactionStatusesEnum,
  ): Promise<QueryResult<{ transactionId: string }>> {
    return this.pg.query(
      `UPDATE payment_transactions
        SET status = $2, updated_at = now()
        WHERE transaction_id = $1
        RETURNING transaction_id as "transactionId"`,
      [transactionId, status],
    );
  }

  getTransactions(
    userId: string,
    pagination: PaginationParams,
  ): Promise<QueryResult<TransactionDetailsDO>> {
    return this.pg.query(
      `SELECT
        t.transaction_id as "transactionId",
        t.status,
        t.user_id as "userId",
        t.user_data as "userData",
        pr.title,
        pr.payment_request_id as "paymentRequestId",
        t.ext_payment_id as "extPaymentId",
        t.amount,
        t.updated_at as "updatedAt",
        pp.provider_name as "providerName",
        pp.provider_type as "providerType"
      FROM payment_transactions t
      INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id AND pr.user_id = $1
      INNER JOIN payment_transactions pt ON pt.transaction_id = t.transaction_id
      JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id
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
      INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id AND pr.user_id = $1
      INNER JOIN payment_transactions pt ON pt.transaction_id = t.transaction_id
      JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id`,
      [userId],
    );
  }

  createTransaction(
    userId: string,
    transaction: CreateTransactionBodyDO,
  ): Promise<QueryResult<{ transactionId: string }>> {
    return this.pg.query(
      `INSERT INTO payment_transactions
        (payment_request_id, ext_payment_id, integration_reference, amount, status, created_at, updated_at, payment_provider_id, user_id, user_data)
        VALUES ($1, $2, $3, $4, $5, now(), now(), $6, $7, $8)
        RETURNING transaction_id as "transactionId";
      `,
      [
        transaction.paymentRequestId,
        transaction.extPaymentId,
        transaction.integrationReference,
        transaction.amount,
        TransactionStatusesEnum.Initiated,
        transaction.paymentProviderId,
        userId,
        transaction.userData,
      ],
    );
  }

  generatePaymentIntentId(
    length: number,
  ): Promise<QueryResult<{ intentId: string }>> {
    return this.pg.query(
      `SELECT "intentId" FROM UPPER(LEFT(md5(random()::text), $1)) AS "intentId"
        WHERE "intentId" NOT IN (
          SELECT ext_payment_id 
          FROM payment_transactions
        )`,
      [length],
    );
  }
}
