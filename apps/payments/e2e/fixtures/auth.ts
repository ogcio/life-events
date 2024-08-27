import { test as baseTest, Browser, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { MyGovIdMockLoginPage } from "../objects/MyGovIdMockLoginPage";
import { password, publicServants, citizens } from "../utils/constants";

const baseURL =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT ??
  "http://localhost:3001";
const loginUrl = process.env.LOGTO_ENDPOINT ?? "http://localhost:3301/";

export * from "@playwright/test";

const getWorkerStorageState = async (
  browser: Browser,
  storagePath: string,
  userName: string,
  role: string,
) => {
  const fileName = path.resolve(test.info().project.outputDir, storagePath);

  if (fs.existsSync(fileName)) {
    return fileName;
  }

  const page = await browser.newPage({ storageState: undefined });

  await page.goto(baseURL);
  expect(page.url()).toEqual(expect.stringContaining(loginUrl));

  const logtoLoginBtn = await page.getByRole("button", {
    name: "Continue with MyGovId",
  });
  await logtoLoginBtn.click();

  const loginPage = new MyGovIdMockLoginPage(page);

  await loginPage.selectUser(userName, role);
  await loginPage.enterPassword(password);
  await loginPage.submitLogin(userName);

  if (role === "publicServant") {
    await loginPage.expectPaymentSetupPage();
  } else {
    await loginPage.expectCitizenPaymentsPage();
  }

  await page.context().storageState({ path: fileName });

  await page.close();

  return fileName;
};

export const test = baseTest.extend<
  {},
  {
    pubServantWorkerStorageState: string;
    secondPubServantWorkerStorageState: string;
    userWorkerStorageState: string;
    secondUserWorkerStorageState: string;
  }
>({
  pubServantWorkerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const storagePath = `.auth/public-servant-${id}.json`;

      const fileName = await getWorkerStorageState(
        browser,
        storagePath,
        publicServants[0],
        "publicServant",
      );

      await use(fileName);
    },
    { scope: "worker" },
  ],

  secondPubServantWorkerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const storagePath = `.auth/second-public-servant-${id}.json`;

      const fileName = await getWorkerStorageState(
        browser,
        storagePath,
        publicServants[1],
        "publicServant",
      );

      await use(fileName);
    },
    { scope: "worker" },
  ],

  userWorkerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const storagePath = `.auth/citizen-${id}.json`;

      const fileName = await getWorkerStorageState(
        browser,
        storagePath,
        citizens[0],
        "citizen",
      );

      await use(fileName);
    },
    { scope: "worker" },
  ],

  secondUserWorkerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const storagePath = `.auth/second-citizen-${id}.json`;

      const fileName = await getWorkerStorageState(
        browser,
        storagePath,
        citizens[1],
        "citizen",
      );

      await use(fileName);
    },
    { scope: "worker" },
  ],
});
