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
  "/api/v1/addresses/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              addressId: string;
              addressLine1: string;
              addressLine2: string;
              town: string;
              county: string;
              eirecode: string;
              updatedAt: string;
              moveInDate?: string;
              moveOutDate?: string;
              isPrimary?: boolean;
              ownershipStatus?: string;
            }[];
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            addressLine1: string;
            addressLine2?: string;
            town: string;
            county: string;
            eirecode: string;
            moveInDate?: string;
            moveOutDate?: string;
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
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
  };
  "/api/v1/addresses/{addressId}": {
    get: {
      parameters: {
        path: {
          addressId: string;
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              addressId: string;
              addressLine1: string;
              addressLine2: string;
              town: string;
              county: string;
              eirecode: string;
              updatedAt: string;
              moveInDate?: string;
              moveOutDate?: string;
              isPrimary?: boolean;
              ownershipStatus?: string;
            };
          };
        };
        /** @description Default Response */
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    put: {
      parameters: {
        path: {
          addressId: string;
        };
      };
      requestBody?: {
        content: {
          "application/json": {
            addressLine1: string;
            addressLine2?: string;
            town: string;
            county: string;
            eirecode: string;
            moveInDate?: string;
            moveOutDate?: string;
            isPrimary: boolean;
            ownershipStatus: string;
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
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          addressId: string;
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
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    patch: {
      parameters: {
        path: {
          addressId: string;
        };
      };
      requestBody?: {
        content: {
          "application/json": {
            isPrimary?: boolean;
            ownershipStatus?: string;
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
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
  };
  "/api/v1/entitlements/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              firstname: string;
              lastname: string;
              type: string;
              issueDate: string;
              expiryDate?: string;
              documentNumber: string;
            }[];
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
  };
  "/api/v1/user/": {
    get: {
      responses: {
        /** @description Default Response */
        200: {
          content: {
            "application/json": {
              firstname: string;
              lastname: string;
              email: string;
              title: string;
              dateOfBirth?: string;
              ppsn: string;
              ppsnVisible: boolean;
              gender: string;
              phone: string;
              consentToPrefillData: boolean;
            };
          };
        };
        /** @description Default Response */
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    put: {
      requestBody: {
        content: {
          "application/json": {
            firstname: string;
            lastname: string;
            email: string;
            title: string;
            dateOfBirth: string;
            ppsn: string;
            ppsnVisible: boolean;
            gender: string;
            phone: string;
            consentToPrefillData?: boolean;
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
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": {
            firstname: string;
            lastname: string;
            email: string;
            title?: string;
            dateOfBirth?: string;
            ppsn?: string;
            ppsnVisible?: boolean;
            gender?: string;
            phone?: string;
            consentToPrefillData?: boolean;
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
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
      };
    };
    patch: {
      requestBody?: {
        content: {
          "application/json": {
            ppsnVisible?: boolean;
            consentToPrefillData?: boolean;
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
        404: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
            };
          };
        };
        /** @description Default Response */
        500: {
          content: {
            "application/json": {
              statusCode: number;
              code: string;
              error: string;
              message: string;
              time: string;
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
