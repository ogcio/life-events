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
  "/api/v1/messages/jobs/{id}": {
    post: {
      parameters: {
        path: {
          id: string;
        };
      };
      responses: {
        /** @description Default Response */
        202: {
          content: never;
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/messages/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                id: string;
                subject: string;
                excerpt: string;
                plainText: string;
                richText: string;
                createdAt: string;
              }[];
            };
          };
        };
        /** @description Default Response */
        400: {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            message?: {
              threadName?: string;
              messageName: string;
              subject: string;
              excerpt: string;
              richText: string;
              plainText: string;
              lang: string;
            };
            template?: {
              /** Format: uuid */
              id: string;
              interpolations: {
                [key: string]: string;
              };
            };
            preferredTransports: string[];
            userIds: string[];
            security: string;
            /** Format: date-time */
            scheduleAt: string;
          };
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/messages/{messageId}": {
    get: {
      parameters: {
        path: {
          messageId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                subject: string;
                excerpt: string;
                plainText: string;
                richText: string;
              };
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/providers/emails/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                id: string;
                name: string;
                host: string;
                port: number;
                username: string;
                password: string;
                throttle?: number;
                fromAddress: string;
              }[];
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            name: string;
            host: string;
            port: number;
            username: string;
            password: string;
            throttle?: number;
            fromAddress: string;
          };
        };
      };
      responses: {
        /** @description Default Response */
        201: {
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                id: string;
              };
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/providers/emails/{providerId}": {
    get: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                id: string;
                name: string;
                host: string;
                port: number;
                username: string;
                password: string;
                throttle?: number;
                fromAddress: string;
              };
            };
          };
        };
        /** @description Default Response */
        404: {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    put: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: uuid */
            id: string;
            name: string;
            host: string;
            port: number;
            username: string;
            password: string;
            throttle?: number;
            fromAddress: string;
          };
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/providers/sms/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                id: string;
                name: string;
                type: string;
              }[];
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            name: string;
            config: {
              type: string;
              accessKey: string;
              secretAccessKey: string;
              region: string;
            };
          };
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/providers/sms/{providerId}": {
    get: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data?: {
                /** Format: uuid */
                id: string;
                name: string;
                config: {
                  type: string;
                  accessKey: string;
                  secretAccessKey: string;
                  region: string;
                };
              };
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    put: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: uuid */
            id: string;
            name: string;
            config: {
              type: string;
              accessKey: string;
              secretAccessKey: string;
              region: string;
            };
          };
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/templates/": {
    get: {
      parameters: {
        query?: {
          lang?: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                templateMetaId: string;
                lang: string;
                templateName: string;
              }[];
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            contents: {
              templateName: string;
              lang: string;
              subject: string;
              excerpt: string;
              plainText: string;
              richText: string;
            }[];
            variables: {
              name: string;
              type: string;
              languages: string[];
            }[];
          };
        };
      };
      responses: {
        /** @description Default Response */
        201: {
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                id: string;
              };
            };
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/templates/{templateId}": {
    get: {
      parameters: {
        path: {
          templateId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                contents: {
                  templateName: string;
                  subject: string;
                  excerpt: string;
                  plainText: string;
                  richText: string;
                  lang: string;
                }[];
                fields: {
                  fieldName: string;
                  fieldType: string;
                }[];
              };
            };
          };
        };
        /** @description Default Response */
        404: {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    put: {
      parameters: {
        path: {
          templateId: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            contents: {
              /** Format: uuid */
              id: string;
              templateName: string;
              lang: string;
              subject: string;
              excerpt: string;
              plainText: string;
              richText: string;
            }[];
            variables: {
              name: string;
              type: string;
            }[];
          };
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          templateId: string;
        };
      };
      responses: {
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": components["schemas"]["def-0"];
          };
        };
      };
    };
  };
  "/api/v1/users/csv": {
    post: {
      responses: {
        /** @description Default Response */
        202: {
          content: never;
        };
        /** @description Default Response */
        "5XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              request_id: string;
              name: string;
              validation?: unknown;
              validationContext?: string;
            };
          };
        };
        /** @description Default Response */
        "4XX": {
          content: {
            "application/json": {
              code: string;
              detail: string;
              request_id: string;
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
  schemas: {
    /** HttpError */
    "def-0": {
      statusCode?: number;
      code?: string;
      error?: string;
      message?: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
