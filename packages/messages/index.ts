import { pgpool } from "./dbConnection";
import { send as twilioSend } from "./strategies/twilio/index";

// In case we need to do it, we can replace this with another provider
// We just need to keep the same SendEmail interface
export const send = twilioSend;

export * from "./templates";
export * from "./notifications";
export * from "./types";

type MessageState = {
  submittedMetaAt: string; // First step of meta selection such as type, transportation eg.
  submittedEmailAt: string;
  confirmedEmailAt: string;
  transportation: string[];
  content: string;
  subject: string;
  abstract?: string; // Not entirely sure if this is needed
  type: "";
  links: { url: string; label: string }[];
  schedule: "";
  emailRecipients: string[];
  confirmedEmailRecipientsAt: string;
  confirmedScheduleAt: string;
};
export const api = {
  async pushMessage({
    data,
    sender,
    transports,
  }: {
    data: {
      recipients: string[]; // we (right now) always use email as identifyer
      subject: string;
      abstract?: string;
      content: string;
      actionUrl?: string;
    };
    sender: { email: string };
    transports: "email"[];
  }): Promise<void> {
    "use server";
    const promises: Promise<any>[] = [];

    // Always store the event

    // caveat: we dont care about size for now. If we need to send over 10k emails, I think we need
    // a better way than including 10k+ emails in a request. Maybe upload a csv or w/e.

    const args: string[] = [];
    const vals: (string | null)[] = [
      data.subject,
      data.content, //data.abstract || "null", // The little description eg.
      data.content,
      data.actionUrl || null,
    ];

    let i = 5;
    while (data.recipients.length) {
      const email = data.recipients.shift();
      if (!email) {
        break;
      }

      args.push(`($1, $2, $3, $4, $${i})`);
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
        for_email)
    VALUES ${args.join(",")}`,
      vals,
    );

    promises.push(eventQuery);

    if (transports.includes("email")) {
      promises.push(
        send({
          from: "ludwig.thurfjell@nearform.com",
          subject: data.subject,
          text: data.content,
          to: "ludwig.thurfjell@nearform.com",
          html: `<a href={${data.actionUrl}} className="govie-button">Bruder</button>`,
        }),
      );
    }

    await Promise.all(promises);
  },
  async pushMessageByTemplate(
    templateId: string,
    interpolations: Record<string, string>,
    recipients: string[],
  ) {
    const pgclient = await pgpool.connect();
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

      // We need to compose a new message based on a template. We need create interpoilation link to the message (not the template!! :D)
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
      ];
      let i = 4;
      for (const key of Object.keys(interpolations)) {
        intrplvalues.push(
          `((SELECT message_id FROM msg_insert), $${i}, $${i + 1})`,
        );
        args.push(key, interpolations[key]);
        i += 2;
      }

      await pgpool.query(
        `
      WITH msg_insert AS(
        INSERT INTO messages(for_email, subject, content)
        VALUES($1,$2,$3)
        RETURNING message_id
      )
      INSERT INTO message_interpolation_accessors(message_id, key_accessor, value_accessor)
      values ${intrplvalues.join(", ")}
    `,
        args,
      );

      await pgclient.query("COMMIT");
    } catch (err) {
      await pgclient.query("ROLLBACK");
    } finally {
      pgclient.release();
    }
  },
  async getMessages(
    email: string,
    filter: { page: number; size: number; search: string },
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
      a.interpolations
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
        AND subject ILIKE $2
      `;
      args.push(`%${filter.search}%`);
      nextArgIndex = 3;
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
      }>(query, args)
      .then((res) => res.rows);

    for (const message of messages) {
      console.log(message);
      if (message.interpolations) {
        for (const interpolation of message.interpolations) {
          message.content = message.content.replaceAll(
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
        WHERE is_unseen AND for_email=lower($1)
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
      action_url as "link" 
    FROM messages
    WHERE message_id = $1`;
    const args = [messageId];

    return pgpool
      .query<{
        subject: string;
        content: string;
        link: string;
      }>(query, args)
      .then((res) => res.rows.at(0));
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
                transportation: [],
                type: "",
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
