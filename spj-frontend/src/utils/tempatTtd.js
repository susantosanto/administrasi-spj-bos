/**
 * tempatTtd — sumber TUNGGAL untuk nama tempat pada baris "<tempat>, <tanggal>"
 * di atas blok tanda tangan.
 *
 * ⚠️ TEMUAN USER 2026-10-22: "nama tempat sebelum tanggal di atas TTD jadikan
 * default Cikalongwetan saja di semua dokumen". Sebelumnya `SignatureFooter`
 * membaca `data.tempat` — field yang artinya **tempat ACARA** (mis. "Ruang Rapat
 * SD NEGERI LEBAKLEUNGSIR" hasil isian otomatis Mamin). Akibatnya dokumen
 * Undangan / Pesanan / Daftar Penerima Honor / Transport / Upah mencetak
 * "Ruang Rapat SD NEGERI LEBAKLEUNGSIR, 22 Oktober 2026" di atas TTD.
 *
 * Aturan sekarang:
 * - tempat TTD punya kunci SENDIRI (`tempatTtd`) — tidak lagi meminjam `tempat`;
 * - kosong → default `Cikalongwetan` (diminta user, berlaku untuk semua dokumen);
 * - masih bisa diubah user lewat input di blok TTD (mode edit).
 */

export const TEMPAT_TTD = 'Cikalongwetan'

/** Nama tempat untuk baris TTD: isian user → default Cikalongwetan. */
export function tempatTtdDari(data = {}) {
  const isi = String(data?.tempatTtd || '').trim()
  return isi || TEMPAT_TTD
}

export default { TEMPAT_TTD, tempatTtdDari }
