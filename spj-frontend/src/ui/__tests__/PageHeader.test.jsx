import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHeader from "../organisms/PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
  });

  it("renders description", () => {
    render(<PageHeader title="X" description="Deskripsi" />);
    expect(screen.getByText("Deskripsi")).toBeInTheDocument();
  });

  it("renders breadcrumb when items provided", () => {
    render(
      <PageHeader
        title="X"
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Current" }]}
      />
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders actions slot", () => {
    render(
      <PageHeader title="X" actions={<button>Simpan</button>} />
    );
    expect(screen.getByText("Simpan")).toBeInTheDocument();
  });
});
