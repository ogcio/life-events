/**
 * This service function deals with all messaging crud
 *
 * It's to replace the ./messages.ts file completely
 */

import { Pool } from "pg";
import { organisationId, utils } from "../../utils";
import { isNativeError } from "util/types";

type TemplateContent = {
  subject: string;
  excerpt: string;
  richText: string;
  plainText: string;
  lang: string;
};

type User = {
  userId: string;
  firstName: string;
  lastName: string;
  ppsn: string;
  lang: string;
};

export interface MessagingService {
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
  ): Promise<{ userId: string; messageId: string }[]>;

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
  ): Promise<void>;
}

export function newMessagingService(pool: Pool): Readonly<MessagingService> {
  return Object.freeze<MessagingService>({
    async createTemplateMessages(
      templateContents: TemplateContent[],
      recipients: User[],
      transports: string[],
      security: string,
    ): Promise<{ userId: string; messageId: string }[]> {
      if (!templateContents.length) {
        throw new Error("no template contents provided");
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
        const userKeys = Object.keys(user);

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
         * messageName
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
          "tmp",
          undefined,
          organisationId,
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
      return pool
        .query<{ userId: string; messageId: string }>(
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
            organisation_id
        ) values ${valueArgsArray.join(",")}
        returning user_id as "userId", id as "messageId"
      `,
          valueArray,
        )
        .then((res) => res.rows);
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
                lang
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
    ) {
      const valueArgs: string[] = [];
      const values: string[] = ["message"];
      let valueArgIndex = values.length;

      for (const pt of userMessageIds) {
        valueArgs.push(`($1, $${++valueArgIndex}, $${++valueArgIndex})`);
        values.push(pt.messageId, pt.userId);
      }

      const jobs = await pool
        .query<{ jobId: string; userId: string }>(
          `
        insert into jobs(job_type, job_id, user_id)
        values ${valueArgs.join(", ")}
        returning id as "jobId", user_id as "userId"
      `,
          values,
        )
        .then((res) => res.rows);

      const scheduleBody = jobs.map((job) => {
        const callbackUrl = new URL(
          `/api/v1/messages/jobs/${job.jobId}`,
          process.env.WEBHOOK_URL_BASE,
        );

        return {
          webhookUrl: callbackUrl.toString(),
          webhookAuth: job.userId, // TODO Update when we're not using x-user-id as auth
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
          headers: { "x-user-id": "tmp", "Content-Type": "application/json" },
        });
      } catch (err) {
        throw new Error("failed to post messages", {
          cause: isNativeError(err) ? err.cause : err,
        });
      }
    },
  });
}
