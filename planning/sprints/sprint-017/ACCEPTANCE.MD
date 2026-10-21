# ACCEPTANCE — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> Status: **DRAFT — menunggu persetujuan user.**
> Dijalankan **setelah** BLUEPRINT dieksekusi. `/acceptance-runner` wajib di **konteks segar**
> (AGENTS.MD). Setiap butir butuh **bukti**: output asli, screenshot, atau angka.
> Klaim tanpa bukti = **FAIL**.

---

## 0. TASK GATE (wajib lulus sebelum butir lain dinilai)

| # | Gate | Perintah / cara | Lulus bila |
|---|---|---|---|
| G-0 | Build | `cd spj-frontend && npm run build` | `exit 0`, `✓ built in …` |
| G-1 | `bkuParser.js` tabu | `git diff --stat -- spj-frontend/src/utils/bkuParser.js` | **kosong** |
| G-2 | Dependency | `git diff --stat -- spj-frontend/package.json spj-frontend/package-lock.json` | **kosong** |
| G-3 | Storage terpusat | `rg -n "localStorage\." src/utils/lpjBkuStore.js src/components/bku/BKUSidebarLpj.jsx src/components/dokumen/` | **0 hit** |
| G-4 | Blue-only | `rg -n "\b(bg\|text\|border\|ring)-(emerald\|amber\|rose\|violet\|cyan)" src/components/dokumen src/components/bku/BKUSidebarLpj.jsx` | **0 hit** |
| G-5 | Batas modul | `wc -l` semua file baru | ≤ batas BLUEPRINT §2 |
| G-6 | Cetak tidak tersentuh | `git diff --stat -- src/data/templateConfig.js src/utils/previewDocs.js` | **kosong** |

> ⚠️ Pola grep bisa berbohong (RISKS/MEMORY): setiap hit G-3/G-4 **wajib dibuka isinya**.
> `grep -c "rose"` pernah memberi 8 hit palsu dari kata `proses`.

---

## 1. Gate Per Fase (mengikuti BLUEPRINT)

### T-01 — Baseline snapshot panel LPJ
- [ ] `node test-lpj-baseline.mjs` mencetak **4 hash** (honor · perjalanan_dinas · mamin · pemeliharaan).
- [ ] `test-lpj-baseline.json` tersimpan dan dipakai sebagai pembanding T-03/T-13.

### T-02 — Ekstraksi `prefillLpj.js`
- [ ] Build exit 0.
- [ ] Oracle membandingkan `{ tambahan, diisi, dilewati, tertimpa }` lama vs baru → **identik 4/4**.
- [ ] Diff `DokumenSPJPage.jsx` hanya blok prefill; `handleCetakGate`/`handleCekPanel` tidak berubah.

### T-03 — Ekstraksi `DetailDokumenLpj`
- [ ] Hash panel **identik 4/4** dengan T-01.
- [ ] `DokumenSPJPage.jsx` turun ≥250 baris (bandingkan `wc -l` sebelum/sesudah).
- [ ] `MenuGuide` masih muncul di 4 menu LPJ.
- [ ] 0 kelas baru di jalur `sk-print-area`.

### T-04 — Gate FASE 0 ⛔
- [ ] Build exit 0 · hash 4/4 identik · diff hanya 3 file.
- [ ] **Bila gagal: STOP.** FASE 1 tidak boleh dimulai.

### T-05 — `lpjBkuStore.js`
- [ ] Round-trip simpan→baca mengembalikan objek sama.
- [ ] Dua NoBukti berbeda → dua entri, tidak saling timpa.
- [ ] `noBukti` kosong → `{ ok: false }`, storage **tidak bertambah** (dibuktikan dengan panjang objek).
- [ ] Data rusak `"{{"` → `bacaEntri` = `null`, tidak melempar.
- [ ] `hapusEntri` hanya menghapus satu entri.

### T-06 — `fieldWajib.js` ⛔
- [ ] `{}` → `lengkap=false`, `kurang.length > 0`.
- [ ] Semua key terisi → `lengkap=true` untuk 4 template wakil.
- [ ] Hapus 1 key → key itu muncul di `kurang`.
- [ ] Key `defaults` (`sifatUndangan`, `bulan`, `tahun`) tidak pernah masuk `kurang`.
- [ ] `rows: []` → `kurang` memuat `rows`; `rows: [{}]` → terisi; angka `0` = terisi.
- [ ] **Bila `lengkap` tak pernah `true`: STOP**, aturan A-1 direvisi bersama user.

### T-07 — `BKUSidebarLpj.jsx`
- [ ] Build exit 0 · file ≤200 baris.
- [ ] Ada entri tersimpan → menampilkan entri; tidak ada → prefill BKU.
- [ ] Tombol Simpan `disabled` + tooltip saat NoBukti kosong.

### T-08 — Lebar + tab + guard
- [ ] Baris LPJ: panel `max-w-none` (100% viewport).
- [ ] Baris non-LPJ: panel `max-w-xl` (≤576px).
- [ ] Tab urutan: LPJ · Detail · Dokumentasi; `activeTab='lpj'` saat LPJ, `'detail'` saat non-LPJ.
- [ ] Tombol close menutup dari tab mana pun.

### T-09 — Sinkron ‹ ›
- [ ] mamin → honor → BOSP: panel berganti kategori, lalu menyempit, 0 console error.
- [ ] Isian yang sudah disimpan tidak hilang saat pindah.

---

## 2. Acceptance Fitur (dipetakan ke PRD US-01…US-08)

### AF-01 — Buka dokumen LPJ dari baris BKU (US-01)
- [ ] Klik baris Mamin → panel **100% viewport**.
- [ ] Tab **Dokumen LPJ** aktif & pertama.
- [ ] Header menampilkan NoBukti, uraian, nominal, "Baris n/N".
- [ ] Close → kembali ke tabel dengan filter bulan & posisi scroll utuh.

### AF-02 — Identik dengan menu LPJ (US-02)
- [ ] Checklist field per kategori: honor · perjalanan dinas · mamin · pemeliharaan →
      jumlah field, label, urutan **sama** dengan menu LPJ (isi tabel manual, 4 baris × 3 kolom).
- [ ] `rg -n "renderDetailPanel" src/` → hanya satu definisi panel (komponen bersama).
- [ ] Mengubah satu file komponen bersama → tampilan di kedua tempat berubah.

### AF-03 — Simpan per NoBukti (US-03)
- [ ] Isi → Simpan → toast sukses.
- [ ] Tutup → buka baris sama → nilai utuh.
- [ ] F5 → nilai utuh.
- [ ] Baris lain (NoBukti berbeda) → kosong/prefill, bukan data baris pertama.

### AF-04 — Rincian se-NoBukti (US-04)
- [ ] Baris dalam satu grup se-NoBukti → membuka panel yang sama.
- [ ] Rincian grup (uraian + nominal) terlihat di form/preview.
- [ ] Grup lintas kategori → memakai kategori dominan + peringatan tampil.

### AF-05 — Peringatan kelengkapan (US-05) — **DISESUAIKAN EX-5**
- [x] Field wajib belum lengkap → preview **tetap tampil** + banner peringatan "n field wajib belum terisi: <label>". (Keputusan user 2026-10-21: "Selalu tampil + peringatan"; rancangan awal "sembunyikan preview" **dibatalkan**.)
- [x] Lengkap → banner hilang, preview tetap tampil.
- [x] Daftar field wajib berasal dari satu modul (`utils/fieldWajib.js`), bukan hardcode di sidebar.
- [ ] Dilengkapi → banner hilang **tanpa reload** — perlu uji browser (lihat §7 BELUM).

### AF-06 — Baris non-LPJ tidak berubah (US-06)
- [x] 9 tipe diuji (lihat §3) → ≤576px (`max-w-xl`), tanpa tab LPJ, 0 error render. Bukti: `test-lpj-sidebar.mjs`.
- [ ] 9 tipe → 0 **console error** di browser — perlu uji browser (lihat §7 BELUM).

### AF-07 — Navigasi ‹ › (US-07)
- [x] ‹ › tampil + penanda posisi baris (`Baris n / total`) di panel full width.
- [x] Ganti baris → efek reset memilih tab (`isLpj ? 'lpj' : 'detail'`) → pindah ke non-LPJ menyempit.
- [ ] Panel berganti **tanpa menutup sidebar** saat pindah kategori — perlu uji browser (lihat §7 BELUM).

### AF-08 — Menu LPJ tidak regresi (US-08)
- [x] Hash form+docs 4/4 identik sebelum/sesudah ekstraksi (T-01) + prefill 6/6 identik vs kode lama (T-02b).
- [x] Halaman LPJ memakai `layout="side"` + **tanpa** `gate` → tanpa banner peringatan (perilaku lama utuh).
- [ ] Tombol **Cek** menyorot field kosong, badge "dari BKU" + **Urungkan**, `MenuGuide` di 4 menu — perlu uji browser (lihat §7 BELUM).

---

## 3. Matriks Baris Non-LPJ

| Tipe | Sumber data uji | Lulus bila |
|---|---|---|
| `PENERIMAAN_BOSP` | baris dana BOSP | ≤576px · tab Detail |
| `SETOR_PAJAK` | baris setor pajak | ≤576px · tab Detail |
| `PAJAK_BUNGA` | baris pajak bunga | ≤576px · tab Detail |
| `PUNGUT_PPH` | baris pungut PPh | ≤576px · tab Detail |
| `TARIK_TUNAI` | baris tarik tunai | ≤576px · tab Detail |
| `PERGESERAN_BANK` | baris pergeseran | ≤576px · tab Detail |
| `BUNGA_BANK` | baris bunga | ≤576px · tab Detail |
| `SALDO_AWAL` | baris saldo awal | ≤576px · tab Detail |
| **ATK/Penggandaan** | baris kode rekening ATK | ≤576px · tab Detail (A-2) |

---

## 4. Edge Cases

| # | Kondisi | Harapan |
|---|---|---|
| E-1 | Baris tanpa `noBukti` (kosong/`'-'`) | Panel boleh dibuka, tombol Simpan `disabled` + alasan jelas; tidak menulis kunci kosong |
| E-2 | `spj_lpj_bku` berisi JSON rusak | Panel tetap terbuka (prefill), 0 crash |
| E-3 | Baris berkategori tapi `templateId` sub = `null` (`comingSoon`) | Tampil pesan "template belum tersedia" (perilaku lama), bukan panel kosong |
| E-4 | Data BKU kosong / 0 transaksi | Halaman BKU normal, sidebar tidak pernah dirender |
| E-5 | Pindah tab LPJ → Detail → LPJ | Isian form tidak hilang dalam satu sesi panel |
| E-6 | Nama kategori dominan grup se-NoBukti = `atk` | Diperlakukan non-LPJ (A-2), bukan crash |

---

## 5. Checklist Penutupan Sprint

- [x] **C-01** Semua G-0…G-6 hijau, output dikutip apa adanya di BUILD-REPORT.
- [x] **C-02** AF-01…AF-06, AF-07, AF-08 diverifikasi lewat oracle render/logika; **screenshot ditunda** ke uji manual xcode (butuh data BKU nyata — lihat §7).
- [x] **C-03** Oracle T-01/T-02b/T-05/T-06 + oracle baru T-08/T-09 PASS; hasil angka dikutip.
- [x] **C-04** `STATE.MD` entri sprint 017 + `DECISIONS.MD` ADR baru + checklist pack ini dicentang.
- [x] **C-05** Skrip uji sementara dihapus setelah hasil dikutip; artefak tidak masuk commit.
      *(dilakukan saat penutupan 2026-10-21: 9 berkas `spj-frontend/test-lpj-*` dihapus setelah
      hasil dikutip di §7 di atas; salinan cadangan di `.workbuddy-ai/backup-sprint017-tests/`)*
- [x] **C-06** Daftar "BELUM/UNTESTED" ditulis jujur (§7).

---

## 7. Hasil Gate & Yang BELUM Diuji

### Hasil (dikutip apa adanya dari `spj-frontend/test-lpj-gate.sh`)

```
== npm run build ==
BUILD: OK
✓ built in 12.94s

== oracle JSX (render) ==
test-lpj-baseline: OK (1 PASS)   ← 4 hash: honor 9dd39ee29129b019 · perjalanan_dinas 7603f56f38a72bc5
                                    mamin 451eabcbf48c19fd · pemeliharaan 73f455989cfe5ce9
test-lpj-panel:    OK (23 PASS)
test-lpj-guard:    OK (24 PASS)
test-lpj-sidebar:  OK (47 PASS)

== oracle logika (ESM) ==
test-lpj-prefill:     OK (7 PASS)  ← 6/6 hash lama==baru
test-lpj-store:       OK (18 PASS)
test-lpj-fieldwajib:  OK (30 PASS)

SEMUA GATE LULUS
```

> **Revisi UI 2026-10-21 (permintaan user, lihat BLUEPRINT EX-9):** baris badge header dihapus ·
> tab "Detail" dihapus **khusus baris berkategori LPJ** (baris non-LPJ tetap) · tab bar dari
> segmented-control pill jadi **underline indicator** · **glassmorphism dihilangkan** dari
> panel detail DAN sidebar navigasi kiri (solid putih + hairline; scrim gelap tidak diubah) ·
> tab awal langsung `lpj` sehingga tidak ada kedip Detail.
> Asersi `test-lpj-sidebar.mjs` diperbarui untuk mengunci UI baru (47 asersi, +8 dari 39).
> Bukti tampilan: computed-style `backdrop-filter: none` + screenshot di
> `.workbuddy-ai/bukti-ui-20261021/` — penilaian akhir tetap butir §7 no. 9 (mata xcode).

Oracle render memakai `renderToStaticMarkup` (deterministik, tanpa data user). Konsekuensinya
jujur: **`useEffect` tidak berjalan**, sehingga tab *aktif* di render selalu `'detail'` — isi
panel LPJ tidak bisa diamati dari `BKUSidebar`. Karena itu isi panel diverifikasi terpisah
lewat `BKUSidebarLpj` langsung (`test-lpj-guard.mjs`), dan perilaku setelah efek (tab
terbuka otomatis, banner hilang tanpa reload) masuk daftar BELUM.

### BELUM / UNTESTED (perlu uji manual xcode di browser)

1. **Semua interaksi nyata** (klik, ketik, ganti tab, Simpan/cetak) — butuh data BKU nyata
   (unggah BKU PDF/Excel), tidak bisa dibuat fixture di repo.
2. **Tab otomatis terbuka di "Dokumen LPJ"** saat baris belanja diklik (efek reset).
3. **Banner peringatan hilang tanpa reload** saat field terakhir diisi.
4. **Cetak** (`window.print`, orientasi landscape, area `.sk-print-area`) — terikat printer/Chromium.
5. **`sorotPelanggaran`** saat tombol **Cek** ditekan di sidebar.
6. **Screenshot** AF-01…AF-06 (4 kategori + 1 non-LPJ).
7. **Grup se-NoBukti lintas kategori** dengan data nyata (dominansi + peringatan).
8. **Simpan → muat ulang halaman → isian masih ada** (`spj_lpj_bku` bertahan).
9. **Tampilan revisi UI 2026-10-21 di browser sungguhan** — header solid + tab underline di panel
   transaksi, dan sidebar navigasi tanpa glassmorph (blob blur/translucensi). Struktur & kelas
   sudah dikunci oracle (47 asersi) dan computed-style sudah diverifikasi lewat render statis
   (`backdrop-filter: none`, `backgroundColor: rgb(255,255,255)`) + screenshot bukti di
   `.workbuddy-ai/bukti-ui-20261021/` — tapi **penilaian "premium" tetap milik mata xcode**.
10. **Keputusan terpisah (belum diambil):** menghapus tab "Detail" untuk **semua** tipe baris,
    bukan hanya baris LPJ. Saat ini baris non-LPJ tetap memakai tab "Detail" supaya informasi
    (nominal · kategori · No Bukti · tombol Coretax) tidak hilang. Kalau xcode mau tab "Detail"
    hilang juga di baris non-LPJ, itu permintaan baru dengan dokumen tersendiri.

---

## 6. Bukti yang Wajib Dilampirkan

1. Output `npm run build` (baris `✓ built in …`). → ada di BUILD-REPORT.
2. Output oracle: 4 hash T-01/T-03, hasil T-02b, T-05, T-06. → ada di BUILD-REPORT.
3. Screenshot: panel Mamin full width (form + preview), gate belum lengkap, gate lengkap,
   sidebar sempit untuk 1 baris non-LPJ. → **BELUM (lihat §7 butir 6)**
4. `wc -l` semua file baru. → ada di BUILD-REPORT.
5. Output `rg` untuk G-3/G-4 (dengan isi hit dibuka bila ada). → ada di BUILD-REPORT.

---

**MULAI:** TASK GATE G-0 dijalankan.
**SELESAI:** C-01…C-06 tercentang dengan bukti, bukan klaim.

---

## 8. Penutupan Sprint (2026-10-21, keputusan user "tutup sprint ini")

- **Sprint 017 DITUTUP** atas keputusan user. Semua gate G-0…G-6 hijau, 7 oracle exit 0
  (hasil dikutip di §7), build final pasca-penutupan **✓ 12.62s**, skrip uji sementara dihapus
  (C-05) dengan cadangan di `.workbuddy-ai/backup-sprint017-tests/`.
- **Jujur — yang TIDAK dieksekusi sebelum penutupan:** seluruh butir §7 (uji browser manual:
  interaksi nyata, tab otomatis, banner tanpa reload, cetak, `sorotPelanggaran`, screenshot
  AF-01…AF-06, persistensi reload) **belum dijalankan** karena butuh data BKU nyata + mata xcode.
  Penutupan ini berarti item-item itu **diterima sebagai sisa pekerjaan**, bukan "lulus".
  Daftarnya dipindah ke `STATE.MD` (entri Sprint 017) supaya tidak hilang.
- **Putusan desain yang mengunci penutupan:** (1) preview SELALU tampil + banner peringatan;
  (2) halaman Dokumen LPJ dipertahankan sementara (D-6 → keputusan sementara "dipertahankan");
  (3) tab "Detail" hanya dihapus untuk baris LPJ; (4) tanpa glassmorphism di sidebar nav +
  panel detail BKU.
- **Verdict akhir "premium" atas revisi UI** masih menunggu mata xcode di browser sungguhan
  (§7 butir 9) — kalau nanti kurang pas, perbaikan tampilan tidak memerlukan pack baru.
