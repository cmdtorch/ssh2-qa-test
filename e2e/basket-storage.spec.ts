import { expect, test, type Page } from "@playwright/test";

import { freshCatalog } from "./support/backend";
import { BASKET_KEY, blockStorage, readStorage, seedStorage, type BasketLine } from "./support/browser";

const SLUG = "chanel-gabrielle";
const STORAGE = "Your choices will not be saved after you close this page";
const LIMIT = "You can add at most 10 of one product";
const size = (page: Page, volume: number) => page.getByRole("button", { name: new RegExp(`^${volume} ml`) });
const quantity = (page: Page) => page.getByTestId("quantity");
const plus = (page: Page) => page.getByRole("button", { name: "Increase quantity" });
const add = (page: Page) => page.getByRole("button", { name: "Add to basket" });
const counter = (page: Page) => page.getByTestId("basket-counter");

test.beforeEach(() => {
  freshCatalog();
});

// @case basket :: Basket line survives a reload
test("a basket line survives a reload", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await size(page, 50).click();
  await plus(page).click();
  await expect(quantity(page)).toHaveText("2");
  await add(page).click();
  await expect(page.getByRole("status")).toHaveText("Added to basket");
  await page.reload();
  await expect(counter(page)).toHaveText("2");
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([{ slug: SLUG, volume: 50, quantity: 2 }]);
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket$/);
  const line = page.locator("main ul li");
  await expect(line).toHaveCount(1);
  await expect(line).toContainText("Chanel Gabrielle");
  await expect(line).toContainText("50 ml");
  await expect(line.getByTestId("quantity")).toHaveText("2");
  await expect(counter(page)).toHaveText("2");
});

// @case basket :: Basket survives closing the tab
test("the basket survives closing the tab", async ({ page, context }) => {
  await seedStorage(page, { basket: [{ slug: "dior-sauvage", volume: 100, quantity: 1 }] });
  await page.goto("/products/dior-sauvage");
  await expect(counter(page)).toHaveText("1");
  await page.close();
  const fresh = await context.newPage();
  await fresh.goto("/basket");
  const line = fresh.locator("main ul li");
  await expect(line).toHaveCount(1);
  await expect(line).toContainText("Dior Sauvage");
  await expect(line).toContainText("100 ml");
  await expect(line.getByTestId("quantity")).toHaveText("1");
});

// @case basket :: 8 plus 5 is capped at 10
test("8 plus 5 is capped at 10", async ({ page }) => {
  await seedStorage(page, { basket: [{ slug: SLUG, volume: 30, quantity: 8 }] });
  await page.goto(`/products/${SLUG}`);
  for (let i = 0; i < 4; i++) await plus(page).click();
  await expect(quantity(page)).toHaveText("5");
  await add(page).click();
  await expect(page.getByRole("status")).toHaveText(LIMIT);
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([{ slug: SLUG, volume: 30, quantity: 10 }]);
  await expect(counter(page)).toHaveText("10");
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page.locator("main ul li").getByTestId("quantity")).toHaveText("10");
});

// @case basket :: Blocked storage still adds to the basket
test("blocked storage still adds to the basket", async ({ page }) => {
  await blockStorage(page);
  await page.goto(`/products/${SLUG}`);
  await add(page).click();
  await expect(page.getByText(STORAGE)).toBeVisible();
  await expect(counter(page)).toHaveText("1");
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket$/);
  const line = page.locator("main ul li");
  await expect(line).toHaveCount(1);
  await expect(line).toContainText("Chanel Gabrielle");
  await expect(line).toContainText("30 ml");
  await expect(line.getByTestId("quantity")).toHaveText("1");
  await expect(counter(page)).toHaveText("1");
});

// @case basket :: Counter shows units across lines
test("the counter shows units across lines", async ({ page }) => {
  await seedStorage(page, {
    basket: [
      { slug: SLUG, volume: 30, quantity: 2 },
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ],
  });
  await page.goto("/products");
  await expect(page.getByRole("list", { name: "Products" }).getByRole("listitem").first()).toBeVisible();
  await expect(counter(page)).toHaveText("3");
});

// @case basket :: Counter goes from 3 to 5 without reload
test("the counter goes from 3 to 5 without a reload", async ({ page }) => {
  await seedStorage(page, { basket: [{ slug: SLUG, volume: 30, quantity: 3 }] });
  await page.goto("/products/creed-aventus");
  await expect(counter(page)).toHaveText("3");
  let loads = 0;
  page.on("load", () => loads++);
  await plus(page).click();
  await expect(quantity(page)).toHaveText("2");
  await add(page).click();
  await expect(counter(page)).toHaveText("5");
  expect(loads).toBe(0);
});
