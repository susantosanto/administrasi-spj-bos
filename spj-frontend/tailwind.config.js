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
        // v2 tokens — RGB triplet + <alpha-value> untuk mendukung opacity modifier
        primary: "rgb(var(--color-primary-rgb) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover-rgb) / <alpha-value>)",
        "primary-soft": "rgb(var(--color-primary-soft-rgb) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary-rgb) / <alpha-value>)",
        // ── Brand panel — FIXED color (tidak berubah di dark mode) ──
        "brand-panel": "var(--color-brand-panel)",

        // ── Surface ────────────────────────────────────────────────
        bg: "rgb(var(--color-bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--color-surface-rgb) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted-rgb) / <alpha-value>)",
        "surface-high": "rgb(var(--color-surface-high-rgb) / <alpha-value>)",

        // ── Border ─────────────────────────────────────────────────
        border: "rgb(var(--color-border-rgb) / <alpha-value>)",
        "border-strong": "rgb(var(--color-border-strong-rgb) / <alpha-value>)",

        // ── Text ───────────────────────────────────────────────────
        "text-high": "rgb(var(--color-text-high-rgb) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        "text-low": "rgb(var(--color-text-low-rgb) / <alpha-value>)",

        // ── Semantic ───────────────────────────────────────────────
        success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
        info: "rgb(var(--color-info-rgb) / <alpha-value>)",

        // ═══════════════════════════════════════════════════════════════
        // ⚠️ BACK-COMPAT SEMENTARA (Step 5.5.1)
        // Alias token lama ke token v2. Untuk halaman yang belum dimigrasi.
        // HAPUS di Step 24 (Cleanup).
        // ═══════════════════════════════════════════════════════════════
        // Brand lama
        brand: "rgb(var(--color-primary-rgb) / <alpha-value>)",
        "brand-hover": "rgb(var(--color-primary-hover-rgb) / <alpha-value>)",
        "brand-soft": "rgb(var(--color-primary-soft-rgb) / <alpha-value>)",
        navy: "#102A56",
        ink: "rgb(var(--color-text-high-rgb) / <alpha-value>)",
        muted: "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        canvas: "rgb(var(--color-bg-rgb) / <alpha-value>)",
        line: "rgb(var(--color-border-rgb) / <alpha-value>)",

        // Primary lama (dipakai dashboard)
        "primary-light": "rgb(var(--color-primary-soft-rgb) / <alpha-value>)",
        "primary-fixed": "rgb(var(--color-primary-soft-rgb) / <alpha-value>)",
        "primary-container": "rgb(var(--color-primary-rgb) / <alpha-value>)",
        "on-primary-container": "rgb(var(--color-on-primary-rgb) / <alpha-value>)",

        // Surface lama
        background: "rgb(var(--color-bg-rgb) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--color-surface-rgb) / <alpha-value>)",
        "surface-container-low": "rgb(var(--color-surface-muted-rgb) / <alpha-value>)",
        "surface-container": "rgb(var(--color-surface-muted-rgb) / <alpha-value>)",
        "surface-container-high": "rgb(var(--color-surface-high-rgb) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-high-rgb) / <alpha-value>)",
        "on-surface": "rgb(var(--color-text-high-rgb) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        "on-background": "rgb(var(--color-text-high-rgb) / <alpha-value>)",

        // Outline lama
        outline: "rgb(var(--color-border-strong-rgb) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-border-rgb) / <alpha-value>)",

        // Semantic lama
        error: "rgb(var(--color-danger-rgb) / <alpha-value>)",
        "success-bright": "rgb(var(--color-success-rgb) / <alpha-value>)",
        secondary: "rgb(var(--color-info-rgb) / <alpha-value>)",

        // ═══════════════════════════════════════════════════════════════
        // Glassmorphism Tokens (Step 6.0)
        // Untuk elemen spesifik: navbar, sidebar, topbar, modal,
        // dropdown, toast, card hero, floating button, panel login.
        // TIDAK untuk card data / form / print area.
        // ═══════════════════════════════════════════════════════════════
        glass: {
          DEFAULT: "var(--color-glass)",
          strong: "var(--color-glass-strong)",
          border: "var(--color-glass-border)",
          "border-strong": "var(--color-glass-border-strong)",
        },
      },
      backdropBlur: {
        glass: "12px",
        "glass-strong": "16px",
        "glass-heavy": "24px",
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
        "xl": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "2xl": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "3xl": ["30px", { lineHeight: "1.15", fontWeight: "700" }],
        "4xl": ["36px", { lineHeight: "1.1", fontWeight: "700" }],
      },
      borderRadius: {
        none: "0",
        sm: "6px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
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
