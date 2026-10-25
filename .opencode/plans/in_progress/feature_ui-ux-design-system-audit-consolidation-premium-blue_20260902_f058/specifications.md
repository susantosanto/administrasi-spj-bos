# Specifications

Melakukan audit UI/UX menyeluruh pada aplikasi LPJ BOS/BOSP (Landing, Login, DashboardHome, Dokumen LPJ, BKU, Data Sekolah, Catatan, Sidebar/Topbar) dan mengkonsolidasi design system. Gaya visual tetap Premium Blue (white+blue, glass morphism, rounded 2xl/3xl) — bukan migrasi ke CORETAX. Output berupa token yang bersih, dokumentasi DESIGN.md yang akurat, tailwind.config dan index.css yang konsisten, serta primitives komponen yang reusable.

## Functional Requirements

- Audit inventaris warna, tipografi, spacing, radius, dan shadow yang aktual dipakai di codebase vs yang terdaftar di tailwind.config.js
- Konsolidasi tailwind.config.js: hapus token tidak terpakai, tetapkan palet primer/semantik yang konsisten (primary, surface, outline, success/warning/danger)
- Perbarui DESIGN.md agar mencerminkan sistem aktual Premium Blue (bukan hasil ekstrak CORETAX yang salah)
- Dokumentasi tipografi sistem: Hanken Grotesk untuk headline, Inter untuk body, dengan scale yang dipakai aktual (14/16 body, 20/24/32 heading)
- Standarisasi radius (12px/16px/20px/24px) dan shadow (sm/md/lg + primary glow) serta spacing 8px grid
- Audit aksesibilitas WCAG: kontras teks, focus-visible, aria-label pada icon-button, status tidak hanya mengandalkan warna

## Non-Functional Requirements

- Tidak mengubah logika bisnis atau routing, hanya token dan style
- Mempertahankan visual Premium Blue yang sudah ada — evolusi bukan revolusi
- Kontras teks minimal 4.5:1 untuk body text di background putih/slate-50
- Konsistensi harus terverifikasi via build (vite build berhasil) dan tidak ada regresi visual mayor

## Acceptance Criteria

- DESIGN.md baru akurat: palet, tipografi, spacing, radius, shadow, dan panduan Do/Dont sesuai implementasi actual
- tailwind.config.js berkurang dari ~45 warna custom menjadi <20 token inti yang semuanya terpakai
- index.css memiliki section design tokens terdokumentasi dengan CSS variables bila diperlukan
- Laporan audit (AUDIT.md atau section di DESIGN.md) mencantumkan inkonsistensi ditemukan dan keputusan perbaikan
- vite build sukses tanpa warning dan visual check pada 3 halaman utama tidak pecah

## Out of Scope

- Redesign total LandingPage/LoginPage (hanya token prep, bukan layout baru)
- Perbaikan logika BKU parser atau template engine
- Migrasi ke shadcn/ui atau library komponen eksternal
- Implementasi dark mode penuh