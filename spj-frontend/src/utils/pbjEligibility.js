const KATEGORI_PBJ = new Set(['mamin', 'atk', 'pemeliharaan', 'buku', 'pembelian', 'pembelian_barang'])

/** Categories explicitly allowed to show PBJ forms in the BKU sidebar. */
export function pbjEligible(kategori) {
  return KATEGORI_PBJ.has(String(kategori || '').trim().toLowerCase())
}
