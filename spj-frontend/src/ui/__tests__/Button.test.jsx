import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../atoms/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByText("Simpan")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    fireEvent.click(screen.getByText("Klik"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Klik</Button>);
    fireEvent.click(screen.getByText("Klik"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows spinner when loading", () => {
    const { container } = render(<Button loading>Simpan</Button>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows Memproses text when loading", () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByText("Memproses…")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByText("Memproses…").closest("button")).toBeDisabled();
  });
});
