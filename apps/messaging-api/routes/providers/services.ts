import { FastifyInstance } from "fastify";
import nodemailer from "nodemailer";

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

export function mailService(app: FastifyInstance) {
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
      return app.pg.pool
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
    async updateProvier(data: EmailProvider) {
      app.pg.pool.query(
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
      return app.pg.pool
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
      return app.pg.pool
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
      await app.pg.pool.query(`delete from email_providers where id = $1`, [
        id,
      ]);
    },
    async sendMails(
      providerId: string,
      recipients: string[],
      subject: string,
      body: string,
    ) {
      try {
        const provider = await this.getProvider(providerId);

        console.log("PROVIDER", JSON.stringify(provider, null, 4));
        if (!provider) {
          return;
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

        return Promise.allSettled(
          recipients.map((email) =>
            transporter.sendMail({
              from: fromAddress, // "noreply@dev.blocks.gov.ie", //username,
              to: email,
              subject: subject,
              html: body,
            }),
          ),
        );
      } catch (err) {
        console.log(err);
      }
    },
    // Temporary demonstrational util functions
    async getFirstOrEtherealMailProvider() {
      let id = await app.pg.pool
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
