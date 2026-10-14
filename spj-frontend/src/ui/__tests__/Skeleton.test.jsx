import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Skeleton from "../atoms/Skeleton";

describe("Skeleton", () => {
  it("renders with default variant", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse", "rounded-md");
  });

  it("applies circle variant", () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.firstChild).toHaveClass("rounded-full");
  });

  it("applies text variant", () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass("h-4", "rounded-sm");
  });

  it("applies width and height", () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    expect(container.firstChild).toHaveStyle({
      width: "100px",
      height: "50px",
    });
  });
});
