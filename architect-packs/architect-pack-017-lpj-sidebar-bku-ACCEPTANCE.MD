# ACCEPTANCE — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> ⚠️ **SALINAN AUDIT — snapshot saat pack disusun (2026-10-21), BUKAN dokumen hidup.**
> Revisi pasca-persetujuan hanya ada di `planning/sprints/sprint-017/<SAMA>.MD`.
> Yang berubah: preview **selalu tampil** (rancangan "sembunyikan preview" dibatalkan user
> 2026-10-21) · tab otomatis memuat entri tersimpan (EX-7) · oracle baru `test-lpj-guard` /
> `test-lpj-sidebar`. Lihat `planning/sprints/sprint-017/BUILD-REPORT.MD`.
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

### AF-05 — Gate preview (US-05)
- [ ] 1 field wajib kosong → **tidak ada** panel preview + indikator "n field kurang".
- [ ] Dilengkapi → preview muncul **tanpa reload**.
- [ ] Dikosongkan lagi → preview hilang.
- [ ] Daftar field wajib berasal dari satu modul (`utils/fieldWajib.js`), bukan hardcode di sidebar.

### AF-06 — Baris non-LPJ tidak berubah (US-06)
- [ ] 8 tipe diuji (lihat §3) → ≤576px, tab Detail, tanpa tab LPJ, 0 console error.

### AF-07 — Navigasi ‹ › (US-07)
- [ ] ‹ › tampil di panel full width.
- [ ] Pindah lintas kategori → panel berganti tanpa menutup sidebar.
- [ ] Pindah ke non-LPJ → menyempit & tab Detail.

### AF-08 — Menu LPJ tidak regresi (US-08)
- [ ] Hash panel 4/4 identik T-01.
- [ ] Tombol **Cek** masih menyorot field kosong (`sorotPelanggaran`).
- [ ] Badge "dari BKU" + tombol **Urungkan** bekerja.
- [ ] `MenuGuide` muncul di 4 menu.

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

- [ ] **C-01** Semua G-0…G-6 hijau, output dikutip apa adanya di BUILD-REPORT.
- [ ] **C-02** AF-01…AF-08 lulus dengan bukti (screenshot 4 kategori + 1 non-LPJ).
- [ ] **C-03** Oracle T-01/T-02b/T-05/T-06 PASS; hasil angka dikutip.
- [ ] **C-04** `STATE.MD` entri sprint 017 + `DECISIONS.MD` ADR baru (simpan per NoBukti ·
      ekstraksi panel · gate sidebar-only) + checklist pack ini dicentang.
- [ ] **C-05** Skrip uji sementara dihapus setelah hasil dikutip; artefak tidak masuk commit.
- [ ] **C-06** Daftar "BELUM/UNTESTED" ditulis jujur (mis. cetak fisik printer-gated).

---

## 6. Bukti yang Wajib Dilampirkan

1. Output `npm run build` (baris `✓ built in …`).
2. Output oracle: 4 hash T-01/T-03, hasil T-02b, T-05, T-06.
3. Screenshot: panel Mamin full width (form + preview), gate belum lengkap, gate lengkap,
   sidebar sempit untuk 1 baris non-LPJ.
4. `wc -l` semua file baru.
5. Output `rg` untuk G-3/G-4 (dengan isi hit dibuka bila ada).

---

**MULAI:** TASK GATE G-0 dijalankan.
**SELESAI:** C-01…C-06 tercentang dengan bukti, bukan klaim.
