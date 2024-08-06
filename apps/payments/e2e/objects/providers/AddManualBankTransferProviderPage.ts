import { Page } from "@playwright/test";
import { BaseBankTransferProviderPage } from "./BaseBankTransferProviderPage";
import { providersUrl } from "../../utils/constants";

export class AddManualBankTransferProviderPage extends BaseBankTransferProviderPage {
  constructor(public readonly page: Page) {
    super(page);
  }

  async goto() {
    await super.goto(`${providersUrl}/add-banktransfer`);
  }
}
