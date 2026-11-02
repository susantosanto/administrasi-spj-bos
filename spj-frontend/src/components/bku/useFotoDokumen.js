/**
 * useFotoDokumen — satu sumber kebenaran foto dokumentasi (Sprint 019 revisi).
 *
 * Sebelumnya foto hidup di dua tempat terpisah: state `uploadedPhotos` +
 * modal preview di `BKUSidebarDokumentasi`, dan state `images` internal
 * `DokumentasiAIGenerate` (A4 preview sendiri). Keputusan user: SEMUA foto
 * digabung ke Panel Preview utama → state diangkat ke sini (dipakai
 * `BKUSidebar`), lalu:
 *   - daftar foto (caption + hapus)  → `BKUSidebarDokumentasi`
 *   - dokumen A4 foto (fotoDocs)     → Panel Preview via `BKUSidebarLpj`
 *   - print twin `.sk-print-area`    → ikut tercetak lewat tombol Cetak panel
 *
 * State di-reset tiap ganti baris BKU (foto baris lain tidak bocor).
 */
import { useState, useEffect, useMemo, useCallback } from 'react'

const FOTO_PER_HALAMAN = 6 // grid 2 kolom × 3 baris

/** Paginasi foto → dokumen A4 (satu entri docs per halaman). */
export function buildFotoDocs(fotoDokumen = [], transaction = {}) {
  const halaman = []
  for (let i = 0; i < fotoDokumen.length; i += FOTO_PER_HALAMAN) {
    halaman.push(fotoDokumen.slice(i, i + FOTO_PER_HALAMAN))
  }
  return halaman.map((photos, idx) => ({
    key: `foto-dok-${idx}`,
    kind: 'foto',
    label: `Dokumentasi Foto Kegiatan${halaman.length > 1 ? ` — Hal. ${idx + 1}` : ''}`,
    data: {
      photos,
      uraian: transaction?.uraian || '',
      tanggalStr: transaction?.tanggalStr || '',
      halaman: idx + 1,
      totalHalaman: halaman.length,
    },
  }))
}

export default function useFotoDokumen(transaction = {}) {
  const rowKey = transaction?.row
  const [fotoDokumen, setFotoDokumen] = useState([])

  // Ganti baris BKU → foto kosong lagi (foto milik baris, bukan global).
  useEffect(() => {
    setFotoDokumen([])
  }, [rowKey])

  /** Upload banyak file sekaligus (dipakai kartu Upload Dokumen Pendukung). */
  const tambahFotos = useCallback((files) => {
    Array.from(files || []).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        setFotoDokumen((prev) => [
          ...prev,
          { id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: file.name, dataUrl: reader.result, caption: '', source: 'upload' },
        ])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const updateCaption = useCallback((id, caption) => {
    setFotoDokumen((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)))
  }, [])

  const hapusFoto = useCallback((id) => {
    setFotoDokumen((prev) => prev.filter((p) => p.id !== id))
  }, [])

  /** Foto hasil generate AI masuk ke daftar yang sama. */
  const tambahFotoAi = useCallback((foto) => {
    const id = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setFotoDokumen((prev) => [...prev, { id, name: `dokumentasi-ai-${prev.filter((p) => p.source === 'ai').length + 1}.jpg`, caption: '', source: 'ai', ...foto }])
    return id
  }, [])

  /** Regenerate: timpa foto AI lama (meta pakaian/suasana/orang ikut baru). */
  const regenerasiFotoAi = useCallback((id, foto) => {
    setFotoDokumen((prev) => prev.map((p) => (p.id === id ? { ...p, ...foto } : p)))
  }, [])

  const fotoDocs = useMemo(
    () => buildFotoDocs(fotoDokumen, { uraian: transaction?.uraian, tanggalStr: transaction?.tanggalStr }),
    [fotoDokumen, transaction?.uraian, transaction?.tanggalStr],
  )

  return { fotoDokumen, fotoDocs, tambahFotos, updateCaption, hapusFoto, tambahFotoAi, regenerasiFotoAi }
}
