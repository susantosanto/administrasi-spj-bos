/**
 * Verifikasi 100% logika deterministik fitur generate foto dokumentasi.
 * Yang TIDAK diuji di sini (non-deterministik, butuh T-03/T-04 manual):
 * kemiripan wajah di HASIL gambar dari model AI.
 */
import { describe, it, expect } from 'vitest'
import {
  susunInputImages, suntikInstruksiReferensi,
} from '../../services/imageGenerator.js'
import {
  PERAN_LABEL, daftarWajahTerupload, petaWajahTerupload, wajahFallback,
} from '../fotoReferensi.js'

const F1 = 'data:image/png;base64,WAJAH1'
const F2 = 'data:image/png;base64,WAJAH2'
const R1 = 'data:image/png;base64,RUANG1'
const O1 = 'data:image/png;base64,OWNER1'

describe('susunInputImages — urutan wajah-dulu-ruang-terakhir + dedupe', () => {
  it('rapat: [wajah, ruang], ruang selalu terakhir', () => {
    expect(susunInputImages({ faceImages: [F1, F2], ruangImage: R1 })).toEqual([F1, F2, R1])
  })
  it('penyerahan: [wajah, owner], tanpa ruang', () => {
    expect(susunInputImages({ faceImages: [O1, F1], ruangImage: null })).toEqual([O1, F1])
  })
  it('box: [ruang] saja, tanpa wajah', () => {
    expect(susunInputImages({ faceImages: [], ruangImage: R1 })).toEqual([R1])
  })
  it('legacy faceImage tunggal digabung + dedupe', () => {
    expect(susunInputImages({ faceImages: [F1], faceImage: F1, ruangImage: R1 })).toEqual([F1, R1])
    expect(susunInputImages({ faceImages: [], faceImage: F2 })).toEqual([F2])
  })
  it('kosong → [] (text-to-image murni)', () => {
    expect(susunInputImages({})).toEqual([])
    expect(susunInputImages()).toEqual([])
  })
})

describe('suntikInstruksiReferensi — klaim prompt SELALU sesuai isi input', () => {
  it('wajah+ruang → kedua klausa ada', () => {
    const p = suntikInstruksiReferensi('Foto rapat', { adaWajah: true, adaRuang: true })
    expect(p).toMatch(/wajah setiap orang HARUS/)
    expect(p).toMatch(/latar\/ruangan HARUS/)
    expect(p.startsWith('Foto rapat')).toBe(true)
  })
  it('hanya ruang → tanpa klausa wajah (tidak ada klaim palsu)', () => {
    const p = suntikInstruksiReferensi('Foto box', { adaWajah: false, adaRuang: true })
    expect(p).not.toMatch(/wajah/)
    expect(p).toMatch(/latar\/ruangan HARUS/)
  })
  it('hanya wajah → tanpa klausa ruang', () => {
    const p = suntikInstruksiReferensi('Serah terima', { adaWajah: true, adaRuang: false })
    expect(p).toMatch(/wajah setiap orang HARUS/)
    expect(p).not.toMatch(/latar\/ruangan/)
  })
  it('tanpa gambar → prompt utuh tanpa tambahan', () => {
    expect(suntikInstruksiReferensi('Foto rapat', {})).toBe('Foto rapat')
  })
})

describe('daftarWajahTerupload — bentuk writer role-id', () => {
  const writerAsli = {
    guru: { dataUrl: F1, name: 'guru.jpg', uploadedAt: 1 },
    kepsek: { dataUrl: F2, name: 'kepsek.jpg', uploadedAt: 2 },
    tendik: { name: 'kosong.jpg' },
  }
  it('entri ber-dataUrl jadi daftar nama peran', () => {
    const d = daftarWajahTerupload(writerAsli)
    expect(d).toHaveLength(2)
    expect(d[0]).toEqual({ id: 'guru', nama: 'Guru', jabatan: 'Guru', dataUrl: F1 })
  })
  it('id tak dikenal → fallback id sebagai nama (tidak hilang diam-diam)', () => {
    const d = daftarWajahTerupload({ walikelas: { dataUrl: F1 } })
    expect(d[0].nama).toBe('walikelas')
  })
  it('kosong/null → [] (kasus AC-4)', () => {
    expect(daftarWajahTerupload({})).toEqual([])
    expect(daftarWajahTerupload(null)).toEqual([])
  })
  it('PERAN_LABEL selaras PERSONEL_ROLES writer', () => {
    expect(Object.keys(PERAN_LABEL).sort()).toEqual(['guru', 'kepsek', 'pengawas', 'tendik'])
  })
})

describe('peta + fallback', () => {
  const d = daftarWajahTerupload({ guru: { dataUrl: F1 }, kepsek: { dataUrl: F2 } })
  it('petaWajahTerupload nama→dataUrl', () => {
    expect(petaWajahTerupload(d)).toEqual({ Guru: F1, 'Kepala Sekolah': F2 })
  })
  it('wajahFallback = nama pertama / null', () => {
    expect(wajahFallback(d)).toBe('Guru')
    expect(wajahFallback([])).toBe(null)
  })
})

describe('rantai penuh per slot (komposisi akhir ke provider)', () => {
  // Simulasi handleGenerateSlot: pilih → peta → susun → suntik.
  const rakit = ({ dipilih, daftar, owner, ruang }) => {
    const peta = petaWajahTerupload(daftar)
    let pakai = [...dipilih]
    if (pakai.length === 0) {
      const fb = wajahFallback(daftar)
      if (fb) pakai = [fb]
    }
    const faces = pakai.map((n) => peta[n]).filter(Boolean)
    if (owner) faces.push(owner)
    const input = susunInputImages({ faceImages: faces, ruangImage: ruang })
    return { input, prompt: suntikInstruksiReferensi('P', { adaWajah: faces.length > 0, adaRuang: !!ruang }) }
  }
  const daftar = daftarWajahTerupload({ guru: { dataUrl: F1 } })
  it('rapat dipilih → [wajah, ruang] + dua klausa', () => {
    const r = rakit({ dipilih: ['Guru'], daftar, owner: null, ruang: R1 })
    expect(r.input).toEqual([F1, R1])
    expect(r.prompt).toMatch(/wajah setiap orang HARUS/)
    expect(r.prompt).toMatch(/latar\/ruangan HARUS/)
  })
  it('penyerahan → [wajah, owner] tanpa ruang + tanpa klausa ruang', () => {
    const r = rakit({ dipilih: ['Guru'], daftar, owner: O1, ruang: null })
    expect(r.input).toEqual([F1, O1])
    expect(r.prompt).not.toMatch(/latar\/ruangan/)
  })
  it('tak dipilih → fallback wajah pertama (bug lama: kosong)', () => {
    const r = rakit({ dipilih: [], daftar, owner: null, ruang: R1 })
    expect(r.input).toEqual([F1, R1])
  })
  it('tak ada foto sama sekali → [] + prompt utuh', () => {
    const r = rakit({ dipilih: [], daftar: [], owner: null, ruang: null })
    expect(r.input).toEqual([])
    expect(r.prompt).toBe('P')
  })
})
