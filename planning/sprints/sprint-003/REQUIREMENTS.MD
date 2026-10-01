# REQUIREMENTS — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4). Isi = **APA & MENGAPA** saja.
> Detail teknis ("bagaimana") → `BLUEPRINT.MD`. Kriteria uji → `ACCEPTANCE.MD`.
> Prompt builder → `HANDOFF-PROMPT.MD`.
>
> Sumber requirement lengkap: `planning/sprints/sprint-003/PRD.md` (US-19…US-30) —
> disusun dari feedback uji manual `fix-template-document.md` (root repo) + 2 ronde
> keputusan user 2026-09-30.
>
> ⚠️ **Prasyarat wajib:** Sprint 001 + Sprint 002 **APPROVED 2026-09-30**
> (`VERIFICATION-REPORT.MD` masing-masing). Kontrak data-driven & print-area
> sudah tersedia. Risiko UI runtime UNTESTED diterima eksplisit user — feedback
> `fix-template-document.md` adalah bukti pemakaian nyata operator.

---

## Tujuan Sprint

Menjadikan lapisan **preview dokumen LPJ = kartu ringkasan data murni** (tanpa kop
surat & tanda tangan), melengkapi **set cetak** Perjalanan Dinas (5 dokumen) dan
Makan & Minum (semua dokumen sumber), membuka **daftar penerima ke semua pegawai**,
dan menambah komponen **Panduan langkah** (checklist ber-progres) di 4 menu —
sehingga operator selalu tahu "sudah isi form, lalu apa selanjutnya?" tanpa layar
utama pernah tertutup.

## Apa yang Dibangun

**Fitur A — Rework lapisan preview & cetak**

1. **Kartu ringkasan data** menggantikan render dokumen formal di layar preview:
   Perjalanan Dinas (tab SPT, SPD, Resume, Undangan) dan Makan & Minum.
   0 kop surat, 0 blok tanda tangan di jalur preview.
2. **Rename tombol "Preview Dokumen" di SEMUA menu** yang memilikinya — nama final
   final: **"Lihat Ringkasan"** (PUTUSAN user 2026-09-30; ikon `visibility` →
   `list_alt`). Label `"Preview Dokumen Foto"` BKU dikecualikan — di luar cakupan.
3. **"Cetak Semua" Perjalanan Dinas = 5 dokumen** formal lengkap kop→TTD:
   Daftar Penerima + Surat Undangan + SPT + SPD + Resume/Notulen (urutan dokumen
   referensi `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`).
4. **"Cetak Semua" Makan & Minum = set lengkap** dokumen sumber folder `template/`:
   Surat Undangan Mamin + Surat Pesanan Mamin + Notulen + Daftar Hadir + Buku Tamu
   (dipetakan 1-per-1 saat dry run; gap dilaporkan, tidak diimprovisasi).
5. **Daftar penerima & daftar hadir = SEMUA pegawai semua status** (PNS/PPPK/Honorer;
   guru + tendik + perpus + penjaga) untuk Perjalanan Dinas & Mamin.
6. **Menu Honorarium tidak berubah perilaku** (tetap honorer-only — memang sifatnya);
   hanya dapat label tombol baru + pemasangan Panduan.

**Fitur B — Panduan langkah (MenuGuide)**

7. **Pill `? Panduan` + badge progres** (mis. `3/5`) di baris judul 4 menu:
   Honorarium, Perjalanan Dinas, Makan & Minum, Pemeliharaan.
8. **Popover checklist ber-progres** (~360px, non-blocking, BUKAN modal): 4–6 langkah
   khas menu, tiap langkah punya predikat state (✓ selesai / aktif "SEKARANG" / ○
   belum) dihitung dari data form & pilihan user yang NYATA.
9. **Auto-open hanya kunjungan pertama** per menu; tombol "Selesai — jangan tampilkan
   lagi" mematikan auto-open permanen; pill menyusut jadi ikon `?` pasif yang tetap
   bisa dibuka manual. Disimpan localStorage prefix `spj_`.
10. **Config-driven & reusable**: komponen generik + config langkah per menu — menambah
    panduan menu baru nanti = edit config saja (kebutuhan eksplisit user).

## Mengapa

- **Preview menyesatkan.** Operator menekan tombol "Preview" dan melihat dokumen
  formal kop+TTD, padahal baru tahap pengecekan data — dia tidak bisa membedakan
  "data sudah benar?" dari "hasil cetak final". (Feedback uji manual, 2026-09-30.)
- **Set cetak tidak lengkap.** Mamin baru punya Notulen + Daftar Hadir; padahal
  dokumen sumber di folder `template/` memuat lebih banyak. LPJ yang dicetak tidak
  memenuhi kelengkapan bukti fisik (lihat `spjRequirements.js` MAMIN).
- **Daftar penerima terlalu sempit.** Hanya guru/tendik honorer yang muncul padahal
  kebutuhan riil mencakup pegawai PNS/PPPK (warisan menu honor yang menyebar ke
  transport & mamin — `getRecipientsFor()` di `DokumenFormPreview.jsx`).
- **Alur kompleks tanpa petunjuk.** Alur pengisian multi-tab terasa rumit bagi
  operator; user meminta petunjuk "sangat minimalis, premium, sangat berguna, tapi
  tidak membuat risih" — bukan modal dan bukan tour.

## Pengguna

| Persona | Peran dalam sprint ini |
|---|---|
| **Bendahara Sekolah** (primer) | Memeriksa data via ringkasan, mencetak set dokumen lengkap, dibimbing langkah |
| **Operator Sekolah** (primer) | Memilih penerima dari seluruh pegawai |
| **Kepala Sekolah / Ketua Gugus** (sekunder) | Penandatangan — dokumen cetak tetap formal kop→TTD |

## Data Sumber

| Sumber | Isi yang dipakai |
|---|---|
| `template/*.docx` (Mamin: Undangan, Pesanan, Notulen, Daftar Hadir, Buku Tamu) | Format baku set cetak Mamin |
| `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` | Urutan & format 5 dokumen Perjalanan Dinas (warisan Sprint 002) |
| Data Guru & Data Tendik (semua status) + perpus + penjaga | Daftar penerima/daftar hadir |
| Data Sekolah + pejabat (data-driven Sprint 001) | Kop & TTD dokumen cetak |
| localStorage prefix `spj_` | Seluruh data — tanpa backend |

## Cakupan User Story

| US | Judul | Fase (BLUEPRINT) |
|---|---|---|
| US-19 | Kartu ringkasan Perjalanan Dinas (4 tab) | Fase 2 |
| US-20 | Kartu ringkasan Mamin (+ Pemeliharaan pola sama) | Fase 2 |
| US-21 | Rename tombol preview semua menu | Fase 1 |
| US-22 | Cetak Semua Perjalanan Dinas = 5 dokumen | Fase 3 |
| US-23 | Cetak Semua Mamin = set lengkap folder template/ | Fase 3 |
| US-24 | Penerima semua status (transport & mamin) | Fase 1 |
| US-25 | Regresi Honorarium (alur tidak berubah) | Fase 5 |
| US-26 | Pill Panduan + popover di 4 menu | Fase 4 |
| US-27 | Langkah aktif sadar-state | Fase 4 |
| US-28 | Auto-open 1× & "jangan tampilkan lagi" | Fase 4 |
| US-29 | MenuGuide config-driven reusable | Fase 4 |
| US-30 | Panduan tidak bocor ke cetak | Fase 4 |

## Batasan

- **Tanpa backend.** localStorage prefix `spj_` — prefix tidak boleh diubah.
- **Stack terkunci ADR**: React 18 + Vite + Tailwind CSS — tidak boleh dipilih ulang.
- **Tanpa dependency baru** — hanya yang terdaftar di `BLUEPRINT.MD` (versi ter-pin).
- **Warna UI blue-only** `#004ac6` + slate (pengecualian: indikator status di layar,
  tidak pernah ikut cetak). Panduan selalu `print:hidden`.
- **Kertas A4 wajib**, satuan `mm`, orientasi dari `templateConfig.js`.
- **Dilarang refactor di luar cakupan** — file legacy besar tidak dipecah; kode baru
  diekstrak ke file komponen tersendiri (pola Sprint 002).
- **Dilarang menyentuh alur/logika Menu Honorarium** di luar label tombol + Panduan.
- **Kalimat legal & struktur dokumen cetak tidak diubah** — Sprint 003 hanya
  mengubah LOKASI render (layar vs cetak), bukan isi dokumen formal.
- Bukti wajib berupa output build/grep asli atau screenshot — **bukan klaim**.
