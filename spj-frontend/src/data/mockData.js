export const MOCK_SCHOOLS = [
  { id: 'SDN01', name: 'SD Negeri 01 Mandalamukti', npsn: '20215678', status: 'active' },
  { id: 'SDN02', name: 'SD Negeri 02 Mandalamukti', npsn: '20215679', status: 'active' },
  { id: 'SDN03', name: 'SD Negeri 03 Mandalamukti', npsn: '20215680', status: 'active' },
]

export const MOCK_PENDATAAN = [
  {
    id: 1,
    sekolah: 'SD Negeri 01 Mandalamukti',
    npsn: '20215678',
    tahunAjaran: '2025/2026',
    dana: 'BOS',
    totalAnggaran: 150000000,
    totalRealisasi: 87500000,
    status: 'Disetujui',
    createdAt: '2025-07-01',
  },
  {
    id: 2,
    sekolah: 'SD Negeri 02 Mandalamukti',
    npsn: '20215679',
    tahunAjaran: '2025/2026',
    dana: 'BOS',
    totalAnggaran: 120000000,
    totalRealisasi: 45000000,
    status: 'Draft',
    createdAt: '2025-07-03',
  },
  {
    id: 3,
    sekolah: 'SD Negeri 03 Mandalamukti',
    npsn: '20215680',
    tahunAjaran: '2025/2026',
    dana: 'BOS',
    totalAnggaran: 200000000,
    totalRealisasi: 195000000,
    status: 'Selesai',
    createdAt: '2025-06-15',
  },
]

export const MOCK_UPLOADS = [
  { id: 1, nama: 'Bukti Transfer Dana BOS Tahap 1', kategori: 'Keuangan', filename: 'transfer_bos_t1.pdf', size: '2.4 MB', uploadDate: '2025-07-01' },
  { id: 2, nama: 'Invoice Pembelian Mebeler', kategori: 'Sarpras', filename: 'invoice_mebeler.pdf', size: '1.1 MB', uploadDate: '2025-07-05' },
  { id: 3, nama: 'Kuitansi Pembelian ATK', kategori: 'Umum', filename: 'kuitansi_atk.pdf', size: '0.8 MB', uploadDate: '2025-07-08' },
]

export const MOCK_BUKTI_FISIK = {
  administrasi: [
    { id: 1, nama: 'Surat Keputusan Kepala Sekolah', status: 'Lengkap' },
    { id: 2, nama: 'Struktur Organisasi', status: 'Lengkap' },
    { id: 3, nama: 'Program Kerja Tahunan', status: 'Perlu Update' },
  ],
  keuangan: [
    { id: 4, nama: 'RKA-KLBS', status: 'Lengkap' },
    { id: 5, nama: 'BKU Bulanan', status: 'Lengkap' },
    { id: 6, nama: 'LPJ BOS Semester', status: 'Dalam Proses' },
  ],
  sarpras: [
    { id: 7, nama: 'Daftar Inventaris', status: 'Lengkap' },
    { id: 8, nama: 'Kartu Inventaris Barang', status: 'Perlu Update' },
  ],
}

export const MOCK_WORKSHOP = {
  perencanaan: [
    { id: 1, nama: 'Rencana Kerja dan Anggaran Sekolah', status: 'Final' },
    { id: 2, nama: 'Pemetaan Kebutuhan', status: 'Draft' },
  ],
  pelaksanaan: [
    { id: 3, nama: 'Monitoring Pelaksanaan Kegiatan', status: 'Aktif' },
    { id: 4, nama: 'Berita Acara Pemeriksaan', status: 'Menunggu' },
  ],
}

export const MOCK_DOKUMEN_WAJIB = [
  { id: 1, nama: 'Laporan Keuangan BOS', periode: 'Semester 1 2025/2026', status: 'Terkirim', jatuhTempo: '2025-09-30' },
  { id: 2, nama: 'LPJ Realisasi Anggaran', periode: 'Q1 2025', status: 'Belum Terkirim', jatuhTempo: '2025-07-31' },
  { id: 3, nama: 'Laporan Mutasi Inventaris', periode: 'Tahunan 2025', status: 'Dalam Proses', jatuhTempo: '2025-12-31' },
  { id: 4, nama: 'Surat Pernyataan Penggunaan Dana', periode: 'Semester 1 2025/2026', status: 'Terkirim', jatuhTempo: '2025-09-30' },
]

export const MOCK_REALISASI = [
  { id: 1, nama: 'Pembelajaran dan Kegiatan Penunjang', anggaran: 50000000, realisasi: 48750000, persentase: 97.5 },
  { id: 2, nama: 'Pembiayaan Non-Personil', anggaran: 30000000, realisasi: 22000000, persentase: 73.3 },
  { id: 3, nama: 'Belanja Modal', anggaran: 40000000, realisasi: 15000000, persentase: 37.5 },
  { id: 4, nama: 'Syarat Kecukupan', anggaran: 30000000, realisasi: 27500000, persentase: 91.7 },
]

export function seedMockData() {
  if (!localStorage.getItem('spj_seeded')) {
    localStorage.setItem('spj_pendataan', JSON.stringify(MOCK_PENDATAAN))
    localStorage.setItem('spj_uploads', JSON.stringify(MOCK_UPLOADS))
    localStorage.setItem('spj_bukti_fisik', JSON.stringify(MOCK_BUKTI_FISIK))
    localStorage.setItem('spj_workshop', JSON.stringify(MOCK_WORKSHOP))
    localStorage.setItem('spj_dokumen_wajib', JSON.stringify(MOCK_DOKUMEN_WAJIB))
    localStorage.setItem('spj_realisasi', JSON.stringify(MOCK_REALISASI))
    localStorage.setItem('spj_seeded', 'true')
  }
}
