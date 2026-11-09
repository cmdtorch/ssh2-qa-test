import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import Price, { formatPrice } from "./Price";

// @scenario catalog-page :: Whole price
// @case catalog-page :: 40 dollars is shown as $40
it("shows 40 as $40", () => {
  expect(formatPrice(40)).toBe("$40");
});

// @scenario catalog-page :: Price with cents
// @case catalog-page :: 81.6 dollars is shown as $81.60
it("shows 81.6 as $81.60", () => {
  expect(formatPrice(81.6)).toBe("$81.60");
});

// @scenario catalog-page :: Price with cents
// @case catalog-page :: 92.4 dollars is shown as $92.40
it("shows 92.4 as $92.40", () => {
  expect(formatPrice(92.4)).toBe("$92.40");
});

// @scenario catalog-page :: Price in thousands
// @case catalog-page :: 1250 dollars is shown as $1,250
it("shows 1250 as $1,250", () => {
  expect(formatPrice(1250)).toBe("$1,250");
});

// @scenario catalog-page :: Price in thousands
// @case catalog-page :: 1250.5 dollars is shown as $1,250.50
it("shows 1250.5 as $1,250.50", () => {
  expect(formatPrice(1250.5)).toBe("$1,250.50");
});

// @scenario catalog-page :: Price in thousands
// @case catalog-page :: 999 dollars has no separator
it("shows 999 as $999", () => {
  expect(formatPrice(999)).toBe("$999");
});

// @scenario catalog-page :: Price in thousands
// @case catalog-page :: 1000 dollars gets the separator
it("shows 1000 as $1,000", () => {
  expect(formatPrice(1000)).toBe("$1,000");
});

it("shows a rounding-prone amount with two decimals", () => {
  expect(formatPrice(244.8)).toBe("$244.80");
  expect(formatPrice(1600)).toBe("$1,600");
});

it("the Price component renders the formatted text", () => {
  const { container } = render(<Price value={81.6} />);

  expect(container.textContent).toBe("$81.60");
});
