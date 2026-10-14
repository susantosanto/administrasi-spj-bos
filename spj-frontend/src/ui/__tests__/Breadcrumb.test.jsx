import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "../molecules/Breadcrumb";

describe("Breadcrumb", () => {
  it("returns null on empty items", () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders items", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dokumen", href: "/dokumen" },
          { label: "LPJ" },
        ]}
      />
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dokumen")).toBeInTheDocument();
    expect(screen.getByText("LPJ")).toBeInTheDocument();
  });

  it("marks last item as current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Halaman" },
        ]}
      />
    );
    expect(screen.getByText("Halaman")).toHaveAttribute("aria-current", "page");
  });

  it("renders links for non-last items with href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Current" },
        ]}
      />
    );
    const home = screen.getByText("Home");
    expect(home.tagName).toBe("A");
    expect(home).toHaveAttribute("href", "/");
  });

  it("has nav aria-label", () => {
    render(<Breadcrumb items={[{ label: "Home" }]} />);
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });
});
