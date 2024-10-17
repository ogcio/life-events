import {
  RealexHppResponseDO,
  RealexStatusUpdateDO,
} from "../plugins/entities/providers/types";
import CryptographyService from "./cryptographyService";

interface IRealexService {
  generateTimestamp(timestamp?: Date): string;
  generateHash(text: string): string;
  verifyHash(hppDataResponse: RealexHppResponseDO): boolean;
  generateHTMLResponse(response: RealexHppResponseDO): string;
}
export class RealexService implements IRealexService {
  private cryptographyService: CryptographyService;
  private secret: string;

  constructor(secret: string) {
    this.cryptographyService = new CryptographyService();
    this.secret = secret;
  }

  generateTimestamp(timestamp: Date = new Date()) {
    const [date, time] = new Intl.DateTimeFormat("it", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(timestamp)
      .split(",");
    const timeFormatted = time.replace(/\D/g, "");
    const [day, month, year] = date.split("/");
    const dateFormatted = [year, month, day].join("");

    return `${dateFormatted}${timeFormatted}`;
  }

  generateHash(text: any, algorithm?: string) {
    return this.cryptographyService.hash(
      this.cryptographyService.hash(text, algorithm) + "." + this.secret,
      algorithm,
    );
  }

  verifyHash(response: RealexHppResponseDO): boolean {
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

  verifyStatusUpdateHash(response: RealexStatusUpdateDO): boolean {
    const {
      timestamp,
      merchantid,
      orderid,
      result,
      message,
      pasref,
      paymentmethod,
    } = response;

    const toHash = `${timestamp}.${merchantid}.${orderid}.${result}.${message}.${pasref}.${paymentmethod}`;
    const validHash = this.generateHash(toHash, "sha1");

    return validHash === response.sha1hash;
  }

  generateHTMLResponse(response: RealexHppResponseDO): string {
    const errorQueryParam =
      response.RESULT !== "00" ? `&error=${response.RESULT}` : "";
    const url = new URL(
      `/${response.HPP_LANG}/paymentRequest/complete?order_id=${response.ORDER_ID}${errorQueryParam}`,
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
