import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home } from "lucide-react";
import AppShell from "../organisms/AppShell";

describe("AppShell", () => {
  it("renders sidebar items and children", () => {
    render(
      <AppShell
        sidebarItems={[{ id: "home", label: "Dashboard", icon: Home }]}
      >
        <div>Konten Halaman</div>
      </AppShell>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Konten Halaman")).toBeInTheDocument();
  });

  it("renders breadcrumb in topbar", () => {
    render(
      <AppShell
        sidebarItems={[]}
        breadcrumbItems={[{ label: "Beranda" }]}
      >
        <div>Isi</div>
      </AppShell>
    );
    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });

  it("calls onItemClick when nav clicked", () => {
    const onItemClick = vi.fn();
    render(
      <AppShell
        sidebarItems={[{ id: "home", label: "Dashboard", icon: Home }]}
        onItemClick={onItemClick}
      >
        <div>Isi</div>
      </AppShell>
    );
    fireEvent.click(screen.getByText("Dashboard"));
    expect(onItemClick).toHaveBeenCalledWith("home", expect.objectContaining({ id: "home" }));
  });
});
