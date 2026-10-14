import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "../atoms/Input";

describe("Input", () => {
  it("renders input", () => {
    render(<Input placeholder="Nama" />);
    expect(screen.getByPlaceholderText("Nama")).toBeInTheDocument();
  });

  it("sets aria-invalid when error", () => {
    render(<Input error placeholder="Nama" />);
    expect(screen.getByPlaceholderText("Nama")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
