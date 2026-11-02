/**
 * MaminSeksi2DaftarHadir — Seksi 2 "Daftar Hadir" (Sprint 018, K-9).
 *
 * Berubah dari form lama:
 * - kolom **TTD DIHAPUS** dari input (kolom TANDA TANGAN tetap tercetak di kertas);
 * - kolom **NIP DITAMBAHKAN** setelah Nama (otomatis dari Data Guru/Tendik, bisa dikoreksi);
 * - kolom **Keterangan / Judul Acara DIHAPUS** (revisi 2026-10-22) — isinya
 *   duplikat "Nama Kegiatan" di seksi 1. Nilai tetap tercetak karena
 *   `templateDaftarHadir` mengisinya dari `acara` (sumber tunggal).
 */
import { useState } from 'react'
import MaminSeksiCard from './MaminSeksiCard'
import MaminPesertaPicker from './MaminPesertaPicker'
import MaminDaftarHadirTabel from './MaminDaftarHadirTabel'

const kunciOrang = (o) => o.nip || o.nuptk || o.nama || ''

export default function MaminSeksi2DaftarHadir({ formData = {}, setFormData }) {
  const [showPeserta, setShowPeserta] = useState(false)
  const rows = formData.rows || []
  const kolomOpsional = formData.hadirKolomOpsional || []

  const updateRow = (id, key, value) => {
    setFormData({
      ...formData,
      rows: rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    })
  }

  const toggleOrang = (o) => {
    const key = kunciOrang(o)
    const ada = rows.find((r) => r.id === key)
    if (ada) {
      setFormData({ ...formData, rows: rows.filter((r) => r.id !== key) })
      return
    }
    const baru = {
      id: key,
      no: rows.length + 1,
      nama: o.nama || '',
      nip: o.nip || o.nuptk || '',
      jabatan: o.jabatan || '',
      ttd: '',
      ttd2: '',
    }
    setFormData({ ...formData, rows: [...rows, baru] })
  }

  const tambahBaris = () => {
    const baru = { id: `manual-${Date.now()}`, no: rows.length + 1, nama: '', nip: '', jabatan: '', ttd: '', ttd2: '' }
    setFormData({ ...formData, rows: [...rows, baru] })
  }

  const tambahKolom = () => {
    const key = `ops${Date.now()}`
    const next = [...kolomOpsional, { key, label: `Kolom ${kolomOpsional.length + 1}` }]
    setFormData({ ...formData, hadirKolomOpsional: next })
  }

  const ubahKolom = (key, label) => {
    setFormData({
      ...formData,
      hadirKolomOpsional: kolomOpsional.map((c) => (c.key === key ? { ...c, label } : c)),
    })
  }

  const hapusKolom = (key) => {
    const nextKolom = kolomOpsional.filter((c) => c.key !== key)
    setFormData({
      ...formData,
      hadirKolomOpsional: nextKolom,
      rows: rows.map((r) => {
        const nr = { ...r }
        delete nr[key]
        return nr
      }),
    })
  }

  const hapusBaris = (id) => {
    setFormData({
      ...formData,
      rows: rows.filter((r) => r.id !== id).map((r, i) => ({ ...r, no: i + 1 })),
    })
  }

  return (
    <MaminSeksiCard
      nomor="2"
      judul="Kehadiran Peserta"
      ikon="badge"
      catatan="Pilih peserta dari Data Guru/Tendik — NIP terisi otomatis. Tanda tangan ditulis tangan di kertas (kolom TANDA TANGAN tetap tercetak)."
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Daftar Hadir ({rows.length})
        </span>
        <button
          type="button"
          onClick={() => setShowPeserta((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-base">{showPeserta ? 'expand_less' : 'group_add'}</span>
          {showPeserta ? 'Tutup Daftar' : `Pilih Peserta${rows.length ? ` (${rows.length})` : ''}`}
        </button>
      </div>

      {showPeserta && <MaminPesertaPicker rows={rows} onToggle={toggleOrang} />}

      <MaminDaftarHadirTabel
        rows={rows}
        kolomOpsional={kolomOpsional}
        onChangeRow={updateRow}
        onHapusBaris={hapusBaris}
        onTambahKolom={tambahKolom}
        onTambahBaris={tambahBaris}
        onUbahKolom={ubahKolom}
        onHapusKolom={hapusKolom}
      />
    </MaminSeksiCard>
  )
}
