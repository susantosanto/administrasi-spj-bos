# HANDOFF PROMPT — Sprint 002: Rework Modul Perjalanan Dinas

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt ini yang diserahkan ke **Builder**.
> Salin isi bagian "Prompt untuk Builder" ke sesi Builder (`/ai-coding-coach`, MODE DRY RUN).

---

## Prompt untuk Builder

```
Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.6).
Proyek: spj-app — aplikasi LPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage, tanpa backend).

Tugas Anda untuk Sprint 002: Rework Modul Perjalanan Dinas (Tab · Form · Print).

PRASYARAT — periksa DULU sebelum apa pun:
Sprint 001 (Fondasi Data Sekolah & Pejabat) HARUS sudah selesai. Verifikasi cepat:
  grep -n "getSignatureRoles" spj-frontend/src/utils/signatureRoles.js
  ls spj-frontend/src/utils/pejabatRoles.js spj-frontend/src/components/templates/blocks/PeringatanData.jsx
  grep -rnE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|SD NEGERI LEBAKLEUNGSIR" spj-frontend/src
Grep ketiga WAJIB menghasilkan 0 baris — Sprint 001 (revisi 2026-09-17) sudah membersihkan
literal nama/NIP/identitas sekolah di SPDForm, SuratTugas, SuratUndangan, SKHonorer,
templateConfig, dan DokumenFormPreview. Bila masih ada hasil, Sprint 001 BELUM tuntas.
Bila salah satu tidak ada → BERHENTI, laporkan: Sprint 001 belum selesai, sprint ini belum boleh jalan.

LANGKAH WAJIB — baca berurutan:
1. planning/sprints/sprint-002/REQUIREMENTS.MD   — apa & mengapa
2. planning/sprints/sprint-002/BLUEPRINT.MD      — bagaimana (file, task, dependensi ter-pin)
3. planning/sprints/sprint-002/ACCEPTANCE.MD     — kriteria selesai + test case
4. planning/sprints/sprint-001/BLUEPRINT.MD      — kontrak dari Sprint 001 (jangan diubah)
5. template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx — DOKUMEN SUMBER FORMAT (wajib dibaca)
6. AGENTS.MD · STATE.MD · CONSTITUTION.md · DECISIONS.MD

LALU:
7.  Lakukan DRY RUN — simulasi tanpa menulis kode
8.  Laporkan rencana: file yang akan disentuh, task yang dikerjakan, dependensi, risiko
9.  TUNGGU persetujuan sebelum menulis kode

JANGAN:
- Mulai coding tanpa persetujuan
- Mengubah requirements (bila ada pertanyaan → tulis di QUESTIONS.MD, jangan berasumsi)
- Menyentuh file di luar daftar BLUEPRINT.MD ("File yang Akan Diubah")
- Menyentuh utils/sekolahData.js · utils/signatureRoles.js · utils/pejabatRoles.js ·
  blocks/KopSurat.jsx · blocks/KopGugus.jsx · blocks/SignatureFooter.jsx
  (wilayah Sprint 001 — SUDAH SELESAI)
- Memakai library yang tidak tercantum di BLUEPRINT.MD (versi ter-pin, jangan menaikkan)
- Memparafrase kalimat legal SPD — kalimatnya harus PERSIS dokumen sumber
- Memecah file legacy (DokumenFormPreview.jsx 1847 baris / templateConfig.js 993 baris)
- Memutuskan ulang tech stack (sudah terkunci ADR)
- Mengklaim hasil tanpa bukti — sertakan output build asli atau screenshot

SETUJU:
- Setelah dry run disetujui → kerjakan task sesuai urutan BLUEPRINT.MD (Fase 1 → 5)
- Commit kecil & atomic, Conventional Commits, pesan bahasa Indonesia
- Jalankan `npm run build` di setiap gate fase
- Laporkan hasil dengan bukti untuk setiap gate
- Perbarui STATE.MD + pack sprint setelah selesai
- Tutup loop lewat /state-keeper
```

---

## Ringkasan Handoff

| Item | Nilai |
|---|---|
| Sprint | 002 |
| Prasyarat | **Sprint 001 selesai** |
| User story | US-01 … US-10, US-12 (+ US-11 sebagian, + regresi US-16) |
| Jumlah task | **27 task** (Fase 1–5), tiap task 2–5 menit |
| File baru | **0** |
| File diubah | 6 |
| Dependency baru | **0** (semua ter-pin, lihat BLUEPRINT.MD) |
| Gate build | 1× + gate akhir |
| Jalur kritis | FASE 1 → 2 → 3 → 4 → 5 |
| Perkiraan urutan commit | 1) konsolidasi tab 2) form 3) dua wajah 4) print-area 5) reset data 6) gate akhir + STATE.MD |
| Penerus | tidak ada — menutup rangkaian "Rework Modul Perjalanan Dinas" |

## Setelah Sprint Selesai

1. `/acceptance-runner` — verifikasi independen di **konteks segar** (AGENTS.MD: wajib)
2. `/security-dependency-auditor` — `npm audit` sebelum rilis fitur besar (CONSTITUTION.md)
3. `/state-keeper` — tutup loop, perbarui STATE.MD / DECISIONS.MD / RISKS.MD / QUESTIONS.MD
4. Kembali ke `/sprint-planner` untuk merencanakan sprint berikutnya

---

## Peringatan untuk Builder

⚠️ **Baca dokumen sumber dulu.** `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`
adalah **satu-satunya** acuan urutan elemen & kalimat. Jangan mengarang struktur dari
ingatan atau dari kode lama — kode lama justru yang sedang diperbaiki.

⚠️ **Task 4.2–4.4 menyentuh dokumen legal.** Kalimatnya harus **persis** dokumen sumber,
bukan parafrase. Salah satu kata bisa membuat dokumen tidak sah sebagai bukti.

⚠️ **Tujuh blok sudah data-driven sejak Sprint 001** (revisi 2026-09-17):
`KopSurat.jsx`, `SignatureFooter.jsx`, `KopGugus.jsx`, `SPDForm.jsx`, `SuratTugas.jsx`,
`SuratUndangan.jsx`, `SKHonorer.jsx` — **tidak ada** fallback `|| 'NAMA ORANG'` yang tersisa.
Jangan menambah fallback atau hardcode di sana saat merombak print-area. Kalau print-area
tampak kosong, penyebabnya adalah Data Sekolah yang memang belum diisi (perilaku yang
diminta), bukan bug. Mengembalikan satu literal saja akan menjebol gate T-02 Sprint 001.

⚠️ **Tab Perjalanan Dinas saat ini merender blok cetak dengan `mode="print"`.**
Itulah sebabnya `<input>` bocor ke tab. Setelah Fase 3, tab harus menampilkan **data saja**
dan print-area yang menjadi dokumen formal.

⚠️ **Sprint 001 mengubah `DokumenFormPreview.jsx` secara SUBSTANTIF, bukan aditif**
(revisi 2026-09-17). Tiga hal yang wajib dipertahankan saat merombak struktur tab:
1. titik pemasangan `<PeringatanData />` di area tab Perjalanan Dinas;
2. **auto-fill pejabat** dari `getSignatureRoles()` untuk `namaPenandatangan` /
   `nipPenandatangan` / `namaMengetahui` / `nipMengetahui` / `namaKetuaGugus` /
   `nipKetuaGugus` — inilah yang membuat TTD SPT/SPD/Undangan tidak kosong setelah
   `templateConfig.defaults` dikosongkan;
3. `getSchoolData().namaSekolah` yang menggantikan 5 literal `SD NEGERI LEBAKLEUNGSIR`
   (eks baris 498, 577, 604, 1496, 1641).

Menghapus salah satunya = **regresi** yang menjebol gate T-02 / T-12 Sprint 001.
