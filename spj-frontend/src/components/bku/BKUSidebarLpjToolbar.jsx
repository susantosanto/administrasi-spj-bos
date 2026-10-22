/**
 * BKUSidebarLpjToolbar — konteks baris + dropdown NoBukti mirip + tombol Simpan
 * (Sprint 018, dipisah dari `BKUSidebarLpj.jsx` agar file komponen ≤200 baris).
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
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
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
    </div>
  )
}
