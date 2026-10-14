/**
 * templateConfig.test.js — Konsistensi 18 template vs 9 block (Fase 4.1)
 */
import { describe, it, expect } from 'vitest'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { KNOWN_BLOCK_TYPES } from '../../components/templates/TemplateEngine'

const EXPECTED_IDS = [
  'notulen', 'undangan_mamin', 'pesanan_mamin', 'buku_tamu', 'daftar_hadir',
  'sppd', 'lampiran_daftar_tugas',
  'honor_guru', 'honor_tendik', 'honor_perpus', 'honor_penjaga',
  'transpor_rapat', 'transpor_koordinasi', 'transpor_bank', 'transpor_pendamping',
  'upah', 'pulsa', 'bku',
]

describe('TEMPLATE_CONFIGS', () => {
  it('memuat tepat 18 template yang diharapkan', () => {
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

  it('semua tipe blok dikenal TemplateEngine (9 jenis)', () => {
    expect(KNOWN_BLOCK_TYPES).toHaveLength(9)
    for (const [key, cfg] of Object.entries(TEMPLATE_CONFIGS)) {
      for (const b of cfg.blocks) {
        expect(KNOWN_BLOCK_TYPES, `${key} → ${b?.type}`).toContain(b?.type)
      }
    }
  })
})
