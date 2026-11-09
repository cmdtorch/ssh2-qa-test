import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BASKET_KEY, WISHLIST_KEY } from "../lib/store";
import { main, openProduct, setupProductPage } from "../test-utils/product";

vi.mock("next/navigation", async () => {
  return (await import("../test-utils/navigation")).navigationMock;
});
vi.mock("next/link", async () => {
  return await import("../test-utils/navigation").then((m) => m.linkMock);
});

setupProductPage();

const click = (name: string | RegExp) =>
  fireEvent.click(main().getByRole("button", { name }));
const photo = () => screen.getByTestId("gallery-photo");
const thumbnails = () =>
  within(screen.getByRole("list", { name: "Photo thumbnails" })).getAllByRole(
    "button",
  );
const quantity = () => screen.getByTestId("quantity").textContent;
const topPrice = () => screen.getByTestId("top-price");
const basket = () =>
  JSON.parse(window.localStorage.getItem(BASKET_KEY) ?? "[]") as unknown[];
const wishlist = () =>
  JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[];

async function ready(slug = "chanel-gabrielle", options = {}) {
  openProduct(slug, options);
  await screen.findByRole("heading", { level: 1 });
}

const SALE_SIZES = [
  {
    volume: 15,
    is_default: true,
    regular_price: 20,
    sale_price: null,
    discount_percent: null,
  },
  {
    volume: 30,
    is_default: false,
    regular_price: 60,
    sale_price: 40,
    discount_percent: 33,
  },
];

describe("product page top part", () => {
  // @scenario product-page :: Product page opens
  // @case product-page :: Anonymous visitor opens a product page
  it("shows the name as heading and the breadcrumbs", async () => {
    await ready();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "CHANEL GABRIELLE",
    );
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(crumbs.textContent).toBe("Home page / Products / Chanel Gabrielle");
    expect(
      within(crumbs)
        .getByRole("link", { name: "Home page" })
        .getAttribute("href"),
    ).toBe("/");
    expect(
      within(crumbs)
        .getByRole("link", { name: "Products" })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario product-page :: Breadcrumb to the catalog
  it("links the Products breadcrumb to the catalog", async () => {
    await ready();
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(
      within(crumbs)
        .getByRole("link", { name: "Products" })
        .getAttribute("href"),
    ).toBe("/products");
  });

  // @scenario product-page :: Breadcrumb to the start page
  it("links the Home page breadcrumb to the start page", async () => {
    await ready();
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(
      within(crumbs)
        .getByRole("link", { name: "Home page" })
        .getAttribute("href"),
    ).toBe("/");
  });

  // @scenario product-page :: Descriptor line shown
  // @case product-page :: Descriptor line under the name
  it("shows the descriptor line", async () => {
    await ready("chanel-gabrielle", {
      details: {
        "chanel-gabrielle": { descriptor_line: "Edp | Floral | Gourmand" },
      },
    });
    expect(screen.getByText("Edp | Floral | Gourmand")).toBeTruthy();
  });

  // @scenario product-page :: No descriptor line
  // @case product-page :: No descriptor text without a descriptor line
  it("shows nothing when there is no descriptor line", async () => {
    await ready();
    expect(screen.queryByTestId("descriptor-line")).toBeNull();
    expect(main().queryByText("|")).toBeNull();
    expect(main().queryByText(/\|/)).toBeNull();
  });

  // @scenario product-page :: Thumbnail shows its photo
  // @case product-page :: Third thumbnail shows the third photo
  it("shows the clicked thumbnail large", async () => {
    await ready();
    expect(thumbnails()).toHaveLength(4);
    fireEvent.click(thumbnails()[2]);
    expect(photo().getAttribute("src")).toBe("/media/chanel-gabrielle-3.jpg");
  });

  // @scenario product-page :: Arrows move between photos
  // @case product-page :: Forward twice then back once
  it("moves between photos with the arrows", async () => {
    await ready();
    expect(photo().getAttribute("src")).toBe("/media/chanel-gabrielle-1.jpg");
    click("Next photo");
    click("Next photo");
    expect(photo().getAttribute("src")).toBe("/media/chanel-gabrielle-3.jpg");
    click("Previous photo");
    expect(photo().getAttribute("src")).toBe("/media/chanel-gabrielle-2.jpg");
  });

  // @scenario product-page :: Arrows at the ends
  // @case product-page :: Arrows inactive at first and last photo
  it("deactivates the arrows at the ends", async () => {
    await ready();
    const prev = () => main().getByRole("button", { name: "Previous photo" });
    const next = () => main().getByRole("button", { name: "Next photo" });
    expect((prev() as HTMLButtonElement).disabled).toBe(true);
    expect((next() as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(next());
    fireEvent.click(next());
    fireEvent.click(next());
    expect(photo().getAttribute("src")).toBe("/media/chanel-gabrielle-4.jpg");
    expect((next() as HTMLButtonElement).disabled).toBe(true);
    expect((prev() as HTMLButtonElement).disabled).toBe(false);
  });

  // @scenario product-page :: Product with one photo
  // @case product-page :: Single photo disables both arrows
  it("disables both arrows for one photo", async () => {
    await ready("creed-aventus", {
      details: { "creed-aventus": { photos: ["/media/creed-1.jpg"] } },
    });
    expect(
      (
        main().getByRole("button", {
          name: "Previous photo",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (main().getByRole("button", { name: "Next photo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(thumbnails()).toHaveLength(1);
  });

  // @scenario product-page :: Rating 4.5
  // @case product-page :: Rating 4.5 shows four and a half stars
  it("shows 4 filled and 1 half star for 4.5", async () => {
    await ready("chanel-gabrielle", {
      details: { "chanel-gabrielle": { rating: 4.5 } },
    });
    const stars = screen.getByRole("img", { name: /rating/i });
    const kinds = Array.from(stars.querySelectorAll("[data-star]")).map((s) =>
      s.getAttribute("data-star"),
    );
    expect(kinds).toEqual(["full", "full", "full", "full", "half"]);
  });

  // @scenario product-page :: Rating 4.5
  // @case product-page :: Rating 0 shows five empty stars
  it("shows five empty stars for 0", async () => {
    await ready("chanel-gabrielle", {
      details: { "chanel-gabrielle": { rating: 0 } },
    });
    const kinds = Array.from(
      screen
        .getByRole("img", { name: /rating/i })
        .querySelectorAll("[data-star]"),
    ).map((s) => s.getAttribute("data-star"));
    expect(kinds).toEqual(["empty", "empty", "empty", "empty", "empty"]);
  });

  // @scenario product-page :: Rating 4.5
  // @case product-page :: Rating 5 shows five filled stars
  it("shows five filled stars for 5", async () => {
    await ready("chanel-gabrielle", {
      details: { "chanel-gabrielle": { rating: 5 } },
    });
    const kinds = Array.from(
      screen
        .getByRole("img", { name: /rating/i })
        .querySelectorAll("[data-star]"),
    ).map((s) => s.getAttribute("data-star"));
    expect(kinds).toEqual(["full", "full", "full", "full", "full"]);
  });

  // @scenario product-page :: No rating
  // @case product-page :: Product without rating shows no stars
  it("shows no stars without a rating", async () => {
    await ready();
    expect(screen.queryByRole("img", { name: /rating/i })).toBeNull();
    expect(document.querySelector("[data-star]")).toBeNull();
  });

  // @scenario product-page :: Default size chosen on open
  // @case product-page :: Default 30 ml chosen with its price
  it("chooses the default size on open", async () => {
    await ready();
    const sizes = ["15 ml $20", "30 ml $40", "50 ml $80"];
    for (const name of sizes) {
      expect(main().getByRole("button", { name })).toBeTruthy();
    }
    expect(
      main()
        .getByRole("button", { name: "30 ml $40" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(topPrice().textContent).toBe("$40");
  });

  // @scenario product-page :: Choosing another size changes the price
  // @case product-page :: Choosing 50 ml shows $80
  it("changes the price when another size is chosen", async () => {
    await ready();
    click("50 ml $80");
    expect(
      main()
        .getByRole("button", { name: "50 ml $80" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      main()
        .getByRole("button", { name: "30 ml $40" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(topPrice().textContent).toBe("$80");
  });

  // @scenario product-page :: Chosen size with a discount
  // @case product-page :: Discounted size shows the struck regular price
  it("shows the struck regular price for a discounted size", async () => {
    await ready("chanel-gabrielle", {
      details: { "chanel-gabrielle": { sizes: SALE_SIZES } },
    });
    click(/^30 ml/);
    expect(within(topPrice()).getByText("$40")).toBeTruthy();
    const struck = topPrice().querySelector("s");
    expect(struck?.textContent).toBe("$60");
  });

  // @scenario product-page :: Chosen size with a discount
  // @case product-page :: Switching to a size without discount removes the struck price
  it("removes the struck price on a size without discount", async () => {
    await ready("chanel-gabrielle", {
      details: { "chanel-gabrielle": { sizes: SALE_SIZES } },
    });
    click(/^30 ml/);
    click(/^15 ml/);
    expect(topPrice().textContent).toBe("$20");
    expect(topPrice().querySelector("s")).toBeNull();
  });

  // @scenario product-page :: Quantity starts at 1
  // @case product-page :: Quantity 1 and minus inactive on open
  it("starts with quantity 1 and minus inactive", async () => {
    await ready();
    expect(quantity()).toBe("1");
    expect(
      (
        main().getByRole("button", {
          name: "Decrease quantity",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        main().getByRole("button", {
          name: "Increase quantity",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  // @scenario product-page :: Raise and lower the quantity
  // @case product-page :: Plus twice and minus once gives 2
  it("raises and lowers the quantity", async () => {
    await ready();
    click("Increase quantity");
    click("Increase quantity");
    click("Decrease quantity");
    expect(quantity()).toBe("2");
  });

  // @scenario product-page :: Quantity stops at 10
  // @case product-page :: Plus is inactive at 10
  it("stops the quantity at 10", async () => {
    await ready();
    for (let i = 0; i < 9; i++) click("Increase quantity");
    expect(quantity()).toBe("10");
    const plus = main().getByRole("button", {
      name: "Increase quantity",
    }) as HTMLButtonElement;
    expect(plus.disabled).toBe(true);
    fireEvent.click(plus);
    expect(quantity()).toBe("10");
  });

  // @scenario product-page :: Confirmation after adding
  // @case product-page :: Added to basket shown for 3 seconds and quantity reset
  it("confirms the add for 3 seconds and resets the quantity", async () => {
    await ready();
    for (let i = 0; i < 2; i++) click("Increase quantity");
    vi.useFakeTimers();
    click("Add to basket");
    expect(main().getByText("Added to basket")).toBeTruthy();
    expect(quantity()).toBe("1");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(main().queryByText("Added to basket")).toBeNull();
  });

  // @scenario product-page :: Confirmation after adding
  // @case product-page :: Adding twice quickly
  it("adds twice quickly to the same line", async () => {
    await ready();
    click("Add to basket");
    click("Add to basket");
    expect(basket()).toEqual([
      { slug: "chanel-gabrielle", volume: 30, quantity: 2 },
    ]);
    expect(main().getByText("Added to basket")).toBeTruthy();
  });

  // @scenario product-page :: Capped add shows only the limit message
  // @case product-page :: Adding 5 to 8 shows the limit message
  it("shows only the limit message when the cap applies", async () => {
    window.localStorage.setItem(
      BASKET_KEY,
      JSON.stringify([{ slug: "chanel-gabrielle", volume: 30, quantity: 8 }]),
    );
    await ready();
    for (let i = 0; i < 4; i++) click("Increase quantity");
    click("Add to basket");
    expect(
      main().getByText("You can add at most 10 of one product"),
    ).toBeTruthy();
    expect(main().queryByText("Added to basket")).toBeNull();
    expect(basket()).toEqual([
      { slug: "chanel-gabrielle", volume: 30, quantity: 10 },
    ]);
  });

  // @scenario product-page :: Choosing a size keeps the quantity
  // @case product-page :: Quantity 4 survives a size change
  it("keeps the quantity when another size is chosen", async () => {
    await ready();
    for (let i = 0; i < 3; i++) click("Increase quantity");
    click("50 ml $80");
    expect(quantity()).toBe("4");
  });

  // @scenario basket :: Limit message disappears on the next action
  // @case basket :: Choosing another size hides the limit message
  it("hides the limit message when another size is chosen", async () => {
    window.localStorage.setItem(
      BASKET_KEY,
      JSON.stringify([{ slug: "chanel-gabrielle", volume: 30, quantity: 10 }]),
    );
    await ready();
    click("Add to basket");
    expect(
      main().getByText("You can add at most 10 of one product"),
    ).toBeTruthy();
    click("50 ml $80");
    expect(
      main().queryByText("You can add at most 10 of one product"),
    ).toBeNull();
  });

  // @scenario product-page :: Add the chosen size and quantity
  // @case product-page :: Add 50 ml times 2 to an empty basket
  it("adds the chosen size and quantity to the basket", async () => {
    await ready();
    click("50 ml $80");
    click("Increase quantity");
    click("Add to basket");
    expect(basket()).toEqual([
      { slug: "chanel-gabrielle", volume: 50, quantity: 2 },
    ]);
    const counter = screen.getByRole("link", { name: /Basket/ });
    expect(counter.textContent).toContain("2");
  });

  // @scenario product-page :: Add to the wishlist
  // @case product-page :: Heart adds the product
  it("adds the product to the wishlist with the heart", async () => {
    await ready();
    const heart = main().getByRole("button", { name: "Add to wishlist" });
    expect(heart.getAttribute("data-filled")).toBe("false");
    fireEvent.click(heart);
    await waitFor(() => expect(wishlist()).toEqual(["chanel-gabrielle"]));
    expect(
      main()
        .getByRole("button", { name: "Remove from wishlist" })
        .getAttribute("data-filled"),
    ).toBe("true");
  });

  // @scenario product-page :: Remove from the wishlist
  // @case product-page :: Filled heart removes the product
  it("removes the product from the wishlist with the filled heart", async () => {
    window.localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(["chanel-gabrielle"]),
    );
    await ready();
    fireEvent.click(
      main().getByRole("button", { name: "Remove from wishlist" }),
    );
    expect(
      main()
        .getByRole("button", { name: "Add to wishlist" })
        .getAttribute("data-filled"),
    ).toBe("false");
    expect(wishlist()).toEqual([]);
  });
});
