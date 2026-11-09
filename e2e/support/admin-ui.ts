import { expect, type Browser } from "@playwright/test";

import { createSuperuser } from "./backend";
import { adminLogin, adminUrl } from "./browser";

// Admin actions performed through the real Django admin pages.

async function inAdmin(
  browser: Browser,
  productName: string,
  act: (page: import("@playwright/test").Page) => Promise<void>,
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await adminLogin(page, createSuperuser());
  await page.goto(adminUrl("/admin/catalog/product/"));
  await page.getByRole("link", { name: productName }).first().click();
  await act(page);
  await expect(page.locator(".success")).toBeVisible();
  await context.close();
}

/** Turns "show on site" off for a product. */
export const hideInAdmin = (browser: Browser, productName: string) =>
  inAdmin(browser, productName, async (page) => {
    await page.locator("#id_show_on_site").uncheck();
    await page.locator('input[name="_save"]').click();
  });

/** Deletes a product. */
export const deleteInAdmin = (browser: Browser, productName: string) =>
  inAdmin(browser, productName, async (page) => {
    await page.locator("a.deletelink").click();
    await page.locator('input[type="submit"]').click();
  });
