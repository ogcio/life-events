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
    {
      publicServantPage,
      bankTransferProvider,
      openBankingProvider,
      stripeProvider,
    },
    use,
  ) => {
    const paymentRequestTitle = `Test multiple providers ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      bankTransferProvider: bankTransferProvider.name,
      openBankingProvider: openBankingProvider,
      cardProvider: stripeProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithManualBankTransferProvider: async (
    { publicServantPage, bankTransferProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test manual bank transfer provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      bankTransferProvider: bankTransferProvider.name,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithOpenBankingProvider: async (
    { publicServantPage, openBankingProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test open banking provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      openBankingProvider: openBankingProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithStripeProvider: async (
    { publicServantPage, stripeProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test stripe provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      cardProvider: stripeProvider,
    });

    await use(paymentRequestTitle);
  },

  paymentRequestWithRealexProvider: async (
    { publicServantPage, realexProvider },
    use,
  ) => {
    const paymentRequestTitle = `Test realex provider ${Date.now()}`;
    const paymentRequestCreatePage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await paymentRequestCreatePage.goto();
    await paymentRequestCreatePage.create({
      title: paymentRequestTitle,
      cardProvider: realexProvider,
    });

    await use(paymentRequestTitle);
  },
});
