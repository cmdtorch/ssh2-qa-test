import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ProductDetail } from "../lib/api";
import { BASKET_KEY, StoreNotice, StoreProvider } from "../lib/store";
import {
  failing,
  installBackend,
  product,
  type Backend,
  type FakeProduct,
} from "../test-utils/backend";
import { setUrl } from "../test-utils/navigation";
import BasketPage from "./BasketPage";
import SiteHeader from "./SiteHeader";

vi.mock("next/navigation", async () => {
  return (await import("../test-utils/navigation")).navigationMock;
});
vi.mock("next/link", async () => {
  return await import("../test-utils/navigation").then((m) => m.linkMock);
});

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Line = { slug: string; volume: number; quantity: number };

const size = (volume: number, regular: number, sale: number | null = null) => ({
  volume,
  is_default: false,
  regular_price: regular,
  sale_price: sale,
  discount_percent: null,
});

const PRODUCTS: FakeProduct[] = [
  product("Chanel Gabrielle", "women", 40),
  product("Creed Aventus", "men", 150),
  product("Dior Sauvage", "men", 90),
  product("Burberry Goddess", "women", 81.6),
  product("Versace Dylan Blue", "men", 400),
];

const DETAILS: Record<string, Partial<ProductDetail>> = {
  "chanel-gabrielle": { sizes: [size(15, 20), size(30, 40), size(50, 80)] },
  "creed-aventus": { sizes: [size(30, 100), size(50, 150)] },
  "dior-sauvage": { sizes: [size(100, 90)] },
  "burberry-goddess": { sizes: [size(100, 81.6)] },
  "versace-dylan-blue": { sizes: [size(100, 400)] },
};

const GAB: Line = { slug: "chanel-gabrielle", volume: 30, quantity: 2 };
const CREED: Line = { slug: "creed-aventus", volume: 50, quantity: 1 };
const DIOR: Line = { slug: "dior-sauvage", volume: 100, quantity: 1 };

function open(
  lines: Line[],
  options: {
    products?: FakeProduct[];
    details?: Record<string, Partial<ProductDetail>>;
    intercept?: Backend["intercept"];
    delay?: Promise<void>;
  } = {},
): Backend {
  window.localStorage.setItem(BASKET_KEY, JSON.stringify(lines));
  const backend = installBackend(
    options.products ?? PRODUCTS,
    options.details ?? DETAILS,
  );
  backend.intercept = options.intercept;
  if (options.delay) {
    const real = globalThis.fetch;
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      await options.delay;
      return real(input);
    });
  }
  setUrl("/basket");
  render(
    <StoreProvider>
      <SiteHeader />
      <StoreNotice />
      <BasketPage />
    </StoreProvider>,
  );
  return backend;
}

const main = () => within(screen.getByRole("main"));
const lineOf = async (name: string) =>
  within((await main().findByRole("link", { name })).closest("li")!);
const total = () => screen.getByTestId("basket-total").textContent;
const stored = () =>
  JSON.parse(window.localStorage.getItem(BASKET_KEY) ?? "[]") as Line[];

describe("basket page lines and totals", () => {
  // @scenario basket :: Basket page lists the lines and the total
  // @case basket :: Two lines and the total
  it("lists the lines with photo, size, prices, the total and no checkout", async () => {
    open([GAB, CREED]);
    const gab = await lineOf("Chanel Gabrielle");
    const creed = await lineOf("Creed Aventus");
    expect(gab.getByText("30 ml")).toBeTruthy();
    expect(gab.getByTestId("quantity").textContent).toBe("2");
    expect(gab.getByTestId("unit-price").textContent).toBe("$40");
    expect(gab.getByTestId("line-total").textContent).toBe("$80");
    expect(creed.getByText("50 ml")).toBeTruthy();
    expect(creed.getByTestId("line-total").textContent).toBe("$150");
    expect(
      gab.getByRole("img", { name: "Chanel Gabrielle" }).getAttribute("src"),
    ).toBe("/media/chanel-gabrielle.jpg");
    expect(total()).toBe("$230");
    expect(screen.queryByRole("button", { name: /checkout/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /checkout/i })).toBeNull();
  });

  // @scenario basket :: Total with cents
  // @case basket :: Three at 81.60 gives 244.80
  it("shows cents in the line total and the total", async () => {
    open([{ slug: "burberry-goddess", volume: 100, quantity: 3 }]);
    const line = await lineOf("Burberry Goddess");
    expect(line.getByTestId("line-total").textContent).toBe("$244.80");
    expect(total()).toBe("$244.80");
  });

  // @scenario basket :: Total with cents
  // @case basket :: Total in thousands
  it("shows thousands with a separator", async () => {
    open([{ slug: "versace-dylan-blue", volume: 100, quantity: 4 }]);
    await lineOf("Versace Dylan Blue");
    expect(total()).toBe("$1,600");
  });

  // @scenario basket :: Line name opens the product
  it("links the line name to the product page", async () => {
    open([CREED]);
    const link = await main().findByRole("link", { name: "Creed Aventus" });
    expect(link.getAttribute("href")).toBe("/products/creed-aventus");
  });

  // @scenario basket :: Price changed after adding
  // @case basket :: Basket shows the new sale price
  it("shows the current sale price, not the stored one", async () => {
    open([{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }], {
      details: {
        "chanel-gabrielle": { sizes: [size(30, 40, 35)] },
      },
    });
    const line = await lineOf("Chanel Gabrielle");
    expect(line.getByTestId("unit-price").textContent).toBe("$35");
    expect(line.getByTestId("line-total").textContent).toBe("$35");
    expect(total()).toBe("$35");
  });
});

describe("changing the basket", () => {
  // @scenario basket :: Raise a line quantity
  // @case basket :: Plus on a line updates all totals
  it("raises the quantity and updates totals and the counter", async () => {
    open([GAB, CREED]);
    const gab = await lineOf("Chanel Gabrielle");
    expect(total()).toBe("$230");
    expect(screen.getByTestId("basket-counter").textContent).toBe("3");
    fireEvent.click(gab.getByRole("button", { name: "Increase quantity" }));
    expect(gab.getByTestId("quantity").textContent).toBe("3");
    expect(gab.getByTestId("line-total").textContent).toBe("$120");
    expect(total()).toBe("$270");
    expect(screen.getByTestId("basket-counter").textContent).toBe("4");
    expect(stored()[0].quantity).toBe(3);
  });

  // @scenario basket :: Raise a line quantity
  // @case basket :: Minus on a line updates all totals
  it("lowers the quantity and updates the line total", async () => {
    open([{ ...GAB, quantity: 3 }, CREED]);
    const gab = await lineOf("Chanel Gabrielle");
    fireEvent.click(gab.getByRole("button", { name: "Decrease quantity" }));
    expect(gab.getByTestId("quantity").textContent).toBe("2");
    expect(gab.getByTestId("line-total").textContent).toBe("$80");
  });

  // @scenario basket :: Quantity limits on the basket page
  // @case basket :: Minus inactive at 1 and plus inactive at 10
  it("makes minus inactive at 1 and plus inactive at 10", async () => {
    open([
      { ...GAB, quantity: 1 },
      { ...CREED, quantity: 10 },
    ]);
    const gab = await lineOf("Chanel Gabrielle");
    const creed = await lineOf("Creed Aventus");
    const minus = gab.getByRole("button", { name: "Decrease quantity" });
    const plus = creed.getByRole("button", { name: "Increase quantity" });
    expect((minus as HTMLButtonElement).disabled).toBe(true);
    expect((plus as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(minus);
    fireEvent.click(plus);
    expect(gab.getByTestId("quantity").textContent).toBe("1");
    expect(creed.getByTestId("quantity").textContent).toBe("10");
  });

  // @scenario basket :: Remove a line
  // @case basket :: Removing one of two lines
  it("removes one line and keeps the other", async () => {
    open([GAB, CREED]);
    const gab = await lineOf("Chanel Gabrielle");
    fireEvent.click(gab.getByRole("button", { name: "Remove from basket" }));
    expect(main().queryByRole("link", { name: "Chanel Gabrielle" })).toBeNull();
    expect(main().getByRole("link", { name: "Creed Aventus" })).toBeTruthy();
    expect(total()).toBe("$150");
    expect(screen.getByTestId("basket-counter").textContent).toBe("1");
  });

  // @scenario basket :: Last line removed
  // @case basket :: Removing the last line empties the basket
  it("shows the empty state after the last line is removed", async () => {
    open([CREED]);
    const creed = await lineOf("Creed Aventus");
    fireEvent.click(creed.getByRole("button", { name: "Remove from basket" }));
    expect(main().getByText("Your basket is empty")).toBeTruthy();
    expect(screen.queryByTestId("basket-counter")).toBeNull();
  });
});

describe("basket page states", () => {
  // @scenario basket :: Empty basket page
  // @case basket :: Empty basket message and link
  it("shows the empty message and a catalog link", async () => {
    open([]);
    expect(await main().findByText("Your basket is empty")).toBeTruthy();
    expect(
      main()
        .getByRole("link", { name: /catalog/i })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario basket :: Placeholders while the basket loads
  // @case basket :: Two grey lines while prices load
  it("shows one grey placeholder per line until the prices arrive", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    open([GAB, CREED], { delay: gate });
    expect(await screen.findAllByTestId("line-placeholder")).toHaveLength(2);
    expect(main().queryByRole("link", { name: "Creed Aventus" })).toBeNull();
    release();
    expect(await lineOf("Creed Aventus")).toBeTruthy();
    expect(screen.queryAllByTestId("line-placeholder")).toHaveLength(0);
  });

  // @scenario basket :: Basket error and retry
  // @case basket :: Basket error then retry
  it("shows the error for an unreachable backend and loads on Retry", async () => {
    const backend = open([DIOR], { intercept: () => "network" });
    expect(await main().findByText("Could not load the basket")).toBeTruthy();
    backend.intercept = undefined;
    fireEvent.click(main().getByRole("button", { name: "Retry" }));
    const line = await lineOf("Dior Sauvage");
    expect(line.getByTestId("unit-price").textContent).toBe("$90");
  });

  // @scenario basket :: Basket error and retry
  // @case basket :: Basket answer with status 500
  it("shows the error for status 500 and keeps the line", async () => {
    open([DIOR], { intercept: () => failing(500) });
    expect(await main().findByText("Could not load the basket")).toBeTruthy();
    expect(main().getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(stored()).toEqual([DIOR]);
  });

  // @scenario basket :: Hidden product removed from the basket
  // @case basket :: Hidden product disappears from the basket page
  it("removes a hidden product's line and shows the removed message", async () => {
    open([{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }, DIOR], {
      products: PRODUCTS.map((p) =>
        p.name === "Chanel Gabrielle" ? { ...p, hidden: true } : p,
      ),
    });
    await lineOf("Dior Sauvage");
    expect(main().queryByRole("link", { name: "Chanel Gabrielle" })).toBeNull();
    expect(stored()).toEqual([DIOR]);
    expect(
      screen.getByText(
        "Some products are no longer available and were removed",
      ),
    ).toBeTruthy();
  });

  // one request set per open
  it("sends exactly one availability request when it opens", async () => {
    const backend = open([GAB, CREED]);
    await lineOf("Creed Aventus");
    await waitFor(() =>
      expect(
        backend.requests.filter((r) =>
          r.startsWith("/api/products/availability/"),
        ),
      ).toHaveLength(1),
    );
  });
});

describe("basket page accessibility", () => {
  // @scenario basket :: Basket button labels
  // @case basket :: Accessible names on a basket line
  it("names the buttons and the photo", async () => {
    open([CREED]);
    const line = await lineOf("Creed Aventus");
    expect(
      line.getAllByRole("button").map((b) => b.getAttribute("aria-label")),
    ).toEqual(["Decrease quantity", "Increase quantity", "Remove from basket"]);
    expect(line.getByRole("img").getAttribute("alt")).toBe("Creed Aventus");
  });

  // @scenario basket :: Remove a line by keyboard only
  it("uses native buttons so Tab and Enter operate the remove control", async () => {
    open([CREED, DIOR]);
    const creed = await lineOf("Creed Aventus");
    const remove = creed.getByRole("button", { name: "Remove from basket" });
    expect(remove.tagName).toBe("BUTTON");
    expect(remove.getAttribute("tabindex")).not.toBe("-1");
    expect((remove as HTMLButtonElement).type).toBe("button");
  });
});
