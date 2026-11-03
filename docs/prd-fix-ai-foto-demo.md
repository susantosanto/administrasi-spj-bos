# PRD: Fix Fitur Generate Foto Dokumentasi AI — Fase Demo (Pra-Top-Up)

- Status: DRAFT (menunggu konfirmasi user)
- Tanggal: 2026-11-02
- Sumber: Idea Brief `docs/RESEARCH-FITUR-AI-FOTO-DOKUMENTASI-2026-11.MD` §6 + keputusan user "fix dulu sebelum top up"
- Biaya: **Rp 0** — semua perbaikan jalur demo Puter.js, tanpa top-up BFL
- Mengikat: `planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD` (D-17, D-18, D-19, D-22)

## 1. Problem Statement

Fitur generate foto dokumentasi AI (demo, Puter.js User-Pays) sudah dibangun dan jalur
kode-nya terverifikasi (Sprint 020 + rotasi multi-akun), tetapi:

1. **Bug menggantung:** `resizeImage()` di `imageGenerator.js:374` tidak punya
   `img.onerror` — upload gambar rusak/berformat aneh menggantung SELAMANYA tanpa pesan
   (temuan Sprint 020, belum difix). Owner/ruangan/wajah yang gagal resize membuat
   tombol Generate tampak macet.
2. **D-18 belum diaudit menyeluruh:** keputusan terkunci melarang kegagalan API diam-diam;
   setiap jalur gagal wajib pesan jelas + mengarahkan ke "unggah foto asli". Jalur kuota
   sudah ada pesannya; jalur lain (network, moderation, upstream_failed, token kedaluwarsa)
   perlu diaudit + diseragamkan.
3. **State loading bisa nyangkut:** bila generate dilempar error di titik tak terduga
   (atau Stop ditekan saat resize), indikator loading/slot aktif berpotensi tidak bersih.
4. **RISKS.MD Tinggi belum bisa ditutup:** hasil visual UNTESTED — perlu skenario uji
   manual T-03/T-04 yang siap dijalankan user dengan akun Puter GRATIS (bukan top-up).

Tanpa fix ini: user demo mengalami "aplikasi macet tanpa pesan", dan risiko Tinggi
di RISKS.MD tidak punya jalur penutupan yang terstruktur.

## 2. Goals (SMART)

1. Upload gambar rusak → error tampil ≤ 2 detik, pesan Indonesia jelas, tidak ada
   loading nyangkut (sebelumnya: menggantung selamanya).
2. 100% jalur gagal generate (kuota, network, moderation, upstream, auth) menghasilkan
   pesan Indonesia + foto TIDAK pernah muncul tanpa label; jalur "unggah foto asli"
   selalu terlihat saat gagal (audit D-18 = 0 temuan).
3. Setelah Stop/error, state UI bersih: tidak ada slot berstatus "generating", tombol
   Generate kembali aktif (probe Playwright).
4. Paket uji manual T-03/T-04 tertulis (skenario + langkah + kriteria terima per slot)
   sehingga user bisa menutup risiko Tinggi RISKS.MD dengan akun Puter gratis dalam
   1 sesi ±15 menit.
5. Build `npm run build` exit 0; seluruh probe existing Sprint 020 tetap PASS (0 regresi).

## 3. Users

- Bendahara/operator sekolah (demo): mengupload foto wajah/ruangan/owner, menekan
  Generate, harus selalu tahu apa yang terjadi (sukses/gagal/menunggu).
- User pemilik akun Puter gratis: menjalankan uji visual T-03/T-04.

## 4. User Stories

### US-1 Upload gambar rusak ditolak dengan jelas
Sebagai operator, saya mengupload foto owner/ruangan/wajah yang rusak (atau format tak
didukung), supaya saya langsung tahu file ditolak — bukan tombol Generate macet.

Acceptance Criteria:
- [ ] `resizeImage` punya `onerror` + timeout (maks ±5 dtk) → reject dengan Error berpesan Indonesia
- [ ] UI upload (owner, ruangan lokal, slot) menampilkan toast/pesan gagal + file lama tidak tertimpa
- [ ] Upload file valid tetap berperilaku identik (regresi 0)

### US-2 Kegagalan generate selalu berbicara (D-18)
Sebagai operator, setiap kegagalan generate memberi pesan yang saya pahami + jalan keluar.

Acceptance Criteria:
- [ ] Audit semua cabang catch di `DokumentasiAIGenerate.jsx` + `imageGenerator.js`:
      kuota 1 akun, kuota semua akun, network/offline, moderation_flagged,
      upstream_failed, auth/token kedaluwarsa, error tak dikenal
- [ ] Tiap cabang: pesan Indonesia spesifik (bukan error provider mentah), tanpa placeholder diam-diam
- [ ] Saat gagal, CTA "Unggah foto" (jalur foto asli) terlihat di slot yang gagal
- [ ] Chip "placeholder" hanya muncul untuk canvas fallback yang memang berlabel (Sprint 020)

### US-3 Stop/error tidak meninggalkan loading nyangkut
Sebagai operator, setelah saya menekan Stop atau terjadi error, UI kembali siap dipakai.

Acceptance Criteria:
- [ ] `slotAktif` dibersihkan di finally semua jalur (sukses/gagal/stop)
- [ ] Progres "Generate Semua" berhenti dan tombol kembali normal setelah error di slot mana pun
- [ ] Stop saat fase resize/upload tetap membersihkan state (tidak menunggu promise menggantung)

### US-4 Paket uji visual siap pakai
Sebagai user dengan akun Puter gratis, saya mendapat panduan uji T-03/T-04 yang jelas
seharga satu sesi, dengan kriteria terima objektif per slot.

Acceptance Criteria:
- [ ] Dokumen `planning/sprints/sprint-026/PANDUAN-UJI-VISUAL.MD`: prasyarat (data guru
      berfoto, ruangan terupload, 1 transaksi mamin + 1 atk), langkah per slot, kriteria
      terima (wajah guru terpilih tampak & mirip referensi; latar = foto ruangan; slot
      penyerahan = owner menyerahkan ke guru; tidak ada orang imajiner), tangkapan layar wajib
- [ ] Hasil uji dicatat user → risiko Tinggi RISKS.MD bisa ditutup/diperbarui berbasis bukti

## 5. Functional Requirements

- FR-1 `resizeImage`: tambah `img.onerror` + `Promise.race` timeout; reject Error
  berpesan "Gambar tidak dapat dibaca (rusak atau format tidak didukung)".
- FR-2 Pemanggil `resizeImage` (upload owner, ruangan lokal, wajah) menangkap reject →
  toast error + tidak menyimpan dataUrl kosong.
- FR-3 Normalisasi pesan error AI: satu fungsi pemeta (kode/mesin → pesan Indonesia),
  dipakai semua catch; pesan tak dikenal → generik ramah + saran unggah foto asli.
- FR-4 State bersih: `setSlotAktif(null)` + hentikan progres di `finally`; `genIdRef`
  guard tetap (Sprint 020) — Stop mengalahkan hasil in-flight.
- FR-5 CTA gagal: saat slot gagal, tampilkan tombol "Unggah foto" di slot tersebut
  (komponen sudah ada untuk jalur upload — dipakai ulang).
- FR-6 Dokumen panduan uji visual (US-4). Tidak ada perubahan perilaku cetak.

## 6. Non-Functional Requirements

- Kinerja: timeout resize ≤ 5 dtk; tidak menambah delay jalur sukses.
- Regresi: probe existing Sprint 020 (rotasi 13, pengaturan akun 11, konsep rev2 47 bila
  runnable) tetap PASS; `npm run build` exit 0.
- Kepatuhan: D-17 (label jujur), D-18 (tanpa placeholder diam-diam), D-19 (prompt positif —
  tidak mengubah prompt), D-22 (0 diff `templateConfig.js` + blok cetak).
- Warna: BLUE-ONLY + slate; tanpa dependensi baru.

## 7. Success Metrics

| Kriteria Brief | Metrik | Target |
|---|---|---|
| Tidak ada macet diam-diam | Uji upload gambar rusak (Playwright) | Error ≤ 2 dtk, 0 hang |
| D-18 patuh | Audit cabang catch | 0 temuan |
| State bersih | Probe Stop/error | slotAktif null, tombol aktif |
| Risiko visual tertutup | Uji manual T-03/T-04 oleh user | Semua slot dinilai + bukti screenshot |
| Tanpa regresi | Probe Sprint 020 + build | Semua PASS, exit 0 |

## 8. Out of Scope (JANGAN diimplementasikan)

- Adapter BFL/fal, face gate, kuota 60/thn, cap $50, `log_ai`, A/B 50 foto (Fase 2
  produksi — butuh Electron Sprint 021 + top-up $10).
- Label cetak "ILUSTRASI AI" (G-6) — menyentuh area cetak, butuh persetujuan eksplisit
  terpisah (D-22).
- Perubahan prompt/model/rasio (konsep rev2 terkunci).
- Jalur upload Excel/BKU, template cetak, fitur non-AI apa pun.

## 9. Risks

- Audit catch menemukan cabang yang butuh redesign kecil → batasi: hanya pesan + CTA,
  tanpa ubah alur state (bila lebih, berhenti dan lapor).
- Uji T-03/T-04 tergantung ketersediaan akun Puter user → jadwalkan setelah fix merge;
  status risiko RISKS.MD baru ditutup setelah bukti.
- `resizeImage` timeout terlalu agresif di laptop lambat → 5 dtk longgar, hanya untuk
  file benar-benar rusak.

## 10. Assumptions

- Puter.js tetap gratis (User-Pays) untuk demo.
- Komponen upload per slot yang ada dapat dipakai ulang untuk CTA gagal.
- Sprint berikut = **sprint-026** (pack ringkas: small bug fix known cause).
