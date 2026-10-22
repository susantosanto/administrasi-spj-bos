/**
 * pbjTabs — konfigurasi 6 tab Dokumen PBJ (Sprint 018).
 *
 * POLA disalin dari `pages/dashboard/DokumenKelengkapanPage.jsx` (`PBJ_TABS`,
 * baris 288-343) — **disalin, bukan di-import**, supaya modul sidebar tidak
 * ter-coupled ke halaman (halaman Kelengkapan tidak boleh berubah, G-9).
 * Kalau config halaman berubah, file ini ikut disinkronkan.
 */

export const PBJ_TABS = [
  { id: 'perencanaan', label: 'Perencanaan', fields: [
    { key: 'nomorSurat', label: 'Nomor Surat' },
    // ⚠️ TEMUAN USER 2026-10-22 ("duplikat input Tanggal; Kegiatan/Pekerjaan
    // bisa diambil dari Nama Kegiatan sebelumnya"): dua field ini TIDAK
    // ditampilkan sebagai input di sidebar karena sudah punya sumber tunggal —
    // Tanggal ← baris BKU, Kegiatan/Pekerjaan ← "Nama Kegiatan" (seksi 1).
    // Nilainya tetap ada di state (diisi `sinkronPbjDariSumber`) supaya ikut
    // tercetak. Halaman Dokumen Kelengkapan tidak memakai file ini (G-9).
    { key: 'tanggalSurat', label: 'Tanggal', type: 'date', turunan: 'tanggalBku' },
    { key: 'kegiatan', label: 'Kegiatan/Pekerjaan', turunan: 'namaKegiatan' },
    { key: 'spesifikasi', label: 'Spesifikasi', type: 'textarea' },
    { key: 'alokasi', label: 'Alokasi Anggaran (Rp)' },
    { key: 'syaratA', label: 'Syarat penyedia (a)' },
    { key: 'syaratB', label: 'Syarat penyedia (b)' },
    { key: 'syaratC', label: 'Syarat penyedia (c)' },
    { key: 'namaPelaksana', label: 'Pelaksana' },
  ] },
  { id: 'pesanan', label: 'Surat Pesanan', fields: [
    { key: 'nomorPesanan', label: 'Nomor Pesanan' },
    { key: 'tanggalPesanan', label: 'Tanggal Pesanan', type: 'date' },
    { key: 'kepadaPesanan', label: 'Kepada (Penyedia)' },
    { key: 'alamatToko', label: 'Alamat Penyedia' },
    { key: 'grandTotal', label: 'Grand Total (Rp)' },
  ] },
  { id: 'bahp', label: 'BAHP', fields: [
    { key: 'nomorBahp', label: 'Nomor BAHP' },
    { key: 'tanggalPeriksa', label: 'Tanggal Periksa', type: 'date' },
    { key: 'acuanPesanan', label: 'Acuan Pesanan/Invoice' },
    { key: 'namaPemeriksa', label: 'Nama Pemeriksa' },
    { key: 'hasilPeriksa', label: 'Hasil Pemeriksaan', type: 'textarea' },
  ] },
  { id: 'bast', label: 'BAST', fields: [
    { key: 'nomorBast', label: 'Nomor BAST' },
    { key: 'tanggalTerima', label: 'Tanggal Terima', type: 'date' },
    { key: 'pihakPertama', label: 'Pihak Pertama (Penyedia)' },
    { key: 'pihakKedua', label: 'Pihak Kedua (Penerima)' },
    { key: 'kesesuaian', label: 'Kesesuaian', type: 'select', options: ['Sesuai', 'Belum Sesuai'] },
    { key: 'kondisi', label: 'Kondisi', type: 'select', options: ['Baik', 'Rusak'] },
  ] },
  { id: 'nego', label: 'Negosiasi', fields: [
    { key: 'nomorNego', label: 'Nomor' },
    { key: 'tanggalNego', label: 'Tanggal', type: 'date' },
    { key: 'produkI', label: 'Produk I (Penyedia invoice)' },
    { key: 'produkII', label: 'Produk II (Pembanding)' },
  ] },
  { id: 'data', label: 'Data', fields: [
    { key: 'bulan', label: 'Bulan' },
    { key: 'noBukti', label: 'No. Bukti' },
    { key: 'tanggalPesanan', label: 'Tgl. Pesanan', type: 'date' },
    { key: 'jumlahBarang', label: 'Jumlah Barang/Jasa' },
    { key: 'spesifikasi', label: 'Spesifikasi/ruang lingkup', type: 'textarea' },
    { key: 'waktuSerah', label: 'Waktu serah terima' },
    { key: 'alokasi', label: 'Alokasi Anggaran (Rp)' },
    { key: 'jenisPenyedia', label: 'Penyedia', type: 'select', options: ['Perorangan', 'Badan Usaha'] },
    { key: 'namaPenyedia', label: 'nama penyedia' },
    { key: 'direktur', label: 'Direktur penyedia' },
    { key: 'npwp', label: 'NPWP' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'telp', label: 'No. Telp' },
  ] },
]

export const TAB_IDS = PBJ_TABS.map((t) => t.id)

/**
 * Field yang benar-benar ditampilkan sebagai input (revisi 2026-10-22).
 * Field bertanda `turunan` punya sumber tunggal di tempat lain (Tanggal ← baris
 * BKU, Kegiatan/Pekerjaan ← Nama Kegiatan) sehingga tidak boleh ada input kedua.
 */
export function fieldsTampil(def = {}) {
  return (def.fields || []).filter((f) => !f.turunan)
}

/**
 * Tab yang tampil untuk satu mode pengadaan (revisi 2026-10-22).
 *
 * Aturannya SAMA dengan halaman Dokumen Kelengkapan (`terapkanMode`/`pbjDocs`):
 * SIPLAH → hanya Perencanaan (1 dokumen); NON-SIPLAH → keenam dokumen.
 */
export function tabsUntukMode(mode = 'non') {
  return mode === 'siplah' ? PBJ_TABS.filter((t) => t.id === 'perencanaan') : PBJ_TABS
}

export default PBJ_TABS
