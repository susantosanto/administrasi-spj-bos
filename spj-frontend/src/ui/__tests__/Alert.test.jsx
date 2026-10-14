import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Alert from "../molecules/Alert";

describe("Alert", () => {
  it("renders children", () => {
    render(<Alert>Pesan penting</Alert>);
    expect(screen.getByText("Pesan penting")).toBeInTheDocument();
  });

  it("has role=alert", () => {
    render(<Alert>Pesan</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Alert title="Perhatian">Detail</Alert>);
    expect(screen.getByText("Perhatian")).toBeInTheDocument();
  });

  it("shows close button when onClose provided", () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Pesan</Alert>);
    fireEvent.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not show close button without onClose", () => {
    render(<Alert>Pesan</Alert>);
    expect(screen.queryByLabelText("Tutup")).not.toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(<Alert variant="success">OK</Alert>);
    expect(container.firstChild.className).toContain("text-success");
  });
});
