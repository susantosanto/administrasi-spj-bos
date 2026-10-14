import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Dropdown, {
  DropdownItem,
  DropdownSeparator,
} from "../molecules/Dropdown";

function TestDropdown({ onSelect }) {
  return (
    <Dropdown trigger={<button>Menu</button>}>
      <DropdownItem onClick={() => onSelect?.("edit")}>Edit</DropdownItem>
      <DropdownItem onClick={() => onSelect?.("delete")}>Hapus</DropdownItem>
      <DropdownSeparator />
      <DropdownItem disabled>Nonaktif</DropdownItem>
    </Dropdown>
  );
}

describe("Dropdown", () => {
  it("does not show menu initially", () => {
    render(<TestDropdown />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("opens menu on trigger click", () => {
    render(<TestDropdown />);
    fireEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Hapus")).toBeInTheDocument();
  });

  it("has role=menu when open", () => {
    render(<TestDropdown />);
    fireEvent.click(screen.getByText("Menu"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("calls item onClick and closes", () => {
    const onSelect = vi.fn();
    render(<TestDropdown onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Menu"));
    fireEvent.click(screen.getByText("Edit"));
    expect(onSelect).toHaveBeenCalledWith("edit");
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<TestDropdown />);
    fireEvent.click(screen.getByText("Menu"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("closes on click outside", () => {
    render(
      <div>
        <TestDropdown />
        <button>Di luar</button>
      </div>
    );
    fireEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText("Di luar"));
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("does not call onClick on disabled item", () => {
    const onSelect = vi.fn();
    render(<TestDropdown onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Menu"));
    fireEvent.click(screen.getByText("Nonaktif"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
