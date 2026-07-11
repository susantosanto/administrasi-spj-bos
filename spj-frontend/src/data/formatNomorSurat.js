// Format Nomor Surat Standar Indonesia
// Berdasarkan: Permendagri, BKN, dan Standar Nasional

export const FORMAT_STANDAR = {
  // Format Dasar: [Nomor Urut] / [Kode Unit] / [Kode Klasifikasi] / [Bulan Romawi] / [Tahun]
  
  // Format Sekolah SD
  SD: {
    name: 'Format SD',
    description: 'Format nomor surat untuk Sekolah Dasar',
    segments: [
      { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
      { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: 'STS', enabled: true },
      { id: 'sekolah', type: 'dynamic', label: 'Nama Sekolah', value: 'SDN', enabled: true },
      { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
      { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
    ],
    separator: '/'
  },
  
  // Format SMP
  SMP: {
    name: 'Format SMP',
    description: 'Format nomor surat untuk Sekolah Menengah Pertama',
    segments: [
      { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
      { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: 'STS', enabled: true },
      { id: 'sekolah', type: 'dynamic', label: 'Nama Sekolah', value: 'SMPN', enabled: true },
      { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
      { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
    ],
    separator: '/'
  },
  
  // Format SMA
  SMA: {
    name: 'Format SMA',
    description: 'Format nomor surat untuk Sekolah Menengah Atas',
    segments: [
      { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
      { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: 'STS', enabled: true },
      { id: 'sekolah', type: 'dynamic', label: 'Nama Sekolah', value: 'SMAN', enabled: true },
      { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
      { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
    ],
    separator: '/'
  },
  
  // Format Dinas Pendidikan
  DISDIK: {
    name: 'Format Disdik',
    description: 'Format nomor surat untuk Dinas Pendidikan',
    segments: [
      { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
      { id: 'sekolah', type: 'dynamic', label: 'Instansi', value: 'Disdik', enabled: true },
      { id: 'kode', type: 'dynamic', label: 'Kode Klasifikasi', value: '001', enabled: true },
      { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
      { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
    ],
    separator: '/'
  },
  
  // Format dengan Kode Sekolah Lengkap
  SD_KODE: {
    name: 'Format SD (Kode Lengkap)',
    description: 'Format dengan kode sekolah lengkap',
    segments: [
      { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
      { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: 'STS', enabled: true },
      { id: 'sekolah', type: 'dynamic', label: 'Kode Sekolah', value: 'SDN.001.02', enabled: true },
      { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
      { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
    ],
    separator: '/'
  },
  
  // Format dengan Kode Klasifikasi
  KLASIFIKASI: {
    name: 'Format Klasifikasi',
    description: 'Format dengan kode klasifikasi surat',
    segments: [
      { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
      { id: 'sekolah', type: 'dynamic', label: 'Nama Sekolah', value: 'SDN', enabled: true },
      { id: 'kode', type: 'dynamic', label: 'Kode Klasifikasi', value: '420', enabled: true },
      { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
      { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
    ],
    separator: '/'
  }
};

// Default segments untuk format custom
export const DEFAULT_SEGMENTS = [
  { id: 'sekolah', type: 'dynamic', label: 'Nama Sekolah', value: 'SDN', enabled: true },
  { id: 'kode', type: 'dynamic', label: 'Kode Surat', value: 'STS', enabled: true },
  { id: 'nomor', type: 'dynamic', label: 'Nomor Urut', value: '3', enabled: true },
  { id: 'bulan', type: 'dynamic', label: 'Bulan', value: 'romawi', enabled: true },
  { id: 'tahun', type: 'dynamic', label: 'Tahun', value: '4', enabled: true }
];

// Jenis Surat Default
export const JENIS_SURAT_DEFAULT = [
  { kode: 'STS', nama: 'Surat Tugas', warna: 'blue' },
  { kode: 'SK', nama: 'Surat Keterangan', warna: 'emerald' },
  { kode: 'SU', nama: 'Surat Undangan', warna: 'violet' },
  { kode: 'SP', nama: 'Surat Pernyataan', warna: 'amber' },
  { kode: 'SKU', nama: 'Surat Kuasa', warna: 'rose' },
  { kode: 'SE', nama: 'Surat Edaran', warna: 'teal' },
  { kode: 'SPD', nama: 'Surat Perintah Dinas', warna: 'cyan' }
];

// Contoh Format
export const CONTOH_FORMAT = {
  'SD/STS': '001 / STS / SDN / VII / 2026',
  'SD/SK': '001 / SK / SDN / VII / 2026',
  'SMP/STS': '001 / STS / SMPN / VII / 2026',
  'SMA/STS': '001 / STS / SMAN / VII / 2026',
  'Disdik': '001 / Disdik / 001 / VIII / 2026',
  'Kode SD': '001 / STS / SDN.001.02 / VII / 2026',
  'Klasifikasi': '001 / SDN / 420 / VII / 2026'
};

export default {
  FORMAT_STANDAR,
  DEFAULT_SEGMENTS,
  JENIS_SURAT_DEFAULT,
  CONTOH_FORMAT
};
