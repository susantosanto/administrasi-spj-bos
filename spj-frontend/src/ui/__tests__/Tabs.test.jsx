import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabList, Tab, TabPanel } from "../molecules/Tabs";

function TestTabs() {
  return (
    <Tabs defaultValue="a">
      <TabList>
        <Tab value="a">Tab A</Tab>
        <Tab value="b">Tab B</Tab>
        <Tab value="c">Tab C</Tab>
      </TabList>
      <TabPanel value="a">Konten A</TabPanel>
      <TabPanel value="b">Konten B</TabPanel>
      <TabPanel value="c">Konten C</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows default tab panel", () => {
    render(<TestTabs />);
    expect(screen.getByText("Konten A")).toBeInTheDocument();
    expect(screen.queryByText("Konten B")).not.toBeInTheDocument();
  });

  it("switches panel on click", () => {
    render(<TestTabs />);
    fireEvent.click(screen.getByText("Tab B"));
    expect(screen.getByText("Konten B")).toBeInTheDocument();
    expect(screen.queryByText("Konten A")).not.toBeInTheDocument();
  });

  it("has correct ARIA roles", () => {
    render(<TestTabs />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("sets aria-selected on active tab", () => {
    render(<TestTabs />);
    expect(screen.getByText("Tab A")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab B")).toHaveAttribute("aria-selected", "false");
  });

  it("navigates with arrow right", () => {
    render(<TestTabs />);
    const tabA = screen.getByText("Tab A");
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowRight" });
    expect(screen.getByText("Konten B")).toBeInTheDocument();
  });

  it("navigates with arrow left", () => {
    render(<TestTabs />);
    fireEvent.click(screen.getByText("Tab C"));
    const tabC = screen.getByText("Tab C");
    tabC.focus();
    fireEvent.keyDown(tabC, { key: "ArrowLeft" });
    expect(screen.getByText("Konten B")).toBeInTheDocument();
  });
});
