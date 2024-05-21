import { pgpool } from "./dbConnection";
import { send as twilioSend } from "./strategies/twilio/index";
import nodemailer from "nodemailer";

// In case we need to do it, we can replace this with another provider
// We just need to keep the same SendEmail interface
export const send = twilioSend;

export * from "./types";

export const etherealEmailProviderName = "Ethereal email provider";

type MessageState = {
  organisationId: string;
  threadName: string;
  lang: string;
  securityLevel: string;
  subject: string;
  excerpt: string;
  richText: string;
  plainText: string;
  submittedMetaAt: string; // First step of meta selection such as type, transportation eg.
  submittedContentAt: string;
  confirmedContentAt: string;
  transportations: string[];
  schedule: string;
  userIds: string[];
  confirmedRecipientsAt: string;
  confirmedScheduleAt: string;
  templateMetaId: string;
  templateInterpolations: Record<string, string>;
};

type EmailProvider = {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  throttle?: number;
  fromAddress: string;
};

export const mailApi = {
  async createProvider({
    host,
    name,
    password,
    port,
    username,
    fromAddress,
    throttle,
  }: Omit<EmailProvider, "id">) {
    return pgpool
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
    pgpool.query(
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
  async providers() {
    return pgpool
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
  async provider(id: string) {
    return pgpool
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
  // Need to refer to html template or this is gonna be dull
  // TODO: let's send each mail individually and catch any that fails.
  async sendMails(
    providerId: string,
    recipients: string[],
    subject: string,
    body: string,
  ) {
    try {
      const provider = await mailApi.provider(providerId);

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

      return transporter.sendMail({
        from: fromAddress, // "noreply@dev.blocks.gov.ie", //username,
        to: recipients.join(", "),
        subject: subject,
        html: body,
      });
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  },
};

export const api = {
  // Where would this belong? Get messages as a meta information?
  async getUnreadMessageCount(userId: string) {
    return pgpool
      .query<{ count: number }>(
        `
        SELECT 
          count (*) 
        FROM messages 
        WHERE is_seen = false AND user_id = $1
    `,
        [userId],
      )
      .then((res) => res.rows.at(0)?.count ?? 0);
  },

  // message states are tightly coupled to the next app for messaging.
  async upsertMessageState(
    message: MessageState,
    userId: string,
    stateId?: string,
  ) {
    const args: any[] = [];
    let query = "";

    if (stateId) {
      query = `
      UPDATE message_states SET state = state || $1::jsonb
      WHERE state_id = $2
    `;
      args.push(JSON.stringify(message), stateId);
    } else {
      query = `
      INSERT INTO message_states(user_id, state)
      VALUES($1, $2)
      `;
      args.push(userId, JSON.stringify(message));
    }

    pgpool.query(query, args);
  },

  /**
   * Let's assume that a user can only have one active message state at the time for simplicity
   */
  async getMessageState(userId: string) {
    return pgpool
      .query<{
        state: MessageState;
        id?: string;
      }>(
        `
        SELECT state, state_id as "id" FROM message_states
        WHERE user_id = $1
    `,
        [userId],
      )
      .then<{ state: MessageState; id?: string }>((res) => {
        const state = res.rows.at(0);
        return state
          ? { ...state }
          : {
              state: {
                confirmedContentAt: "",
                confirmedRecipientsAt: "",
                confirmedScheduleAt: "",
                excerpt: "",
                lang: "",
                organisationId: "",
                plainText: "",
                richText: "",
                schedule: "",
                securityLevel: "high",
                subject: "",
                submittedContentAt: "",
                submittedMetaAt: "",
                threadName: "",
                transportations: [],
                userIds: [],
                templateMetaId: "",
                templateInterpolations: {},
              },
            };
      });
  },
  async deleteMessageState(userId: string, stateId: string) {
    pgpool.query(
      `
      DELETE FROM message_states 
      WHERE user_id = $1 AND state_id = $2
    `,
      [userId, stateId],
    );
  },
};

export const utils = {
  interpolationReducer: function (interpolations: Record<string, string>) {
    return function reducer(acc: string, key: string) {
      return acc.replaceAll(`{{${key}}}`, interpolations[key]);
    };
  },
  templateFilter: function templateFilter(languagesToConsider: Set<string>) {
    return function templateFilter(template: {
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
      lang: string;
    }) {
      return languagesToConsider.has(template.lang);
    };
  },
  reduceUserLang: function reduceUserLang(
    acc: Set<string>,
    user: {
      id: string;
      email: string;
      lang: string;
    },
  ) {
    acc.add(user.lang);
    return acc;
  },
  postgresArrayify: function postgresArrayify(arr: unknown[]): string {
    return JSON.stringify(arr).replace("[", "{").replace("]", "}");
  },
};

type FormError = {
  messageKey: string;
  field: string;
  errorValue: string;
};
export const temporaryMockUtils = {
  async autoPaymentTemplateId() {
    const client = await pgpool.connect();
    let templateId: string | undefined;
    try {
      templateId = await client
        .query<{
          templateId: string;
        }>(
          `select template_id as "templateId" from email_template_translations where name='workflow_payment_success'`,
        )
        .then((res) => res.rows.at(0)?.templateId);
      if (!templateId) {
        templateId = await client
          .query<{
            templateId: string;
          }>(
            `
          with tmpl as(
            insert into email_templates(id)values(default)returning id
          )
          insert into email_template_translations(template_id,name,language, subject, body)
          values((select id from tmpl), 'workflow_payment_success', 'EN', 'You did a payment', 'You have paid €{{pay}} for {{reason}}, at {{date}}. Transaction ID: {{ref}}.')
          returning template_id as "templateId"
        `,
          )
          .then((res) => res.rows.at(0)?.templateId);
      }

      if (!templateId) {
        throw new Error("couldn't seed payment template");
      }

      client.query("COMMIT");
    } catch (err) {
      console.log("autoPaymentTemplateId", err);
      client.query("ROLLBACK");
    } finally {
      client.release();
    }
    return templateId;
  },

  async autoSuccessfulTemplateId() {
    const client = await pgpool.connect();
    let templateId: string | undefined;
    try {
      templateId = await client
        .query<{
          templateId: string;
        }>(
          `select template_id as "templateId" from email_template_translations where name='workflow_mid_success'`,
        )
        .then((res) => res.rows.at(0)?.templateId);
      if (!templateId) {
        templateId = await client
          .query<{
            templateId: string;
          }>(
            `
          with tmpl as(
            insert into email_templates(id)values(default)returning id
          )
          insert into email_template_translations(template_id,name,language, subject, body)
          values((select id from tmpl), 'workflow_mid_success', 'EN', '{{event}} completed', 'You have successfully applied for {{event}} at {{date}}')
          returning template_id as "templateId"
        `,
          )
          .then((res) => res.rows.at(0)?.templateId);
      }

      if (!templateId) {
        throw new Error("couldn't seed payment template");
      }

      client.query("COMMIT");
    } catch (err) {
      console.log("autoSuccessfulTemplateId", err);
      client.query("ROLLBACK");
    } finally {
      client.release();
    }
    return templateId;
  },
  async getErrors(userId: string, stateId: string) {
    return pgpool
      .query<{ field: string; messageKey: string; errorValue: string }>(
        `
      DELETE FROM form_errors
      WHERE user_id = $1 AND state_id = $2
      RETURNING 
        field, 
        error_message AS "messageKey", 
        error_value AS "errorValue"
    `,
        [userId, stateId],
      )
      .then((res) => res.rows);
  },
  async createErrors(errors: FormError[], userId: string, stateId: string) {
    let i = 3;
    const values: string[] = [];
    for (const _ of errors) {
      values.push(`($1, $2, $${i}, $${i + 1}, $${i + 2})`);
      i += 3;
    }

    await pgpool.query(
      `
      INSERT INTO form_errors (user_id, state_id, field, error_message, error_value)
      VALUES ${values.join(", ")}
    `,
      [
        userId,
        stateId,
        ...errors
          .map((error) => [error.field, error.messageKey, error.errorValue])
          .flat(),
      ],
    );
  },
  /**
   * Takes the latest email provider, or creates a temporary ethereal.mail account
   */
  async getFirstOrEtherealMailProvider() {
    let id = await pgpool
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
      id = await new Promise((res, rej) => {
        nodemailer.createTestAccount(
          async function handleCreated(err, account) {
            if (err) {
              console.log(err);
              rej(err);
            }

            id = await mailApi.createProvider({
              name: etherealEmailProviderName,
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

    return id;
  },
};
