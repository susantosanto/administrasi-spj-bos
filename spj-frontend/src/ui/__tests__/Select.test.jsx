import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Select from "../atoms/Select";

describe("Select", () => {
  it("renders options", () => {
    render(
      <Select>
        <option value="a">Opsi A</option>
        <option value="b">Opsi B</option>
      </Select>
    );
    expect(screen.getByText("Opsi A")).toBeInTheDocument();
    expect(screen.getByText("Opsi B")).toBeInTheDocument();
  });

  it("sets aria-invalid when error", () => {
    const { container } = render(<Select error><option>x</option></Select>);
    expect(container.querySelector("select")).toHaveAttribute("aria-invalid", "true");
  });
});
