import { pgpool } from "./dbConnection";
import { send as twilioSend } from "./strategies/twilio/index";
import nodemailer from "nodemailer";
// In case we need to do it, we can replace this with another provider
// We just need to keep the same SendEmail interface
export const send = twilioSend;

export * from "./templates";
export * from "./notifications";
export * from "./types";

export const etherealEmailProviderName = "Ethereal email provider";
type MessageState = {
  submittedMetaAt: string; // First step of meta selection such as type, transportation eg.
  submittedEmailAt: string;
  confirmedEmailAt: string;
  transportations: string[];
  content: string;
  subject: string;
  abstract?: string; // Not entirely sure if this is needed
  links: { url: string; label: string }[];
  schedule: "";
  emailRecipients: string[];
  confirmedEmailRecipientsAt: string;
  confirmedScheduleAt: string;
  messageType: string;
  paymentRequestId: string;
  paymentUserId: string;
};

type EmailProvider = {
  id: string;
  name: string;
  host: string;
  username: string;
  password: string;
};
export const mailApi = {
  async createProvider(
    name: string,
    host: string,
    username: string,
    password: string,
  ) {
    return pgpool
      .query<{ id: string }>(
        `
      INSERT INTO email_providers(provider_name, smtp_host, username, pw)
      VALUES($1,$2,$3,$4)
      RETURNING id
    `,
        [name, host, username, password],
      )
      .then((res) => res.rows.at(0)?.id);
  },
  async updateProvider(data: EmailProvider) {
    pgpool.query(
      `
      UPDATE email_providers set 
        provider_name = $1, 
        smtp_host = $2,
        username = $3,
        pw = $4
      WHERE id = $5
    `,
      [data.name, data.host, data.username, data.password, data.id],
    );
  },
  async providers() {
    return pgpool
      .query<EmailProvider>(
        `
      SELECT id, provider_name as "name", smtp_host as "host", username, pw as "password" FROM email_providers
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
        provider_name as "name", 
        smtp_host as "host", 
        username, pw as "password" 
      FROM email_providers
      WHERE id =$1
    `,
        [id],
      )
      .then((res) => res.rows.at(0));
  },
  /// Need to refer to html template or this is gonna be dull
  async sendMails(
    providerId: string,
    recipients: string[],
    subject: string,
    body: string,
  ) {
    try {
      const provider = await pgpool
        .query<{ host: string; username: string; password: string }>(
          `
          SELECT smtp_host as "host", username, pw as "password" FROM 
          email_providers
          WHERE id = $1
        `,
          [providerId],
        )
        .then((res) => res.rows.at(0));

      if (!provider) {
        return;
      }

      const { host, password, username } = provider;

      const transporter: nodemailer.Transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 0,
        // secure: false,
        auth: {
          user: username,
          pass: password,
        },
      });

      console.log({ recipients });

      return transporter.sendMail({
        from: username,
        to: recipients.join(", "), //"test@skoj.se",
        subject: subject,
        html: body,
      });
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  },
};

type MessageType = "message" | "event";
export const api = {
  async pushMessage({
    data,
    sender,
    transports,
    type,
  }: {
    data: {
      recipients: string[]; // we (right now) always use email as identifyer
      subject: string;
      abstract?: string;
      content: string;
      actionUrl?: string;
      paymentRequestId?: string;
      paymentUserId?: string;
    };
    sender: { email: string };
    transports: "email"[];
    type: MessageType;
  }): Promise<void> {
    "use server";
    const promises: Promise<any>[] = [];

    // Always store the event

    // caveat: we dont care about size for now. If we need to send over 10k emails, I think we need
    // a better way than including 10k+ emails in a request. Maybe upload a csv or w/e.

    const vals: (string | null)[] = [
      data.subject,
      data.content, //data.abstract || "null", // The little description eg.
      data.content,
      data.actionUrl || null,
      data.paymentRequestId || null,
      data.paymentUserId || null,
      type,
    ];
    const originalSize = vals.length;
    const args: string[] = [];
    const recipients: string[] = [];

    let i = vals.length + 1;
    while (data.recipients.length) {
      const email = data.recipients.shift();
      if (!email) {
        break;
      }
      recipients.push(email);
      args.push(
        `(${[...new Array(originalSize)].map((_, i) => `$${i + 1}`)},$${i})`,
      );
      vals.push(email);
      i += 1;
    }

    const eventQuery = pgpool.query(
      `
    INSERT INTO messages(
        subject, 
        abstract, 
        content, 
        action_url,
        payment_request_id,
        payment_user_id,
        message_type,
        for_email)
    VALUES ${args.join(",")}`,
      vals,
    );

    promises.push(eventQuery);

    if (transports.includes("email")) {
      const id = await temporaryMockUtils.getEtherealMailProvider();
      if (!id) {
        console.log("No mock provider id. No mails been sent");
      } else {
        promises.push(
          mailApi.sendMails(id, recipients, data.subject, data.content),
        );
      }
    }

    await Promise.all(promises);
  },
  async pushMessageByTemplate(
    templateId: string,
    interpolations: Record<string, string>,
    recipients: string[],
    type: MessageType,
    transports: "email"[],
  ) {
    const pgclient = await pgpool.connect();
    let messageId: string | undefined;
    try {
      await pgclient.query("BEGIN");

      const template = await pgpool
        .query<{
          id: string;
          data: Array<{ body: string; subject: string; language: string }>;
        }>(
          `
      SELECT 
        template.id,
        translation.data
      FROM email_templates template
      JOIN lateral (
      select jsonb_agg(jsonb_build_object('body', body, 'subject',"subject", 'language', language)) as "data" from email_template_translations translation
      where translation.template_id = template.id) translation ON template.id = $1;
    `,
          [templateId],
        )
        .then((res) => res.rows.at(0));

      if (!template) {
        throw new Error(`template for id ${templateId} not found`);
      }

      // Lets omit emailing eg. for now

      // We need to compose a new message based on a template. We need create interpoilation link to the message (not the template!)
      // Let's also just auto select english for now (or first template translation really..). This will need to be looked for user profile or default something
      const chosenTemplateTranslations = template.data.at(0);
      if (!chosenTemplateTranslations) {
        throw new Error("no translation values");
      }

      // Now we have to create a new message, and associate the correct interpolation values that user will get
      const intrplvalues: string[] = [];
      const args: string[] = [
        recipients[0], // We cheat for now
        chosenTemplateTranslations.subject,
        chosenTemplateTranslations.body,
        type,
      ];
      let i = args.length + 1;
      for (const key of Object.keys(interpolations)) {
        intrplvalues.push(
          `((SELECT message_id FROM msg_insert), $${i}, $${i + 1})`,
        );
        args.push(key, interpolations[key]);
        i += 2;
      }

      messageId = await pgpool
        .query<{ messageId: string }>(
          `
      WITH msg_insert AS(
        INSERT INTO messages(for_email, subject, content, message_type)
        VALUES($1,$2,$3,$4)
        RETURNING message_id
      )
      INSERT INTO message_interpolation_accessors(message_id, key_accessor, value_accessor)
      values ${intrplvalues.join(", ")}
      RETURNING (SELECT message_id FROM msg_insert) as "messageId"
    `,
          args,
        )
        .then((res) => res.rows.at(0)?.messageId);

      await pgclient.query("COMMIT");
    } catch (err) {
      await pgclient.query("ROLLBACK");
      throw new Error(err);
    } finally {
      pgclient.release();
    }

    // Email
    if (transports.includes("email")) {
      const tmpId = await temporaryMockUtils.getEtherealMailProvider();
      if (tmpId && messageId) {
        const message = await api.getMessage(messageId);

        message &&
          mailApi.sendMails(
            tmpId,
            recipients,
            message.subject,
            message.content,
          );
      }
    }
  },
  async getMessages(
    email: string,
    filter: { page: number; size: number; search: string; type?: MessageType },
  ) {
    if (!filter.page) {
      filter.page = 1;
    }

    if (!filter.size) {
      filter.size = 50;
    }

    let query = `
    SELECT 
      message_id as "messageId", 
      subject, 
      content, 
      action_url as "link", 
      created_at::DATE::TEXT as "createdAt",
      a.interpolations,
      message_type as "type"
    FROM messages m
    JOIN LATERAL(
      SELECT
        jsonb_agg(jsonb_build_object('key', key_accessor, 'value', value_accessor)) as "interpolations"
        from message_interpolation_accessors a 
    where a.message_id = m.message_id
    ) a on true
    WHERE lower(for_email)=lower($1)`;

    const args: (number | string)[] = [email.toLocaleLowerCase()];
    let nextArgIndex = 2;
    if (filter.search) {
      query += `
        AND subject ILIKE $${nextArgIndex}
      `;
      args.push(`%${filter.search}%`);
      nextArgIndex += 1;
    }

    if (filter.type) {
      query += `
        AND message_type = $${nextArgIndex}
      `;
      args.push(filter.type);
      nextArgIndex += 1;
    }

    query += `
    ORDER BY created_at DESC OFFSET $${nextArgIndex} LIMIT $${nextArgIndex + 1}`;
    args.push((filter.page - 1) * filter.size, filter.size);

    const messages = await pgpool
      .query<{
        messageId: string;
        subject: string;
        content: string;
        link: string;
        createdAt: string;
        interpolations: { key: string; value: string }[];
        type: MessageType;
      }>(query, args)
      .then((res) => res.rows);

    for (const message of messages) {
      if (message.interpolations) {
        for (const interpolation of message.interpolations) {
          message.content = message.content.replaceAll(
            `{{${interpolation.key}}}`,
            interpolation.value,
          );

          message.subject = message.subject.replaceAll(
            `{{${interpolation.key}}}`,
            interpolation.value,
          );
        }
      }
    }

    return messages;
  },
  async getUnreadMessageCount(email: string) {
    return pgpool
      .query<{ count: number }>(
        `
        SELECT 
          count (*) 
        FROM messages 
        WHERE is_unseen AND lower(for_email)=lower($1)
    `,
        [email],
      )
      .then((res) => res.rows.at(0)?.count ?? 0);
  },
  async seeMessage(email: string, messageId: string) {
    pgpool.query(
      `
        UPDATE messages SET is_unseen = false
        WHERE message_id = $1 AND for_email=lower($2)
    `,
      [messageId, email],
    );
  },
  async getMessage(messageId: string) {
    let query = `
    SELECT 
      subject, 
      content, 
      action_url as "link",
      message_type as "type",
      payment_request_id as "paymentRequestId",
      payment_user_id as "paymentUserId",
      a.interpolations
    FROM messages m
    JOIN LATERAL(
      SELECT
        jsonb_agg(jsonb_build_object('key', key_accessor, 'value', value_accessor)) as "interpolations"
        from message_interpolation_accessors a 
    where a.message_id = m.message_id
    ) a on true
    WHERE message_id = $1`;
    const args = [messageId];

    const message = await pgpool
      .query<{
        subject: string;
        content: string;
        link: string;
        type: MessageType;
        paymentRequestId?: string;
        paymentUserId?: string;
        interpolations: { key: string; value: string }[];
      }>(query, args)
      .then((res) => res.rows.at(0));

    if (message?.interpolations) {
      for (const interpolation of message.interpolations) {
        message.content = message.content.replaceAll(
          `{{${interpolation.key}}}`,
          interpolation.value,
        );

        message.subject = message.subject.replaceAll(
          `{{${interpolation.key}}}`,
          interpolation.value,
        );
      }
    }

    return message;
  },
  /**
   * Note this needs to be restricted access to different admin role configurations
   */
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
                confirmedEmailAt: "",
                confirmedEmailRecipientsAt: "",
                confirmedScheduleAt: "",
                content: "",
                emailRecipients: [],
                links: [],
                schedule: "",
                submittedEmailAt: "",
                subject: "",
                submittedMetaAt: "",
                transportations: [],
                messageType: "",
                paymentRequestId: "",
                paymentUserId: "",
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
  async getTemplates() {
    return pgpool
      .query<{ id: string; keyvals: Array<Record<string, string>> }>(
        `
        SELECT template.id, values.keyvals  FROM email_templates template
        JOIN LATERAL (
          SELECT template_id, jsonb_agg(jsonb_build_object('key', key_accessor, 'value', value_accessor)) as keyvals
          from template_interpolation_accessors
          group by template_id
        ) values on values.template_id = template.id;
    `,
      )
      .then((res) => res.rows);
  },
};

// Anything temporary goes in here
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
  async getEtherealMailProvider() {
    let id = await pgpool
      .query<{ id: string }>(
        `
      select 
        id 
      from email_providers 
      where provider_name = $1
    `,
        [etherealEmailProviderName],
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

            id = await mailApi.createProvider(
              etherealEmailProviderName,
              account.smtp.host,
              account.user,
              account.pass,
            );
            res(id);
          },
        );
      });
    }

    return id;
  },
};
