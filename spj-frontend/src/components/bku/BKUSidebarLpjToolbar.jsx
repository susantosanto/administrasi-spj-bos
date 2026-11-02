/**
 * BKUSidebarLpjToolbar — konteks baris + dropdown NoBukti mirip + tombol Simpan
 * (Sprint 018, dipisah dari `BKUSidebarLpj.jsx` agar file komponen ≤200 baris).
 *
 * Sprint 019 (D-1): toolbar jadi sticky di bawah header sidebar (top-16 ≈ 64px)
 * supaya Simpan + chip progres selalu terlihat saat form digulir; chip progres
 * menampilkan sisa field wajib (klik → sorot field pertama yang bermasalah);
 * hint isian otomatis dari baris BKU.
 */
import DropdownNoBuktiMirip from './DropdownNoBuktiMirip'

const rp = (n) => `Rp ${(n || 0).toLocaleString('id-ID')}`

export default function BKUSidebarLpjToolbar({
  transaction = {},
  allTransactions = [],
  kotor = false,
  onPilihKandidat = null,
  onSimpanLaluPilih = null,
  savedAt = null,
  bisaSimpan = true,
  onSimpan = null,
  pelanggaran = [],
  onSorot = null,
}) {
  const kurang = pelanggaran.length
  return (
    <div className="sticky top-16 z-10 bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Dokumen untuk baris ini</p>
        <p className="text-sm font-bold text-slate-800 truncate" title={transaction?.uraian || ''}>
          {transaction?.noBukti ? `#${transaction.noBukti}` : 'Tanpa No Bukti'}
          <span className="font-normal text-slate-500"> · {transaction?.tanggalStr || '-'}</span>
          {transaction?.pengeluaran ? (
            <span className="font-normal text-slate-500"> · {rp(transaction.pengeluaran)}</span>
          ) : null}
        </p>
        <p className="text-[11px] text-slate-400 truncate" title={transaction?.uraian || ''}>{transaction?.uraian || '-'}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Sprint 019 (D-1): chip progres kelengkapan — klik → sorot field
            pertama yang belum terisi (sorotPelanggaran). */}
        {onSorot && (
          kurang > 0 ? (
            <button
              onClick={() => onSorot(pelanggaran[0])}
              title="Klik untuk menuju field pertama yang belum terisi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">error_outline</span>
              {kurang} field wajib belum terisi
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-[11px] font-semibold text-white">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Lengkap — siap cetak
            </span>
          )
        )}

        {/* Sprint 018 (K-1…K-4): lompat ke baris yang kode rekening + kegiatan
            sama, bulan berbeda. Berpindah = navigasi baris yang sudah ada. */}
        <DropdownNoBuktiMirip
          transaction={transaction}
          allTransactions={allTransactions}
          kotor={kotor}
          onPilih={onPilihKandidat}
          onSimpanLaluPilih={onSimpanLaluPilih}
        />

        {savedAt && (
          <span className="text-[11px] text-slate-500">
            Tersimpan {new Date(savedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        <button
          onClick={onSimpan}
          disabled={!bisaSimpan}
          title={bisaSimpan ? 'Simpan dokumen untuk NoBukti ini' : 'Baris tanpa No Bukti tidak bisa disimpan'}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            bisaSimpan
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-lg">save</span>
          Simpan
        </button>
      </div>

      {/* Sprint 019 (D-1): hint isian otomatis dari baris BKU. */}
      <p className="w-full text-[10px] text-slate-400 -mt-1">
        Isian otomatis dari baris BKU: Tanggal · No Bukti · Nominal
      </p>
    </div>
  )
}
