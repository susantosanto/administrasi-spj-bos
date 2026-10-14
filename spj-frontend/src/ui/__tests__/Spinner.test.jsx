import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "../atoms/Spinner";

describe("Spinner", () => {
  it("has role=status for accessibility", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses custom label", () => {
    render(<Spinner label="Memuat data" />);
    expect(screen.getByLabelText("Memuat data")).toBeInTheDocument();
  });

  it("supports size prop", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector("svg")).toHaveClass("w-8", "h-8");
  });
});
