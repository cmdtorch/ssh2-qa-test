import { expect, test, type Page } from "@playwright/test";

import { freshCatalog } from "./support/backend";
import { editProduct, setPhotoCount } from "./support/product";

const SLUG = "chanel-gabrielle";
const photo = (page: Page) => page.getByTestId("gallery-photo");
const thumbs = (page: Page) =>
  page.getByRole("list", { name: "Photo thumbnails" }).getByRole("button");
const next = (page: Page) => page.getByRole("button", { name: "Next photo" });
const prev = (page: Page) => page.getByRole("button", { name: "Previous photo" });
const photoSrc = (n: number) => new RegExp(`${SLUG}-photo-${n}[^/]*\\.png`);

test.beforeEach(() => {
  freshCatalog();
});

// @case product-page :: Anonymous visitor opens a product page
test("an anonymous visitor sees the heading and breadcrumbs", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("CHANEL GABRIELLE");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText(
    /^Home page\s*\/\s*Products\s*\/\s*Chanel Gabrielle$/,
  );
});

// @case product-page :: Products breadcrumb opens the catalog
test("the Products breadcrumb opens the catalog", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("heading", { name: "PRODUCTS", exact: true })).toBeVisible();
});

// @case product-page :: Home page breadcrumb opens the start page
test("the Home page breadcrumb opens the start page", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Home page" }).click();
  await expect(page).toHaveURL(/^[^?#]*\/$/);
});

// @case product-page :: Descriptor line under the name
test("the descriptor line is shown under the product name", async ({ page }) => {
  editProduct(SLUG, { descriptor_line: "Edp | Floral | Gourmand" });
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByTestId("descriptor-line")).toHaveText("Edp | Floral | Gourmand");
  const name = await page.locator("main p", { hasText: /^Chanel Gabrielle$/ }).boundingBox();
  const line = await page.getByTestId("descriptor-line").boundingBox();
  expect(line!.y).toBeGreaterThan(name!.y);
});

// @case product-page :: Third thumbnail shows the third photo
test("the third thumbnail shows the third photo", async ({ page }) => {
  setPhotoCount(SLUG, 4);
  await page.goto(`/products/${SLUG}`);
  await expect(thumbs(page)).toHaveCount(4);
  await expect(photo(page)).toHaveAttribute("src", photoSrc(1));
  await thumbs(page).nth(2).click();
  await expect(photo(page)).toHaveAttribute("src", photoSrc(3));
  await expect(thumbs(page).nth(2)).toHaveAttribute("aria-current", "true");
});

// @case product-page :: Forward twice then back once
test("forward twice then back once", async ({ page }) => {
  setPhotoCount(SLUG, 4);
  await page.goto(`/products/${SLUG}`);
  await expect(photo(page)).toHaveAttribute("src", photoSrc(1));
  await next(page).click();
  await next(page).click();
  await expect(photo(page)).toHaveAttribute("src", photoSrc(3));
  await prev(page).click();
  await expect(photo(page)).toHaveAttribute("src", photoSrc(2));
});

// @case product-page :: Arrows inactive at first and last photo
test("arrows are inactive at the first and the last photo", async ({ page }) => {
  setPhotoCount(SLUG, 4);
  await page.goto(`/products/${SLUG}`);
  await expect(photo(page)).toHaveAttribute("src", photoSrc(1));
  await expect(prev(page)).toBeDisabled();
  await expect(next(page)).toBeEnabled();
  for (let i = 0; i < 3; i++) await next(page).click();
  await expect(photo(page)).toHaveAttribute("src", photoSrc(4));
  await expect(next(page)).toBeDisabled();
  await expect(prev(page)).toBeEnabled();
});
