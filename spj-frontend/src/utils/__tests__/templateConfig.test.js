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
]

describe('TEMPLATE_CONFIGS', () => {
  it('memuat tepat 39 template yang diharapkan', () => {
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

  it('semua tipe blok dikenal TemplateEngine (25 jenis)', () => {
    expect(KNOWN_BLOCK_TYPES).toHaveLength(25)
    for (const [key, cfg] of Object.entries(TEMPLATE_CONFIGS)) {
      for (const b of cfg.blocks) {
        expect(KNOWN_BLOCK_TYPES, `${key} → ${b?.type}`).toContain(b?.type)
      }
    }
  })
})
