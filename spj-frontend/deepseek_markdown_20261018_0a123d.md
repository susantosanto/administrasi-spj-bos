# PROGRESS CHECKPOINT — Redesign UI/UX SPJ BOS/BOSP

> **Status:** Selesai Step 13A, Siap Lanjut ke Step 13B
> **Terakhir Update:** 18 Oktober 2026
> **Branch Git:** `redesign/v2-foundation`
> **Test:** 123/123 Hijau ✅

---

## 🎯 Konteks Utama Proyek
Kita sedang melakukan **Redesign UI/UX Total** menggunakan pendekatan *Strangler Fig* (UI baru tumbuh berdampingan dengan UI lama, logic bisnis tidak disentuh).
- **Design System:** "Modern Premium" (Minimalis, bersih, menggunakan *Glassmorphism* yang terkontrol, tanpa Dark Mode).
- **Tools Kolaborasi:** 
  - **DeepSeek (Arsitek):** Menyusun prompt, arsitektur, audit.
  - **OpenCode (Eksekutor):** Menulis kode, refactor, test.
  - **Anda (Pemilik):** Approve, review visual, eksekusi perintah terminal.

---

## ✅ Yang Sudah Selesai (Fondasi & UI/UX)
1. **Fondasi Token v2:** Warna, Tipografi (Inter & Hanken Grotesk), Radius, Shadow. Menggunakan RGB triplet untuk mendukung *opacity modifier* (`bg-primary/10`).
2. **Library Komponen (`src/ui/`):**
   - 12 Atoms, 8 Molecules, 5 Organisms.
   - Ditambah `EmptyState`, `TransitionOverlay`, `SplashScreen`.
3. **Pembersihan Total:**
   - Menghapus Dark Mode sepenuhnya (fokus 100% Light Mode).
   - Menghapus animasi berlebihan (metaballs, gradient bergerak).
4. **Halaman yang Sudah 100% Migrasi:**
   - `LandingPage` (Hero, Fitur, CTA, Footer + Motif Floral SVG).
   - `LoginPage` (Panel kiri solid biru, panel kanan glass).
   - `DashboardLayout` (Sidebar & Topbar v2).
   - `DashboardHome` (Bento Grid, Stats, Akses Cepat).
   - `DataSekolahPage` (Form & Upload Excel).
   - `DataGuruPage` (Tabel data + Fitur Search + EmptyState).
   - `BKUPage` (Tabel utama, Upload, EmptyState, dan `BKUSidebar` 100% bersih dari class lama).
   - `NomorSuratPage` (Bagian luar/layout & header sudah v2).
5. **"Nyawa" Aplikasi:**
   - Splash Screen saat awal buka.
   - Transisi *fade-in* antar halaman.
   - Transisi Login → Dashboard dan Logout.
   - Transisi Landing → Login.

---

## ⏳ Yang Sedang Dikerjakan (Step 13B)
Kita sedang membersihkan sisa-sisa class lama di `NomorSuratPage.jsx`. 
- File: `src/pages/dashboard/NomorSuratPage.jsx`
- Masalah: Masih ada **26 baris** `material-symbols-outlined` dan `bg-slate-200` di dalam form dan modal.
- Target: Mengganti semua ikon tersebut dengan Lucide dan merapikan class hover.

---

## 🗺️ Sisa Roadmap (Estimasi 15–20 Step Lagi)
- **Step 13B:** Cleanup NomorSurat (Form & Modal). *(Sedang dikerjakan)*
- **Step 14:** `TemplateSuratPage` (Editor surat).
- **Step 15:** `RealisasiPage` (Grafik & Tabel).
- **Step 16:** `DokumenKelengkapanPage`.
- **Step 17:** `DokumenSPJPage` (18 Template & 8 Card).
- **Step 18:** `ReferensiKodePage`.
- **Step 19:** `NotesPage` & `PengaturanPage` (Bisa digabung).
- **Step 20:** `PejabatSekolahPage`.
- **Step 21:** `PratinjauPage` (Print preview).
- **Step 22:** `DokumentasiAIPage`.
- **Step 23:** Polish Print (A4, page-break).
- **Step 24:** Audit Aksesibilitas & Performa.
- **Step 25:** Cleanup (Hapus file `.v1-backup`, `LoginPage.legacy`, Material Symbols).

---

## 📌 Aturan Penting (Jangan Dilanggar)
1. **JANGAN sentuh** folder `src/utils/`, `src/data/`, dan `api/` (Logika bisnis harus utuh).
2. **JANGAN gunakan** `material-symbols-outlined`. Selalu gunakan `lucide-react`.
3. **JANGAN gunakan** hardcode warna (seperti `bg-slate-200`, `text-green-100`). Gunakan token v2 (seperti `bg-surface`, `text-success`, `bg-primary/10`).
4. **JANGAN pakai** Dark Mode (sudah dihapus). Fokus 100% Light Mode.
5. OpenCode **wajib** melaporkan hasil dengan format baku (Status, Tugas 1-n, Verifikasi Build/Test, Commit Hash, Catatan).

---

## 🚀 Cara Lanjut (Kapan Pun Anda Kembali)
1. Buka file `PROGRESS_CHECKPOINT.md` ini.
2. Beritahu AI (DeepSeek): *"Tolong baca PROGRESS_CHECKPOINT.md, kita lanjut dari Step 13B."*
3. AI akan memberikan **Prompt Step 13B** untuk di-paste ke OpenCode.