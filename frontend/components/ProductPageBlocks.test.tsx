import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WISHLIST_KEY } from "../lib/store";
import {
  failing,
  product,
  QUESTIONS_TEXT,
  SHIPPING_TEXT,
} from "../test-utils/backend";
import { main, openProduct, setupProductPage } from "../test-utils/product";
import NotFoundState from "./NotFoundState";

vi.mock("next/navigation", async () => {
  return (await import("../test-utils/navigation")).navigationMock;
});
vi.mock("next/link", async () => {
  return await import("../test-utils/navigation").then((m) => m.linkMock);
});

setupProductPage();

async function ready(slug = "chanel-gabrielle", options = {}) {
  const backend = openProduct(slug, options);
  await screen.findByRole("heading", { level: 1 });
  return backend;
}

const header = (name: string) => main().getByRole("button", { name });
const expanded = (name: string) =>
  header(name).getAttribute("aria-expanded") === "true";

describe("product page content blocks", () => {
  // @scenario product-page :: Blocks on open
  // @case product-page :: Four blocks expanded and two collapsed
  it("opens four blocks and keeps two collapsed", async () => {
    await ready();
    for (const name of [
      "Size",
      "Product description",
      "Notes",
      "Ingredients",
    ]) {
      expect(expanded(name)).toBe(true);
    }
    for (const name of ["Shipping & handling", "Questions"]) {
      expect(expanded(name)).toBe(false);
    }
    expect(main().queryByText(SHIPPING_TEXT)).toBeNull();
    expect(main().queryByText(QUESTIONS_TEXT)).toBeNull();
  });

  // @scenario product-page :: Notes are shown
  // @case product-page :: Three note groups with their texts
  it("shows the three note groups", async () => {
    await ready();
    for (const [label, text] of [
      ["Top notes", "African Marigold, Bergamot, Buchu"],
      ["Heart notes", "Cyclamen, Violet"],
      ["Base notes", "Cedarwood, Vetiver"],
    ]) {
      const group = main().getByText(label).parentElement!;
      expect(within(group).getByText(text)).toBeTruthy();
    }
  });

  // @scenario product-page :: Collapse a block
  // @case product-page :: Ingredients collapse and expand
  it("collapses and expands Ingredients", async () => {
    await ready();
    const text = "Alcohol, Parfum (Fragrance), Aqua (Water)";
    expect(main().getByText(text)).toBeTruthy();
    fireEvent.click(header("Ingredients"));
    expect(main().queryByText(text)).toBeNull();
    fireEvent.click(header("Ingredients"));
    expect(main().getByText(text)).toBeTruthy();
  });

  // @scenario product-page :: Collapse the description and the notes
  // @case product-page :: Description and notes collapse and expand
  it("collapses and expands the description and the notes", async () => {
    await ready();
    fireEvent.click(header("Product description"));
    fireEvent.click(header("Notes"));
    expect(main().queryByText("About Chanel Gabrielle")).toBeNull();
    for (const text of ["Top notes", "Heart notes", "Base notes"]) {
      expect(main().queryByText(text)).toBeNull();
    }
    fireEvent.click(header("Product description"));
    fireEvent.click(header("Notes"));
    expect(main().getByText("About Chanel Gabrielle")).toBeTruthy();
    expect(main().getByText("Top notes")).toBeTruthy();
    expect(main().getByText("Base notes")).toBeTruthy();
  });

  // @scenario product-page :: Expand the shared questions text
  // @case product-page :: Questions block shows the shared text
  it("shows the shared questions text when expanded", async () => {
    await ready();
    fireEvent.click(header("Questions"));
    expect(main().getByText(QUESTIONS_TEXT)).toBeTruthy();
  });

  // @scenario product-page :: Expand the shared shipping text
  // @case product-page :: Shipping block shows the shared text
  it("shows the shared shipping text when expanded", async () => {
    await ready();
    fireEvent.click(header("Shipping & handling"));
    expect(main().getByText(SHIPPING_TEXT)).toBeTruthy();
  });

  // @scenario product-page :: Collapse the Size block
  // @case product-page :: Size block collapses and keeps the choice
  it("collapses the Size block and keeps the chosen size", async () => {
    await ready();
    fireEvent.click(main().getByRole("button", { name: "50 ml $80" }));
    fireEvent.click(header("Size"));
    expect(main().queryByRole("button", { name: "50 ml $80" })).toBeNull();
    fireEvent.click(header("Size"));
    expect(
      main()
        .getByRole("button", { name: "50 ml $80" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});

describe("product page related products", () => {
  // @scenario product-page :: Related products shown
  // @case product-page :: Four related women's cards
  it("shows 4 related cards of other women's products", async () => {
    await ready();
    const heading = main().getByRole("heading", { name: "YOU MAY ALSO LIKE" });
    expect(heading).toBeTruthy();
    const list = within(main().getByRole("list", { name: "Related products" }));
    const names = list
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(names).toHaveLength(4);
    expect(names).not.toContain("Chanel Gabrielle");
    expect(names.every((n) => n!.startsWith("Women"))).toBe(true);
  });

  // @scenario product-page :: Related card opens its product
  it("links a related card to its product page", async () => {
    await ready();
    const list = within(main().getByRole("list", { name: "Related products" }));
    const links = list.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links.every((h) => /^\/products\/women-\d+$/.test(h!))).toBe(true);
  });

  // @scenario product-page :: No related products
  // @case product-page :: Only men's product shows no block
  it("shows no related block for the only men's product", async () => {
    await ready("creed-aventus");
    expect(main().queryByText("YOU MAY ALSO LIKE")).toBeNull();
    expect(main().queryByRole("list", { name: "Related products" })).toBeNull();
  });
});

describe("product page not found, loading and errors", () => {
  // @scenario product-page :: Unknown product address
  // @case product-page :: Unknown product shows Page not found
  it("shows Page not found for an unknown product", async () => {
    openProduct("no-such-perfume");
    expect(
      await screen.findByRole("heading", { name: "Page not found" }),
    ).toBeTruthy();
    expect(
      main()
        .getByRole("link", { name: "Back to catalog" })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario product-page :: Other unknown address
  // @case product-page :: Unknown site address shows Page not found
  it("renders the not found page with the catalog link", () => {
    render(<NotFoundState />);
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Back to catalog" })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario product-page :: Back to catalog link
  it("links Back to catalog to the catalog", () => {
    render(<NotFoundState />);
    expect(
      screen
        .getByRole("link", { name: "Back to catalog" })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario product-page :: Hidden product address
  // @case product-page :: Hidden product shows Page not found
  it("shows Page not found for a hidden product", async () => {
    // a hidden product is answered by the backend like an unknown one: 404
    openProduct("chanel-gabrielle", {
      products: [product("Creed Aventus", "men")],
    });
    expect(
      await screen.findByRole("heading", { name: "Page not found" }),
    ).toBeTruthy();
  });

  // @scenario product-page :: Placeholders while loading
  // @case product-page :: Grey placeholders before the product arrives
  it("shows placeholders until the product arrives", async () => {
    let release!: (r: Response) => void;
    const delayed = new Promise<Response>((r) => (release = r));
    let held = true;
    openProduct("chanel-gabrielle", {
      intercept: (url) =>
        held && url.pathname === "/api/products/chanel-gabrielle/"
          ? delayed
          : undefined,
    });
    expect(screen.getByTestId("photo-placeholder")).toBeTruthy();
    expect(screen.getByTestId("name-placeholder")).toBeTruthy();
    expect(screen.getByTestId("price-placeholder")).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    held = false;
    release(
      new Response(JSON.stringify(await detailBody()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe(
      "CHANEL GABRIELLE",
    );
    expect(screen.queryByTestId("photo-placeholder")).toBeNull();
  });

  // @scenario product-page :: Error and retry
  // @case product-page :: Server error then successful retry
  it("shows the error and loads the product on Retry", async () => {
    let broken = true;
    openProduct("chanel-gabrielle", {
      intercept: (url) =>
        broken && url.pathname === "/api/products/chanel-gabrielle/"
          ? failing(500)
          : undefined,
    });
    expect(await screen.findByText("Could not load the product")).toBeTruthy();
    broken = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe(
      "CHANEL GABRIELLE",
    );
  });

  // @scenario product-page :: Backend cannot be reached
  // @case product-page :: Network failure shows the product error
  it("shows the error when the backend cannot be reached", async () => {
    openProduct("chanel-gabrielle", {
      intercept: (url) =>
        url.pathname === "/api/products/chanel-gabrielle/"
          ? "network"
          : undefined,
    });
    expect(await screen.findByText("Could not load the product")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});

describe("product page accessibility and narrow screens", () => {
  // @scenario product-page :: Product page on a phone
  it("keeps one column wrapper with the Add to basket button inside", async () => {
    await ready();
    // layout width itself is proven by the E2E test in a 375 px browser
    const layout = screen.getByTestId("product-layout");
    expect(
      within(layout).getByRole("button", { name: "Add to basket" }),
    ).toBeTruthy();
  });

  // @scenario product-page :: Add to basket by keyboard only
  it("operates the size, quantity and add controls as native buttons", async () => {
    await ready();
    const controls = [
      main().getByRole("button", { name: "50 ml $80" }),
      main().getByRole("button", { name: "Increase quantity" }),
      main().getByRole("button", { name: "Add to basket" }),
    ];
    for (const c of controls) {
      expect(c.tagName).toBe("BUTTON");
      expect((c as HTMLButtonElement).type).toBe("button");
      expect(c.getAttribute("tabindex")).not.toBe("-1");
    }
  });

  // @scenario product-page :: Icon buttons have labels
  // @case product-page :: Accessible names of the icon buttons
  it("labels the heart, arrows and quantity buttons", async () => {
    await ready();
    for (const name of [
      "Add to wishlist",
      "Previous photo",
      "Next photo",
      "Decrease quantity",
      "Increase quantity",
    ]) {
      expect(main().getByRole("button", { name })).toBeTruthy();
    }
    for (const img of main().getAllByRole("img", {
      name: "Chanel Gabrielle",
    })) {
      expect(img.getAttribute("alt")).toBe("Chanel Gabrielle");
    }
  });

  // @scenario product-page :: Filled heart label
  // @case product-page :: Filled heart is labelled Remove from wishlist
  it("labels a filled heart Remove from wishlist", async () => {
    window.localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(["chanel-gabrielle"]),
    );
    await ready();
    expect(
      main().getByRole("button", { name: "Remove from wishlist" }),
    ).toBeTruthy();
    expect(
      main().queryByRole("button", { name: "Add to wishlist" }),
    ).toBeNull();
  });
});

async function detailBody() {
  const { CATALOG } = await import("../test-utils/product");
  const { installBackend } = await import("../test-utils/backend");
  installBackend(CATALOG);
  const response = await fetch("/api/products/chanel-gabrielle/");
  return response.json();
}
