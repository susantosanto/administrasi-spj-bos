import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../LoginPage";

// ─── Mocks ──────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};
vi.mock("../../components/ui/Toast", () => ({
  useToast: () => mockToast,
}));

const mockStorageSet = vi.fn();
vi.mock("../../utils/storageHelper", () => ({
  default: {
    set: (...args) => mockStorageSet(...args),
    get: vi.fn(),
  },
}));

// ─── Helpers ────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

// Query helpers — pakai exact untuk hindari ambiguitas
function getUsernameInput() {
  return screen.getByLabelText("Username");
}
function getPasswordInput() {
  // Exact match "Password" (bukan "Tampilkan password" / "Sembunyikan password")
  return screen.getByLabelText("Password", { exact: true });
}

// ─── Tests ──────────────────────────────────────────────────────
describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and form fields", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /masuk ke akun/i })
    ).toBeInTheDocument();
    expect(getUsernameInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^masuk$/i })
    ).toBeInTheDocument();
  });

  it("has required attribute on both inputs", () => {
    renderPage();
    expect(getUsernameInput()).toBeRequired();
    expect(getPasswordInput()).toBeRequired();
  });

  it("toggles password visibility", () => {
    renderPage();
    const password = getPasswordInput();
    expect(password).toHaveAttribute("type", "password");

    const toggle = screen.getByLabelText("Tampilkan password");
    fireEvent.click(toggle);

    expect(password).toHaveAttribute("type", "text");
  });

  it("calls storageHelper.set and navigate on valid submit", async () => {
    renderPage();

    fireEvent.change(getUsernameInput(), {
      target: { value: "admin" },
    });
    fireEvent.change(getPasswordInput(), {
      target: { value: "rahasia" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^masuk$/i }));

    // Loading state
    expect(
      screen.getByRole("button", { name: /memproses/i })
    ).toBeInTheDocument();

    // Wait for setTimeout (1000ms)
    await waitFor(
      () => {
        expect(mockStorageSet).toHaveBeenCalledWith("auth", true);
        expect(mockStorageSet).toHaveBeenCalledWith(
          "auth_user",
          expect.objectContaining({ name: "admin", role: "admin" })
        );
        expect(mockStorageSet).toHaveBeenCalledWith(
          "auth_token",
          expect.stringMatching(/^mock-token-/)
        );
        expect(mockToast.success).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 2000 }
    );
  });

  it("saves remember preference when checked", async () => {
    renderPage();

    fireEvent.change(getUsernameInput(), {
      target: { value: "admin" },
    });
    fireEvent.change(getPasswordInput(), {
      target: { value: "rahasia" },
    });
    fireEvent.click(screen.getByLabelText("Ingat saya"));

    fireEvent.click(screen.getByRole("button", { name: /^masuk$/i }));

    await waitFor(
      () => {
        expect(mockStorageSet).toHaveBeenCalledWith("auth_remember", true);
      },
      { timeout: 2000 }
    );
  });
});
