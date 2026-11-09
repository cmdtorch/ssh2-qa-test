import { expect, test } from "@playwright/test";

import { freshCatalog } from "./support/backend";
import { seedStorage } from "./support/browser";

// @case product-catalog :: 60 basket lines are checked in two requests
test("60 basket lines are checked in two requests", async ({ page }) => {
  freshCatalog({ count: 60, gender: "women", volume: 30 });
  const lines = Array.from({ length: 60 }, (_, i) => ({
    slug: `bulk-women-${String(i + 1).padStart(3, "0")}`,
    volume: 30,
    quantity: 1,
  }));
  await seedStorage(page, { basket: lines });
  const sizes: number[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/products/availability/")) {
      const items = new URL(r.url()).searchParams.get("items") ?? "";
      sizes.push(items.split(",").length);
    }
  });
  await page.goto("/basket");
  await expect(page.getByTestId("line-total")).toHaveCount(60);
  expect([...sizes].sort((a, b) => b - a)).toEqual([50, 10]);
  await expect(page.getByTestId("unit-price").first()).toHaveText("$100");
  await expect(page.getByTestId("basket-total")).toHaveText("$6,000");
});
