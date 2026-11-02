# REQUIREMENTS — Sprint 015: Import BKU PDF (OCR) — Pintu Masuk Alternatif Identik dengan Excel

> Status: Pack DISUSUN 2026-10-19 dari bahan yang sudah disetujui user:
> PRD (10 US) · tech stack D1–D6 · DATA-MODEL E1–E4 · MODULE-PLAN M0–M5.
> Format mengikuti Bab 8.4 Dokumen 1 (MATERI 08-Workflow-Lengkap-6-Tahap.md):
> apa & mengapa saja — TANPA detail implementasi.
>
> **REVISI 2026-10-19 v2** — dokumen ini tetap **tanpa detail implementasi**
> (perannya tidak berubah). Dua koreksi akurasi fakta saja; lihat
> §Bukti Verifikasi di bawah.

## Tujuan Sprint
Satu goal: memberi pintu masuk import BKU kedua dari **PDF hasil scan**
yang hasilnya **identik** dengan jalur import Excel yang sudah berjalan.

## Apa yang Dibangun
- Tombol "Upload PDF" di halaman BKU, di sebelah jalur Excel yang ada
- Alur: pilih file PDF → pilih bulan (persis alur Excel) → proses
  (progres per halaman) → tabel preview hasil → koreksi inline baris
  bermasalah → dialog konfirmasi → data masuk `spj_bku_data`
- Hanya baris bulan terpilih yang menggantikan transaksi bulan itu;
  sisa data (hasil Excel, meta lain) tidak tersentuh

## Mengapa
- BKU terpecah dua format sumber: Excel yang bisa di-import (terbukti
  akurat) dan PDF hasil scan yang sama sekali tidak bisa dibaca aplikasi
  (terverifikasi: file contoh 21 halaman tanpa text layer sama sekali)
- Hari ini PDF berarti ketik ulang manual ±421 transaksi/tahun, rawan salah

## Pengguna
- Primary: Bendahara SPJ SD (1 user, aplikasi desktop Edge/Chrome,
  sudah terbiasa alur import Excel → pilih bulan)
- Secondary: Penyuluh/operator yang menyalin PDF BKU dari aplikasi RKAS

## Data Sumber
- `template/contoh format BKU-PDF tahunan.pdf` — 21 halaman A4 hasil
  scan, tanpa text layer (terverifikasi), contoh file aktual
- `template-data/Realisasi Sekolah Buku Kas Umum (BKU) ... 2026.xlsx` —
  baseline pembanding sebagai angka kebenaran (oracle)
- Simpan: `spj_bku_data` (localStorage, prefix `spj_`) — bentuk baris
  SAMA PERSIS hasil jalur Excel

## Output yang Diharapkan
- Import Januari dari PDF contoh menghasilkan data IDENTIK dengan
  import Excel Januari: jumlah transaksi, total Masuk/Keluar, dan
  saldo akhir — 0 selisih
- Akurasi uraian OCR ≥ 90% pada **seluruh halaman bulan Januari**
  (terukur via script oracle + tabel per halaman, bukan perkiraan)
- Baris bermasalah bisa dikoreksi sampai bersih sebelum disimpan
- Keputusan engine OCR berangka: dua kandidat diuji, yang menang
  terukur dipilih, hasilnya dicatat di ADR

## Batasan (dari keputusan user + aturan proyek)
- Jalur import Excel STERIL: `bkuParser.js` wajib 0 diff
- Tanpa backend; semua proses di perangkat; tidak ada file yang
  dikirim ke layanan mana pun
- Stack existing frozen (React/Vite/Tailwind/xlsx tanpa upgrade)
- Dependency baru HANYA engine OCR pemenang A/B — wajib pin versi
  + catat ADR sebelum dipasang permanen
- Bila kedua engine tidak mencapai target akurasi → sprint pause,
  keputusan dikembalikan ke user (preseden sprint-013)

## Bukti Verifikasi (2026-10-19)

Fakta sumber di dokumen ini **diperiksa langsung**, bukan diasumsikan:

| Klaim | Hasil |
|---|---|
| PDF contoh = 21 halaman | ✅ `numPages: 21` |
| PDF contoh tanpa text layer | ✅ 0 char di 21/21 halaman |
| Excel baseline = sumber kebenaran | ✅ terbaca, sheet `Page1`, `A1:X365` |
| ±421 transaksi/tahun | ✅ konsisten dengan fixture 21 halaman |
| "akurasi uraian ≥ 90% di **halaman contoh**" | ⚠️ diperjelas → **seluruh halaman Januari**, bukan hanya halaman 1 (lihat `ACCEPTANCE` T-08) |

> ⚠️ **Dua hal yang harus decided user sebelum coding** (bukan cacat pack):
> 1. `template/contoh format BKU-PDF tahunan.pdf` (5,4 MB) **untracked** di
>    git — clone ulang = sprint tidak bisa jalan. Commit? (kuasa user)
> 2. Baseline T-02 ternyata **4 hit** pre-existing (bukan 2 seperti catatan
>    STATE) — semuanya di luar cakupan sprint 015. Buka = sprint tersendiri.
