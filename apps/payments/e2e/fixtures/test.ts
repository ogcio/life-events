import { test as baseTest, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const baseURL = process.env.HOST_URL ?? "http://localhost:3001";
const loginUrl = process.env.LOGIN_URL ?? "http://localhost:8000/static/login/";

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

      const pwInput = await page.getByRole("textbox");
      await pwInput.fill("123");
      const loginBtn = await page.getByRole("button");
      await loginBtn.click();

      await page.waitForURL(`${baseURL}/en/paymentSetup`);

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
});
