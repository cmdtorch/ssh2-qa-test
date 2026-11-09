import { expect, test, type Page } from "@playwright/test";

import { freshCatalog } from "./support/backend";
import { buildCatalog, cardNames, cards, many, pagination } from "./support/catalog";

const sortBy = async (page: Page, option: string) => {
  await page.getByRole("button", { name: /Sort by/ }).click();
  await page.getByRole("menuitemradio", { name: option }).click();
};
const sortButton = (page: Page) => page.getByRole("button", { name: /Sort by/ });
const pageButton = (page: Page, n: number) =>
  pagination(page).getByRole("button", { name: String(n), exact: true });

// @case catalog-page :: Anonymous visitor sees the first 16 cards
test("anonymous visitor sees heading, breadcrumbs and 16 cards", async ({ page }) => {
  buildCatalog(many(20, "women"));
  await page.goto("/products");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PRODUCTS");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home page / Products");
  await expect(cards(page)).toHaveCount(16);
});

// @case catalog-page :: Home page breadcrumb opens the start page
test("Home page breadcrumb opens the start page", async ({ page }) => {
  freshCatalog();
  await page.goto("/products");
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Home page" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("PRODUCTS");
});

// @case catalog-page :: Discounted card shows old price, new price and badge
test("discounted card shows old price, new price, badge, photo and name", async ({ page }) => {
  freshCatalog();
  await page.goto("/products");
  const card = cards(page).filter({ hasText: "Burberry Goddess" });
  await expect(card.locator("s")).toHaveText("$136");
  await expect(card).toContainText("$81.60");
  await expect(card.getByTestId("discount-badge")).toHaveText("40%");
  await expect(card.locator("h3")).toHaveText("Burberry Goddess");
  const img = card.locator("img");
  await expect(img).toHaveAttribute("src", /\/media\/products\/burberry-goddess/);
  await expect(img).toHaveJSProperty("complete", true);
  expect(await img.evaluate((e: HTMLImageElement) => e.naturalWidth)).toBeGreaterThan(0);
});

// @case catalog-page :: Card without discount shows one price
test("card without discount shows one price and no badge", async ({ page }) => {
  freshCatalog();
  await page.goto("/products");
  const card = cards(page).filter({ hasText: "Creed Aventus" });
  await expect(card).toContainText("$150");
  await expect(card.getByTestId("discount-badge")).toHaveCount(0);
  await expect(card.locator("s")).toHaveCount(0);
  await expect(card.getByText(/\$/)).toHaveCount(1);
});

// @case catalog-page :: Clicking a card opens its product
test("clicking a card opens its product page", async ({ page }) => {
  freshCatalog();
  await page.goto("/products");
  await cards(page).filter({ hasText: "Chanel Gabrielle" }).click();
  await expect(page).toHaveURL(/\/products\/chanel-gabrielle$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("CHANEL GABRIELLE");
});

// @case catalog-page :: Page 2 of 20 products shows 4 cards
test("page 2 of 20 products shows 4 cards", async ({ page }) => {
  buildCatalog(many(20, "women"));
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(16);
  await pageButton(page, 2).click();
  await expect(cards(page)).toHaveCount(4);
  await expect(page).toHaveURL(/page=2/);
  await expect(pageButton(page, 2)).toHaveAttribute("aria-current", "page");
});

// @case catalog-page :: 17 products give a second page with one card
test("17 products give a second page with one card", async ({ page }) => {
  buildCatalog(many(17, "men"));
  await page.goto("/products");
  await expect(pageButton(page, 1)).toBeVisible();
  await expect(pageButton(page, 2)).toBeVisible();
  await expect(pagination(page).getByRole("button")).toHaveCount(2);
  await pageButton(page, 2).click();
  await expect(cards(page)).toHaveCount(1);
});

// @case catalog-page :: Ten products show no page numbers
test("ten products show no page numbers", async ({ page }) => {
  buildCatalog(many(10, "men"));
  await page.goto("/products");
  await expect(cards(page)).toHaveCount(10);
  await expect(pagination(page)).toHaveCount(0);
});

// @case catalog-page :: Page 99 shows the last page
test("page 99 shows the last page", async ({ page }) => {
  buildCatalog(many(40, "women"));
  await page.goto("/products?page=99");
  await expect(cards(page)).toHaveCount(8);
  await expect(pageButton(page, 3)).toHaveAttribute("aria-current", "page");
});

// @case catalog-page :: Newest product first on open
test("newest product first on open", async ({ page }) => {
  buildCatalog([
    { name: "Alpha", gender: "women", added: "2026-10-01T10:00:00" },
    { name: "Bravo", gender: "women", added: "2026-10-02T10:00:00" },
    { name: "Charlie", gender: "women", added: "2026-10-03T10:00:00" },
  ]);
  await page.goto("/products");
  await expect(cardNames(page)).toHaveText(["Charlie", "Bravo", "Alpha"]);
  await expect(sortButton(page)).toContainText("New");
});

const abc = () =>
  buildCatalog([
    { name: "A", gender: "women", price: 50 },
    { name: "B", gender: "women", price: 60, sale: 40 },
    { name: "C", gender: "women", price: 45 },
  ]);

// @case catalog-page :: Choosing price low to high
test("choosing price low to high orders B, C, A", async ({ page }) => {
  abc();
  await page.goto("/products");
  await sortBy(page, "Price low to high");
  await expect(cardNames(page)).toHaveText(["B", "C", "A"]);
  await expect(page).toHaveURL(/sort=price-asc/);
});

// @case catalog-page :: Choosing price high to low
test("choosing price high to low orders A, C, B", async ({ page }) => {
  abc();
  await page.goto("/products");
  await sortBy(page, "Price high to low");
  await expect(cardNames(page)).toHaveText(["A", "C", "B"]);
  await expect(page).toHaveURL(/sort=price-desc/);
});

// @case catalog-page :: Sorting from page 2 goes to page 1
test("sorting from page 2 goes to page 1", async ({ page }) => {
  buildCatalog(many(20, "women"));
  await page.goto("/products?page=2");
  await expect(cards(page)).toHaveCount(4);
  await sortBy(page, "Price low to high");
  await expect(cards(page)).toHaveCount(16);
  await expect(page).not.toHaveURL(/page=2/);
  await expect(pageButton(page, 1)).toHaveAttribute("aria-current", "page");
});

// @case catalog-page :: Sort rating falls back to New
test("sort=rating falls back to New", async ({ page }) => {
  buildCatalog([
    { name: "Alpha", gender: "women", added: "2026-10-01T10:00:00" },
    { name: "Bravo", gender: "women", added: "2026-10-02T10:00:00" },
    { name: "Charlie", gender: "women", added: "2026-10-03T10:00:00" },
  ]);
  await page.goto("/products?sort=rating");
  await expect(cardNames(page)).toHaveText(["Charlie", "Bravo", "Alpha"]);
  await expect(sortButton(page)).toContainText("New");
});

// @case catalog-page :: Pages 0, -1 and abc show page 1
test("pages 0, -1 and abc show page 1", async ({ page }) => {
  buildCatalog(many(40, "women"));
  for (const p of ["0", "-1", "abc"]) {
    await page.goto(`/products?page=${p}`);
    await expect(cards(page), p).toHaveCount(16);
    await expect(pageButton(page, 1), p).toHaveAttribute("aria-current", "page");
  }
});

// @case catalog-page :: Address with gender, sort and page
test("address with gender, sort and page", async ({ page }) => {
  buildCatalog([...many(20, "men", "Men", (i) => 100 + i * 10), ...many(5, "women")]);
  await page.goto("/products?gender=men&sort=price-desc&page=2");
  await expect(cardNames(page)).toHaveText(["Men 004", "Men 003", "Men 002", "Men 001"]);
  await expect(sortButton(page)).toContainText("Price high to low");
  await expect(pageButton(page, 2)).toHaveAttribute("aria-current", "page");
});

// @case catalog-page :: Search chanel shows two cards
test("search chanel shows two cards", async ({ page }) => {
  buildCatalog([
    { name: "Chanel Gabrielle", gender: "women" },
    { name: "Chanel No. 5", gender: "women" },
    { name: "Dior Sauvage", gender: "men" },
  ]);
  await page.goto("/products?q=chanel");
  await expect(cardNames(page)).toHaveCount(2);
  await expect(cardNames(page).filter({ hasText: "Chanel Gabrielle" })).toHaveCount(1);
  await expect(cardNames(page).filter({ hasText: "Chanel No. 5" })).toHaveCount(1);
});

// @case catalog-page :: Search zzz shows Nothing found
test("search zzz shows Nothing found", async ({ page }) => {
  freshCatalog();
  await page.goto("/products?q=zzz");
  await expect(page.getByText("Nothing found")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset filters" })).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await expect(pagination(page)).toHaveCount(0);
});

// @case catalog-page :: Empty catalog shows Nothing found
test("empty catalog shows Nothing found", async ({ page }) => {
  buildCatalog([]);
  await page.goto("/products");
  await expect(page.getByText("Nothing found")).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
});

// @case catalog-page :: Reset filters clears search and gender
test("Reset filters clears search and gender", async ({ page }) => {
  buildCatalog([...many(10, "women", "Wom"), ...many(10, "men", "Mn")]);
  await page.goto("/products?q=zzz&gender=unisex");
  await expect(page.getByText("Nothing found")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(cards(page)).toHaveCount(16);
  await expect(page).not.toHaveURL(/q=/);
  await expect(page).not.toHaveURL(/gender=/);
  await expect(cardNames(page).filter({ hasText: "Wom" })).not.toHaveCount(0);
  await expect(cardNames(page).filter({ hasText: "Mn" })).not.toHaveCount(0);
});
