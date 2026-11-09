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
import {
  StoreNotice,
  StoreProvider,
  useStore,
  WISHLIST_KEY,
} from "../lib/store";
import {
  failing,
  installBackend,
  product,
  type Backend,
  type FakeProduct,
} from "../test-utils/backend";
import { setUrl } from "../test-utils/navigation";
import SiteHeader from "./SiteHeader";
import WishlistHeart from "./WishlistHeart";
import WishlistPage from "./WishlistPage";

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

const PRODUCTS: FakeProduct[] = [
  product("Chanel Gabrielle", "women", 40),
  product("Dior Sauvage", "men", 90),
  product("Creed Aventus", "men", 150),
];

function open(
  slugs: string[],
  options: {
    products?: FakeProduct[];
    intercept?: Backend["intercept"];
    delay?: Promise<void>;
    details?: Record<string, Partial<ProductDetail>>;
  } = {},
): Backend {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(slugs));
  const backend = installBackend(options.products ?? PRODUCTS, options.details);
  backend.intercept = options.intercept;
  if (options.delay) {
    const real = globalThis.fetch;
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      await options.delay;
      return real(input);
    });
  }
  setUrl("/wishlist");
  render(
    <StoreProvider>
      <SiteHeader />
      <StoreNotice />
      <WishlistPage />
    </StoreProvider>,
  );
  return backend;
}

const main = () => within(screen.getByRole("main"));
const cards = () => main().queryAllByRole("listitem");

describe("wishlist page", () => {
  // @scenario wishlist :: Wishlist page shows the products
  // @case wishlist :: Header heart opens the wishlist with two cards
  it("shows a card with photo and price for each wishlist product", async () => {
    const sizes = (volume: number, regular: number) => [
      {
        volume,
        is_default: true,
        regular_price: regular,
        sale_price: null,
        discount_percent: null,
      },
    ];
    open(["chanel-gabrielle", "dior-sauvage"], {
      details: {
        "chanel-gabrielle": { sizes: sizes(30, 40) },
        "dior-sauvage": { sizes: sizes(100, 130) },
      },
    });
    expect(await main().findByText("Chanel Gabrielle")).toBeTruthy();
    expect(main().getByText("Dior Sauvage")).toBeTruthy();
    expect(cards()).toHaveLength(2);
    const [first, second] = cards();
    expect(within(first).getByText("Chanel Gabrielle")).toBeTruthy();
    expect(within(first).getByText("$40")).toBeTruthy();
    expect(within(first).queryByText("$130")).toBeNull();
    expect(within(second).getByText("Dior Sauvage")).toBeTruthy();
    expect(within(second).getByText("$130")).toBeTruthy();
    expect(within(second).queryByText("$40")).toBeNull();
    expect(
      main().getByRole("img", { name: "Dior Sauvage" }).getAttribute("src"),
    ).toBe("/media/dior-sauvage.jpg");
  });

  // @scenario wishlist :: Wishlist card opens the product
  it("links each card to its product page", async () => {
    open(["dior-sauvage"]);
    const link = await main().findByRole("link", { name: /Dior Sauvage/ });
    expect(link.getAttribute("href")).toBe("/products/dior-sauvage");
    expect(link.closest("ul")).not.toBeNull();
  });

  // @scenario wishlist :: Removed product leaves the wishlist page
  // @case wishlist :: Removed on the product page, gone from the wishlist page
  it("does not show a product that is no longer in the wishlist", async () => {
    window.localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(["chanel-gabrielle", "dior-sauvage"]),
    );
    installBackend(PRODUCTS);
    function DiorHeart() {
      const store = useStore();
      return (
        <WishlistHeart
          filled={store.isInWishlist("dior-sauvage")}
          onToggle={() => store.toggleWishlist("dior-sauvage")}
        />
      );
    }
    const productPage = render(
      <StoreProvider>
        <DiorHeart />
      </StoreProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove from wishlist" }),
    );
    expect(
      screen.getByRole("button", { name: "Add to wishlist" }),
    ).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(WISHLIST_KEY)!)).toEqual([
      "chanel-gabrielle",
    ]);
    productPage.unmount();

    setUrl("/wishlist");
    render(
      <StoreProvider>
        <SiteHeader />
        <StoreNotice />
        <WishlistPage />
      </StoreProvider>,
    );
    expect(await main().findByText("Chanel Gabrielle")).toBeTruthy();
    expect(main().queryByText("Dior Sauvage")).toBeNull();
    expect(cards()).toHaveLength(1);
  });

  // @scenario wishlist :: Hidden product removed from the wishlist
  // @case wishlist :: Hidden product disappears from the wishlist page
  it("drops a hidden product and shows the removed message", async () => {
    open(["chanel-gabrielle", "dior-sauvage"], {
      products: PRODUCTS.map((p) =>
        p.name === "Chanel Gabrielle" ? { ...p, hidden: true } : p,
      ),
    });
    expect(await main().findByText("Dior Sauvage")).toBeTruthy();
    expect(main().queryByText("Chanel Gabrielle")).toBeNull();
    expect(cards()).toHaveLength(1);
    expect(
      screen.getByText(
        "Some products are no longer available and were removed",
      ),
    ).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(WISHLIST_KEY)!)).toEqual([
      "dior-sauvage",
    ]);
  });

  // @scenario wishlist :: Empty wishlist page
  // @case wishlist :: Empty wishlist message and link
  it("shows the empty message and a catalog link", async () => {
    open([]);
    expect(await main().findByText("Your wishlist is empty")).toBeTruthy();
    expect(
      main()
        .getByRole("link", { name: /catalog/i })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario wishlist :: Placeholders while the wishlist loads
  // @case wishlist :: Two grey cards while loading
  it("shows one grey placeholder per product until the answer arrives", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    open(["chanel-gabrielle", "dior-sauvage"], { delay: gate });
    expect(await screen.findAllByTestId("card-skeleton")).toHaveLength(2);
    release();
    expect(await main().findByText("Dior Sauvage")).toBeTruthy();
    expect(main().getByText("Chanel Gabrielle")).toBeTruthy();
    expect(screen.queryAllByTestId("card-skeleton")).toHaveLength(0);
  });

  // @scenario wishlist :: Wishlist error and retry
  // @case wishlist :: Wishlist error then retry
  it("shows the error for an unreachable backend and loads on Retry", async () => {
    const backend = open(["dior-sauvage"], { intercept: () => "network" });
    expect(await main().findByText("Could not load the wishlist")).toBeTruthy();
    backend.intercept = undefined;
    fireEvent.click(main().getByRole("button", { name: "Retry" }));
    expect(await main().findByText("Dior Sauvage")).toBeTruthy();
  });

  // @scenario wishlist :: Wishlist error and retry
  // @case wishlist :: Wishlist answer with status 500
  it("shows the error for status 500 and keeps the product", async () => {
    open(["dior-sauvage"], { intercept: () => failing(500) });
    expect(await main().findByText("Could not load the wishlist")).toBeTruthy();
    expect(main().getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(WISHLIST_KEY)!)).toEqual([
      "dior-sauvage",
    ]);
  });

  // @scenario wishlist :: Wishlist card photo description
  // @case wishlist :: Wishlist card photo text
  it("describes the card photo with the product name", async () => {
    open(["dior-sauvage"]);
    const photo = await main().findByRole("img");
    expect(photo.getAttribute("alt")).toBe("Dior Sauvage");
  });

  // @scenario wishlist :: Open a wishlist card by keyboard only
  it("makes the card a native link reachable with Tab and Enter", async () => {
    open(["dior-sauvage"]);
    const link = await main().findByRole("link", { name: /Dior Sauvage/ });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("tabindex")).not.toBe("-1");
  });

  it("sends exactly one availability request when it opens", async () => {
    const backend = open(["chanel-gabrielle", "dior-sauvage"]);
    await main().findByText("Dior Sauvage");
    await waitFor(() =>
      expect(
        backend.requests.filter((r) =>
          r.startsWith("/api/products/availability/"),
        ),
      ).toHaveLength(1),
    );
  });
});
