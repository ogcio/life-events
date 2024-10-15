import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Messaging } from "building-blocks-sdk";
import { headers } from "next/headers";
import { getCommonLogger } from "nextjs-logging-wrapper";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getToken(): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;
    let responseClone: Response | null = null;
    try {
      const res = await fetch(
        new URL(
          "/api/token",
          process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
        ),
        { headers: { cookie: cookieHeader } },
      );
      responseClone = res.clone();
      const { token } = await res.json();
      return token;
    } catch (e) {
      const logger = getCommonLogger();
      logger.fatal(e, "Error while getting token");
      if (responseClone) {
        logger.fatal(
          {
            response_body:
              responseClone.body === null
                ? "IS NULL"
                : await this.streamToString(responseClone.body),
          },
          "Get token response body",
        );
      }
      throw e;
    }
  }

  static async streamToString(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    const textDecoder = new TextDecoder();
    let result = "";

    async function read() {
      const { done, value } = await reader.read();

      if (done) {
        return result;
      }

      result += textDecoder.decode(value, { stream: true });
      return read();
    }

    return read();
  }
  static async getMessagingClient(): Promise<Messaging> {
    const token = await this.getToken();
    return new Messaging(token);
  }
}
