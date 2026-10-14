import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageContainer from "../organisms/PageContainer";

describe("PageContainer", () => {
  it("renders children", () => {
    render(<PageContainer>Konten</PageContainer>);
    expect(screen.getByText("Konten")).toBeInTheDocument();
  });

  it("applies max width by size", () => {
    const { container } = render(<PageContainer size="sm">X</PageContainer>);
    expect(container.firstChild).toHaveClass("max-w-3xl");
  });

  it("applies padding by prop", () => {
    const { container } = render(<PageContainer padding="lg">X</PageContainer>);
    expect(container.firstChild).toHaveClass("p-6", "lg:p-8");
  });
});
