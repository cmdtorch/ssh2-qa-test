import { expect, test, type Page } from "@playwright/test";

import { buildCatalog, cards, isListRequest, many } from "./support/catalog";

const isList = (url: URL) => url.pathname === "/api/products/" && isListRequest(url.toString());
const listRequests = (page: Page, handler: Parameters<Page["route"]>[1]) => page.route(isList, handler);

const firstRow = async (page: Page) => {
  const tops = await cards(page).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  return tops.filter((t) => t === tops[0]).length;
};

// @case catalog-page :: Grey placeholders before the list arrives
test("grey placeholders are shown until the delayed list arrives", async ({ page }) => {
  buildCatalog(many(20, "women"));
  await listRequests(page, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });
  await page.goto("/products");
  const skeletons = page.getByTestId("card-skeleton");
  await expect(skeletons.first()).toBeVisible();
  expect(await skeletons.count()).toBeGreaterThan(0);
  await expect(page.locator("h3")).toHaveCount(0);
  await expect(cards(page)).toHaveCount(16);
  await expect(skeletons).toHaveCount(0);
});

// @case catalog-page :: Server error then successful retry
test("server error then successful retry", async ({ page }) => {
  buildCatalog(many(5, "women"));
  await listRequests(page, (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"boom"}' }),
  );
  await page.goto("/products");
  await expect(page.getByText("Could not load products")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await page.unroute(isList);
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(cards(page)).toHaveCount(5);
  await expect(page.getByText("Could not load products")).toHaveCount(0);
});

// @case catalog-page :: Retry while the error persists
test("retry while the error persists shows the error again", async ({ page }) => {
  buildCatalog(many(5, "women"));
  let calls = 0;
  await listRequests(page, (route) => {
    calls++;
    return route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"boom"}' });
  });
  await page.goto("/products");
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  const before = calls;
  await page.getByRole("button", { name: "Retry" }).click();
  await expect.poll(() => calls).toBeGreaterThan(before);
  await expect(page.getByText("Could not load products")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
});

// @case catalog-page :: Network failure shows the error
test("network failure shows the error and Retry", async ({ page }) => {
  buildCatalog(many(5, "women"));
  await listRequests(page, (route) => route.abort("connectionrefused"));
  await page.goto("/products");
  await expect(page.getByText("Could not load products")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

// @scenario catalog-page :: Catalog on a phone
// @case catalog-page :: 375 px wide screen
test("375 px wide screen has no horizontal scroll and fewer than 4 cards per row", async ({ page }) => {
  buildCatalog(many(20, "women"));
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(16);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(375);
  expect(await firstRow(page)).toBeLessThan(4);
});

// @scenario catalog-page :: Catalog on a phone
// @case catalog-page :: 1023 px uses the narrow layout and 1024 px the desktop layout
test("1023 px has fewer than 4 cards per row and 1024 px has 4", async ({ page }) => {
  buildCatalog(many(20, "women"));
  await page.setViewportSize({ width: 1023, height: 800 });
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(16);
  expect(await firstRow(page)).toBeLessThan(4);
  await page.setViewportSize({ width: 1024, height: 800 });
  await expect.poll(() => firstRow(page)).toBe(4);
});

// @scenario catalog-page :: Filter panel on a phone
// @case catalog-page :: Filter panel takes the full width
test("filter panel is 375 px wide on a phone", async ({ page }) => {
  buildCatalog(many(5, "women"));
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/products");
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const box = await page.getByRole("dialog", { name: "Filter" }).boundingBox();
  expect(Math.round(box!.width)).toBe(375);
});
