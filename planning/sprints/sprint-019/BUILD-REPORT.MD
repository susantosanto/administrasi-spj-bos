# BUILD-REPORT — Sprint 019: Rapikan Sidebar BKU + Menu "Kas & Dokumen" + Dokumentasi ke Tab Dokumen LPJ + Fix Crash

> Status: **SELESAI & DITUTUP 2026-10-23** (per perintah user "tutup sprint dan push ke main").
> Build final `✓ built in 6.68s` · grep gates 0 hit · browser verifikasi PASS (0 console error).
> **Catatan jujur:** `/acceptance-runner` konteks segar TIDAK dijalankan — user memerintahkan
> penutupan langsung. Verdict formal bisa menyusul bila diminta.

---

## 1. Yang Dikerjakan (5 fase + 2 revisi user)

| Fase | Isi |
|---|---|
| F0 | **Fix crash sidebar** — hapus `setSpjOpen`/`setSpjChecked` dari reset effect (sisa Sprint 018 → ReferenceError saat klik baris grup) + key komposit `<li key={`${r.row}-${r.uraian \|\| 'x'}-${gi}`}>` |
| F1 | **Hapus 4 pintu mati** (K-1/K-2/K-3/K-9): "Buka di LPJ" ×2, "Lengkapi PBJ", card "Cetak Dokumen", topbar "Kirim ke PBJ"; Coretax tetap (K-8) |
| F2 | **Rename "Data BKU" → "Kas & Dokumen"** — 7 titik (Sidebar, BKUPage, DashboardHome ×4, contextMap, DokumenKelengkapanPage); string konsep-data tetap (whitelist) |
| F3 | **Tab "Dokumentasi" dihapus total** (K-5, semua baris termasuk pajak); blok pindah ke tab Dokumen LPJ sebelum Panel Preview (K-6) via komponen baru `BKUSidebarDokumentasi.jsx` |
| F4 | **Form-UX (D-1)**: toolbar `sticky top-16` + chip progres klik→sorot + hint BKU; banner gate jadi chip clickable (`pelanggaran` punya fieldId, `gate.kurang` tidak); `id="f-nomor"` ditambah ke `MaminSeksi1Dasar.jsx` |
| Revisi R1 | **Foto dokumentasi digabung ke Panel Preview utama** — state diangkat ke hook baru `useFotoDokumen.js`; dokumen A4 baru `FotoDokumenPaper.jsx` (kop + grid 2 kolom, 6 foto/hal + TTD) via cabang `kind:'foto'` di `PanelPreviewDocument`; modal preview foto DIHAPUS; print twin `.sk-print-area` menjaga kemampuan cetak |
| Revisi R2 | **Tombol AI disamakan desain aplikasi + pembeda premium** — semua violet/amber/emerald/cyan/indigo dihapus (blue-only dibereskan); Generate = keluarga tombol aplikasi (gradient primary→blue, `min-h-[44px]`, `font-bold`) + ikon `auto_awesome` + chip "AI" + ring primary |

## 2. File Baru / Diubah

**Baru:** `BKUSidebarDokumentasi.jsx` (162), `useFotoDokumen.js` (91), `FotoDokumenPaper.jsx` (69)
**Diubah:** `BKUSidebar.jsx` (823→557), `BKUSidebarLpj.jsx`, `BKUSidebarLpjToolbar.jsx` (99, ditulis ulang), `DetailDokumenLpj.jsx`, `DetailDokumenLpjBody.jsx`, `MaminSeksi1Dasar.jsx`, `DokumentasiAIGenerate.jsx` (446→305), `PanelPreviewDocument.jsx`, `Sidebar.jsx`, `contextMap.js`, `BKUPage.jsx`, `DashboardHome.jsx`, `DokumenKelengkapanPage.jsx`
**Tabu (0 diff):** `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`, `templateConfig.js`, `previewDocs.js`, `DokumenSPJPage.jsx`

## 3. Bukti Verifikasi

- Build: `✓ built in 6.68s` (final; 6× PASS sepanjang sprint)
- Grep gates: 4 tombol terhapus = 0 hit; tab dokumentasi = 0; `handleDeepLink`/`useNavigate` = 0; warna terlarang kartu AI = 0; sisa "Data BKU" hanya whitelist konsep-data
- Ukuran: Dokumentasi 162 ≤300 · Toolbar 99 ≤100 · BKUSidebar −266 dari baseline
- Browser (Playwright): klik baris grup crash-test → sidebar terbuka 0 error; foto uji upload → dokumen "Dokumentasi Foto Kegiatan" tampil sebagai dokumen TERAKHIR Panel Preview; print twin 210mm berisi img di DOM; chip toolbar & banner → sorot `f-nomor` in-viewport; toolbar sticky terukur 64px; halaman `/dashboard/dokumen-lpj` hash utuh
- Screenshot: `sprint019-sticky-toolbar.png`, `sprint019-revisi-foto-di-panel.png`, `sprint019-revisi-kartu-ai.png` (lokal, di-gitignore)

## 4. Yang Tidak Diuji (jujur)

- Alur generate AI end-to-end (Puter.js, layanan eksternal) — jalur state identik dengan upload yang terverifikasi
- Uji klik Simpan penuh + cetak fisik (milik acceptance-runner)
- `/acceptance-runner` konteks segar — tidak dijalankan atas perintah user

## 5. Insiden yang Dipulihkan

Splice PowerShell merusak encoding UTF-8 `BKUSidebar.jsx` (`·`→`Â·`, BOM→`?` baris 1) —
dipulihkan via reverse-encoding cp1252→UTF-8; file kini lebih bersih dari baseline HEAD.
Pelajaran: edit file UTF-8-noBOM via PowerShell WAJIB `[IO.File]::ReadAllText/WriteAllText`
(path absolut), BUKAN `Set-Content -Encoding UTF8` (PS 5.1 menulis BOM + double-encode).
