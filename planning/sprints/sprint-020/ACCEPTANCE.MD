# ACCEPTANCE — Sprint 020: Generate Foto Dokumentasi AI Sungguhan

> Format Given/When/Then. Verdict per butir: PASS / FAIL / UNTESTED dengan bukti nyata.
> Prasyarat lingkungan: internet aktif; untuk T-03/T-04 butuh akun Puter gratis (sign-in
> saat pemakaian pertama — bagian dari pengujian, lihat T-02).

## T-01 — Build & gate statik
**Given** kode Sprint 020 selesai ditulis.
**When** `npm run build` dijalankan dan grep gate G-1…G-5 dieksekusi.
**Then** build exit 0; semua gate 0 diff / 0 hit sesuai BLUEPRINT §5.

## T-02 — Sign-in Puter pemakaian pertama
**Given** browser profil bersih (belum pernah sign-in Puter).
**When** tombol "Generate Foto" ditekan.
**Then** popup sign-in Puter muncul (atau generate jalan tanpa popup — catat perilaku
aktualnya); setelah sign-in akun gratis, generate lanjut; 0 console error yang tidak
tertangani. Perilaku aktual dicatat sebagai bukti (V-4).

## T-03 — Generate foto riil text-to-image (tanpa personel dipilih)
**Given** Langkah 3 tidak memilih orang mana pun.
**When** "Generate Foto" ditekan.
**Then** dalam ≤60 detik muncul **foto kegiatan riil** (bukan canvas gradient/emoji 🏫)
di daftar "Foto AI di Panel Preview" DAN sebagai dokumen "Dokumentasi Foto Kegiatan"
di Panel Preview; figcaption & print twin 210mm berisi img foto itu.

## T-04 — Image-to-image: wajah personel masuk foto
**Given** ≥1 foto personel terupload (Data Sekolah → Tab Foto Personel) dan 1 orang
dipilih di Langkah 3.
**When** "Generate Foto" ditekan.
**Then** foto hasil = image-to-image (input image terkirim — bukti via network/console
atau hasil visual berbeda dari T-03); foto masuk Panel Preview seperti T-03.
Catatan jujur: kemiripan wajah dinilai user, bukan gate.

## T-05 — Regenerate & multi-orang
**Given** 1 foto AI sudah ada; >1 orang dipilih.
**When** regenerate foto itu.
**Then** foto lama tertimpa (bukan duplikat); perilaku multi-input sesuai keputusan V-5
(dicatat di BUILD-REPORT); 0 console error.

## T-06 — Fallback jujur saat gagal
**Given** koneksi ke Puter diblokir (DevTools → Network → block `js.puter.com`/`api.puter.com`)
atau sign-in dibatalkan.
**When** "Generate Foto" ditekan.
**Then** pesan error tampil di kotak error; bila fallback canvas dijalankan, foto
placeholder diberi label jujur (meta `fallback: true` terlihat di daftar foto); aplikasi
tidak crash; 0 unhandled console error.

## T-07 — Regresi alur foto Sprint 019 revisi
**Given** Sprint 020 selesai.
**When** alur foto diuji ulang ringkas: upload foto manual → tampil di Panel Preview;
ganti baris BKU → foto reset; cetak panel → print twin foto ikut.
**Then** semua perilaku Sprint 019 revisi tetap identik (G-3 0 diff adalah bukti statiknya).

## T-08 — Dokumentasi
**Then** `STATE.MD` + pack sprint ini (checklist + BUILD-REPORT.MD berisi V-1…V-5 +
verdict T-01…T-07) diperbarui sebelum sprint dinyatakan selesai.

---

## HASIL EKSEKUSI (2026-10-23) — verdict + bukti ringkas
| Uji | Verdict | Bukti (rincian di BUILD-REPORT.MD §4–§5) |
|---|---|---|
| T-01 | **PASS** | build `✓ built in 6.17s` exit 0; G-1…G-4 0 diff (`git diff --stat` kosong); G-5 1 hit = komentar bersejarah Sprint 019 (dikecualikan); G-6 ✓ |
| T-02 | **PASS** | popup `puter.com/?embedded_in_popup=true&request_auth=true` terbuka → form Log In + "Create Free Account"; 0 unhandled console error |
| T-03 | **UNTESTED** | butuh akun Puter sungguhan (browser agent dilarang login akun user; pembuatan akun = keputusan user); jalur kode terverifikasi statis (`AI.js` → `driverCall_` → blob → `.src`), jalur gagal terverifikasi dinamis (T-06) |
| T-04 | **UNTESTED** | alasan sama T-03; `input_images` terverifikasi statis (`imageGenerator.js:111-113`) + V-1/V-5 |
| T-05 | **PASS** | regenerate: label "Regenerate Foto" + "Batal Regenerate" (mode edit); foto DITIMPA — daftar tetap 1 item, bukan duplikat |
| T-06 | **PASS** | stub txt2img throw → pesan "Foto placeholder dibuat sebagai cadangan (AI tidak tersedia)" + chip `placeholder` di daftar (`fallback:true`); tidak crash; 0 console error |
| T-07 | **PASS** | upload manual → Panel Preview (data-img 4→7); foto AI 1024×768 tampil; 0 console error |
| T-08 | **PASS** | STATE.MD + BUILD-REPORT.MD + checklist ini diperbarui |

## HASIL EKSEKUSI TAMBAHAN (2026-10-24) — revisi foto ruangan + intercept end-to-end
| Uji | Verdict | Bukti (rincian BUILD-REPORT.MD §5a) |
|---|---|---|
| T-09 Revisi ruangan (kode) | **PASS** | `ruangImage` digabung ke `input_images` (`imageGenerator.js:296-297`); UI Langkah 2 "Foto ruangan terpakai"/"belum diupload" (tersembunyi saat outdoor); build `✓ built in 9.14s`; gate file tabu 0 diff. Deviasi sadar: `DokumentasiAIGenerate.jsx` 364 brs (batas +40 terlampaui — fitur baru dari user) |
| T-10 Jalur sukses end-to-end (intercept) | **PASS** | Token palsu + `page.route('/drivers/call')` → request riil keluar: `interface=puter-image-generation, driver=ai-image, method=generate, args={ratio:{w:4,h:3}, input_images, prompt}`; fulfill PNG → "Foto masuk ke…" + **0 chip placeholder** — tanpa akun Puter |
| T-11 `input_images` = wajah + ruangan | **UNTESTED (manual user)** | Intercept terakhir hanya 1 input (foto ruangan) — skrip test salah centang (checkbox pertama = filter kategori BKU, bukan checkbox orang) → `faceImages=[]`. Kode app benar; verifikasi 2 input images = bagian uji manual user |
| T-03/T-04 (foto riil akun sungguhan) | **UNTESTED (manual user)** | Keputusan user: testing dilakukan manual oleh user |

**Keputusan yang menunggu user:** terima T-03/T-04 UNTESTED (uji mandiri dengan akun
Puter gratis — hasil foto dinilai mata user), atau minta putaran uji lanjutan.
Commit/push = kuasa user.

## HASIL EKSEKUSI TAMBAHAN (2026-10-24, sesi 2) - Fix kualitas+referensi, Stop, Owner

| ID | Kriteria | Verdict | Bukti |
|----|----------|---------|-------|
| T-12 | `quality:'high'` terkirim ke driver | **PASS** | Intercept: `args.quality='high'` (default docs = 'low') |
| T-13 | Instruksi referensi eksplisit di prompt saat ada input images | **PASS** | Intercept: prompt memuat "WAJIB memakai gambar referensi terlampir..." |
| T-14 | 3 input images urutan benar (wajah, owner, ruangan) | **PASS** | Intercept: `nInputImages=3`, jenis `[jpeg, jpeg, png(ruangan)]` |
| T-15 | Tombol Stop Generate muncul saat generating | **PASS** | DOM: tombol "Stop Generate" menggantikan Generate saat `isGenerating` |
| T-16 | Klik Stop - loading hilang + pesan batal + hasil tidak disimpan | **PASS** | Klik Stop: `isGenerating=false` instan, pesan "dibatalkan...tidak disimpan", tombol Generate kembali; 6 dtk kemudian TIDAK ada foto masuk belakangan |
| T-17 | Upload foto owner (mamin/atk) - slot per aktivitas | **PASS** | Langkah 4 "Foto Owner Warung Makan / Katering" tampil utk aktivitas mamin; thumbnail + Ganti/Hapus; owner terkirim sbg input image ke-2 |
| T-18 | Popup auth Puter terbuka dari gesture klik (regresi fix auth) | **PASS** | Klik Generate tanpa sign-in - tab puter.com `request_auth` muncul |
| T-03/T-04 | Foto riil akun Puter sungguhan (wajah mirip) | **UNTESTED** | Uji manual user (keputusan user); kini bergantung quality high + instruksi referensi |

## HASIL EKSEKUSI TAMBAHAN (2026-10-24, sesi 3) - Set Foto per Kegiatan & Generate Semua + Stop

| ID | Kriteria | Verdict | Bukti |
|----|----------|---------|-------|
| T-19 | Generate per-slot set foto (penyerahan, rapat, box/produk) | **PASS** | Slot penyerahan: `nInput=2` (wajah + owner); slot rapat: `nInput=2` (wajah + png ruangan) + prompt rapat khusus; slot box: `nInput=0` (text-to-image murni) + prompt produk box; semua foto masuk ke daftar foto AI per slot |
| T-20 | Generate Semua Foto (berurutan) + Stop di tengah | **PASS** | Klik "Generate Semua Foto (3)" → progress UI "Foto 1/3 — Foto Penyerahan..." tampil → klik "Stop Generate" → `isGenerating=false` instan, pesan "Generate dibatalkan — foto tidak disimpan" tampil, tombol Semua kembali. Guard membuang hasil call yang tertunda (0 foto AI masuk ke DOM, 0 pesan sukses bocor), slot berikutnya tidak dijalankan (hanya 1 call terkirim). |
