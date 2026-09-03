/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // LPJ BOS/BOSP — Premium Blue Design System (Consolidated 2026-09-02)
      // Audit: 539x primary, 302x text-sm, 223x rounded-xl — palette disederhanakan
      // dari 58 token → 18 token inti yang benar-benar terpakai.
      // Gradients & tertiary tokens yang tidak terpakai dihapus.
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // ── Brand ──────────────────────────────────────────────────
        primary: "#004ac6",               // CTA, link, active state (539 usages)
        "primary-hover": "#003ea8",       // Hover — on-primary-fixed-variant
        "primary-light": "#dbe1ff",       // Soft bg — primary-fixed
        "primary-fixed": "#dbe1ff",       // Alias kompatibilitas (3 usages)
        "primary-container": "#2563eb",   // Solid container (1 usage, btn primary)
        "on-primary": "#ffffff",          // Text on primary
        "on-primary-container": "#eeefff",// Text on primary-container

        // ── Surface / Background ───────────────────────────────────
        background: "#f8f9fb",            // Page bg
        surface: "#f8f9fb",               // Alias page bg (38 usages)
        "surface-container-lowest": "#ffffff", // Card bg (9 usages)
        "surface-container-low": "#f3f4f6",    // Muted card / input bg
        "surface-container": "#edeef0",        // Section bg
        "surface-container-high": "#e7e8ea",   // Hover / elevated
        "surface-variant": "#e1e2e4",          // Divider variant
        "on-surface": "#191c1e",               // Primary text on surface
        "on-surface-variant": "#434655",       // Secondary text
        "on-background": "#191c1e",            // Alias

        // ── Outline / Border ───────────────────────────────────────
        outline: "#737686",              // Strong border
        "outline-variant": "#c3c6d7",     // Subtle border (42 usages)

        // ── Semantic ───────────────────────────────────────────────
        error: "#ba1a1a",                 // Form error (76 usages)
        danger: "#DC2626",                // Alias danger (7 usages)
        warning: "#EAB308",               // Warning (16 usages)
        success: "#059669",               // NEW — konsisten untuk emerald states
        "text-high": "#111827",           // Heading (28 usages)
        "text-low": "#6B7280",            // Muted (31 usages)
        secondary: "#006c4a",             // Accent secondary (2 usages)

        // ── Deprecated aliases (keep for backward compat, jangan tambah baru) ──
        // primary-fixed-dim, surface-dim, inverse-*, tertiary-* dihapus 2026-09-02
      },
      borderRadius: {
        DEFAULT: "0.25rem",   // 4px
        sm: "0.5rem",         // 8px
        lg: "0.75rem",        // 12px — rounded-xl (223 usages, dominant)
        xl: "1rem",           // 16px — rounded-2xl (132 usages)
        "2xl": "1.5rem",      // 24px — rounded-3xl (34 usages)
        full: "9999px",
      },
      spacing: {
        // 8px grid — gunakan gap-2 (8px), gap-4 (16px), p-lg (24px)
        xs: "4px",            // 4px — p-1
        sm: "8px",            // 8px — gap-2, py-2 (146 usages)
        md: "16px",           // 16px — gap-4, p-4
        lg: "24px",           // 24px — p-6 (≈24px), gap-6
        xl: "32px",           // 32px — p-8
        base: "4px",
        "margin-page": "24px",// Page padding
        gutter: "16px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Hanken Grotesk", "sans-serif"],
        // Aliases kompatibilitas
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Hanken Grotesk", "sans-serif"],
        "headline-lg-mobile": ["Hanken Grotesk", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-xs": ["Inter", "sans-serif"],
        "headline-sm": ["Hanken Grotesk", "sans-serif"],
        "headline-md": ["Hanken Grotesk", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
      },
      fontSize: {
        // Scale aktual: text-xs 261x, text-sm 302x, text-lg 119x — jaga 14px+ untuk body
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-xs": ["12px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "500" }],
        "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      boxShadow: {
        // Premium Blue — 3 level + colored glow (audit: shadow-lg 78, shadow-sm 76 dominan)
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        DEFAULT: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
        md: "0 4px 12px rgba(0,0,0,0.06)",
        lg: "0 10px 24px -6px rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.05)",
        xl: "0 20px 60px -15px rgba(0,0,0,0.12)",
        "primary-sm": "0 4px 12px rgba(0,74,198,0.12)",
        "primary-md": "0 8px 24px rgba(0,74,198,0.18)",
        "primary-lg": "0 20px 60px -15px rgba(0,74,198,0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-in": "toastIn 0.4s cubic-bezier(0.21, 1.02, 0.73, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        toastIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
