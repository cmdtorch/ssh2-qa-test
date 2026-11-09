import { expect, test, type Page } from "@playwright/test";

import {
  createSuperuser,
  freshCatalog,
} from "./support/backend";
import {
  AVAILABILITY,
  WISHLIST_KEY,
  adminLogin,
  adminUrl,
  blockStorage,
  failAvailability,
  readStorage,
  seedStorage,
} from "./support/browser";

const REMOVED = "Some products are no longer available and were removed";
const STORAGE = "Your choices will not be saved after you close this page";

const cards = (page: Page) => page.locator("main ul li");
const header = (page: Page) => page.locator("header");
test.beforeEach(() => {
  freshCatalog();
});

// @case wishlist :: Wishlist survives a reload
test("the wishlist survives a reload", async ({ page }) => {
  await page.goto("/products/chanel-gabrielle");
  await page.getByRole("button", { name: "Add to wishlist" }).click();
  await expect(page.getByRole("button", { name: "Remove from wishlist" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove from wishlist" })).toHaveAttribute("data-filled", "true");
  expect(await readStorage<string[]>(page, WISHLIST_KEY)).toEqual(["chanel-gabrielle"]);
  await header(page).getByRole("link", { name: "Wishlist" }).click();
  await expect(cards(page).getByRole("heading", { name: "Chanel Gabrielle" })).toHaveCount(1);
});

// @case wishlist :: Product is held once
test("a product clicked in two tabs is held once", async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  // The second tab has not yet seen the first tab's change: it keeps showing the empty heart.
  await second.addInitScript(() =>
    window.addEventListener("storage", (e) => e.stopImmediatePropagation(), true),
  );
  await first.goto("/products/chanel-gabrielle");
  await second.goto("/products/chanel-gabrielle");
  await expect(first.getByRole("button", { name: "Add to wishlist" })).toBeVisible();
  await expect(second.getByRole("button", { name: "Add to wishlist" })).toBeVisible();
  await first.getByRole("button", { name: "Add to wishlist" }).click();
  await expect(first.getByRole("button", { name: "Remove from wishlist" })).toBeVisible();
  await second.getByRole("button", { name: "Add to wishlist" }).click();
  await second.goto("/wishlist");
  await expect(cards(second)).toHaveCount(1);
  await expect(cards(second).getByRole("heading", { name: "Chanel Gabrielle" })).toBeVisible();
});

// @case wishlist :: Blocked storage still adds to the wishlist
test("blocked storage still adds to the wishlist", async ({ page }) => {
  await blockStorage(page);
  await page.goto("/products/chanel-gabrielle");
  await page.getByRole("button", { name: "Add to wishlist" }).click();
  await expect(page.getByRole("button", { name: "Remove from wishlist" })).toHaveAttribute("data-filled", "true");
  await expect(page.getByText(STORAGE)).toBeVisible();
  await header(page).getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(cards(page).getByRole("heading", { name: "Chanel Gabrielle" })).toBeVisible();
});

// @case wishlist :: Header heart opens the wishlist with two cards
test("header heart opens the wishlist with two cards", async ({ page }) => {
  await seedStorage(page, { wishlist: ["chanel-gabrielle", "dior-sauvage"] });
  await page.goto("/products");
  await header(page).getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(cards(page)).toHaveCount(2);
  const gabrielle = cards(page).filter({ hasText: "Chanel Gabrielle" });
  const sauvage = cards(page).filter({ hasText: "Dior Sauvage" });
  await expect(gabrielle).toHaveCount(1);
  await expect(sauvage).toHaveCount(1);
  await expect(gabrielle).toContainText("$60");
  await expect(gabrielle).toContainText("$40");
  await expect(sauvage).toContainText("$130");
  for (const card of [gabrielle, sauvage]) {
    const img = card.locator("img");
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

// @case wishlist :: Clicking a wishlist card
test("clicking a wishlist card opens the product", async ({ page }) => {
  await seedStorage(page, { wishlist: ["dior-sauvage"] });
  await page.goto("/wishlist");
  await cards(page).filter({ hasText: "Dior Sauvage" }).click();
  await expect(page).toHaveURL(/\/products\/dior-sauvage$/);
});

// @case wishlist :: Removed on the product page, gone from the wishlist page
test("a product removed on its page is gone from the wishlist page", async ({ page }) => {
  await seedStorage(page, { wishlist: ["chanel-gabrielle", "dior-sauvage"] });
  await page.goto("/products/dior-sauvage");
  await page.getByRole("button", { name: "Remove from wishlist" }).click();
  await expect(page.getByRole("button", { name: "Add to wishlist" })).toBeVisible();
  await header(page).getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).getByRole("heading", { name: "Chanel Gabrielle" })).toBeVisible();
});

// @case wishlist :: Unreachable backend keeps the wishlist
test("an unreachable backend keeps the wishlist", async ({ page }) => {
  await seedStorage(page, { wishlist: ["chanel-gabrielle", "dior-sauvage"] });
  await failAvailability(page);
  const failed = page.waitForEvent("requestfailed", (r) => r.url().includes("/api/products/availability/"));
  await page.goto("/products");
  await failed;
  await expect(page.getByRole("list", { name: "Products" }).getByRole("listitem").first()).toBeVisible();
  await expect(page.getByText(REMOVED)).toHaveCount(0);
  expect(await readStorage<string[]>(page, WISHLIST_KEY)).toEqual(["chanel-gabrielle", "dior-sauvage"]);
});

// @case wishlist :: Hidden product disappears from the wishlist page
test("a hidden product disappears from the wishlist page", async ({ page, browser }) => {
  await seedStorage(page, { wishlist: ["chanel-gabrielle", "dior-sauvage"] });
  const admin = createSuperuser();
  const adminPage = await (await browser.newContext()).newPage();
  await adminLogin(adminPage, admin);
  await adminPage.goto(adminUrl("/admin/catalog/product/"));
  await adminPage.getByRole("link", { name: "Chanel Gabrielle" }).first().click();
  await adminPage.locator("#id_show_on_site").uncheck();
  await adminPage.locator('input[name="_save"]').click();
  await expect(adminPage.locator(".success")).toBeVisible();
  await adminPage.context().close();

  await page.goto("/wishlist");
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).getByRole("heading", { name: "Dior Sauvage" })).toBeVisible();
  await expect(page.getByText(REMOVED)).toBeVisible();
});

// @case wishlist :: Deleted product noticed on the catalog
test("a deleted product is noticed on the catalog", async ({ page, browser }) => {
  await seedStorage(page, { wishlist: ["creed-aventus"] });
  const admin = createSuperuser();
  const adminPage = await (await browser.newContext()).newPage();
  await adminLogin(adminPage, admin);
  await adminPage.goto(adminUrl("/admin/catalog/product/"));
  await adminPage.getByRole("link", { name: "Creed Aventus" }).first().click();
  await adminPage.locator("a.deletelink").click();
  await adminPage.locator('input[type="submit"]').click();
  await expect(adminPage.locator(".success")).toBeVisible();
  await adminPage.context().close();

  await page.goto("/products");
  await expect(page.getByText(REMOVED)).toBeVisible();
  await header(page).getByRole("link", { name: "Wishlist" }).click();
  await expect(page.getByText("Your wishlist is empty")).toBeVisible();
});

// @case wishlist :: Empty wishlist message and link
test("an empty wishlist shows a message and a link to the catalog", async ({ page }) => {
  await page.goto("/wishlist");
  await expect(page.getByText("Your wishlist is empty")).toBeVisible();
  await page.locator("main").getByRole("link").click();
  await expect(page).toHaveURL(/\/products$/);
});

// @case wishlist :: Wishlist error then retry
test("a wishlist error can be retried", async ({ page }) => {
  await seedStorage(page, { wishlist: ["dior-sauvage"] });
  await failAvailability(page);
  await page.goto("/wishlist");
  await expect(page.getByText("Could not load the wishlist")).toBeVisible();
  await page.unroute(AVAILABILITY);
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(cards(page).getByRole("heading", { name: "Dior Sauvage" })).toBeVisible();
});

// @case wishlist :: Keyboard-only open of a wishlist card
test("a wishlist card opens by keyboard only", async ({ page }) => {
  await seedStorage(page, { wishlist: ["dior-sauvage"] });
  await page.goto("/wishlist");
  await expect(cards(page)).toHaveCount(1);
  const href = () => page.evaluate(() => document.activeElement?.getAttribute("href") ?? "");
  for (let i = 0; i < 40 && (await href()) !== "/products/dior-sauvage"; i++) {
    await page.keyboard.press("Tab");
  }
  expect(await href()).toBe("/products/dior-sauvage");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/products\/dior-sauvage$/);
});
