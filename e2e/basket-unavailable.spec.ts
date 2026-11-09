import { expect, test, type Page } from "@playwright/test";

import { deleteInAdmin, hideInAdmin } from "./support/admin-ui";
import { deleteSize, freshCatalog } from "./support/backend";
import {
  AVAILABILITY,
  BASKET_KEY,
  WISHLIST_KEY,
  failAvailability,
  readStorage,
  seedStorage,
  type BasketLine,
} from "./support/browser";

const REMOVED = "Some products are no longer available and were removed";
const counter = (page: Page) => page.getByTestId("basket-counter");
const lines = (page: Page) => page.locator("main ul li");

test.beforeEach(() => {
  freshCatalog();
});

// @case basket :: Unreachable backend keeps the basket
test("an unreachable backend keeps the basket", async ({ page }) => {
  await seedStorage(page, {
    basket: [
      { slug: "chanel-gabrielle", volume: 30, quantity: 1 },
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ],
  });
  await failAvailability(page);
  const failed = page.waitForEvent("requestfailed", (r) => r.url().includes("/api/products/availability/"));
  await page.goto("/products/dior-sauvage");
  await failed;
  await expect(page.getByRole("heading", { name: "Dior Sauvage" })).toBeVisible();
  await expect(counter(page)).toHaveText("2");
  await expect(page.getByText(REMOVED)).toHaveCount(0);
  expect((await readStorage<BasketLine[]>(page, BASKET_KEY))?.length).toBe(2);
  await page.unroute(AVAILABILITY);
  const again = page.waitForRequest((r) => r.url().includes("/api/products/availability/"));
  await page.goto("/products");
  await again;
  await expect(page.getByText(REMOVED)).toHaveCount(0);
  await expect(counter(page)).toHaveText("2");
});

// @case basket :: Hidden product disappears from the basket page
test("a hidden product disappears from the basket page", async ({ page, browser }) => {
  await seedStorage(page, {
    basket: [
      { slug: "chanel-gabrielle", volume: 30, quantity: 1 },
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ],
  });
  await hideInAdmin(browser, "Chanel Gabrielle");
  await page.goto("/basket");
  await expect(lines(page)).toHaveCount(1);
  await expect(lines(page).first()).toContainText("Dior Sauvage");
  await expect(lines(page).first()).toContainText("100 ml");
  await expect(page.getByText("Chanel Gabrielle")).toHaveCount(0);
  await expect(page.getByText(REMOVED)).toBeVisible();
});

// @case basket :: Deleted size noticed on the catalog
test("a deleted size is noticed on the catalog", async ({ page }) => {
  await seedStorage(page, {
    basket: [
      { slug: "chanel-gabrielle", volume: 15, quantity: 2 },
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ],
  });
  await page.goto("/products");
  await expect(counter(page)).toHaveText("3");
  deleteSize("chanel-gabrielle", 15);
  await page.goto("/products");
  await expect(page.getByText(REMOVED)).toBeVisible();
  await expect(counter(page)).toHaveText("1");
});

// @case basket :: Deleted product removed from the basket
test("a deleted product is removed from the basket", async ({ page, browser }) => {
  await seedStorage(page, {
    basket: [
      { slug: "creed-aventus", volume: 50, quantity: 1 },
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ],
  });
  await deleteInAdmin(browser, "Creed Aventus");
  await page.goto("/basket");
  await expect(lines(page)).toHaveCount(1);
  await expect(lines(page).first()).toContainText("Dior Sauvage");
  await expect(lines(page).first()).toContainText("100 ml");
  await expect(page.getByText("Creed Aventus")).toHaveCount(0);
  await expect(page.getByText(REMOVED)).toBeVisible();
});

// @case basket :: Start page makes no backend call
test("the start page makes no backend call", async ({ page, browser }) => {
  await seedStorage(page, { basket: [{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }] });
  await hideInAdmin(browser, "Chanel Gabrielle");
  const backendCalls: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.pathname.startsWith("/api/") || url.port === "18000") backendCalls.push(r.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await expect(page.getByText(REMOVED)).toHaveCount(0);
  expect(backendCalls).toEqual([]);
});

// @case basket :: One message when both lose the same product
test("one message when basket and wishlist lose the same product", async ({ page, browser }) => {
  await seedStorage(page, {
    basket: [{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }],
    wishlist: ["chanel-gabrielle"],
  });
  await hideInAdmin(browser, "Chanel Gabrielle");
  await page.goto("/products");
  await expect(page.getByText(REMOVED)).toHaveCount(1);
  await expect(counter(page)).toHaveCount(0);
  expect(await readStorage<BasketLine[]>(page, BASKET_KEY)).toEqual([]);
  expect(await readStorage<string[]>(page, WISHLIST_KEY)).toEqual([]);
  await page.getByRole("link", { name: "Wishlist" }).click();
  await expect(page.getByText("Your wishlist is empty")).toBeVisible();
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page.getByText("Your basket is empty")).toBeVisible();
});

// @case basket :: Basket error then retry
test("a basket error can be retried", async ({ page }) => {
  await seedStorage(page, { basket: [{ slug: "dior-sauvage", volume: 100, quantity: 1 }] });
  await failAvailability(page);
  await page.goto("/basket");
  await expect(page.getByText("Could not load the basket")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await page.unroute(AVAILABILITY);
  await page.getByRole("button", { name: "Retry" }).click();
  const row = lines(page).filter({ hasText: "Dior Sauvage" });
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId("unit-price")).toHaveText("$130");
});
