/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // SPJ Design System v2 — "Tenang"
      // Token-driven, semantic, dark mode via CSS variables.
      // Lihat DESIGN_TOKENS.md untuk referensi lengkap.
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // ── Brand (satu warna, semua halaman) ──────────────────────
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-soft": "var(--color-primary-soft)",
        "on-primary": "var(--color-on-primary)",
        // ── Brand panel — FIXED color (tidak berubah di dark mode) ──
        "brand-panel": "var(--color-brand-panel)",

        // ── Surface ────────────────────────────────────────────────
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        "surface-high": "var(--color-surface-high)",

        // ── Border ─────────────────────────────────────────────────
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",

        // ── Text ───────────────────────────────────────────────────
        "text-high": "var(--color-text-high)",
        "text-muted": "var(--color-text-muted)",
        "text-low": "var(--color-text-low)",

        // ── Semantic ───────────────────────────────────────────────
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
      fontFamily: {
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Hanken Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        // Alias kompatibilitas (untuk komponen lama yang belum migrasi)
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "xs": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        "sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "base": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "lg": ["18px", { lineHeight: "1.5", fontWeight: "500" }],
        "xl": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "2xl": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "3xl": ["30px", { lineHeight: "1.2", fontWeight: "700" }],
        "4xl": ["36px", { lineHeight: "1.1", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
        DEFAULT: "12px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        primary: "var(--shadow-primary)",
        none: "none",
      },
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        "modal-backdrop": "1040",
        modal: "1050",
        toast: "1060",
        tooltip: "1070",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 250ms ease-out",
        "slide-in-right": "slide-in-right 250ms ease-out",
        "slide-in-up": "slide-in-up 250ms ease-out",
      },
    },
  },
  plugins: [],
}
