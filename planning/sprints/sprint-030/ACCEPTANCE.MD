# ACCEPTANCE - Sprint 030: Glass Surface Landing Page

- [x] Build produksi selesai dengan exit code 0 (verifikasi setelah hero dipulihkan: `npm run build`, built in 1m 6s; warning chunk >500 kB dan pemberitahuan `build-resources/docs/` tidak ditemukan).
- [x] Seluruh Vitest lulus (31 test, 4 file).
- [x] Hanya header dan mockup dashboard memakai backdrop blur pada LandingPage (computed style, tepat 2).
- [x] CTA bawah dan floating dock tidak memakai backdrop blur, tetap terbaca di light/dark (`backdrop-filter: none`, surface `P.surface`).
- [x] Sesudah pemulihan, konten, route, navigasi, dan susunan hero sama seperti desain awal; lapisan dekorasi baru dan kontrol tambahan sudah dihapus.
- [x] Browser: tidak ada horizontal overflow pada lebar 320, 390, 600, 768, 1024, 1280, dan 1440px; tidak ada console error baru (dua warning React Router Future Flag existing).
- [x] Setelah arahan terbaru, frame gelombang, kontur, halo SVG dan tombol jeda tambahan dihapus; tampilan hero kembali ke motif batik bergerak + dua glow biru rancangan awal.
- [x] Batik mengikuti opacity awal light/dark 0.18/0.04 dan kelas `animate-batik-drift` 40 detik; reduced-motion tetap dihormati oleh aturan CSS proyek.
- [x] Toggle tema aktual (atribut `data-theme`) diuji light → dark → light; screenshot light desktop/mobile dan dark desktop diverifikasi.
- [x] `Landing Page - editable.figcraft` diselaraskan: 16 vektor frame dihapus, 12 tile batik dan 92 objek teks tetap terpisah, thumbnail diperbarui; struktur arsip dan hash aset tervalidasi.
- [x] Arsip FigCraft tervalidasi: format/JSON valid, referensi hash aset gambar cocok, semua ID layer valid, tile batik terpisah; tidak ada vektor frame abstrak.
- [x] Anchor `Lihat Fitur` → `#fitur`, `Tentang` → `#tentang` berhasil; toggle tema light/dark bekerja. Flow login/daftar tidak diubah atau diuji karena bukan bagian scope visual.
