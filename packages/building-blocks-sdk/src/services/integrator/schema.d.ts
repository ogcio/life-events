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
  "/api/v1/journeys/{journeyId}": {
    get: {
      parameters: {
        path: {
          journeyId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                id: string;
                title: string;
                userId: string;
                organizationId: string;
                status: string;
              };
              metadata?: {
                links?: {
                  self: {
                    href?: string;
                  };
                  next?: {
                    href?: string;
                  };
                  prev?: {
                    href?: string;
                  };
                  first: {
                    href?: string;
                  };
                  last: {
                    href?: string;
                  };
                  pages: {
                    [key: string]: {
                      href?: string;
                    };
                  };
                };
                totalCount?: number;
              };
            };
          };
        };
        /** @description Default Response */
        401: {
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
        404: {
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
