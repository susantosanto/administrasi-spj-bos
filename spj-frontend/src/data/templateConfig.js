/**
 * Template Configurations — Single Source of Truth
 * RESEARCH §2.1
 *
 * Setiap template didefinisikan dengan:
 * - id: identifier unik
 * - label: nama tampilan
 * - card: card mana yang menggunakan template ini
 * - sub_kategori: sub-kategori di dalam card
 * - sourceFile: file asli (DOCX/Excel)
 * - blocks: urutan block yang di-render
 * - defaults: nilai default
 */

export const TEMPLATE_CONFIGS = {
  // ─── NOTULEN (DOCX) ───
  notulen: {
    id: 'notulen',
    label: 'Notulen Rapat',
    card: 'mamin',
    sub_kategori: 'notulen',
    sourceFile: '/templates/NOTULEN RAPAT.docx',
    blocks: [
      { type: 'kop-surat' },
      {
        type: 'header',
        judul: 'NOTULA RAPAT',
        nomor: false,
        showBulan: false,
      },
      {
        type: 'table-fields',
        fields: [
          { key: 'hari', label: 'Hari', type: 'text' },
          { key: 'tanggal', label: 'Tanggal', type: 'date' },
          { key: 'waktu', label: 'Waktu', type: 'text' },
          { key: 'tempat', label: 'Tempat', type: 'text' },
          { key: 'acara', label: 'Acara', type: 'textarea' },
          { key: 'pimpinan', label: 'Pimpinan Rapat', type: 'text' },
          { key: 'pembuka', label: 'Rapat dibuka oleh', type: 'text' },
          { key: 'notulen', label: 'Notulen', type: 'text' },
          { key: 'peserta', label: 'Peserta Rapat', type: 'textarea' },
        ],
      },
      {
        type: 'poin-pembahasan',
        label: 'Rapat membahas dan menyimpulkan sebagai berikut:',
      },
      { type: 'signature', roles: ['pimpinan', 'notulen'], showDibayarLunas: false },
    ],
    defaults: {
      tempat: 'SD NEGERI LEBAKLEUNGSIR',
    },
  },

  // ─── BUKU TAMU (DOCX) ───
  buku_tamu: {
    id: 'buku_tamu',
    label: 'Buku Tamu Kedinasan',
    card: 'mamin',
    sub_kategori: 'buku_tamu',
    sourceFile: '/templates/BUKU TAMU KEDINASAN.docx',
    blocks: [
      { type: 'kop-surat' },
      {
        type: 'header',
        judul: 'BUKU TAMU KEDINASAN',
        nomor: false,
        showBulan: false,
      },
      {
        type: 'table-fields',
        fields: [
          { key: 'noUrut', label: 'No. Urut', type: 'number' },
          { key: 'tanggal', label: 'Hari/Tanggal', type: 'date' },
          {
            key: 'bertemu',
            label: 'Ingin bertemu dengan',
            type: 'select',
            options: ['Kepala Sekolah', 'Guru', 'Tendik'],
          },
          { key: 'tiba', label: 'Tiba Pukul', type: 'time' },
          { key: 'kembali', label: 'Kembali Pukul', type: 'time' },
        ],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No.', width: 5 },
          { key: 'nama', label: 'NAMA', width: 25 },
          { key: 'jabatan', label: 'JABATAN', width: 20 },
          { key: 'alamat', label: 'ALAMAT KANTOR', width: 30 },
          { key: 'ttd', label: 'TANDA TANGAN', width: 20 },
        ],
      },
      { type: 'uraian-kegiatan' },
      { type: 'signature', roles: ['kepala-sekolah'] },
    ],
    defaults: {},
  },

  // ─── SPPD (DOCX) ───
  sppd: {
    id: 'sppd',
    label: 'Surat Perintah Tugas + SPD',
    card: 'perjalanan_dinas',
    sub_kategori: 'sppd',
    sourceFile: '/templates/Surat Tugas + SPPD_rapat ops_gugus_2026.docx',
    blocks: [
      { type: 'kop-surat' },
      {
        type: 'header',
        judul: 'SURAT PERINTAH TUGAS',
        nomor: true,
        showBulan: false,
      },
      {
        type: 'table-fields',
        fields: [
          { key: 'nama', label: 'Yang diberi tugas', type: 'text' },
          { key: 'nip', label: 'NIP', type: 'text' },
          { key: 'jabatan', label: 'Jabatan', type: 'text' },
          { key: 'tujuan', label: 'Untuk keperluan', type: 'textarea' },
          { key: 'tanggal', label: 'Tanggal', type: 'date' },
          { key: 'tempat', label: 'Tempat', type: 'text' },
          { key: 'lama', label: 'Lama perjalanan', type: 'text' },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah'] },
    ],
    defaults: {
      nomorSurat: '400.3.7.6/___-SD/2026',
      tempat: 'Cikalongwetan',
    },
  },

  // ─── HONOR GURU (Excel) ───
  // Kolom Excel: NO | NAMA PTK | NUPTK | JABATAN | GURU | TAS/Operator | Pembina Ekskul | JUMLAH | Gol/Ruang | VOLUME | SATUAN | PPh 21 | YANG DITERIMA | TTD
  // Rumus: JUMLAH = GURU + TAS/Operator + Ekskul
  // Rumus: DITERIMA = JUMLAH - PPh 21
  honor_guru: {
    id: 'honor_guru',
    label: 'Honorarium Guru',
    card: 'honor',
    sub_kategori: 'guru',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA HONORARIUM/GAJI GURU TIDAK TETAP',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'NO', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 16 },
          { key: 'nuptk', label: 'NUPTK', width: 14 },
          { key: 'jabatan', label: 'JABATAN', width: 12 },
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency' },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'volume', label: 'VOL', width: 5 },
          { key: 'satuan', label: 'SATUAN', width: 7 },
          { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
          { key: 'diterima', label: 'YANG DITERIMA (Rp)', width: 12, format: 'currency',
            auto: { type: 'sub', fields: ['jumlah', 'pph'] } },
          { key: 'ttd', label: 'TTD', width: 4 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Pembayaran Honor Guru',
      kodeRekening: '5.1.02.02.01.0013',
      kodePenggunaan: '12',
    },
  },

  // ─── HONOR TENDIK (Excel) ───
  honor_tendik: {
    id: 'honor_tendik',
    label: 'Honorarium Tendik',
    card: 'honor',
    sub_kategori: 'tendik',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA HONORARIUM/GAJI TENDIK',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'NO', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 16 },
          { key: 'jabatan', label: 'JABATAN', width: 14 },
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency' },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'volume', label: 'VOL', width: 5 },
          { key: 'satuan', label: 'SATUAN', width: 7 },
          { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
          { key: 'diterima', label: 'YANG DITERIMA (Rp)', width: 12, format: 'currency',
            auto: { type: 'sub', fields: ['jumlah', 'pph'] } },
          { key: 'ttd', label: 'TTD', width: 4 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Pembayaran Honor Tendik',
      kodeRekening: '5.1.02.02.01.0013',
      kodePenggunaan: '12',
    },
  },

  // ─── HONOR PERPUSTAKAAN (Excel) ───
  // Kolom: NO | NAMA PTK | JABATAN | TENAGA PERPUSTAKAAN | Pembina Ekskul | GURU | TAS/Operator | JUMLAH | Gol/Ruang | PPh 21 | YANG DITERIMA | TTD
  honor_perpus: {
    id: 'honor_perpus',
    label: 'Honorarium Perpustakaan',
    card: 'honor',
    sub_kategori: 'perpus',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA HONORARIUM/GAJI PERPUSTAKAAN',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
          type: 'table-dinamis',
          columns: [
            { key: 'no', label: 'NO', width: 4 },
            { key: 'nama', label: 'NAMA PTK', width: 16 },
            { key: 'jabatan', label: 'JABATAN', width: 14 },
            { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency' },
            { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
            { key: 'volume', label: 'VOL', width: 5 },
            { key: 'satuan', label: 'SATUAN', width: 7 },
            { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
            { key: 'diterima', label: 'YANG DITERIMA (Rp)', width: 12, format: 'currency',
              auto: { type: 'sub', fields: ['jumlah', 'pph'] } },
            { key: 'ttd', label: 'TTD', width: 4 },
          ],
        },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Pembayaran Honor Perpustakaan',
      kodeRekening: '5.1.02.02.01.0013',
      kodePenggunaan: '12',
    },
  },

  // ─── HONOR PENJAGA (Excel) ───
  // Kolom: NO | NAMA PTK | JABATAN | PENJAGA | GURU | Pembina Ekskul | TENAGA PERPUSTAKAAN | JUMLAH | Gol/Ruang | VOLUME | SATUAN | PPh 21 | YANG DITERIMA | TTD
  honor_penjaga: {
    id: 'honor_penjaga',
    label: 'Honorarium Penjaga',
    card: 'honor',
    sub_kategori: 'penjaga',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA HONORARIUM/GAJI PENJAGA',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
          type: 'table-dinamis',
          columns: [
            { key: 'no', label: 'NO', width: 4 },
            { key: 'nama', label: 'NAMA PTK', width: 16 },
            { key: 'jabatan', label: 'JABATAN', width: 14 },
            { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency' },
            { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
            { key: 'volume', label: 'VOL', width: 5 },
            { key: 'satuan', label: 'SATUAN', width: 7 },
            { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
            { key: 'diterima', label: 'YANG DITERIMA (Rp)', width: 12, format: 'currency',
              auto: { type: 'sub', fields: ['jumlah', 'pph'] } },
            { key: 'ttd', label: 'TTD', width: 4 },
          ],
        },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Pembayaran Honor Penjaga',
      kodeRekening: '5.1.02.02.01.0013',
      kodePenggunaan: '12',
    },
  },

  // ─── TRANSPORT RAPAT (Excel) ───
  // Kolom: NO | NAMA PTK | JABATAN | Gol/Ruang | VOL | SATUAN | UNIT COST | JUMLAH | TTD
  // Rumus: JUMLAH = VOL × UNIT COST
  transpor_rapat: {
    id: 'transpor_rapat',
    label: 'Transport Rapat',
    card: 'perjalanan_dinas',
    sub_kategori: 'rapat',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA TRANSPORT RAPAT',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 18 },
          { key: 'jabatan', label: 'JABATAN', width: 14 },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'vol', label: 'VOL', width: 6 },
          { key: 'satuan', label: 'SATUAN', width: 10 },
          { key: 'unitCost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
          // Auto: JUMLAH = VOL × UNIT COST
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency',
            auto: { type: 'mul', fields: ['vol', 'unitCost'] } },
          { key: 'ttd', label: 'TTD', width: 5 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Transport Rapat',
      kodeRekening: '5.1.02.04.01.0003',
      kodePenggunaan: '12',
    },
  },

  // ─── TRANSPORT KOORDINASI (Excel) ───
  transpor_koordinasi: {
    id: 'transpor_koordinasi',
    label: 'Transport Koordinasi',
    card: 'perjalanan_dinas',
    sub_kategori: 'koordinasi',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA TRANSPORT KOORDINASI',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 18 },
          { key: 'jabatan', label: 'JABATAN', width: 14 },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'vol', label: 'VOL', width: 6 },
          { key: 'satuan', label: 'SATUAN', width: 10 },
          { key: 'unitCost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency',
            auto: { type: 'mul', fields: ['vol', 'unitCost'] } },
          { key: 'ttd', label: 'TTD', width: 5 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Transport Koordinasi',
      kodeRekening: '5.1.02.04.01.0003',
      kodePenggunaan: '12',
    },
  },

  // ─── TRANSPORT BANK (Excel) ───
  transpor_bank: {
    id: 'transpor_bank',
    label: 'Transport Bank',
    card: 'perjalanan_dinas',
    sub_kategori: 'bank',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA TRANSPORT BANK',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 18 },
          { key: 'jabatan', label: 'JABATAN', width: 14 },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'vol', label: 'VOL', width: 6 },
          { key: 'satuan', label: 'SATUAN', width: 10 },
          { key: 'unitCost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency',
            auto: { type: 'mul', fields: ['vol', 'unitCost'] } },
          { key: 'ttd', label: 'TTD', width: 5 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Transport Bank',
      kodeRekening: '5.1.02.04.01.0003',
      kodePenggunaan: '12',
    },
  },

  // ─── TRANSPORT PENDAMPING (Excel) ───
  transpor_pendamping: {
    id: 'transpor_pendamping',
    label: 'Transport Pendamping',
    card: 'perjalanan_dinas',
    sub_kategori: 'pendamping',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA TRANSPORT PENDAMPING',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 18 },
          { key: 'jabatan', label: 'JABATAN', width: 14 },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'vol', label: 'VOL', width: 6 },
          { key: 'satuan', label: 'SATUAN', width: 10 },
          { key: 'unitCost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency',
            auto: { type: 'mul', fields: ['vol', 'unitCost'] } },
          { key: 'ttd', label: 'TTD', width: 5 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Transport Pendamping',
      kodeRekening: '5.1.02.04.01.0003',
      kodePenggunaan: '12',
    },
  },

  // ─── UPAH (Excel) ───
  // Kolom: NO | NAMA PTK | JABATAN | Gol/Ruang | VOLUME | SATUAN | UNIT COST | JUMLAH | PPh 21 | YANG DITERIMA | TTD
  // Rumus: JUMLAH = VOL × UNIT COST; DITERIMA = JUMLAH - PPh 21
  upah: {
    id: 'upah',
    label: 'Upah Kerja',
    card: 'pemeliharaan',
    sub_kategori: 'alat',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA UPAH KERJA',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 16 },
          { key: 'jabatan', label: 'JABATAN', width: 12 },
          { key: 'golRuang', label: 'Gol./Ruang', width: 8 },
          { key: 'volume', label: 'VOLUME', width: 6 },
          { key: 'satuan', label: 'SATUAN', width: 8 },
          { key: 'unitCost', label: 'UNIT COST (Rp)', width: 11, format: 'currency' },
          // Auto: JUMLAH = VOL × UNIT COST
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 11, format: 'currency',
            auto: { type: 'mul', fields: ['volume', 'unitCost'] } },
          { key: 'pph', label: 'PPh 21', width: 8, format: 'currency' },
          // Auto: DITERIMA = JUMLAH - PPh 21
          { key: 'diterima', label: 'YANG DITERIMA (Rp)', width: 11, format: 'currency',
            auto: { type: 'sub', fields: ['jumlah', 'pph'] } },
          { key: 'ttd', label: 'TTD', width: 4 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Upah Kerja',
      kodeRekening: '5.1.02.02.01.0016',
      kodePenggunaan: '12',
    },
  },

  // ─── PULSA (Excel) ───
  // Kolom: NO | NAMA PTK | JABATAN | NOMOR HP | VOL | SATUAN | UNIT COST | JUMLAH | TTD
  // Rumus: JUMLAH = VOL × UNIT COST
  pulsa: {
    id: 'pulsa',
    label: 'Pulsa Internet',
    card: 'tagihan',
    sub_kategori: 'pulsa',
    sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
    orientation: 'landscape',
    blocks: [
      {
        type: 'header',
        judul: 'DAFTAR PENERIMA PULSA INTERNET',
        nomor: false, showBulan: true,
      },
      {
        type: 'info-keuangan',
        leftFields: ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten'],
        rightFields: ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'no', label: 'No', width: 4 },
          { key: 'nama', label: 'NAMA PTK', width: 18 },
          { key: 'jabatan', label: 'JABATAN', width: 12 },
          { key: 'noHp', label: 'NOMOR HP', width: 14 },
          { key: 'vol', label: 'VOL', width: 6 },
          { key: 'satuan', label: 'SATUAN', width: 8 },
          { key: 'unitCost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
          // Auto: JUMLAH = VOL × UNIT COST
          { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency',
            auto: { type: 'mul', fields: ['vol', 'unitCost'] } },
          { key: 'ttd', label: 'TTD', width: 5 },
        ],
      },
      { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
    ],
    defaults: {
      bulan: 'Januari',
      tahun: '2026',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Pulsa Internet',
      kodeRekening: '5.1.02.02.01.0063',
      kodePenggunaan: '12',
    },
  },

  // ─── BUKU KAS UMUM (BKU) - Excel ───
  bku: {
    id: 'bku',
    label: 'Buku Kas Umum (BKU)',
    card: 'keuangan',
    sub_kategori: 'bku',
    sourceFile: '/templates/BKU_SDN_Lebakleungsir.xlsx',
    blocks: [
      {
        type: 'header',
        judul: 'BUKU KAS UMUM',
        nomor: false,
        showBulan: false,
      },
      {
        type: 'info-keuangan',
        fields: ['npsn', 'namaSekolah', 'tahunAnggaran', 'bulan'],
      },
      {
        type: 'table-dinamis',
        columns: [
          { key: 'noUrut', label: 'No. Urut', width: 8 },
          { key: 'tanggal', label: 'Tanggal', width: 12 },
          { key: 'kodeRekening', label: 'Kode Rekening', width: 18 },
          { key: 'uraian', label: 'Uraian', width: 30 },
          { key: 'jenisTransaksi', label: 'Jenis Transaksi', width: 15 },
          { key: 'noBukti', label: 'No. Bukti', width: 12 },
          { key: 'debet', label: 'Debet (Rp)', width: 15, format: 'currency' },
          { key: 'kredit', label: 'Kredit (Rp)', width: 15, format: 'currency' },
          { key: 'saldo', label: 'Saldo (Rp)', width: 15, format: 'currency' },
          { key: 'keterangan', label: 'Keterangan', width: 15 },
        ],
      },
      { type: 'signature', roles: ['bendahara', 'kepala-sekolah'] },
    ],
    defaults: {
      npsn: '20212345',
      namaSekolah: 'SD NEGERI LEBAKLEUNGSIR',
      tahunAnggaran: '2026',
      bulan: 'Januari',
      program: '07 Pengembangan Standar Pembiayaan',
      kegiatan: 'Buku Kas Umum',
      kodeRekening: '1.1.1.01.01',
    },
    // BKU-specific configuration for Excel parsing (TERVERIFIKASI dari file asli ARKAS)
    excelConfig: {
      sheetName: 'Page1',
      headerFields: {
        NPSN: { row: 4, col: 4 },          // Row 5, Col E (0-indexed)
        NAMA_SEKOLAH: { row: 6, col: 4 },   // Row 7, Col E
        TAHUN_ANGGARAN: { row: 2, col: 0 },  // Row 3, Col A (parsed from "TAHUN : 2026")
        ALAMAT: { row: 8, col: 4 },          // Row 9, Col E
        KABUPATEN: { row: 10, col: 4 },      // Row 11, Col E
        PROVINSI: { row: 12, col: 4 },       // Row 13, Col E
      },
      dataColumns: {
        TANGGAL: 'A',
        KODE_KEGIATAN: 'D',
        KODE_REKENING: 'F',
        NO_BUKTI: 'I',
        URAIAN: 'K',
        PENERIMAAN: 'N',
        PENGELUARAN: 'Q',
        SALDO: 'T',
      },
      dataStartRow: 16,   // Row 16 (data dimulai setelah header + number row)
      dataEndRow: 340,
      sheetRef: 'Page1'
    }
  },
}

export default TEMPLATE_CONFIGS
