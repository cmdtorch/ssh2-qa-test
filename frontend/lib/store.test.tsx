import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import Home from "../app/page";
import {
  StorageNotice,
  StoreNotice,
  StoreProvider,
  useAvailabilityCheck,
  useStore,
} from "./store";

const STORAGE_MESSAGE =
  "Your choices will not be saved after you close this page";
const REMOVED_MESSAGE =
  "Some products are no longer available and were removed";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <StorageNotice />
      <StoreNotice />
    </StoreProvider>
  );
}

/** What a shop page does: use the store and check availability on opening. */
function usePage() {
  useAvailabilityCheck();
  return useStore();
}

async function openPage() {
  const view = renderHook(() => useStore(), { wrapper });
  await waitFor(() => expect(view.result.current.ready).toBe(true));
  return view;
}

function seed(basket: unknown, wishlist: unknown = []) {
  window.localStorage.setItem("lunisse.basket", JSON.stringify(basket));
  window.localStorage.setItem("lunisse.wishlist", JSON.stringify(wishlist));
}

function blockStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("blocked", "SecurityError");
    },
  });
}

function fullStorage() {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("full", "QuotaExceededError");
  });
}

const realStorage = Object.getOwnPropertyDescriptor(window, "localStorage");

function fakeBackend(unavailable: string[] = []) {
  const fetchMock = vi.fn().mockImplementation((input: string) => {
    const items = new URL(input, "http://x").searchParams
      .get("items")!
      .split(",");
    return Promise.resolve(
      new Response(
        JSON.stringify({
          results: items.map((item) =>
            unavailable.includes(item)
              ? { item, available: false }
              : {
                  item,
                  available: true,
                  slug: item.split(":")[0],
                  name: "N",
                  photo: null,
                  volume: 30,
                  regular_price: 40,
                  sale_price: null,
                  discount_percent: null,
                },
          ),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (realStorage) Object.defineProperty(window, "localStorage", realStorage);
});

// @scenario basket :: Basket survives a reload
// @case basket :: Basket line survives a reload
it("keeps the basket line after the page is opened again", async () => {
  const first = await openPage();
  act(() => first.result.current.addToBasket("chanel-gabrielle", 50, 2));
  first.unmount();

  const second = await openPage();

  expect(second.result.current.basket).toEqual([
    { slug: "chanel-gabrielle", volume: 50, quantity: 2 },
  ]);
  expect(second.result.current.totalUnits).toBe(2);
});

it("drops malformed basket lines and keeps the valid ones", async () => {
  seed(
    [
      { slug: "ok", volume: 30, quantity: 2 },
      { slug: "big", volume: 30, quantity: 11 },
      { slug: "zero", volume: 30, quantity: 0 },
      { slug: "frac", volume: 30, quantity: 1.5 },
      { slug: 5, volume: 30, quantity: 1 },
      { slug: "novol", quantity: 1 },
      "text",
      null,
      { slug: "ok", volume: 30, quantity: 4 },
    ],
    ["a", 7, "a", "b"],
  );

  const { result } = await openPage();

  expect(result.current.basket).toEqual([
    { slug: "ok", volume: 30, quantity: 2 },
  ]);
  expect(result.current.wishlist).toEqual(["a", "b"]);
});

it("starts empty when the stored text is not JSON or not a list", async () => {
  window.localStorage.setItem("lunisse.basket", "{not json");
  window.localStorage.setItem("lunisse.wishlist", '{"a":1}');

  const { result } = await openPage();

  expect(result.current.basket).toEqual([]);
  expect(result.current.wishlist).toEqual([]);
  expect(result.current.storageBlocked).toBe(false);
});

// @scenario basket :: Blocked storage keeps the basket in memory
// @case basket :: Blocked storage still adds to the basket
it("blocked storage: the add works, the counter is 1 and the message is shown", async () => {
  blockStorage();
  const { result } = await openPage();
  expect(screen.queryByText(STORAGE_MESSAGE)).not.toBeInTheDocument();

  act(() => result.current.addToBasket("chanel-gabrielle", 30, 1));

  expect(result.current.totalUnits).toBe(1);
  expect(result.current.basket).toEqual([
    { slug: "chanel-gabrielle", volume: 30, quantity: 1 },
  ]);
  expect(screen.getByText(STORAGE_MESSAGE)).toBeInTheDocument();
});

// @scenario basket :: Blocked storage keeps the basket in memory
// @case basket :: Full storage behaves like blocked storage
it("full storage: the counter is 2 and the message is shown", async () => {
  fullStorage();
  const { result } = await openPage();

  act(() => result.current.addToBasket("dior-sauvage", 100, 2));

  expect(result.current.totalUnits).toBe(2);
  expect(screen.getByText(STORAGE_MESSAGE)).toBeInTheDocument();
});

// @scenario wishlist :: Wishlist survives a reload
// @case wishlist :: Wishlist survives a reload
it("keeps the wishlist product, filled, after the page is opened again", async () => {
  const first = await openPage();
  act(() => first.result.current.toggleWishlist("chanel-gabrielle"));
  first.unmount();

  const second = await openPage();

  expect(second.result.current.wishlist).toEqual(["chanel-gabrielle"]);
  expect(second.result.current.isInWishlist("chanel-gabrielle")).toBe(true);
});

// @scenario wishlist :: Wishlist survives a reload
// @case wishlist :: Product is held once
it("holds a product once even when toggled from a stale state", async () => {
  const { result } = await openPage();
  act(() => result.current.toggleWishlist("chanel-gabrielle"));
  window.localStorage.setItem("lunisse.wishlist", "[]");
  act(() => window.dispatchEvent(new StorageEvent("storage")));
  act(() => result.current.toggleWishlist("chanel-gabrielle"));

  expect(result.current.wishlist).toEqual(["chanel-gabrielle"]);
  expect(JSON.parse(window.localStorage.getItem("lunisse.wishlist")!)).toEqual([
    "chanel-gabrielle",
  ]);
});

it("toggling twice removes the product again", async () => {
  const { result } = await openPage();

  act(() => result.current.toggleWishlist("a"));
  act(() => result.current.toggleWishlist("a"));

  expect(result.current.wishlist).toEqual([]);
});

// @scenario wishlist :: Blocked storage keeps the wishlist in memory
// @case wishlist :: Blocked storage still adds to the wishlist
it("blocked storage: the heart is filled and the message is shown", async () => {
  blockStorage();
  const { result } = await openPage();

  act(() => result.current.toggleWishlist("chanel-gabrielle"));

  expect(result.current.isInWishlist("chanel-gabrielle")).toBe(true);
  expect(result.current.wishlist).toEqual(["chanel-gabrielle"]);
  expect(screen.getByText(STORAGE_MESSAGE)).toBeInTheDocument();
});

// @scenario basket :: Add a new line
// @case basket :: Different size makes a second line
it("a different size makes a second line", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }]);
  const { result } = await openPage();

  act(() => result.current.addToBasket("chanel-gabrielle", 50, 1));

  expect(result.current.basket).toEqual([
    { slug: "chanel-gabrielle", volume: 30, quantity: 1 },
    { slug: "chanel-gabrielle", volume: 50, quantity: 1 },
  ]);
});

// @scenario basket :: Same product and size adds to the line
// @case basket :: Same size adds to the quantity
it("the same size adds to the quantity of one line", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 2 }]);
  const { result } = await openPage();

  act(() => result.current.addToBasket("chanel-gabrielle", 30, 3));

  expect(result.current.basket).toEqual([
    { slug: "chanel-gabrielle", volume: 30, quantity: 5 },
  ]);
  expect(result.current.limitReached).toBe(false);
});

// @scenario basket :: Sum over 10 is capped
// @case basket :: 8 plus 5 is capped at 10
it("8 plus 5 gives 10 and raises the limit flag", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 8 }]);
  const { result } = await openPage();

  act(() => result.current.addToBasket("chanel-gabrielle", 30, 5));

  expect(result.current.basket).toEqual([
    { slug: "chanel-gabrielle", volume: 30, quantity: 10 },
  ]);
  expect(result.current.limitReached).toBe(true);
});

// @scenario basket :: Sum over 10 is capped
// @case basket :: Adding to a full line keeps 10
it("adding 1 to a line of 10 keeps 10 and raises the limit flag", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 10 }]);
  const { result } = await openPage();

  act(() => result.current.addToBasket("chanel-gabrielle", 30, 1));

  expect(result.current.basket[0].quantity).toBe(10);
  expect(result.current.limitReached).toBe(true);
});

// @scenario basket :: Limit message disappears on the next action
// @case basket :: Choosing another size hides the limit message
it("the limit flag goes away on the next action", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 10 }]);
  const { result } = await openPage();
  act(() => result.current.addToBasket("chanel-gabrielle", 30, 1));
  expect(result.current.limitReached).toBe(true);

  act(() => result.current.dismissLimit());
  expect(result.current.limitReached).toBe(false);

  act(() => result.current.addToBasket("chanel-gabrielle", 30, 1));
  expect(result.current.limitReached).toBe(true);
  act(() => result.current.toggleWishlist("chanel-gabrielle"));
  expect(result.current.limitReached).toBe(false);
});

// @scenario basket :: Exactly 10 is not capped
// @case basket :: 7 plus 3 gives 10 without a message
it("7 plus 3 gives 10 without the limit flag", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 7 }]);
  const { result } = await openPage();

  act(() => result.current.addToBasket("chanel-gabrielle", 30, 3));

  expect(result.current.basket[0].quantity).toBe(10);
  expect(result.current.limitReached).toBe(false);
});

it("sets a quantity within 1 to 10 and removes a line", async () => {
  seed([
    { slug: "a", volume: 30, quantity: 2 },
    { slug: "b", volume: 50, quantity: 1 },
  ]);
  const { result } = await openPage();

  act(() => result.current.setQuantity("a", 30, 3));
  expect(result.current.basket[0].quantity).toBe(3);
  act(() => result.current.setQuantity("a", 30, 11));
  expect(result.current.basket[0].quantity).toBe(10);
  act(() => result.current.setQuantity("a", 30, 0));
  expect(result.current.basket[0].quantity).toBe(1);
  act(() => result.current.removeLine("a", 30));

  expect(result.current.basket).toEqual([
    { slug: "b", volume: 50, quantity: 1 },
  ]);
  expect(JSON.parse(window.localStorage.getItem("lunisse.basket")!)).toEqual([
    { slug: "b", volume: 50, quantity: 1 },
  ]);
});

// @scenario basket :: Counter shows the sum of quantities
// @case basket :: Counter shows units across lines
it("the total units are the sum of the quantities", async () => {
  seed([
    { slug: "chanel-gabrielle", volume: 30, quantity: 2 },
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
  const { result } = await openPage();

  expect(result.current.totalUnits).toBe(3);
});

// @scenario basket :: Counter updates after adding
// @case basket :: Counter goes from 3 to 5 without reload
it("two consumers show 3 and then 5 after adding 2, without a reload", async () => {
  seed([
    { slug: "chanel-gabrielle", volume: 30, quantity: 2 },
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
  function Counter() {
    return <span data-testid="counter">{useStore().totalUnits}</span>;
  }
  function Adder() {
    const { addToBasket } = useStore();
    return (
      <button onClick={() => addToBasket("creed-aventus", 50, 2)}>add</button>
    );
  }
  render(
    <StoreProvider>
      <Counter />
      <Adder />
    </StoreProvider>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("counter")).toHaveTextContent("3"),
  );

  act(() => screen.getByText("add").click());

  expect(screen.getByTestId("counter")).toHaveTextContent("5");
});

// @scenario basket :: Failed check removes nothing
// @case basket :: Unreachable backend keeps the basket
it("a failed check keeps both lines, shows nothing and runs again on the next page", async () => {
  seed([
    { slug: "chanel-gabrielle", volume: 30, quantity: 1 },
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
  const fetchMock = vi.fn().mockRejectedValue(new TypeError("down"));
  vi.stubGlobal("fetch", fetchMock);

  const first = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await act(async () => {});

  expect(first.result.current.basket).toHaveLength(2);
  expect(first.result.current.totalUnits).toBe(2);
  expect(screen.queryByText(REMOVED_MESSAGE)).not.toBeInTheDocument();
  first.unmount();

  fakeBackend();
  const second = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1));
  expect(second.result.current.basket).toHaveLength(2);
});

// @scenario wishlist :: Failed check keeps the wishlist
// @case wishlist :: Unreachable backend keeps the wishlist
it("a failed check keeps the wishlist and shows nothing", async () => {
  seed([], ["chanel-gabrielle", "dior-sauvage"]);
  const fetchMock = vi.fn().mockRejectedValue(new TypeError("down"));
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await act(async () => {});

  expect(result.current.wishlist).toEqual(["chanel-gabrielle", "dior-sauvage"]);
  expect(screen.queryByText(REMOVED_MESSAGE)).not.toBeInTheDocument();
});

it("sends the basket and wishlist items in one check", async () => {
  seed([{ slug: "a", volume: 30, quantity: 1 }], ["b"]);
  const fetchMock = fakeBackend();

  renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

  const url = new URL(String(fetchMock.mock.calls[0][0]), "http://x");
  expect(url.searchParams.get("items")).toBe("a:30,b");
});

it("makes no request when the basket and the wishlist are empty", async () => {
  const fetchMock = fakeBackend();

  const { result } = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(result.current.ready).toBe(true));
  await act(async () => {});

  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByText(REMOVED_MESSAGE)).not.toBeInTheDocument();
});

// @scenario basket :: Hidden product removed from the basket
// @case basket :: Hidden product disappears from the basket page
it("a hidden product's line leaves the basket and one message is shown", async () => {
  seed([
    { slug: "chanel-gabrielle", volume: 30, quantity: 1 },
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
  fakeBackend(["chanel-gabrielle:30"]);

  const { result } = renderHook(() => usePage(), { wrapper });

  await waitFor(() =>
    expect(result.current.basket).toEqual([
      { slug: "dior-sauvage", volume: 100, quantity: 1 },
    ]),
  );
  expect(screen.getByText(REMOVED_MESSAGE)).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem("lunisse.basket")!)).toEqual([
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
});

// @scenario basket :: Deleted size removed from the basket
// @case basket :: Deleted size noticed on the catalog
it("a deleted size leaves the basket and the counter drops", async () => {
  seed([
    { slug: "chanel-gabrielle", volume: 15, quantity: 2 },
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
  fakeBackend(["chanel-gabrielle:15"]);

  const { result } = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(result.current.totalUnits).toBe(1));

  expect(screen.getByText(REMOVED_MESSAGE)).toBeInTheDocument();
});

// @scenario basket :: Hidden product removed from the basket
// @case basket :: Deleted product removed from the basket
it("a deleted product's line leaves the basket", async () => {
  seed([
    { slug: "creed-aventus", volume: 50, quantity: 1 },
    { slug: "dior-sauvage", volume: 100, quantity: 1 },
  ]);
  fakeBackend(["creed-aventus:50"]);

  const { result } = renderHook(() => usePage(), { wrapper });

  await waitFor(() =>
    expect(result.current.basket.map((l) => l.slug)).toEqual(["dior-sauvage"]),
  );
  expect(screen.getByText(REMOVED_MESSAGE)).toBeInTheDocument();
});

// @scenario wishlist :: Hidden product removed from the wishlist
// @case wishlist :: Hidden product disappears from the wishlist page
it("a hidden product leaves the wishlist and one message is shown", async () => {
  seed([], ["chanel-gabrielle", "dior-sauvage"]);
  fakeBackend(["chanel-gabrielle"]);

  const { result } = renderHook(() => usePage(), { wrapper });

  await waitFor(() =>
    expect(result.current.wishlist).toEqual(["dior-sauvage"]),
  );
  expect(screen.getByText(REMOVED_MESSAGE)).toBeInTheDocument();
});

// @scenario wishlist :: Deleted product removed from the wishlist
// @case wishlist :: Deleted product noticed on the catalog
it("a deleted product leaves the wishlist and the message is shown", async () => {
  seed([], ["creed-aventus"]);
  fakeBackend(["creed-aventus"]);

  const { result } = renderHook(() => usePage(), { wrapper });

  await waitFor(() => expect(result.current.wishlist).toEqual([]));
  expect(screen.getByText(REMOVED_MESSAGE)).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem("lunisse.wishlist")!)).toEqual(
    [],
  );
});

// @scenario basket :: One message for basket and wishlist
// @case basket :: One message when both lose the same product
it("shows the message exactly once when the basket and the wishlist both lose a product", async () => {
  seed(
    [{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }],
    ["chanel-gabrielle"],
  );
  fakeBackend(["chanel-gabrielle:30", "chanel-gabrielle"]);

  const { result } = renderHook(() => usePage(), { wrapper });

  await waitFor(() => expect(result.current.basket).toEqual([]));
  expect(result.current.wishlist).toEqual([]);
  expect(screen.getAllByText(REMOVED_MESSAGE)).toHaveLength(1);
});

// @scenario basket :: Start page does not check the basket
it("the start page makes no request and shows no message", async () => {
  seed([{ slug: "chanel-gabrielle", volume: 30, quantity: 1 }], ["a"]);
  const fetchMock = fakeBackend(["chanel-gabrielle:30"]);

  render(
    <StoreProvider>
      <Home />
      <StoreNotice />
    </StoreProvider>,
  );
  await act(async () => {});

  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByText(REMOVED_MESSAGE)).not.toBeInTheDocument();
  expect(window.localStorage.getItem("lunisse.basket")).toContain(
    "chanel-gabrielle",
  );
});

it("the removed message goes away on the next page open", async () => {
  seed([{ slug: "a", volume: 30, quantity: 1 }]);
  fakeBackend(["a:30"]);
  const first = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(screen.getByText(REMOVED_MESSAGE)).toBeVisible());
  first.unmount();

  const second = renderHook(() => usePage(), { wrapper });
  await waitFor(() => expect(second.result.current.ready).toBe(true));

  expect(screen.queryByText(REMOVED_MESSAGE)).not.toBeInTheDocument();
});
