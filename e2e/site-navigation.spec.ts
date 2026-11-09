import { expect, test, type Page } from "@playwright/test";

import { freshCatalog, hideProduct } from "./support/backend";

const cards = (page: Page) =>
  page.getByRole("list", { name: "Products" }).getByRole("listitem");
const cardNames = (page: Page) => cards(page).locator("h3");
const header = (page: Page) => page.locator("header");
const categories = (page: Page) =>
  page.getByRole("navigation", { name: "Categories" });

test.beforeEach(() => {
  freshCatalog();
});

// @case site-navigation :: Header and footer on five pages
test("each shop page shows the header with the logo and the footer", async ({ page }) => {
  for (const path of ["/products", "/products/chanel-gabrielle", "/basket", "/wishlist", "/no-such-page"]) {
    await page.goto(path);
    await expect(header(page).getByRole("link", { name: "Lunisse" }), path).toBeVisible();
    await expect(page.locator("footer"), path).toBeVisible();
  }
});

// @case site-navigation :: Start page has no shop header
test("start page has one h1 and no shop header or footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
});

// @case site-navigation :: Header logo opens the start page
test("header logo opens the start page", async ({ page }) => {
  await page.goto("/products");
  await header(page).getByRole("link", { name: "Lunisse" }).click();
  await expect(page).toHaveURL(/\/$/);
});

// @case site-navigation :: Footer logo opens the start page
test("footer logo opens the start page", async ({ page }) => {
  await page.goto("/products/chanel-gabrielle");
  await page.locator("footer").getByRole("link", { name: "Lunisse" }).click();
  await expect(page).toHaveURL(/\/$/);
});

// @case site-navigation :: Perfumes from the women's catalog
test("Perfumes from the women's catalog shows every gender", async ({ page }) => {
  await page.goto("/products?gender=women");
  await expect(cards(page)).toHaveCount(5);
  await categories(page).getByRole("link", { name: "Perfumes", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(cards(page)).toHaveCount(11);
  for (const name of ["Chanel Gabrielle", "Dior Sauvage", "CK One"]) {
    await expect(cardNames(page).filter({ hasText: name })).toHaveCount(1);
  }
});

// @case site-navigation :: Women's link resets search, sort and page
test("Women's perfumes link resets search, sort and page", async ({ page }) => {
  await page.goto("/products?q=chanel&sort=price-asc&page=2");
  await categories(page).getByRole("link", { name: "Women's perfumes", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?gender=women$/);
  await expect(cardNames(page)).toHaveText([
    "Burberry Goddess",
    "YSL Libre",
    "Dior J'adore",
    "Chanel No. 5",
    "Chanel Gabrielle",
  ]);
  await expect(page.getByRole("button", { name: /Sort by/ })).toContainText("New");
  await expect(page.getByRole("navigation", { name: /pagination|pages/i })).toHaveCount(0);
});

// @case site-navigation :: Women's link from a product page
test("Women's link from a product page shows only women's products", async ({ page }) => {
  await page.goto("/products/creed-aventus");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/CREED AVENTUS/i);
  await categories(page).getByRole("link", { name: "Women's perfumes", exact: true }).click();
  await expect(cards(page)).toHaveCount(5);
  await expect(cardNames(page).filter({ hasText: /Sauvage|Aventus|CK One/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Filter" }).click();
  await expect(page.getByRole("radio", { name: "Women's perfumes" })).toHaveAttribute("aria-checked", "true");
});

// @case site-navigation :: Men's and unisex links
test("Men's and Unisex links open their filtered catalogs", async ({ page }) => {
  await page.goto("/products");
  await categories(page).getByRole("link", { name: "Men's perfumes", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?gender=men$/);
  await categories(page).getByRole("link", { name: "Unisex perfumes", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?gender=unisex$/);
});

async function searchFromHeader(page: Page, text: string) {
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("searchbox", { name: "Search products" }).fill(text);
  await page.keyboard.press("Enter");
}

// @case site-navigation :: Search chanel from a product page
test("searching chanel from a product page lists the two Chanel women's products", async ({ page }) => {
  hideProduct("bleu-de-chanel");
  await page.goto("/products/dior-sauvage");
  await searchFromHeader(page, "chanel");
  await expect(page).toHaveURL(/\/products\?q=chanel$/);
  await expect(cards(page)).toHaveCount(2);
  await expect(cardNames(page).filter({ hasText: "Chanel Gabrielle" })).toHaveCount(1);
  await expect(cardNames(page).filter({ hasText: "Chanel No. 5" })).toHaveCount(1);
});

// @case site-navigation :: Search text with capitals
test("search text with capitals finds Bleu de Chanel", async ({ page }) => {
  await page.goto("/products");
  await searchFromHeader(page, "BLEU de");
  await expect(page).toHaveURL(/q=BLEU(\+|%20)de/);
  await expect(cardNames(page)).toHaveText(["Bleu de Chanel"]);
});

// @case site-navigation :: Search on women's sorted by price
test("search keeps the gender and the sort and drops the page", async ({ page }) => {
  await page.goto("/products?gender=women&sort=price-asc&page=2");
  await searchFromHeader(page, "chanel");
  await expect(page).toHaveURL(/q=chanel/);
  const url = new URL(page.url());
  expect(url.searchParams.get("gender")).toBe("women");
  expect(url.searchParams.get("sort")).toBe("price-asc");
  expect(url.searchParams.get("q")).toBe("chanel");
  expect(url.searchParams.has("page")).toBe(false);
  await expect(cardNames(page)).toHaveText(["Chanel Gabrielle", "Chanel No. 5"]);
  await expect(page.getByRole("button", { name: /Sort by/ })).toContainText("Price low to high");
});

// @case site-navigation :: Basket icon from the catalog
test("basket icon opens the basket", async ({ page }) => {
  await page.goto("/products");
  await header(page).getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket$/);
});

// @case site-navigation :: Heart icon from a product page
test("heart icon opens the wishlist", async ({ page }) => {
  await page.goto("/products/chanel-gabrielle");
  await header(page).getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
});

// @case site-navigation :: 375 px header
test("header works at 375 px without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/products");
  await expect(cards(page).first()).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(375);
  await header(page).getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket$/);
  await page.goto("/products");
  await categories(page).getByRole("link", { name: "Women's perfumes", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?gender=women$/);
});

// @case site-navigation :: Keyboard-only header search
test("header search works with Tab and Enter only", async ({ page }) => {
  await page.goto("/products");
  await expect(cards(page).first()).toBeVisible();
  const label = () => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
  for (let i = 0; i < 30 && (await label()) !== "Search"; i++) {
    await page.keyboard.press("Tab");
  }
  expect(await label()).toBe("Search");
  await page.keyboard.press("Enter");
  await page.keyboard.type("dior");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=dior/);
});
