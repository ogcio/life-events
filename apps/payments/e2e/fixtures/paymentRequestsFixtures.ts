import { PaymentRequestFormPage } from "../objects/paymentRequests/PaymentRequestFormPage";
import { test as base } from "./providersFixtures";

type paymentRequestsFixtures = {
  paymentRequestWithMultipleProviders: string;
  paymentRequestWithManualBankTransferProvider: string;
  paymentRequestWithOpenBankingProvider: string;
  paymentRequestWithStripeProvider: string;
  paymentRequestWithRealexProvider: string;
};

export const test = base.extend<paymentRequestsFixtures>({
  paymentRequestWithMultipleProviders: async (
    { page, bankTransferProvider, openBankingProvider, stripeProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test multiple providers ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(page);
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      bankTransferProvider: bankTransferProvider,
      openBankingProvider: openBankingProvider,
      cardProvider: stripeProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithManualBankTransferProvider: async (
    { page, bankTransferProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test manual bank transfer provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(page);
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      bankTransferProvider: bankTransferProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithOpenBankingProvider: async (
    { page, openBankingProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test open banking provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(page);
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      openBankingProvider: openBankingProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithStripeProvider: async ({ page, stripeProvider }, use) => {
    const paymentRequestTitle = `Test stripe provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(page);
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      cardProvider: stripeProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithRealexProvider: async ({ page, realexProvider }, use) => {
    const paymentRequestTitle = `Test realex provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(page);
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      cardProvider: realexProvider,
    });

    await use(paymentRequestTitle);
  },
});
