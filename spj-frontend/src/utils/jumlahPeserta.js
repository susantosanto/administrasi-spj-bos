/**
 * Bentuk teks jumlah peserta untuk dokumen notula.
 * Hitung nama yang terisi (bukan semua baris kosong); nilai manual yang
 * sudah tersedia tetap menjadi sumber utama.
 */
export function jumlahPesertaNotulen({ pesertaJumlah, peserta, rows = [] } = {}) {
  const manual = String(pesertaJumlah ?? '').trim()
  if (manual) return manual

  const names = Array.isArray(rows)
    ? rows.filter((row) => String(row?.nama ?? '').trim()).map((row) => String(row.nama).trim())
    : []
  const nameCount = names.length
  const pastedNames = String(peserta ?? '').trim()
  const count = nameCount || (pastedNames ? pastedNames.split(/[,;\n]/).filter((name) => name.trim()).length : 0)
  return count ? `${count} orang` : ''
}
