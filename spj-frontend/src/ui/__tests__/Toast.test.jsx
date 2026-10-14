import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../molecules/Toast";

function TestTrigger() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success({ title: "Berhasil", message: "Data tersimpan" })}>
        Trigger Success
      </button>
      <button onClick={() => toast.error({ title: "Gagal", duration: 0 })}>
        Trigger Error
      </button>
    </div>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws when useToast is outside provider", () => {
    // Suppress console.error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestTrigger />)).toThrow();
    spy.mockRestore();
  });

  it("renders toast when triggered", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Trigger Success"));
    expect(screen.getByText("Berhasil")).toBeInTheDocument();
    expect(screen.getByText("Data tersimpan")).toBeInTheDocument();
  });

  it("auto-dismisses after duration", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Trigger Success"));
    expect(screen.getByText("Berhasil")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByText("Berhasil")).not.toBeInTheDocument();
  });

  it("can close manually", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Trigger Success"));
    fireEvent.click(screen.getByLabelText("Tutup"));
    expect(screen.queryByText("Berhasil")).not.toBeInTheDocument();
  });
});
