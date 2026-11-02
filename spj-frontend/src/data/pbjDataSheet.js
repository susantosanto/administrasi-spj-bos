/**
 * pbjDataSheet.js — Sprint 010 Task 51: salinan statis sheet 'data'
 * Dokumen PBJ_2026_Lbs.xlsx (BUKAN form). Header = baris 9 kolom A-O,
 * 10 baris data (baris 10-19). Kolom AD (daftar kategori) TIDAK dipakai.
 * Sumber diverifikasi via openpyxl 2026-10-08. Statis, tanpa fetch.
 */
export const PBJ_SHEET_COLUMNS = [
  { key: 'no', label: 'No' },
  { key: 'bulan', label: 'Bulan' },
  { key: 'noBukti', label: 'No. Bukti' },
  { key: 'tglPesanan', label: 'Tgl. Pesanan' },
  { key: 'jumlah', label: 'Jumlah Barang/Jasa' },
  { key: 'spesifikasi', label: 'Spesifikasi/ruang lingkup barang/jasa' },
  { key: 'waktuSerah', label: 'Waktu serah terima' },
  { key: 'alokasi', label: 'Alokasi Anggaran' },
  { key: 'penyedia', label: 'Penyedia' },
  { key: 'namaPenyedia', label: 'nama penyedia' },
  { key: 'direktur', label: 'Direktur penyedia' },
  { key: 'linkSiplah', label: 'link SIPLah' },
  { key: 'npwp', label: 'NPWP' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'telp', label: 'No. Telp' },
]

export const PBJ_SHEET_ROWS = [
  { no: 1, bulan: 'Februari', noBukti: 'BNU 20', tglPesanan: '2 Februari 2026', jumlah: '63 Eksemplar', spesifikasi: 'Buku Literasi/Perpustakaan', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026', alokasi: 3024600, penyedia: 'Badan Usaha', namaPenyedia: 'CV. BAGJA AKSARA JAYA', direktur: 'Rudi Haerudin', linkSiplah: 'https://siplah.tokoladang.co.id/m/bagja-aksara-jaya.59470', npwp: '266411982421000', alamat: 'Jl. Kebon manggu No.32 RT.03/RW.04, Padasuka Kec. Cimahi Tengah Kota Cimahi', telp: '081214144426' },
  { no: 2, bulan: 'Februari', noBukti: 'BNU 21', tglPesanan: '3 Februari 2026', jumlah: '31 Eksemplar', spesifikasi: 'Buku Umum - Mahir TKA (Tes Kemampuan Akademik) SD', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026', alokasi: 3038000, penyedia: 'Badan Usaha', namaPenyedia: 'CV. CAHAYA PUTRA DEWA', direktur: 'Budi Cahyadi', linkSiplah: 'https://siplah.tokoladang.co.id/m/cv-cahaya-putra-dewa.62495', npwp: '279296818421000', alamat: 'Jl. Kp. Bobojong Rt.01 Rw.020 Desa Mukapayung Kec. Cililin Kab. Bandung Barat', telp: '082249455644' },
  { no: 3, bulan: 'Februari', noBukti: 'BNU 23', tglPesanan: '3 Februari 2026', jumlah: '5 Eksemplar', spesifikasi: 'Buku Umum - AKSARA SUNDA BAKU "KAGANGA"', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026', alokasi: 275000, penyedia: 'Badan Usaha', namaPenyedia: 'CV. CAHAYA PUTRA DEWA', direktur: 'Budi Cahyadi', linkSiplah: 'https://siplah.tokoladang.co.id/m/cv-cahaya-putra-dewa.62495', npwp: '279296818421000', alamat: 'Jl. Kp. Bobojong Rt.01 Rw.020 Desa Mukapayung Kec. Cililin Kab. Bandung Barat', telp: '082249455644' },
  { no: 4, bulan: 'Februari', noBukti: 'BNU24', tglPesanan: '3 Februari 2026', jumlah: '114 Eksemplar', spesifikasi: 'Bahan Cetak Lainnya-Modul Kegiatan Ramadhan', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026', alokasi: 1026000, penyedia: 'Badan Usaha', namaPenyedia: 'CV. CAHAYA PUTRA DEWA', direktur: 'Budi Cahyadi', linkSiplah: 'https://siplah.tokoladang.co.id/m/cv-cahaya-putra-dewa.62495', npwp: '279296818421000', alamat: 'Jl. Kp. Bobojong Rt.01 Rw.020 Desa Mukapayung Kec. Cililin Kab. Bandung Barat', telp: '082249455644' },
  { no: 5, bulan: 'Maret', noBukti: 'BNU 35', tglPesanan: '2 Maret 2026', jumlah: '32 Eksemplar', spesifikasi: 'Buku Siswa - Koding dan Kecerdasan Artifisial Kelas 5; Buku Siswa - Koding dan Kecerdasan Artifisial Kelas 6', waktuSerah: 'Estimasi 30 Hari pada Bulan Maret 2026', alokasi: 2672000, penyedia: 'Badan Usaha', namaPenyedia: 'CV. CAHAYA PUTRA DEWA', direktur: 'Budi Cahyadi', linkSiplah: 'https://siplah.tokoladang.co.id/m/cv-cahaya-putra-dewa.62495', npwp: '279296818421000', alamat: 'Jl. Kp. Bobojong Rt.01 Rw.020 Desa Mukapayung Kec. Cililin Kab. Bandung Barat', telp: '082249455644' },
  { no: 6, bulan: 'Mei', noBukti: 'BNU 54', tglPesanan: '4 Mei 2026', jumlah: '42 Eksemplar', spesifikasi: 'Buku Siswa - Seni Rupa Kelas 1,2,3,4,5,6; Buku Siswa - Seni Musik Kelas 1,2,3,4,5,6', waktuSerah: 'Estimasi 30 Hari pada Bulan Mei 2026', alokasi: 3738000, penyedia: 'Badan Usaha', namaPenyedia: 'CV. CAHAYA PUTRA DEWA', direktur: 'Budi Cahyadi', linkSiplah: 'https://siplah.tokoladang.co.id/m/cv-cahaya-putra-dewa.62495', npwp: '279296818421000', alamat: 'Jl. Kp. Bobojong Rt.01 Rw.020 Desa Mukapayung Kec. Cililin Kab. Bandung Barat', telp: '082249455644' },
  { no: 7, bulan: 'April', noBukti: 'BNU 46', tglPesanan: '7 April 2026', jumlah: '45 Eksemplar', spesifikasi: 'Buku Literasi/Perpustakaan', waktuSerah: 'Estimasi 30 Hari pada Bulan April 2026', alokasi: 1755000, penyedia: 'Badan Usaha', namaPenyedia: 'CV Karya Detra Nusantara', direktur: 'Sastra Satria', linkSiplah: 'https://siplah.tokoladang.co.id/m/karya-detra-nusantara.55805', npwp: '0201561925011000', alamat: 'Jl. Pendidikan II Kp. Tambun RT.004 RW 02 No. 4 - Bekasi', telp: '081999981914' },
  { no: 8, bulan: 'Maret', noBukti: 'BNU 36', tglPesanan: '2 Maret 2026', jumlah: '80 Eksemplar', spesifikasi: 'Buku Siswa - Bahasa Sunda (Mida Dami) Kelas 1-6; Buku Siswa - Rineka Budaya Sunda Kelas 1-6; Buku Siswa - Koding dan Kecerdasan Artifisial Kelas 5-6', waktuSerah: 'Estimasi 30 Hari pada Bulan Maret 2026', alokasi: 4786000, penyedia: 'Badan Usaha', namaPenyedia: 'CV. Jaya Makmur Nusantara', direktur: 'Yusuf Ardiansyah', linkSiplah: 'https://siplah.tokoladang.co.id/m/jaya-makmur-nusantara-cv.8032', npwp: '958527988445000', alamat: 'Kp. Bojong Nangka RT.004 RW.013 Desa Kopo Kec. Kutawaringin Kab. Bandung Jawa Barat 40911', telp: '08991766279' },
  { no: 9, bulan: 'Februari', noBukti: 'BNU 22', tglPesanan: '3 Februari 2026', jumlah: '1 Unit', spesifikasi: 'Printer Epson L3210', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026', alokasi: 3500000, penyedia: 'Perorangan', namaPenyedia: "Toko D'Corner", direktur: 'Asti Nurul Alviani', linkSiplah: 'https://siplah.tokoladang.co.id/m/toko-dcorner.43251', npwp: '3217035806000005', alamat: 'Kp. Cipare RT 01 RW 08 Desa Cipada Kec. Cikalongwetan Kab. Bandung Barat', telp: '085759787530' },
  { no: 10, bulan: 'Februari', noBukti: 'BNU 16', tglPesanan: '3 Februari 2026', jumlah: '1177 Paket', spesifikasi: 'Langganan Internet, Pulsa, Listrik, ATK, Kertas, Tinta Printer, Fotocopy Soal, Service Printer, Cetak Foto, dan Perlengkapan Pramuka', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026', alokasi: 4751000, penyedia: 'Perorangan', namaPenyedia: "Toko D'Corner", direktur: 'Asti Nurul Alviani', linkSiplah: 'https://siplah.tokoladang.co.id/m/toko-dcorner.43251', npwp: '3217035806000005', alamat: 'Kp. Cipare RT 01 RW 08 Desa Cipada Kec. Cikalongwetan Kab. Bandung Barat', telp: '085759787530' },
]

export default { PBJ_SHEET_COLUMNS, PBJ_SHEET_ROWS }
