import CryptographyService from "./cryptographyService";

type HppDataResponse = {
  RESULT: string;
  AUTHCODE: string;
  MESSAGE: string;
  PASREF: string;
  AVSPOSTCODERESULT: string;
  AVSADDRESSRESULT: string;
  CVNRESULT: string;
  ACCOUNT: string;
  MERCHANT_ID: string;
  ORDER_ID: string;
  TIMESTAMP: string;
  AMOUNT: string;
  MERCHANT_RESPONSE_URL: string;
  HPP_LANG: string;
  pas_uuid: string;
  HPP_CUSTOMER_COUNTRY: string;
  HPP_CUSTOMER_PHONENUMBER_MOBILE: string;
  BILLING_CODE: string;
  BILLING_CO: string;
  ECI: string;
  CAVV: string;
  XID: string;
  DS_TRANS_ID: string;
  AUTHENTICATION_VALUE: string;
  MESSAGE_VERSION: string;
  SRD: string;
  SHA1HASH: string;
  HPP_BILLING_STREET1: string;
  HPP_BILLING_STREET2: string;
  HPP_BILLING_STREET3: string;
  HPP_BILLING_CITY: string;
  HPP_BILLING_COUNTRY: string;
  HPP_BILLING_POSTALCODE: string;
  HPP_CUSTOMER_FIRSTNAME: string;
  HPP_CUSTOMER_LASTNAME: string;
  HPP_CUSTOMER_EMAIL: string;
  HPP_ADDRESS_MATCH_INDICATOR: string;
  BATCHID: string;
};

interface IRealexService {
  generateTimestamp(): string;
  generateHash(text: string): string;
  verifyHash(hppDataResponse: HppDataResponse): boolean;
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

  verifyHash(response: HppDataResponse): boolean {
    const {
      TIMESTAMP,
      MERCHANT_ID,
      ORDER_ID,
      RESULT,
      MESSAGE,
      PASREF,
      AUTHCODE,
    } = response;

    const firstHash = this.generateHash(
      `${TIMESTAMP}.${MERCHANT_ID}.${ORDER_ID}.${RESULT}.${MESSAGE}.${PASREF}.${AUTHCODE}`,
    );

    const validHash = this.generateHash(firstHash);
    return validHash === response.SHA1HASH;
  }
}
