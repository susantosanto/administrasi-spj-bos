# BUILD-REPORT — Sprint 006: Autogen Semua Tab Mamin

Branch: `feat/sprint-005-autogen` (Pilihan B — 005 ikut kebawa, JANGAN commit/push).
Builder selesai 2026-10-03 (statik). Pack: `planning/sprints/sprint-006/`
(REQUIREMENTS + BLUEPRINT + ACCEPTANCE + HANDOFF-PROMPT).
Dry run + pecah `aturanMamin.js` disetujui. Aturan: 0 dependency baru, BLUE-ONLY,
A4-mm, prefix spj_, cetak formal tak tersentuh, SELALU TIMPA hanya via BKU + snapshot.

## File (1 baru + 4 ubah src; E reuse-005 tanpa ubah kode)

| Task | File | Perubahan | Bukti |
|---|---|---|---|
| A.1 | `src/utils/aturanMamin.js` BARU 132/200 | templatePesananMamin (perihal + isi "Bersamaan … sehubungan … kegiatan X" + Hari/tanggal + jenis + jumlah Box + pesananRows; tak cocok = "" + []) | node F1 + T-03 jujur OK |
| A.2 | `src/utils/bkuKategori.js` | prefillDariBKU(bku, menu, formData, subId=''); subId 'kegiatan' menang atas parser → jalur pesanan bawa uraian/kegiatan/tanggal/noBukti | grep pesanan = 2 OK |
| A.3 | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | input Perihal (gap 0-hit) + placeholder isi dari baku (BKU-gated); SPJ terapkan template ke tambahan | grep templatePesananMamin: util 1 + render 2 OK |
| B.1 | `src/utils/aturanMamin.js` | templateDaftarHadir (acara + judulDaftarHadir + rows NAMA/JABATAN dari GTK, TTD/TTD2 kosong, id = nip/nuptk/nama) | node F2 OK |
| B.2 | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | toggle peserta mamin via templateDaftarHadir (bentuk baris seragam); SPJ isi rows + judulDaftarHadir dari GTK | grep templateDaftarHadir: re-export + 2 pakai OK |
| C.1 | `src/utils/aturanMamin.js` | templateBukuTamu (Hari/Tanggal + Tujuan/Uraian + Diterima default Kepala Sekolah; identitas rows [] jujur) | node F3 OK |
| C.2 | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | placeholder Tujuan dari baku (BKU-gated); SPJ isi tambahan.bukuTamu; editor identitas/tiba/kembali existing | grep templateBukuTamu: re-export + 2 pakai OK |
| D.1 | `src/utils/aturanMamin.js` | lengkapiNotulen (9 identitas: hari/tanggal/waktu/tempat/acara/pimpinan/notulen/peserta/pesertaJumlah; pembuka milik draf 005) | node F4 OK |
| D.2 | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | placeholder Tempat dari baku (BKU-gated); SPJ isi 9 identitas (tempat default nama sekolah, peserta dari rows hadir) | grep lengkapiNotulen: re-export + 2 pakai OK |
| E.1 | reuse 005 (tanpa ubah kode) | snapshot SELURUH form SEBELUM timpa — Object.keys(tambahan) otomatis mencakup field baru A–D | grep spj_otomatis_snapshot = 3 OK |
| E.2 | reuse 005 (tanpa ubah kode) | badge "dari BKU … N ditimpa (bisa Urungkan)" + Urungkan + toast berlaku semua tab (generik) | grep Urungkan ≥ 6 OK |
| F.1 | gate | 15 pola anti-hardcode = 0 · fetch/AI di 2 util = 0 · blue-only tambah 0 · diff warisan (blocks/templateConfig/TemplateEngine) kosong · util 132 + 148 ≤ 200 | OK |
| F.2 | gate | build exit 0 ×2 (final 7.89s) · STATE.MD + pack updated · tanpa commit/push | OK |

## Build (T-01)

`cd spj-frontend && npm run build` → exit 0, `✓ built in 7.89s` (final; pertama 16.98s).

## Node (T-03 + F1–F4)

`node -e import aturanMamin` → 4 exports + default OK.
T-03 `{acara:'',tanggal:'xx'}` → perihal/hari/jenis/jumlah "" + rows [] (isi = kalimat baku + "...").
F1 snack-50-box → perihal "Surat Pesanan …", hari "Jumat 12 Juni 2026", jenis "Snack Box", jumlah "50", 1 row.
F2 orang campur (1 tanpa nama) → 1 row {nama, jabatan, ttd:'', ttd2:''}.
F3 → tanggal "Jumat, 12 Juni 2026", diterima "Kepala Sekolah", rows [], tujuan = uraian.
F4 → 9 identitas terisi kecuali waktu "" (tanpa sumber BKU — jujur).

## Deviasi tercatat (sadar, bukan diam-diam)

1. `pembuka` = kalimat baku draf 005 ("Rapat membahas dan menyimpulkan…") — ACCEPTANCE T-06
   menang atas "pembuka dari pejabat" (REQUIREMENTS D); satu key `pembuka` di templateConfig.
2. `waktu` = "" — tanpa sumber di BKU; `tempat` default nama sekolah via getSchoolData()
   (fallback ""), sesuai "tempat default sekolah".
3. A.2 node-test langsung bkuKategori terhalang import extensionless warisan
   (`'./storageHelper'` tanpa `.js` — bukan dari sprint ini); vite build lolos; logika 1 baris + build + grep.
4. C.2/D.2 di editor = placeholder-hint BKU-gated (non-destruktif) + input Perihal (gap nyata);
   tidak ada tombol/fitur baru — render editable utama milik form existing + prefill SPJ.

## UNTESTED (ke /acceptance-runner konteks segar)

T-02/T-04/T-05/T-06/T-07 screenshot per tab (sebelum/sesudah/undo), E-1 buka-ulang semua tab,
C-08 final. Browser tidak dibuka di sesi ini.
