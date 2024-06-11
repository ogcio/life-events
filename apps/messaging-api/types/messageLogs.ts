import { Pool } from "pg";
import { MessageInput } from "./schemaDefinitions";
import { FastifyPluginCallback } from "fastify";

enum EventStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
  RETRIED = "retried",
  DELETED = "deleted",
}

enum EventKey {
  MESSAGE_CREATE = "message_create",
  MESSAGE_CREATE_ERROR = "create_message_error",
  MESSAGE_JOB_CREATE = "message_job_create",
  MESSAGE_JOB_CREATE_ERROR = "message_job_create_error",
  MESSAGE_SCHEDULE = "message_schedule",
  MESSAGE_SCHEDULE_ERROR = "message_schedule_error",
  TEMPLATE_MESSAGE_CREATE = "template_message_create",
  TEMPLATE_MESSAGE_CREATE_ERROR = "template_message_create_error",
}

type EventType = {
  status: EventStatus;
  key: EventKey;
};

export namespace MessagingEventType {
  export const createMessage: EventType = {
    status: EventStatus.PENDING,
    key: EventKey.MESSAGE_CREATE,
  };

  export const createMessageError: EventType = {
    key: EventKey.MESSAGE_CREATE_ERROR,
    status: EventStatus.FAILED,
  };

  export const createMessageJob: EventType = {
    status: EventStatus.PENDING,
    key: EventKey.MESSAGE_JOB_CREATE,
  };

  export const createMessageJobError: EventType = {
    status: EventStatus.FAILED,
    key: EventKey.MESSAGE_JOB_CREATE_ERROR,
  };

  export const scheduleMessage: EventType = {
    status: EventStatus.PENDING,
    key: EventKey.MESSAGE_SCHEDULE,
  };

  export const scheduleMessageError: EventType = {
    key: EventKey.MESSAGE_SCHEDULE_ERROR,
    status: EventStatus.FAILED,
  };

  export const createTemplateMessage: EventType = {
    key: EventKey.TEMPLATE_MESSAGE_CREATE,
    status: EventStatus.PENDING,
  };

  export const createTemplateMessageError: EventType = {
    key: EventKey.TEMPLATE_MESSAGE_CREATE_ERROR,
    status: EventStatus.FAILED,
  };
}

type SupportedTransports = "email" | "sms" | "lifeEvents";
type Transports = Set<SupportedTransports>;
type MessageUpsertEventData = MessageInput & {
  transports: string[];
  recipientUserIds?: string[];
};

type MessageLog = {
  messageId?: string;
  senderUserId: string;
  scheduledAt: string;
  senderFullName: string;
  senderPPSN: string;
  receiverFullName: string;
  receiverPPSN: string;
  templateName?: string;
  organisationId: string;
  organisationName: string;
  status: EventStatus;
  eventType: string;
  data: unknown; // jsonb with type union for each event type?
};

type LogBaseData = Pick<
  MessageLog,
  | "senderFullName"
  | "senderPPSN"
  | "senderUserId"
  | "scheduledAt"
  | "organisationId"
  | "organisationName"
  | "templateName"
>;

type UserData = {
  userId: string;
  fullName: string;
  ppsn: string;
  messageId?: string;
};

export interface MessagingEventLogger {
  /**
   * Persists logs tied to messaging api. Aims to store full information on eg. users, and relevant messaging information to make sure that
   * we document everything in case of external doubt.
   * @param type Status and key object. Use exported namespace MessagingEventType for premade types.
   * @param baseData Generic data such as sending user data, organisation and scheduling eg.
   * @param eventData Specific message data such as content, security eg.
   * @param receiverUserData Array of name and other information on receiving users. Contains optional message id associated with the user. One log row will be created for each receiving user.
   */
  log(
    type: EventType,
    baseData: LogBaseData,
    receiverUserData: UserData[],
    eventData: MessageUpsertEventData,
  ): Promise<void>;
}

export function newMessagingEventLogger(pool: Pool) {
  return Object.freeze<MessagingEventLogger>({
    async log(
      type: EventType,
      baseData: LogBaseData,
      receiverUserData: UserData[],
      eventData: MessageUpsertEventData,
    ) {
      if (!receiverUserData.length) {
        return;
      }

      const values = [
        baseData.senderUserId,
        baseData.scheduledAt,
        baseData.senderFullName,
        baseData.senderPPSN,
        baseData.templateName,
        baseData.organisationId,
        baseData.organisationName,
        type.status,
        type.key,
        eventData,
      ];

      const baseArgs = [...new Array(values.length)].map((_, i) => `$${i + 1}`);
      const parameterisedArgs: string[] = [];

      let i = values.length;
      for (const receiver of receiverUserData) {
        parameterisedArgs.push(
          `(${[...baseArgs, `$${++i}, $${++i}, $${++i}, $${++i}`].join(", ")})`,
        );
        values.push(
          receiver.userId,
          receiver.fullName,
          receiver.ppsn,
          receiver.messageId,
        );
      }

      const query = `insert into messaging_logs(
            sender_user_id,
            scheduled_at,
            sender_full_name,
            sender_ppsn,
            template_name,
            organisation_id,
            organisation_name,
            status,
            event_type,
            data,
            receiver_user_id,
            receiver_full_name,
            receiver_ppsn,
            message_id
          ) values
            ${parameterisedArgs.join(",")}
          `;

      await pool.query(query, values);
    },
  });
}

export const messagingLoggerPlugin: FastifyPluginCallback<any> = (
  fastify,
  _opts,
  done,
) => {
  fastify.decorate("messagingLogger", newMessagingEventLogger(fastify.pg.pool));
  done();
};
