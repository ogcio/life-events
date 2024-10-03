/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/health": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: never;
        };
      };
    };
  };
  "/api/v1/tasks/": {
    post: {
      requestBody?: {
        content: {
          "application/json": {
            /** Format: uri */
            webhookUrl: string;
            webhookAuth: string;
            /** Format: date-time */
            executeAt: string;
          }[];
        };
      };
      responses: {
        /** @description Default Response */
        202: {
          content: never;
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              /** @description Code used to categorize the error */
              code: string;
              /** @description Description of the error */
              detail: string;
              /** @description Unique request id. This one will be used to troubleshoot the problems */
              requestId: string;
              /** @description Name of the error type */
              name: string;
              /** @description List of the validation errors */
              validation?: {
                fieldName: string;
                message: string;
              }[];
              validationContext?: string;
            };
          };
        };
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {};
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
