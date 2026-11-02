# ACCEPTANCE.MD — Sprint 023 (Given/When/Then + perintah + output)

## T-1 Tabel invoice sidebar (R-1)
- Given sidebar baris mamin mode SIPLAH + arsip `spj_pbj_invoices` ada 1 invoice 3 item.
- When buka sidebar → Then tabel tampil (nomor, 3 item saat expand, total Rp 618.800) di bawah tombol upload.
- When mode NON-SIPLAH → Then tabel + tombol upload tidak tampil.
- Perintah: `node scripts/probe-s023.cjs` (Playwright :5173) → V-1…V-3 PASS.

## T-2 Prefill perencanaan (R-1)
- Given upload PDF invoice SIPLah sukses → Then form Perencanaan/Pesanan terisi (namaPenyedia, grandTotal) + entri `spj_pbj_bku[NoBukti]` tersimpan + arsip +1 baris.
- Given PDF tak terbaca → Then tabel & form tidak berubah + pesan "isi manual".

## T-3 Card kategori pajak (R-2)
- Given baris SETOR_PAJAK → When buka Detail → Then card "Kategori Belanja" tidak ada di DOM; "Informasi Referensi" lengkap 5 baris.
- Given baris belanja mamin → Then card Kategori tetap tampil. Probe: 4 baris (setor, bunga, belanja, pungut).

## T-4 Ruang per transaksi (R-3)
- Given sidebar transaksi A → When upload ruang + hapus slot → Then thumbnail update; `ruangan_photos` global hash identik; buka transaksi B → ruang B tidak tercampur.
- When ganti suasana ruang_rapat→aula → Then slot foto ikut berganti.

## T-5 Referensi 2026 (R-4)
- Given buka menu Kode Referensi → Then count = 183; search "Pemeliharaan Komputer" ketemu; `getNamaRekening('5.1.02.02.01.0016')` = label Excel; kode lama tak dikenal → fallback kode mentah.
- Perintah: `grep -c "kode:" src/data/kodeReferensi.js` = 183 + KEGIATAN_BOS diff 0.

## T-6 Pemeliharaan Upah/Non-Upah (R-5)
- Given sidebar pemeliharaan default → Then dropdown = Upah + dokumen upah tampil.
- When pilih Non-Upah → Then dokumen upah hilang dari panel + nota panduan tampil; data lama tanpa key → Upah.

## Gate umum
- `cd spj-frontend && npm run build` exit 0 · 0 console error di semua probe · 0 kelas warna terlarang di baris baru · file tabu 0 diff.
