# REQUIREMENTS - Sprint 030: Glass Surface Landing Page

## Tujuan
Rapikan penerapan glassmorphism di landing page dan adaptasikan referensi visual pengguna menjadi frame abstrak biru yang menyatu dengan gaya glass, tanpa mengubah layout maupun fungsi.

## Cakupan
- Implementasi web pada `spj-frontend/src/pages/LandingPage.jsx`.
- File FigCraft editable hanya diperbarui bila arahan visual baru disetujui; file lama lain tidak ditimpa.
- Dua permukaan dengan blur: header navigasi dan mockup dashboard.
- Kartu CTA bawah dan floating dock tetap di posisi/ukuran yang ada, menjadi permukaan solid tanpa blur.
- Semua konten, route, navigasi, breakpoint, tema light/dark, dan perilaku dipertahankan.

## Batasan
- Tidak mengubah dashboard atau halaman lain, data, teks, interaksi, atau dependency.
- Arahan terakhir pengguna: kembalikan tampilan hero ke desain awal sebelum adaptasi referensi, termasuk batik bergerak dan dua glow biru yang sudah ada; hilangkan gelombang/kontur/halo SVG dan tombol jeda tambahan.
- Perubahan glass pada CTA dan floating dock yang disetujui sebelumnya tetap dipertahankan.
- Palet proyek blue-only + slate tetap berlaku.
