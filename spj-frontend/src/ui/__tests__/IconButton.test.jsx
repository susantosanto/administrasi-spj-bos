import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Save } from "lucide-react";
import IconButton from "../atoms/IconButton";

describe("IconButton", () => {
  it("renders with aria-label", () => {
    render(<IconButton icon={Save} label="Simpan" />);
    expect(screen.getByLabelText("Simpan")).toBeInTheDocument();
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<IconButton icon={Save} label="Simpan" onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("Simpan"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <IconButton icon={Save} label="Simpan" disabled onClick={onClick} />
    );
    fireEvent.click(screen.getByLabelText("Simpan"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
