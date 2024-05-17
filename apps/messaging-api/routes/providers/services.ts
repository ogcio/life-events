import nodemailer from "nodemailer";
import { Pool } from "pg";
import { ServiceError } from "../../utils";

export type EmailProvider = {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  throttle?: number;
  fromAddress: string;
};

export interface SendMailParams {
  providerId: string;
  email: string;
  subject: string;
  body: string;
}

export interface MailService {
  createProvider(
    params: Omit<EmailProvider, "id">,
  ): Promise<string | undefined>;
  updateProvider(params: EmailProvider): Promise<void>;
  getProvider(id: string): Promise<EmailProvider | undefined>;
  getProviders(): Promise<EmailProvider[]>;
  deleteProvider(id: string): Promise<void>;
  sendMail(params: SendMailParams): Promise<ServiceError | undefined>;
  getFirstOrEtherealMailProvider(): Promise<string>;
}

export function mailService(pool: Pool): MailService {
  return {
    async createProvider({
      host,
      name,
      password,
      port,
      username,
      fromAddress,
      throttle,
    }: Omit<EmailProvider, "id">) {
      return pool
        .query<{ id: string }>(
          `
        INSERT INTO email_providers(provider_name, smtp_host, smtp_port, username, pw, from_address, throttle_ms)
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING id
      `,
          [name, host, port, username, password, fromAddress, throttle],
        )
        .then((res) => res.rows.at(0)?.id);
    },
    async updateProvider(data: EmailProvider) {
      pool.query(
        `
          UPDATE email_providers set 
            provider_name = $1, 
            smtp_host = $2,
            smtp_port = $3,
            username = $4,
            pw = $5,
            from_address = $6,
            throttle_ms = $7
          WHERE id = $8
        `,
        [
          data.name,
          data.host,
          data.port,
          data.username,
          data.password,
          data.fromAddress,
          data.throttle,
          data.id,
        ],
      );
    },
    async getProvider(id: string) {
      return pool
        .query<EmailProvider>(
          `
        SELECT 
          id,
          provider_name as "name", 
          smtp_host as "host", 
          smtp_port as "port", 
          username, pw as "password",
          throttle_ms as "throttle",
          from_address as "fromAddress"
        FROM email_providers
        WHERE id =$1
      `,
          [id],
        )
        .then((res) => res.rows.at(0));
    },
    async getProviders() {
      return pool
        .query<EmailProvider>(
          `
        SELECT 
          id, 
          provider_name as "name", 
          smtp_host as "host", 
          smtp_port as "port", 
          username, pw as "password",
          throttle_ms as "throttle",
          from_address as "fromAddress"
        FROM email_providers
        ORDER BY created_at DESC
      `,
        )
        .then((res) => res.rows);
    },
    async deleteProvider(id: string) {
      await pool.query(`delete from email_providers where id = $1`, [id]);
    },
    async sendMail(params: SendMailParams): Promise<ServiceError | undefined> {
      try {
        const provider = await this.getProvider(params.providerId);

        if (!provider) {
          return {
            critical: false,
            error: {
              ...params,
            },
            msg: `failed to get mail provider for ${params.providerId}`,
          };
        }

        const { host, password, username, port, fromAddress } = provider;

        const transporter: nodemailer.Transporter = nodemailer.createTransport({
          host,
          port,
          secure: false,
          auth: {
            user: username,
            pass: password,
          },
        });
        await transporter.sendMail({
          from: fromAddress, // "noreply@dev.blocks.gov.ie", //username,
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
      let id = await pool
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

      if (!id) {
        const self = this;
        id = await new Promise((res, rej) => {
          nodemailer.createTestAccount(
            async function handleCreated(err, account) {
              if (err) {
                console.log(err);
                rej(err);
              }

              id = await self.createProvider({
                name: "Ethreal Email Dev Provider",
                host: account.smtp.host,
                port: 587,
                username: account.user,
                password: account.pass,
                fromAddress: "",
              });
              res(id);
            },
          );
        });
      }

      return id ?? "";
    },
  };
}
