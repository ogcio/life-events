import { Provider } from "../routes/schemas";
import CryptographyService from "./cryptographyService";

type ProviderType = Provider["type"];

export const providerSecretsHandlersFactory = (type: ProviderType) => {
  switch (type) {
    case "stripe":
      return new StripeProviderSecretsHandler();
    case "banktransfer":
      return new BankTransferSecretsHandler();
    case "openbanking":
      return new OpenBankingSecretsHandler();
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

class BankTransferSecretsHandler implements IProviderSecretsHandler {
  getCypheredData(data: any) {
    return data;
  }

  getClearTextData(data: any) {
    return data;
  }
}

class OpenBankingSecretsHandler implements IProviderSecretsHandler {
  getCypheredData(data: any) {
    return data;
  }

  getClearTextData(data: any) {
    return data;
  }
}
