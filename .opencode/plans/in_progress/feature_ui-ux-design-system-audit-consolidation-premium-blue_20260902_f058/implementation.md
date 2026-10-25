# Implementation Plan

Eksekusi dalam 4 fase sekuensial: audit inventaris, konsolidasi token, dokumentasi, dan validasi. Setiap fase menghasilkan artefak yang diverifikasi sebelum lanjut.

## Phase 1 — Audit Inventaris

- [x] Inventarisasi token aktual: grep warna, spacing, radius, shadow, font usage di src/**/*
- [x] Inventarisasi komponen: list varian Button/Card/Badge/Input/Tab di semua pages
- [x] Cek aksesibilitas cepat: kontras, focus state, aria-label, color-only status

## Phase 2 — Konsolidasi Token

- [x] Rapikan tailwind.config.js: sederhanakan colors, spacing, radius, fontSize
- [x] Rapikan index.css: tokens terdokumentasi, utility konsisten, print style tetap
- [x] Sinkronkan index.html font loading dan fallback

## Phase 3 — Dokumentasi Design System

- [x] Rewrite DESIGN.md Premium Blue yang akurat (mengganti CORETAX dump)
- [x] Tambah panduan komponen primitives dan layout rules

## Phase 4 — Validasi

- [x] vite build + cek visual 3 halaman utama (Landing, DashboardHome, BKU)
- [x] Final review dan ringkasan perubahan untuk user