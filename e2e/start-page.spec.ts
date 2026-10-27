import { expect, test } from "@playwright/test";

// @scenario web-app :: Start page opens
// @case web-app :: Start page has exactly one heading
// @scenario dev-environment :: Start page opens in the browser
// @case dev-environment :: E2E check of the start page
test("start page answers 200 and shows exactly one non-empty h1", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const headings = page.locator("h1");
  await expect(headings).toHaveCount(1);
  await expect(headings).not.toHaveText(/^\s*$/);
});
