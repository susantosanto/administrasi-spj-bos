# ACCEPTANCE CRITERIA — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Setiap kriteria dalam bentuk
> **Given/When/Then** + **perintah yang dijalankan** + **output yang diharapkan**.
> Kriteria yang tidak bisa dipetakan ke perintah + output harus ditulis ulang.
>
> Semua perintah dari root proyek `D:\project\spj-app`. Bukti = output asli /
> screenshot, **bukan klaim** (AGENTS.MD).

---

## Task Gate (WAJIB sebelum kriteria sprint dinilai)

Sebelum kriteria mana pun dihakimi, Builder harus sudah menempel bukti DoD per task
(`BLUEPRINT.MD` §Task Breakdown): `npm run build` exit 0 per fase + grep per fase.
Task hot path (1.1/1.2/4.1) wajib membawa baris DSA yang konsisten dengan BLUEPRINT
(cek kehadiran). Gate akhir memverifikasi perilaku — tidak menggantikan gate per task.

## Definisi "Selesai"

Sprint ini **SELESAI** jika seluruh checklist tercentang **dan** seluruh test case
(T-01…T-10) lulus **dan** kedua edge case lulus.

---

## Checklist

- [ ] C-01 Tombol ter-rename jadi "Lihat Ringkasan" di semua menu; 0 sisa "Preview Dokumen" di `DokumenFormPreview.jsx` — BKUSidebar dikecualikan (T-02)
- [ ] C-02 Preview 4 tab Perjalanan Dinas = kartu ringkasan; 0 kop, 0 TTD (T-03)
- [ ] C-03 Preview Mamin/Pemeliharaan = kartu ringkasan (T-03)
- [ ] C-04 Cetak Semua Perjalanan Dinas = 5 dokumen kop→TTD (T-04, T-05)
- [ ] C-05 Cetak Semua Mamin = set lengkap hasil pemetaan dry run (T-06)
- [ ] C-06 Penerima transport & mamin = semua status; honor tetap honorer-only (T-07)
- [ ] C-07 Panduan hidup di 4 menu; sadar-state; auto-open/dismiss benar (T-08, T-09)
- [ ] C-08 Panduan `print:hidden` — tidak bocor ke cetak (T-08)
- [ ] C-09 MenuGuide config-driven (bukti tambah panduan via config saja) (T-09)
- [ ] C-10 Regresi: Honorarium alur utuh; 15 pola anti-hardcode = 0; 3 blok 0 `<input>` (T-10)
- [x] C-11 Build sukses (T-01) — builder 2026-10-01: exit 0 ×5 (BUILD-REPORT.MD)
- [x] C-12 `STATE.MD` + pack sprint diperbarui (task 5.4) — status & bukti tercatat

---

## Test Cases

### T-01 — Build sukses
- **Given** semua task selesai
- **When** `cd spj-frontend && npm run build`
- **Then** exit code **0**, output berakhir `✓ built in …`; sebut versi runtime (`node -v`)
- **Bukti** output terminal asli

### T-02 — Tombol ter-rename (nama final: **"Lihat Ringkasan"**)
- **Given** Fase 1 selesai
- **When**
  ```bash
  grep -n "Preview Dokumen" spj-frontend/src/components/templates/DokumenFormPreview.jsx
  grep -rn "Lihat Ringkasan" spj-frontend/src
  ```
- **Then** grep-1 = **0 hasil**; grep-2 ≥ 1 hasil di lokasi tombol lama.
  Label `"Preview Dokumen Foto"` di `components/bku/BKUSidebar.jsx` **DIKECUALIKAN**
  (modul BKU di luar cakupan sprint — PUTUSAN user 2026-09-30)
- **Bukti** output grep

### T-03 — Jalur layar bebas kop & TTD
- **Given** preview dibuka untuk tab spt/sppd/resume/undangan dan Mamin
- **When** inspeksi jalur layar di `DokumenFormPreview.jsx`:
  `grep -n "renderPerRecipient" spj-frontend/src/components/templates/DokumenFormPreview.jsx`
  dan grep `KopSurat\|SignatureFooter` pada seksi `viewMode === 'preview'`
- **Then** `renderPerRecipient` **0 hasil**; 0 pemakaian `KopSurat`/`SignatureFooter` di
  jalur preview layar; UI menampilkan kartu label+nilai (screenshot)
- **Bukti** grep + screenshot preview 4 tab + Mamin

### T-04 — Cetak 5 dokumen Perjalanan Dinas
- **Given** penerima ≥1 terpilih, Data Sekolah & pejabat terisi
- **When** klik tombol cetak → print preview
- **Then** urutan dokumen: tabel Daftar Penerima → Surat Undangan → SPT → SPD →
  Resume/Notulen; tiap dokumen kop→TTD lengkap; A4; tidak terpotong antar halaman
- **Bukti** screenshot print preview berurutan + pembandingan dengan docx referensi

### T-05 — Cetak tetap formal meski layar ringkasan
- **Given** layar menampilkan kartu ringkasan (tanpa kop/TTD)
- **When** cetak dijalankan dari kondisi itu
- **Then** hasil CETAK tetap berisi kop surat & tanda tangan (formal) — layar ≠ cetak
- **Bukti** screenshot layar vs hasil cetak disandingkan

### T-06 — Set cetak Mamin lengkap
- **Given** dry run 1.3 menghasilkan tabel pemetaan docx ↔ config
- **When** klik cetak Mamin → print preview
- **Then** dokumen yang tercetak = **persis daftar hasil pemetaan** (usulan 5:
  undangan, pesanan, notulen, daftar hadir, buku tamu); tiap dokumen punya padanan
  config yang sudah ada — tanpa improvisasi
- **Bukti** tabel pemetaan + screenshot print preview

### T-07 — Penerima semua status
- **Given** Data Guru berisi pegawai PNS, PPPK, dan Honorer (≥1 masing-masing)
- **When** buka tab Daftar Penerima Perjalanan Dinas & Daftar Hadir Mamin
- **Then** ketiga status muncul di daftar pilihan; dan pada Menu Honorarium daftar
  tetap hanya honorer (screenshot 3 lokasi)
- **Bukti** screenshot + `grep -n "getSemuaPegawai" spj-frontend/src/components/templates/DokumenFormPreview.jsx` ≥ 2 cabang (transport, mamin/pemeliharaan)

### T-08 — Panduan hidup & tidak bocor cetak
- **Given** 4 menu terpasang MenuGuide
- **When** (a) buka tiap menu pertama kali → popover auto-terbuka berisi langkah;
  (b) ubah state (pilih penerima) → langkah terkait tercentang, aktif pindah;
  (c) klik "Selesai — jangan tampilkan lagi" → reload → tidak auto-open, ikon `?` tetap ada;
  (d) jalankan print preview dokumen apa pun dengan popover TERBUKA
- **Then** (a–c) perilaku sesuai + badge progres akurat; (d) popover & pill TIDAK
  ikut tercetak
- **Bukti** screenshot tiap perilaku + `grep -n "print:hidden" spj-frontend/src/components/guide/MenuGuide.jsx spj-frontend/src/data/guideConfig.js` ≥ 1 di komponen

### T-09 — Config-driven terbukti
- **Given** `guideConfig.js` berisi panduan 4 menu
- **When** tambah 1 entri panduan menu LAIN via config saja (uji sementara, di-revert setelah terbukti)
- **Then** pill+popover muncul di menu itu tanpa perubahan satu baris pun di
  `MenuGuide.jsx` (`git diff --stat components/guide/` kosong saat uji)
- **Bukti** screenshot + `git diff --stat`

### T-10 — Regresi & gate warisan
- **Given** seluruh fase selesai
- **When** jalankan kanonik:
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|197405082014121002|197912222014121003|198507172020121003|196607071986102005|197607242022212011|SD NEGERI LEBAKLEUNGSIR|20212345|20228636|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src
  grep -nE "<input|<textarea" spj-frontend/src/components/templates/blocks/SuratTugas.jsx spj-frontend/src/components/templates/blocks/SPDForm.jsx spj-frontend/src/components/templates/blocks/SuratUndangan.jsx
  git diff 264c431..HEAD --stat -- spj-frontend/src/components/templates/blocks/KopSurat.jsx spj-frontend/src/components/templates/blocks/KopGugus.jsx spj-frontend/src/components/templates/blocks/SignatureFooter.jsx spj-frontend/src/components/templates/blocks/SKHonorer.jsx spj-frontend/src/utils/sekolahData.js spj-frontend/src/utils/signatureRoles.js
  ```
- **Then** grep-1 = **0 hit**; grep-2 = **0 hasil**; git diff Sprint 003 **menambah 0**
  perubahan pada file warisan (bandingkan terhadap HEAD sebelum sprint)
- **And** alur Honorarium (form → tab SK Honorer → cetak) berperilaku sama seperti
  sebelum sprint (uji manual 2 kondisi data: kosong & terisi)
- **Bukti** output grep + git diff + screenshot Honorarium

---

## Edge Case Scenarios

### E-1 — Form kosong total (empty input)
localStorage bersih (`spj_` dihapus semua), buka Perjalanan Dinas.
**Harapan:** kartu ringkasan tampil dengan nilai kosong (tanpa crash); `PeringatanData`
muncul; Panduan langkah pertama aktif (`0/N`); pencetakan tetap bisa dijalankan dan
menghasilkan dokumen kop/TTD **kosong** (bukan nama orang lain).

### E-2 — Data parsial (partial data)
Hanya 1 penerima tanpa NIP terpilih; pejabat hanya `ks` terisi.
**Harapan:** penerima tanpa NIP tetap terpilih & tampil (key fallback utuh); TTD hanya
terisi peran yang ada; Panduan menandai langkah nomor surat aktif, bukan langkah penerima.

---

## Output yang Bisa Didemonstrasikan

1. Buka Perjalanan Dinas → klik tombol baru (eks "Preview Dokumen") → kartu ringkasan
   TANPA kop/TTD di 4 tab + Mamin.
2. Klik cetak → 5 dokumen formal berurutan kop→TTD (Perjalanan Dinas); set lengkap
   Mamin sesuai pemetaan.
3. Daftar penerima memuat PNS/PPPK/Honorer; Honorarium tetap honorer-only.
4. Pill `? Panduan` di 4 menu → popover checklist yang centangnya mengikuti state;
   auto-open sekali; dismiss permanen; tidak ikut tercetak.
5. Semua gate grep & build lulus dengan output asli.

> **Bukan cakupan sprint ini:** perubahan alur Honorarium, modul BKU, backend,
> panduan di halaman lain, refactor file legacy.
