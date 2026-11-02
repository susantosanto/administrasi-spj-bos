# VERIFICATION-REPORT — Sprint 004: BKU → LPJ Smart Bridge

> /acceptance-runner — konteks segar, 2026-10-01. HEAD `16b9e28`, perubahan sprint
> **belum di-commit** (git status: 6 file kode M + 1 file baru `bkuKategori.js`).
> Verifier BUKAN session builder. Semua perintah dijalankan fresh di sesi ini.
> Materi: Bab 12 (Writer/Reviewer), Bab 17 #4 (TRUST-THEN-VERIFY GAP) — Iron Law:
> "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE".

## Ringkasan

- **Statik + logika: 1 FAIL ditemukan** (T-05 saran nyaris-sama) + 1 deviasi ringan
  dari deskripsi kriteria (E-1 koreksi).
- **Runtime UI: seluruh item browser = UNTESTED** — pencil desktop app tidak
  terhubung di sesi ini (3 retry gagal). Persis preseden sprint 001/002/003.
- **Verdict: REWORK** — 1 FAIL (gap T-05, lihat tabel).

## Bukti Gate (fresh, sesi ini)

| # | Kriteria | Perintah | Hasil | Bukti |
|---|----------|----------|-------|-------|
| T-01 | Build exit 0 | `cd spj-frontend && npm run build` | **PASS** | `✓ built in 7.08s`, **183 modules**, `BUILD_EXIT=0`, Node v24.19.0. (Builder klaim 182 modules — +1 = artefak/uji lingkungan, bukan regresi.) |
| T-02 | 4 prefix + label jujur | grep verbatim ACCEPTANCE | **PASS (statik)** | 4 prefix di `bkuKategori.js:10-17`; `Belum dipetakan` di `BKUPage.jsx:661` + `bkuKategori.js:8,27`. |
| T-03 | Deep-link route | grep `dokumen-lpj\|dokumen-kelengkapan` sidebar | **PASS (statik)** | `BKUSidebar.jsx:124-126`; payload `bku:{uraian, nominal, tanggal, noBukti, kegiatan, kodeRekening, grupCount}` di `:128`. Esc close di `handleKeyDown`. ≤1 detik + klik = **UNTESTED** (browser). |
| T-04 | Prefill ≥4 field + tak timpa + undo | grep `prefillDariBKU` + baca jalur | **PASS (statik+logika)** | `prefillDariBKU` di 2 file (util `:177`, page `:13/:165`); `setFormData(tambahan)` aman (formData mulai `{}` di `:133`); snapshot undo `:201-205`; badge "dari BKU" `:616-617`; kunci pejabat per tanggal `:171-186`. Screenshot sebelum/sesudah = UNTESTED. |
| T-05 | Nyaris-sama → saran | node uji logika mandiri | **FAIL** | `beda 1 huruf kegiatan ('5.2.1.a' vs '5.2.1.b') → saran` — **actual: 0 saran**. Implementasi nyaris-sama hanya cek **inklusi prefix** (`a.includes(b)`), bukan "beda 1 huruf". Bukti: `TOTAL: 29 PASS / 2 FAIL` (C1-1b, C1-1c). |
| T-06 | Pejabat per tanggal | grep + node uji logika | **PASS (statik+logika)** | `pejabatPada\|spj_pejabat_riwayat` = 8 hit (util + 2 page); uji logika: Mei→KS LAMA, Agustus→KS BARU, sebelum-periode→tertua+warning, tanpa-riwayat→jujur. 2 screenshot = UNTESTED. |
| T-07 | Kelompok ATK + flag + gabung | grep + node uji logika | **PASS (statik+logika)** | `kelompokATK\|spj_atk_flag` ≥2 di util+BKUPage; uji logika: se-nomor→1 grup 2 baris total benar; nomor kosong→kelompok sendiri; flag valid tersimpan, invalid ditolak. Panel ATK + checkbox gabung ada (`BKUPage.jsx:276-293`). Screenshot = UNTESTED. |
| T-08 | 15 pola 0 + diff warisan kosong | grep kanonik 15 pola (disalin ACCEPTANCE sprint-001) + `git diff HEAD --stat -- <warisan>` | **PASS** | `T08_GREP_EXIT=1` (**0 hit**), aset `sourceFile` = 0; diff warisan (blocks/, templateConfig.js, guide/, guideConfig.js, SummaryCard.jsx) = **kosong**; warna terlarang di baris `+` 6 file = 0. |
| E-1 | Kode kosong → Belum dipetakan, tanpa crash | node uji logika | **PASS (logika)** | `kategoriDariRekening(null/''/tak-dikenal)` → null, tanpa crash; koreksi kode kosong ditolak. ⚠️ Deviasi ringan: ACCEPTANCE berbunyi "koreksi manual tersimpan permanen" untuk kode kosong, implementasi menolak simpan koreksi tanpa kode (`simpanKoreksi('')` → false). Pilihan implementasi masuk akal (tidak ada key kosong), tapi berbeda literal kriteria — putuskan: terima deviasi atau minta builder sesuaikan teks ACCEPTANCE. |
| E-2 | Form penuh → 0 tertimpa, badge tetap | node uji logika + baca jalur | **PASS (logika)** | `diisi.length=0`, 3 field dilewati, `bkuSumber` tetap dibawa (badge tetap muncul). Toast 1× (info bila ada dilewati) — kode `DokumenSPJPage.jsx:194-196`. |
| C.3 | Dokumen lama kekal setelah tambah periode | uji manual 2 periode (browser) | **UNTESTED** | Mekanisme terbaca di kode (`formData-first` + kunci per tanggal); butuh UI. |

## Uji Logika Mandiri (bukan laporan builder)

Runner sendiri (node, salinan `bkuKategori.js` + stub storageHelper, artefak sudah
dihapus setelah uji): **29 PASS / 2 FAIL** — gagal = T-05 C1-1b/C1-1c di atas.
PASS meliputi: kategori 8 kasus (normalisasi/casefold/longest-prefix/null-safe),
koreksi 3, konsumsi AND-ketat 3, ATK 5, pejabat 4, prefill 5.
Catatan: builder klaim 28/28 — klaim tidak direproduksi 1:1 (kasus uji berbeda),
tetapi **tidak ada kontradiksi** dengan hasil saya pada kasus yang sama.

## GAPS (correctness only)

1. **T-05 — saran "gabung manual" untuk pasangan nyaris-sama terlalu sempit.**
   ACCEPTANCE: "pasangan beda 1 huruf → saran 'gabung manual' (bukan auto)".
   Implementasi `gabungKonsumsi()` hanya menganggap nyaris-sama bila satu kegiatan
   **memuat** yang lain (inklusi). `'5.2.1.a'` vs `'5.2.1.b'` (beda 1 huruf, sama
   panjang) → **0 saran**. Repro:
   `gabungKonsumsi([{noBukti:'B-002',kegiatan:'5.2.1.a'},{noBukti:'B-002',kegiatan:'5.2.1.b'}]).saran.length === 0`
   (harusnya ≥1). Berkas: `spj-frontend/src/utils/bkuKategori.js` (blok saran).
   Catatan desain untuk builder: karena kegiatan berformat kode bertingkat
   (`5.2.1.a`), edit-distance 1 pada kode segmen, atau bandingkan setelah strip
   karakter terakhir, lebih tepat daripada inklusi.
2. **E-1 — deviasi literal kriteria** (lihat baris E-1): koreksi untuk kode kosong
   ditolak, bukan "tersimpan permanen". Bukan bug nyata; butuh keputusan user/arsitek.

## UNTESTED (risiko, preseden 001/002/003)

Seluruh kriteria UI runtime: T-03 (≤1 detik, klik baris), T-04 (screenshot
sebelum/sesudah), T-05 (UI gabungan — fungsi murninya sudah FAIL, lihat gap 1),
T-06 (2 screenshot), T-07 (screenshot kelompok), E-1 (list + count di layar),
C.3 (alur 2 periode), print-hidden. Alasan: pencil desktop tidak terhubung
(`failed to connect to running Pencil app ... transport not connected`).
Mitigasi preseden: uji manual user (sudah menemukan 0 cacat di 001/002; pola
diulang untuk 004 bila user terima risiko).

## Verdict: **REWORK** (1 FAIL / 1 UNTESTED load-bearing kategori T-05 runtime; gap T-05 statik-logika terbukti)

- **Rondu 1 fix untuk builder** (per Bab 12 Writer/Reviewer — builder yang
  memperbaiki, verifier tidak menyentuh src/):
  `gabungKonsumsi()` — perluas deteksi nyaris-sama menjangkau "beda 1 huruf"
  (edit-distance 1 pada kode kegiatan), bukan hanya inklusi. Re-verify hanya
  item ini (+ regresi C1 grup AND-ketat tidak boleh rusak).
- Setelah fix → jalankan ulang /acceptance-runner (fresh) untuk T-05 + item
  UNTESTED bila browser tersedia; bila tidak, keputusan terima-risiko = kewenangan
  user (preseden 001/002/003).
