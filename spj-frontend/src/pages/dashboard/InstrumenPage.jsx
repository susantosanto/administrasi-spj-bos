/**
 * InstrumenPage — Sprint 024: Instrumen BOS (5 seksi A–E + cetak).
 * Source: template/Form isian_BOS  2026 SDN PASIRHALANG.doc
 *
 * A/B/C/E = isian manual per tahun (`spj_instrumen_{tahun}`); D = live
 * dari mesin Realisasi (tahap 1+2 + koreksi); E bulanan + pajak dari BKU.
 * Preview + cetak via PanelPreviewDocument (pola Kelengkapan).
 */
import { useState } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import PanelPreviewDocument from '../../components/templates/PanelPreviewDocument'
import { agregatRealisasi, denganKoreksi } from '../../utils/realisasiAgregat'
import { instrumenDocs } from '../../utils/previewDocs'
import { getSchoolData, getPejabat } from '../../utils/sekolahData'

// Nilai otomatis per field (ditampilkan sebagai placeholder; ketikan menang).
function nilaiOtomatis(seksi, key) {
  const sk = getSchoolData()
  if (seksi === 'a') {
    const p = {
      namaSekolah: sk.namaSekolah, kecamatan: sk.kecamatan, npsn: sk.npsn,
      status: sk.status, ijin: sk.ijin, telepon: sk.telepon, email: sk.email,
      noRekening: sk.nomorRekening, bank: sk.bankRekening, namaRekening: sk.namaRekening,
      ksNama: getPejabat('ks').nama, ksSk: sk.skKepala, ksTmt: sk.tmtJabatan,
      jmlGuru: sk.jmlGuru, jmlGuruPns: sk.jmlGuruPns, jmlGuruNonAsn: sk.jmlGuruNonAsn,
      jmlTendik: sk.jmlTendik, jmlTendikPns: sk.jmlTendikPns, jmlTendikNonAsn: sk.jmlTendikNonAsn,
      jmlSiswa: sk.jmlSiswa,
    }
    return p[key] || ''
  }
  if (seksi === 'b') {
    const p = { penanggungjawab: getPejabat('ks').nama, bendahara: getPejabat('bendahara').nama }
    return p[key] || ''
  }
  return ''
}

const INPUT = 'mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-white'
const LABEL = 'block text-xs text-slate-600'

const SEKSI = [
  { id: 'a', judul: 'A. Data Umum', fields: [
    { key: 'namaSekolah', label: 'Nama Sekolah' }, { key: 'kecamatan', label: 'Kecamatan' },
    { key: 'status', label: 'Status (Negeri/Swasta)' }, { key: 'npsn', label: 'NPSN' },
    { key: 'ijin', label: 'Ijin Menyelenggarakan Pendidikan' }, { key: 'noRekening', label: 'Nomor Rekening' },
    { key: 'bank', label: 'Bank' }, { key: 'namaRekening', label: 'Nama pada Rekening' },
    { key: 'ksNama', label: 'KS — Nama Lengkap' }, { key: 'ksPangkat', label: 'Pangkat, Golongan/Ruang' },
    { key: 'ksSk', label: 'Nomor/Tgl. SK. Jabatan' }, { key: 'ksTmt', label: 'TMT Jabatan' },
    { key: 'jmlGuru', label: 'Guru selain KS' }, { key: 'jmlGuruPns', label: 'Guru PNS' },
    { key: 'jmlGuruNonAsn', label: 'Guru Non ASN' }, { key: 'jmlTendik', label: 'Tenaga Kependidikan' },
    { key: 'jmlTendikPns', label: 'Tendik PNS' }, { key: 'jmlTendikNonAsn', label: 'Tendik Non ASN' },
    { key: 'jmlSiswa', label: 'Jumlah Siswa' }, { key: 'telepon', label: 'Telepon' },
    { key: 'email', label: 'Email' },
  ] },
  { id: 'b', judul: 'B. Tim BOS Sekolah', fields: [
    { key: 'skNomor', label: 'SK. Nomor' }, { key: 'penanggungjawab', label: 'Penanggungjawab' },
    { key: 'bendahara', label: 'Bendahara' }, { key: 'anggota', label: 'Anggota' },
  ] },
  { id: 'c', judul: 'C. Anggaran', fields: [
    { key: 'perSiswa', label: 'Nilai BOS per Siswa (Rp)' }, { key: 'jmlSiswa', label: 'Jumlah Siswa' },
    { key: 'total', label: 'Total Dana (otomatis bila kosong)' },
  ] },
  { id: 'e', judul: 'E. Penatausahaan', fields: [
    { key: 'saldoAwal', label: 'Saldo Awal (1 Januari, Rp)' }, { key: 'sdTanggal', label: 'Penggunaan s/d' },
    { key: 'tempatTtd', label: 'Tempat TTD' }, { key: 'pembukuan', label: 'Pembukuan (koma)' },
  ] },
]

export default function InstrumenPage() {
  const toast = useToast()
  const [tahun, setTahun] = useState(() => {
    const bku = storageHelper.get('bku_data', null)
    return String(bku?.header?.tahunAnggaran || new Date().getFullYear())
  })
  const [segar, setSegar] = useState(0)
  const kunci = `spj_instrumen_${tahun}`
  const data = storageHelper.get(kunci, {})

  const setField = (seksi, key, value) => {
    const semua = storageHelper.get(kunci, {})
    storageHelper.set(kunci, { ...semua, [seksi]: { ...(semua[seksi] || {}), [key]: value } })
    setSegar((v) => v + 1)
  }

  const txs = storageHelper.get('bku_data', null)?.transactions || []
  const kor = storageHelper.get('spj_realisasi_koreksi', {})
  const sub = (tahap) => {
    const out = {}
    for (const [k, v] of Object.entries(kor)) {
      if (k.startsWith(`${tahun}-${tahap}-`)) out[k.slice(`${tahun}-${tahap}-`.length)] = v
    }
    return out
  }
  const agT1 = denganKoreksi(agregatRealisasi(txs, { tahap: 1 }), sub(1))
  const agT2 = denganKoreksi(agregatRealisasi(txs, { tahap: 2 }), sub(2))
  const docs = instrumenDocs({ tahun, instrumen: data, agT1, agT2, txs })

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Topbar title="Instrumen BOS" subtitle="Penyaluran & Penggunaan Dana BOS" />
      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-2">
          <span className="material-symbols-outlined text-primary">assignment</span>
          <h2 className="text-sm font-bold text-slate-900">Tahun Anggaran</h2>
          <div className="flex gap-1 ml-2">
            {[2025, 2026, 2027].map((t) => (
              <button key={t} onClick={() => setTahun(String(t))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${String(t) === tahun ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
            ))}
          </div>
          <p className="w-full text-[11px] text-slate-500">Seksi D (realisasi) otomatis dari BKU + koreksi. A/B/C/E diketik, tersimpan per tahun.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            {SEKSI.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">{s.judul}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(s.id === 'e' ? [...s.fields] : s.fields).map((f) => {
                    const auto = nilaiOtomatis(s.id, f.key)
                    return (
                      <label key={f.key} className={LABEL}>{f.label}
                        <input value={data[s.id]?.[f.key] || ''} onChange={(e) => setField(s.id, f.key, e.target.value)}
                          placeholder={auto ? `Otomatis: ${auto}` : 'Isi manual'}
                          className={INPUT} />
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <aside className="print:hidden lg:sticky lg:top-[88px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document</h3>
            <PanelPreviewDocument title={`Instrumen BOS ${tahun}`} docs={docs}
              status={{ perlu: 0, violations: [] }} cetakAktif
              onCek={() => toast.success('LENGKAP — siap cetak')}
              onCetak={() => window.print()} />
          </aside>
        </div>
      </div>
    </div>
  )
}
