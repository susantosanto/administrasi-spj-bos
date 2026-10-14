import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Radio from "../atoms/Radio";

describe("Radio", () => {
  it("renders with label", () => {
    render(<Radio label="Pilihan A" name="test" value="a" />);
    expect(screen.getByText("Pilihan A")).toBeInTheDocument();
  });

  it("has radio role", () => {
    render(<Radio label="Pilihan A" name="test" value="a" />);
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });
});
