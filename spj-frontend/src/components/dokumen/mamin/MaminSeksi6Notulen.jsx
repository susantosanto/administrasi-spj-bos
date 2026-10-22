/**
 * MaminSeksi6Notulen — Seksi 6 "Notulen (AI)" (Sprint 018, permintaan user 2026-10-21).
 *
 * "tambahkan juga input form generate untuk hasil notula rapat / kegiatan,
 *  dimana data di notula rapat bisa diambil dari data input form yg sudah di isi
 *  di atas nya, jd hanya tampilkan saja input form generate ai hasil notula rapat
 *  seperti sekarang untuk generate dokumen notula rapat"
 *
 * Satu tombol Generate (pola lama). Semua data notulen — tanggal, waktu, tempat,
 * kegiatan, peserta, TTD — diambil dari Seksi 1–2 (sudah terisi di formData),
 * jadi tidak ada input notulen manual di sini.
 */
import { useState } from 'react'
import MaminSeksiCard from './MaminSeksiCard'
import { generateRingkasanNotulen } from '../../../utils/aiHelper'
import { useToast } from '../../ui/Toast'

export default function MaminSeksi6Notulen({ formData = {}, setFormData }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const onGenerate = async () => {
    if (!formData.acara?.trim()) {
      toast.error('Isi Nama Kegiatan (bagian 01) terlebih dahulu.')
      return
    }
    setBusy(true)
    try {
      const hasil = await generateRingkasanNotulen(formData.acara)
      if (hasil) {
        setFormData({ ...formData, resume: hasil })
        toast.success('Ringkasan notulen berhasil digenerate oleh AI!')
      } else {
        toast.error('Gagal generate ringkasan. Coba lagi.')
      }
    } catch (err) {
      toast.error('Gagal: ' + (err.message || 'Coba lagi.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <MaminSeksiCard
      nomor="6"
      judul="Notulen Rapat"
      ikon="auto_awesome"
      catatan="Tanggal, waktu, tempat, kegiatan, dan peserta diambil otomatis dari bagian 01–02. Tombol Generate menulis ringkasan notulen yang tampil di dokumen Notulen."
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase">Hasil Generate AI</p>
          <p className="text-[11px] text-slate-500 truncate">
            {formData.acara ? `untuk: ${formData.acara}` : 'Isi Nama Kegiatan lebih dulu'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
            busy ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/25 hover:brightness-110 active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{busy ? 'hourglass_top' : 'auto_awesome'}</span>
          {busy ? 'Generating…' : 'Generate AI Notulen'}
        </button>
      </div>

      {formData.resume ? (
        <textarea
          value={formData.resume}
          onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      ) : (
        <p className="text-[10px] text-slate-400 italic">Belum ada ringkasan. Tekan Generate AI Notulen di atas.</p>
      )}
    </MaminSeksiCard>
  )
}
