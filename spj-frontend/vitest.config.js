/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment DOM untuk @testing-library/react
    environment: "jsdom",

    // Global test API (describe, it, expect) tanpa import
    globals: true,

    // Setup file untuk jest-dom matchers + cleanup otomatis
    setupFiles: ["./src/ui/__tests__/setup.js"],

    // Pattern test file
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],

    // Exclude node_modules dan build artifacts
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],

    // Reporter
    reporters: ["default"],

    // CSS tidak diproses di test (lebih cepat)
    css: false,
  },
});
