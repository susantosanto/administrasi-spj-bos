---
name: Laporan Sekolah Modern
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#824500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a65900'
  on-tertiary-container: '#ffede1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
  danger: '#DC2626'
  warning: '#EAB308'
  text-high: '#111827'
  text-low: '#6B7280'
  grad-honor: 'linear-gradient(135deg, #3B82F6, #4F46E5)'
  grad-travel: 'linear-gradient(135deg, #10B981, #0D9488)'
  grad-food: 'linear-gradient(135deg, #F97316, #D97706)'
  grad-support: 'linear-gradient(135deg, #A855F7, #7C3AED)'
  grad-maintenance: 'linear-gradient(135deg, #F43F5E, #DB2777)'
  grad-workshop: 'linear-gradient(135deg, #06B6D4, #0284C7)'
  grad-admin: 'linear-gradient(135deg, #4B5563, #334155)'
  grad-realization: 'linear-gradient(135deg, #F97316, #DC2626)'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-page: 24px
---

## Brand & Style

Sistem desain ini dirancang khusus untuk memenuhi kebutuhan administrasi keuangan sekolah di Indonesia (SPJ BOS/BOSP). Karakter desain ini adalah **Profesional, Terorganisir, dan Terpercaya**, memberikan rasa aman bagi operator sekolah saat mengelola data sensitif.

Gaya desain yang digunakan adalah **Corporate Modern** dengan sentuhan **Minimalisme**. Fokus utama diletakkan pada kejelasan data (readability) dan navigasi yang efisien melalui *Color-Coded Wayfinding*—penggunaan warna dan gradien yang spesifik untuk membantu pengguna mengidentifikasi jenis dokumen dengan cepat tanpa harus membaca teks secara detail. Antarmuka menggunakan latar belakang yang bersih dengan kartu-kartu (cards) yang memiliki elevasi lembut untuk menciptakan hierarki visual yang fungsional.

Target utamanya adalah menciptakan pengalaman pengguna yang minim stres dalam menangani tugas administratif yang padat data.

## Colors

Sistem ini menggunakan palet warna semantik yang kuat untuk memberikan indikasi status yang instan kepada pengguna:
- **Primary (Blue 600):** Digunakan untuk aksi utama dan navigasi.
- **Success (Green 600):** Menandakan penyelesaian tugas atau status "Lengkap".
- **Warning (Yellow 500):** Menandakan status "Draft" atau perlu perhatian.
- **Danger (Red 600):** Digunakan untuk peringatan kritis, kesalahan, atau status "Belum".

Selain warna semantik, sistem ini menggunakan **Category Gradients** sebagai alat bantu navigasi visual (*wayfinding*). Setiap jenis dokumen keuangan memiliki identitas gradien uniknya sendiri yang diterapkan pada header kartu atau ikon, memudahkan operator mengenali kategori dokumen (misalnya: Honorarium, Perjalanan Dinas, atau Belanja Barang) secara visual.

## Typography

Sistem tipografi dirancang untuk keterbacaan tinggi dalam kepadatan data yang besar. Menggunakan **Hanken Grotesk** untuk judul memberikan kesan modern dan profesional, sementara **Inter** digunakan untuk teks isi karena sifatnya yang netral dan sangat terbaca pada ukuran kecil.

Gunakan `headline-lg` untuk judul halaman utama, `headline-md` untuk judul modal atau bagian besar, dan `body-sm` untuk data dalam tabel. Perhatian khusus diberikan pada angka dalam laporan keuangan; pastikan perataan kanan (*right-aligned*) digunakan untuk kolom nilai mata uang di semua tabel.

## Layout & Spacing

Sistem ini menggunakan **Fluid Grid** untuk area konten utama guna memaksimalkan ruang kerja pada monitor desktop, yang umum digunakan di lingkungan kantor sekolah.

- **Desktop (>1024px):** Layout sidebar tetap (fixed) dengan area konten yang meluas secara dinamis. Menggunakan margin halaman 24px dan gutter antar elemen 16px.
- **Tablet (640px - 1024px):** Grid bertransformasi menjadi 2 kolom untuk kartu dokumen.
- **Mobile (<640px):** Layout menjadi kolom tunggal dengan padding yang dikurangi untuk efisiensi ruang.

Rhythm spasial berbasis 4px memastikan konsistensi antara formulir input dan tampilan tabel. Gunakan `gap-md` (16px) sebagai jarak standar antar elemen kontrol.

## Elevation & Depth

Sistem desain ini menggunakan prinsip **Tonal Layers** untuk membedakan antara latar belakang sistem dan permukaan kerja.

1.  **Latar Belakang (Base):** Menggunakan warna Netral (`#F3F4F6`), memberikan kanvas yang bersih dan tidak melelahkan mata.
2.  **Permukaan Kartu (Surface):** Menggunakan warna putih murni dengan bayangan lembut (`shadow-lg`). Ini menciptakan efek mengapung yang halus, memisahkan area kerja dari latar belakang.
3.  **Elevasi Interaktif:** Saat diarahkan (*hover*), kartu harus meningkatkan bayangannya (`shadow-2xl`) dan bergeser sedikit ke atas (-4px) untuk memberikan umpan balik visual bahwa elemen tersebut dapat diklik.
4.  **Overlay:** Modul konfirmasi dan toast menggunakan elevasi tertinggi dengan overlay semi-transparan untuk memfokuskan perhatian pengguna pada aksi yang diperlukan.

## Shapes

Bahasa bentuk dalam sistem ini adalah **Rounded** (Radius 8px-24px). Pilihan ini diambil untuk mengimbangi sifat kaku dari data keuangan dan formulir legal, sehingga aplikasi terasa lebih ramah dan mudah didekati oleh operator sekolah.

- **Kartu Utama:** Menggunakan `rounded-xl` (1.5rem / 24px) untuk tampilan yang modern dan menonjol.
- **Tombol & Input:** Menggunakan `rounded-lg` (1rem / 16px) untuk konsistensi genggaman visual.
- **Badges/Status:** Menggunakan radius penuh (pill-shaped) untuk membedakannya secara jelas dari elemen interaktif lainnya.

## Components

### Buttons & Actions
Tombol utama menggunakan warna Primary dengan teks putih. Aksi destruktif (Hapus) menggunakan warna Danger. Gunakan ikon di sisi kiri teks untuk mempercepat identifikasi fungsi tombol (misal: ikon print untuk tombol "Cetak").

### Tables (Modern Excel Style)
Tabel harus memiliki baris zebra (*striped*) dengan warna abu-abu sangat muda pada baris genap. Header tabel harus tebal (Semibold) dengan latar belakang abu-abu terang. Pastikan kolom "Aksi" selalu berada di paling kanan dan tetap terlihat (*sticky*) jika tabel memiliki banyak kolom.

### Cards (Dokumen SPJ)
Kartu adalah unit informasi utama. Setiap kartu harus memiliki:
- Header dengan gradien sesuai kategori.
- Judul yang jelas (`headline-sm`).
- Metadata ringkas di bagian bawah (misal: tanggal buat, jumlah item).
- Badge status di sudut kanan atas (Lengkap/Draft/Belum).

### Status Badges
Gunakan kombinasi warna latar belakang sangat muda (tint) dengan warna teks yang kontras:
- **Lengkap:** Latar hijau muda, teks hijau tua.
- **Draft:** Latar kuning muda, teks oranye tua.
- **Belum:** Latar merah muda, teks merah tua.

### Form Inputs
Input field harus memiliki border `gray-300` yang menebal dan berubah warna menjadi Primary saat fokus. Label formulir menggunakan `label-md` dan diletakkan di atas input field untuk kejelasan pada perangkat seluler.