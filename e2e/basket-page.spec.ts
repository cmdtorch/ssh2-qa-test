import { expect, test, type Page } from "@playwright/test";

import { freshCatalog, setPrice } from "./support/backend";
import { BASKET_KEY, readStorage, seedStorage, type BasketLine } from "./support/browser";

const counter = (page: Page) => page.getByTestId("basket-counter");
const lines = (page: Page) => page.locator("main ul li");
const line = (page: Page, name: string) => lines(page).filter({ hasText: name });

const TWO: BasketLine[] = [
  { slug: "chanel-gabrielle", volume: 30, quantity: 2 },
  { slug: "creed-aventus", volume: 50, quantity: 1 },
];

test.beforeEach(() => {
  freshCatalog();
});

// @case basket :: Two lines and the total
test("two lines and the total", async ({ page }) => {
  await seedStorage(page, { basket: TWO });
  await page.goto("/products");
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket$/);
  await expect(lines(page)).toHaveCount(2);
  const gabrielle = line(page, "Chanel Gabrielle");
  const aventus = line(page, "Creed Aventus");
  for (const [row, size, qty, unit, total] of [
    [gabrielle, "30 ml", "2", "$40", "$80"],
    [aventus, "50 ml", "1", "$150", "$150"],
  ] as const) {
    const img = row.locator("img");
    await expect(img).toHaveAttribute("alt", /Chanel Gabrielle|Creed Aventus/);
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect(row).toContainText(size);
    await expect(row.getByTestId("quantity")).toHaveText(qty);
    await expect(row.getByTestId("unit-price")).toHaveText(unit);
    await expect(row.getByTestId("line-total")).toHaveText(total);
  }
  await expect(page.getByTestId("basket-total")).toHaveText("$230");
  await expect(page.getByRole("button", { name: /checkout|pay|order/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /checkout|pay|order/i })).toHaveCount(0);
});

// @case basket :: Clicking a line name
test("clicking a line name opens the product", async ({ page }) => {
  await seedStorage(page, { basket: [{ slug: "creed-aventus", volume: 50, quantity: 1 }] });
  await page.goto("/basket");
  await expect(line(page, "Creed Aventus")).toHaveCount(1);
  await page.getByRole("link", { name: "Creed Aventus" }).click();
  await expect(page).toHaveURL(/\/products\/creed-aventus$/);
});

// @case basket :: Plus on a line updates all totals
test("plus on a line updates all totals", async ({ page }) => {
  await seedStorage(page, { basket: TWO });
  await page.goto("/basket");
  await expect(page.getByTestId("basket-total")).toHaveText("$230");
  await expect(counter(page)).toHaveText("3");
  const gabrielle = line(page, "Chanel Gabrielle");
  await gabrielle.getByRole("button", { name: "Increase quantity" }).click();
  await expect(gabrielle.getByTestId("quantity")).toHaveText("3");
  await expect(gabrielle.getByTestId("line-total")).toHaveText("$120");
  await expect(page.getByTestId("basket-total")).toHaveText("$270");
  await expect(counter(page)).toHaveText("4");
});

// @case basket :: Removing one of two lines
test("removing one of two lines", async ({ page }) => {
  await seedStorage(page, { basket: TWO });
  await page.goto("/basket");
  await expect(lines(page)).toHaveCount(2);
  await line(page, "Chanel Gabrielle").getByRole("button", { name: "Remove from basket" }).click();
  await expect(lines(page)).toHaveCount(1);
  await expect(line(page, "Creed Aventus")).toHaveCount(1);
  await expect(page.getByText("Chanel Gabrielle")).toHaveCount(0);
  await expect(page.getByTestId("basket-total")).toHaveText("$150");
  await expect(counter(page)).toHaveText("1");
});

// @case basket :: Basket shows the new sale price
test("the basket shows the new sale price", async ({ page }) => {
  await page.goto("/products/chanel-gabrielle");
  await page.getByRole("button", { name: /^30 ml/ }).click();
  await expect(page.getByTestId("top-price")).toContainText("$40");
  await page.getByRole("button", { name: "Add to basket" }).click();
  await expect(page.getByRole("status")).toHaveText("Added to basket");
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }]);
  setPrice("chanel-gabrielle", 30, "60", "35"); // the admin changes the 30 ml sale price to $35
  await page.getByRole("link", { name: "Basket" }).click();
  const row = line(page, "Chanel Gabrielle");
  await expect(row.getByTestId("unit-price")).toHaveText("$35");
  await expect(row.getByTestId("line-total")).toHaveText("$35");
  await expect(page.getByTestId("basket-total")).toHaveText("$35");
});

// @case basket :: Empty basket message and link
test("an empty basket shows a message and a link to the catalog", async ({ page }) => {
  await page.goto("/basket");
  await expect(page.getByText("Your basket is empty")).toBeVisible();
  await page.locator("main").getByRole("link").click();
  await expect(page).toHaveURL(/\/products$/);
});

// @case basket :: Removing the last line empties the basket
test("removing the last line empties the basket", async ({ page }) => {
  await seedStorage(page, { basket: [{ slug: "creed-aventus", volume: 50, quantity: 1 }] });
  await page.goto("/basket");
  await expect(counter(page)).toHaveText("1");
  await line(page, "Creed Aventus").getByRole("button", { name: "Remove from basket" }).click();
  await expect(page.getByText("Your basket is empty")).toBeVisible();
  await expect(counter(page)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Basket" })).toHaveText("");
});

// @case basket :: Keyboard-only removal
test("a line is removed by keyboard only", async ({ page }) => {
  await seedStorage(page, {
    basket: [
      { slug: "creed-aventus", volume: 50, quantity: 1 },
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ],
  });
  await page.goto("/basket");
  await expect(lines(page)).toHaveCount(2);
  const target = line(page, "Creed Aventus").getByRole("button", { name: "Remove from basket" });
  for (let i = 0; i < 60; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(lines(page)).toHaveCount(1);
  await expect(line(page, "Dior Sauvage")).toHaveCount(1);
  await expect(page.getByText("Creed Aventus")).toHaveCount(0);
});
