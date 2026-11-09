import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { StoreProvider } from "../lib/store";
import {
  installBackend,
  many,
  product,
  type FakeProduct,
} from "../test-utils/backend";
import { currentUrl, navigationMock, setUrl } from "../test-utils/navigation";
import CatalogPage from "./CatalogPage";
import SiteHeader from "./SiteHeader";

vi.mock("next/navigation", async () => {
  return (await import("../test-utils/navigation")).navigationMock;
});
vi.mock("next/link", async () => {
  return await import("../test-utils/navigation").then((m) => m.linkMock);
});

/** Stands in for the router: /products is the catalog, anything else a product page. */
function App() {
  const pathname = navigationMock.usePathname();
  return (
    <StoreProvider>
      <SiteHeader />
      {pathname === "/products" ? <CatalogPage /> : <main>Product page</main>}
    </StoreProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function start(products: FakeProduct[], url: string) {
  installBackend(products);
  setUrl(url);
  render(<App />);
}

async function names() {
  const list = within(await screen.findByRole("list", { name: "Products" }));
  return list.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
}

function category(name: string) {
  const nav = screen.getByRole("navigation", { name: "Categories" });
  fireEvent.click(within(nav).getByRole("link", { name }));
}

function search(text: string) {
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  const field = screen.getByRole("searchbox", { name: "Search products" });
  fireEvent.change(field, { target: { value: text } });
  fireEvent.submit(screen.getByRole("search"));
}

const GENDER_MIX = [
  product("Woman One", "women"),
  product("Man One", "men"),
  product("Uni One", "unisex"),
];

// @scenario site-navigation :: Perfumes opens the whole catalog
// @case site-navigation :: Perfumes from the women's catalog
it("Perfumes from the women's catalog shows every gender", async () => {
  start(GENDER_MIX, "/products?gender=women");
  await waitFor(async () => expect(await names()).toEqual(["Woman One"]));
  category("Perfumes");
  await waitFor(async () =>
    expect((await names()).sort()).toEqual(["Man One", "Uni One", "Woman One"]),
  );
  expect(currentUrl().pathname + currentUrl().search).toBe("/products");
});

// @scenario site-navigation :: Category link clears the search and the sort
// @case site-navigation :: Women's link resets search, sort and page
it("Women's link resets search, sort and page", async () => {
  start(
    [
      product("Chanel Women", "women", 10),
      ...many(20, "women", "Floral"),
      product("Chanel Man", "men"),
    ],
    "/products?q=chanel&sort=price-asc&page=2",
  );
  await names();
  category("Women's perfumes");
  await waitFor(async () => expect(await names()).toHaveLength(16));
  expect(currentUrl().pathname + currentUrl().search).toBe(
    "/products?gender=women",
  );
  const shown = await names();
  expect(shown[0]).toBe("Floral 20");
  expect(screen.getByRole("button", { name: /Sort by/ })).toHaveTextContent(
    "New",
  );
  expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

// @scenario site-navigation :: Women's perfumes opens the filtered catalog
// @case site-navigation :: Women's link from a product page
it("Women's link from a product page opens the women's catalog with the mark", async () => {
  start(GENDER_MIX, "/products/creed-aventus");
  expect(screen.getByText("Product page")).toBeVisible();
  category("Women's perfumes");
  await waitFor(async () => expect(await names()).toEqual(["Woman One"]));
  fireEvent.click(screen.getByRole("button", { name: "Filter" }));
  const panel = await screen.findByRole("dialog");
  expect(
    within(panel).getByRole("radio", { name: "Women's perfumes" }),
  ).toHaveAttribute("aria-checked", "true");
});

const CHANEL = [
  product("Chanel Gabrielle", "women"),
  product("Chanel No. 5", "women"),
  product("Dior Sauvage", "men"),
  product("Bleu de Chanel", "men"),
];

// @scenario site-navigation :: Search from the header
// @case site-navigation :: Search chanel from a product page
it("searching chanel from a product page shows the Chanel cards", async () => {
  start(CHANEL.slice(0, 3), "/products/dior-sauvage");
  search("chanel");
  await waitFor(async () =>
    expect((await names()).sort()).toEqual([
      "Chanel Gabrielle",
      "Chanel No. 5",
    ]),
  );
  expect(currentUrl().pathname + currentUrl().search).toBe(
    "/products?q=chanel",
  );
});

// @scenario site-navigation :: Search from the header
// @case site-navigation :: Search text with capitals
it("search text with capitals finds Bleu de Chanel", async () => {
  start(
    [product("Bleu de Chanel", "men"), product("Dior Sauvage", "men")],
    "/products",
  );
  await names();
  search("BLEU de");
  await waitFor(async () => expect(await names()).toEqual(["Bleu de Chanel"]));
});

// @scenario site-navigation :: Search keeps the gender and the sort
// @case site-navigation :: Search on women's sorted by price
it("search on the women's catalog keeps gender and sort and drops the page", async () => {
  start(
    [
      product("Chanel Gabrielle", "women", 90),
      product("Chanel No. 5", "women", 40),
      product("Bleu de Chanel", "men", 10),
      ...many(20, "women"),
    ],
    "/products?gender=women&sort=price-asc&page=2",
  );
  await waitFor(async () => expect(await names()).toHaveLength(6));
  search("chanel");
  await waitFor(async () =>
    expect(await names()).toEqual(["Chanel No. 5", "Chanel Gabrielle"]),
  );
  const { searchParams } = currentUrl();
  expect(searchParams.get("gender")).toBe("women");
  expect(searchParams.get("sort")).toBe("price-asc");
  expect(searchParams.get("q")).toBe("chanel");
  expect(searchParams.has("page")).toBe(false);
  expect(screen.getByRole("button", { name: /Sort by/ })).toHaveTextContent(
    "Price low to high",
  );
});

// @scenario site-navigation :: Empty search from the header
// @case site-navigation :: Enter on an empty field
it("Enter on an empty field opens the whole catalog", async () => {
  start(many(20), "/products/dior-sauvage");
  search("");
  await waitFor(async () => expect(await names()).toHaveLength(16));
  expect(currentUrl().pathname + currentUrl().search).toBe("/products");
  const pages = within(
    screen.getByRole("navigation", { name: "Pagination" }),
  ).getAllByRole("button");
  expect(pages.map((b) => b.textContent)).toEqual(["1", "2"]);
});
