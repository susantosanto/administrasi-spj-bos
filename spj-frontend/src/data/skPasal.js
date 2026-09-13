/**
 * SK Pasal — Struktur data poin-poin pasal Surat Perjanjian Kerja
 *
 * Struktur:
 *   pasal: [
 *     {
 *       id: string,
 *       judul: string,
 *       pembuka?: string,           // paragraf sebelum poin (opsional)
 *       items: [ { id, text, level } ]  // level 0 = angka "1.", level 1 = huruf "a."
 *     }
 *   ]
 *
 * Teks item mendukung token {{field}} yang di-replace dengan data penerima
 * saat dirender (mis. {{kelasGuru}}).
 */
import storageHelper from '../utils/storageHelper'

const STORAGE_KEY = 'sk_pasal'

export const DEFAULT_PASAL = [
  {
    id: 'p1',
    judul: 'Pertimbangan Perjanjian Kerja',
    pembuka: 'PIHAK KESATU mengangkat PIHAK KEDUA dengan mempertimbangkan :',
    items: [
      { id: 'p1i1', text: 'Kebutuhan Sekolah untuk memenuhi Standar Pelayanan Minimal (SPM) PIHAK KESATU;', level: 0 },
      { id: 'p1i2', text: 'Kompetensi PIHAK KEDUA;', level: 0 },
      { id: 'p1i3', text: 'Kemampuan anggaran/keuangan sekolah.', level: 0 },
    ],
  },
  {
    id: 'p2',
    judul: 'Hak dan Kewajiban',
    items: [
      { id: 'p2i1', text: 'PIHAK KEDUA mempunyai hak :', level: 0 },
      { id: 'p2i2', text: 'Mengembangkan diri sesuai dengan pekerjaannya;', level: 1 },
      { id: 'p2i3', text: 'Memperoleh imbalan jasa (honor) dan/atau keuangan lain sesuai dengan peraturan yang berlaku dan kemampuan keuangan sekolah;', level: 1 },
      { id: 'p2i4', text: 'Imbalan jasa (honor);', level: 1 },
      { id: 'p2i5', text: 'Mendapat ijin tidak masuk sekolah dan/atau cuti sesuai dengan Surat Permohonan dan Surat Keterangan pihak lain yang bersangkutan;', level: 1 },
      { id: 'p2i6', text: 'Berbuat dan bertindak secara hukum untuk dan atas nama sekolah sesuai dengan tugas dan/atau ijin Kepala Sekolah.', level: 1 },
      { id: 'p2i7', text: 'PIHAK KEDUA mempunyai kewajiban :', level: 0 },
      { id: 'p2i8', text: 'Melaksanakan tugas mengajar sebagai guru kelas {{kelasGuru}};', level: 1 },
      { id: 'p2i9', text: 'Mematuhi Peraturan Sekolah baik tertulis maupun tidak tertulis;', level: 1 },
      { id: 'p2i10', text: 'Melaksanakan tugas dari Kepala Sekolah;', level: 1 },
      { id: 'p2i11', text: 'Menjaga nama baik Sekolah dan Dinas Pendidikan Kabupaten Bandung Barat.', level: 1 },
    ],
  },
  {
    id: 'p3',
    judul: 'Tupoksi Guru',
    items: [
      { id: 'p3i1', text: 'Menyusun kurikulum pembelajaran pada satuan pendidikan;', level: 0 },
      { id: 'p3i2', text: 'Menyusun silabus pembelajaran;', level: 0 },
      { id: 'p3i3', text: 'Menyusun Rencana Pelaksanaan Pembelajaran (RPP);', level: 0 },
      { id: 'p3i4', text: 'Melaksanakan kegiatan pembelajaran;', level: 0 },
      { id: 'p3i5', text: 'Menyusun alat ukur/soal sesuai mata pelajaran;', level: 0 },
      { id: 'p3i6', text: 'Menilai dan mengevaluasi proses dan hasil belajar pada mata pelajaran di kelasnya;', level: 0 },
      { id: 'p3i7', text: 'Menganalisis hasil penilaian pembelajaran;', level: 0 },
      { id: 'p3i8', text: 'Melaksanakan pembelajaran/perbaikan dan pengayaan dengan memanfaatkan hasil penilaian dan evaluasi;', level: 0 },
      { id: 'p3i9', text: 'Melaksanakan bimbingan dan konseling di kelas yang menjadi tanggungjawabnya (khusus guru kelas);', level: 0 },
      { id: 'p3i10', text: 'Membimbing siswa dalam kegiatan ekstrakurikuler proses pembelajaran;', level: 0 },
      { id: 'p3i11', text: 'Melaksanakan pengembangan diri;', level: 0 },
      { id: 'p3i12', text: 'Melaksanakan publikasi ilmiah dan/atau karya inovatif; dan', level: 0 },
      { id: 'p3i13', text: 'Melakukan presentasi ilmiah.', level: 0 },
    ],
  },
  {
    id: 'p4',
    judul: 'Beban Kerja Guru',
    pembuka:
      'Beban kerja Guru untuk melaksanakan pembelajaran paling sedikit 24 (dua puluh empat) jam tatap muka dan paling banyak 40 (empat puluh) jam tatap muka dalam 1 (satu) minggu.',
    items: [],
  },
  {
    id: 'p5',
    judul: 'Masa Berlaku Surat Perjanjian Kerja',
    items: [
      { id: 'p5i1', text: 'Surat Perjanjian Kerja ini berlaku 1 tahun semenjak ditandatangani oleh PIHAK KESATU dan PIHAK KEDUA pada awal tahun anggaran sampai dengan akhir tahun anggaran;', level: 0 },
      { id: 'p5i2', text: 'Perpanjangan Perjanjian Kerja dapat dilaksanakan oleh Kepala Sekolah sesuai dengan Pasal 1 (satu) huruf (1) (2) (3).', level: 0 },
    ],
  },
  {
    id: 'p6',
    judul: 'Perselisihan',
    items: [
      { id: 'p6i1', text: 'Apabila terjadi perselisihan antara PIHAK KESATU dengan PIHAK KEDUA dapat diselesaikan secara musyawarah mufakat di unit kerja, dan;', level: 0 },
      { id: 'p6i2', text: 'Apabila sebagaimana dimaksud pada ayat 1 (satu) tidak terlaksana, maka penyelesaian tersebut dapat difasilitasi oleh Dinas Pendidikan Kabupaten Bandung Barat.', level: 0 },
    ],
  },
  {
    id: 'p7',
    judul: 'Lain – Lain',
    items: [
      { id: 'p7i1', text: 'Surat Perjanjian Kerja :', level: 0 },
      { id: 'p7i2', text: 'Surat Perjanjian Kerja dilampiri oleh Surat Keputusan Pembagian Tugas Pendidik dan Tenaga Kependidikan.', level: 1 },
      { id: 'p7i3', text: 'Hal-hal yang belum diatur dari/atau terdapat kekeliruan dalam Surat Perjanjian Kerja ini dapat dimusyawarahkan kembali oleh kedua belah pihak.', level: 0 },
    ],
  },
  {
    id: 'p8',
    judul: 'Penutup',
    pembuka:
      'Surat Perjanjian Kerja ini dibuat dengan sebenarnya dan bersifat mengikat serta untuk selanjutnya dapat dijadikan kekuatan hukum kembali oleh kedua belah pihak.',
    items: [],
  },
]

export const cloneDefaultPasal = () => JSON.parse(JSON.stringify(DEFAULT_PASAL))

/**
 * Load pasal template yang pernah diedit user (localStorage), fallback ke default
 */
export function loadSkPasal() {
  const stored = storageHelper.get(STORAGE_KEY, null)
  if (Array.isArray(stored) && stored.length > 0) return stored
  return null
}

/**
 * Simpan pasal sebagai template reusable (localStorage)
 */
export function saveSkPasal(pasal) {
  storageHelper.set(STORAGE_KEY, pasal)
}

/**
 * Ganti token {{field}} pada teks dengan data penerima
 */
export function renderPasalText(text, data = {}) {
  return String(text || '').replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '____')
}