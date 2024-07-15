import nodemailer from "nodemailer";
import { PoolClient } from "pg";
import { ServiceError } from "../../utils";
import { ServerError, ValidationError } from "shared-errors";
import { EMAIL_PROVIDER_ERROR } from "./emails";

export type EmailProvider = {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  throttle?: number;
  fromAddress: string;
  ssl: boolean;
  isPrimary: boolean;
};

export interface SendMailParams {
  // providerId: string;
  provider: EmailProvider;
  email: string;
  subject: string;
  body: string;
}

export interface MailService {
  createProvider(
    organisationId: string,
    provider: Omit<EmailProvider, "id">,
  ): Promise<string>;
  updateProvider(organisationId: string, params: EmailProvider): Promise<void>;
  getPrimaryProvider(
    organisationId: string,
  ): Promise<EmailProvider | undefined>;
  getProvider(
    organisationId: string,
    providerId: string,
  ): Promise<EmailProvider | undefined>;
  getProviders(organisationId: string): Promise<EmailProvider[]>;
  deleteProvider(organisationId: string, providerId: string): Promise<void>;
  sendMail(params: SendMailParams): Promise<ServiceError | undefined>;
  getFirstOrEtherealMailProvider(): Promise<string>;
}

export function mailService(client: PoolClient): MailService {
  return {
    async createProvider(
      organisationId: string,
      {
        host,
        name,
        password,
        port,
        username,
        fromAddress,
        throttle,
        ssl,
        isPrimary,
      }: Omit<EmailProvider, "id">,
    ) {
      const duplicationQueryResult = await client.query<{ exists: boolean }>(
        `
        select exists(
          select * from email_providers
          where organisation_id = $1 and lower(from_address) = lower($2)
        )
      `,
        [organisationId, fromAddress],
      );

      if (duplicationQueryResult.rows.at(0)?.exists) {
        throw new ValidationError(
          EMAIL_PROVIDER_ERROR,
          "from address already in use",
          [
            {
              fieldName: "fromAddress",
              message: "alreadyInUse",
              validationRule: "already-in-use",
            },
          ],
        );
      }

      let id: string | undefined;
      try {
        client.query("begin");
        const isPrimaryConverted = isPrimary || null;

        if (isPrimaryConverted) {
          await client.query(
            `
          update email_providers set is_primary = null
          where organisation_id = $1
          `,
            [organisationId],
          );
        }

        const insertQuery = `
        INSERT INTO email_providers(provider_name, smtp_host, smtp_port, username, pw, from_address, throttle_ms, is_ssl, organisation_id, is_primary)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id
      `;

        const insertQueryResult = await client.query<{ id: string }>(
          insertQuery,
          [
            name,
            host,
            port,
            username,
            password,
            fromAddress,
            throttle,
            ssl,
            organisationId,
            isPrimaryConverted,
          ],
        );

        id = insertQueryResult.rows.at(0)?.id;

        if (!id) {
          throw new ServerError(
            EMAIL_PROVIDER_ERROR,
            "failed to create provider",
          );
        }
        client.query("commit");
      } catch (err) {
        client.query("rollback");
        throw err;
      }

      return id;
    },
    async updateProvider(organisationId: string, provider: EmailProvider) {
      const duplicationQueryResult = await client.query<{ exists: boolean }>(
        `
        select exists(
          select * from email_providers
          where organisation_id = $1 
          and lower(from_address) = lower($2)
          and id != $3
        )
      `,
        [organisationId, provider.fromAddress, provider.id],
      );

      if (duplicationQueryResult.rows.at(0)?.exists) {
        throw new ValidationError(
          EMAIL_PROVIDER_ERROR,
          "from address already in use",
          [
            {
              fieldName: "fromAddress",
              message: "alreadyInUse",
              validationRule: "already-in-use",
            },
          ],
        );
      }

      try {
        client.query("begin");
        const isPrimaryConverted = provider.isPrimary || null;
        if (isPrimaryConverted) {
          await client.query(
            `
          update email_providers set is_primary = null
          where organisation_id = $1
          `,
            [organisationId],
          );
        }

        await client.query(
          `
            UPDATE email_providers set 
              provider_name = $1, 
              smtp_host = $2,
              smtp_port = $3,
              username = $4,
              pw = $5,
              from_address = $6,
              throttle_ms = $7,
              is_ssl = $8,
              is_primary = $9
            WHERE id = $10 and organisation_id = $11
          `,
          [
            provider.name,
            provider.host,
            provider.port,
            provider.username,
            provider.password,
            provider.fromAddress,
            provider.throttle,
            provider.ssl,
            isPrimaryConverted,
            provider.id,
            organisationId,
          ],
        );

        client.query("commit");
      } catch (err) {
        client.query("rollback");
        throw err;
      }
    },
    async getPrimaryProvider(organisationId) {
      const providerQueryResult = await client.query<EmailProvider>(
        `
      select 
        id,
        provider_name as "name", 
        smtp_host as "host", 
        smtp_port as "port", 
        username, pw as "password",
        throttle_ms as "throttle",
        from_address as "fromAddress",
        is_ssl as "ssl",
        COALESCE(is_primary, false) as "isPrimary"
      FROM email_providers
      WHERE organisation_id = $1 and is_primary
      `,
        [organisationId],
      );

      return providerQueryResult.rows.at(0);
    },
    async getProvider(organisationId: string, providerId: string) {
      return client
        .query<EmailProvider>(
          `
        SELECT 
          id,
          provider_name as "name", 
          smtp_host as "host", 
          smtp_port as "port", 
          username, pw as "password",
          throttle_ms as "throttle",
          from_address as "fromAddress",
          is_ssl as "ssl",
          COALESCE(is_primary, false) as "isPrimary"
        FROM email_providers
        WHERE id =$1 and organisation_id = $2
      `,
          [providerId, organisationId],
        )
        .then((res) => res.rows.at(0));
    },
    async getProviders(organisationId: string) {
      const providerResult = await client.query<EmailProvider>(
        `
        SELECT 
          id, 
          provider_name as "name", 
          smtp_host as "host", 
          smtp_port as "port", 
          username, pw as "password",
          throttle_ms as "throttle",
          from_address as "fromAddress",
          is_ssl as "ssl",
          COALESCE(is_primary, false) as "isPrimary"
        FROM email_providers
        WHERE organisation_id = $1
        ORDER BY created_at DESC
      `,
        [organisationId],
      );
      return providerResult.rows;
    },
    async deleteProvider(organisationId: string, providerId: string) {
      await client.query(
        `delete from email_providers where id = $1 and organisation_id = $2`,
        [providerId, organisationId],
      );
    },
    async sendMail(params: SendMailParams): Promise<ServiceError | undefined> {
      try {
        const { host, password, username, port, fromAddress, ssl, name } =
          params.provider;

        const transporter: nodemailer.Transporter = nodemailer.createTransport({
          host,
          port,
          secure: ssl,
          version: "TLSv1_2_method",
          auth: {
            user: username,
            pass: password,
          },
        });

        const sent = await transporter.sendMail({
          from: `${name} <${fromAddress}>`,
          to: params.email,
          subject: params.subject,
          html: params.body,
        });

      } catch (err) {
        return {
          critical: false,
          error: { err, ...params },
          msg: "failed to send email",
        };
      }
    },

    // Temporary demonstrational util functions
    async getFirstOrEtherealMailProvider() {
      const id = await client
        .query<{ id: string }>(
          `
          select 
            id 
          from email_providers 
          order by created_at desc
          limit 1
        `,
          [],
        )
        .then((res) => res.rows.at(0)?.id);
      return id ?? "";
    },
  };
}
