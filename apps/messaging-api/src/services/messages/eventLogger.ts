/* eslint-disable @typescript-eslint/no-namespace */
import { Pool } from "pg";
import { FastifyBaseLogger } from "fastify";
import { SecurityLevels } from "../../types/schemaDefinitions.js";

/**
 * Might go with
 * failed
 * completed
 * pending
 * ?
 */
enum EventStatus {
  SUCCESSFUL = "successful",
  FAILED = "failed",
  PENDING = "pending",
  DELIVERED = "delivered",
  RETRIED = "retried",
  DELETED = "deleted",
}

enum EventKey {
  MESSAGE_CREATE = "message_create",
  MESSAGE_JOB_CREATE = "message_job_create",
  MESSAGE_SCHEDULE = "message_schedule",
  TEMPLATE_MESSAGE_CREATE = "template_message_create",
  MESSAGE_DELIVERY = "message_delivery",
  EMAIL_DELIVERY = "email_delivery",
  SMS_DELIVERY = "sms_delivery",
  MESSAGE_OPTION_SEEN = "message_option_seen",
  MESSAGE_OPTION_UNSEEN = "message_option_unseen",
}

export type EventType = {
  status: EventStatus;
  key: EventKey;
};

export namespace MessagingEventType {
  export const createRawMessage: EventType = {
    status: EventStatus.SUCCESSFUL,
    key: EventKey.MESSAGE_CREATE,
  };

  export const createRawMessageError: EventType = {
    key: EventKey.MESSAGE_CREATE,
    status: EventStatus.FAILED,
  };

  export const scheduleMessage: EventType = {
    status: EventStatus.SUCCESSFUL,
    key: EventKey.MESSAGE_SCHEDULE,
  };

  export const scheduleMessageError: EventType = {
    key: EventKey.MESSAGE_SCHEDULE,
    status: EventStatus.FAILED,
  };

  export const createTemplateMessage: EventType = {
    key: EventKey.TEMPLATE_MESSAGE_CREATE,
    status: EventStatus.SUCCESSFUL,
  };

  export const createTemplateMessageError: EventType = {
    key: EventKey.TEMPLATE_MESSAGE_CREATE,
    status: EventStatus.FAILED,
  };

  export const deliverMessageError: EventType = {
    key: EventKey.MESSAGE_DELIVERY,
    status: EventStatus.FAILED,
  };

  export const deliverMessagePending: EventType = {
    key: EventKey.MESSAGE_DELIVERY,
    status: EventStatus.PENDING,
  };

  export const deliverMessage: EventType = {
    key: EventKey.MESSAGE_DELIVERY,
    status: EventStatus.SUCCESSFUL,
  };

  export const citizenSeenMessage: EventType = {
    key: EventKey.MESSAGE_OPTION_SEEN,
    status: EventStatus.SUCCESSFUL,
  };

  export const citizenUnseenMessage: EventType = {
    key: EventKey.MESSAGE_OPTION_UNSEEN,
    status: EventStatus.SUCCESSFUL,
  };

  export const emailError: EventType = {
    key: EventKey.EMAIL_DELIVERY,
    status: EventStatus.FAILED,
  };

  export const smsError: EventType = {
    key: EventKey.SMS_DELIVERY,
    status: EventStatus.FAILED,
  };
}

type MessageUpsertEvent = {
  threadName: string;
  subject: string;
  excerpt: string;
  richText: string;
  plainText: string;
  language: string;
  transports: string[];
  receiverFullName: string;
  receiverPPSN: string;
  senderFullName?: string;
  senderPPSN?: string;
  senderUserId?: string;
  senderApplicationId?: string;
  templateName?: string;
  templateId?: string;
  organisationName: string;
  scheduledAt: string;
  bypassConsent: boolean;
  security: SecurityLevels;
};

type MessageScheduleEvent = {
  jobId: string;
  receiverUserId: string;
  receiverFullName: string;
  receiverPPSN: string;
};

type MessageErrorEvent = {
  messageKey?: string;
};

type Required = { messageId: string };
export type MessageEventData = Required &
  (MessageUpsertEvent | MessageScheduleEvent | MessageErrorEvent);

export type EventDataAggregation = Required &
  MessageUpsertEvent &
  MessageScheduleEvent &
  MessageErrorEvent;

export interface MessagingEventLogger {
  /**
   * Persists logs tied to messaging api. Aims to store full information on eg. users, and relevant messaging information to make sure that
   * we document everything in case of external doubt.
   * @param type Status and key object. Use exported namespace MessagingEventType for premade types.
   * @param eventData Array of relevant inforamtion for each event type.
   */
  log(type: EventType, eventData: MessageEventData[]): Promise<void>;
}

export function newMessagingEventLogger(
  pool: Pool,
  stdLogger: FastifyBaseLogger,
) {
  return Object.freeze<MessagingEventLogger>({
    async log(type: EventType, eventData: MessageEventData[]) {
      if (!eventData.length) {
        stdLogger.warn(
          { at: Date.now(), type },
          "tried to message event log without event data",
        );
        return;
      }

      const values: (string | MessageEventData)[] = [type.status, type.key];

      const baseArgs = [...new Array(values.length)].map((_, i) => `$${i + 1}`);
      const parameterisedArgs: string[] = [];

      let i = values.length;
      for (const event of eventData) {
        parameterisedArgs.push(`(${[...baseArgs, `$${++i}`, `$${++i}`]})`);
        values.push(event, event.messageId);
      }

      const query = `insert into messaging_event_logs(
            event_status,
            event_type,
            data,
            message_id
          ) values
            ${parameterisedArgs.join(",")}
          `;

      try {
        await pool.query(query, values);
      } catch (err) {
        stdLogger.error(
          {
            at: new Date().toISOString(),
            type,
            err,
            messageIds: eventData.map((event) => {
              event.messageId;
            }),
          },
          "failed to create message event log",
        );
      }
    },
  });
}
