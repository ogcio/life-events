import { PostgresDb } from "@fastify/postgres";
import { PaginationParams } from "../../../types/pagination";
import { PoolClient, QueryResult } from "pg";
import {
  CreatePaymentRequestDO,
  EditPaymentRequestDO,
  PaymentRequestDO,
  PaymentRequestDetailsDO,
} from "./types";

export class PaymentRequestRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getTransaction() {
    return this.pg.transact;
  }

  getPaymentRequests(
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<QueryResult<PaymentRequestDO>> {
    return this.pg.query(
      `select pr.title,
        pr.payment_request_id as "paymentRequestId",
        pr.description,
        pr.amount,
        pr.reference,
        pr.status,
        CASE 
            WHEN COUNT(pp.provider_id) > 0 THEN json_agg(json_build_object(
                'userId', pp.user_id,
                'id', pp.provider_id,
                'name', pp.provider_name,
                'type', pp.provider_type,
                'status', pp.status,
                'data', pp.provider_data,
                'createdAt', pp.created_at
            ))
          ELSE '[]'::json
          END as providers
      from payment_requests pr
      left join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id AND ppr.enabled IS TRUE
      left join payment_providers pp on ppr.provider_id = pp.provider_id
      where pr.organization_id = $1
      group by pr.payment_request_id
      ORDER BY pr.created_at DESC
      LIMIT $2 OFFSET $3`,
      [organizationId, pagination.limit, pagination.offset],
    );
  }

  getPaymentRequestsTotalCount(
    organizationId: string,
  ): Promise<QueryResult<{ totalCount: number }>> {
    return this.pg.query(
      `select 
        count(*) as "totalCount"
      from payment_requests pr
      where pr.organization_id = $1`,
      [organizationId],
    );
  }

  getPaymentRequestById(
    requestId: string,
    organizationId: string,
  ): Promise<QueryResult<PaymentRequestDetailsDO>> {
    return this.pg.query(
      `SELECT pr.title,
        pr.payment_request_id as "paymentRequestId",
        pr.description,
        pr.amount,
        pr.status,
        CASE 
          WHEN COUNT(pp.provider_id) > 0 THEN json_agg(json_build_object(
              'userId', pp.user_id,
              'id', pp.provider_id,
              'name', pp.provider_name,
              'type', pp.provider_type,
              'status', pp.status,
              'data', pp.provider_data,
              'createdAt', pp.created_at
          ))
        ELSE '[]'::json
        END as providers,
        pr.reference,
        pr.redirect_url as "redirectUrl",
        pr.allow_amount_override AS "allowAmountOverride",
        pr.allow_custom_amount AS "allowCustomAmount"
      FROM payment_requests pr
      LEFT JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
      LEFT JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
      WHERE pr.payment_request_id = $1
        AND pr.organization_id = $2
      GROUP BY pr.payment_request_id`,
      [requestId, organizationId],
    );
  }

  getPaymentRequestPublicInfo(
    requestId: string,
  ): Promise<QueryResult<PaymentRequestDetailsDO>> {
    return this.pg.query(
      `SELECT pr.title,
        pr.payment_request_id as "paymentRequestId",
        pr.description,
        pr.amount,
        pr.status,
        CASE 
          WHEN COUNT(pp.provider_id) > 0 THEN json_agg(json_build_object(
              'userId', pp.user_id,
              'id', pp.provider_id,
              'name', pp.provider_name,
              'type', pp.provider_type,
              'status', pp.status,
              'data', pp.provider_data,
              'createdAt', pp.created_at
          ))
        ELSE '[]'::json
        END as providers,
        pr.reference,
        pr.redirect_url as "redirectUrl",
        pr.allow_amount_override AS "allowAmountOverride",
        pr.allow_custom_amount AS "allowCustomAmount"
      FROM payment_requests pr
      LEFT JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
      LEFT JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
      WHERE pr.payment_request_id = $1
      GROUP BY pr.payment_request_id`,
      [requestId],
    );
  }

  createPaymentRequest(
    paymentRequest: CreatePaymentRequestDO,
    userId: string,
    organizationId: string,
    client: PoolClient,
  ): Promise<QueryResult<{ payment_request_id: string }>> {
    return client.query(
      `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override, allow_custom_amount, organization_id)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning payment_request_id`,
      [
        userId,
        paymentRequest.title,
        paymentRequest.description,
        paymentRequest.reference,
        paymentRequest.amount,
        paymentRequest.redirectUrl,
        paymentRequest.status,
        paymentRequest.allowAmountOverride,
        paymentRequest.allowCustomAmount,
        organizationId,
      ],
    );
  }

  updatePaymentRequest(
    paymentRequest: EditPaymentRequestDO,
    organizationId: string,
    client: PoolClient,
  ) {
    return client.query(
      `update payment_requests 
        set title = $1, description = $2, reference = $3, amount = $4, redirect_url = $5, allow_amount_override = $6, allow_custom_amount = $7 , status = $8
        where payment_request_id = $9 and organization_id = $10`,
      [
        paymentRequest.title,
        paymentRequest.description,
        paymentRequest.reference,
        paymentRequest.amount,
        paymentRequest.redirectUrl,
        paymentRequest.allowAmountOverride,
        paymentRequest.allowCustomAmount,
        paymentRequest.status,
        paymentRequest.paymentRequestId,
        organizationId,
      ],
    );
  }

  disablePaymentRequestProviderLinkage(
    paymentRequestId: string,
    providers: string[],
    client: PoolClient,
  ) {
    return client.query(
      `update payment_requests_providers set enabled = false
        where payment_request_id = $1 and provider_id = any($2::uuid[])`,
      [paymentRequestId, providers],
    );
  }

  upsertPaymentRequestProviderLinkage(
    paymentRequestId: string,
    providers: string[],
    client: PoolClient,
  ) {
    const sqlData = [paymentRequestId, ...providers];
    const queryValues = providers
      .map((_, index) => {
        return `($${index + 2}, $1, true)`;
      })
      .join(",");

    return client.query(
      `INSERT INTO payment_requests_providers (provider_id, payment_request_id, enabled) 
      VALUES ${queryValues}
      ON CONFLICT (provider_id, payment_request_id) 
      DO UPDATE SET enabled = EXCLUDED.enabled`,
      sqlData,
    );
  }

  linkProvidersToPaymentRequest(
    providers: string[],
    paymentRequestId: string,
    client: PoolClient,
  ): Promise<QueryResult<{ payment_request_id: string }>> {
    const sqlData = [paymentRequestId, ...providers];

    const queryValues = providers
      .map((_, index) => {
        return `($${index + 2}, $1, true)`;
      })
      .join(",");

    return client.query(
      `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
      values ${queryValues} RETURNING payment_request_id`,
      sqlData,
    );
  }

  deletePaymentRequestProviderLinkage(
    paymentRequestId: string,
    client: PoolClient,
  ) {
    return client.query(
      `delete from payment_requests_providers
      where payment_request_id = $1`,
      [paymentRequestId],
    );
  }

  deletePaymentRequest(
    paymentRequestId: string,
    organizationId: string,
    client: PoolClient,
  ) {
    return client.query(
      `delete from payment_requests
      where payment_request_id = $1
        and organization_id = $2
      returning payment_request_id`,
      [paymentRequestId, organizationId],
    );
  }
}
