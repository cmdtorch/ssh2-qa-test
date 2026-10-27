import { render, screen } from "@testing-library/react";

import Home from "./page";

// @scenario web-app :: Start page unit test passes
// @scenario web-app :: Start page opens
// @case web-app :: Start page has exactly one heading
it("renders the start page with exactly one non-empty h1", () => {
  const { container } = render(<Home />);

  const headings = container.querySelectorAll("h1");
  expect(headings).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toBe(headings[0]);
  expect(headings[0].textContent?.trim()).not.toBe("");
});
