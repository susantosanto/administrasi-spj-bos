# BLUEPRINT - Sprint 030: Glass Surface Landing Page

## Keputusan desain
- Hero dikembalikan ke komposisi awal sebelum adaptasi referensi: batik asli bergerak dengan animasi CSS yang sudah ada, ditambah dua glow biru lembut yang ada pada rancangan awal.
- Hapus frame gelombang/kontur/halo SVG dan kontrol jeda tambahan; jangan mengubah susunan, jarak, atau perilaku konten.
- Header: kaca tipis tetap tembus saat di atas hero, lebih opak saat scroll untuk menjaga keterbacaan navigasi.
- Mockup dashboard: kaca berlapis tetap menjadi fokus visual produk; ukuran, struktur, dan konten tidak diubah.
- CTA bawah dan dock: permukaan tema solid agar dua permukaan kaca utama tetap punya hierarki.
- Tidak menambah dependency atau kontrol tambahan. Animasi batik menggunakan kelas CSS proyek yang sudah tersedia.
- File FigCraft editable dikembalikan ke sumber visual awal, tanpa frame abstrak baru; jangan menimpa file FigCraft lain.

## Implementasi
Satu file: `spj-frontend/src/pages/LandingPage.jsx`. Pertahankan kondisi dark/light dan seluruh DOM/layout; ubah hanya style surface serta blur yang disetujui.

## Verifikasi
`npm test`, `npm run build`, browser pada light/dark dan desktop/mobile (termasuk breakpoint kecil); cek judul tidak tertutup, anchor, overflow horizontal, jumlah permukaan blur, serta struktur dan aset arsip FigCraft.
