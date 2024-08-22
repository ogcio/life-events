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
  "/api/v1/files/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                filename: string;
                id?: string;
                key: string;
                owner: string;
                fileSize: number;
                mimetype: string;
                createdAt: string;
                lastScan: string;
                /** @default false */
                deleted?: boolean;
                infected: boolean;
                infectionDescription?: string;
                antivirusDbVersion?: string;
              }[];
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
      };
    };
    post: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                message: string;
              };
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
      };
    };
  };
  "/api/v1/files/{key}": {
    get: {
      parameters: {
        path: {
          key: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": string;
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          key: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                message: string;
              };
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              requestId: string;
              name: string;
              validation?: unknown;
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
