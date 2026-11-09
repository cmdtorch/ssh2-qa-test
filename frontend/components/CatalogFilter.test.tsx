import {
  act,
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

async function names() {
  const list = within(await screen.findByRole("list", { name: "Products" }));
  return list.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
}

async function openPanel() {
  await names().catch(() => undefined);
  fireEvent.click(screen.getByRole("button", { name: "Filter" }));
  return screen.findByRole("dialog", { name: "Filter" });
}

function radio(name: string) {
  return within(screen.getByRole("dialog")).getByRole("radio", { name });
}

const GENDERS = ["Men's perfumes", "Women's perfumes", "Unisex perfumes"];

function mix() {
  return [
    ...many(8, "women", "Woman"),
    ...many(6, "men", "Man"),
    ...many(2, "unisex", "Uni"),
  ];
}

// @scenario catalog-page :: Open the filter panel
// @case catalog-page :: Filter panel shows only the Gender group
it("opens a panel with only the Gender group", async () => {
  open(many(5));
  const panel = await openPanel();
  const inside = within(panel);
  expect(inside.getByText("Gender")).toBeVisible();
  expect(inside.getAllByRole("radio").map((r) => r.textContent)).toEqual(
    GENDERS,
  );
  for (const other of [
    "Categories",
    "Price",
    "Brands",
    "Scent Type",
    "Season",
    "Occasion",
    "Bottle Size",
  ]) {
    expect(inside.queryByText(other)).toBeNull();
  }
});

// @scenario catalog-page :: Collapse and expand the Gender group
// @case catalog-page :: Gender group collapses and expands
it("collapses and expands the Gender group", async () => {
  open(many(5));
  const panel = await openPanel();
  fireEvent.click(
    within(panel).getByRole("button", { name: "Collapse Gender" }),
  );
  expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
  fireEvent.click(within(panel).getByRole("button", { name: "Expand Gender" }));
  expect(within(panel).getAllByRole("radio")).toHaveLength(3);
});

// @scenario catalog-page :: Close the panel with the cross
// @case catalog-page :: Cross closes the panel without applying
it("closes with the cross without applying the mark", async () => {
  open(mix().concat(many(8, "women", "Extra")));
  const before = await names();
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(await names()).toEqual(before);
  expect(before).toHaveLength(16);
  expect(currentUrl().searchParams.has("gender")).toBe(false);
});

// @scenario catalog-page :: Marking a gender updates the count
// @case catalog-page :: Marking women's shows the count 8
it("shows the count of the marked gender and leaves the cards alone", async () => {
  open(mix());
  const before = await names();
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  expect(
    await screen.findByRole("button", { name: "See results (8)" }),
  ).toBeVisible();
  const listRequests = () =>
    backend.requests.filter((r) =>
      new URL(r, "http://x").searchParams.has("page"),
    ).length;
  const listBefore = listRequests();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(await names()).toEqual(before);
  expect(listRequests()).toBe(listBefore);
});

// @scenario catalog-page :: Marking a gender updates the count
// @case catalog-page :: Marking a gender with no products shows zero
it("shows zero for a gender with no products", async () => {
  open([...many(8, "women"), ...many(6, "men")]);
  await openPanel();
  fireEvent.click(radio("Unisex perfumes"));
  expect(
    await screen.findByRole("button", { name: "See results (0)" }),
  ).toBeVisible();
});

// @scenario catalog-page :: Count within the search results
// @case catalog-page :: Count counts within the search
it("counts within the search text", async () => {
  open(
    [
      product("Chanel Gabrielle", "women"),
      product("Chanel No. 5", "women"),
      product("Bleu de Chanel", "men"),
      product("Dior Sauvage", "women"),
    ],
    "/products?q=chanel",
  );
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  expect(
    await screen.findByRole("button", { name: "See results (2)" }),
  ).toBeVisible();
});

// @scenario catalog-page :: Marking another gender replaces the mark
// @case catalog-page :: Second mark replaces the first
it("replaces the mark when another gender is marked", async () => {
  open(mix());
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(radio("Men's perfumes"));
  expect(radio("Men's perfumes")).toHaveAttribute("aria-checked", "true");
  expect(radio("Women's perfumes")).toHaveAttribute("aria-checked", "false");
  expect(radio("Unisex perfumes")).toHaveAttribute("aria-checked", "false");
  expect(
    await screen.findByRole("button", { name: "See results (6)" }),
  ).toBeVisible();
});

// @scenario catalog-page :: Apply the gender filter
// @case catalog-page :: See results applies the women's filter
it("applies the women's filter with See results", async () => {
  open(mix());
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(
    await screen.findByRole("button", { name: "See results (8)" }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(async () => {
    const shown = await names();
    expect(shown).toHaveLength(8);
    expect(shown.every((n) => n!.startsWith("Woman"))).toBe(true);
  });
  expect(currentUrl().searchParams.get("gender")).toBe("women");
});

// @scenario catalog-page :: Apply the gender filter
// @case catalog-page :: Applying the filter from page 2 shows page 1
it("shows page 1 after applying from page 2", async () => {
  open([...many(20, "women"), ...many(20, "men")], "/products?page=2");
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(
    await screen.findByRole("button", { name: "See results (20)" }),
  );
  await waitFor(async () => expect(await names()).toHaveLength(16));
  expect(currentUrl().searchParams.has("page")).toBe(false);
});

// @scenario catalog-page :: Clear the mark
// @case catalog-page :: Clear removes the mark and shows the full count
it("Clear removes the mark and shows the full count", async () => {
  open(many(16, "women"));
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  for (const label of GENDERS) {
    expect(radio(label)).toHaveAttribute("aria-checked", "false");
  }
  expect(
    await screen.findByRole("button", { name: "See results (16)" }),
  ).toBeVisible();
});

// @scenario catalog-page :: Clear the mark
// @case catalog-page :: Clear within a search counts the search results
it("Clear within a search counts the search results", async () => {
  open(
    [
      product("Chanel Gabrielle", "women"),
      product("Chanel No. 5", "women"),
      product("Bleu de Chanel", "men"),
      product("Dior Sauvage", "women"),
    ],
    "/products?q=chanel",
  );
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(
    await screen.findByRole("button", { name: "See results (3)" }),
  ).toBeVisible();
});

// @scenario catalog-page :: Clear an applied gender
// @case catalog-page :: Clear and apply removes the gender
it("Clear and See results remove an applied gender", async () => {
  open(mix(), "/products?gender=women");
  await waitFor(async () => expect(await names()).toHaveLength(8));
  await openPanel();
  expect(radio("Women's perfumes")).toHaveAttribute("aria-checked", "true");
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "See results (16)" }),
  );
  await waitFor(async () => expect(await names()).toHaveLength(16));
  expect(currentUrl().searchParams.has("gender")).toBe(false);
});

// @scenario catalog-page :: Unapplied mark is dropped when the panel closes
// @case catalog-page :: Reopened panel shows the applied state
it("drops an unapplied mark when the panel is closed", async () => {
  open(mix());
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
  await openPanel();
  for (const label of GENDERS) {
    expect(radio(label)).toHaveAttribute("aria-checked", "false");
  }
});

// @scenario catalog-page :: Unapplied mark is dropped when the panel closes
// @case catalog-page :: Reopened panel keeps the applied gender
it("keeps the applied gender when an unapplied mark is dropped", async () => {
  open(mix(), "/products?gender=men");
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
  await openPanel();
  expect(radio("Men's perfumes")).toHaveAttribute("aria-checked", "true");
  expect(radio("Women's perfumes")).toHaveAttribute("aria-checked", "false");
});

// @scenario catalog-page :: Count request fails
// @case catalog-page :: Count request answers 500
it("reads See results without a number when the count answers 500", async () => {
  backend = installBackend([...many(8, "women"), ...many(6, "men")]);
  backend.intercept = (url) =>
    url.searchParams.has("page") ? undefined : failing(500);
  setUrl("/products");
  render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
  const before = await names();
  await openPanel();
  fireEvent.click(radio("Women's perfumes"));
  const button = await screen.findByRole("button", { name: "See results" });
  await waitFor(() => {
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent(/^See results$/);
  });
  expect(await names()).toEqual(before);
});

// @scenario catalog-page :: Count request fails
// @case catalog-page :: Count request fails with a network error
it("shows the list error when the count and the list cannot be reached", async () => {
  backend = installBackend([...many(8, "women"), ...many(6, "men")]);
  backend.intercept = (url) =>
    !url.searchParams.has("page") || url.searchParams.get("gender") === "men"
      ? "network"
      : undefined;
  setUrl("/products");
  render(
    <StoreProvider>
      <CatalogPage />
    </StoreProvider>,
  );
  await names();
  await openPanel();
  fireEvent.click(radio("Men's perfumes"));
  fireEvent.click(screen.getByRole("button", { name: "See results" }));
  expect(await screen.findByText("Could not load products")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
});

// @scenario catalog-page :: Gender filter on search results
// @case catalog-page :: Men's filter on chanel results
it("applies the men's filter on the search results", async () => {
  open(
    [
      product("Chanel Gabrielle", "women"),
      product("Bleu de Chanel", "men"),
      product("Dior Sauvage", "men"),
    ],
    "/products?q=chanel",
  );
  await openPanel();
  fireEvent.click(radio("Men's perfumes"));
  fireEvent.click(
    await screen.findByRole("button", { name: "See results (1)" }),
  );
  await waitFor(async () => expect(await names()).toEqual(["Bleu de Chanel"]));
  const { searchParams } = currentUrl();
  expect(searchParams.get("q")).toBe("chanel");
  expect(searchParams.get("gender")).toBe("men");
});

// @scenario catalog-page :: Filter panel button labels
// @case catalog-page :: Labels of the cross and the Gender toggle
it("labels the cross and the Gender toggle", async () => {
  open(many(3));
  const panel = await openPanel();
  const inside = within(panel);
  expect(inside.getByRole("button", { name: "Close filters" })).toBeVisible();
  const toggle = inside.getByRole("button", { name: "Collapse Gender" });
  fireEvent.click(toggle);
  expect(inside.getByRole("button", { name: "Expand Gender" })).toBeVisible();
  expect(inside.queryByRole("button", { name: "Collapse Gender" })).toBeNull();
});
