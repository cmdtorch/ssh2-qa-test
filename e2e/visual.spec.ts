import os from "node:os";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { freshCatalog } from "./support/backend";
import { editProduct, setPhotoCount } from "./support/product";

// Snapshot steps of the visual check: screenshots go to the system temporary folder.
// The mockups are 2880 px wide (device pixel ratio 2), so the window is 1440 wide.
test.use({ deviceScaleFactor: 2 });

const snap = async (page: Page, name: string) => {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
  await page.screenshot({ path: path.join(os.tmpdir(), `e2e-visual-${name}.png`), fullPage: true });
};

test.beforeAll(() => freshCatalog());

test("snapshot catalog with the sort menu open", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products");
  await expect(page.getByRole("list", { name: "Products" }).getByRole("listitem").first()).toBeVisible();
  await page.getByRole("button", { name: /Sort by/ }).click();
  await snap(page, "catalog-sort-open");
});

test("snapshot catalog with the filter panel open", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 2647 });
  await page.goto("/products");
  await expect(page.getByRole("list", { name: "Products" }).getByRole("listitem").first()).toBeVisible();
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Filter" })).toBeVisible();
  await snap(page, "catalog-filter-open");
});

test("snapshot product page of Chanel Gabrielle", async ({ page }) => {
  setPhotoCount("chanel-gabrielle", 4);
  editProduct("chanel-gabrielle", { descriptor_line: "Edp | Floral | Gourmand" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products/chanel-gabrielle");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await snap(page, "product-detail");
});
