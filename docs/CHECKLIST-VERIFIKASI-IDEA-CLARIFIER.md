# CHECKLIST VERIFIKASI — Ide `idea-clarifier revisi fungsi dan fitur.md`

> Catatan mandiri untuk verifikasi ulang di sesi berbeda atau oleh AI agent lain.
> Dibuat: 2026-11-25. Status kode saat dokumen ini ditulis: `npx vitest run` **114/114 PASS**,
> `npm run build` exit 0, `git diff --check` bersih. Tanpa commit/push (kuasa user).
>
> **File sumber ide:** `docs/idea-clarifier revisi fungsi dan fitur.md`
> **PRD induk (disetujui user):** `docs/PRD-IDEA-CLARIFIER-REVISI.MD`
> **Rencana implementasi:** `docs/superpowers/plans/2026-11-25-prd-idea-clarifier-revisi.md`
> **Status proyek:** `STATE.MD`

## Cara pakai (sesi segar / agent lain)

1. Baca file ini + `docs/PRD-IDEA-CLARIFIER-REVISI.MD` §8 (OPEN-01…OPEN-08) dulu.
2. Jalankan gerbang otomatis:
   ```bash
   cd spj-frontend
   npx vitest run
   npm run build
   ```
   Harus: **114/114 tes PASS**, build exit 0, tanpa error baru.
3. Untuk verifikasi browser: `npm run dev` → buka `http://localhost:5173/dashboard/bku`
   (login bebas di profil QA — akun lokal; **jangan** injeksi auth ke profil user).
4. Untuk tiap item di bawah: cek kolom **Bukti kode**, lalu jalankan **Cara verifikasi**.
   Tandai PASS hanya dengan bukti (output tes / screenshot / perilaku teramati).
   Jangan klaim PASS untuk yang UNTESTED.

## Legenda status

- ✅ TERPENUHI — ada di kode + ada bukti (tes/browser).
- ⚠️ TERBUKA — butuh keputusan user dulu (lihat OPEN-..). Jangan implementasi dengan asumsi.
- 🔍 PERLU-UJI-BROWSER — kode ada, bukti browser belum diambil.

---

## 1. Lomba & Workshop — Undangan, Proposal (terpisah), Surat Tugas, Daftar Hadir, dokumentasi foto, spanduk

**Status: ✅ (kode + unit), 🔍 (browser interactions)**

- Bukti kode:
  - `spj-frontend/src/data/templateConfig.js` — template `undangan_lomba`, `proposal_kegiatan`
    (struktur Pengesahan + BAB I/II/III dari DOCX workshop, semua default kosong),
    `surat_tugas_lomba`, `daftar_hadir_lomba`, `spanduk_desain` (4 field:
    Nama Kegiatan, Nama Gugus, Tanggal, Tempat — grafis saja, bukan foto bukti).
  - `spj-frontend/src/data/kategoriLpj.js` — kartu `lomba_workshop` (4 sub, tanpa comingSoon).
  - `spj-frontend/src/utils/previewDocs.js` — `lombaDocs()`: Undangan + Surat Tugas +
    Daftar Hadir digabung satu daftar; Proposal dirakit terpisah.
  - `spj-frontend/src/components/bku/KategoriPicker.jsx` — dropdown custom (bukan select OS).
  - Foto: `useFotoDokumen` + `BKUSidebarDokumentasi.jsx:81` (`multiple`).
- Tes: `templateConfig.test.js` — 4 template terdaftar, defaults kosong, 1-sub-aktif = 1 dokumen,
  anti-duplikat, spanduk tepat 4 field.
- Cara verifikasi:
  1. Upload `template-data/bku-tahunan.pdf` (mode Tahunan) → 420 transaksi.
  2. Di kolom Tipe baris BNU04 pilih "Lomba & Workshop" → tersimpan langsung, toast muncul.
  3. Klik baris BNU04 → sidebar kartu Lomba & Workshop → panel menampilkan 3 dokumen gabungan;
     tab Proposal menampilkan dokumen proposal saja.
  4. Checklist "Dokumen yang ikut dicetak" mencentang/mencoret per dokumen; Cetak hanya ikutkan yang aktif.
  5. Upload 2+ foto dokumentasi → semua tampil di panel; hapus satu → hilang dari cetak; `bku_data` tidak berubah.

## 2. Foto: 1 foto banyak orang + tiap sudut ruangan (upload asli)

**Status: ✅ (kode), 🔍 (browser)**

- Bukti kode: input `multiple`, tambah/hapus per foto, sumber `upload` vs `ai` terpisah
  (`useFotoDokumen.js`, `BKUSidebarDokumentasi.jsx`).
- Cara verifikasi: upload 3 foto sekaligus → ketiganya tampil di Panel Preview;
  hapus 1 → daftar cetak berkurang 1; foto asli tidak berlabel AI.

## 4. Notula: hanya jumlah peserta (bukan nama)

**Status: ✅**

- Bukti kode: `src/utils/previewDocs.js:107` dan `src/components/templates/MaminPreview.jsx:58`
  memakai `jumlahPesertaNotulen()` dari `src/utils/dokPajak.js`... (ralat: dari
  `src/utils/jumlahPeserta.js`) → output `"N orang"`.
- Tes: `src/utils/__tests__/jumlahPeserta.test.js` (hitung manual, nama, baris kosong).
- Cara verifikasi: buka dokumen Notulen berisi N peserta → teks cetak memuat "N orang", tanpa daftar nama.

## 5. Tambah Guru/Tendik manual setelah impor (bukan integrasi Dapodik)

**Status: ✅**

- Bukti kode: `src/pages/dashboard/DataGuruPage.jsx` — `simpanPersonelManual`,
  `bukaFormPersonel`, `handleDelete` (konfirmasi), validasi nama wajib.
- Keputusan dikunci: impor Excel ulang = **replace seluruh daftar** (data manual yang tak ada
  di file ikut terganti). Lihat PRD OPEN-03 bila ingin menambah konfirmasi replace.
- Cara verifikasi: Tambah Guru manual → reload → data tetap ada; impor ulang Excel →
  daftar = isi file (data manual lama hilang).

## 6. NUPTK opsional di daftar penerima Honor

**Status: ✅**

- Bukti kode: kolom `nuptk` di 4 template honor (`templateConfig.js` baris ±436/484/533/582);
  `DokumenFormPreview.jsx:1719,1723` (`NIP/NUPTK`, fallback `r.nip || r.nuptk`).
- Cara verifikasi: personel tanpa NUPTK → simpan/preview/print tetap jalan; dengan NUPTK → tampil.

## 8. SK honor tidak dicetak tiap kegiatan (1 SK/semester) + pasal editor tidak premium

**Status: ⚠️ TERBUKA — butuh keputusan user (jangan implementasi dulu)**

- Kondisi kode saat ini: `SkHonorerEditor.jsx` (full editor pasal) + `skPasal.js` masih dipakai;
  SK formal `SKHonorer.jsx` tetap dirender di panel/cetak.
- Pilihan yang harus dijawab user:
  - A. Hapus total editor pasal (hanya format surat jadi yang dipakai), atau
  - B. Pindahkan editor ke menu SK tersendiri (1 SK per semester).
- Setelah diputuskan: update PRD + acceptance, baru implementasi.

## 10. Kop undangan SPPD: nama gugus dinamis (bukan hardcode)

**Status: ✅ (kode), 🔍 (render browser)**

- Bukti kode: `src/components/templates/DokumenFormPreview.jsx:1694` —
  `gugusNama: formData.gugusNama || getSchoolData().gugusNama` (fallback literal docx
  hanya bila data kosong, sesuai audit gugus task 41).
- Cara verifikasi: ubah Nama Gugus di Data Sekolah → buka undangan SPPD → kop memakai nama baru.

## 11. PBJ hanya untuk Pembelian Barang, Mamin/Konsumsi, ATK (hide: Honor, Perjalanan Dinas, Lomba/Workshop)

**Status: ⚠️ SEBAGIAN — mapping "Pembelian Barang" belum ada (OPEN-04)**

- Bukti kode: `src/utils/pbjEligibility.js` — allow-list
  `['mamin', 'atk', 'pembelian', 'pembelian_barang']`; honor/perjalanan/lomba tidak lolos.
- Masalah: kategori `pembelian`/`pembelian_barang` tidak dihasilkan peta rekening mana pun
  dan tidak ada di pilihan koreksi → PBJ pembelian barang saat ini tak terjangkau.
- Jangan mengarang mapping. Tanyakan user: kode rekening/lookup resmi apa = "Pembelian Barang".

## 13. Format tanggal dokumen Perencanaan = format resmi

**Status: ⚠️ TERBUKA — butuh contoh format resmi dari user (OPEN-05)**

- Kondisi kode: field tanggal masih teks bebas (`WorkplanPbj.jsx` input "Tanggal (hari)").
- Minta user: contoh tanggal resmi persis (mis. "Cikalongwetan, 7 Januari 2026") + locale/lokasi
  penandatangan. Setelah itu: kunci formatter + tes batas bulan/tahun.

## 15. Mamin/konsumsi tidak masuk ATK (auto filter)

**Status: ✅ (+tes unit)**

- Bukti kode: `src/utils/bkuKategori.js` — `0052/0055/5.1.02.02.01.0001 → mamin`,
  `0024 → atk` (prefix berbeda, longest-match; tidak tumpang tindih).
- Tes: `src/utils/__tests__/aturanPesanan.test.js` — "mamin/konsumsi tidak pernah jadi ATK".
- Cara verifikasi: jalankan suite; opsional cek baris konsumsi kegiatan di fixture → badge mamin.

## 16. Kode rekening tampil lengkap (2 digit terakhir tidak hilang)

**Status: ✅ diperbaiki + tes (berlaku untuk upload BARU)**

- Akar: token scan terpisah ("5.1.02.01.01.00" + "52") — fragmen ekor dibuang bila
  `polos.length !== 1` (`src/utils/bkuPdfTeks.js`).
- Perbaikan: gabung fragmen yang berdekatan (<40px) dengan token kode; digit jauh
  (mis. "PPh 23") tidak tersedot.
- Tes: `src/utils/__tests__/bkuPdfTeks.test.js` — "5.1.02.01.01.00 + 52 → 5.1.02.01.01.0052",
  plus regresi lama.
- **Penting: data BKU lama yang sudah tersimpan tetap terpotong — upload ulang PDF-nya.**
- Cara verifikasi: upload ulang `template-data/bku-tahunan.pdf` → kolom Kode tampil penuh
  (mis. `5.1.02.01.01.0052`, bukan `5.1.02.01.00`).

## 17. Logo upload tampil di setiap dokumen

**Status: ✅ (kode), 🔍 (visual semua template)**

- Bukti kode: `KopSurat.jsx:17-18` baca `logo_sekolah` + `logo_dinas` saat render
  (tanpa reload); `SKHonorer.jsx:43` fallback dinas→sekolah; `previewDocs.js:165` +
  `DokumenFormPreview.jsx:1698` teruskan `logo_gugus` ke kop gugus.
- Cara verifikasi: upload logo di Data Sekolah (sekolah + dinas + gugus) → buka tiap
  dokumen (Undangan, Surat Tugas, Daftar Hadir, Proposal, SK, PBJ, Rincian Pajak) →
  logo tampil; kosongkan → fallback graceful tanpa layout rusak.

## 18. Standardisasi kop (jarak/ukuran/keseragaman)

**Status: ✅ sebagian (ukuran disamakan 56px)**

- Ukuran logo kini konsisten 56px: KopSurat `w-14 h-14`, KopGugus `w-14 h-14`, SKHonorer 60→56px.
- Posisi mengikuti layout masing-masing kop (sekolah: dinas-kiri/sekolah-kanan;
  gugus: satu logo kiri; SK: tengah). Konsistensi penuh lintas-template belum diaudit
  satu per satu — daftar per-template bila user menemukan yang jomplang.

## 19. Login: Tab dari username langsung ke password

**Status: ✅ (kode), 🔍 (keyboard manual 30 detik)**

- Bukti kode: `src/pages/LoginPage.jsx:156` link "Lupa password?" `tabIndex={-1}`;
  urutan DOM: username → (link dilewati) → password → toggle show/hide.
- Cara verifikasi: fokus username → tekan Tab → fokus harus di password.

## 20. Sidebar blank saat klik kegiatan belum berkategori

**Status: ✅ diperkuat (kode), 🔍 (reproduksi acak)**

- Jalur kode: baris tanpa kategori membuka tab Detail (render biasa, tanpa early-return blank).
- Pengaman baru: `src/components/ui/ErrorBoundary.jsx` membungkus `BKUSidebar` di
  `BKUPage.jsx` — crash render berubah jadi kartu aman (Tutup/Muat ulang), bukan panel putih.
- Cara verifikasi: klik acak 20+ baris (termasuk belum dipetakan, tanpa NoBukti, pajak) →
  tidak boleh ada panel putih kosong / console error merah. Bila masih terjadi, catat
  NoBukti + tipe barisnya.

## 22. Chart 2 semester berdampingan + akurat berbasis pengeluaran

**Status: ✅ (kode), 🔍 (angka vs BKU)**

- Bukti kode: `src/utils/arusKasSummary.js` — S1 Jan–Jun, S2 Jul–Des dari
  `totalPengeluaran` bulanan; `ArusKasChart.jsx:143-148` render berdampingan.
- Tes: `src/utils/__tests__/arusKasSummary.test.js` (total S1/S2 + bulan kosong).
- Cara verifikasi: jumlahkan pengeluaran BKU per bulan → bandingkan dengan chart;
  selisih harus Rp 0.

## 25. Kolom TTD honor diperlebar (tetap muat A4)

**Status: ✅ (kode), 🔍 (cetak)**

- Cara verifikasi: print preview Daftar Penerima honor → kolom TTD visibly lebar,
  tidak overflow kertas A4.

---

## Gerbang kualitas setiap sesi verifikasi

1. `cd spj-frontend && npx vitest run` → semua PASS (baseline: 114/114).
2. `cd spj-frontend && npm run build` → exit 0.
3. `git diff --check` → bersih (abaikan warning LF→CRLF).
4. Browser: 0 console error merah selama alur yang diuji.
5. Jangan nyatakan PASS tanpa bukti. Sprint TIDAK ditutup tanpa perintah user.

## Keputusan user yang sudah dikunci (jangan diubah diam-diam)

- Impor Excel Guru/Tendik ulang = replace seluruh daftar.
- Dropdown kategori di kolom Tipe semua baris; koreksi = NoBukti + kode lengkap + tanggal sama.
- Foto generatif tanpa label `ILUSTRASI AI` dilarang (D-17 Sprint 022).
- Proposal AI: tanpa network call sebelum consent/privasi/allowlist/key disetujui.
- Cetak: hanya area `.sk-print-area` formal; layar tidak ikut cetak.
- Tanpa commit/push tanpa perintah user.
