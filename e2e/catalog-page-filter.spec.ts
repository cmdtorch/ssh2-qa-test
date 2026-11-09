import { expect, test, type Page } from "@playwright/test";

import { buildCatalog, cardNames, cards, isCountRequest, many } from "./support/catalog";

const filterButton = (page: Page) => page.getByRole("button", { name: "Filter", exact: true });
const panel = (page: Page) => page.getByRole("dialog", { name: "Filter" });
const option = (page: Page, label: string) => panel(page).getByRole("radio", { name: label, exact: true });
const seeResults = (page: Page) => panel(page).getByRole("button", { name: /^See results/ });
const WOMEN = "Women's perfumes";
const MEN = "Men's perfumes";
const UNISEX = "Unisex perfumes";

const mix = (w: number, m: number, u = 0) =>
  buildCatalog([...many(u, "unisex", "Uni"), ...many(m, "men", "Men"), ...many(w, "women", "Wom")]);

const open = async (page: Page, url = "/products") => {
  await page.goto(url);
  await filterButton(page).click();
  await expect(panel(page)).toBeVisible();
};

const chanel = () =>
  buildCatalog([
    { name: "Chanel Gabrielle", gender: "women" },
    { name: "Chanel No. 5", gender: "women" },
    { name: "Bleu de Chanel", gender: "men" },
    { name: "Dior Sauvage", gender: "men" },
  ]);

// @case catalog-page :: Filter panel shows only the Gender group
test("filter panel shows only the Gender group", async ({ page }) => {
  mix(3, 3, 1);
  await open(page);
  await expect(panel(page).getByRole("heading", { name: "Gender" })).toBeVisible();
  await expect(panel(page).getByRole("button", { name: "Collapse Gender" })).toHaveAttribute("aria-expanded", "true");
  await expect(panel(page).getByRole("radio")).toHaveText([MEN, WOMEN, UNISEX]);
  for (const other of ["Categories", "Price", "Brands", "Scent Type", "Season", "Occasion", "Bottle Size"]) {
    await expect(panel(page).getByText(other)).toHaveCount(0);
  }
});

// @case catalog-page :: Gender group collapses and expands
test("Gender group collapses and expands", async ({ page }) => {
  mix(3, 3, 1);
  await open(page);
  await panel(page).getByRole("button", { name: "Collapse Gender" }).click();
  await expect(panel(page).getByRole("radio")).toHaveCount(0);
  await expect(panel(page).getByText(MEN)).toHaveCount(0);
  await panel(page).getByRole("button", { name: "Expand Gender" }).click();
  await expect(panel(page).getByRole("radio")).toHaveText([MEN, WOMEN, UNISEX]);
});

// @case catalog-page :: Cross closes the panel without applying
test("cross closes the panel without applying", async ({ page }) => {
  mix(6, 5, 5);
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(16);
  const before = await cardNames(page).allTextContents();
  await filterButton(page).click();
  await option(page, WOMEN).click();
  await panel(page).getByRole("button", { name: "Close filters" }).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(cardNames(page)).toHaveText(before);
  await expect(page).not.toHaveURL(/gender/);
});

// @case catalog-page :: Marking women's shows the count 8
test("marking women's shows the count 8 and leaves the cards unchanged", async ({ page }) => {
  mix(8, 6, 2);
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(16);
  const before = await cardNames(page).allTextContents();
  await filterButton(page).click();
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (8)");
  await expect(cardNames(page)).toHaveText(before);
});

// @case catalog-page :: Marking a gender with no products shows zero
test("marking a gender with no products shows zero", async ({ page }) => {
  mix(8, 6);
  await open(page);
  await option(page, UNISEX).click();
  await expect(seeResults(page)).toHaveText("See results (0)");
});

// @case catalog-page :: Count counts within the search
test("count counts within the search", async ({ page }) => {
  chanel();
  await page.goto("/products?q=chanel");
  await expect(cards(page)).toHaveCount(3);
  await filterButton(page).click();
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (2)");
});

// @case catalog-page :: Second mark replaces the first
test("second mark replaces the first", async ({ page }) => {
  mix(8, 6);
  await open(page);
  await option(page, WOMEN).click();
  await expect(option(page, WOMEN)).toHaveAttribute("aria-checked", "true");
  await option(page, MEN).click();
  await expect(option(page, MEN)).toHaveAttribute("aria-checked", "true");
  await expect(option(page, WOMEN)).toHaveAttribute("aria-checked", "false");
  await expect(option(page, UNISEX)).toHaveAttribute("aria-checked", "false");
  await expect(seeResults(page)).toHaveText("See results (6)");
});

// @case catalog-page :: See results applies the women's filter
test("See results applies the women's filter", async ({ page }) => {
  mix(8, 6, 2);
  await open(page);
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (8)");
  await seeResults(page).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(cards(page)).toHaveCount(8);
  await expect(cardNames(page).filter({ hasText: /^Wom/ })).toHaveCount(8);
  await expect(page).toHaveURL(/gender=women/);
});

// @case catalog-page :: Applying the filter from page 2 shows page 1
test("applying the filter from page 2 shows page 1", async ({ page }) => {
  mix(20, 20);
  await open(page, "/products?page=2");
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (20)");
  await seeResults(page).click();
  await expect(cards(page)).toHaveCount(16);
  await expect(cardNames(page).filter({ hasText: /^Wom/ })).toHaveCount(16);
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page.getByRole("navigation", { name: "Pagination" }).getByRole("button", { name: "1", exact: true })).toHaveAttribute("aria-current", "page");
});

// @case catalog-page :: Clear removes the mark and shows the full count
test("Clear removes the mark and shows the full count", async ({ page }) => {
  mix(8, 6, 2);
  await open(page);
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (8)");
  await panel(page).getByRole("button", { name: "Clear" }).click();
  for (const l of [MEN, WOMEN, UNISEX]) await expect(option(page, l)).toHaveAttribute("aria-checked", "false");
  await expect(seeResults(page)).toHaveText("See results (16)");
});

// @case catalog-page :: Clear within a search counts the search results
test("Clear within a search counts the search results", async ({ page }) => {
  chanel();
  await open(page, "/products?q=chanel");
  await expect(cards(page)).toHaveCount(3);
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (2)");
  await panel(page).getByRole("button", { name: "Clear" }).click();
  await expect(seeResults(page)).toHaveText("See results (3)");
});

// @case catalog-page :: Clear and apply removes the gender
test("Clear and apply removes the gender", async ({ page }) => {
  mix(8, 6, 2);
  await page.goto("/products?gender=women");
  await expect(cards(page)).toHaveCount(8);
  await filterButton(page).click();
  await panel(page).getByRole("button", { name: "Clear" }).click();
  await expect(seeResults(page)).toHaveText("See results (16)");
  await seeResults(page).click();
  await expect(cards(page)).toHaveCount(16);
  await expect(cardNames(page).filter({ hasText: /^Men/ })).not.toHaveCount(0);
  await expect(page).not.toHaveURL(/gender/);
});

// @case catalog-page :: Reopened panel shows the applied state
test("reopened panel shows the applied state", async ({ page }) => {
  mix(3, 3);
  await open(page);
  await option(page, WOMEN).click();
  await expect(option(page, WOMEN)).toHaveAttribute("aria-checked", "true");
  await panel(page).getByRole("button", { name: "Close filters" }).click();
  await expect(panel(page)).toHaveCount(0);
  await filterButton(page).click();
  for (const l of [MEN, WOMEN, UNISEX]) await expect(option(page, l)).toHaveAttribute("aria-checked", "false");
});

// @case catalog-page :: Count request answers 500
test("count request answering 500 leaves See results without a number", async ({ page }) => {
  mix(8, 6);
  await page.route((url) => isCountRequest(url.toString()), (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"boom"}' }),
  );
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(14);
  const before = await cardNames(page).allTextContents();
  await filterButton(page).click();
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results");
  await expect(seeResults(page)).toBeEnabled();
  await expect(cardNames(page)).toHaveText(before);
});

// @scenario catalog-page :: Back button returns the previous view
// @case catalog-page :: Back after applying a filter
test("Back after applying a filter returns to the unfiltered catalog", async ({ page }) => {
  mix(5, 5, 1);
  await open(page);
  await option(page, WOMEN).click();
  await expect(seeResults(page)).toHaveText("See results (5)");
  await seeResults(page).click();
  await expect(page).toHaveURL(/gender=women/);
  await expect(cards(page)).toHaveCount(5);
  await page.goBack();
  await expect(page).toHaveURL(/\/products$/);
  await expect(cards(page)).toHaveCount(11);
});

// @case catalog-page :: Gender kids shows everything
test("gender=kids shows every gender without an error", async ({ page }) => {
  mix(2, 2, 2);
  await page.goto("/products?gender=kids");
  await expect(cards(page)).toHaveCount(6);
  for (const p of [/^Wom/, /^Men/, /^Uni/]) await expect(cardNames(page).filter({ hasText: p })).toHaveCount(2);
  await expect(page.getByText("Could not load products")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
});

// @case catalog-page :: Men's filter on chanel results
test("men's filter on chanel results shows only Bleu de Chanel", async ({ page }) => {
  buildCatalog([
    { name: "Chanel Gabrielle", gender: "women" },
    { name: "Bleu de Chanel", gender: "men" },
    { name: "Dior Sauvage", gender: "men" },
  ]);
  await open(page, "/products?q=chanel");
  await expect(cards(page)).toHaveCount(2);
  await option(page, MEN).click();
  await expect(seeResults(page)).toHaveText("See results (1)");
  await seeResults(page).click();
  await expect(cardNames(page)).toHaveText(["Bleu de Chanel"]);
  await expect(page).toHaveURL(/q=chanel/);
  await expect(page).toHaveURL(/gender=men/);
});

// @scenario catalog-page :: Filter by keyboard only
// @case catalog-page :: Keyboard-only filtering
test("keyboard-only filtering", async ({ page }) => {
  mix(8, 6);
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(14);
  const tabTo = async (name: RegExp) => {
    for (let i = 0; i < 60; i++) {
      const label = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null;
        return e ? (e.getAttribute("aria-label") ?? e.textContent ?? "").trim() : "";
      });
      if (name.test(label)) return;
      await page.keyboard.press("Tab");
    }
    throw new Error(`never focused ${name}`);
  };
  await tabTo(/^Filter$/);
  await page.keyboard.press("Enter");
  await expect(panel(page)).toBeVisible();
  await tabTo(/^Women's perfumes$/);
  await page.keyboard.press("Space");
  await expect(option(page, WOMEN)).toHaveAttribute("aria-checked", "true");
  await expect(seeResults(page)).toHaveText("See results (8)");
  await tabTo(/^See results \(8\)$/);
  await page.keyboard.press("Enter");
  await expect(panel(page)).toHaveCount(0);
  await expect(cards(page)).toHaveCount(8);
  await expect(cardNames(page).filter({ hasText: /^Wom/ })).toHaveCount(8);
});
