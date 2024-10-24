import nodemailer from "nodemailer";
import { PoolClient } from "pg";

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
  getPrimaryProvider(
    organisationId: string,
  ): Promise<EmailProvider | undefined>;
  sendMail(params: SendMailParams): Promise<void>;
  getFirstOrEtherealMailProvider(): Promise<string>;
}

export function mailService(client: PoolClient): MailService {
  return {
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
      WHERE organisation_id = $1 and is_primary and deleted_at is null
      `,
        [organisationId],
      );

      return providerQueryResult.rows.at(0);
    },
    async sendMail(params: SendMailParams): Promise<void> {
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

      await transporter.sendMail({
        from: `${name} <${fromAddress}>`,
        to: params.email,
        subject: params.subject,
        html: params.body,
      });
    },

    // Temporary demonstrational util functions
    async getFirstOrEtherealMailProvider() {
      const id = await client
        .query<{ id: string }>(
          `
          select 
            id 
          from email_providers 
          WHERE deleted_at is null
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
