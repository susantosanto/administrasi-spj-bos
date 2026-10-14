import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../atoms/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Aktif</Badge>);
    expect(screen.getByText("Aktif")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass("text-success");
  });

  it("supports size prop", () => {
    const { container } = render(<Badge size="sm">Kecil</Badge>);
    expect(container.firstChild).toHaveClass("text-[11px]");
  });
});
