import { Payments } from "building-blocks-sdk";
import { getAuthenticationContext } from "./auth";
import notFound from "../app/not-found";

export class PaymentsApiFactory {
  private static instance: Payments | null = null;

  private static async getAccessToken() {
    const { accessToken } = await getAuthenticationContext();

    if (!accessToken) {
      return notFound();
    }

    return accessToken;
  }

  static async getInstance() {
    if (!this.instance) {
      const accessToken = await this.getAccessToken();
      this.instance = new Payments(accessToken as string);
    }

    return this.instance;
  }
}
