/**
 * ============================================================================
 *  SPJ REQUIREMENTS — Kelengkapan Dokumen SPJ
 * ============================================================================
 *  Sumber utama : docs/Skema Aplikasi SPJ.txt
 *
 *  FILE INI ADALAH TEMPAT ANDA MENGEDIT DAFTAR DOKUMEN SPJ SECARA MANUAL.
 *  Semua daftar dokumen yang tampil di sidebar BKU diambil dari sini.
 *
 *  --------------------------------------------------------------------------
 *  CARA MENGEDIT (rubah langsung di bawah, tidak perlu ubah kode lain):
 *  --------------------------------------------------------------------------
 *  1. TAMBAH / HAPUS DOKUMEN pada suatu kategori
 *     -> edit array "items" di dalam SPJ_REQUIREMENTS[<KATEGORI>].
 *     -> setiap dokumen cukup tulis sebagai string di dalam tanda kutip.
 *        Contoh menambah : 'Kwitansi',  |  menghapus : hapus barisnya saja.
 *
 *  2. UBAH KETERANGAN kategori / grup
 *     -> edit teks pada field "keterangan" (muncul sebagai hint di sidebar).
 *
 *  3. TAMBAH KATEGORI BARU
 *     -> salin satu blok di dalam SPJ_REQUIREMENTS, ganti key & isinya,
 *        lalu daftarkan key tersebut di KODE_PATTERNS / KATA_KUNCI agar
 *        terdeteksi otomatis (lihat penjelasan di bawah).
 *
 *  4. UBAH DOKUMEN PBJ WAJIB / DOKUMEN WAJIB LUAR ARKAS
 *     -> edit array SPJ_PBJ_DOCS.items dan SPJ_WAJIB_LUAR_ARKAS.
 *
 *  --------------------------------------------------------------------------
 *  STRUKTUR DATA:
 *  --------------------------------------------------------------------------
 *  SPJ_REQUIREMENTS = {
 *    <KEY_KATEGORI>: {
 *      label      : 'Nama kategori (tampil di sidebar)',
 *      icon       : 'nama ikon material-symbols',
 *      keterangan : 'Penjelasan singkat (hint di sidebar)',
 *      items      : [ 'dokumen 1', 'dokumen 2', ... ],
 *    }
 *  }
 *
 *  Urutan grup yang tampil di sidebar (lihat buildSpjChecklist):
 *    (a) Bukti Fisik — <kategori terdeteksi>
 *    (b) Dokumen PBJ (Wajib)
 *    (c) Dokumen Wajib (Luar Arkas)  -> HANYA jika TIDAK melalui SIPLAH
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────
// 1) KELENGKAPAN BUKTI FISIK PER KATEGORI
//    Isi di bawah diambil dari Skema Aplikasi SPJ (A–I + Workshop).
//    EDIT BEBAS sesuai kebutuhan sekolah Anda.
// ─────────────────────────────────────────────────────────────────────────
export const SPJ_REQUIREMENTS = {
  // A. HONOR
  HONOR: {
    label: 'Honor / Gaji',
    icon: 'payments',
    keterangan: 'Bukti fisik untuk semua jenis honor (guru, tendik, penjaga, tenaga perpus, ekskul), upah kerja, dan narsum.',
    items: [
      'Daftar penerima honor (guru / tendik / penjaga / tenaga perpus / ekskul)',
      'SK',
      'Daftar penerima honor kegiatan',
      'Narsum',
      'Daftar penerima upah kerja',
    ],
  },

  // B. PERJALANAN DINAS
  PERJALANAN_DINAS: {
    label: 'Perjalanan Dinas',
    icon: 'directions_car',
    keterangan: 'Bukti fisik untuk perjalanan dinas (dalam & luar daerah): SPPD, surat tugas, dan pertanggungjawaban.',
    items: [
      'Daftar penerima',
      'Surat Tugas',
      'SPPD',
      'Resume',
      'Dokumen',
      'Undangan',
    ],
  },

  // C. Mamin
  MAMIN: {
    label: 'Makan & Minum (Mamin)',
    icon: 'restaurant',
    keterangan: 'Bukti fisik makan/minum dibedakan menjadi Rapat, Kegiatan, dan Tamu.',
    items: [
      'Mamin Rapat: Surat Undangan, Daftar Hadir, Resume, Foto',
      'Mamin Kegiatan: (Undangan / Surat Perintah), Daftar Hadir, Resume, Foto',
      'Mamin Tamu: Surat Undangan, Daftar Hadir, Resume, Foto',
    ],
  },

  // D. Penggandaan
  PENGGANDAAN: {
    label: 'Penggandaan',
    icon: 'content_copy',
    keterangan: 'Bukti fisik berupa master yang digandakan (dokumen asli yang diperbanyak).',
    items: [
      'Master yang digandakan (dokumen asli yang diperbanyak)',
    ],
  },

  // E. Cetak Foto (non silah)
  CETAK_FOTO: {
    label: 'Cetak Foto (Non Silah)',
    icon: 'photo_camera',
    keterangan: 'Bukti fisik berupa dokumentasi foto kegiatan.',
    items: [
      'Bukti Dokumen Foto',
    ],
  },

  // F. Cetak Banner
  CETAK_BANNER: {
    label: 'Cetak Banner / Spanduk',
    icon: 'flag',
    keterangan: 'Bukti fisik berupa foto banner / spanduk / baliho.',
    items: [
      'Bukti Foto Banner / Spanduk',
    ],
  },

  // G. Sewa
  SEWA: {
    label: 'Sewa',
    icon: 'local_shipping',
    keterangan: 'Bukti fisik untuk sewa alat/transport: mobilitas, sound system, dan kendaraan.',
    items: [
      'Sewa mobilitas',
      'Sewa Sound',
      'Sewa Kendaraan: SIM / STNK dan foto penggunaan alat transportasi',
    ],
  },

  // H. Pemeliharaan
  PEMELIHARAAN: {
    label: 'Pemeliharaan',
    icon: 'build',
    keterangan: 'Bukti fisik untuk servis/perawatan fasilitas, peralatan, dan bangunan sekolah.',
    items: [
      'Servis Fasilitas sekolah',
      'Servis peralatan',
      'Servis / pemeliharaan bangunan',
    ],
  },

  // I. Tagihan
  TAGIHAN: {
    label: 'Tagihan',
    icon: 'receipt_long',
    keterangan: 'Bukti fisik untuk tagihan rutin: listrik dan air (sesuai klasifikasi).',
    items: [
      'Tagihan Listrik',
      'Tagihan Air (Pribadi / Lembaga Pemerintah) — isi data sesuai klasifikasi',
    ],
  },

  // Workshop (Sekolah / Eksternal)
  WORKSHOP: {
    label: 'Workshop',
    icon: 'groups',
    keterangan: 'Bukti fisik kegiatan workshop/bimtek: dibedakan sekolah penyelenggara vs eksternal.',
    items: [
      'Sekolah: Undangan, Daftar Hadir, Proposal, Resume, Foto, Honor Narsum',
      'Eksternal: Undangan, Daftar Hadir, Proposal, Resume, Foto, Surat Tugas Pemberangkatan',
    ],
  },

  // Fallback jika kategori tidak terdeteksi
  UMUM: {
    label: 'Belanja Lainnya',
    icon: 'description',
    keterangan: 'Kategori default bila tidak cocok dengan pola di atas. Sesuaikan dokumen dengan jenis kegiatan.',
    items: [
      'Sesuaikan dokumen dengan jenis kegiatan (lihat Skema Aplikasi SPJ)',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────
// 2) DOKUMEN PBJ WAJIB
//    Berlaku untuk SEMUA belanja barang/jasa (pengadaan langsung / toko).
// ─────────────────────────────────────────────────────────────────────────
export const SPJ_PBJ_DOCS = {
  label: 'Dokumen PBJ (Wajib)',
  icon: 'description',
  keterangan: 'Wajib untuk semua belanja barang/jasa (pengadaan langsung maupun toko).',
  items: [
    'Dokumen Perencanaan',
    'Surat Pesanan',
    'BAST (Berita Acara Serah Terima)',
    'BAHP (Berita Acara Hasil Pengadaan)',
    'Negosiasi Perbandingan',
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// 3) DOKUMEN WAJIB LUAR ARKAS
//    Hanya ditampilkan bila transaksi TIDAK melalui SIPLAH.
// ─────────────────────────────────────────────────────────────────────────
export const SPJ_WAJIB_LUAR_ARKAS = [
  'Register KAS',
  'Berita Acara Pemeriksaan KAS',
  'Lembar Kritik / Saran',
  'Lembar Pengaduan',
  'Papan BOSP',
]

// ─────────────────────────────────────────────────────────────────────────
// 4) DETEKSI KATEGORI SPJ DARI TRANSAKSI
//    Prioritas: (1) kode rekening -> (2) kata kunci pada uraian.
//
//    CARA MENGUBAH DETEKSI:
//    - Tambah kode rekening  -> masukkan ke KODE_PATTERNS di bawah.
//    - Tambah kata kunci     -> masukkan ke KATA_KUNCI di bawah.
//    - Urutan KATA_KUNCI penting: yang lebih SPESIFIK taruh di atas.
// ─────────────────────────────────────────────────────────────────────────

// (1) Berdasarkan awalan kode rekening (paling akurat)
const KODE_PATTERNS = [
  // Honor / Upah / Perpustakaan (tenaga perpus 0061)
  { key: 'HONOR', re: [/^5\.1\.02\.02/, /^5\.1\.02\.01\.01\.0061/] },
  // Transport + SPPD
  { key: 'PERJALANAN_DINAS', re: [/^5\.1\.02\.04/] },
  // Makan & Minum
  { key: 'MAMIN', re: [/^5\.1\.02\.01\.01\.0052$/] },
  // Listrik / Air
  { key: 'TAGIHAN', re: [/^5\.2\.05\.01\.01\.0001$/, /^5\.2\.05\.01\.01\.0002$/] },
  // Bahan Cetak / Penggandaan
  { key: 'PENGGANDAAN', re: [/^5\.1\.02\.01\.01\.0025$/] },
]

// (2) Fallback berdasarkan kata kunci di uraian (urutan = prioritas)
const KATA_KUNCI = [
  { key: 'SEWA', re: /\bsewa\b/i },
  { key: 'PEMELIHARAAN', re: /pemeliharaan|perbaikan|servis|service|perawatan/i },
  { key: 'CETAK_BANNER', re: /banner|spanduk|baliho/i },
  { key: 'CETAK_FOTO', re: /cetak foto|dokumentasi foto|foto kegiatan|non silah|foto \(non/i },
  { key: 'WORKSHOP', re: /workshop|bimtek|pelatihan|seminar|sosialisasi/i },
  { key: 'PENGGANDAAN', re: /penggandaan|fotocopy|fotokopi|reproduksi/i },
  { key: 'TAGIHAN', re: /\blistrik\b|\bair\b|tagihan/i },
  { key: 'MAMIN', re: /makan|minum|konsumsi|mamin/i },
  { key: 'PERJALANAN_DINAS', re: /perjalanan dinas|sppd|perjadin|\btransport\b|perjalanan/i },
  { key: 'HONOR', re: /honor|gaji|upah|narsum|honorarium/i },
]

export function detectSpjCategory(transaction) {
  const kode = transaction?.kodeRekening || ''
  const uraian = transaction?.uraian || ''

  // 1. Berdasarkan kode rekening (paling akurat)
  for (const { key, re } of KODE_PATTERNS) {
    if (re.some((p) => p.test(kode))) return key
  }

  // 2. Fallback berdasarkan kata kunci uraian
  for (const { key, re } of KATA_KUNCI) {
    if (re.test(uraian)) return key
  }

  return 'UMUM'
}

// ─────────────────────────────────────────────────────────────────────────
// 5) BANGUN CHECKLIST LENGKAP UNTUK SATU TRANSAKSI
//    Mengembalikan: { catKey, category, groups: [ { title, icon, keterangan, items } ] }
// ─────────────────────────────────────────────────────────────────────────
export function buildSpjChecklist(transaction, { viaSiplah = false } = {}) {
  const catKey = detectSpjCategory(transaction)
  const category = SPJ_REQUIREMENTS[catKey] || SPJ_REQUIREMENTS.UMUM

  const groups = [
    {
      title: `Bukti Fisik — ${category.label}`,
      icon: category.icon,
      keterangan: category.keterangan,
      items: category.items,
    },
    {
      title: SPJ_PBJ_DOCS.label,
      icon: SPJ_PBJ_DOCS.icon,
      keterangan: SPJ_PBJ_DOCS.keterangan,
      items: SPJ_PBJ_DOCS.items,
    },
  ]

  // Dokumen wajib luar Arkas hanya jika TIDAK melalui SIPLAH
  if (!viaSiplah) {
    groups.push({
      title: 'Dokumen Wajib (Luar Arkas)',
      icon: 'folder_special',
      keterangan: 'Hanya jika TIDAK melalui SIPLAH. Jika SIPLAH, cukup Dokumen PBJ di atas.',
      items: SPJ_WAJIB_LUAR_ARKAS,
    })
  }

  return { catKey, category, groups }
}

// ─────────────────────────────────────────────────────────────────────────
// 6) CEK TRANSAKSI BERJENIS BPU / BNU (berdasarkan no. bukti)
//    Sidebar hanya menampilkan Dokumen SPJ untuk BPU & BNU.
// ─────────────────────────────────────────────────────────────────────────
export function isBpuBnu(transaction) {
  const nb = (transaction?.noBukti || '').toUpperCase()
  return nb.startsWith('BPU') || nb.startsWith('BNU')
}

export default {
  SPJ_REQUIREMENTS,
  SPJ_PBJ_DOCS,
  SPJ_WAJIB_LUAR_ARKAS,
  detectSpjCategory,
  buildSpjChecklist,
  isBpuBnu,
}
