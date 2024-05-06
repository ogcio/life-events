import {
  BankTransferData,
  OpenBankingData,
  Provider,
  RealexData,
  RealexEncryptedData,
  StripeData,
  StripeEncryptedData,
  WorldpayData,
  WorldpayEncryptedData,
} from "../routes/schemas";
import CryptographyService from "./cryptographyService";

type ProviderType = Provider["type"];

export function providerSecretsHandlersFactory(
  type: "stripe",
): StripeProviderSecretsHandler;
export function providerSecretsHandlersFactory(
  type: "banktransfer",
): StripeProviderSecretsHandler;
export function providerSecretsHandlersFactory(
  type: "openbanking",
): OpenBankingProviderSecretsHandler;
export function providerSecretsHandlersFactory(
  type: "worldpay",
): WorldpayProviderSecretsHandler;
export function providerSecretsHandlersFactory(
  type: "realex",
): RealexProviderSecretsHandler;

export function providerSecretsHandlersFactory(type: ProviderType) {
  switch (type) {
    case "stripe":
      return new StripeProviderSecretsHandler();
    case "banktransfer":
      return new BankTransferProviderSecretsHandler();
    case "openbanking":
      return new OpenBankingProviderSecretsHandler();
    case "worldpay":
      return new WorldpayProviderSecretsHandler();
    case "realex":
      return new RealexProviderSecretsHandler();
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

interface IProviderSecretsHandler<T, U> {
  getCypheredData(data: T): U;
  getClearTextData(data: U): T;
}

class StripeProviderSecretsHandler
  implements IProviderSecretsHandler<StripeData, StripeEncryptedData>
{
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData({
    livePublishableKey,
    liveSecretKey,
  }: StripeData): StripeEncryptedData {
    const encryptedLiveSecretKey =
      this.cryptographyService.encrypt(liveSecretKey);
    return { livePublishableKey, encryptedLiveSecretKey };
  }

  getClearTextData({
    livePublishableKey,
    encryptedLiveSecretKey,
  }: StripeEncryptedData): StripeData {
    const liveSecretKey = this.cryptographyService.decrypt(
      encryptedLiveSecretKey,
    );
    return { livePublishableKey, liveSecretKey };
  }
}

class BankTransferProviderSecretsHandler
  implements IProviderSecretsHandler<BankTransferData, BankTransferData>
{
  getCypheredData(data: BankTransferData): BankTransferData {
    return data;
  }

  getClearTextData(data: BankTransferData): BankTransferData {
    return data;
  }
}

class OpenBankingProviderSecretsHandler
  implements IProviderSecretsHandler<OpenBankingData, OpenBankingData>
{
  getCypheredData(data: OpenBankingData): OpenBankingData {
    return data;
  }

  getClearTextData(data: OpenBankingData): OpenBankingData {
    return data;
  }
}
class WorldpayProviderSecretsHandler
  implements IProviderSecretsHandler<WorldpayData, WorldpayEncryptedData>
{
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData({
    installationId,
    merchantCode,
  }: WorldpayData): WorldpayEncryptedData {
    const encryptedMerchantCode =
      this.cryptographyService.encrypt(merchantCode);
    return { installationId, encryptedMerchantCode };
  }

  getClearTextData({
    installationId,
    encryptedMerchantCode,
  }: WorldpayEncryptedData): WorldpayData {
    const merchantCode = this.cryptographyService.decrypt(
      encryptedMerchantCode,
    );
    return { installationId, merchantCode };
  }
}
class RealexProviderSecretsHandler
  implements IProviderSecretsHandler<RealexData, RealexEncryptedData>
{
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData({
    merchantId,
    sharedSecret,
  }: RealexData): RealexEncryptedData {
    const encryptedSharedSecret =
      this.cryptographyService.encrypt(sharedSecret);
    return { encryptedSharedSecret, merchantId };
  }

  getClearTextData({
    merchantId,
    encryptedSharedSecret,
  }: RealexEncryptedData): RealexData {
    const sharedSecret = this.cryptographyService.decrypt(
      encryptedSharedSecret,
    );
    return { sharedSecret, merchantId };
  }
}
