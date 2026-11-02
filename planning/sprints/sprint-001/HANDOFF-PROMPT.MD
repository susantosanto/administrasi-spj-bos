# HANDOFF PROMPT — Sprint 001: Fondasi Data Sekolah & Pejabat

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt ini yang diserahkan ke **Builder**.
> Salin isi bagian "Prompt untuk Builder" ke sesi Builder (`/ai-coding-coach`, MODE DRY RUN).
>
> **REVISI 2026-09-17 (v2)** — scope diperluas (keputusan user, lihat `DECISIONS.MD`):
> 5 fase → **6 fase**, 31 → 48 task, 9 → 17 file diubah, gate build 3× → **4×**.
>
> **REVISI 2026-09-17 (v3)** — hasil **dry run Fase 1 + Fase 4** terhadap kode nyata
> (temuan D-1 … D-6, keputusan user 2026-09-17): 48 → **53 task**, 17 → **19 file diubah**,
> 13 → **14 test case**, pola gate T-02 11 → **15**, baseline T-02 57 → **73 baris / 15 file**.
> Penyebab gate v2 **tidak bisa dicapai**: (a) cakupan diverifikasi **per file**, bukan
> **per baris** — file-nya ada di daftar ubah tetapi barisnya tidak tertaut task mana pun,
> dan (b) pola v2 **case-sensitive**, sehingga satu **identitas sekolah kedua**
> (`SD NEGERI PASIRHALANG`) lolos sepenuhnya. Rincian → `ACCEPTANCE.MD` T-02 "Riwayat gate ini".

---

## Prompt untuk Builder

```
Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.6).
Proyek: spj-app — aplikasi LPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage, tanpa backend).

Tugas Anda untuk Sprint 001: Fondasi Data Sekolah & Pejabat.
Ini sprint FONDASI — tidak ada dokumen baru yang dibangun. Yang dibangun: satu sumber data
identitas sekolah & pejabat, kop berlogo, peringatan saat data belum diisi, dan
Pembersihan TOTAL nilai hardcoded (nama orang, NIP, identitas sekolah) dari src/.

LANGKAH WAJIB SEBELUM APA PUN — baca berurutan:
1. planning/sprints/sprint-001/REQUIREMENTS.MD   — apa & mengapa
2. planning/sprints/sprint-001/BLUEPRINT.MD      — bagaimana (file, task, dependensi ter-pin)
3. planning/sprints/sprint-001/ACCEPTANCE.MD     — kriteria selesai + 14 test case
4. AGENTS.MD                                     — aturan umum proyek
5. STATE.MD                                      — status terkini
6. CONSTITUTION.md                               — aturan wajib + keamanan
7. DECISIONS.MD                                  — keputusan yang SUDAH dibuat (jangan putuskan ulang)
8. planning/sprints/sprint-001/DRYRUN-T1.md      — hasil dry run T1. ⚠️ SEBAGIAN BASI:
   ditulis sebelum revisi v3, jadi nomor task & daftar file di dalamnya bisa beda.
   Bila bertentangan dengan BLUEPRINT.MD → BLUEPRINT.MD yang menang.

LALU:
9.  Lakukan DRY RUN — simulasi tanpa menulis kode
10. Laporkan rencana: file yang akan disentuh, task yang dikerjakan, dependensi, risiko
11. TUNGGU persetujuan sebelum menulis kode

JANGAN:
- Mulai coding tanpa persetujuan
- Mengubah requirements (bila ada pertanyaan → tulis di QUESTIONS.MD, jangan berasumsi)
- Memakai library yang tidak tercantum di BLUEPRINT.MD (versi ter-pin, jangan menaikkan)
- Menaikkan versi dependency saat mengerjakan task 1.11 — yang diubah HANYA bentuk
  deklarasi (^ dihapus), nilainya tetap = lockfile
- Menyentuh file di luar daftar BLUEPRINT.MD ("File yang Akan Diubah", 19 file)
- Mengubah utils/sekolahParser.js (LABEL_MAP / handleFileUpload) — DI LUAR CAKUPAN
- Mengubah data/mockData.js — 6 hit `Mandalamukti` di sana data demo fiktif, dan
  `seedMockData()` terverifikasi TIDAK menulis `spj_data_sekolah`
- Mengubah 11× `sourceFile: '/templates/…SDN lebakleungsir.xlsx'` di templateConfig.js —
  itu path ASET NYATA. Jangan di-rename. (Sudah terverifikasi tidak terjaring gate T-02.)
- Mengubah blocks/NomorSuratPopup.jsx ('SDN-PSR' = kode penomoran, bukan identitas sekolah)
- Menyamakan literal Kelas A dan Kelas B. **Kelas A** = fallback cetak
  (`data.X || 'NAMA'`) → hapus `||`-nya. **Kelas B** = placeholder (argumen `ph` pada
  helper / prop `placeholder`) → ganti **label generik** (`'Nama Pengguna Anggaran'`),
  BUKAN `getSchoolData().namaSekolah`. Mengisi placeholder dengan nilai dinamis bikin
  field kosong mencetak `[ Kepala SD Negeri X ]` — nama asli muncul dalam kurung siku.
  Kolom "Kelas" di tabel FASE 4 BLUEPRINT.MD menandai tiap task.
- Menjalankan grep T-02 TANPA flag `-i`. `SD NEGERI PASIRHALANG` dan
  `SD Negeri Lebakleungsir` (mixed-case) hanya tertangkap dengan `-i` — persis cara
  identitas sekolah kedua bersembunyi dari pack v2.
- Menghapus `DINAS PENDIDIKAN` di SKHonorer.jsx:98 — nama instansi tetap, identik dengan
  KopSurat.jsx:16 dan templateSuratHelper.js:486, tidak terjaring T-02
- Menambah fallback hardcoded "supaya tidak kosong" — kop kosong adalah perilaku yang DIMINTA
- Mengosongkan templateConfig.defaults LEBIH DULU sebelum auto-fill pejabat (task 4.1)
  terpasang — urutan terbalik mencetak dokumen bertanda tangan kosong
- Membersihkan literal tempat/tanggal (Cikalongwetan, 8 Mei 2026, SD Negeri Cipada) —
  itu konten dokumen, DI LUAR CAKUPAN. (Pengecualian: `SKHonorer.jsx:96/100` ikut terhapus
  sebagai efek samping task 4.14 karena satu baris dengan `Pasirhalang` — itu memang diminta.)
- Memecah file legacy (DokumenFormPreview.jsx 1847 baris / templateConfig.js 993 baris)
- Mengubah struktur tab, print-area, atau <input> dokumen Perjalanan Dinas — itu Sprint 002
- Membuat KopGugus.jsx membaca localStorage sendiri — blok itu PROP-DRIVEN
- Memutuskan ulang tech stack (sudah terkunci ADR)
- Mengklaim hasil tanpa bukti — sertakan output build asli atau screenshot

SETUJU:
- Setelah dry run disetujui → kerjakan task sesuai urutan BLUEPRINT.MD (Fase 1 → 6)
- Commit kecil & atomic, Conventional Commits, pesan bahasa Indonesia
- HORMATI 2 aturan commit wajib: task 1.3–1.10 satu commit, task 4.1–4.19 satu commit
- Jalankan `npm run build` di setiap gate fase (Fase 1, 2, 4, dan gate akhir)
- Laporkan hasil dengan bukti untuk setiap gate
- Perbarui STATE.MD + pack sprint setelah selesai
- Tutup loop lewat /state-keeper
```

---

## Ringkasan Handoff

| Item | Nilai |
|---|---|
| Sprint | 001 (fondasi) |
| User story | US-13 … US-18 (+ US-11 sebagian) |
| Jumlah fase | **6** |
| Jumlah task | **53** (12 · 8 · 6 · 20 · 4 · 3), tiap task 2–6 menit |
| File baru | 2 (`utils/pejabatRoles.js`, `blocks/PeringatanData.jsx`) |
| File diubah | **19** |
| Dependency baru | **0** (semua ter-pin, lihat BLUEPRINT.MD) |
| Perubahan `package.json` | pin 14 versi jadi eksak — **bukan** menaikkan versi |
| Gate build | **4×** (Fase 1, 2, 4, dan gate akhir Fase 6) |
| Test case | **14** (T-01 … T-14) + 2 edge case |
| Gate utama T-02 | **15 pola**, `grep -rniE` (**`-i` wajib**) — baseline **73 baris / 15 file** → wajib **0** |
| Jalur kritis | FASE 1 → 2 → 3 → 4 → 5 → 6 |
| Perkiraan urutan commit | 1) fondasi data + pin package.json (Fase 1, **task 1.3–1.10 wajib satu commit**) 2) halaman Data Sekolah 3) kop sekolah & gugus 4) **auto-fill + nol hardcode** (Fase 4, **task 4.1–4.19 wajib satu commit**) 5) peringatan 6) gate akhir + STATE.MD |
| Penerus | Sprint 002 — Rework Modul Perjalanan Dinas (`planning/sprints/sprint-002/`) |

## Setelah Sprint Selesai

1. `/acceptance-runner` — verifikasi independen di **konteks segar** (AGENTS.MD: wajib)
2. `/state-keeper` — tutup loop, perbarui STATE.MD / DECISIONS.MD / RISKS.MD / QUESTIONS.MD
3. Lanjut ke **Sprint 002** (`planning/sprints/sprint-002/HANDOFF-PROMPT.MD`) —
   jangan mulai sebelum Sprint 001 selesai (kontrak fungsi belum ada)

---

## Peringatan untuk Builder

⚠️ **Task 1.3–1.10 wajib satu commit.** Menghapus konstanta basi
(`SEKOLAH_DEFAULT` / `KEPALA_SEKOLAH` / `BENDAHARA` / `export default` / `SIGNATURE_ROLES`)
tanpa memigrasi `blocks/KopSurat.jsx` dan `blocks/SignatureFooter.jsx` dalam commit yang sama
akan **mematahkan build**.

⚠️ **Task 4.1–4.13 wajib satu commit, dan 4.1 dikerjakan PERTAMA.** Ada **dua lapisan**
nilai default: `templateConfig.defaults` (lapisan otoritatif, di-spread
`DokumenFormPreview.jsx:1550,1591,1617,1632,1674`) dan literal `||` di blok cetak (lapisan sisa).
Mengosongkan `defaults` sebelum auto-fill `getSignatureRoles()` terpasang membuat **TTD
SPT/SPD/Undangan kosong** — regresi nyata yang terkirim ke user. T-12 menjaga ini.

⚠️ **`blocks/KopSurat.jsx` & `blocks/SignatureFooter.jsx` adalah blok SHARED** lintas
template. Perubahannya berdampak ke **semua** template — regresi T-11 wajib, bukan opsional.

⚠️ **Kop akan benar-benar kosong** saat Data Sekolah kosong — ini perilaku yang **diminta**
user (keputusan 2026-09-14), bukan bug. Jangan "memperbaiki"-nya dengan menambah fallback.

⚠️ **Jangan mengubah `utils/sekolahParser.js`.** Email dibaca dari `allFields` berdasarkan
label — justru supaya data yang sudah ter-upload langsung terbaca tanpa upload ulang.

⚠️ **Peringatan tidak boleh ikut cetak.** Dipasang hanya pada mode tampilan layar
(`TemplateEngine` mode `edit` + area tab Perjalanan Dinas), bukan di blok cetak.

⚠️ **Gate T-02 bersifat mutlak.** Grep harus menghasilkan **0 baris** — termasuk komentar
referensi (`SignatureFooter.jsx:9`, `SuratTugas.jsx:15`, `SuratUndangan.jsx:12`,
`dataContextBuilder.js:23`) dan placeholder form (`DokumenFormPreview.jsx:493,511,512,718,719`,
`InfoKeuangan.jsx:11`). Pack versi sebelumnya mengecualikan komentar; **revisi 2026-09-17
mencabut pengecualian itu.** Baseline terukur 2026-09-17: **57 baris di 11 file** —
rincian per file ada di `ACCEPTANCE.MD` T-02.

⚠️ **5 file tumpang tindih dengan Sprint 002** (`SPDForm`, `SuratTugas`, `SuratUndangan`,
`templateConfig.js`, `DokumenFormPreview.jsx`). Batas tegas: sprint ini mengganti **sumber
nilai** saja; **struktur & layout** milik Sprint 002. Jangan "sekalian" merapikan layout.
