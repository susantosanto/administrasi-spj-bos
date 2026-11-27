/**
 * KegiatanLombaDocs — 4 blok alur dokumen Lomba & Workshop (Sprint 030, US-09).
 *
 * Struktur Proposal dipetakan dari:
 *   template/2. Workshop Nulis Jeng Maca Aksara Sunda Tahun 2026.docx
 * (LEMBAR PENGESAHAN + BAB I/II/III). DOCX hanya sumber STRUKTUR — nama,
 * angka, anggaran, dan dasar hukum contoh TIDAK dijadikan default/isi
 * (AC-22): semua field kosong untuk dilengkapi operator (AC-09 US-09).
 *
 * Pola dua wajah: mode "edit" = input layar (blue-only), mode "print" =
 * dokumen formal A4. Blok cetak murni lama (SuratUndanganPaper,
 * DaftarHadirPaper, SuratTugas) dipakai ulang sebagai output cetak —
 * 0 duplikasi layout.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'
import SuratUndanganPaper from './SuratUndanganPaper'
import DaftarHadirPaper from './DaftarHadirPaper'
import SuratTugas from './SuratTugas'

// ─── Helper input edit-mode (gaya TabelFields, blue-only) ───────────────────
function EditInput({ field, value, onChange }) {
  const cls =
    'w-full border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none'
  if (field.type === 'textarea') {
    return (
      <textarea
        className={cls}
        rows={field.rows || 4}
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder || ''}
      />
    )
  }
  return (
    <input
      type="text"
      className={cls}
      value={value || ''}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder || ''}
    />
  )
}

function EditFields({ fields, data, onChange }) {
  return (
    <table className="surat-polos w-full text-xs mb-4">
      <tbody>
        {fields.map((f) => (
          <tr key={f.key} className="border-b border-dashed border-outline-variant align-top">
            <td className="w-44 py-1.5 font-medium text-gray-700">{f.label}</td>
            <td className="w-4 py-1.5 text-center">:</td>
            <td className="py-1.5">
              <EditInput field={f} value={data[f.key]} onChange={onChange} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── UNDANGAN KEGIATAN ───────────────────────────────────────────────────────
// data = { nomor, tanggal, kepada, perihal, isi, tempat, waktu }
export function UndanganKegiatan({ blockConfig, data = {}, onChange, mode }) {
  const fields = [
    { key: 'nomor', label: 'Nomor Surat', placeholder: 'Nomor undangan' },
    { key: 'tanggal', label: 'Tanggal Surat', placeholder: 'Cikalongwetan, 1 Mei 2026' },
    { key: 'kepada', label: 'Kepada', placeholder: 'Nama / jabatan yang diundang' },
    { key: 'perihal', label: 'Perihal', placeholder: 'Perihal undangan' },
    { key: 'isi', label: 'Isi Undangan', type: 'textarea' },
    { key: 'tempat', label: 'Tempat Acara', placeholder: 'Tempat' },
    { key: 'waktu', label: 'Waktu Acara', placeholder: 'Hari, tanggal, jam' },
  ]
  if (mode === 'edit') return <EditFields fields={fields} data={data} onChange={onChange} />
  return <SuratUndanganPaper blockConfig={blockConfig} data={data} />
}

// ─── SURAT TUGAS KEGIATAN ────────────────────────────────────────────────────
// data = kontrak SuratTugas: nomorSpt, tanggalSpt, nama, sptNip, sptPangkat,
//        sptJabatan, sptUntuk, sptHari, sptTanggal, sptTempat,
//        namaPenandatangan, jabatanPenandatangan, nipPenandatangan,
//        namaMengetahui, nipMengetahui
export function SuratTugasKegiatan({ blockConfig, data = {}, onChange, mode }) {
  const fields = [
    { key: 'nomorSpt', label: 'Nomor Surat', placeholder: 'Nomor surat tugas' },
    { key: 'tanggalSpt', label: 'Tanggal Surat', placeholder: 'Cikalongwetan, 1 Mei 2026' },
    { key: 'nama', label: 'Nama Penerima Tugas', placeholder: 'Nama yang ditugaskan' },
    { key: 'sptNip', label: 'NIP Penerima' },
    { key: 'sptPangkat', label: 'Pangkat / Golongan' },
    { key: 'sptJabatan', label: 'Jabatan Penerima' },
    { key: 'sptUntuk', label: 'Untuk / Keperluan', type: 'textarea', rows: 2 },
    { key: 'sptHari', label: 'Hari', placeholder: 'Jumat' },
    { key: 'sptTanggal', label: 'Tanggal Kegiatan', placeholder: '8 Mei 2026' },
    { key: 'sptTempat', label: 'Tempat Kegiatan', placeholder: 'Tempat pelaksanaan' },
    { key: 'namaPenandatangan', label: 'Nama Penandatangan', placeholder: 'Kepala sekolah' },
    { key: 'jabatanPenandatangan', label: 'Jabatan Penandatangan' },
    { key: 'nipPenandatangan', label: 'NIP Penandatangan' },
    { key: 'namaMengetahui', label: 'Nama Mengetahui', placeholder: 'Ketua gugus' },
    { key: 'nipMengetahui', label: 'NIP Mengetahui' },
  ]
  if (mode === 'edit') return <EditFields fields={fields} data={data} onChange={onChange} />
  return <SuratTugas blockConfig={{ judul: 'SURAT TUGAS', nomor: true }} data={data} />
}

// ─── DAFTAR HADIR KEGIATAN ────────────────────────────────────────────────────
// data = { kegiatan, tanggal, waktu, tempat } — kolom TTD kosong utk paraf.
export function DaftarHadirKegiatan({ blockConfig, data = {}, onChange, mode }) {
  const fields = [
    { key: 'kegiatan', label: 'Nama Kegiatan', placeholder: 'Nama kegiatan' },
    { key: 'tanggal', label: 'Tanggal', placeholder: 'Tanggal kegiatan' },
    { key: 'waktu', label: 'Waktu', placeholder: 'Waktu kegiatan' },
    { key: 'tempat', label: 'Tempat', placeholder: 'Tempat kegiatan' },
  ]
  if (mode === 'edit') return <EditFields fields={fields} data={data} onChange={onChange} />
  return <DaftarHadirPaper blockConfig={blockConfig} data={data} />
}

// ─── PROPOSAL KEGIATAN ────────────────────────────────────────────────────────
// Struktur section/field dari blockConfig.sections (templateConfig).
// Print: judul section formal + label/isi; field kosong → PlaceholderText
// ("[...]" panduan isi), TIDAK pernah mengarang data.
export function ProposalKegiatan({ blockConfig, data = {}, onChange, mode }) {
  const sections = blockConfig?.sections || []
  if (mode === 'edit') {
    return (
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.judul}>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-2">
              {s.judul}
            </div>
            <EditFields fields={s.fields} data={data} onChange={onChange} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="mb-4">
      {sections.map((s) => (
        <div key={s.judul} className="mb-6">
          <div className="text-center font-bold text-[12pt] uppercase mb-3">{s.judul}</div>
          {s.fields.map((f) => {
            const isi = data[f.key]
            return (
              <div key={f.key} className="mb-3 text-[11pt] leading-relaxed text-black">
                <div className="font-bold">{f.label}</div>
                <div className="text-justify whitespace-pre-wrap">
                  {isi !== '' && isi != null ? (
                    <span>{isi}</span>
                  ) : (
                    <PlaceholderText label={f.placeholder || `lengkapi ${f.label.toLowerCase()}`} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
