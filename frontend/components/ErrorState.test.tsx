import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import ErrorState from "./ErrorState";

it("shows the text and calls onRetry from the Retry button", () => {
  const onRetry = vi.fn();
  render(<ErrorState onRetry={onRetry} />);

  expect(screen.getByText("Could not load")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("can show a specific text such as Could not load the basket", () => {
  render(<ErrorState message="Could not load the basket" onRetry={() => {}} />);

  expect(screen.getByText("Could not load the basket")).toBeInTheDocument();
});
