import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import Home from "../app/page";
import { StoreProvider } from "../lib/store";
import ShopChrome from "./ShopChrome";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/products",
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeEach(() => {
  nav.push.mockReset();
  nav.pathname = "/products";
  nav.search = "";
  window.localStorage.clear();
});

function renderChrome(path = "/products", search = "") {
  nav.pathname = path;
  nav.search = search;
  return render(
    <StoreProvider>
      <ShopChrome>
        <main>
          <h1>Page</h1>
        </main>
      </ShopChrome>
    </StoreProvider>,
  );
}

function header() {
  return screen.getByRole("banner");
}

// @scenario site-navigation :: Header and footer on the shop pages
it("shows the header and footer with the Lunisse logo on shop pages", () => {
  for (const path of [
    "/products",
    "/products/x",
    "/basket",
    "/wishlist",
    "/no-such-page",
  ]) {
    const { unmount } = renderChrome(path);
    expect(
      within(header()).getByRole("link", { name: "Lunisse" }),
    ).toBeVisible();
    expect(screen.getByRole("contentinfo")).toBeVisible();
    unmount();
  }
});

// @scenario site-navigation :: Start page unchanged
// @case site-navigation :: Start page has no shop header
it("start page shows exactly one h1 and no shop header or footer", () => {
  nav.pathname = "/";
  const { container } = render(
    <StoreProvider>
      <ShopChrome>
        <Home />
      </ShopChrome>
    </StoreProvider>,
  );
  expect(container.querySelectorAll("h1")).toHaveLength(1);
  expect(screen.queryByRole("banner")).toBeNull();
  expect(screen.queryByRole("contentinfo")).toBeNull();
  expect(screen.queryByRole("link", { name: "Lunisse" })).toBeNull();
});

// @scenario site-navigation :: Header logo
it("header logo links to the start page", () => {
  renderChrome();
  expect(
    within(header()).getByRole("link", { name: "Lunisse" }),
  ).toHaveAttribute("href", "/");
});

// @scenario site-navigation :: Footer logo
it("footer logo links to the start page", () => {
  renderChrome("/products/creed-aventus");
  expect(
    within(screen.getByRole("contentinfo")).getByRole("link", {
      name: "Lunisse",
    }),
  ).toHaveAttribute("href", "/");
});

const categories: [string, string][] = [
  ["Perfumes", "/products"],
  ["Men's perfumes", "/products?gender=men"],
  ["Women's perfumes", "/products?gender=women"],
  ["Unisex perfumes", "/products?gender=unisex"],
];

function category(name: string) {
  const nav = within(header()).getByRole("navigation", { name: "Categories" });
  return within(nav).getByRole("link", { name });
}

// @scenario site-navigation :: Perfumes opens the whole catalog
it("Perfumes link opens the catalog without a gender", () => {
  renderChrome("/products", "gender=women");
  expect(category("Perfumes")).toHaveAttribute("href", "/products");
});

// @scenario site-navigation :: Category link clears the search and the sort
it("Women's link drops search, sort and page", () => {
  renderChrome("/products", "q=chanel&sort=price-asc&page=2");
  expect(category("Women's perfumes")).toHaveAttribute(
    "href",
    "/products?gender=women",
  );
});

// @scenario site-navigation :: Women's perfumes opens the filtered catalog
// @case site-navigation :: Men's and unisex links
it("category links have the exact labels and addresses", () => {
  renderChrome("/products/creed-aventus");
  const links = within(
    within(header()).getByRole("navigation", { name: "Categories" }),
  ).getAllByRole("link");
  expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual(
    categories,
  );
});

function search(text: string) {
  fireEvent.click(within(header()).getByRole("button", { name: "Search" }));
  const field = screen.getByRole("searchbox");
  fireEvent.change(field, { target: { value: text } });
  fireEvent.submit(field.closest("form")!);
}

// @scenario site-navigation :: Search from the header
it("search from a product page opens the catalog with the text", () => {
  renderChrome("/products/dior-sauvage");
  expect(screen.queryByRole("searchbox")).toBeNull();
  search("chanel");
  expect(nav.push).toHaveBeenCalledExactlyOnceWith("/products?q=chanel");
});

// @scenario site-navigation :: Search keeps the gender and the sort
it("search keeps gender and sort and drops the page", () => {
  renderChrome("/products", "gender=women&sort=price-asc&page=2");
  search("chanel");
  const url = new URL(nav.push.mock.calls[0][0], "http://x");
  expect(url.pathname).toBe("/products");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    gender: "women",
    sort: "price-asc",
    q: "chanel",
  });
});

// @scenario site-navigation :: Empty search from the header
it("empty search opens the catalog without a search text", () => {
  renderChrome("/products/x");
  search("");
  expect(nav.push).toHaveBeenCalledExactlyOnceWith("/products");
});

// @scenario site-navigation :: Search by keyboard only
it("search opens and submits with Tab and Enter only", () => {
  renderChrome();
  const button = within(header()).getByRole("button", { name: "Search" });
  expect(button.tagName).toBe("BUTTON");
  fireEvent.click(button);
  const field = screen.getByRole("searchbox");
  expect(field).toHaveFocus();
  expect(field.closest("form")).not.toBeNull();
  fireEvent.change(field, { target: { value: "dior" } });
  fireEvent.submit(field.closest("form")!);
  expect(nav.push).toHaveBeenCalledExactlyOnceWith("/products?q=dior");
});

// @scenario site-navigation :: Basket icon opens the basket
it("basket icon links to /basket and shows the counter only above 0", () => {
  const { unmount } = renderChrome();
  expect(
    within(header()).getByRole("link", { name: "Basket" }),
  ).toHaveAttribute("href", "/basket");
  expect(screen.queryByTestId("basket-counter")).toBeNull();
  unmount();
  window.localStorage.setItem(
    "lunisse.basket",
    JSON.stringify([{ slug: "a", volume: 50, quantity: 3 }]),
  );
  renderChrome();
  expect(screen.getByTestId("basket-counter")).toHaveTextContent("3");
});

// @scenario site-navigation :: Heart icon opens the wishlist
it("heart icon links to /wishlist", () => {
  renderChrome();
  expect(
    within(header()).getByRole("link", { name: "Wishlist" }),
  ).toHaveAttribute("href", "/wishlist");
});

// @scenario site-navigation :: Profile icon does nothing
// @case site-navigation :: Profile icon click changes nothing
it("profile icon is not a link and click changes nothing", () => {
  renderChrome("/products", "gender=women");
  const before = document.body.innerHTML;
  const profile = within(header()).getByRole("button", { name: "Account" });
  expect(profile.closest("a")).toBeNull();
  fireEvent.click(profile);
  expect(nav.push).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.body.innerHTML).toBe(before);
});

// @scenario site-navigation :: Information link does nothing
// @case site-navigation :: Blog link click changes nothing
it("information and legal items are not links and clicks change nothing", () => {
  renderChrome();
  const before = document.body.innerHTML;
  for (const [scope, name] of [
    [header(), "Blog"],
    [screen.getByRole("contentinfo"), "Privacy Policy"],
    [screen.getByRole("contentinfo"), "Terms and Conditions"],
  ] as const) {
    const item = within(scope).getByText(name);
    expect(item.closest("a")).toBeNull();
    fireEvent.click(item);
  }
  expect(nav.push).not.toHaveBeenCalled();
  expect(document.body.innerHTML).toBe(before);
  for (const name of ["About us", "Brands", "Video", "Support"]) {
    expect(within(header()).getByText(name).closest("a")).toBeNull();
  }
});

// @scenario site-navigation :: Header on a phone
it("header is one banner whose categories stay in a navigation landmark", () => {
  renderChrome();
  expect(screen.getAllByRole("banner")).toHaveLength(1);
  expect(
    within(header()).getByRole("navigation", { name: "Categories" }),
  ).toBeVisible();
  expect(within(header()).getByRole("link", { name: "Basket" })).toBeVisible();
});

// @scenario site-navigation :: Header icon labels
// @case site-navigation :: Header icons have accessible names
it("header icons are named Search, Wishlist, Account and Basket", () => {
  renderChrome();
  const h = within(header());
  expect(h.getByRole("button", { name: "Search" })).toBeVisible();
  expect(h.getByRole("link", { name: "Wishlist" })).toBeVisible();
  expect(h.getByRole("button", { name: "Account" })).toBeVisible();
  expect(h.getByRole("link", { name: "Basket" })).toBeVisible();
});
