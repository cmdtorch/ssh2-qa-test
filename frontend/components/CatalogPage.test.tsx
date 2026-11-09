import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StoreProvider } from "../lib/store";
import {
  failing,
  installBackend,
  many,
  product,
  type Backend,
  type FakeProduct,
} from "../test-utils/backend";
import { currentUrl, setUrl } from "../test-utils/navigation";
import CatalogPage from "./CatalogPage";

vi.mock("next/navigation", async () => {
  return (await import("../test-utils/navigation")).navigationMock;
});
vi.mock("next/link", async () => {
  return await import("../test-utils/navigation").then((m) => m.linkMock);
});

let backend: Backend;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function open(products: FakeProduct[], url = "/products") {
  backend = installBackend(products);
  setUrl(url);
  return render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
}

async function cardList() {
  return within(await screen.findByRole("list", { name: "Products" }));
}

async function names() {
  const list = await cardList();
  return list.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
}

function pagination() {
  return screen.queryByRole("navigation", { name: "Pagination" });
}

function pageButton(n: number) {
  return within(pagination()!).getByRole("button", { name: String(n) });
}

async function chooseSort(label: string) {
  fireEvent.click(screen.getByRole("button", { name: /Sort by/ }));
  fireEvent.click(await screen.findByRole("menuitemradio", { name: label }));
}

// @scenario catalog-page :: Catalog page opens
// @case catalog-page :: Anonymous visitor sees the first 16 cards
it("shows the heading, the breadcrumbs and 16 cards of 20 products", async () => {
  open(many(20));
  expect(
    screen.getByRole("heading", { level: 1, name: "PRODUCTS" }),
  ).toBeVisible();
  const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(crumbs).toHaveTextContent("Home page / Products");
  expect(await names()).toHaveLength(16);
});

// @scenario catalog-page :: Breadcrumb from the catalog to the start page
it("links the Home page breadcrumb to the start page", () => {
  open(many(3));
  const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(
    within(crumbs).getByRole("link", { name: "Home page" }),
  ).toHaveAttribute("href", "/");
});

// @scenario catalog-page :: Card of a discounted product
// @case catalog-page :: Discounted card shows old price, new price and badge
it("shows the struck-out price, the sale price and the badge", async () => {
  open([product("Burberry Goddess", "women", 136, 81.6)]);
  const list = await cardList();
  const card = list.getByRole("listitem");
  expect(within(card).getByText("$136").closest("s")).not.toBeNull();
  expect(within(card).getByText("$81.60").closest("s")).toBeNull();
  expect(within(card).getByTestId("discount-badge")).toHaveTextContent(/^40%$/);
  expect(
    within(card).getByRole("heading", { name: "Burberry Goddess" }),
  ).toBeVisible();
  expect(within(card).getByRole("img")).toHaveAttribute(
    "src",
    "/media/burberry-goddess.jpg",
  );
});

// @scenario catalog-page :: Card of a product without a discount
// @case catalog-page :: Card without discount shows one price
it("shows one price and no badge for a product without a sale price", async () => {
  open([product("Creed Aventus", "men", 150)]);
  const card = (await cardList()).getByRole("listitem");
  expect(within(card).getByText("$150")).toBeVisible();
  expect(within(card).queryByTestId("discount-badge")).toBeNull();
  expect(card.querySelector("s")).toBeNull();
  expect(card).not.toHaveTextContent("%");
});

// @scenario catalog-page :: Card opens the product page
it("links the card to the product page", async () => {
  open([product("Chanel Gabrielle")]);
  const link = (await cardList()).getByRole("link", {
    name: /Chanel Gabrielle/,
  });
  expect(link).toHaveAttribute("href", "/products/chanel-gabrielle");
});

// @scenario catalog-page :: Go to the second page
// @case catalog-page :: Page 2 of 20 products shows 4 cards
it("goes to page 2 of 20 products", async () => {
  open(many(20));
  await names();
  fireEvent.click(pageButton(2));
  await waitFor(async () => expect(await names()).toHaveLength(4));
  expect(currentUrl().searchParams.get("page")).toBe("2");
  expect(pageButton(2)).toHaveAttribute("aria-current", "page");
  expect(pageButton(1)).not.toHaveAttribute("aria-current");
});

// @scenario catalog-page :: Go to the second page
// @case catalog-page :: 17 products give a second page with one card
it("gives 17 products a second page with one card", async () => {
  open(many(17));
  await names();
  const nav = pagination()!;
  expect(
    within(nav)
      .getAllByRole("button")
      .map((b) => b.textContent),
  ).toEqual(["1", "2"]);
  fireEvent.click(pageButton(2));
  await waitFor(async () => expect(await names()).toHaveLength(1));
});

// @scenario catalog-page :: Single page has no page numbers
// @case catalog-page :: Ten products show no page numbers
it("shows no page numbers for 10 products", async () => {
  open(many(10));
  expect(await names()).toHaveLength(10);
  expect(pagination()).toBeNull();
});

// @scenario catalog-page :: Single page has no page numbers
// @case catalog-page :: Exactly 16 products show no page numbers
it("shows no page numbers for exactly 16 products", async () => {
  open(many(16));
  expect(await names()).toHaveLength(16);
  expect(pagination()).toBeNull();
});

// @scenario catalog-page :: Page number beyond the last
// @case catalog-page :: Page 99 shows the last page
it("shows the last page for page 99", async () => {
  open(many(40), "/products?page=99");
  expect(await names()).toHaveLength(8);
  expect(pageButton(3)).toHaveAttribute("aria-current", "page");
});

// @scenario catalog-page :: Catalog opens sorted by new
// @case catalog-page :: Newest product first on open
it("opens sorted by New", async () => {
  open([product("Alpha"), product("Bravo"), product("Charlie")]);
  expect(await names()).toEqual(["Charlie", "Bravo", "Alpha"]);
  expect(screen.getByRole("button", { name: /Sort by/ })).toHaveTextContent(
    "New",
  );
});

const PRICED = [
  product("A", "women", 50),
  product("B", "women", 60, 40),
  product("C", "women", 45),
];

// @scenario catalog-page :: Sort by price low to high
// @case catalog-page :: Choosing price low to high
it("sorts by price low to high", async () => {
  open(PRICED);
  await names();
  await chooseSort("Price low to high");
  await waitFor(async () => expect(await names()).toEqual(["B", "C", "A"]));
  expect(currentUrl().searchParams.get("sort")).toBe("price-asc");
});

// @scenario catalog-page :: Sort by price high to low
// @case catalog-page :: Choosing price high to low
it("sorts by price high to low", async () => {
  open(PRICED);
  await names();
  await chooseSort("Price high to low");
  await waitFor(async () => expect(await names()).toEqual(["A", "C", "B"]));
  expect(currentUrl().searchParams.get("sort")).toBe("price-desc");
});

it("offers exactly the three sorts", async () => {
  open(PRICED);
  await names();
  fireEvent.click(screen.getByRole("button", { name: /Sort by/ }));
  const items = await screen.findAllByRole("menuitemradio");
  expect(items.map((i) => i.textContent)).toEqual([
    "New",
    "Price low to high",
    "Price high to low",
  ]);
});

// @scenario catalog-page :: Changing the sort returns to page 1
// @case catalog-page :: Sorting from page 2 goes to page 1
it("returns to page 1 when the sort changes", async () => {
  open(many(20), "/products?page=2");
  await waitFor(async () => expect(await names()).toHaveLength(4));
  await chooseSort("Price low to high");
  await waitFor(async () => expect(await names()).toHaveLength(16));
  expect(currentUrl().searchParams.has("page")).toBe(false);
  expect(pageButton(1)).toHaveAttribute("aria-current", "page");
});

// @scenario catalog-page :: Shared address opens the same view
// @case catalog-page :: Address with gender, sort and page
it("opens the view described by the address", async () => {
  open(many(20, "men"), "/products?gender=men&sort=price-desc&page=2");
  expect(await names()).toEqual([
    "Perfume 04",
    "Perfume 03",
    "Perfume 02",
    "Perfume 01",
  ]);
  expect(screen.getByRole("button", { name: /Sort by/ })).toHaveTextContent(
    "Price high to low",
  );
  expect(pageButton(2)).toHaveAttribute("aria-current", "page");
});

// @scenario catalog-page :: Unknown gender in the address is ignored
// @case catalog-page :: Gender kids shows everything
it("ignores an unknown gender", async () => {
  open(
    [product("M", "men"), product("W", "women"), product("U", "unisex")],
    "/products?gender=kids",
  );
  expect((await names()).sort()).toEqual(["M", "U", "W"]);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(backend.requests.some((r) => r.includes("gender"))).toBe(false);
});

// @scenario catalog-page :: Unknown sort in the address is ignored
// @case catalog-page :: Sort rating falls back to New
it("ignores an unknown sort", async () => {
  open(
    [product("Alpha"), product("Bravo"), product("Charlie")],
    "/products?sort=rating",
  );
  expect(await names()).toEqual(["Charlie", "Bravo", "Alpha"]);
  expect(screen.getByRole("button", { name: /Sort by/ })).toHaveTextContent(
    "New",
  );
});

// @scenario catalog-page :: Invalid page number in the address
// @case catalog-page :: Pages 0, -1 and abc show page 1
describe("invalid page numbers", () => {
  it.each(["0", "-1", "abc"])("page %s shows page 1", async (value) => {
    open(many(40), `/products?page=${value}`);
    expect(await names()).toHaveLength(16);
    expect(pageButton(1)).toHaveAttribute("aria-current", "page");
    expect(backend.requests[0]).toContain("page=1");
  });
});

// @scenario catalog-page :: Search results in the catalog
// @case catalog-page :: Search chanel shows two cards
it("shows only the products whose name contains the search text", async () => {
  open(
    [
      product("Chanel Gabrielle"),
      product("Chanel No. 5"),
      product("Dior Sauvage", "men"),
    ],
    "/products?q=chanel",
  );
  expect((await names()).sort()).toEqual(["Chanel Gabrielle", "Chanel No. 5"]);
});

// @scenario catalog-page :: Search results in the catalog
// @case catalog-page :: Empty search text shows the whole catalog
it("shows the whole catalog for an empty search text", async () => {
  open(many(20), "/products?q=");
  expect(await names()).toHaveLength(16);
  expect(
    within(pagination()!)
      .getAllByRole("button")
      .map((b) => b.textContent),
  ).toEqual(["1", "2"]);
});

// @scenario catalog-page :: No product matches
// @case catalog-page :: Search zzz shows Nothing found
it("shows Nothing found and Reset filters when nothing matches", async () => {
  open(many(5), "/products?q=zzz");
  expect(await screen.findByText("Nothing found")).toBeVisible();
  expect(screen.getByRole("button", { name: "Reset filters" })).toBeVisible();
  expect(screen.queryByRole("list", { name: "Products" })).toBeNull();
  expect(pagination()).toBeNull();
});

// @scenario catalog-page :: Reset filters
// @case catalog-page :: Reset filters clears search and gender
it("Reset filters opens the whole catalog", async () => {
  open(many(20, "women"), "/products?q=zzz&gender=unisex");
  fireEvent.click(await screen.findByRole("button", { name: "Reset filters" }));
  await waitFor(async () => expect(await names()).toHaveLength(16));
  const { searchParams } = currentUrl();
  expect(searchParams.has("q")).toBe(false);
  expect(searchParams.has("gender")).toBe(false);
  expect(searchParams.has("page")).toBe(false);
});

// @scenario catalog-page :: Catalog with no products
// @case catalog-page :: Empty catalog shows Nothing found
it("shows Nothing found for an empty catalog", async () => {
  open([]);
  expect(await screen.findByText("Nothing found")).toBeVisible();
  expect(screen.queryByRole("listitem")).toBeNull();
});

// @scenario catalog-page :: Placeholders while loading
// @case catalog-page :: Grey placeholders before the list arrives
it("shows placeholders until the list arrives", async () => {
  const real = installBackend(many(3, "women", "Real"));
  let release: (r: Response) => void = () => {};
  real.intercept = (url) =>
    url.pathname === "/api/products/"
      ? new Promise<Response>((resolve) => (release = resolve))
      : undefined;
  setUrl("/products");
  render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
  expect(
    (await screen.findAllByTestId("card-skeleton")).length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText(/Real 0/)).toBeNull();
  real.intercept = undefined;
  release(await fetch("/api/products/?page=1&sort=new"));
  expect(await names()).toHaveLength(3);
  expect(screen.queryAllByTestId("card-skeleton")).toHaveLength(0);
});

// @scenario catalog-page :: Error and retry
// @case catalog-page :: Server error then successful retry
it("shows the error and loads the cards after a retry", async () => {
  backend = installBackend(many(3));
  backend.intercept = () => failing(500);
  setUrl("/products");
  render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
  expect(await screen.findByText("Could not load products")).toBeVisible();
  backend.intercept = undefined;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await names()).toHaveLength(3);
  expect(screen.queryByText("Could not load products")).toBeNull();
});

// @scenario catalog-page :: Error and retry
// @case catalog-page :: Retry while the error persists
it("keeps the error when the retry fails again", async () => {
  backend = installBackend(many(3));
  backend.intercept = () => failing(500);
  setUrl("/products");
  render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
  expect(await screen.findByText("Could not load products")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  expect(backend.requests.filter((r) => r.includes("page=1"))).toHaveLength(2);
});

// @scenario catalog-page :: Backend cannot be reached
// @case catalog-page :: Network failure shows the error
it("shows the error when the backend cannot be reached", async () => {
  backend = installBackend(many(3));
  backend.intercept = () => "network";
  setUrl("/products");
  render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
  expect(await screen.findByText("Could not load products")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
});

// @scenario catalog-page :: Photo descriptions
// @case catalog-page :: Card photo has the product name as its text
it("uses the product name as the photo description", async () => {
  open([product("Dior Sauvage", "men")]);
  expect(
    await screen.findByRole("img", { name: "Dior Sauvage" }),
  ).toBeVisible();
});
