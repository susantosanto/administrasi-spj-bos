# PRD — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> Sumber: Idea Brief dikonfirmasi user 2026-09-30 (sesi /idea-clarifier) + feedback
> uji manual `fix-template-document.md` (root repo).
> Posisi: **belum disetujui jadi pack** — ini PRD; BLUEPRINT/REQUIREMENTS/ACCEPTANCE/
> HANDOFF menyusul setelah Sprint 001+002 ditutup via /acceptance-runner konteks segar
> (keputusan user 2026-09-30).
> Penomoran user story melanjutkan umbrella PRD sprint-001 (US-01…US-18) → mulai US-19.

## 1. Ringkasan

Dua fitur dalam satu sprint (keputusan user: satu PRD/sprint):

- **Fitur A — Rework lapisan preview & cetak:** preview dokumen menjadi kartu
  ringkasan data murni (tanpa kop surat & tanda tangan); dokumen formal lengkap
  kop→TTD hanya dihasilkan tombol "Cetak Semua". Set cetak Perjalanan Dinas = 5
  dokumen; set cetak Mamin = semua dokumen sumber di folder `template/`. Daftar
  penerima/daftar hadir membuka semua pegawai semua status. Tombol "Preview
  Dokumen" di-rename di semua menu.
- **Fitur B — Panduan langkah (MenuGuide):** komponen petunjuk minimalis-premium
  di 4 menu (Honorarium, Perjalanan Dinas, Makan & Minum, Pemeliharaan) — pill +
  popover checklist yang centangnya dihitung dari state form nyata, menjawab
  "sudah isi form, lalu apa selanjutnya?" tanpa pernah menutupi layar.

## 2. Persona & Users

| Persona | Jumlah | Kebutuhan |
|---------|--------|-----------|
| Bendahara sekolah (primary) | 1 | Menyusun, memeriksa, dan mencetak dokumen LPJ; butuh tahu langkah berikutnya di alur multi-tab yang kompleks |
| Kepala Sekolah (secondary) | 1 | Penerima dokumen untuk ditandatangani — dokumen cetak harus formal lengkap kop→TTD |

## 3. User Stories & Acceptance Criteria

### Fitur A — Rework Lapisan Preview & Cetak

**US-19 — Kartu ringkasan Perjalanan Dinas**
> Sebagai bendahara, saya ingin menekan tombol ringkasan di Perjalanan Dinas dan
> melihat kartu ringkasan data (tanpa kop surat & tanda tangan), sehingga saya
> bisa memeriksa kebenaran data tanpa terkecoh tampilan dokumen final.

Acceptance Criteria:
- [ ] Tab SPT, SPPD, Resume, Undangan di mode preview menampilkan kartu ringkasan
      label+nilai dari form (bukan layout surat) — 0 render kop surat
- [ ] Gate grep membuktikan 0 blok kop (`KopSurat`/`KopGugus`) & 0 blok tanda
      tangan (`SignatureFooter`) di jalur preview keempat tab tersebut
- [ ] Data yang tampil = data form terkini (sudah termasuk auto-fill pejabat
      Sprint 001), bukan nilai basi
- [ ] Edge case: form masih kosong → kartu tetap tampil dengan nilai kosong +
      `PeringatanData` (tidak crash)

**US-20 — Kartu ringkasan Mamin (& Pemeliharaan pola sama)**
> Sebagai bendahara, saya ingin preview Makan & Minum berupa kartu ringkasan data
> tanpa kop & tanda tangan, sehingga pengecekan data konsisten di semua menu.

Acceptance Criteria:
- [ ] Preview Mamin = kartu ringkasan; 0 kop, 0 TTD (gate grep)  - [x] Pemeliharaan mengikuti pola yang sama (PUTUSAN 2026-09-30: **pola saja**
        — SummaryCard + panduan via config, tanpa perlakuan khusus)
- [ ] Edge case: tidak ada penerima terpilih → tetap dicegah seperti sekarang
      (toast "pilih minimal 1 penerima")

**US-21 — Rename tombol preview di semua menu**
> Sebagai bendahara, saya ingin nama tombol yang jujur terhadap fungsinya
> (menampilkan ringkasan data, bukan "preview dokumen"), sehingga saya tidak
> menyangka sedang melihat dokumen final.

Acceptance Criteria:
- [ ] Tombol di-rename di SEMUA menu yang memilikinya (Perjalanan Dinas, Mamin,
      Pemeliharaan, Honorarium, dan pemakaian lain bila ada) — 0 sisa label
      "Preview Dokumen" (gate grep)
- [ ] Nama final ditetapkan user saat review pack (usulan default: "Lihat
      Ringkasan")
- [ ] Ikon tombol disesuaikan (bukan ikon mata/visibility yang menyiratkan
      pratinjau dokumen)

**US-22 — Cetak Semua Perjalanan Dinas = 5 dokumen lengkap**
> Sebagai bendahara, saya ingin satu klik "Cetak Semua" menghasilkan 5 dokumen
> Perjalanan Dinas dalam format formal lengkap kop→TTD, sehingga dokumen siap
> ditandatangani tanpa cetak per-tab.

Acceptance Criteria:
- [ ] Hasil cetak = 5 dokumen berurutan: Daftar Penerima + Surat Undangan + SPT +
      SPD + Resume/Notulen
- [ ] Tiap dokumen lengkap kop surat → isi → tanda tangan, mengikuti dokumen
      referensi `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` (struktur
      & layout; identitas dari Data Sekolah)
- [ ] Kertas A4 satuan mm; orientasi per dokumen via `templateConfig.js`
- [ ] Edge case: penerima >1 → SPT/SPD/Undangan per penerima tetap benar nomor
      & isinya (perilaku per-penerima Sprint 002 tidak rusak)

**US-23 — Cetak Semua Mamin = set dokumen lengkap folder template/**
> Sebagai bendahara, saya ingin set cetak Mamin lengkap sesuai dokumen sumber di
> folder `template/`, sehingga LPJ Mamin tidak lagi hanya Notulen + Daftar Hadir.

Acceptance Criteria:
- [ ] Dry run memetakan SEMUA docx Mamin di folder `template/` → 1-per-1 ke
      template (usulan: `Surat Undangan Mamin.docx`, `Surat Pesanan Mamin.docx`,
      notulen, daftar hadir, buku tamu — diverifikasi saat dry run, gap
      dilaporkan sebelum coding)
- [ ] "Cetak Semua" Mamin menghasilkan set lengkap tersebut, formal kop→TTD
- [ ] Kandidat config yang sudah ada (`undangan_mamin`, `pesanan_mamin`,
      notulen, buku_tamu) dihubungkan — tidak diduplikasi
- [ ] Edge case: dokumen sumber yang tidak punya padanan data → dilaporkan di
      pack, tidak diimprovisasi diam-diam

**US-24 — Daftar penerima & daftar hadir semua pegawai semua status**
> Sebagai bendahara, saya ingin memilih dari SEMUA pegawai (PNS/PPPK/Honorer,
      guru + tendik + perpus + penjaga) untuk Perjalanan Dinas & Mamin, sehingga
      dokumen bisa dibuat untuk pegawai non-honorer.

Acceptance Criteria:
- [ ] Sumber penerima Perjalanan Dinas & Mamin = seluruh baris Data Guru & Data
      Tendik semua status + perpus + penjaga
- [ ] Menu Honorarium TIDAK berubah (tetap honorer-only — memang sifatnya)
- [ ] Edge case: pegawai tanpa NIP (honorer) tetap bisa dipilih (key fallback
      yang sudah ada tidak rusak); data lama tersimpan di localStorage tetap aman

**US-25 — Regresi Honorarium**
> Sebagai bendahara, saya ingin menu Honorarium tidak berubah perilakunya,
> sehingga alur yang sudah sesuai keinginan tidak rusak.

Acceptance Criteria:
- [ ] Alur Honorarium (form → tab SK Honorer → cetak) identik sebelum/sesudah
      (regresi 2 kondisi data: kosong & terisi)
- [ ] Satu-satunya perubahan menyentuh Honorarium = label tombol ringkasan
      (US-21) + pemasangan Panduan (US-26); 0 perubahan logika

### Fitur B — Panduan Langkah (MenuGuide)

**US-26 — Pill Panduan + popover di 4 menu**
> Sebagai bendahara, saya ingin tombol kecil "Panduan" di 4 menu utama yang
> membuka daftar langkah, sehingga saya tahu alur lengkap tiap menu tanpa
> membaca manual.

Acceptance Criteria:
- [ ] Pill `? Panduan` + badge progres (mis. `3/5`) tampil di baris judul 4 menu:
      Honorarium, Perjalanan Dinas, Makan & Minum, Pemeliharaan
- [ ] Klik pill → popover panel (~360px, rounded, shadow) berisi checklist 4–6
      langkah khas menu tersebut; klik di luar / tombol tutup → menutup
- [ ] Popover TIDAK PERNAH modal — tidak menghalangi interaksi form; `print:hidden`
- [ ] Blue-only `#004ac6` + slate (0 warna terlarang)

**US-27 — Langkah aktif sadar-state**
> Sebagai bendahara, saya ingin panduan menandai langkah yang SEDANG harus saya
> kerjakan berdasarkan kondisi form, sehingga "sudah isi form lalu apa
> selanjutnya?" terjawab sendiri.

Acceptance Criteria:
- [ ] Tiap langkah punya predikat state: selesai (✓) / aktif (ditandai "SEKARANG")
      / belum (○) — dihitung dari data form & pilihan user yang nyata
- [ ] Contah terukur: penerima terpilih → langkah "Pilih penerima" tercentang
      otomatis dan langkah aktif pindah ke "Isi nomor surat"
- [ ] Edge case: form kosong semua → langkah pertama aktif; badge progres
      `0/N` akurat

**US-28 — Auto-open sekali & "jangan tampilkan lagi"**
> Sebagai bendahara yang sudah paham alur, saya ingin panduan tidak mengganggu
> lagi setelah saya tutup, tapi tetap bisa diakses kapan pun.

Acceptance Criteria:
- [ ] Kunjungan PERTAMA per menu → popover terbuka otomatis (maks 1× per menu);
      kunjungan berikutnya hanya via klik pill
- [ ] Tombol "Selesai — jangan tampilkan lagi" → auto-open dimatikan permanen
      untuk menu itu; pill menyusut jadi ikon `?` pasif (tidak hilang total)
- [ ] Klik ikon `?` pasif → popover tetap bisa dibuka manual kapan pun
- [ ] Disimpan localStorage prefix `spj_`: `spj_guide_dismissed_<menu>`,
      `spj_guide_visited_<menu>`; data lama user lain tidak terdampak

**US-29 — MenuGuide config-driven (reusable)**
> Sebagai pemilik aplikasi, saya ingin menambah panduan di menu lain nanti hanya
> dengan mengedit config, sehingga komponennya reusable.

Acceptance Criteria:
- [ ] Komponen generik `MenuGuide.jsx` + config `guideConfig.js` (langkah per
      menu + fungsi predikat state per menu) — pola mengikuti `templateConfig.js`
- [ ] Menambah panduan menu baru = tambah entri config; 0 perubahan komponen
      (dibuktikan di acceptance: tambah 1 menu dummy via config saja)
- [ ] Konten langkah ditulis Indonesia, ringkas, gaya user-facing "LPJ"
      (bukan "SPJ" — aturan DOMAIN.MD)

**US-30 — Panduan tidak bocor ke cetak & tidak mengganggu**
> Sebagai bendahara, saya ingin memastikan elemen panduan tidak pernah ikut
> tercetak dan tidak menggeser layout dokumen.

Acceptance Criteria:
- [ ] Gate grep: seluruh JSX Panduan berada di bawah `print:hidden`
- [ ] Uji cetak: hasil cetak dokumen identik dengan/sesudah popover terbuka
- [ ] 0 perubahan pada print-area yang ada

## 4. Kontrak Internal (Component Contract)

> Tidak ada backend (keputusan 2026-09-13: localStorage-only) — tabel API pada
> template skill TIDAK berlaku; ini padanannya di level komponen.

| Komponen/Modul | Tipe | Kontrak | Sprint |
|----------------|------|---------|--------|
| `components/guide/MenuGuide.jsx` | BARU | Props: `menuId`, `steps`; render pill+popover; baca/tulis storage guide sendiri | 003 |
| `data/guideConfig.js` | BARU | `{ [menuId]: { title, steps: [{ id, label, isDone(formData, ctx), isActive(formData, ctx) }] } }` | 003 |
| `DokumenFormPreview.jsx` | UBAH | Jalur preview transport & mamin → kartu ringkasan; rename tombol; cetak 5-doc & mamin-full | 003 |
| `honorHelper.js` (atau helper baru) | UBAH | Sumber penerima "semua status" utk transport/mamin; honorer-only tetap utk honor | 003 |
| `DokumenSPJPage.jsx` | UBAH | Pasang `<MenuGuide>` di 4 menu; label tombol | 003 |
| Blok cetak existing (`KopSurat`, `SignatureFooter`, `SuratTugas`, `SPDForm`, `SuratUndangan`, `Notulen`/resume) | TIDAK DIUBAH | Tetap dipakai hanya di jalur cetak (Cetak Semua) | — |

## 5. Data Requirements (localStorage, prefix `spj_`)

| Key | Isi | Dibuat oleh |
|-----|-----|-------------|
| `spj_guide_dismissed_<menu>` | `true` bila user menolak auto-open per menu | MenuGuide |
| `spj_guide_visited_<menu>` | `true` setelah kunjungan pertama per menu | MenuGuide |
| `spj_data_sekolah` (existing) | Sumber identitas & pejabat — TIDAK berubah skema | Sprint 001 |
| `spj_dokumen_lpj` (existing) | State form dokumen — struktur mengikuti kebutuhan kartu ringkasan; tanpa migrasi | existing |

## 6. Non-Functional Requirements

- **Visual:** blue-only `#004ac6` + slate; dilarang emerald/amber/rose/violet/cyan
  (pengecualian indikator status sementara layar, tidak pernah tercetak)
- **Cetak:** semua dokumen A4 satuan `mm`; orientasi via `templateConfig.js`;
  elemen Panduan wajib `print:hidden`
- **Anti-hardcode:** 15 pola gate T-02 (Sprint 001) tetap 0 hit — identitas &
  pejabat hanya dari Data Sekolah
- **Kinerja:** popover & kartu ringkasan render sinkron < 100ms pada form ≤ 50
  penerima; tanpa dependency baru (blueprint wajib pin versi eksak bila ada)
- **Aksesibilitas:** popover menutup via Escape & klik-luar; pill fokus-kabel
  keyboard; `role="dialog"` non-modal / `aria-expanded` pada pill
- **Data:** localStorage-only; key baru bergaya `spj_`; tanpa migrasi data lama

## 7. Success Metrics

| Kriteria Brief | Metrik | Target |
|----------------|--------|--------|
| Preview bebas kop/TTD | Hit grep jalur preview (kop+TTD) | 0 |
| Set cetak Perjalanan Dinas | Jumlah dokumen per "Cetak Semua" | 5/5 |
| Set cetak Mamin | Pemetaan docx `template/` → cetak | 1-per-1, 0 gap tersisa |
| Penerima semua status | Status yang muncul di daftar pilihan | PNS+PPPK+Honorer semua |
| Rename tombol | Sisa label "Preview Dokumen" | 0 |
| Panduan hidup di 4 menu | Menu dengan pill + popover berfungsi | 4/4 |
| Auto-open sesuai aturan | Auto-open berulang setelah dismiss | 0 |
| Reusability | Tambah panduan via config saja | 0 sentuh komponen |
| Regresi | Build exit 0 · T-02 0 hit · alur Honorarium | Semua lulus |

## 8. Out of Scope (eksklusif — DILARANG diimplementasi)

- Perubahan alur/form Menu Honorarium (hanya label tombol + pemasangan Panduan)
- Modul BKU, backend/sinkronisasi, migrasi data lama
- Panduan di halaman lain (dashboard, BKU, Data Sekolah/Guru/Tendik, Dokumentasi AI)
  — nanti cukup lewat `guideConfig.js`
- Tour melayang bertahap ala onboarding SaaS
- Perubahan konsep tab form (form isian tetap seperti sekarang)
- Foto dokumentasi (sudah ditangani modul Dokumentasi AI)
- Refactor kode di luar cakupan ini (aturan AGENTS.MD)

> Catatan: bila sebuah user story tampak menyiratkan item di atas, item itu
> dikeluarkan atau ditandai Phase 2 — jangan diimplement.

## 9. Traceability

| Sumber | Cakupan |
|--------|---------|
| `fix-template-document.md` | US-19, US-20, US-22, US-23, US-24 + pertanyaan honorer |
| Jawaban user 2026-09-30 (ask_user ronde 1) | kartu ringkasan · rename · mamin semua template · semua pegawai · cetak 5 dokumen · acceptance dulu |
| Jawaban user 2026-09-30 (ask_user ronde 2) | satu PRD · desain pill+popover · 4 menu · dismiss permanen · reusable |
| `docs/ARCHITECTURE.MD` (2 wajah) | diperluas: layar = data (tab & ringkasan), kertas = formal |

## 10. Keputusan Terbuka untuk Architect (bukan blocker PRD)

1. ~~Nama final tombol ringkasan~~ — PUTUSAN 2026-09-30: "Lihat Ringkasan"
2. Pemetaan eksak docx Mamin di folder `template/` → template (dry run)
3. Bentuk kartu ringkasan (skema label+nilai per dokumen) & apakah Pemeliharaan
   ikut pola penuh di sprint ini
4. Predikat state per langkah per menu (isi `guideConfig.js`)
5. Pembagian fase & file (5 file tumpang tindih Sprint 001/002 — batas
   "001 = sumber nilai · 002 = struktur" harus tetap terhormat)
