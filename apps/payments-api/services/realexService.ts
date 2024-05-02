import { RealexHppDataResponse } from "../routes/schemas";
import CryptographyService from "./cryptographyService";

interface IRealexService {
  generateTimestamp(): string;
  generateHash(text: string): string;
  verifyHash(hppDataResponse: RealexHppDataResponse): boolean;
  generateHTMLResponse(response: RealexHppDataResponse): string;
}
export class RealexService implements IRealexService {
  private cryptographyService: CryptographyService;
  private secret: string;

  constructor(secret: string) {
    this.cryptographyService = new CryptographyService();
    this.secret = secret;
  }

  generateTimestamp() {
    const [date, time] = new Intl.DateTimeFormat("it", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(new Date())
      .split(",");
    const timeFormatted = time.replace(/\D/g, "");
    const [day, month, year] = date.split("/");
    const dateFormatted = [year, month, day].join("");

    return `${dateFormatted}${timeFormatted}`;
  }

  generateHash(text: any) {
    return this.cryptographyService.hash(
      this.cryptographyService.hash(text) + "." + this.secret,
    );
  }

  verifyHash(response: RealexHppDataResponse): boolean {
    const {
      TIMESTAMP,
      MERCHANT_ID,
      ORDER_ID,
      RESULT,
      MESSAGE,
      PASREF,
      AUTHCODE,
    } = response;

    const toHash = `${TIMESTAMP}.${MERCHANT_ID}.${ORDER_ID}.${RESULT}.${MESSAGE}.${PASREF}.${AUTHCODE}`;
    const validHash = this.generateHash(toHash);

    return validHash === response.SHA256HASH;
  }

  generateHTMLResponse(response: RealexHppDataResponse): string {
    const errorQueryParam =
      response.RESULT !== "00" ? `&error=${response.RESULT}` : "";
    const url = new URL(
      `/${response.HPP_LANG}/paymentRequest/complete?payment_id=${response.ORDER_ID}${errorQueryParam}`,
      process.env.PAYMENTS_HOST_URL,
    );

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="0; url=${url}">
          <title>Redirecting...</title>
        </head>
        <body>
          <!-- No visible text -->
        </body>
      </html>`;
  }
}
