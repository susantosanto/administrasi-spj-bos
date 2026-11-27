/**
 * templateConfig.test.js — Konsistensi template vs block (Fase 4.1, Sprint 023-024)
 */
import { describe, it, expect } from 'vitest'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { KNOWN_BLOCK_TYPES } from '../../components/templates/TemplateEngine'

const EXPECTED_IDS = [
  'notulen', 'undangan_mamin', 'pesanan_mamin', 'buku_tamu', 'daftar_hadir',
  'sppd', 'spt', 'undangan_gugus', 'lampiran_daftar_tugas',
  'honor_guru', 'honor_tendik', 'honor_perpus', 'honor_penjaga',
  'transpor_rapat', 'transpor_koordinasi', 'transpor_bank', 'transpor_pendamping',
  'upah', 'pulsa', 'sk_honorer', 'bku',
  'pbj_perencanaan', 'pbj_pesanan', 'pbj_bahp', 'pbj_bast',
  'pbj_nego_banding', 'pbj_nego_hasil',
  'register_kas', 'bap_kas', 'pengaduan_masyarakat', 'kritik_saran',
  'realisasi_dana', 'instrumen_bos',
  'daftar_hadir_blanko', 'surat_undangan_blanko', 'rincian_pajak',
  'cover_lpj', 'sekat_lpj', 'pbj_data',
  'undangan_lomba', 'proposal_kegiatan', 'surat_tugas_lomba', 'daftar_hadir_lomba',
  'spanduk_desain',
]

describe('TEMPLATE_CONFIGS', () => {
  it('memuat tepat 44 template yang diharapkan', () => {
    expect(Object.keys(TEMPLATE_CONFIGS).sort()).toEqual([...EXPECTED_IDS].sort())
  })

  it('setiap template punya id/label/blocks valid', () => {
    for (const [key, cfg] of Object.entries(TEMPLATE_CONFIGS)) {
      expect(cfg.id, `${key}.id`).toBe(key)
      expect(cfg.label, `${key}.label`).toBeTruthy()
      expect(Array.isArray(cfg.blocks), `${key}.blocks`).toBe(true)
      expect(cfg.blocks.length, `${key}.blocks.length`).toBeGreaterThan(0)
    }
  })

  it('semua tipe blok dikenal TemplateEngine (30 jenis)', () => {
    expect(KNOWN_BLOCK_TYPES).toHaveLength(30)
    for (const [key, cfg] of Object.entries(TEMPLATE_CONFIGS)) {
      for (const b of cfg.blocks) {
        expect(KNOWN_BLOCK_TYPES, `${key} → ${b?.type}`).toContain(b.type)
      }
    }
  })
})

describe('Lomba & Workshop (Sprint 030, US-09)', () => {
  const IDS = ['undangan_lomba', 'proposal_kegiatan', 'surat_tugas_lomba', 'daftar_hadir_lomba']

  it('empat template kegiatan ada dan punya card lomba_workshop', () => {
    IDS.forEach((id) => {
      const cfg = TEMPLATE_CONFIGS[id]
      expect(cfg, id).toBeTruthy()
      expect(cfg.card).toBe('lomba_workshop')
    })
  })

  it('semua default KOSONG — data contoh DOCX tidak dibawa sebagai isi (AC-22)', () => {
    IDS.forEach((id) => {
      const cfg = TEMPLATE_CONFIGS[id]
      Object.values(cfg.defaults).forEach((v) => {
        // satu-satunya pengecualian: jabatan baku penandatangan surat tugas
        if (id === 'surat_tugas_lomba' && v === 'Kepala Sekolah') return
        expect(v, `${id} default kosong`).toBe('')
      })
    })
  })

  it('proposal memetakan struktur DOCX (pengesahan + BAB I/II/III) tanpa isi contoh', () => {
    const blok = TEMPLATE_CONFIGS.proposal_kegiatan.blocks[0]
    expect(blok.type).toBe('proposal-kegiatan')
    const judul = blok.sections.map((s) => s.judul)
    expect(judul.some((j) => /Pengesahan/i.test(j))).toBe(true)
    expect(judul.some((j) => /BAB I/i.test(j))).toBe(true)
    expect(judul.some((j) => /BAB II/i.test(j))).toBe(true)
    expect(judul.some((j) => /BAB III/i.test(j))).toBe(true)
    const keys = blok.sections.flatMap((s) => s.fields.map((f) => f.key))
    for (const k of Object.keys(TEMPLATE_CONFIGS.proposal_kegiatan.defaults)) {
      expect(keys, `field default ${k} ada di section`).toContain(k)
    }
  })

  it('kategoriLpj: kartu lomba_workshop 4 sub — proposal DIKUNCI (keputusan 2026-11-26)', async () => {
    const { CARDS } = await import('../../data/kategoriLpj')
    const card = CARDS.find((c) => c.id === 'lomba_workshop')
    expect(card).toBeTruthy()
    expect(card.hasTemplate).toBe(true)
    expect(card.subKategori).toHaveLength(4)
    const prop = card.subKategori.find((s) => s.id === 'proposal')
    expect(prop.comingSoon).toBe(true)
    expect(prop.templateId).toBeNull()
    card.subKategori.filter((s) => s.id !== 'proposal').forEach((s) => {
      expect(s.templateId, `${s.id} punya templateId`).toBeTruthy()
      expect(s.comingSoon).toBeUndefined()
    })
  })
})

describe('Desain Spanduk (Sprint 030, US-11/AC-25)', () => {
  it('form persis 4 field: Nama Kegiatan, Nama Gugus, Tanggal, Tempat', () => {
    const cfg = TEMPLATE_CONFIGS.spanduk_desain
    expect(cfg.card).toBe('cetak_banner')
    expect(Object.keys(cfg.defaults).sort()).toEqual(['namaGugus', 'namaKegiatan', 'tanggal', 'tempat'])
  })
})

describe('LombaDocs dokumen gabungan (Sprint 030, US-02)', () => {
  it('Undangan + Surat Tugas + Daftar Hadir digabung jadi SATU daftar, tanpa duplikat', async () => {
    const { buildPreviewDocs } = await import('../previewDocs')
    for (const sub of ['undangan', 'surat_tugas', 'daftar_hadir']) {
      const docs = buildPreviewDocs({
        cardId: 'lomba_workshop', templateId: 'undangan_lomba', subId: sub,
        formData: { nomor: 'X', namaKegiatan: 'Lomba' },
      })
      expect(docs.map((d) => d.key), sub).toEqual([
        'lomba-undangan', 'lomba-surat_tugas', 'lomba-daftar_hadir',
      ])
    }
  })

  it('Proposal DIKUNCI (keputusan 2026-11-26): subId proposal tidak membangun dokumen', async () => {
    const { buildPreviewDocs } = await import('../previewDocs')
    const docs = buildPreviewDocs({
      cardId: 'lomba_workshop', templateId: null, subId: 'proposal',
      formData: { nomor: 'X', namaKegiatan: 'Lomba' },
    })
    expect(docs).toHaveLength(0)
  })

  it('formData bersarang lama tidak menghasilkan entri ganda', async () => {
    const { buildPreviewDocs } = await import('../previewDocs')
    const docs = buildPreviewDocs({
      cardId: 'lomba_workshop', templateId: 'undangan_lomba', subId: 'undangan',
      formData: { nomor: 'X', dok_undangan: { nomor: 'A' }, dok_daftar_hadir: { kegiatan: 'B' } },
    })
    expect(new Set(docs.map((d) => d.key)).size).toBe(docs.length)
  })
})

describe('Field wajib dokumen baru (Sprint 030)', () => {
  it('undangan_lomba: nomor/kepada/perihal wajib, sisanya opsional', async () => {
    const { fieldWajibDariConfig, cekKelengkapan } = await import('../fieldWajib')
    const w = fieldWajibDariConfig(TEMPLATE_CONFIGS.undangan_lomba)
    expect(w.map((f) => f.key).sort()).toEqual(['kepada', 'nomor', 'perihal'])
    const c = cekKelengkapan(TEMPLATE_CONFIGS.undangan_lomba, { nomor: '1', kepada: 'X', perihal: 'Y' })
    expect(c.lengkap).toBe(true)
    const c2 = cekKelengkapan(TEMPLATE_CONFIGS.undangan_lomba, { nomor: '1' })
    expect(c2.lengkap).toBe(false)
    expect(c2.kurang.map((k) => k.key).sort()).toEqual(['kepada', 'perihal'])
  })

  it('surat_tugas_lomba: jabatan baku tidak ikut wajib (default terisi)', async () => {
    const { fieldWajibDariConfig } = await import('../fieldWajib')
    const keys = fieldWajibDariConfig(TEMPLATE_CONFIGS.surat_tugas_lomba).map((f) => f.key)
    expect(keys.sort()).toEqual(['nama', 'nomorSpt', 'sptUntuk'])
    expect(keys).not.toContain('jabatanPenandatangan')
  })

  it('proposal_kegiatan: hanya 3 wajib; section lain opsional', async () => {
    const { cekKelengkapan } = await import('../fieldWajib')
    const c = cekKelengkapan(TEMPLATE_CONFIGS.proposal_kegiatan, { namaKegiatan: 'Lomba', namaGugus: 'G', tahun: '2026' })
    expect(c.lengkap).toBe(true)
    expect(c.total).toBe(3)
  })

  it('daftar_hadir_lomba & spanduk_desain tervalidasi', async () => {
    const { cekKelengkapan } = await import('../fieldWajib')
    expect(cekKelengkapan(TEMPLATE_CONFIGS.daftar_hadir_lomba, { kegiatan: 'K' }).lengkap).toBe(true)
    const s = cekKelengkapan(TEMPLATE_CONFIGS.spanduk_desain, { namaKegiatan: 'A', namaGugus: 'B', tanggal: 'C', tempat: 'D' })
    expect(s.lengkap).toBe(true)
    expect(cekKelengkapan(TEMPLATE_CONFIGS.spanduk_desain, {}).lengkap).toBe(false)
  })
})

describe('Koreksi kategori scope NoBukti (Sprint 030, US-03)', () => {
  it('dropdown hanya berisi satu opsi per kategori dengan label manusiawi', async () => {
    const { PILIHAN_KATEGORI_UNIK, LABEL_KATEGORI } = await import('../bkuKategori')
    const kats = PILIHAN_KATEGORI_UNIK.map((e) => e.kategori)
    expect(new Set(kats).size).toBe(kats.length)
    expect(kats).toEqual(['mamin', 'atk', 'honor', 'perjalanan_dinas', 'pemeliharaan', 'operasional', 'lomba_workshop', 'buku'])
    kats.forEach((k) => expect(LABEL_KATEGORI[k]).toBeTruthy())
  })
  it('koreksi manual memakai NoBukti + rekening lengkap + tanggal, tanpa nama kegiatan', async () => {
    const { kunciKoreksi } = await import('../bkuKategori')
    const kode = '5.1.02.02.01.00'
    const manual = { prefix: '', manual: true, kategori: 'lomba_workshop', menu: 'lomba_workshop' }
    expect(kunciKoreksi(kode, manual, 'BNU04', '2026-02-09', 'grup')).toBe(
      'BARISGRUP:BNU04|5.1.02.02.01.00|2026-02-09',
    )
    expect(kunciKoreksi(kode, manual, 'BNU05', '2026-02-09', 'grup')).not.toBe(
      kunciKoreksi(kode, manual, 'BNU04', '2026-02-09', 'grup'),
    )
    expect(kunciKoreksi(kode, manual, 'BNU04', '2026-02-10', 'grup')).not.toBe(
      kunciKoreksi(kode, manual, 'BNU04', '2026-02-09', 'grup'),
    )
    // Semua pilihan kategori memakai scope yang sama, termasuk pilihan
    // kategori yang biasanya berasal dari prefix otomatis.
    const otomatis = { prefix: kode, kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' }
    expect(kunciKoreksi(kode, otomatis, 'BNU04', '2026-02-09', 'grup')).toBe(
      'BARISGRUP:BNU04|5.1.02.02.01.00|2026-02-09',
    )
    // Tanpa tiga faktor lengkap, writer menolak membuat koreksi massal.
    expect(kunciKoreksi(kode, manual, 'BNU04', '')).toBe('')
  })
})
