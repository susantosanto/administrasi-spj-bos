# RISET MENDALAM: Fitur Utama Generate Foto Dokumentasi AI — Status, Gap, Arah

- Tanggal: 2026-11-02 · Sifat: RISET (0 kode diubah)
- Metode: baca kode riil + `KEPUTUSAN-DIKUNCI.MD` (sprint-022, LOCKED) + RISKS.MD + STATE.MD + pack sprint-020
- Sumber kebenaran fitur AI: `planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD` (22 keputusan beku D-01..D-22, 9 gate G-1..G-9, 10 larangan)

## 1. Satu kalimat

Fitur generate foto dokumentasi AI adalah **fitur inti yang sudah dibangun di jalur demo (Puter.js User-Pays, tanpa API key)** tetapi **belum pernah lolos uji visual dengan akun nyata** (RISKS.MD Tinggi: T-03/T-04 UNTESTED), sementara **jalur produksi yang sudah diputuskan & dikunci (BFL FLUX 3 Klein → eskalasi FLUX 3 Image, face gate, kuota, log biaya, label ILUSTRASI AI) belum diimplementasikan sama sekali** — semua gate G-1..G-9 masih kosong.

## 2. Yang SUDAH ada di kode (terverifikasi grep, bukan klaim)

### 2.1 Mesin generate (`src/services/imageGenerator.js`)
- 🟢 AKTIF: `generateWithPuter(prompt, inputImages)` — panggilan riil `puter.ai.txt2img`, `ratio 4:3`, `quality 'high'` (default docs 'low' bikin wajah tidak mirip — sudah diperbaiki Sprint 020-revisi).
- Image-to-image: maks 3 input images (wajah personel + owner warung/toko + foto ruangan; ruangan terakhir = latar).
- 🔴 FUTURE (hanya blok komentar): Flux Pro via fal.ai — `case 'bfl'` yang diwajibkan G-1 **belum ada**; switch provider jatuh ke `generateWithPuter`.
- Fallback: canvas placeholder HANYA saat Puter gagal, wajib berlabel "placeholder" di UI (bukan diam-diam).

### 2.2 Orkestrasi UI (`src/components/dokumentasi/DokumentasiAIGenerate.jsx`, ±686 baris)
- Set foto per aktivitas (konsep rev2 terkunci): mamin = penyerahan/rapat/box (3 slot); atk = penyerahan/rapat/atk_beli (3 slot); default = rapat (1 slot). Tiap slot = 1 panggilan AI.
- Prompt per slot eksplisit peran: "owner (wajah sesuai referensi TERAKHIR) menyerahkan X kepada guru Y", "SEMUA guru yang disebut HARUS tampak", fallback anti-foto-tanpa-wajah (`orangTerpakai` → guru pertama berfoto).
- `butuhRuang: true` → foto ruangan (lokal per transaksi `spj_ruang_lokal` → global `ruangan_photos` → null) dikirim sebagai latar; prompt "latar HARUS persis sesuai foto ruangan terlampir".
- Generate Semua (sekuensial + progres), tombol Stop (guard `batalRef`+`genIdRef`, in-flight dibuang), regenerate menimpa (bukan duplikat), upload manual per slot + owner.

### 2.3 Multi-akun Puter + rotasi (`src/services/puterAkun.js` + `PuterAkunManager.jsx`)
- Masalah nyata yang dipecahkan: kuota gratis Puter habis → HTTP 402 `insufficient_funds`.
- `generateDenganRotasi`: coba akun aktif → kena kuota → tandai `habisAt` → pindah akun berikutnya → info rotasi di UI. Dialog "Low Balance" bawaan puter.js disupresi (MutationObserver). Tab "Akun AI" di Pengaturan (tambah/hapus/aktifkan akun, popup sign-in dipulihkan bila dibatalkan).
- Bukti uji (STATE 2026-10-24): probe rotasi 13/0, kontrol HTTP 500 tidak rotasi.

### 2.4 Status verifikasi
- Jalur kode + jalur gagal: TERVERIFIKASI dinamis (intercept Playwright, token palsu): kontrak request benar (`ai-image/generate`, `input_images`, `quality high`), Stop benar, placeholder berlabel benar.
- Hasil visual RIIL (wajah mirip, latar ruangan, owner menyerahkan): **UNTESTED** — butuh akun Puter sungguhan; browser agent dilarang login akun user (AGENTS.MD).

## 3. GAP vs KEPUTUSAN-DIKUNCI (sprint-022) — inti temuan riset

| Gate | Wajib | Status kode | Gap |
|---|---|---|---|
| G-1 | `case 'bfl'` ada, `case 'puter'` tetap | ❌ bfl tidak ada | Seluruh adapter BFL/fal belum ditulis |
| G-2 | Kunci API di main process (Electron safeStorage), bukan VITE_* | ❌ app masih web React murni | Butuh cangkang Electron (Sprint 021 baru tahap planning PRD migrasi) |
| G-3 | Log `cost/input_mp/output_mp/model/face_score` | ❌ tidak ada | Tabel `log_ai` ikut migrasi SQLite |
| G-4 | Face gate lokal (ArcFace ONNX, cosine ≥0,45, retry maks 2) | ❌ tidak ada | Eskalasi model & retry belum ada |
| G-5 | Kuota 60 foto/sekolah/tahun + cap $50/bulan | ❌ tidak ada (Puter = kuota akun pribadi) | Pagar biaya produksi |
| G-6 | Label cetak "ILUSTRASI AI" + `is_ai=1` | ❌ tidak ada di kode | **Risiko audit + UU PDP** — foto sintetis tanpa label = risiko bukti palsu |
| G-7 | 0 diff templateConfig/blok cetak | ✅ (belum disentuh fitur AI) | — |
| G-8 | Build hijau + oracle PASS | ✅ build hijau; oracle AI = probe Sprint 020 | — |
| G-9 | A/B 50 foto sebelum pilih model final | ❌ belum (butuh kredit $10 + akun BFL) | Keputusan D-06 bergantung ini |

**Kesimpulan gap:** keputusan produksi (D-01..D-22) mengunci **arsitektur Electron+BFL**, sedangkan yang hidup sekarang adalah **MVP web+Puter**. Keduanya tidak bertentangan — Puter = jalur demo gratis (D-12 memisahkan demo & produksi), tapi **fitur ini belum bisa dinyatakan "produksi"** sampai: (a) uji visual Puter lolos (murah, sekarang), atau (b) pipeline BFL dibangun (butuh Electron + top-up + A/B).

## 4. Risiko (RISKS.MD + analisis baru)

1. **[Tinggi, tercatat]** Hasil visual UNTESTED → mitigasi: uji manual user akun Puter (T-03/T-04).
2. **[Tinggi, tercatat]** API key AI terekspos client → relevan hanya saat BFL dibangun; MVP Puter tanpa key (User-Pays) justru aman untuk demo.
3. **[Baru, Sedang]** Rotasi multi-akun Puter = workaround kuota; untuk 200 sekolah produksi tidak scale (tiap operator butuh banyak akun gratis) — reinforces D-01 (provider API berbayar) untuk produksi.
4. **[Baru, Tinggi bila produksi tanpa G-6]** Foto AI tanpa label "ILUSTRASI AI" dipakai sebagai bukti LPJ → risiko ditolak auditor / dianggap pemalsuan bukti + isu data biometrik wajah guru (UU PDP). Jalur upload foto asli harus tetap utama (D-17).
5. **[Baru, Rendah]** `resizeImage` tanpa `onerror` (imageGenerator.js) → upload gambar rusak menggantung tanpa pesan (catatan Sprint 020, belum difix).

## 5. Biaya (angka terkunci 31 Okt 2026, kurs Rp 18.100)

- Demo sekarang: **Rp 0** (Puter User-Pays, kuota gratis per akun, rotasi bila habis).
- Demo terkunci berikutnya: top-up **$10 = Rp 187.000** → Klein ±740 foto; rencana A/B 400 foto selesai $5,40 (sisa 46%).
- Produksi 200 sekolah/tahun (7.200 foto, 10.800 panggilan): **Rp 4,51–9,38 jt + PPN** (routing Klein→FLUX 3 Image). Self-host GPU ditolak (31× lebih mahal, impas ±860 sekolah).

## 6. Idea Brief (format idea-clarifier)

```markdown
# Idea Brief: Generate Foto Dokumentasi AI — dari Demo Puter ke Produksi BFL

## One-Liner
Bendahara sekolah yang tidak sempat memotret kegiatan mendapat ilustrasi foto
dokumentasi (rapat/serah terima/nasi box/ATK) yang jujur berlabel AI, dari foto
wajah+ruangan yang diupload — demo gratis via Puter, produksi terkontrol biaya via BFL FLUX.

## Users
- Primary: bendahara/operator 1–2 orang per sekolah (target 200–700 sekolah), non-teknis.
- Secondary: kepala sekolah (periksa dokumen); auditor (melihat label ILUSTRASI AI).

## Core Problem
Tanpa fitur ini: dokumen LPJ tanpa foto kegiatan → tidak lengkap saat audit.
Dengan fitur ini tapi tanpa pagar (label, kuota, log): biaya tak terkendali +
risiko foto AI dianggap bukti palsu.

## Success Criteria
- [ ] Demo: uji manual T-03/T-04 lolos — wajah guru terpilih tampak & mirip referensi,
      latar = foto ruangan terupload, slot penyerahan menampilkan owner+guru (akun Puter nyata).
- [ ] Produksi: G-1..G-9 hijau — BFL adapter, face gate ≥0,45 retry≤2, kuota 60/thn,
      cap $50/bln, log_ai per panggilan, label ILUSTRASI AI tercetak, A/B 50 foto.
- [ ] Biaya produksi 200 sekolah ≤ Rp 10,4 jt/tahun termasuk PPN (angka terkunci).
- [ ] Kegagalan API tidak pernah diam-diam → pesan + tombol unggah foto asli (D-18).

## Constraints
- Technical: MVP web React + localStorage SEKARANG; BFL butuh Electron main-process
  (kunci API, net.fetch CORS) — tergantung Sprint 021 (migrasi Electron+SQLite, baru planning).
- Business: anggaran demo terkunci $10; kartu Mandiri Visa/Mastercard untuk BFL (D-21).
- Compliance: D-17 label AI wajib; UU PDP (wajah = biometrik); larangan-larangan KEPUTUSAN-DIKUNCI §4.

## In Scope
- (Fase 1, murah) Uji visual demo Puter oleh user + fix temuan + label "AI" di UI preview.
- (Fase 2, produksi) Adapter BFL/fal + face gate + kuota + log_ai + label cetak + A/B 50 foto —
  SETELAH cangkang Electron tersedia.

## Out of Scope
- Self-host GPU; FLUX.2 [pro] sebagai default; resolusi 2K/4K; kunci di VITE_*;
  auto top-up demo; mengubah template cetak (D-22); menjadikan foto AI pengganti
  foto asli (upload foto asli tetap jalur utama).

## Risks
- Produksi tanpa Electron → kunci API bocor → tunda Fase 2 sampai Sprint 021 jalan.
- Foto AI tanpa label lolos ke auditor → G-6 wajib sebelum rilis produksi.
- Kuota Puter tidak scale untuk 200 sekolah → rotasi akun hanya solusi demo.

## Assumptions
- Puter.js tetap tersedia gratis untuk demo (User-Pays).
- Harga BFL 31 Okt 2026 masih berlaku saat Fase 2 (cek ulang bila lewat).
- Sprint 021 (Electron+SQLite) adalah prasyarat Fase 2.
```

## 7. Pertanyaan untuk user (menentukan arah, tidak mengarang)

1. **Fokus sekarang:** (a) tuntaskan uji visual demo Puter dulu (user login akun Puter, jalankan T-03/T-04, saya dampingi + fix temuan) — Rp 0; atau (b) langsung siapkan Fase 2 produksi BFL (butuh Electron/Sprint 021 + top-up $10 + kartu Mandiri Visa/MC)?
2. **Label AI di demo:** G-6 (label cetak "ILUSTRASI AI") saat ini hanya diwajibkan untuk produksi. Mau ditarik maju ke demo sekarang (chip "AI" di preview sudah ada; label di dokumen cetak belum)? — rekomendasi: YA, murah dan menutup risiko audit lebih awal, tapi menyentuh area cetak = butuh persetujuan eksplisit (D-22 melarang ubah template demi AI; menambah label = perubahan yang harus Anda setujui).
3. **Prioritas fix kecil:** `resizeImage` tanpa onerror (upload gambar rusak menggantung) — ikut diperbaiki sekarang?
