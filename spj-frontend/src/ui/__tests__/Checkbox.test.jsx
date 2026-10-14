import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Checkbox from "../atoms/Checkbox";

describe("Checkbox", () => {
  it("renders with label", () => {
    render(<Checkbox label="Setuju" />);
    expect(screen.getByText("Setuju")).toBeInTheDocument();
  });

  it("is checkable", () => {
    render(<Checkbox label="Setuju" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });
});
