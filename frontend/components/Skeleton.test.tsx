import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import Skeleton from "./Skeleton";

it("renders a placeholder hidden from screen readers", () => {
  render(<Skeleton data-testid="sk" />);

  expect(screen.getByTestId("sk")).toHaveAttribute("aria-hidden", "true");
});
