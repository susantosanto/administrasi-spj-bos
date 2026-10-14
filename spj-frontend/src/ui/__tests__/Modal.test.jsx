import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal, { ModalFooter } from "../molecules/Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        Konten
      </Modal>
    );
    expect(screen.queryByText("Konten")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Modal open onClose={() => {}}>
        Konten Modal
      </Modal>
    );
    expect(screen.getByText("Konten Modal")).toBeInTheDocument();
  });

  it("has role=dialog and aria-modal", () => {
    render(
      <Modal open onClose={() => {}} title="Judul">
        Isi
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Judul")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        Isi
      </Modal>
    );
    fireEvent.click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        Isi
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when closeOnEscape is false", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} closeOnEscape={false}>
        Isi
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders footer via ModalFooter", () => {
    render(
      <Modal open onClose={() => {}}>
        <ModalFooter>
          <button>Simpan</button>
        </ModalFooter>
      </Modal>
    );
    expect(screen.getByText("Simpan")).toBeInTheDocument();
  });
});
