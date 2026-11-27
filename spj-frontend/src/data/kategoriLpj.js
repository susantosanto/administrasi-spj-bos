/**
 * kategoriLpj — definisi kartu Dokumen LPJ + peta kategori BKU → kartu LPJ.
 *
 * Dipindahkan dari `pages/dashboard/DokumenSPJPage.jsx` (Sprint 017, AD-1/AD-3)
 * tanpa perubahan isi, agar halaman LPJ dan sidebar BKU memakai sumber yang SAMA.
 * Pemetaan `KATEGORI_KE_CARD` dipindahkan dari `components/bku/BKUSidebar.jsx:40-46`.
 *
 * Jangan menambah kartu di sini tanpa pack sprint — daftar ini menentukan menu
 * yang tampil di Dokumen LPJ.
 */

export const CARDS = [
  {
    id: 'honor',
    nama: 'Honorarium',
    deskripsi: 'Honor/Gaji Guru, Tendik, Perpustakaan, Penjaga, Pelaksana',
    kategori: 'BKU Utama',
    icon: 'payments',
    hasTemplate: true,
    subKategori: [
      { id: 'guru', label: 'Guru', templateId: 'honor_guru' },
      { id: 'tendik', label: 'Tendik', templateId: 'honor_tendik' },
      { id: 'perpus', label: 'Perpustakaan', templateId: 'honor_perpus' },
      { id: 'penjaga', label: 'Penjaga', templateId: 'honor_penjaga' },
      { id: 'pelaksana', label: 'Pelaksana', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'perjalanan_dinas',
    nama: 'Perjalanan Dinas',
    deskripsi: 'Transport Rapat, Koordinasi, Bank, Pendamping + SPPD Otomatis',
    kategori: 'BKU Utama',
    icon: 'flight_takeoff',
    hasTemplate: true,
    isTransport: true,
    subKategori: [
      { id: 'rapat', label: 'Rapat', templateId: 'transpor_rapat' },
      { id: 'koordinasi', label: 'Koordinasi', templateId: 'transpor_koordinasi' },
      { id: 'bank', label: 'Bank', templateId: 'transpor_bank' },
      { id: 'pendamping', label: 'Pendamping', templateId: 'transpor_pendamping' },
      { id: 'workshop', label: 'Workshop', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'mamin',
    nama: 'Makan & Minum',
    deskripsi: 'Rapat, Kegiatan, Tamu — Undangan, Daftar Hadir, Resume, Foto',
    kategori: 'BKU Utama',
    icon: 'restaurant',
    hasTemplate: true,
    subKategori: [
      { id: 'rapat', label: 'Rapat', templateId: null },
      { id: 'kegiatan', label: 'Kegiatan', templateId: null },
      { id: 'tamu', label: 'Tamu', templateId: null },
    ],
  },
  {
    id: 'pemeliharaan',
    nama: 'Pemeliharaan',
    deskripsi: 'Upah Kerja, Mebeler, Bangunan',
    kategori: 'BKU Utama',
    icon: 'handyman',
    hasTemplate: true,
    subKategori: [
      { id: 'alat', label: 'Alat (Upah)', templateId: 'upah' },
      { id: 'mebeler', label: 'Mebeler', templateId: null, comingSoon: true },
      { id: 'bangunan', label: 'Bangunan', templateId: null, comingSoon: true },
    ],
  },
  {
    // Sprint 030 (US-09): alur dokumen Lomba & Workshop — Undangan,
    // Proposal, Surat Tugas, Daftar Hadir. Pemetaan kategori BKU ke kartu
    // ini TIDAK ditambahkan (route BKU = keputusan terbuka, lihat
    // BUILD-REPORT sprint-030); kartu diakses dari halaman Dokumen LPJ.
    id: 'lomba_workshop',
    nama: 'Lomba & Workshop',
    deskripsi: 'Undangan, Proposal, Surat Tugas, Daftar Hadir',
    kategori: 'BKU Utama',
    icon: 'emoji_events',
    hasTemplate: true,
    subKategori: [
      { id: 'undangan', label: 'Undangan', templateId: 'undangan_lomba' },
      // KUNCI 2026-11-26: Proposal masih dalam pengembangan — comingSoon
      // menyembunyikannya dari pemilih sub + default (lpjSidebarMuat),
      // templateId null = tak ada dokumen yang bisa dibangun.
      { id: 'proposal', label: 'Proposal', templateId: null, comingSoon: true },
      { id: 'surat_tugas', label: 'Surat Tugas', templateId: 'surat_tugas_lomba' },
      { id: 'daftar_hadir', label: 'Daftar Hadir', templateId: 'daftar_hadir_lomba' },
    ],
  },
  {
    id: 'buku',
    nama: 'Buku & Bahan Ajar',
    deskripsi: 'Buku, Modul, Bahan Praktek — hanya Dokumen Perencanaan PBJ',
    kategori: 'BKU Utama',
    icon: 'menu_book',
    hasTemplate: true,
    infoOnly: true,
    infoItems: ['Rencana Pengadaan Buku', 'Arsip Invoice', 'Bukti Terima'],
  },
  {
    id: 'penggandaan',
    nama: 'Penggandaan',
    deskripsi: 'Master, Jumlah Lembar, Bukti Pembayaran',
    kategori: 'Dokumen Pendukung',
    icon: 'content_copy',
    // Sprint 020 revisi (keputusan user 2026-10-24): hasTemplate:true agar
    // baris ATK (KATEGORI_KE_CARD.atk → 'penggandaan') lolos cardBerpanel →
    // sidebar BKU membuka tab "Dokumen LPJ" → kartu AI Dokumentasi tampil.
    // infoOnly tetap true: halaman LPJ tetap render kartu info (DetailDokumenLpjInfo),
    // tidak ada template cetak untuk penggandaan.
    hasTemplate: true,
    infoOnly: true,
    infoItems: ['Master Penggandaan', 'Jumlah Lembar', 'Bukti Pembayaran'],
  },
  {
    id: 'cetak_foto',
    nama: 'Cetak Foto',
    deskripsi: 'Daftar Foto, Bukti Cetak',
    kategori: 'Dokumen Pendukung',
    icon: 'photo_camera',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Daftar Foto', 'Bukti Cetak'],
  },
  {
    id: 'cetak_banner',
    nama: 'Cetak Banner',
    deskripsi: 'Desain Banner, Bukti Pemasangan',
    kategori: 'Dokumen Pendukung',
    icon: 'panorama',
    hasTemplate: true,
    // Sprint 030 (US-11/AC-25): sub "Desain Spanduk" = pratinjau desain
    // grafis 4 field (bukan bukti pemasangan). infoOnly tetap true —
    // halaman LPJ memakai jalur DetailDokumenLpjInfo (TemplateEngine edit),
    // tanpa panel penerima/form khusus.
    infoOnly: true,
    subKategori: [
      { id: 'desain', label: 'Desain Spanduk', templateId: 'spanduk_desain' },
    ],
    infoItems: ['Desain Banner', 'Bukti Pemasangan'],
  },
  {
    id: 'tagihan',
    nama: 'Tagihan',
    deskripsi: 'Listrik, Air, Internet (Pulsa)',
    kategori: 'Dokumen Pendukung',
    icon: 'bolt',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Invoice Listrik', 'Invoice Air', 'Invoice Pulsa Internet'],
  },
]

/**
 * Peta kategori BKU (hasil bkuKategori) → id kartu LPJ.
 * Dipindahkan dari BKUSidebar.jsx; nilai TIDAK diubah.
 */
export const KATEGORI_KE_CARD = {
  honor: 'honor',
  perjalanan_dinas: 'perjalanan_dinas',
  mamin: 'mamin',
  atk: 'penggandaan',
  pemeliharaan: 'pemeliharaan',
  // Sprint 030 (US-09): koreksi manual operator — transaksi lomba/workshop
  // yang diarahkan manual ke kartu lomba_workshop membuka tab Dokumen LPJ
  // di sidebar BKU (alur inti: upload BKU → detail transaksi). Mapping
  // rekening otomatis tetap menunggu keputusan (blocker sprint-030).
  lomba_workshop: 'lomba_workshop',
  // Kunci 2026-11-26: 'buku' & 'operasional' adalah kategori info-only.
  // 'buku' punya kartu (akses PBJ Perencanaan); 'operasional' TANPA kartu
  // (cukup struk/nota/kwitansi) → isLpj=false → tab Detail + catatan info.
  buku: 'buku',
}

/** Kartu LPJ untuk satu kategori BKU, atau null bila tidak ada / tanpa form. */
export function cardDariKategori(kategori) {
  const id = KATEGORI_KE_CARD[kategori]
  if (!id) return null
  return CARDS.find((c) => c.id === id) || null
}

/** Kartu LPJ yang benar-benar punya form & panel (A-2: infoOnly dikecualikan). */
export function cardBerpanel(kategori) {
  const card = cardDariKategori(kategori)
  return card && card.hasTemplate ? card : null
}
