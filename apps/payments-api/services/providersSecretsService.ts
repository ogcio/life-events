import CryptographyService from "./cryptographyService";

class GenericProviderSecretsHandler {
  private cryptographyService: CryptographyService;

  constructor() {
    this.cryptographyService = new CryptographyService();
  }

  getCypheredData(
    data: Record<string, string>,
    fields: Array<string>,
  ): Record<string, string> {
    const encryptedData = { ...data };
    fields.forEach((field) => {
      encryptedData[field] = this.cryptographyService.encrypt(data[field]);
    });
    return encryptedData;
  }

  getClearTextData(
    encryptedData: Record<string, string>,
    fields: Array<string>,
  ): Record<string, string> {
    const clearData = { ...encryptedData };
    fields.forEach((field) => {
      clearData[field] = this.cryptographyService.decrypt(encryptedData[field]);
    });
    return clearData;
  }
}

class ProviderSectersHandlerFactory {
  private instance: GenericProviderSecretsHandler | undefined;

  constructor() {
    this.instance = undefined;
  }

  getInstance() {
    if (!this.instance) {
      this.instance = new GenericProviderSecretsHandler();
    }

    return this.instance;
  }
}

export default new ProviderSectersHandlerFactory();
