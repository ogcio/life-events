import nodemailer from "nodemailer";
import { PoolClient } from "pg";
import { ServiceError } from "../../utils";
import { ServerError, ValidationError } from "shared-errors";

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
};

export interface SendMailParams {
  providerId: string;
  email: string;
  subject: string;
  body: string;
}

export interface MailService {
  createProvider(
    organisationId: string,
    provider: Omit<EmailProvider, "id">,
  ): Promise<string | undefined>;
  updateProvider(organisationId: string, params: EmailProvider): Promise<void>;
  getProvider(
    organisationId: string,
    providerId: string,
  ): Promise<EmailProvider | undefined>;
  getProviders(organisationId: string): Promise<EmailProvider[]>;
  deleteProvider(organisationId: string, providerId: string): Promise<void>;
  sendMail(
    organisationId: string,
    params: SendMailParams,
  ): Promise<ServiceError | undefined>;
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
          "EMAIL_PROVIDER_ERROR",
          "from address already in use",
          [
            {
              fieldName: "fromAddress",
              message: "alreadyInUse",
            },
          ],
        );
      }

      const insertQueryResult = await client.query<{ id: string }>(
        `
          INSERT INTO email_providers(provider_name, smtp_host, smtp_port, username, pw, from_address, throttle_ms, is_ssl, organisation_id)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING id
          `,
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
        ],
      );

      const id = insertQueryResult.rows.at(0)?.id;

      if (!id) {
        throw new ServerError(
          "EMAIL_PROVIDER_ERROR",
          "failed to create provider",
        );
      }

      return id;
    },
    async updateProvider(organisationId: string, provider: EmailProvider) {
      const duplicationQueryResult = await client.query<{ exists: boolean }>(
        `
        select exists(
          select * from email_providers
          where organisation_id = $1 and lower(from_address) = lower($2)
        )
      `,
        [organisationId, provider.fromAddress],
      );

      if (duplicationQueryResult.rows.at(0)?.exists) {
        throw new ValidationError(
          "EMAIL_PROVIDER_ERROR",
          "from address already in use",
          [
            {
              fieldName: "fromAddress",
              message: "alreadyInUse",
            },
          ],
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
            is_ssl = $8
          WHERE id = $9 and organisation_id = $10
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
          provider.id,
          organisationId,
        ],
      );
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
          is_ssl as "ssl"
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
          is_ssl as "ssl"
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
    async sendMail(
      organisationId: string,
      params: SendMailParams,
    ): Promise<ServiceError | undefined> {
      try {
        const provider = await this.getProvider(
          organisationId,
          params.providerId,
        );

        if (!provider) {
          return {
            critical: false,
            error: {
              ...params,
            },
            msg: `failed to get mail provider for ${params.providerId}`,
          };
        }

        const { host, password, username, port, fromAddress, ssl } = provider;

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

        await transporter.sendMail({
          from: fromAddress,
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
      let id = await client
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

      // if (!id) {
      //   const createProviderMethod = this.createProvider;
      //   const testAccount = await nodemailer.createTestAccount();
      //   id = await createProviderMethod({
      //     name: "Ethreal Email Dev Provider",
      //     host: testAccount.smtp.host,
      //     port: 587,
      //     username: testAccount.user,
      //     password: testAccount.pass,
      //     fromAddress: "",
      //     ssl: false,
      //   });
      // }

      return id ?? "";
    },
  };
}
