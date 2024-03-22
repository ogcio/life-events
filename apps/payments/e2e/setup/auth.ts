import { test, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

const baseURL = process.env.HOST_URL ?? "http://localhost:3001";

test("Setup Test", async ({ page }) => {
  await page.goto("/");

  expect(page.url()).toEqual(
    expect.stringContaining("http://localhost:8000/static/login/"),
  );

  const pwInput = await page.getByRole("textbox");
  await pwInput.click();
  await pwInput.fill("123");
  const loginBtn = await page.getByRole("button");
  await loginBtn.click();

  expect(page.url()).toBe(`${baseURL}/en/paymentSetup`);

  await page.context().storageState({ path: authFile });
});
