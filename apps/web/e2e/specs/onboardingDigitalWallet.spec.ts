import { test, expect } from "@playwright/test";
import { LoginPage } from "../objects/loginPage";
import { OnboardingPage } from "../objects/onboardingDigitalWallet";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";

test("Onboarding Digital Wallet @smoke @onboarding @blocker", async ({
  page,
}) => {
  let loginPage: LoginPage;
  let onboardingPage: OnboardingPage;

  loginPage = new LoginPage(page);
  onboardingPage = new OnboardingPage(page);

  await allure.description(
    "This test verifies the flow for Onboarding a digital wallet.",
  );
  await allure.owner("OGCIO");
  await allure.tags("Login", "Essentials", "Authentication");
  await allure.severity(Severity.BLOCKER);

  await onboardingPage.navigateToOnboarding();
  await onboardingPage.fillPassword("123");
  await loginPage.clickSubmit();
  await onboardingPage.expectWelcomeMessage();
  await expect(
    page.getByLabel("I confirm that I am a public"),
  ).not.toBeChecked();
  await onboardingPage.expectPublicServantConsentText();
  await onboardingPage.clickContinue();
  await onboardingPage.expectContinueError();
  await onboardingPage.checkPublicServantCheckbox();
  await expect(page.getByLabel("I confirm that I am a public")).toBeChecked();
  await onboardingPage.clickContinue();
  await onboardingPage.expectLifeEventsText();
  await onboardingPage.expectDigitalWalletText();
  await onboardingPage.clickGetDigitalWallet();
  await onboardingPage.expectBeforeYouStartText();
  await onboardingPage.clickContinue();
  await onboardingPage.clickContinueEmail();
  await onboardingPage.expectWorkEmailError();
  await onboardingPage.expectEmptyWorkEmail();
  await onboardingPage.fillEmail("rod@rod.com");
  await expect(page.locator("#govIEEmail")).toHaveValue("rod@rod.com");
  await onboardingPage.clickContinueEmail();
  await onboardingPage.expectDeviceOptionsText();
  await onboardingPage.clickContinueEmail();
  await onboardingPage.expectDeviceTypeError();
  await onboardingPage.selectDeviceOption("Android (eg. Samsung, Google");
  await onboardingPage.expectDeviceOptionsText();
  await onboardingPage.clickContinueEmail();
  await onboardingPage.fillGooglePlayStoreEmail("2@2.com");
  await onboardingPage.clickContinueEmail();
  await onboardingPage.expectCheckYourDetailsText();
  await onboardingPage.clickContinueEmail();
  await onboardingPage.expectApplicationSuccessfulText();
  await onboardingPage.expectThankYouText();
  await onboardingPage.expectWhatHappensNextText();
  await onboardingPage.clickReturnToLifeEvents();
  await onboardingPage.expectDigitalWalletProcessingText();
});
