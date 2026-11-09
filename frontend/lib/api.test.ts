import { afterEach, expect, it, vi } from "vitest";

import {
  ApiError,
  checkAvailability,
  getAvailability,
  getProduct,
  getProducts,
} from "./api";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

it("getProducts sends the filters in the query and returns the page", async () => {
  const page = { total: 0, pages: 1, page: 1, results: [] };
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(page));
  vi.stubGlobal("fetch", fetchMock);

  const result = await getProducts({ gender: "women", sort: "new", page: 2 });

  expect(result).toEqual(page);
  const url = new URL(String(fetchMock.mock.calls[0][0]), "http://x");
  expect(url.pathname).toBe("/api/products/");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    gender: "women",
    sort: "new",
    page: "2",
  });
});

it("getProducts leaves out empty filters", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      jsonResponse({ total: 0, pages: 1, page: 1, results: [] }),
    );
  vi.stubGlobal("fetch", fetchMock);

  await getProducts({ q: "dior" });

  expect(String(fetchMock.mock.calls[0][0])).toBe("/api/products/?q=dior");
});

it("getProduct requests the detail of one short name", async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ slug: "a b" }));
  vi.stubGlobal("fetch", fetchMock);

  await getProduct("a b");

  expect(String(fetchMock.mock.calls[0][0])).toBe("/api/products/a%20b/");
});

it("getAvailability sends the items joined by commas", async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
  vi.stubGlobal("fetch", fetchMock);

  await getAvailability(["a:30", "b"]);

  const url = new URL(String(fetchMock.mock.calls[0][0]), "http://x");
  expect(url.pathname).toBe("/api/products/availability/");
  expect(url.searchParams.get("items")).toBe("a:30,b");
});

it("an error status throws an ApiError with the status and the message", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(jsonResponse({ error: "bad items" }, 400)),
  );

  const error = await getAvailability(["x"]).catch((e: unknown) => e);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status: 400, message: "bad items" });
});

it("a network failure throws an ApiError with status 0", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("down")));

  const error = await getProduct("a").catch((e: unknown) => e);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status: 0 });
});

it("an unreadable body of an ok answer throws an ApiError", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })),
  );

  await expect(getProduct("a")).rejects.toBeInstanceOf(ApiError);
});

// @scenario product-catalog :: A long basket is checked in several requests
// @case product-catalog :: 60 basket lines are checked in two requests
it("checkAvailability splits 120 items into chunks of 50 and joins the results in order", async () => {
  const items = Array.from({ length: 120 }, (_, i) => `p${i}:30`);
  const fetchMock = vi.fn().mockImplementation((input: string) => {
    const list = new URL(input, "http://x").searchParams
      .get("items")!
      .split(",");
    return Promise.resolve(
      jsonResponse({
        results: list.map((item) => ({ item, available: false })),
      }),
    );
  });
  vi.stubGlobal("fetch", fetchMock);

  const results = await checkAvailability(items);

  expect(fetchMock).toHaveBeenCalledTimes(3);
  const sizes = fetchMock.mock.calls.map(
    ([u]) =>
      new URL(String(u), "http://x").searchParams.get("items")!.split(",")
        .length,
  );
  expect(sizes).toEqual([50, 50, 20]);
  expect(results.map((r) => r.item)).toEqual(items);
});

it("checkAvailability makes no request for an empty list", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  expect(await checkAvailability([])).toEqual([]);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("checkAvailability fails as a whole when one chunk fails", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse({ results: [] }))
    .mockResolvedValueOnce(jsonResponse({ error: "boom" }, 500));
  vi.stubGlobal("fetch", fetchMock);

  const items = Array.from({ length: 60 }, (_, i) => `p${i}`);

  await expect(checkAvailability(items)).rejects.toMatchObject({ status: 500 });
});
