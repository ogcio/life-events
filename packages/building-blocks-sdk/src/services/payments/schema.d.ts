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
  "/api/v1/providers/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              id: string;
              name: string;
              type:
                | "banktransfer"
                | "openbanking"
                | "stripe"
                | "realex"
                | "worldpay";
              data:
                | {
                    iban: string;
                    accountHolderName: string;
                  }
                | {
                    livePublishableKey: string;
                    liveSecretKey: string;
                  }
                | {
                    merchantCode: string;
                    installationId: string;
                  }
                | {
                    merchantId: string;
                    sharedSecret: string;
                  };
              status: "connected" | "disconnected";
            }[];
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
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            name: string;
            type:
              | "banktransfer"
              | "openbanking"
              | "stripe"
              | "realex"
              | "worldpay";
            data: {
              [key: string]: string;
            };
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              id: string;
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
        422: {
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
        500: {
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
  "/api/v1/providers/{providerId}": {
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
              id: string;
              name: string;
              type:
                | "banktransfer"
                | "openbanking"
                | "stripe"
                | "realex"
                | "worldpay";
              data:
                | {
                    iban: string;
                    accountHolderName: string;
                  }
                | {
                    livePublishableKey: string;
                    liveSecretKey: string;
                  }
                | {
                    merchantCode: string;
                    installationId: string;
                  }
                | {
                    merchantId: string;
                    sharedSecret: string;
                  };
              status: "connected" | "disconnected";
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
    put: {
      parameters: {
        path: {
          providerId: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            type:
              | "banktransfer"
              | "openbanking"
              | "stripe"
              | "realex"
              | "worldpay";
            data: {
              [key: string]: string;
            };
            status: "connected" | "disconnected";
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              ok: boolean;
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
        /** @description Default Response */
        422: {
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
  "/api/v1/requests/": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                paymentRequestId: string;
                title: string;
                description: string;
                amount: number;
                reference: string;
                providers: {
                  userId: string;
                  id: string;
                  name: string;
                  type:
                    | "banktransfer"
                    | "openbanking"
                    | "stripe"
                    | "realex"
                    | "worldpay";
                  status: "connected" | "disconnected";
                  data:
                    | {
                        iban: string;
                        accountHolderName: string;
                      }
                    | {
                        livePublishableKey: string;
                        liveSecretKey: string;
                      }
                    | {
                        merchantCode: string;
                        installationId: string;
                      }
                    | {
                        merchantId: string;
                        sharedSecret: string;
                      };
                  createdAt: string;
                }[];
                status: "active" | "inactive";
              }[];
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
      };
    };
    put: {
      requestBody: {
        content: {
          "application/json": {
            title: string;
            description: string;
            reference: string;
            amount: number;
            redirectUrl: string;
            allowAmountOverride: boolean;
            allowCustomAmount: boolean;
            providers: string[];
            status: "active" | "inactive";
            paymentRequestId: string;
            providersUpdate: {
              toDisable: string[];
              toCreate: string[];
            };
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              id: string;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            title: string;
            description: string;
            reference: string;
            amount: number;
            redirectUrl: string;
            allowAmountOverride: boolean;
            allowCustomAmount: boolean;
            providers: string[];
            status: "active" | "inactive";
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              id: string;
            };
          };
        };
      };
    };
  };
  "/api/v1/requests/{requestId}": {
    get: {
      parameters: {
        path: {
          requestId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              paymentRequestId: string;
              title: string;
              description: string;
              amount: number;
              reference: string;
              providers: {
                userId: string;
                id: string;
                name: string;
                type:
                  | "banktransfer"
                  | "openbanking"
                  | "stripe"
                  | "realex"
                  | "worldpay";
                status: "connected" | "disconnected";
                data:
                  | {
                      iban: string;
                      accountHolderName: string;
                    }
                  | {
                      livePublishableKey: string;
                      liveSecretKey: string;
                    }
                  | {
                      merchantCode: string;
                      installationId: string;
                    }
                  | {
                      merchantId: string;
                      sharedSecret: string;
                    };
                createdAt: string;
              }[];
              status: "active" | "inactive";
              redirectUrl: string;
              allowAmountOverride: boolean;
              allowCustomAmount: boolean;
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
    delete: {
      parameters: {
        path: {
          requestId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": Record<string, never>;
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
        /** @description Default Response */
        500: {
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
  "/api/v1/requests/{requestId}/public-info": {
    get: {
      parameters: {
        path: {
          requestId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              paymentRequestId: string;
              title: string;
              description: string;
              amount: number;
              reference: string;
              providers: {
                userId: string;
                id: string;
                name: string;
                type:
                  | "banktransfer"
                  | "openbanking"
                  | "stripe"
                  | "realex"
                  | "worldpay";
                status: "connected" | "disconnected";
                data:
                  | {
                      iban: string;
                      accountHolderName: string;
                    }
                  | {
                      livePublishableKey: string;
                      liveSecretKey: string;
                    }
                  | {
                      merchantCode: string;
                      installationId: string;
                    }
                  | {
                      merchantId: string;
                      sharedSecret: string;
                    };
                createdAt: string;
              }[];
              status: "active" | "inactive";
              redirectUrl: string;
              allowAmountOverride: boolean;
              allowCustomAmount: boolean;
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
  "/api/v1/requests/{requestId}/transactions": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
        path: {
          requestId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                transactionId: string;
                status:
                  | "initiated"
                  | "pending"
                  | "succeeded"
                  | "cancelled"
                  | "failed";
                amount: number;
                extPaymentId: string;
                updatedAt: string;
                title: string;
              }[];
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
      };
    };
  };
  "/api/v1/transactions/{transactionId}": {
    get: {
      parameters: {
        path: {
          transactionId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                transactionId: string;
                status:
                  | "initiated"
                  | "pending"
                  | "succeeded"
                  | "cancelled"
                  | "failed";
                amount: number;
                extPaymentId: string & string;
                updatedAt: string;
                title: string;
                userId: string;
                userData: {
                  name: string;
                  email: string;
                };
                providerName: string;
                providerType: string;
                paymentRequestId: string;
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
    patch: {
      parameters: {
        path: {
          transactionId: string;
        };
      };
      requestBody: {
        content: {
          "application/json": {
            status:
              | "initiated"
              | "pending"
              | "succeeded"
              | "cancelled"
              | "failed";
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": Record<string, never>;
          };
        };
        /** @description Default Response */
        500: {
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
  "/api/v1/transactions/": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                transactionId: string;
                status:
                  | "initiated"
                  | "pending"
                  | "succeeded"
                  | "cancelled"
                  | "failed";
                amount: number;
                extPaymentId: string & string;
                updatedAt: string;
                title: string;
                userId: string;
                userData: {
                  name: string;
                  email: string;
                };
                providerName: string;
                providerType: string;
                paymentRequestId: string;
              }[];
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
        /** @description Default Response */
        500: {
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
      requestBody: {
        content: {
          "application/json": {
            paymentRequestId: string;
            extPaymentId: string;
            integrationReference: string;
            amount: number;
            paymentProviderId: string;
            userData: {
              name: string;
              email: string;
            };
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                id: string;
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
        500: {
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
  "/api/v1/transactions/generatePaymentIntentId": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                intentId: string;
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
  "/api/v1/citizen/transactions": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                transactionId: string;
                status:
                  | "initiated"
                  | "pending"
                  | "succeeded"
                  | "cancelled"
                  | "failed";
                title: string;
                updatedAt: string;
                extPaymentId: string;
                amount: number;
              }[];
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
        /** @description Default Response */
        500: {
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
  "/api/v1/citizen/transactions/{transactionId}": {
    get: {
      parameters: {
        path: {
          transactionId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                transactionId: string;
                status:
                  | "initiated"
                  | "pending"
                  | "succeeded"
                  | "cancelled"
                  | "failed";
                amount: number;
                extPaymentId: string & string;
                updatedAt: string;
                title: string;
                userId: string;
                userData: {
                  name: string;
                  email: string;
                };
                providerName: string;
                providerType: string;
                paymentRequestId: string;
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
  "/api/v1/realex/paymentObject": {
    get: {
      parameters: {
        query: {
          amount: string;
          intentId: string;
          providerId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              ACCOUNT: string;
              AMOUNT: string;
              CURRENCY: string;
              MERCHANT_ID: string;
              ORDER_ID: string;
              TIMESTAMP: string;
              URL: string;
              SHA256HASH: string;
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
        /** @description Default Response */
        422: {
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
  "/api/v1/realex/verifyPaymentResponse": {
    post: {
      requestBody?: {
        content: {
          "application/json": Record<string, never>;
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
        /** @description Default Response */
        422: {
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
  "/api/v1/test/citizen": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: never;
        };
      };
    };
  };
  "/api/v1/test/pub-ser": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: never;
        };
      };
    };
  };
  "/api/v1/auditLogs/": {
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                auditLogId: string;
                createdAt: string;
                eventType: string;
                title: string;
                userId?: string;
                organizationId?: string;
              }[];
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
        500: {
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
  "/api/v1/auditLogs/{auditLogId}": {
    get: {
      parameters: {
        path: {
          auditLogId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              data: {
                auditLogId: string;
                createdAt: string;
                eventType: string;
                title: string;
                userId?: string;
                organizationId?: string;
                metadata: {
                  [key: string]: unknown;
                };
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
        500: {
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
