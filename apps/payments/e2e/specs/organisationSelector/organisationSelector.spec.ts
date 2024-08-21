import { test } from "../../fixtures/providersFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { OrganizationSelector } from "../../objects/components/OrganisationSelector";
import { ProvidersPage } from "../../objects/providers/ProvidersPage";
import { PaymentRequestsPage } from "../../objects/paymentRequests/PaymentRequestsListPage";

const ORGANISATIONS = [
  "First Testing Organisation",
  "Second Testing Organisation",
];

test.describe("Organisation selector", () => {
  test("should be visible if the user has multiple organisations @regression @normal", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks that the organisation selector is visible if the user has multiple organisations",
    );
    await owner("OGCIO");
    await tags("Organisation selector");
    await severity(Severity.NORMAL);

    await publicServantPage.goto("/");
    const orgSelector = new OrganizationSelector(publicServantPage);
    await orgSelector.isVisible();
  });

  test("should not be visible if the user has only one organisation @regression @normal", async ({
    secondPublicServantPage,
  }) => {
    await description(
      "This test checks that the organisation selector is not visible if the user has only one organisation",
    );
    await owner("OGCIO");
    await tags("Organisation selector");
    await severity(Severity.NORMAL);

    await secondPublicServantPage.goto("/");
    const orgSelector = new OrganizationSelector(secondPublicServantPage);
    await orgSelector.isNotVisible();
  });

  test("should change the organisation @regression @normal", async ({
    publicServantPage,
    bankTransferProvider,
  }) => {
    await description(
      "This test checks that the user can change the organisation",
    );
    await owner("OGCIO");
    await tags("Organisation selector");
    await severity(Severity.NORMAL);

    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.goto();
    await providersPage.checkProviderVisible(bankTransferProvider);

    await publicServantPage.goto("/");
    const orgSelector = new OrganizationSelector(publicServantPage);
    await orgSelector.hasOrganisationSelected(ORGANISATIONS[0]);
    await orgSelector.selectOrganization(ORGANISATIONS[1]);
    await orgSelector.submitSelection();

    await orgSelector.hasOrganisationSelected(ORGANISATIONS[1]);
    await providersPage.goto();
    await providersPage.checkProviderNotVisible(bankTransferProvider);
  });

  test("should disable organisation switch if user is not on the front page @regression @normal", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks that the organisation selector is active on the front page and disabled on every other pages.",
    );
    await owner("OGCIO");
    await tags("Organisation selector");
    await severity(Severity.NORMAL);

    await publicServantPage.goto("/");
    const orgSelector = new OrganizationSelector(publicServantPage);
    await orgSelector.isActive();

    const paymentRequests = new PaymentRequestsPage(publicServantPage);
    await paymentRequests.goto();
    await orgSelector.isDisabled();

    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.goto();
    await orgSelector.isDisabled();
  });
});
