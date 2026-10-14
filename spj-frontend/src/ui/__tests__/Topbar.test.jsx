import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Topbar from "../organisms/Topbar";

describe("Topbar", () => {
  it("renders breadcrumb", () => {
    render(
      <Topbar
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Dashboard" },
        ]}
      />
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders user name", () => {
    render(
      <Topbar user={{ name: "Budi Santoso", email: "budi@test.com" }} />
    );
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
  });

  it("calls onThemeToggle", () => {
    const onToggle = vi.fn();
    render(<Topbar theme="light" onThemeToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText("Mode gelap"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows moon icon in light mode", () => {
    render(<Topbar theme="light" onThemeToggle={() => {}} />);
    expect(screen.getByLabelText("Mode gelap")).toBeInTheDocument();
  });

  it("shows sun icon in dark mode", () => {
    render(<Topbar theme="dark" onThemeToggle={() => {}} />);
    expect(screen.getByLabelText("Mode terang")).toBeInTheDocument();
  });

  it("calls onMobileMenuToggle", () => {
    const onToggle = vi.fn();
    render(<Topbar onMobileMenuToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText("Buka menu"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
