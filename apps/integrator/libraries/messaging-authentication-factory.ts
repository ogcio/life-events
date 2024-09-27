import { Messaging } from "building-blocks-sdk";
import { headers } from "next/headers";

export class MessagingAuthenticationFactory {
  static async getToken(): Promise<string> {
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        `/api/messaging-e2e-token`,
        process.env.NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  }

  static async getMessagingClient(): Promise<Messaging> {
    const token = await this.getToken();
    return new Messaging(token);
  }
}
