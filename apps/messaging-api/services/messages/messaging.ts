/**
 * This service function deals with all messaging crud
 *
 * It's to replace the ./messages.ts file completely
 */

import { Pool } from "pg";
import { utils } from "../../utils";
import { isNativeError } from "util/types";
import { BadRequestError, ServerError, ThirdPartyError } from "shared-errors";
import { randomUUID } from "crypto";

type TemplateContent = {
  subject: string;
  excerpt: string;
  richText: string;
  plainText: string;
  lang: string;
  templateName: string;
};

type User = {
  userId: string;
  firstName: string;
  lastName: string;
  ppsn: string;
  lang: string;
  email: string;
  phone: string;
};

const ERROR_PROCESS = "Messaging Service";

type CreatedTemplateMessage = {
  userId: string;
  messageId: string;
  excerpt: string;
  lang: string;
  plainText: string;
  richText: string;
  subject: string;
  threadName: string;
};

export interface MessagingService {
  createMessage(params: {
    receiverUserId: string;
    excerpt: string;
    lang: string;
    plainText: string;
    richText: string;
    subject: string;
    threadName: string;
    scheduleAt: string;
    bypassConsent: boolean;
    security: string; // Which levels do we have?
    preferredTransports: Array<"email" | "sms" | "lifeEvent">;
    organisationId: string;
  }): Promise<string>;

  /**
   * Composes and insert one message from a template for each recipient, using their preferred language
   * or chosing first avaliable.
   *
   * @param templateContents - Contains the message content for different languages with interpolations
   * @param recipients - Receiving users
   * @param transports - Where to send except messaging system (email, sms, life events)
   * @param security - TODO
   */
  createTemplateMessages(
    templateContents: TemplateContent[],
    recipients: User[],
    transports: string[],
    security: string,
    scheduleAt: string,
    organizationId: string,
  ): Promise<CreatedTemplateMessage[]>;

  /**
   * Get the template contents for the root meta id
   *
   * @param templateMetaId
   */
  getTemplateContents(templateMetaId: string): Promise<TemplateContent[]>;

  /**
   *
   * Create a callback job entry for each message to a user
   * Sends the job to the scheduler
   *
   * @param userMessageIds user and message id object array
   * @param scheduleAt iso date string
   */
  scheduleMessages(
    userMessageIds: { userId: string; messageId: string }[],
    scheduleAt: string,
    organisationId: string,
  ): Promise<{ jobId: string; userId: string; entityId: string }[]>;
}

export function newMessagingService(pool: Pool): Readonly<MessagingService> {
  return Object.freeze<MessagingService>({
    async createMessage(params) {
      const valueArray = [
        false,
        params.receiverUserId,
        params.subject,
        params.excerpt,
        params.plainText,
        params.richText,
        params.security,
        params.lang,
        params.preferredTransports.length
          ? utils.postgresArrayify(params.preferredTransports)
          : null,
        params.subject, // message name
        params.threadName,
        params.organisationId,
        params.scheduleAt,
      ];

      const values = valueArray.map((_, i) => `$${i + 1}`).join(", ");

      const insertQueryResult = await pool.query<{ id: string }>(
        `
        insert into messages(
            is_delivered,
            user_id,
            subject,
            excerpt,
            plain_text,
            rich_text,
            lang,
            security_level,
            preferred_transports,
            message_name,
            thread_name,
            organisation_id,
            scheduled_at
        ) values (${values})
        returning 
          id
      `,
        valueArray,
      );

      const messageId = insertQueryResult.rows.at(0)?.id;

      if (!messageId) {
        throw new Error("no message id generated");
      }

      return messageId;
    },
    async createTemplateMessages(
      templateContents: TemplateContent[],
      recipients: User[],
      transports: string[],
      security: string,
      scheduleAt: string,
      organizationId: string,
    ): Promise<CreatedTemplateMessage[]> {
      if (!templateContents.length) {
        throw new BadRequestError(
          ERROR_PROCESS,
          "no template contents provided",
        );
      }

      const valueArgsArray: string[] = [];
      const valueArray: (string | boolean | undefined)[] = [];
      let valueArgsIndex = 0;
      for (const user of recipients) {
        const templateContent =
          templateContents.find((content) => content.lang === user.lang) ||
          templateContents[0];

        const interpolationReducer = utils.interpolationReducer(user);
        // We use user keys as allowed interpolations
        const userKeys: string[] = Object.keys(user).filter(
          // Omit any other values we don't like to expose
          (key) => key !== "userId",
        );

        /**
         * We need to pluck the users that doesn't have any profile value for the interpolation replacements
         *
         * eg.
         * user A = {firstName:"A"}
         * variables = ["firstName", "ppsn"]
         *
         * A doesnt have ppsn available.
         *
         * What do we do?
         *
         * - Store the user in an array of invalid users, maybe with "reason" property
         * - silent ignore
         * - throw error for entire batch
         */

        /**
         * isDelivered
         * userId
         * subject
         * excerpt
         * plainText
         * richText
         * lang
         * security
         * transports
         * threadName
         * organisationId
         */
        const values = [
          false,
          user.userId,
          userKeys.reduce(interpolationReducer, templateContent.subject),
          userKeys.reduce(interpolationReducer, templateContent.excerpt),
          userKeys.reduce(interpolationReducer, templateContent.plainText),
          userKeys.reduce(interpolationReducer, templateContent.richText),
          templateContent.lang,
          security,
          utils.postgresArrayify(transports),
          userKeys.reduce(interpolationReducer, templateContent.subject),
          organizationId,
          scheduleAt,
        ];

        const args = [...Array(values.length)]
          .reduce<string>((queryArgs, _, i) => {
            let next = queryArgs.concat(`$${++valueArgsIndex}`);
            if (i < values.length - 1) {
              next = next.concat(",");
            }
            return next;
          }, "(")
          .concat(")");

        valueArray.push(...values);
        valueArgsArray.push(args);
      }

      // If we need to consider how many values we want to insert in one commit, do so here
      const insertQueryResult = await pool.query<CreatedTemplateMessage>(
        `
        insert into messages(
            is_delivered,
            user_id,
            subject,
            excerpt,
            plain_text,
            rich_text,
            lang,
            security_level,
            preferred_transports,
            thread_name,
            organisation_id,
            scheduled_at
        ) values ${valueArgsArray.join(",")}
        returning 
          user_id as "userId", 
          id as "messageId",
          excerpt,
          lang,
          plain_text as "plainText",
          rich_text as "richText",
          subject,
          thread_name as "threadName"
      `,
        valueArray,
      );

      return insertQueryResult.rows;
    },

    async getTemplateContents(
      templateMetaId: string,
    ): Promise<TemplateContent[]> {
      return pool
        .query<TemplateContent>(
          `
            select
                subject,
                excerpt,
                rich_text as "richText",
                plain_text as "plainText",
                lang,
                template_name as "templateName"
            from message_template_contents
            where template_meta_id = $1
            `,
          [templateMetaId],
        )
        .then((res) => res.rows);
    },
    async scheduleMessages(
      userMessageIds: { userId: string; messageId: string }[],
      scheduleAt: string,
      organisationId: string,
    ) {
      const valueArgs: string[] = [];
      const values: string[] = ["message", organisationId];
      let valueArgIndex = values.length;

      for (const pt of userMessageIds) {
        valueArgs.push(
          `($1, $2, $${++valueArgIndex}, $${++valueArgIndex}, $${++valueArgIndex})`,
        );
        values.push(pt.messageId, pt.userId, randomUUID());
      }

      const jobs: {
        jobId: string;
        userId: string;
        entityId: string;
        token: string;
      }[] = [];
      try {
        const jobInsertResult = await pool.query<{
          jobId: string;
          userId: string;
          entityId: string;
          token: string;
        }>(
          `
        insert into jobs(job_type, organisation_id, job_id, user_id, job_token)
        values ${valueArgs.join(", ")}
        returning id as "jobId", user_id as "userId", job_id as "entityId", job_token as "token"
      `,
          values,
        );
        jobs.push(...jobInsertResult.rows);
      } catch (err) {
        throw new ServerError(ERROR_PROCESS, "failed to create jobs");
      }

      const scheduleBody = jobs.map((job) => {
        const callbackUrl = new URL(
          `/api/v1/jobs/${job.jobId}`,
          process.env.WEBHOOK_URL_BASE,
        );

        return {
          webhookUrl: callbackUrl.toString(),
          webhookAuth: job.token,
          executeAt: scheduleAt,
        };
      });

      const scheduleUrl = new URL(
        "/api/v1/tasks",
        process.env.SCHEDULER_API_URL,
      );

      try {
        await fetch(scheduleUrl.toString(), {
          method: "POST",
          body: JSON.stringify(scheduleBody),
          headers: { "x-user-id": "123", "Content-Type": "application/json" },
        });
      } catch (err) {
        throw new ThirdPartyError(
          "failed to post messages",
          isNativeError(err)
            ? (err.cause?.toString() ?? "")
            : (err?.toString() ?? ""),
        );
      }
      return jobs;
    },
  });
}
