import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "../molecules/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Konten</Card>);
    expect(screen.getByText("Konten")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(<Card variant="elevated">Test</Card>);
    expect(container.firstChild).toHaveClass("shadow-md");
  });

  it("applies padding class", () => {
    const { container } = render(<Card padding="lg">Test</Card>);
    expect(container.firstChild).toHaveClass("p-8");
  });

  it("renders full composition", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Judul</CardTitle>
          <CardDescription>Deskripsi</CardDescription>
        </CardHeader>
        <CardBody>Isi</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Judul")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi")).toBeInTheDocument();
    expect(screen.getByText("Isi")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
