import { Provider } from "../routes/schemas";
import CryptographyService from "./cryptographyService";

type ProviderType = Provider["type"];

export const providerSecretsHandlersFactory = (type: ProviderType) => {
  switch (type) {
    case "stripe":
      return new StripeProviderSecretsHandler();
    case "banktransfer":
      return new BankTransferProviderSecretsHandler();
    case "openbanking":
      return new OpenBankingProviderSecretsHandler();
    case "worldpay":
      return new WorldPayProviderSecretsHandler();
    case "realex":
      return new RealexProviderSecretsHandler();
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
};
interface IProviderSecretsHandler {
  getCypheredData(data: any): any;
  getClearTextData(data: any): any;
}
class StripeProviderSecretsHandler implements IProviderSecretsHandler {
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData(data: any) {
    const encryptedLiveSecretKey = this.cryptographyService.encrypt(
      data.liveSecretKey,
    );
    data.encryptedLiveSecretKey = encryptedLiveSecretKey;
    delete data.liveSecretKey;
    return data;
  }

  getClearTextData(data: any) {
    const decryptedSecretKey = this.cryptographyService.decrypt(
      data.encryptedLiveSecretKey,
    );
    data.liveSecretKey = decryptedSecretKey;
    delete data.encryptedLiveSecretKey;
    return data;
  }
}

class BankTransferProviderSecretsHandler implements IProviderSecretsHandler {
  getCypheredData(data: any) {
    return data;
  }

  getClearTextData(data: any) {
    return data;
  }
}

class OpenBankingProviderSecretsHandler implements IProviderSecretsHandler {
  getCypheredData(data: any) {
    return data;
  }

  getClearTextData(data: any) {
    return data;
  }
}

class WorldPayProviderSecretsHandler implements IProviderSecretsHandler {
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData(data: any) {
    const encryptedMerchantCode = this.cryptographyService.encrypt(
      data.merchantCode,
    );
    data.encryptedMerchantCode = encryptedMerchantCode;
    delete data.merchantCode;
    return data;
  }

  getClearTextData(data: any) {
    const decryptedMerchantCode = this.cryptographyService.decrypt(
      data.encryptedMerchantCode,
    );
    data.merchantCode = decryptedMerchantCode;
    delete data.encryptedMerchantCode;
    return data;
  }
}
class RealexProviderSecretsHandler implements IProviderSecretsHandler {
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData(data: any) {
    const encryptedSharedSecret = this.cryptographyService.encrypt(
      data.sharedSecret,
    );
    data.encryptedSharedSecret = encryptedSharedSecret;
    delete data.sharedSecret;
    return data;
  }

  getClearTextData(data: any) {
    const decryptedSecretKey = this.cryptographyService.decrypt(
      data.encryptedSharedSecret,
    );
    data.sharedSecret = decryptedSecretKey;
    delete data.encryptedSharedSecret;
    return data;
  }
}
