import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FormField from "../molecules/FormField";

describe("FormField", () => {
  it("renders label and children", () => {
    render(
      <FormField label="Nama" htmlFor="nama">
        <input id="nama" />
      </FormField>
    );
    expect(screen.getByText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <FormField label="Email" error="Email tidak valid">
        <input />
      </FormField>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Email tidak valid");
  });

  it("shows hint when no error", () => {
    render(
      <FormField label="Email" hint="Format: nama@domain.com">
        <input />
      </FormField>
    );
    expect(screen.getByText("Format: nama@domain.com")).toBeInTheDocument();
  });

  it("hides hint when error present", () => {
    render(
      <FormField label="Email" hint="Hint" error="Error">
        <input />
      </FormField>
    );
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows asterisk when required", () => {
    const { container } = render(
      <FormField label="Nama" required>
        <input />
      </FormField>
    );
    const label = container.querySelector("label");
    expect(label.className).toContain("after:content-['*']");
  });
});
