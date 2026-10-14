/**
 * Setup file untuk Vitest
 * - Import @testing-library/jest-dom matchers (toBeInTheDocument, dll)
 * - Cleanup otomatis setelah setiap test
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup DOM setelah setiap test — mencegah leak antar test
afterEach(() => {
  cleanup();
});
