# ACCEPTANCE.MD — Sprint 024 (Given/When/Then)

## T-1 Matriks = PDF Tahap 1 (R-1/R-2)
- Given BKU contoh 2026 + agregat(txs, {tahun:2026, tahap:1}).
- When bandingkan per sel vs rpd-k7-output.pdf → Then 84 sel cocok + total Rp 82.560.000 + selisih Rp 0.
- Perintah: `node planning/sprints/sprint-024/probe-024.mjs` → T-1 PASS.

## T-2 Koreksi bertahan (R-3)
- Given sel dikoreksi → When upload ulang BKU (re-parse) → Then sel koreksi utuh + bertanda; reset per sel kembali ke angka BKU.

## T-3 Belum-dipetakan jujur (R-2)
- Given rekening tak dikenal → Then masuk kolom/baris khusus + banner selisih; total matriks + belum-dipetakan = total BKU.

## T-4 Cetak Realisasi (R-4)
- Given tahap 1 → Then dokumen: kop + header (sekolah/NPSN/sumber/periode) + matriks + footer (saldo lalu 0, terima 82.560.000, saldo akhir, pakai, TTD + NIP) + 0 placeholder.

## T-5 Instrumen A–E (R-4/R-5/R-6/R-7)
- Given Data Sekolah terisi + BKU → Then Seksi A (identitas/rekening/KS/personil), B (SK+tim), C (per-siswa × siswa = total + warning bila ≠ terima), D (12×(t1+t2+total)), E (saldo awal manual + bulanan Jan–Des + pajak potong/setor/sisa + checklist) + footer Pasirhalang + NIP.

## T-6 Regresi + gate umum
- `npm run build` exit 0 · 0 console error · file tabu 0 diff (area AI, PBJ, kas, LPJ, templateConfig selain 2 template baru) · probe-023 tetap 116/0 · Data Sekolah lama tak crash.

## Pertanyaan dry-run (jawab sebelum coding)
- Q-1: kode 5.1.02.02.01.0016 (Upah Tukang) → HONOR atau komponen jasa? (default: null/Belum-dipetakan)
- Q-2: total terima tahap = BOSP masuk tahap itu (bukan pagu)? (default: ya)
- Q-3: saldo lalu tahap 2 = saldo akhir tahap 1? (default: ya)
