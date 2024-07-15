import { test } from "@playwright/test";
import { LoginPage } from "../objects/loginPage";
import { OnboardingDigitalWalletPage } from "../objects/onboardingDigitalWallet";
import { ONBOARDING_TEXTS } from "../objects/onboardingTexts";

test.describe("Onboarding Digital Wallet Tests", () => {
  let loginPage: LoginPage;
  let onboardingDigitalWalletPage: OnboardingDigitalWalletPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    onboardingDigitalWalletPage = new OnboardingDigitalWalletPage(page);
    await loginPage.navigateTo();
  });

  test("test", async () => {
    await onboardingDigitalWalletPage.navigateToLoginPage();
    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();
    await loginPage.expectWelcomeMessage();

    await onboardingDigitalWalletPage.navigateToWelcomePage();
    await onboardingDigitalWalletPage.confirmPublicServantStatus();
    await onboardingDigitalWalletPage.clickContinueButton();
    await onboardingDigitalWalletPage.clickGetGovernmentDigital();
    await onboardingDigitalWalletPage.expectWelcomeMessage();
    await onboardingDigitalWalletPage.clickGetGovernmentDigital();
    await onboardingDigitalWalletPage.clickGetGovernmentDigital();
    await onboardingDigitalWalletPage.clickContinueButton();
    await onboardingDigitalWalletPage.expectHeading(
      ONBOARDING_TEXTS.yourDeviceHeading,
    );
    await onboardingDigitalWalletPage.confirmAndContinue();
    await onboardingDigitalWalletPage.expectErrorMessage();
    await onboardingDigitalWalletPage.clickAppleIOSOption();
    await onboardingDigitalWalletPage.confirmAndContinue();
    await onboardingDigitalWalletPage.fillEmailAddress(
      "rodrigo.guimaraes+dev@gmail.com",
    );
    await onboardingDigitalWalletPage.expectHeading(
      ONBOARDING_TEXTS.yourDeviceHeading,
    );
    await onboardingDigitalWalletPage.clickGetGovernmentDigital();
    await onboardingDigitalWalletPage.confirmAndContinue();
    await onboardingDigitalWalletPage.expectTextInBody(
      "HomeDigital Wallet onboardingCheck your detailsCheck your detailsThese details",
    );
    await onboardingDigitalWalletPage.expectTextInBody("First name");
    await onboardingDigitalWalletPage.expectTextInBody("Last name");
    await onboardingDigitalWalletPage.expectTextInBody("MyGovID email");
    await onboardingDigitalWalletPage.confirmAndContinue();
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.thankYouText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.processingText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.whatHappensNext,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.receiveEmailText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.summaryText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.applicationForText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.governmentDigitalWalletText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.dateOfApplicationText,
    );
    await onboardingDigitalWalletPage.returnToLifeEvents();
    await onboardingDigitalWalletPage.expectHeading(
      ONBOARDING_TEXTS.applicationQueueText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.teamProcessingText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.yourGovernmentDigitalWalletText,
    );
    await onboardingDigitalWalletPage.expectTextInBody(
      ONBOARDING_TEXTS.notificationReadyText,
    );
  });
});
