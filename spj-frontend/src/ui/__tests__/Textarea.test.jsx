import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Textarea from "../atoms/Textarea";

describe("Textarea", () => {
  it("renders textarea", () => {
    render(<Textarea placeholder="Catatan" />);
    expect(screen.getByPlaceholderText("Catatan")).toBeInTheDocument();
  });

  it("sets aria-invalid when error", () => {
    render(<Textarea error placeholder="Catatan" />);
    expect(screen.getByPlaceholderText("Catatan")).toHaveAttribute("aria-invalid", "true");
  });
});
