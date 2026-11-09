import { expect, test, type Page } from "@playwright/test";

import { freshCatalog, hideProduct } from "./support/backend";
import { buildCatalog } from "./support/catalog";
import { editProduct, setSharedTexts } from "./support/product";

const SLUG = "chanel-gabrielle";
const DETAIL = `**/api/products/${SLUG}/`;
const toggle = (page: Page, title: string) =>
  page.getByRole("heading", { level: 2, name: new RegExp(`^${title}`) }).getByRole("button");

test.beforeEach(() => {
  freshCatalog();
});

// @case product-page :: Ingredients collapse and expand
test("ingredients collapse and expand", async ({ page }) => {
  const text = "Alcohol, Parfum (Fragrance), Aqua (Water)";
  editProduct(SLUG, { ingredients: text });
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByText(text)).toBeVisible();
  await expect(toggle(page, "Ingredients")).toContainText("−");
  await toggle(page, "Ingredients").click();
  await expect(page.getByText(text)).toHaveCount(0);
  await expect(toggle(page, "Ingredients")).toContainText("+");
  await toggle(page, "Ingredients").click();
  await expect(page.getByText(text)).toBeVisible();
});

// @case product-page :: Description and notes collapse and expand
test("description and notes collapse and expand", async ({ page }) => {
  editProduct(SLUG, {
    description: "A bright floral fragrance.",
    top_notes: "African Marigold, Bergamot, Buchu",
    heart_notes: "Cyclamen, Violet",
    base_notes: "Cedarwood, Vetiver",
  });
  await page.goto(`/products/${SLUG}`);
  const texts = ["A bright floral fragrance.", "African Marigold, Bergamot, Buchu", "Cyclamen, Violet", "Cedarwood, Vetiver"];
  for (const t of texts) await expect(page.getByText(t)).toBeVisible();
  await toggle(page, "Product description").click();
  await toggle(page, "Notes").click();
  for (const t of texts) await expect(page.getByText(t)).toHaveCount(0);
  for (const l of ["Top notes", "Heart notes", "Base notes"]) await expect(page.getByText(l)).toHaveCount(0);
  await toggle(page, "Product description").click();
  await toggle(page, "Notes").click();
  for (const t of texts) await expect(page.getByText(t)).toBeVisible();
  for (const l of ["Top notes", "Heart notes", "Base notes"]) await expect(page.getByText(l)).toBeVisible();
});

// @case product-page :: Questions block shows the shared text
test("the Questions block shows the shared text", async ({ page }) => {
  const text = "How long does a scent last? Up to 8 hours.";
  setSharedTexts({ questions: text });
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByText(text)).toHaveCount(0);
  await expect(toggle(page, "Questions")).toHaveAttribute("aria-expanded", "false");
  await toggle(page, "Questions").click();
  await expect(page.getByText(text)).toBeVisible();
});

// @case product-page :: Shipping block shows the shared text
test("the Shipping & handling block shows the shared text", async ({ page }) => {
  const text = "Free delivery over $100";
  setSharedTexts({ shipping: text });
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByText(text)).toHaveCount(0);
  await expect(toggle(page, "Shipping & handling")).toHaveAttribute("aria-expanded", "false");
  await toggle(page, "Shipping & handling").click();
  await expect(page.getByText(text)).toBeVisible();
});

// @case product-page :: Size block collapses and keeps the choice
test("the Size block collapses and keeps the choice", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  const size50 = page.getByRole("button", { name: /^50 ml/ });
  await size50.click();
  await expect(size50).toHaveAttribute("aria-pressed", "true");
  await toggle(page, "Size").click();
  await expect(page.getByRole("button", { name: /^\d+ ml/ })).toHaveCount(0);
  await toggle(page, "Size").click();
  await expect(page.getByRole("button", { name: /^15 ml/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^30 ml/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^50 ml/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("top-price")).toHaveText("$80");
});

// @case product-page :: Four related women's cards
test("four related women's cards without the product itself", async ({ page }) => {
  buildCatalog([
    { name: "Chanel Gabrielle", gender: "women" },
    { name: "Chanel No. 5", gender: "women" },
    { name: "Dior J'adore", gender: "women" },
    { name: "YSL Libre", gender: "women" },
    { name: "Burberry Goddess", gender: "women" },
    { name: "Lancome Idole", gender: "women" },
    { name: "Dior Sauvage", gender: "men" },
  ]);
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByRole("heading", { name: "YOU MAY ALSO LIKE" })).toBeVisible();
  const cards = page.getByRole("list", { name: "Related products" }).getByRole("listitem");
  await expect(cards).toHaveCount(4);
  const names = await cards.locator("h3").allTextContents();
  const women = ["Chanel No. 5", "Dior J'adore", "YSL Libre", "Burberry Goddess", "Lancome Idole"];
  for (const n of names) expect(women).toContain(n);
  expect(names).not.toContain("Chanel Gabrielle");
  expect(new Set(names).size).toBe(4);
});

// @case product-page :: Clicking a related card
test("clicking a related card opens its product", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  const cards = page.getByRole("list", { name: "Related products" }).getByRole("listitem");
  await expect(cards.filter({ hasText: "YSL Libre" })).toHaveCount(1);
  await cards.filter({ hasText: "YSL Libre" }).getByRole("link").first().click();
  await expect(page).toHaveURL(/\/products\/ysl-libre$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("YSL LIBRE");
});

// @case product-page :: Unknown product shows Page not found
test("an unknown product shows Page not found with status 404", async ({ page }) => {
  const response = await page.goto("/products/no-such-perfume");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to catalog" })).toBeVisible();
});

// @case product-page :: Unknown site address shows Page not found
test("an unknown site address shows Page not found with header and footer", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to catalog" })).toBeVisible();
});

// @case product-page :: Back to catalog opens the catalog
test("Back to catalog opens the catalog", async ({ page }) => {
  await page.goto("/no-such-page");
  await page.getByRole("link", { name: "Back to catalog" }).click();
  await expect(page).toHaveURL(/\/products$/);
});

// @case product-page :: Hidden product shows Page not found
test("a hidden product shows Page not found with status 404", async ({ page }) => {
  hideProduct(SLUG);
  const response = await page.goto(`/products/${SLUG}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
});

// @case product-page :: Grey placeholders before the product arrives
test("grey placeholders are shown until the product arrives", async ({ page }) => {
  await page.route(DETAIL, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByTestId("photo-placeholder")).toBeVisible();
  await expect(page.getByTestId("name-placeholder")).toBeVisible();
  await expect(page.getByTestId("price-placeholder")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("CHANEL GABRIELLE");
  await expect(page.getByTestId("photo-placeholder")).toHaveCount(0);
});

// @case product-page :: Server error then successful retry
test("a server error then a successful retry", async ({ page }) => {
  await page.route(DETAIL, (route) => route.fulfill({ status: 500, body: "error" }));
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByText("Could not load the product")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await page.unroute(DETAIL);
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("CHANEL GABRIELLE");
});

// @case product-page :: Network failure shows the product error
test("a network failure shows the product error", async ({ page }) => {
  await page.route(DETAIL, (route) => route.abort("connectionrefused"));
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByText("Could not load the product")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

// @case product-page :: 375 px product page
test("the product page fits a 375 px window", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(`/products/${SLUG}`);
  const add = page.getByRole("button", { name: "Add to basket" });
  await expect(add).toBeVisible();
  const widths = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths.doc).toBeLessThanOrEqual(375);
  expect(widths.body).toBeLessThanOrEqual(375);
  const box = await add.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
});
