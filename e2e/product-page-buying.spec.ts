import { expect, test, type Page } from "@playwright/test";

import { freshCatalog, setPrice } from "./support/backend";
import { BASKET_KEY, WISHLIST_KEY, readStorage, seedStorage, type BasketLine } from "./support/browser";

const SLUG = "chanel-gabrielle";
const size = (page: Page, volume: number) => page.getByRole("button", { name: new RegExp(`^${volume} ml`) });
const price = (page: Page) => page.getByTestId("top-price");
const quantity = (page: Page) => page.getByTestId("quantity");
const plus = (page: Page) => page.getByRole("button", { name: "Increase quantity" });
const minus = (page: Page) => page.getByRole("button", { name: "Decrease quantity" });
const add = (page: Page) => page.getByRole("button", { name: "Add to basket" });
const message = (page: Page) => page.getByRole("status");

test.beforeEach(() => {
  freshCatalog();
});

// @case product-page :: Default 30 ml chosen with its price
test("the default 30 ml size is chosen with its price", async ({ page }) => {
  setPrice(SLUG, 30, "40"); // the case names a plain $40 price, the seed has $60 -> $40
  await page.goto(`/products/${SLUG}`);
  await expect(size(page, 15)).toHaveText("15 ml $20");
  await expect(size(page, 30)).toHaveText("30 ml $40");
  await expect(size(page, 50)).toHaveText("50 ml $80");
  await expect(size(page, 30)).toHaveAttribute("aria-pressed", "true");
  await expect(size(page, 15)).toHaveAttribute("aria-pressed", "false");
  await expect(size(page, 50)).toHaveAttribute("aria-pressed", "false");
  await expect(price(page)).toHaveText("$40");
});

// @case product-page :: Choosing 50 ml shows $80
test("choosing 50 ml shows $80", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await expect(size(page, 30)).toHaveAttribute("aria-pressed", "true");
  await size(page, 50).click();
  await expect(size(page, 50)).toHaveAttribute("aria-pressed", "true");
  await expect(size(page, 30)).toHaveAttribute("aria-pressed", "false");
  await expect(price(page)).toHaveText("$80");
});

// @case product-page :: Discounted size shows the struck regular price
test("a discounted size shows the struck regular price", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await size(page, 30).click();
  await expect(price(page).locator("s")).toHaveText("$60");
  await expect(price(page)).toHaveText(/\$60\s*\$40/);
});

// @case product-page :: Quantity 1 and minus inactive on open
test("the quantity is 1 on open, minus inactive and plus active", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await expect(quantity(page)).toHaveText("1");
  await expect(minus(page)).toBeDisabled();
  await expect(plus(page)).toBeEnabled();
});

// @case product-page :: Plus twice and minus once gives 2
test("plus twice and minus once gives 2", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await plus(page).click();
  await plus(page).click();
  await minus(page).click();
  await expect(quantity(page)).toHaveText("2");
});

// @case product-page :: Plus is inactive at 10
test("plus becomes inactive at 10", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await expect(plus(page)).toBeEnabled();
  for (let i = 0; i < 9; i++) await plus(page).click();
  await expect(quantity(page)).toHaveText("10");
  await expect(plus(page)).toBeDisabled();
  await plus(page).click({ force: true });
  await expect(quantity(page)).toHaveText("10");
});

// @case product-page :: Added to basket shown for 3 seconds and quantity reset
test("Added to basket is shown for 3 seconds and the quantity is reset", async ({ page }) => {
  await page.goto(`/products/${SLUG}`);
  await expect(size(page, 30)).toHaveAttribute("aria-pressed", "true");
  for (let i = 0; i < 2; i++) await plus(page).click();
  await expect(quantity(page)).toHaveText("3");
  await add(page).click();
  await expect(message(page)).toHaveText("Added to basket");
  await expect(quantity(page)).toHaveText("1");
  await page.waitForTimeout(3000);
  await expect(message(page)).not.toHaveText("Added to basket");
});

// @case product-page :: Adding 5 to 8 shows the limit message
test("adding 5 to 8 shows the limit message", async ({ page }) => {
  await seedStorage(page, { basket: [{ slug: SLUG, volume: 30, quantity: 8 }] });
  await page.goto(`/products/${SLUG}`);
  for (let i = 0; i < 4; i++) await plus(page).click();
  await expect(quantity(page)).toHaveText("5");
  await add(page).click();
  await expect(message(page)).toHaveText("You can add at most 10 of one product");
  await expect(page.getByText("Added to basket")).toHaveCount(0);
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([{ slug: SLUG, volume: 30, quantity: 10 }]);
});

// @case product-page :: Add 50 ml times 2 to an empty basket
test("50 ml times 2 is added to an empty basket", async ({ page }) => {
  await seedStorage(page, { basket: [] });
  await page.goto(`/products/${SLUG}`);
  await size(page, 50).click();
  await plus(page).click();
  await expect(quantity(page)).toHaveText("2");
  await add(page).click();
  await expect(message(page)).toHaveText("Added to basket");
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([{ slug: SLUG, volume: 50, quantity: 2 }]);
  await expect(page.getByTestId("basket-counter")).toHaveText("2");
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket$/);
  await expect(page.locator("main")).toContainText("Chanel Gabrielle");
  await expect(page.locator("main")).toContainText("50 ml");
});

// @case product-page :: Heart adds the product
test("the heart adds the product to the wishlist", async ({ page }) => {
  await seedStorage(page, { wishlist: [] });
  await page.goto(`/products/${SLUG}`);
  await page.getByRole("button", { name: "Add to wishlist" }).click();
  await expect(page.getByRole("button", { name: "Remove from wishlist" })).toHaveAttribute("data-filled", "true");
  await page.getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(page.getByRole("heading", { name: "Chanel Gabrielle" })).toBeVisible();
  expect(await readStorage<string[]>(page, WISHLIST_KEY)).toEqual([SLUG]);
});

// @case product-page :: Filled heart removes the product
test("the filled heart removes the product from the wishlist", async ({ page }) => {
  await seedStorage(page, { wishlist: [SLUG] });
  await page.goto(`/products/${SLUG}`);
  await page.getByRole("button", { name: "Remove from wishlist" }).click();
  await expect(page.getByRole("button", { name: "Add to wishlist" })).toHaveAttribute("data-filled", "false");
  await page.getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(page.getByRole("heading", { name: "Chanel Gabrielle" })).toHaveCount(0);
});

// @case product-page :: Keyboard-only add to basket
test("keyboard-only add to basket", async ({ page }) => {
  await seedStorage(page, { basket: [] });
  await page.goto(`/products/${SLUG}`);
  await expect(size(page, 30)).toHaveAttribute("aria-pressed", "true");
  const key = async (target: ReturnType<typeof size>, k: string, maxTabs = 60) => {
    for (let i = 0; i < maxTabs; i++) {
      if (await target.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(target).toBeFocused();
    await page.keyboard.press(k);
  };
  await key(size(page, 50), "Enter");
  await expect(size(page, 50)).toHaveAttribute("aria-pressed", "true");
  await key(plus(page), "Space");
  await expect(quantity(page)).toHaveText("2");
  await key(add(page), "Enter");
  await expect(message(page)).toHaveText("Added to basket");
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([{ slug: SLUG, volume: 50, quantity: 2 }]);
});
