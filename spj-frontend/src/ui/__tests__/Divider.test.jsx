import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Divider from "../atoms/Divider";

describe("Divider", () => {
  it("renders as separator", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Divider label="atau" />);
    expect(screen.getByText("atau")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("supports vertical orientation", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
  });
});
