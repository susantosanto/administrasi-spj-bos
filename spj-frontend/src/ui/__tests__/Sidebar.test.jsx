import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home, FileText } from "lucide-react";
import Sidebar from "../organisms/Sidebar";

const items = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "dokumen", label: "Dokumen", icon: FileText },
];

describe("Sidebar", () => {
  it("renders nav items", () => {
    render(<Sidebar items={items} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Dokumen")).toBeInTheDocument();
  });

  it("highlights active item", () => {
    const { container } = render(<Sidebar items={items} activeId="home" />);
    const activeBtn = container.querySelector('[title="Dashboard"]') ||
                      screen.getByText("Dashboard").closest("button");
    expect(activeBtn.className).toContain("bg-primary");
  });

  it("calls onItemClick", () => {
    const onItemClick = vi.fn();
    render(<Sidebar items={items} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Dashboard"));
    expect(onItemClick).toHaveBeenCalledWith("home", items[0]);
  });

  it("hides labels when collapsed", () => {
    render(<Sidebar items={items} collapsed />);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("calls onToggleCollapse", () => {
    const onToggle = vi.fn();
    render(
      <Sidebar items={items} onToggleCollapse={onToggle} />
    );
    const toggleBtn = screen.getByLabelText("Ciutkan sidebar");
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("has nav aria-label", () => {
    render(<Sidebar items={items} />);
    expect(screen.getByLabelText("Navigasi utama")).toBeInTheDocument();
  });
});
