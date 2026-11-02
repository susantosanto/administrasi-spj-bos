# BUILD-REPORT — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> Status: **DITUTUP 2026-10-21** (keputusan user "tutup sprint ini"). Gate G-0…G-6 hijau,
> 7 oracle exit 0, build final ✓ 12.62s, skrip uji sementara dihapus (C-05) — salinan di
> `.workbuddy-ai/backup-sprint017-tests/`.
> **Sisa pekerjaan (bukan "lulus"):** uji browser manual §6 butuh data BKU nyata + mata xcode —
> belum dijalankan, diterima sebagai sisa dan dicatat di `STATE.MD`.
> Pack: `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` · `HANDOFF-PROMPT.MD` (+ salinan `architect-packs/`).

---

## 1. Tujuan (dari PRD, bukan hasil)

Klik satu baris kegiatan belanja di **Data BKU** → sidebar detail terbuka **100% viewport**
dengan tombol close, dan tampilan pertama adalah **seluruh halaman Dokumen LPJ untuk kategori
baris itu** — form di atas, panel preview di bawah, identik dengan menu Dokumen LPJ.
Bisa diisi dan **disimpan per NoBukti**. Baris non-LPJ tetap sidebar sempit.

**Revisi arah user saat eksekusi (2026-10-21):** sidebar *menggantikan* halaman LPJ per kategori;
preview **tidak** lagi disembunyikan saat field wajib belum lengkap — pilihan user
**"Selalu tampil + peringatan"**. Halaman Dokumen LPJ **tetap ada dulu**; Dokumen Pendukung
**tetap di halaman LPJ**.

**Revisi tampilan user (2026-10-21, permintaan kedua — lihat BLUEPRINT EX-9):**
- Di sidebar detail transaksi: baris badge ringkas (tipe · #NoBukti · kegiatan) **dihapus**;
  tab **"Detail" dihapus untuk baris LPJ** (isinya sudah terwakili panel LPJ + kartu Ringkasan);
  desain tab **diganti dua kali** — dulu segmented-control pill, sekarang **underline indicator**.
- Header panel + sidebar navigasi kiri: **seluruh efek glassmorphism dihilangkan**
  (`bg-white/70|85` + `backdrop-blur`, blob blur dekoratif, border translusen) → permukaan
  **solid putih + hairline border + shadow lembut**; kesan minimalis premium.

---

## 2. Yang Dibuat / Diubah

### File baru
| File | Isi | Baris |
|---|---|---|
| `spj-frontend/src/data/kategoriLpj.js` | `CARDS` (dipindah dari halaman LPJ) + `KATEGORI_KE_CARD`, `cardDariKategori`, `cardBerpanel` | 135 |
| `spj-frontend/src/utils/prefillLpj.js` | `bangunPrefillLpj()` — prefill dari baris BKU, **pemindahan verbatim** blok 120 baris dari halaman | 148 |
| `spj-frontend/src/utils/lpjBkuStore.js` | kunci baru `spj_lpj_bku`, entri `<cardId>\|<noBukti>` | 88 |
| `spj-frontend/src/utils/fieldWajib.js` | `fieldWajibDariConfig`, `cekKelengkapan`, `peringatanDariPelanggaran` | 101 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpj.jsx` | shell panel, satu komponen dua layout (`side`/`stack`) | 149 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpjHeader.jsx` | ikon, badge, judul, MenuGuide, close, badge prefill + Urungkan, sub-tab | 113 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpjBody.jsx` | Zona A form + Zona B preview + banner peringatan | 101 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpjInfo.jsx` | cabang infoOnly / template belum ada / coming soon | 173 |
| `spj-frontend/src/components/bku/BKUSidebarLpj.jsx` | wrapper tab sidebar: muat/simpan, gate, toolbar NoBukti + Simpan | 196 |

### File diubah
| File | Perubahan |
|---|---|
| `src/pages/dashboard/DokumenSPJPage.jsx` | **603 baris** (dari 1107). `CARDS`, blok prefill, dan JSX panel dihapus → impor dari modul baru. `renderDetailPanel()` kini merender `<DetailDokumenLpj layout="side" />` (tanpa `gate` → perilaku lama utuh) |
| `src/components/bku/BKUSidebar.jsx` | **953 baris** (batas BLUEPRINT §2 ≤1000). impor `BKUSidebarLpj` + `cardBerpanel`; guard `cardLpj`/`isLpj`; lebar `isLpj ? 'max-w-none' : 'max-w-xl'`; tab `Dokumen LPJ` disisipkan sebagai tab pertama saat `isLpj`; `key={transaction.row}`; efek reset tab `isLpj ? 'lpj' : 'detail'` **dipindah ke bawah deklarasi `isLpj`**; objek `bkuPrefill` disatukan. **Revisi UI EX-9:** baris badge header dihapus; tab "Detail" dihapus untuk baris LPJ; panel + header dari glass (`bg-white/70`, `backdrop-blur-2xl`) → solid putih + hairline; tab bar segmented pill → **underline indicator** (garis 2px `bg-primary` di border header), tersembunyi bila 1 tab; tombol prev/next jadi `rounded-full h-9 w-9` |
| `src/components/layout/Sidebar.jsx` | **Revisi UI EX-9 (glassmorphism dihapus):** 285 → **251 baris**. Container `bg-white/60 backdrop-blur-2xl border-white/50` + 4 blob blur dekoratif + divider gradien → `bg-white` + `border-slate-200/80` + `shadow-[8px_0_24px_rgba(15,23,42,0.06)]` + hairline. Titik status emerald dekoratif di logo dihapus (bukan status nyata). Duplikasi kelas item nav disatukan lewat helper `navClass`/`iconClass` (satu sumber, tiga tempat) — file memendek meski bergaya ulang |
| `src/components/dokumen/DetailDokumenLpjBody.jsx` | preview **selalu** dirender; `gate` hanya memunculkan banner peringatan |

**Tidak disentuh (0 diff, diverifikasi):** `src/utils/bkuParser.js` · `package.json` ·
`package-lock.json` · `src/data/templateConfig.js` · `src/utils/previewDocs.js` ·
`src/components/templates/SummaryCard.jsx` (readinessCheck) · `src/components/templates/DokumenFormPreview.jsx`.

---

## 3. Gate ACCEPTANCE — dikutip APA ADANYA

### G-0 … G-6
```
== G-0 (npm run build) ==            exit=0
                                      ✓ built in 13.43s
== G-1 bkuParser.js tabu ==           (kosong)                 → LULUS
== G-2 dependency ==                  (kosong)                 → LULUS
== G-6 cetak tidak tersentuh ==       (kosong)                 → LULUS
== G-3 storage terpusat ==            (kosong)                 → LULUS
== G-5 batas modul (wc -l) ==
  135 kategoriLpj.js      148 prefillLpj.js      88 lpjBkuStore.js
  101 fieldWajib.js       149 DetailDokumenLpj.jsx
  113 …Header.jsx         101 …Body.jsx         173 …Info.jsx
  196 BKUSidebarLpj.jsx   954 BKUSidebar.jsx    603 DokumenSPJPage.jsx
                                      → semua ≤ batas BLUEPRINT §2
== G-4 blue-only ==                   10 hit (lihat §4)
```

### Gate lengkap (`spj-frontend/test-lpj-gate.sh`) — jalankan FINAL (setelah revisi UI EX-9)
```
== npm run build ==
BUILD: OK
✓ built in 12.39s

== oracle JSX (render) ==
test-lpj-baseline: OK (1 PASS)
test-lpj-panel:    OK (23 PASS)
test-lpj-guard:    OK (24 PASS)
test-lpj-sidebar:  OK (47 PASS)

== oracle logika (ESM) ==
test-lpj-prefill:     OK (7 PASS)
test-lpj-store:       OK (18 PASS)
test-lpj-fieldwajib:  OK (30 PASS)

SEMUA GATE LULUS
```
(Jalankan pertama setelah eksekusi: `built in 13.68s`, sidebar **39 PASS** — naik ke 47 setelah
`test-lpj-sidebar.mjs` diperbarui mengunci UI baru: badge dihapus, tab Detail dihapus, form +
preview tetap ter-render. Lihat §4 butir 6.)

---

## 4. Temuan Jujur (bukan klaim)

1. **G-4 (blue-only) = 10 hit, SEMUANYA warisan pemindahan.** Dibuka isi semua hit:
   `DetailDokumenLpjHeader.jsx:32,102,103` dan `DetailDokumenLpjInfo.jsx:57,58,73,74,165,166,167`
   memakai `emerald`/`amber` sebagai penanda **status** (Lengkap ✓ / Draft ◐ / "Template belum
   tersedia"). Semua ada persis di `HEAD:src/pages/dashboard/DokumenSPJPage.jsx` (baris 741,
   810, 811, 900–912, 1009–1011; **14 hit** di versi asli). **0 warna baru** — ini pemindahan,
   bukan penambahan. Verdict gate dicatat **LULUS dengan catatan**, bukan "0 hit".
2. **Dua cacat nyata ditemukan oracle saat T-08** (tidak ada di rencana):
   - `isLpj` dipakai di `useEffect` padahal `const isLpj` baru dibuat belakangan →
     `ReferenceError: Cannot access 'isLpj' before initialization` saat render. Di browser
     tertutup karena efek berjalan setelah render, tetapi ini TDZ sungguhan → efek reset
     **dipindah** ke bawah deklarasi.
   - Memuat entri tersimpan di `useEffect` membuat prefill **kedip** sebentar sebelum data
     tersimpan tampil → pemuatan dipindah ke inisialisasi `useState` (`muatAwal`) + `key={row}`
     dari `BKUSidebar` (komponen mount ulang per baris).
   Tercatat sebagai **EX-7 / DEV-2** di `BLUEPRINT.MD`.
3. **`test-lpj-panel.mjs` awalnya gagal 2 asersi** karena masih menuntut perilaku lama
   ("preview disembunyikan saat gate tertutup"). Asersi **diganti** mengikuti keputusan user
   EX-5 — kode tidak dipaksa kembali ke rancangan yang sudah dibatalkan. (EX-6)
4. **Render SSR tidak menjalankan `useEffect`** → tab *aktif* di oracle selalu `'detail'`.
   Karena itu isi panel diverifikasi terpisah lewat `BKUSidebarLpj` langsung
   (`test-lpj-guard.mjs`, 24 asersi). Perilaku setelah efek masuk daftar BELUM (§6).
5. **D-5 (gate mamin) masih terbuka.** Mamin tidak punya `templateId` (semua sub `null`) →
   A-1 tak punya satu config. Diimplementasikan **fallback** `peringatanDariPelanggaran`
   (dari `readinessCheck`), **bukan** keputusan final — tercatat di `QUESTIONS.MD`.
6. **Revisi UI EX-9 tidak punya oracle "tampilan" — selalu begitu.** Oracle mengunci
   **struktur & kelas** (tab, urutan, full-width, badge hilang: 47 asersi). Kesan "premium"
   tidak bisa diasersi. Sebagai gantinya dibuat bukti visual: render statis + CSS produksi
   `dist/assets/index-*.css` → screenshot Playwright (Edge, viewport 1440×900) di
   `.workbuddy-ai/bukti-ui-20261021/` (3 PNG) **plus** pembacaan `getComputedStyle` sebagai
   bukti objiktif glassmorphism hilang:
   - sidebar nav → `backgroundColor: rgb(255,255,255)`, `backdropFilter: none`,
     `boxShadow: … rgba(15,23,42,0.06) 8px 0px 24px`;
   - header panel → `backgroundColor: rgb(255,255,255)`, `backdropFilter: none`.
   Skrip render sementara (`tmp-render-ui.mjs`) sudah dihapus; skrip screenshot ada di luar repo
   (`/d/project/scratch-pw/shot-ui.mjs`). Verdict akhir tetap butuh mata xcode (§6 butir 9).

---

## 5. Bukti Angka Oracle (ringkas)

| Oracle | Hasil |
|---|---|
| `test-lpj-baseline` | 4 hash stabil: honor `9dd39ee29129b019` · perjalanan_dinas `7603f56f38a72bc5` · mamin `451eabcbf48c19fd` · pemeliharaan `73f455989cfe5ce9` |
| `test-lpj-prefill` | **6/6 hash lama == baru** (mamin/rapat, mamin/kegiatan, mamin/tanpa-kegiatan, honor, perjalanan_dinas, pemeliharaan) |
| `test-lpj-panel` | 23 asersi: cabang side/stack, gate (2 mode), infoOnly ×3, comingSoon |
| `test-lpj-guard` | 24 asersi: 11 baris matriks guard (4 dapat tab, atk/penggandaan/cetak_foto/tagihan/undefined/kosong tidak) + render `BKUSidebarLpj` (toolbar, tombol Simpan aktif/mati, preview selalu tampil, entri tersimpan tampil) |
| `test-lpj-sidebar` | **47 asersi** (setelah revisi UI): 4 kategori LPJ (tab `Dokumen LPJ` ada · tab `>Detail<` TIDAK ada · urutan tab sebelum Dokumentasi · panel full-width · form + preview ter-render · baris badge kelas lama tidak ada) · 9 tipe non-LPJ (sempit `max-w-xl`, tanpa tab LPJ) · prev/next · E-6 NoBukti sama → dominan grup |
| `test-lpj-store` | 18 asersi: round-trip, dua NoBukti terpisah, tolak NoBukti kosong (storage tak bertambah), data rusak → `null`, hapus satu entri |
| `test-lpj-fieldwajib` | 30 asersi: wajib dari config, `defaults` dikecualikan, `0` = terisi, `rows []` vs `[{}]`, meta key dikecualikan |

---

## 6. BELUM / UNTESTED (jujur — perlu uji manual xcode di browser)

Daftar lengkap + sinkron dengan `ACCEPTANCE.MD` §7 (10 butir). Ringkas:

1. Semua interaksi nyata (klik baris, ketik, ganti tab, Simpan, cetak) — butuh **data BKU nyata**
   (unggah BKU PDF/Excel), tidak bisa dibuat fixture di repo.
2. Tab otomatis terbuka di **Dokumen LPJ** saat baris belanja diklik (efek reset tidak berjalan di SSR).
3. Banner peringatan **hilang tanpa reload** saat field terakhir diisi.
4. Cetak `window.print` + orientasi landscape + area `.sk-print-area`.
5. `sorotPelanggaran` saat tombol **Cek** ditekan.
6. Screenshot AF-01…AF-06 (4 kategori + 1 non-LPJ).
7. Simpan → **reload** → isian masih ada (`spj_lpj_bku` bertahan).
8. Grup se-NoBukti **lintas kategori** dengan data nyata (dominansi + peringatan).
9. **Penilaian mata xcode atas tampilan revisi UI** (header solid + tab underline; sidebar nav
   tanpa glassmorph). Struktur/kelas sudah dikunci oracle + computed-style sudah dibuktikan;
   yang belum adalah apakah hasilnya terasa "premium" bagi xcode.
10. **Keputusan terpisah yang BELUM diambil:** menghapus tab "Detail" juga untuk baris
    **non-LPJ** (kini hanya dihapus untuk baris LPJ).

---

## 7. Langkah Berikutnya

1. ~~xcode uji manual di browser (butir §6)~~ — **sprint ditutup 2026-10-21**; item §6 diterima
   sebagai sisa dan dicatat di `STATE.MD` (bukan "lulus").
2. ~~`/acceptance-runner` konteks segar~~ — tidak dijalankan; gate sudah dikutip apa adanya di §3.
3. ~~Hapus skrip uji~~ — **SELESAI**: 9 berkas `spj-frontend/test-lpj-*` dihapus, cadangan di
   `.workbuddy-ai/backup-sprint017-tests/`. Build final pasca-hapus: **✓ built in 12.62s**.
4. Commit perubahan sprint (rencana commit disusun saat penutupan, menunggu persetujuan user).

---

**MULAI:** TASK GATE G-0 dijalankan.
**SELESAI:** G-0…G-6 hijau + 7 oracle exit 0 + §4/§6 ditulis jujur. **Belum** selesai: §6 (browser manual).
