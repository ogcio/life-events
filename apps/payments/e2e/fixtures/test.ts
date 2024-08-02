import { test as baseTest, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { MyGovIdMockLoginPage } from "../objects/MyGovIdMockLoginPage";
import { password, myGovIdMockSettings } from "../utils/constants";

const baseURL =
  process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT ??
  "http://localhost:3001";
const loginUrl = process.env.LOGTO_ENDPOINT ?? "http://localhost:3301/";

export * from "@playwright/test";
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }

      const page = await browser.newPage({ storageState: undefined });

      await page.goto(baseURL);
      expect(page.url()).toEqual(expect.stringContaining(loginUrl));

      const logtoLoginBtn = await page.getByRole("button", {
        name: "Continue with MyGovId",
      });
      await logtoLoginBtn.click();

      const loginPage = new MyGovIdMockLoginPage(page);

      await loginPage.selectPublicServantUser(
        myGovIdMockSettings.publicServantUser,
      );
      await loginPage.enterPassword(password);
      await loginPage.submitLogin(myGovIdMockSettings.publicServantUser);

      await loginPage.expectPaymentSetupPage();

      await page.context().storageState({ path: fileName });

      await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
});
