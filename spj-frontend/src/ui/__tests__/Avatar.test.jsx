import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Avatar from "../atoms/Avatar";

describe("Avatar", () => {
  it("renders initials when no src", () => {
    render(<Avatar name="Budi Santoso" />);
    expect(screen.getByText("BS")).toBeInTheDocument();
  });

  it("renders image when src provided", () => {
    render(<Avatar src="/foto.jpg" alt="Foto" name="Budi" />);
    expect(screen.getByAltText("Foto")).toBeInTheDocument();
  });

  it("falls back to initials on image error", () => {
    render(<Avatar src="/broken.jpg" name="Budi Santoso" />);
    const img = screen.getByAltText("Budi Santoso");
    fireEvent.error(img);
    expect(screen.getByText("BS")).toBeInTheDocument();
  });

  it("returns ? when no name", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
