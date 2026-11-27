# BUILD REPORT - Sprint 030: Glass Surface Landing Page

## Perubahan
- `spj-frontend/src/pages/LandingPage.jsx`: blur glass dipertahankan hanya pada header dan mockup dashboard. Kartu CTA memakai permukaan tema solid dan bayangan ringan; floating dock memakai permukaan solid. Posisi, struktur, teks, tautan, breakpoint, dan perilaku tidak diubah.
- Visual mengikuti blue-slate proyek dengan dukungan light/dark. Alasan: header menjaga konteks navigasi, mockup tetap jadi fokus produk; membatasi blur mencegah semua elemen terasa di satu elevasi.

## Bukti verifikasi
- `npm test`: 4 file, 31 test lulus.
- `npm run build`: exit 0, `✓ built in 1m 16s`. Peringatan chunk >500 kB sudah ada di toolchain build dan bukan kegagalan fitur ini.
- Browser preview, desktop 1440px: `scrollWidth == clientWidth`; terukur tepat 2 elemen `backdrop-filter` (header + mockup); CTA dan dock `backdrop-filter: none`.
- Browser preview, mobile 390px: tidak ada horizontal overflow; menu desktop tersembunyi dan tombol tema mobile tampil; dua elemen blur yang sama.
- Toggle tema diklik bolak-balik dan mode light/dark dirender. CTA/link jangkar `Lihat Fitur` → `#fitur`, `Tentang` → `#tentang` berhasil.
- Console: tidak ada error baru. Dua warning React Router Future Flag terlihat pada load awal (warning existing, tidak terkait perubahan).
- `git diff --check`: bersih.

## Batas verifikasi
- Tidak mengubah atau menguji flow pendaftaran/login, sesuai scope visual landing page.
- Tidak mengubah `src/index.css` atau halaman lain.

## Revisi arahan terakhir: hero kembali ke desain awal
- Pengguna meminta membatalkan adaptasi referensi. SVG gelombang/kontur/halo dan kontrol jeda tambahan dihapus dari web; batik bergerak dan dua glow biru dikembalikan ke komposisi awal. Surface CTA/dock solid dan glass header/mockup tetap karena merupakan persetujuan terpisah sebelumnya.
- `Landing Page - editable.figcraft` diselaraskan tanpa menimpa file lain: 16 vektor frame dihapus, 12 tile batik tetap editable, 92 objek teks dipertahankan, thumbnail diperbarui; arsip dan hash aset tervalidasi.
- Browser final: light desktop 1440 dan mobile 390, dark desktop; tidak ada overflow horizontal, SVG frame/tombol tambahan 0, dua elemen blur tetap, console error 0. Animasi batik bergerak (transform berubah dari 14.9992px ke 20.9992px dalam 600ms), opacity 0.18 light / 0.04 dark. Anchor tidak terpengaruh.
- Build ulang sesudah pemulihan: Vitest 31/31; `npm run build` exit 0 (`built in 1m 6s`). Peringatan: `build-resources/docs/` tidak ditemukan dan chunk >500 kB. `git diff --check`: bersih.
