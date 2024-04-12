import { pgpool } from "./dbConnection";
import { send as twilioSend } from "./strategies/twilio/index";
import nodemailer from "nodemailer";
import { TableMessage } from "./types/mesages";
import { randomUUID } from "crypto";
import { PgSessions, getUsersFor } from "auth/sessions";
// In case we need to do it, we can replace this with another provider
// We just need to keep the same SendEmail interface
export const send = twilioSend;

export * from "./templates";
export * from "./notifications";
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
  links: string[];
  schedule: string;
  userIds: string[];
  confirmedRecipientsAt: string;
  confirmedScheduleAt: string;
  messageType: string;
  paymentRequestId: string;
  paymentUserId: string;
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
      console.log("Vi forsoker skicka mail", {
        fromAddress,
        recipients,
        subject,
        body,
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
      const id = await temporaryMockUtils.getFirstOrEtherealMailProvider();
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
  /**
   * push a message
   *  we create a message in the database, so that some cron whatever can pick it up later.
   *
   * Let's start to consider pushMessage only, and deal with template
   *
   *
   */
  async pushMessageByTemplate(
    templateId: string,
    interpolations: Record<string, string>,
    recipients: string[], // TODO: []userId from SSO
    type: MessageType, // undecided. Not interesting
    preferredTransports: "email"[], // preferred transports link table
    securityLevel?: string, // high/medium/low. Default high.
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
        RETURNING id
      )
      INSERT INTO message_interpolation_accessors(id, key_accessor, value_accessor)
      values ${intrplvalues.join(", ")}
      RETURNING (SELECT id FROM msg_insert) as "messageId"
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

    // This will be moved to scheduler
    // Email
    if (preferredTransports.includes("email")) {
      const tmpId = await temporaryMockUtils.getFirstOrEtherealMailProvider();
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
  // async getMessages(
  //   email: string,
  //   filter: { page: number; size: number; search: string; type?: MessageType },
  // ) {
  //   if (!filter.page) {
  //     filter.page = 1;
  //   }

  //   if (!filter.size) {
  //     filter.size = 50;
  //   }

  //   let query = `
  //   SELECT
  //     id as "messageId",
  //     subject,
  //     content,
  //     action_url as "link",
  //     created_at::DATE::TEXT as "createdAt",
  //     a.interpolations,
  //     message_type as "type"
  //   FROM messages m
  //   JOIN LATERAL(
  //     SELECT
  //       jsonb_agg(jsonb_build_object('key', key_accessor, 'value', value_accessor)) as "interpolations"
  //       from message_interpolation_accessors a
  //   where a.message_id = m.id
  //   ) a on true
  //   WHERE lower(for_email)=lower($1)`;

  //   const args: (number | string)[] = [email.toLocaleLowerCase()];
  //   let nextArgIndex = 2;
  //   if (filter.search) {
  //     query += `
  //       AND subject ILIKE $${nextArgIndex}
  //     `;
  //     args.push(`%${filter.search}%`);
  //     nextArgIndex += 1;
  //   }

  //   if (filter.type) {
  //     query += `
  //       AND message_type = $${nextArgIndex}
  //     `;
  //     args.push(filter.type);
  //     nextArgIndex += 1;
  //   }

  //   query += `
  //   ORDER BY created_at DESC OFFSET $${nextArgIndex} LIMIT $${nextArgIndex + 1}`;
  //   args.push((filter.page - 1) * filter.size, filter.size);

  //   const messages = await pgpool
  //     .query<{
  //       messageId: string;
  //       subject: string;
  //       content: string;
  //       link: string;
  //       createdAt: string;
  //       interpolations: { key: string; value: string }[];
  //       type: MessageType;
  //     }>(query, args)
  //     .then((res) => res.rows);

  //   for (const message of messages) {
  //     if (message.interpolations) {
  //       for (const interpolation of message.interpolations) {
  //         message.content = message.content.replaceAll(
  //           `{{${interpolation.key}}}`,
  //           interpolation.value,
  //         );

  //         message.subject = message.subject.replaceAll(
  //           `{{${interpolation.key}}}`,
  //           interpolation.value,
  //         );
  //       }
  //     }
  //   }

  //   return messages;
  // },
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
  async seeMessage(email: string, messageId: string) {
    pgpool.query(
      `
        UPDATE messages SET is_seen = true
        WHERE id = $1 AND for_email=lower($2)
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
    where a.message_id = m.id
    ) a on true
    WHERE id = $1`;
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
                confirmedContentAt: "",
                confirmedRecipientsAt: "",
                confirmedScheduleAt: "",
                excerpt: "",
                lang: "",
                links: [],
                messageType: "",
                organisationId: "",
                paymentRequestId: "",
                paymentUserId: "",
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

function postgresArrayify(arr: unknown[]): string {
  return JSON.stringify(arr).replace("[", "{").replace("]", "}");
}

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
};

export const apistub = {
  messages: {
    async post(body: {
      message?: Omit<
        TableMessage,
        "id" | "isSeen" | "updatedAt" | "createdAt" | "preferredTransports"
      >;
      template?: {
        id: string;
        interpolations: Record<string, string>;
      };
      preferredTransports: string[];
      userIds: string[];
      security: string;
    }) {
      if (!body.message && !body.template) {
        // bad request!
        return;
      }

      console.log("Bror", JSON.stringify(body, null, 4));
      /**
       * Note
       *
       * The scheduler will need to schedule ids. Yet to figure out which.
       *
       * Whenever a message without a template is scheduled. We create the message as default.
       * However the message table will contain a "delivered" flag, to simplify queries.
       *
       * We should also implement an event log. Eg.
       *  - Message was sent to scheduler.
       *  - Message is being "delivered" to [transport]
       *  - Message failed to [transport]
       *
       *
       * Everything beyond this comment is what will happen once any subscribed event
       * comes from a scheduler.
       * This particular endpoint will only pass the information to a scheduler after some parameter sanitation.
       */

      /**
       * Security considerations.
       *
       * We COULD roll with one bit for each component of a message.
       * 0b01 - excerpt
       * 0b010 - body text
       * 0b0100 - payment "preview"
       * 0b01000 - links
       *
       * security = 0b01001 (9) would mean the message provide subject (always), excerpt and links to transports.
       * Full message content is of course always stored in the messages table
       *
       * We can also use "high" "medium" "low" and forever be stuck with three options. Hard to extend naturally.. "medium-high", "almost-low" ?
       */

      const users = await getUsersFor(body.userIds);

      if (!Boolean(users?.length)) {
        // 4/500?
        return;
      }

      let mailSubject: string | undefined;
      let mailBody: string | undefined;

      // With a flat message model, there's no way of creating a message without template for multi language. That would be useful for bulk sending a message with both en and ga, without template.
      if (body.message) {
        const {
          lang,
          links,
          organisationId,
          securityLevel,
          messageName,
          threadName,
          paymentRequestId,
          excerpt,
          plainText,
          richText,
          subject,
        } = body.message;

        mailSubject = subject;
        mailBody = richText ?? plainText;

        const messageValues: (string | null)[] = [];
        const args: string[] = [];

        messageValues.push(
          subject,
          excerpt,
          richText,
          plainText,
          lang,
          links.length ? postgresArrayify(links) : null,
          randomUUID().toString(),
          securityLevel,
          body.preferredTransports.length
            ? postgresArrayify(body.preferredTransports)
            : null,
          messageName,
          threadName || null,
          paymentRequestId || null,
        );

        const originalValueSize = messageValues.length;

        let i = messageValues.length + 1;
        for (const userId of body.userIds) {
          args.push(
            `(${[...new Array(originalValueSize)].map((_, i) => `$${i + 1}`)}, $${i})`,
          );
          messageValues.push(userId);
          i += 1;
        }

        let messageQuery = `
        insert into messages(
          subject,
          excerpt, 
          rich_text,
          plain_text,
          lang,
          links,
          organisation_id,
          security_level,
          preferred_transports,
          message_name,
          thread_name,
          payment_request_id,
          user_id
        )
        values ${args.join(", ")}
      `;

        await pgpool.query(messageQuery, messageValues);
      }

      if (body.template) {
        // interpolate all messages, base on user pref

        const templateContents = await pgpool
          .query<{
            subject: string;
            excerpt: string;
            richText: string;
            plainText: string;
            lang: string;
          }>(
            `
          select 
            subject, excerpt, rich_text as "richText", plain_text as "plainText", lang 
          from message_template_contents
          where template_meta_id = $1
        `,
            [body.template.id],
          )
          .then((res) => res.rows);

        if (!templateContents.some((tmpl) => tmpl.lang === "en")) {
          console.log("No english template found");
          return;
        }

        const languagesToConsider = users.reduce(
          utils.reduceUserLang,
          new Set<string>(),
        );

        const templates = templateContents.filter(
          utils.templateFilter(languagesToConsider),
        );

        // we're guaranteed to have one template body per language by db design
        const valuesByLang: Record<
          string,
          { args: string[][]; values: (string | null)[]; initSize: number }
        > = {};
        const interpolations = body.template.interpolations;
        const interpolationKeys = Object.keys(interpolations);

        const interpolationReducer = utils.interpolationReducer(interpolations);
        const baseargs: string[] = [];
        // Set up the base args and values for each lang query.
        for (const template of templates) {
          const subject = interpolationKeys.reduce(
            interpolationReducer,
            template.subject,
          );

          const plainText = interpolationKeys.reduce(
            interpolationReducer,
            template.plainText,
          );

          const richText = interpolationKeys.reduce(
            interpolationReducer,
            template.richText,
          );

          const excerpt = interpolationKeys.reduce(
            interpolationReducer,
            template.excerpt,
          );

          mailSubject = subject;
          mailBody = richText ?? plainText;

          // Values for each language insert
          const values = [
            subject,
            excerpt,
            richText,
            plainText,
            template.lang,
            randomUUID().toString(), /// organisation id
            body.security,
            "message name", // message name, no idea what we're supposed to put here...
            "thread name", // also no idea how this correlates with a template
            body.preferredTransports
              ? postgresArrayify(body.preferredTransports)
              : null,
          ];
          console.log("kompis?", values);

          const valuesSize = values.length;

          // the base will always be the same
          if (!baseargs.length) {
            baseargs.push(
              ...[...new Array(valuesSize)].map((_, i) => `$${i + 1}`),
            );
          }

          valuesByLang[template.lang] = {
            args: [],
            values,
            initSize: valuesSize,
          };
        }

        // Let's fill in the user id values
        const userIndexes: Record<string, number> = {};
        for (const user of users) {
          if (!valuesByLang[user.lang]) {
            continue;
          }

          if (!userIndexes[user.lang]) {
            userIndexes[user.lang] = 1;
          }

          const size = valuesByLang[user.lang].initSize;
          valuesByLang[user.lang]?.args.push([
            ...baseargs,
            `$${size + userIndexes[user.lang]}`,
          ]);
          valuesByLang[user.lang]?.values.push(user.id);
          userIndexes[user.lang] += 1;
        }

        const client = await pgpool.connect();
        try {
          await client.query("BEGIN");
          for (const lang of Object.keys(valuesByLang)) {
            let messageQuery = `
            insert into messages(
              subject,
              excerpt, 
              rich_text,
              plain_text,
              lang,
              organisation_id,
              security_level,
              message_name,
              thread_name,
              preferred_transports,
              user_id
            )
            values ${valuesByLang[lang].args.map((arr) => `(${arr.join(", ")})`).join(", ")}
          `;

            await pgpool.query(messageQuery, valuesByLang[lang].values);
          }
          await client.query("COMMIT");
        } catch (err) {
          console.error(err);
          await client.query("ROLLBACK");
        } finally {
          client.release();
        }
      }

      /**
       * This may be some other service dealing with emails.
       *
       *  We need to adjust based on security system what to send as subject/body
       *
       * Further considerations is the check wether a user should or can get an email
       **/

      if (body.preferredTransports.includes("email")) {
        const provider =
          await temporaryMockUtils.getFirstOrEtherealMailProvider();
        if (!provider) {
          console.error("No provider");
          return;
        }

        if (!mailSubject || !mailBody) {
          console.error("no subject or body");
          return;
        }

        void mailApi
          .sendMails(
            provider,
            users.map((user) => user.email),
            mailSubject,
            mailBody,
          )
          .catch(console.log);
      }
    },
    async getAll(userId: string, query?: URLSearchParams) {
      const type = query?.get("type")?.toString();

      let where = "";
      let argIndex = 2;
      const vals: (string | number | null)[] = [];
      if (type) {
        where += `and message_type = $${argIndex}`;
        vals.push(type);
        argIndex += 1;
      }

      return pgpool
        .query<{
          id: string;
          subject: string;
          excerpt: string;
          plainText: string;
          richText: string;
          links: string[];
          createdAt: string;
          messageType: string;
          paymentRequestId?: string;
        }>(
          `
        select 
          id,
          subject, 
          excerpt, 
          plain_text as "plainText",
          rich_text as "richText",
          links,
          payment_request_id as "paymentRequestId",
          created_at as "createdAt",
          message_type as "messageType"
        from messages
        where user_id = $1 
        ${where}
        order by created_at desc
      `,
          [userId, ...vals],
        )
        .then((res) => res.rows);
    },
    async getOne(id: string) {
      const { userId } = await PgSessions.get();
      return pgpool
        .query<{
          subject: string;
          excerpt: string;
          plainText: string;
          richText: string;
          links: string[];
          paymentRequestId?: string;
        }>(
          `
        select 
          subject, 
          excerpt, 
          plain_text as "plainText",
          rich_text as "richText",
          links,
          payment_request_id as "paymentRequestId"
        from messages
        where user_id = $1 and id=$2
        order by created_at desc
      `,
          [userId, id],
        )
        .then((res) => res.rows.at(0));
    },
  },
  templates: {
    async post(body: {
      contents: {
        name: string;
        lang: string;
        subject: string;
        excerpt: string;
        richText: string;
        plainText: string;
      }[];
      variables: { name: string; type: string }[];
    }) {
      const { userId, publicServant } = await PgSessions.get();
      if (!userId) {
        // 403
        return;
      }

      if (!publicServant) {
        // 401
        return;
      }

      const pretendOrganisationId = randomUUID().toString();

      // Can of course create a huge CTE here.
      const client = await pgpool.connect();
      try {
        client.query("BEGIN");
        const templateMetaId = await client
          .query<{ id: string }>(
            `
          insert into message_template_meta(organisation_id, created_by_user_id)
          values($1,$2)
          returning id
        `,
            [pretendOrganisationId, userId],
          )
          .then((res) => res.rows.at(0)?.id);

        if (!templateMetaId) {
          throw new Error("failed create template id");
        }

        for (const content of body.contents) {
          const { excerpt, lang, name, plainText, richText, subject } = content;
          await client.query(
            `
            insert into message_template_contents(
              template_meta_id, 
              template_name,
              lang,
              subject,
              excerpt,
              rich_text,
              plain_text
              )
            values(
              $1,$2,$3,$4,$5,$6,$7
            )
          `,
            [templateMetaId, name, lang, subject, excerpt, richText, plainText],
          );
        }

        for (const field of body.variables) {
          await client.query(
            `
            insert into message_template_variables(template_meta_id, field_name, field_type)
            values($1, $2, $3)
          `,
            [templateMetaId, field.name, field.type],
          );
        }
        client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
      } finally {
        client.release();
      }
    },
    async get(id: string, lang: string) {
      // Not sure what we wanna return here.
      const templateMeta = await pgpool
        .query<{
          templateName: string;
          subject: string;
          excerpt: string;
          plainText: string;
          richText: string;
          lang: string;
          fieldName?: string;
          fieldType?: string;
        }>(
          `
        select
          template_name as "templateName",
          subject,
          excerpt,
          plain_text as "plainText",
          rich_text as "richText",
          lang,
          v.field_name as "fieldName",
          v.field_type as "fieldType"
        from message_template_meta m
        join message_template_contents c on c.template_meta_id = m.id
        left join message_template_variables v on v.template_meta_id = m.id
        where m.id = $1 and c.lang = $2
      `,
          [id, lang],
        )
        .then((res) => res.rows);

      const template: {
        templateName?: string;
        subject?: string;
        excerpt?: string;
        plainText?: string;
        richText?: string;
        fields?: { fieldName: string; fieldType: string }[];
      } = {};

      for (const row of templateMeta) {
        const {
          excerpt,
          lang,
          plainText,
          richText,
          subject,
          templateName,
          fieldName,
          fieldType,
        } = row;
        template.excerpt = excerpt;
        template.plainText = plainText;
        template.richText = richText;
        template.subject = subject;
        template.templateName = templateName;

        if (fieldName && fieldType) {
          if (!template.fields) {
            template.fields = [];
          }
          template.fields.push({ fieldName, fieldType });
        }
      }

      return template;
    },
    async getAll(lang: string) {
      const templates = await pgpool
        .query<{
          templateMetaId: string;
          lang: string;
          templateName: string;
        }>(
          `
        select  
          m.id as "templateMetaId",
          lang,
          template_name as "templateName"
        from message_template_meta m
        join message_template_contents c on c.template_meta_id = m.id
      `,
        )
        .then((res) => res.rows);

      return templates.filter((template) => template.lang === lang);
    },
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
    console.log({ errors, userId, stateId });
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
