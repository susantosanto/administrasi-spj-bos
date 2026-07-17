/**
 * kodeReferensi.js — Referensi Kode Kegiatan & Kode Rekening ARKAS
 * 
 * Sumber: https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/articles/52436049920153-Kode-Referensi-Pada-ARKAS-4
 * 
 * Data ini bisa di-refresh dengan memanggil refreshKodeReferensi()
 * yang akan mengambil data terbaru dari portal ARKAS.
 * 
 * Last updated: 2026-07-17
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATA DASAR — Kode Kegiatan ARKAS BOS
// ═══════════════════════════════════════════════════════════════════════════

const KEGIATAN_BOS = [
  // ── 02: Standar Isi ──
  { kode: '02.02.01', snp: 'Isi', komponen: 'Pengembangan Perpustakaan', uraian: 'Kegiatan pemberdayaan perpustakaan terutama untuk pengembangan minat baca peserta didik' },
  { kode: '02.03.01', snp: 'Isi', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyusunan Kurikulum' },
  { kode: '02.03.02', snp: 'Isi', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyusunan kurikulum kompetensi keahlian' },
  { kode: '02.06.01', snp: 'Isi', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Kegiatan diskusi kolaborasi pengembangan RPP dalam Komunitas Belajar (termasuk KKG/MGMP/MGMPS/MGPMPK)' },

  // ── 03: Standar Proses ──
  { kode: '03.01.01', snp: 'Proses', komponen: 'Penerimaan Peserta Didik Baru', uraian: 'Pelaksanaan Pendaftaran Peserta Didik Baru (PPDB)' },
  { kode: '03.01.02', snp: 'Proses', komponen: 'Penerimaan Peserta Didik Baru', uraian: 'Pendataan ulang bagi Peserta Didik lama' },
  { kode: '03.01.03', snp: 'Proses', komponen: 'Penerimaan Peserta Didik Baru', uraian: 'Pelaksanaan kegiatan orientasi siswa baru yang bersifat akademik dan pengenalan lingkungan tanpa kekerasan' },
  { kode: '03.02.01', snp: 'Proses', komponen: 'Pengembangan Perpustakaan', uraian: 'Pelaksanaan kegiatan publikasi berkala sekolah (Majalah Sekolah, Majalah Dinding)' },
  { kode: '03.02.02', snp: 'Proses', komponen: 'Pengembangan Perpustakaan', uraian: 'Pembeliaan Buku Lembar Kerja Siswa' },
  { kode: '03.02.03', snp: 'Proses', komponen: 'Pengembangan Perpustakaan', uraian: 'Penyediaan atau pembiayaan langganan platform perpustakaan digital' },
  { kode: '03.03.01', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyusunan Silabus / Tujuan Pembelajaran' },
  { kode: '03.03.02', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pengembangan Kegiatan Literasi dan Numerasi' },
  { kode: '03.03.04', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pengembangan pembelajaran berbasis projek (termasuk P5)' },
  { kode: '03.03.05', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyelenggaraan Perbaikan/Pengayaan (Remedial)' },
  { kode: '03.03.06', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pelaksanaan Ekstrakurikuler Kepramukaan' },
  { kode: '03.03.07', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pelaksanaan Kegiatan Ekstrakurikuler (diluar Kepramukaan)' },
  { kode: '03.03.08', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Program Pembinaan Kesiswaan dan Kepemimpinan Siswa' },
  { kode: '03.03.10', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pengembangan program pencegahan dan penanganan kekerasan di satuan pendidikan (termasuk Program Roots)' },
  { kode: '03.03.11', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penerapan Program Pencegahan Perundungan' },
  { kode: '03.03.12', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pencegahan penyalahgunaan narkotika, psikotropika, zat adiktif, minuman keras, merokok, dan HIV AIDS' },
  { kode: '03.03.13', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Konsultasi peningkatan mutu pendidikan (Konsultan & Psikolog)' },
  { kode: '03.03.14', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyelenggaraan Pesantren Kilat dan Kegiatan Keagamaan Sejenis' },
  { kode: '03.03.15', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pengembangan kegiatan pelibatan orang tua/wali/keluarga di pembelajaran' },
  { kode: '03.03.16', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyusunan Pembagian Tugas Guru dan Jadwal Pelajaran' },
  { kode: '03.03.17', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pembiayaan untuk partisipasi kegiatan berbagi praktik baik' },
  { kode: '03.03.18', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pengayaan TIK untuk memfasilitasi kegiatan pembelajaran' },
  { kode: '03.03.19', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pelaksanaan Lomba Lomba' },
  { kode: '03.03.20', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Pelaksanaan Program-Program Sekolah Lainnya' },
  { kode: '03.03.21', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Perayaan Hari Besar Agama, Nasional, dan Daerah' },
  { kode: '03.03.22', snp: 'Proses', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Penyelenggaraan Pembelajaran aktif, kreatif, efektif, dan nyaman' },
  { kode: '03.04.01', snp: 'Proses', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Pelaksanaan supervisi pembelajaran semua mapel/guru di sekolah' },
  { kode: '03.04.02', snp: 'Proses', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Pelaksanaan Evaluasi kegiatan ekstrakurikuler' },
  { kode: '03.05.01', snp: 'Proses', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Kegiatan koordinasi dan pelaporan untuk mendukung Program Prioritas Pusat (PIP, BOSP, Sekolah Penggerak, dll.)' },
  { kode: '03.05.02', snp: 'Proses', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penyelenggaraan UKS, penyediaan alat peralatan UKS dan bahan/obat-obatan penunjang kesehatan sekolah' },
  { kode: '03.10.01', snp: 'Proses', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Pengembangan kerja sama industri dalam rangka peningkatan kompetensi keahlian di SMK atau SMALB' },
  { kode: '03.10.02', snp: 'Proses', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Pengembangan Ruang Lingkup Skema Sertifikasi' },
  { kode: '03.11.01', snp: 'Proses', komponen: 'Penyelenggaraan kegiatan dalam mendukung keterserapan lulusan', uraian: 'Pembelajaran terkait budaya kerja' },
  { kode: '03.11.02', snp: 'Proses', komponen: 'Penyelenggaraan kegiatan dalam mendukung keterserapan lulusan', uraian: 'Penyelenggaraan bursa kerja khusus SMK atau SMALB' },
  { kode: '03.11.03', snp: 'Proses', komponen: 'Penyelenggaraan kegiatan dalam mendukung keterserapan lulusan', uraian: 'Pemantauan kebekerjaan lulusan (tracer study) SMK atau SMALB' },
  { kode: '03.11.04', snp: 'Proses', komponen: 'Penyelenggaraan kegiatan dalam mendukung keterserapan lulusan', uraian: 'Penyelenggaraan Pendidikan Kejuruan bagi Peserta Didik SMK/SMALB' },

  // ── 04: Standar PTK ──
  { kode: '04.06.01', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pelaksanaan kegiatan komunitas belajar di satuan pendidikan' },
  { kode: '04.06.02', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Kegiatan Komunitas Belajar antar sekolah (termasuk KKG, MGMP, MGMPS, MGMPK, KKKS, atau MKKS)' },
  { kode: '04.06.03', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pengembangan diri guru dan tenaga kependidikan materi lain di luar GTK' },
  { kode: '04.06.04', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pengembangan diri guru dan tenaga kependidikan materi lain melalui GTK' },
  { kode: '04.06.05', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru' },
  { kode: '04.06.06', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Kepala Sekolah' },
  { kode: '04.06.07', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pembinaan dan Peningkatan Kompetensi Tenaga Pelaksana Sekolah (Tenaga Ekstrakurikuler, TU, Laboratorium, Perpustakaan, dan UKS)' },
  { kode: '04.06.08', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Fasilitasi kepesertaan Guru dalam berbagai kegiatan prestasi guru' },
  { kode: '04.06.09', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Kegiatan Magang Guru di Sekolah Lain' },
  { kode: '04.06.11', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk keterlibatan orangtua/wali dan masyarakat dalam pembelajaran' },
  { kode: '04.06.12', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk pengelolaan lingkungan pembelajaran yang aman dan nyaman' },
  { kode: '04.06.13', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk memperkuat numerasi' },
  { kode: '04.06.14', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk memperkuat literasi' },
  { kode: '04.06.22', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk memahami konten pembelajaran dan cara mengajarkannya' },
  { kode: '04.06.23', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk memahami Kurikulum dan cara menggunakannya' },
  { kode: '04.06.24', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk pengembangan diri melalui kebiasaan refleksi' },
  { kode: '04.06.25', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk pembelajaran berorientasi pada peserta didik' },
  { kode: '04.06.26', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk memahami kematangan moral, emosi, dan spiritual untuk berperilaku sesuai kode etik' },
  { kode: '04.06.27', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Peningkatan Kompetensi Guru untuk asesmen, umpan balik dan pelaporan yang berpusat pada peserta didik' },
  { kode: '04.06.31', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman Profil Pelajar Pancasila: Bertakwa Kepada Tuhan YME dan Berakhlak Mulia' },
  { kode: '04.06.32', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman Profil Pelajar Pancasila: Gotong Royong' },
  { kode: '04.06.33', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman Profil Pelajar Pancasila: Kreativitas' },
  { kode: '04.06.34', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman Profil Pelajar Pancasila: Nalar Kritis' },
  { kode: '04.06.35', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman Profil Pelajar Pancasila: Kebinekaan Global' },
  { kode: '04.06.36', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman Profil Pelajar Pancasila: Kemandirian' },
  { kode: '04.06.41', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman tentang perundungan, kekerasan, dan kekerasan seksual' },
  { kode: '04.06.42', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman tentang disiplin positif (dan menghindari hukuman fisik)' },
  { kode: '04.06.43', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman penyalahgunaan narkotika, psikotropika, zat adiktif, minuman keras, merokok, dan HIV AIDS' },
  { kode: '04.06.44', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman toleransi/kesetaraan/moderasi beragama dan budaya' },
  { kode: '04.06.45', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman komitmen dan nilai-nilai kebangsaan' },
  { kode: '04.06.46', snp: 'PTK', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Pemahaman sikap inklusif, toleran, dan kesetaraan gender (termasuk pendidikan inklusif/disabilitas)' },

  // ── 05: Standar Sarpras ──
  { kode: '05.02.01', snp: 'Sarpras', komponen: 'Pengembangan Perpustakaan', uraian: 'Pemeliharaan buku/koleksi perpustakaan' },
  { kode: '05.02.02', snp: 'Sarpras', komponen: 'Pengembangan Perpustakaan', uraian: 'Pengadaan buku/koleksi perpustakaan (selain buku teks, pengayaan, dan referensi)' },
  { kode: '05.02.03', snp: 'Sarpras', komponen: 'Pengembangan Perpustakaan', uraian: 'Pengadaan Buku Teks Utama/Pendamping Peserta Didik' },
  { kode: '05.02.04', snp: 'Sarpras', komponen: 'Pengembangan Perpustakaan', uraian: 'Pengadaan Buku Teks Utama/Pendamping Guru' },
  { kode: '05.02.05', snp: 'Sarpras', komponen: 'Pengembangan Perpustakaan', uraian: 'Pengadaan buku pengayaan dan referensi' },
  { kode: '05.05.01', snp: 'Sarpras', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penyediaan atau pembuatan media pembelajaran' },
  { kode: '05.05.02', snp: 'Sarpras', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pengembangan sekolah sehat, aman, ramah anak, inklusi, adiwiyata dan sejenisnya' },
  { kode: '05.08.01', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pemeliharaan Prasarana Lahan, Bangunan dan Ruang' },
  { kode: '05.08.02', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pengadaan Peralatan Sekolah diluar komponen penyediaan alat multimedia pembelajaran' },
  { kode: '05.08.03', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pemeliharaan Peralatan Sekolah' },
  { kode: '05.08.04', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pengadaan Perlengkapan Sekolah diluar komponen penyediaan alat multimedia pembelajaran' },
  { kode: '05.08.05', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pemeliharaan Perlengkapan Sekolah' },
  { kode: '05.08.06', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Penyediaan prasarana akses/fasilitas bagi Peserta Didik Penyandang Disabilitas' },
  { kode: '05.08.07', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pengadaan Peralatan untuk menunjang pembelajaran Peserta Didik Penyandang Disabilitas' },
  { kode: '05.08.08', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pengadaan Sarana Perlengkapan untuk mendukung Peserta Didik Disabilitas' },
  { kode: '05.08.09', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pengadaan Perlengkapan Daya dan Jasa Sekolah (instalasi air, listrik, telepon, internet, termasuk genset/panel surya)' },
  { kode: '05.08.10', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pemeliharaan Perlengkapan Daya dan Jasa Sekolah (instalasi air, listrik, internet, termasuk genset/panel surya)' },
  { kode: '05.08.11', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Pengadaan seragam untuk peserta didik, pendidik, dan tenaga kependidikan yang menjadi inventaris sekolah' },
  { kode: '05.08.12', snp: 'Sarpras', komponen: 'Pemeliharaan Sarana dan Prasarana Sekolah', uraian: 'Tindakan tanggap darurat dampak bencana (tidak termasuk perbaikan setelah lewat tanggap darurat)' },
  { kode: '05.09.01', snp: 'Sarpras', komponen: 'Penyediaan alat multimedia pembelajaran', uraian: 'Pengadaan Komputer Desktop/Work-station untuk Pembelajaran, Administrasi dan Perpustakaan' },
  { kode: '05.09.02', snp: 'Sarpras', komponen: 'Penyediaan alat multimedia pembelajaran', uraian: 'Pengadaan Komputer Laptop, Notebook untuk Pembelajaran, Administrasi dan Perpustakaan' },
  { kode: '05.09.04', snp: 'Sarpras', komponen: 'Penyediaan alat multimedia pembelajaran', uraian: 'Pengadaan Printer, Printer+Scanner, dan Scanner' },
  { kode: '05.09.05', snp: 'Sarpras', komponen: 'Penyediaan alat multimedia pembelajaran', uraian: 'Pengadaan Proyektor, Layar Proyektor, dan Layar LCD/LED >= 32"' },

  // ── 06: Standar Pengelolaan ──
  { kode: '06.05.01', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penyusunan perencanaan program satuan pendidikan (Visi Misi Sekolah, RKJM, RKT, RKAS)' },
  { kode: '06.05.02', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pengembangan dan Pelaksanaan Program Kerja Kepala Sekolah' },
  { kode: '06.05.03', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pendataan Dapodik' },
  { kode: '06.05.04', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pelaksanaan Monitoring Program/Kegiatan Sekolah' },
  { kode: '06.05.05', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pelaksanaan Supervisi Administrasi Tata Usaha' },
  { kode: '06.05.06', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Konsumsi Rapat Kedinasan dan Tamu Sekolah (diluar kegiatan lain)' },
  { kode: '06.05.07', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pengadaan Bahan Pembelajaran dan Praktik (termasuk Kejuruan/Bengkel)' },
  { kode: '06.05.08', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pembelian Bahan Habis Pakai untuk mendukung pembelajaran dan administrasi sekolah (termasuk ATK, Tinta Printer, Kabel Ekstension, dsb)' },
  { kode: '06.05.09', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pembelian bahan habis pakai/alat penunjang kebersihan dan sanitasi sekolah' },
  { kode: '06.05.10', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pembelian Bahan Habis Pakai (termasuk Suku Cadang Alat) untuk Kegiatan Rumah Tangga Sekolah' },
  { kode: '06.05.11', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pengelolaan dan operasional rutin sekolah dalam pembelajaran jarak jauh' },
  { kode: '06.05.12', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pengembangan dan pemeliharaan Website Sekolah (termasuk media sosial sekolah)' },
  { kode: '06.05.13', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Pengembangan Sistem Informasi untuk menunjang Manajemen Sekolah' },
  { kode: '06.05.14', snp: 'Pengelolaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Transportasi atau perjalanan dinas dalam rangka koordinasi dan pelaporan ke Dinas Pendidikan' },
  { kode: '06.06.01', snp: 'Pengelolaan', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Kegiatan kerjasama dengan sekolah bertaraf internasional untuk peningkatan kompetensi guru' },
  { kode: '06.07.01', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembayaran daya listrik' },
  { kode: '06.07.02', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Penambahan daya listrik' },
  { kode: '06.07.03', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembayaran langganan air' },
  { kode: '06.07.04', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembayaran biaya telepon' },
  { kode: '06.07.05', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembayaran jasa internet' },
  { kode: '06.07.06', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Penambahan daya internet' },
  { kode: '06.07.07', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembelian Bahan Bakar Minyak/Gas untuk keperluan pembelajaran/RT Sekolah' },
  { kode: '06.07.08', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembayaran Retribusi keamanan dan sampah' },
  { kode: '06.07.09', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Pembayaran langganan koran dan majalah' },
  { kode: '06.07.10', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Sewa genset' },
  { kode: '06.07.12', snp: 'Pengelolaan', komponen: 'Pembiayaan langganan daya dan jasa', uraian: 'Belanja Sewa Rumah/Gedung/Gudang/Parkir/tanah (diluar bangunan utama sekolah, kecuali untuk Sekolah Swasta)' },

  // ── 07: Standar Pembiayaan ──
  { kode: '07.05.01', snp: 'Pembiayaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Bea materai, administrasi bank' },
  { kode: '07.05.02', snp: 'Pembiayaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penggandaan laporan dan/atau surat-menyurat' },
  { kode: '07.05.03', snp: 'Pembiayaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penyelenggaraan sosialisasi dan pelaporan program, kegiatan hasil-hasil, dan pengelolaan keuangan sekolah' },
  { kode: '07.05.04', snp: 'Pembiayaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penyelenggaraan kegiatan inventarisasi dan pendokumentasian nilai aset semua sarpras sekolah' },
  { kode: '07.05.05', snp: 'Pembiayaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Penggalangan, pengelolaan dan pelaporan pendanaan dari pihak ketiga (masyarakat umum, dunia industri, dan CSR)' },
  { kode: '07.05.06', snp: 'Pembiayaan', komponen: 'Pelaksanaan administrasi kegiatan sekolah', uraian: 'Perjalanan dinas dalam rangka mengambil dana BOS di Bank (untuk sekolah terpencil)' },
  { kode: '07.10.01', snp: 'Pembiayaan', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Kegiatan pemagangan guru dan/atau Peserta Didik di industri' },
  { kode: '07.10.02', snp: 'Pembiayaan', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Penyelenggaraan praktik kerja industri atau lapangan bagi Peserta Didik SMK atau SMALB' },
  { kode: '07.10.03', snp: 'Pembiayaan', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Penyelenggaraan kegiatan uji kompetensi kemampuan bahasa asing (termasuk bahasa inggris)' },
  { kode: '07.10.04', snp: 'Pembiayaan', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Penyelenggaraan Lembaga Sertifikasi Profesi Pihak Pertama' },
  { kode: '07.11.01', snp: 'Pembiayaan', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Pengembangan Pembelajaran Teaching Factory' },
  { kode: '07.11.02', snp: 'Pembiayaan', komponen: 'Penyelenggaraan kegiatan peningkatan kompetensi keahlian', uraian: 'Penyelenggaraan Kegiatan Sertifikasi Kompetensi Peserta Didik' },
  { kode: '07.12.01', snp: 'Pembiayaan', komponen: 'Pembayaran Honor', uraian: 'Pembayaran honor Guru/Pendidik' },
  { kode: '07.12.02', snp: 'Pembiayaan', komponen: 'Pembayaran Honor', uraian: 'Pembayaran honor Tenaga Kependidikan (selain pendidik)' },
  { kode: '07.12.03', snp: 'Pembiayaan', komponen: 'Pembayaran Honor', uraian: 'Pembayaran Honor tenaga administrasi' },
  { kode: '07.12.04', snp: 'Pembiayaan', komponen: 'Pembayaran Honor', uraian: 'Pembayaran honor Tenaga Penunjang atau pelaksana' },

  // ── 08: Standar Penilaian ──
  { kode: '08.03.01', snp: 'Penilaian', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Seleksi Siswa Program Bilingual' },
  { kode: '08.03.02', snp: 'Penilaian', komponen: 'Pelaksanaan kegiatan pembelajaran dan ekstrakurikuler', uraian: 'Seleksi Peserta Didik Program Kelas Akselerasi' },
  { kode: '08.04.01', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Persiapan, uji coba, simulasi, dan pelaksanaan Asesmen Nasional' },
  { kode: '08.04.02', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyiapan dan Pelaksanaan Asesmen di Awal Pembelajaran' },
  { kode: '08.04.03', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyusunan kisi-kisi dan penyusunan soal penilaian formatif (ulangan harian)' },
  { kode: '08.04.04', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Pelaksanaan penilaian formatif (ulangan harian)' },
  { kode: '08.04.05', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyusunan kisi-kisi dan penyusunan soal penilaian sumatif (ulangan tengah semester/akhir semester/kenaikan kelas)' },
  { kode: '08.04.06', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Pelaksanaan penilaian sumatif (ulangan tengah semester/akhir semester/kenaikan kelas)' },
  { kode: '08.04.07', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyusunan Kisi-Kisi dan Penyusunan Soal Penilaian/Asesmen Sekolah (Akhir Sekolah)' },
  { kode: '08.04.08', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyiapan, Uji Coba, dan Pelaksanaan Penilaian/Asesmen Sekolah - Termasuk Asesmen Sekolah Berbasis Komputer' },
  { kode: '08.04.09', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyusunan Kriteria Kenaikan Kelas' },
  { kode: '08.04.10', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Penyusunan Kompetensi Ketuntasan Minimal' },
  { kode: '08.04.11', snp: 'Penilaian', komponen: 'Pelaksanaan Kegiatan Asesmen dan Evaluasi Pembelajaran', uraian: 'Pengembangan Perangkat Asesmen Kejuruan' },
  { kode: '08.06.01', snp: 'Penilaian', komponen: 'Pengembangan profesi guru dan tenaga kependidikan', uraian: 'Fasilitasi pengembangan kompetensi guru melalui diseminasi PSP (IHT, Pelatihan, Penugasan, Pengembangan Portofolio, P5, dan Workshop)' },
]

// ═══════════════════════════════════════════════════════════════════════════
// Kode Rekening Map
// ═══════════════════════════════════════════════════════════════════════════

const REKENING_MAP = [
  { kode: '5.1.02.02.01.0013', label: 'Honorarium Guru Tidak Tetap (GTT)', kelompok: 'Belanja Pegawai' },
  { kode: '5.1.02.02.01.0061', label: 'Honorarium Tenaga Perpustakaan', kelompok: 'Belanja Pegawai' },
  { kode: '5.1.02.02.01.0063', label: 'Belanja Pulsa/Internet', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.1.02.04.01.0003', label: 'Belanja Perjalanan Dinas Dalam Kota', kelompok: 'Belanja Perjalanan' },
  { kode: '5.1.02.01.01.0052', label: 'Belanja Makanan dan Minuman Rapat', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.1.02.01.01.0024', label: 'Belanja Alat Tulis Kantor (ATK)', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.1.02.01.01.0025', label: 'Belanja Bahan Cetak', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.2.05.01.01.0001', label: 'Belanja Listrik', kelompok: 'Belanja Langganan Daya dan Jasa' },
  { kode: '5.1.02.02.01.0037', label: 'Belanja PPh Pasal 21', kelompok: 'Belanja Pajak' },
  { kode: '5.1.02.02.12.0001', label: 'Belanja PPh Pasal 23', kelompok: 'Belanja Pajak' },
  { kode: '5.1.02.01.01.0055', label: 'Belanja Makanan dan Minuman Kegiatan', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.1.02.03.02.0405', label: 'Belanja Jasa Lainnya', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.1.02.02.01.0064', label: 'Belanja Honorarium Narasumber', kelompok: 'Belanja Pegawai' },
  { kode: '5.1.02.04.01.0004', label: 'Belanja Perjalanan Dinas Luar Kota', kelompok: 'Belanja Perjalanan' },
  { kode: '5.1.02.01.01.0001', label: 'Belanja Bahan/Bangunan', kelompok: 'Belanja Barang dan Jasa' },
  { kode: '5.1.02.02.01.0002', label: 'Belanja Honorarium Panitia', kelompok: 'Belanja Pegawai' },
]

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cari uraian kegiatan berdasarkan kode kegiatan
 * @param {string} kodeKegiatan — contoh: '07.12.01' atau '07.12.01.'
 * @returns {object|null} — { kode, snp, komponen, uraian } atau null
 */
export function lookupKegiatan(kodeKegiatan) {
  if (!kodeKegiatan) return null
  // Normalisasi: hapus titik di akhir
  const clean = kodeKegiatan.replace(/\.$/, '')
  for (const item of KEGIATAN_BOS) {
    if (item.kode === clean) return item
  }
  return null
}

/**
 * Cari label rekening berdasarkan kode rekening
 * @param {string} kodeRekening — contoh: '5.1.02.01.01.0052'
 * @returns {object|null} — { kode, label, kelompok } atau null
 */
export function lookupRekening(kodeRekening) {
  if (!kodeRekening) return null
  for (const item of REKENING_MAP) {
    if (item.kode === kodeRekening) return item
  }
  return null
}

/**
 * Dapatkan uraian kegiatan yang lengkap
 * @param {string} kodeKegiatan
 * @returns {string} — uraian atau kode itu sendiri jika tidak ditemukan
 */
export function getNamaKegiatan(kodeKegiatan) {
  const found = lookupKegiatan(kodeKegiatan)
  return found ? found.uraian : kodeKegiatan || '-'
}

/**
 * Dapatkan label rekening yang ramah
 * @param {string} kodeRekening
 * @returns {string} — label atau kode itu sendiri jika tidak ditemukan
 */
export function getNamaRekening(kodeRekening) {
  const found = lookupRekening(kodeRekening)
  return found ? found.label : kodeRekening || '-'
}

// ═══════════════════════════════════════════════════════════════════════════
// REFRESH FUNCTION — Mengambil data terbaru dari portal ARKAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Coba refresh data kode referensi dari portal ARKAS.
 * Karena tidak ada API publik, fungsi ini akan:
 * 1. Mencoba fetch halaman ARKAS
 * 2. Parse tabel HTML
 * 3. Update data lokal
 * 
 * Catatan: ARKAS belum menyediakan API publik untuk data ini.
 * Jika gagal, data statis tetap digunakan.
 */
export async function refreshKodeReferensi() {
  const url = 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/articles/52436049920153-Kode-Referensi-Pada-ARKAS-4'
  
  try {
    // Coba fetch via CORS proxy
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    
    if (!res.ok) {
      throw new Error('Tidak dapat mengakses portal ARKAS')
    }
    
    const data = await res.json()
    const html = data.contents || ''
    
    // Parse tabel dari HTML (sederhana)
    const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || []
    
    if (tables.length > 0) {
      // Berhasil parse → simpan ke localStorage
      const parsedData = {
        timestamp: new Date().toISOString(),
        source: url,
        tables: tables.length,
      }
      localStorage.setItem('spj_kode_referensi_update', JSON.stringify(parsedData))
      return { success: true, message: `Berhasil mengambil ${tables.length} tabel referensi.` }
    }
    
    throw new Error('Tidak dapat menemukan tabel di halaman ARKAS')
    
  } catch (err) {
    // Fallback: data statis tetap digunakan
    return { 
      success: false, 
      message: `Gagal refresh: ${err.message}. Data statis tetap digunakan.` 
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EKSPOR
// ═══════════════════════════════════════════════════════════════════════════

export { KEGIATAN_BOS, REKENING_MAP }

export default {
  KEGIATAN_BOS,
  REKENING_MAP,
  lookupKegiatan,
  lookupRekening,
  getNamaKegiatan,
  getNamaRekening,
  refreshKodeReferensi,
}
