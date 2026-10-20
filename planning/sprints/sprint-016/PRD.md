# PRD — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus (Identik Jalur Excel)

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG dimulai sebelum
> pack (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT) disusun & disetujui (AGENTS.MD).
> Input: **Idea Brief `/idea-clarifier` 2026-10-20** (5 keputusan final user — §1).
> Prasyarat: **fix akurasi OCR non-Januari (2026-10-20, belum di-commit)** — Jan–Jun
> 0 selisih di 3 fixture. Sprint ini TIDAK mengubah parser; ia mengubah **jalur impor**.
> Sprint sebelumnya: 015 Import BKU PDF (per-bulan, replace-by-month).
> Runtime: React 18 + Vite, **tanpa backend**, data ke localStorage (prefix `spj_`).

---

## 1. Latar Belakang & Keputusan yang Sudah Dikunci

Sprint 015 membangun pintu masuk PDF dengan model **replace-by-month**: user memilih
satu bulan, hanya bulan itu yang diimpor. Model ini disengaja saat itu, tetapi user
menilai hasilnya "hanya bulan ke-1 yang terbaca" karena default bulan = 1.

**Idea Brief 2026-10-20 (dikonfirmasi user, 5 poin — JANGAN diputus ulang):**

| # | Keputusan | Konsekuensi rancangan |
|---|---|---|
| 1 | Tampilan hasil **sama persis identik** dengan jalur Excel | Hasil impor tampil di halaman BKU: filter bulan terisi, posisi **"Semua"**, ringkasan ikut |
| 2 | Simpan **semua bulan sekaligus** | Satu tulis atomik, bukan N tulis per bulan |
| 3 | Baris ganda/meragukan → **tandai, user periksa** | Penandaan eksplisit di preview; bukan auto-buang, bukan auto-terima |
| 4 | Konflik data → **LANGSUNG TIMPA**, tanpa dialog konfirmasi | **Menghapus** dialog konfirmasi Sprint 015 (`BKUUploadPdf.jsx:288-306`) |
| 5 | Cakupan timpa → **SELURUH `spj_bku_data`** | Bulan yang tidak ada di PDF **ikut hilang** (persis Excel) |

> ⚠️ Keputusan #4 **berbeda** dari catatan lama 2026-10-19 ("notifikasi dulu").
> Keputusan 2026-10-20 yang berlaku. Wajib jadi ADR baru di `DECISIONS.MD` (append).

### 1.1 Target acuan = jalur Excel (terverifikasi di kode)

`BKUPage.jsx:193-253` (`handleFileUpload`) — inilah "identik" yang dimaksud:

1. `bkuParser.parseBKUExcel(file)` → `{ transactions, header, summary, footer, warnings, parsedAt }`
2. `setItems(result.transactions)` — **semua** transaksi, tanpa filter bulan
3. `setAvailableMonths(result.summary.months)`
4. `setFilterBulan('Semua')`
5. **Satu** `storageHelper.set('bku_data', { transactions, header, summary, footer, uploadedAt })`
   → **mengganti seluruh objek**, tanpa dialog konfirmasi
6. `warnings` muncul di dalam toast sukses

### 1.2 Kondisi kode hari ini (bukti per baris)

| Fakta | Lokasi | Akibat |
|---|---|---|
| `bulan` diinisialisasi `bulanAwal \|\| 1` | `BKUUploadPdf.jsx:38` | default selalu Januari |
| Preview difilter `t.bulan === bulan && t.tahun === tahunPdf` | `:92-94` | hanya 1 bulan tampil |
| Bulan kosong → error "tidak ada di PDF" | `:95-107` | user melihat "hanya bulan 1" |
| `simpan()` hapus `t.bulan === bulan` lalu tulis `aktif` | `:147-148` | replace-by-month |
| Dialog konfirmasi | `:288-306` | melanggar keputusan #4 |
| Dropdown bulan mengubah state tanpa memfilter ulang `baris` | `:233-239` | **BUG-1** tabel tidak ikut berubah |
| `simpan()` pakai `bulan` state tapi `baris` hasil parse | `:142-148` | **BUG-2** ganti dropdown lalu simpan = hapus bulan salah |
| `summary` ditulis `recalcSummary(gabung)` | `:154` | bentuk **berbeda** dari Excel (§4.3) |
| Objek ditulis dengan `...tersimpan` | `:152-155` | bukan penggantian utuh (keputusan #5) |

> **BUG-1 & BUG-2 hilang dengan sendirinya** karena dropdown pemilih bulan
> dihapus — tapi wajib dinyatakan sebagai kriteria uji, bukan diasumsikan.

---

## 2. Users

- **Primary — Bendahara SPJ SD.** Punya satu PDF BKU setahun dari ARKAS, ingin
  seluruh tahun masuk sekali jalan seperti saat ia mengunggah Excel.
- **Secondary — Operator/penyuluh** yang menyalin PDF BKU sekolah lain; tidak tahu
  isi PDF ada bulan apa saja, jadi tidak boleh diminta memilih bulan lebih dulu.

**Non-user:** aplikasi tidak dipakai multi-user; tidak ada backend; tidak ada admin.

---

## 3. User Stories & Acceptance Criteria

### US-1 — Impor seluruh tahun sekali jalan
Sebagai Bendahara, saya ingin mengunggah satu PDF dan mendapat **semua bulan** yang
ada di dalamnya, agar tidak mengulang unggah 12 kali.

- [ ] Tidak ada pemilihan bulan **sebelum** proses; PDF langsung diproses setelah dipilih
- [ ] Semua baris dari semua bulan (dan semua tahun yang terbaca) masuk preview
- [ ] Jumlah baris preview = jumlah transaksi hasil parse (tidak ada bulan yang dibuang)
- [ ] Tahun dokumen diambil dari kop PDF; bila kop gagal, dari tahun terbanyak baris
      (sudah ada: `meta.tahunDokumen`) — **bukan** konstanta `2026`

### US-2 — Preview menampilkan semua bulan, terkelompok & bisa disaring
Sebagai Bendahara, saya ingin melihat seluruh baris dengan penanda bulan, agar bisa
memeriksa tanpa kehilangan konteks.

- [ ] Preview menampilkan **semua** baris, urut tanggal menaik
- [ ] Ada ringkasan per bulan: jumlah baris · masuk · keluar · saldo akhir
- [ ] Ada penyaring tampilan bulan (dropdown) yang **benar-benar** menyaring `baris`
      (menutup BUG-1) — dan **tidak** mengubah apa yang akan disimpan
- [ ] Pilihan penyaring menyertakan **"Semua"** dan menjadi nilai awal
- [ ] Baris yang disaring keluar tetap dihitung di total simpanan (penyaring = tampilan saja)

### US-3 — Baris meragukan ditandai, bukan diputuskan mesin
Sebagai Bendahara, saya ingin melihat baris yang tidak pasti, agar saya yang memutuskan.

- [ ] Baris dengan `tanggal_perlu_dikoreksi` dan `nominal_diperbaiki` diberi tanda visual
      (sudah ada: `perluKoreksi` + `ring-1 ring-primary/50`)
- [ ] Baris dengan **duplikat** (tanggal + noBukti + uraian + nominal sama, bulan sama)
      diberi tanda "duplikat" — **tidak** dibuang otomatis
- [ ] Jumlah titik saldo tidak runtun (`reconcile.mismatches`) tampil sebagai peringatan
      tingkat-atas dengan jumlahnya
- [ ] Ada tombol "sembunyikan/tampilkan baris bertanda" agar pemeriksaan 420 baris praktis
- [ ] Baris bisa dikecualikan (`excluded`) per baris — **tetap** ada, berlaku lintas bulan
- [ ] Koreksi inline (tanggal/uraian/nominal/saldo) tetap berfungsi lintas bulan

### US-4 — Simpan sekali, timpa seluruhnya, tanpa dialog
Sebagai Bendahara, saya ingin satu klik simpan yang mengganti data BKU, agar sama
dengan perilaku Excel yang sudah saya percaya.

- [ ] **Tidak ada** dialog konfirmasi sebelum menyimpan
- [ ] Satu panggilan `storageHelper.set('bku_data', …)` — atomik, tanpa tulis per-baris
- [ ] Objek yang ditulis **mengganti seluruhnya**: tidak memakai spread data lama
      (keputusan #5)
- [ ] Bulan yang tidak ada di PDF **hilang** dari `transactions` setelah simpan
- [ ] Toast sukses menyebut: jumlah baris · daftar bulan · masuk · keluar · saldo akhir ·
      status balance · jumlah catatan OCR — pola yang sama dengan toast Excel
- [ ] Simpan gagal (quota/exception) → **tidak ada** data lama yang rusak + pesan jujur

### US-5 — Halaman BKU tampil identik dengan hasil Excel
Sebagai Bendahara, saya ingin halaman BKU langsung menampilkan hasilnya, agar tidak
perlu refresh manual.

- [ ] Setelah simpan: `items` = semua transaksi, `availableMonths` = bulan hasil parse,
      `filterBulan` = `'Semua'`
- [ ] Ringkasan di layar (masuk/keluar/balance) dihitung dengan **definisi yang sama**
      dengan jalur Excel (§4.3, Q1)
- [ ] Total transaksi di layar = total baris yang disimpan
- [ ] Tidak ada error di konsol saat reload halaman setelah impor PDF

### US-6 — Gagal dengan jujur, tanpa merusak data
Sebagai Bendahara, saya ingin tahu kalau PDF tidak terbaca, agar tidak menimpa data
dengan kekosongan.

- [ ] 0 transaksi terbaca → **tidak ada** tulisan ke storage + pesan yang menyebut sebab
- [ ] File bukan PDF / PDF rusak / header `%PDF-` tidak sah → ditolak sebelum OCR
      (sudah ada: `periksaFilePdf`, `headerPdfValid`)
- [ ] Batal di tengah OCR → tidak ada perubahan data (sudah ada: `AbortController`)
- [ ] OCR satu halaman gagal → proses lanjut, halaman dicatat, tidak menggagalkan total

### US-7 — Tahun anggaran lintas tahun tidak diacak
Sebagai Bendahara, saya ingin saldo awal tahun sebelumnya (mis. 31-12-2025) tetap
di tahun aslinya, agar total per tahun benar.

- [ ] Baris bertahun `tahunDokumen − 1` **tidak** ikut dipindah ke tahun dokumen
- [ ] Ringkasan per tahun dihitung terpisah; tahun dokumen ditandai sebagai tahun utama
- [ ] Bulan pada tahun lain tetap bisa disimpan (tidak dibuang)

### US-8 — Progres & batal tetap bekerja untuk dokumen besar
Sebagai Bendahara, saya ingin melihat kemajuan, agar tahu aplikasi tidak hang.

- [ ] Progres "halaman x dari N" berjalan untuk 21 halaman (sudah ada)
- [ ] Tombol batal menghentikan OCR dalam ≤ 2 detik
- [ ] Setelah selesai/batal, worker OCR dilepas (`lepasWorker`) — tidak ada worker menggantung

### US-9 — Jejak impor tercatat
Sebagai Bendahara, saya ingin tahu kapan & dari file apa data berasal.

- [ ] `uploadedAt` diperbarui (ISO string)
- [ ] `sumberImpor` menyimpan nama file + jumlah halaman (field baru, §4.2)
- [ ] Data lama tanpa `sumberImpor` tetap terbaca (kompatibel mundur)

---

## 4. Data Requirements

### 4.1 Entitas: `spj_bku_data` (localStorage, satu objek)

| Field | Tipe | Wajib | Sumber | Catatan |
|---|---|---|---|---|
| `transactions` | `TransactionRow[]` | ya | parser PDF | **17 field**, kontrak sama dengan jalur Excel |
| `header` | `object` | ya | kop PDF + data lama | `tahunAnggaran`, `npsn`, `nama_sekolah`, `alamat`, `kabupaten`, `provinsi` |
| `summary` | `object` | ya | dihitung | bentuk **wajib sama** dengan jalur Excel (§4.3) |
| `footer` | `object` | ya | **Q2** | `kepalaSekolah{nama,nip}`, `bendahara{nama,nip}`, `tanggalPenutupan`, `tempat` |
| `uploadedAt` | ISO string | ya | waktu simpan | diperbarui tiap impor |
| `sumberImpor` | `object` | tidak | baru | `{ jenis:'pdf', namaFile, halaman }` |

### 4.2 `TransactionRow` (kontrak 17 field — JANGAN diubah)

`row` · `tanggal{day,month,year}` · `tanggalStr` · `tanggalISO` · `bulan` · `tahun` ·
`kodeKegiatan` · `kodeRekening` · `noBukti` · `uraian` · `penerimaan` · `pengeluaran` ·
`saldo` · `debet` · `kredit` · `tipe` · `kategori`

`tipe` & `kategori` **selalu** dihitung ulang lewat `redetectTypes()` — tidak pernah
disalin dari PDF (aturan Sprint 015, dipertahankan).

### 4.3 Bentuk `summary` — perbedaan yang WAJIB diselesaikan

| Field | Jalur Excel (`bkuParser.js:524-541`) | `recalcSummary` (`BKUPage.jsx:90-145`) |
|---|---|---|
| `totalTransactions` | ✅ | ✅ |
| `totalPenerimaan` | ✅ hanya `PENERIMAAN_BOSP` | ✅ hanya `PENERIMAAN_BOSP` |
| `totalPengeluaran` | ✅ `PEMBAYARAN` **+ `TARIK_TUNAI`** | ⚠️ `PEMBAYARAN` **saja** |
| `isBalanced` | ✅ dari angka di atas | ⚠️ dari angka di atas |
| `saldoAkhir` | ✅ | ❌ **tidak ada** |
| `months` | ✅ | ✅ |
| `totalPenerimaanSemua` / `totalPengeluaranSemua` | ✅ | ❌ |
| `byType` | ✅ | ❌ (tidak ada konsumen) |
| `monthlySummaries` | ✅ | ❌ (tidak ada konsumen) |

**Konsekuensi:** data yang disimpan lewat PDF hari ini punya `summary` **berbentuk lain**
daripada Excel. Karena "identik" adalah keputusan #1, sprint ini harus menyatukan bentuk.

> ✅ **Q1 DIJAWAB 2026-10-20, lalu DIREVISI hari yang sama — "samakan ke Excel" DIBATALKAN.**
> Bukti: `Σ TARIK_TUNAI` = `Σ PERGESERAN_BANK` = Rp 16.350.000 (selisih Rp 0) di Excel
> maupun PDF — tarik tunai adalah pemindahan bank↔kas, bukan belanja. Definisi Excel
> (`PEMBAYARAN + TARIK_TUNAI`) **double counting**.
> **Yang berlaku:** `totalPengeluaran` = `PEMBAYARAN` saja. `recalcSummary` **hanya ditambah
> field** (tidak mengubah definisi), dan `bkuParser.js:495` diubah **1 baris** (izin
> eksplisit user; TABU dicabut khusus baris itu). `summary` impor PDF wajib memuat **semua**
> field milik jalur Excel: `saldoAkhir`, `totalPenerimaanSemua`, `totalPengeluaranSemua`,
> `byType`, `monthlySummaries`. ADR: `DECISIONS.MD` §T (menggantikan §S1).

### 4.4 Data sementara (tidak dipersistensi)

`problems[]` (`jenis`, `tanggal`, `halaman`) · `dilewati[]` (baris ringkasan yang
dibuang) · `reconcile{mismatches,saldoAwal,masuk,keluar,saldoAkhir}` · `meta{total_pages,
kolomAngka,totalBaris,tahunDokumen}` — hanya untuk preview & peringatan.

### 4.5 Hubungan antar entitas

`spj_bku_data` **1 : N** `TransactionRow` (lewat `transactions[]`).
`TransactionRow.bulan` + `.tahun` = kunci pengelompokan bulanan (bukan ID tersendiri).
**Tidak ada** relasi ke entitas lain; modul lain (`dokKas.js`, `previewDocs.js`,
`dataContextBuilder.js`, `queryEngine.js`) membaca `transactions[]` saja —
**tidak satu pun** membaca `summary` (diverifikasi `grep`), jadi perubahan bentuk
`summary` berisiko rendah.

---

## 5. Non-Functional Requirements

### Performance
- 21 halaman @ DPI 200 (≈421 baris) selesai **≤ 180 detik** di Edge desktop kelas
  menengah; progres terlihat tiap halaman (baseline Sprint 015).
- Render preview 421 baris **≤ 1 detik**; penyaringan bulan **≤ 200 ms** (tanpa OCR ulang).
- Tidak ada pekerjaan OCR yang diulang saat user mengganti penyaring/koreksi.

### Security & Privasi
- **Tidak ada** panggilan jaringan untuk isi PDF; OCR berjalan lokal (`public/tesseract/`).
- Aset OCR dimuat dari origin sendiri (offline-capable), bukan CDN.
- Tidak ada kredensial/telemetri. Data sekolah tidak keluar dari perangkat.
- Input dari PDF diperlakukan **tidak tepercaya**: semua nominal di-`Number()`, semua
  tanggal divalidasi (`hariMaks`, bulan 1–12).

### Scalability / Batas Penyimpanan
- `localStorage` kuota ±5 MB. 421 baris × 17 field ≈ 250 KB → aman.
- Simpan gagal karena kuota **wajib** ditangkap: pesan jelas, data lama utuh.
- PDF > 60 halaman: tetap diproses, dengan peringatan durasi (bukan pemblokir).

### Usability & Konsistensi Visual
- **BLUE-ONLY** `#004ac6` + slate (aturan proyek). Tanpa emerald/amber/rose/violet/cyan.
- Semua komponen impor `print:hidden` — tidak pernah ikut cetak.
- Tidak ada istilah teknis OCR di pesan user; sebut "catatan" / "perlu diperiksa".

### Aksesibilitas
- Semua kontrol dapat dijangkau keyboard; tombol punya `title`/label teks.
- Tanda "perlu diperiksa" **tidak** boleh mengandalkan warna saja (wajib ada teks/tooltip).

### Traceability (khusus domain LPJ)
- Setiap baris hasil perbaikan otomatis (tanggal/nominal) **wajib** bisa dilacak di preview.
- Total tahunan hasil impor **wajib** bisa dibandingkan dengan baris "Jumlah" milik PDF.

---

## 6. Success Metrics

| Kriteria Brief | Metrik | Target |
|---|---|---|
| "Tampilan identik dengan Excel" | Jumlah klik setelah file dipilih sampai data tampil di BKU | **2** (pilih file → simpan) vs **3+** hari ini |
| "Semua bulan sekaligus" | Bulan tersimpan ÷ bulan yang ada di PDF | **100%** (bukan 1/12) |
| "Simpan semua sekaligus" | Panggilan `storageHelper.set('bku_data', …)` per impor | **tepat 1** |
| "Langsung timpa" | Dialog konfirmasi yang muncul saat simpan | **0** |
| "Ganti seluruhnya" | Bulan di `transactions` yang tidak ada di PDF setelah impor | **0** (terhapus) |
| Akurasi (prasyarat) | Selisih Jan–Jun vs Excel, 3 fixture | **0** (sudah tercapai 2026-10-20) |
| Integritas dokumen | Total tahunan vs baris "Jumlah" PDF | **cocok** (sudah tercapai) |
| Kinerja | Waktu impor 21 halaman | **≤ 180 detik** |
| Kejujuran data | Baris bertanda yang bisa diperiksa user | **100%** terlihat di preview |

---

## 7. Out of Scope — JANGAN diimplementasikan

Disalin dari Idea Brief, ditambah batas sprint:

1. **Parser & akurasi OCR tidak diubah** — `bkuParser.js` TABU (0 diff),
   `bkuPdfParser.js`/`bkuPdfRapi.js`/`bkuPdfTanggal.js` hanya boleh disentuh bila
   ada bug yang **memblokir** US di atas (dan itu wajib dilaporkan dulu).
2. **Jalur Excel tidak disentuh** (`BKUPage.jsx:193-253` tetap apa adanya).
3. **Tidak ada fast-path text-layer** (T-14 Sprint 015) — sprint terpisah.
4. **Tidak ada ekstraksi tanda tangan/footer dari PDF** — ✅ Q2 dijawab: `footer` **tidak
   dipertahankan** (ditulis kosong). Aman karena `getSignatureRoles()` tetap menyuplai
   nama/NIP untuk cetak, dan `footer.tempat` punya fallback ke `sekolah.kabupaten`.
5. **Tidak ada ekstraksi `alamat`/`kabupaten`/`provinsi` dari kop PDF** — ✅ Q3 dijawab:
   field itu **tidak dipertahankan** (hanya kosmetik di `BKUPage.jsx:512-513`).
   **Pengecualian wajib:** `header.tahunAnggaran` HARUS diisi dari `kop.tahun`, karena
   `previewDocs.js:242` memakainya untuk judul dokumen.
6. **Tidak ada backend / sinkronisasi / multi-user / login.**
7. **Tidak ada pemetaan ulang kode rekening** atau fitur PBJ/Pajak baru.
8. **Tidak memperbaiki** masalah cetak/landscape/Register Kas (sprint lain).
9. **Tidak mengubah** `recalcSummary` **di luar** penambahan field `summary` yang hilang
   (`saldoAkhir`, `totalPenerimaanSemua`, `totalPengeluaranSemua`, `byType`,
   `monthlySummaries`). Definisi `totalPengeluaran` **tidak** diubah (tetap `PEMBAYARAN`).
   `bkuParser.js` boleh diubah **hanya 1 baris** (`:495`, hapus `+ TARIK_TUNAI`) sesuai ADR §T2.

> Bila sebuah user story di atas menuntut salah satu item ini, story itu yang
> direvisi — bukan out-of-scope yang dilanggar.

---

## 8. Pertanyaan Terbuka — ✅ SEMUA TERJAWAB 2026-10-20

| # | Pertanyaan | Jawaban user | Konsekuensi rancangan |
|---|---|---|---|
| **Q1** | Definisi "pengeluaran riil": `TARIK_TUNAI` dihitung atau tidak? | **"samakan ke Excel" → DIREVISI: TIDAK dihitung** (opsi B) | `totalPengeluaran` = `PEMBAYARAN` saja. `recalcSummary` **hanya ditambah field**; `bkuParser.js:495` diubah **1 baris**. Angka Excel: **0 perubahan**. |
| **Q2** | `footer` lama dipertahankan atau dikosongkan saat "ganti seluruhnya"? | **"tidak perlu dipertahankan"** — selama tidak berkorelasi dengan nilai belanja BKU; user hanya perlu nilai untuk pembuatan dokumen | `footer` ditulis **kosong**. Aman: TTD cetak dari `getSignatureRoles()`, `footer.tempat` fallback ke `sekolah.kabupaten`. |
| **Q3** | `header.alamat/kabupaten/provinsi` lama dipertahankan atau dikosongkan? | **"tidak perlu dipertahankan"** (alasan sama) | Ditulis **kosong**. **Kecuali `tahunAnggaran`** — WAJIB diisi dari `kop.tahun` (`previewDocs.js:242`). |

ADR: `DECISIONS.MD` §S1–S3. Pertanyaan ditutup di `QUESTIONS.MD` (3 entri CLOSED 2026-10-20).

> **Tidak ada penghalang tersisa.** BLUEPRINT Sprint 016 boleh disusun.

---

## 9. Self-Review (checklist skill)

- [x] Setiap user story punya acceptance criteria yang bisa diuji (US-1…US-9)
- [x] Permukaan kontrak mencakup semua story — lihat §4 (localStorage + modul), bukan HTTP
- [x] Data requirements memuat semua entitas yang disebut story (`bku_data`, `TransactionRow`, `summary`, `footer`, `sumberImpor`)
- [x] NFR spesifik & terukur (detik, ms, jumlah panggilan, kuota, warna)
- [x] Out-of-scope ada dan dihormati (§7)
- [x] Success metrics memetakan kriteria brief (§6, 5 dari 5 keputusan)
- [x] Jumlah user story = 9 (dalam rentang 5–15)
- [x] Tidak ada story "admin bisa mengelola segalanya"
- [x] Tidak ada endpoint tanpa auth — **karena tidak ada endpoint sama sekali**

### Catatan adaptasi (jujur, bukan kelalaian)
Skill ini mengasumsikan sistem ber-HTTP. Proyek ini **tidak punya backend**, jadi
langkah "API Surface" diterjemahkan menjadi **§4 Data Requirements + kontrak modul**:

| "Endpoint" | Padanan nyata | I/O |
|---|---|---|
| `POST /bku/import/pdf` | `pilihFile()` → `parseBkuFixture()` | `File` → `{transactions, problems, reconcile, kop, meta}` |
| `PUT /bku` | `simpan()` → `storageHelper.set('bku_data', …)` | objek `bku_data` → localStorage |
| `GET /bku` | `loadFromStorage()` | `bku_data` → state halaman |

Demikian pula `/tech-stack-advisor` **tidak diperlukan**: stack sudah ditetapkan
(React 18 + Vite + Tailwind + `pdfjs-dist@4.10.38` + `tesseract.js@7.0.0`), dan sprint
ini **tidak menambah dependency baru**.

---

## 10. Langkah Selanjutnya

1. **User menjawab Q1, Q2, Q3** (§8) — ini satu-satunya penghalang.
2. Setelah dijawab → susun pack sprint-016: `REQUIREMENTS.MD` · `BLUEPRINT.MD` ·
   `ACCEPTANCE.MD` · `HANDOFF-PROMPT.MD` (+ salinan audit di `architect-packs/`).
3. Dry run → lapor rencana → **tunggu persetujuan** → baru coding (AGENTS.MD).
4. ADR baru di `DECISIONS.MD` untuk keputusan #4 (timpa tanpa dialog) & hasil Q1–Q3.
