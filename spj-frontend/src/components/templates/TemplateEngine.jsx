/**
 * TemplateEngine — Universal Renderer
 * RESEARCH §2.2
 *
 * Usage:
 * <TemplateEngine
 *   templateId="notulen"
 *   data={formData}
 *   onDataChange={setFormData}
 *   mode="edit" | "print"
 * />
 */
import { useEffect, useState } from 'react'
import {
  KopSurat,
  HeaderDokumen,
  TabelFields,
  TabelDinamis,
  TabelLetterHeader,
  InfoKeuangan,
  PoinPembahasan,
  UraianKegiatan,
  SignatureFooter,
  SKHonorer,
  KopGugus,
  SuratUndangan,
  SuratTugas,
SPDForm,
  CoverHeader,
  RegisterKas,
  BapKas,
  RincianPajak,
  LembarPengaduan,
  LembarKritikSaran,
  PeringatanData,
  WorkplanPbj,
  TabelRealisasi,
  InstrumenBos,
  DaftarHadirPaper,
  SuratUndanganPaper,
  UndanganKegiatan,
  SuratTugasKegiatan,
  DaftarHadirKegiatan,
  ProposalKegiatan,
  SpandukPreview,
} from './blocks'
import { PAPER_EVENT, getPaperSize } from '../../utils/paperSize'

// Block type → Component mapping
const BLOCK_RENDERERS = {
  'kop-surat': KopSurat,
  'header': HeaderDokumen,
  'table-fields': TabelFields,
  'table-letter-header': TabelLetterHeader,
  'table-dinamis': TabelDinamis,
  'info-keuangan': InfoKeuangan,
  'signature': SignatureFooter,
  'poin-pembahasan': PoinPembahasan,
  'uraian-kegiatan': UraianKegiatan,
  'sk-honorer': SKHonorer,
  'kop-gugus': KopGugus,
  'surat-undangan': SuratUndangan,
  'surat-tugas': SuratTugas,
  'spd-form': SPDForm,
  'cover-header': CoverHeader,
  'register-kas': RegisterKas,
  'bap-kas': BapKas,
  'rincian-pajak': RincianPajak,
  'lembar-pengaduan': LembarPengaduan,
  'lembar-kritik-saran': LembarKritikSaran,
  'workplan-pbj': WorkplanPbj,
  'realisasi-tabel': TabelRealisasi,
  'instrumen-bos': InstrumenBos,
  'daftar-hadir': DaftarHadirPaper,
  'undangan-blanko': SuratUndanganPaper,
  'undangan-kegiatan': UndanganKegiatan,
  'surat-tugas-kegiatan': SuratTugasKegiatan,
  'daftar-hadir-kegiatan': DaftarHadirKegiatan,
  'proposal-kegiatan': ProposalKegiatan,
  'spanduk-preview': SpandukPreview,
}

// Daftar tipe blok yang dikenal — dipakai test konsistensi templateConfig.
export const KNOWN_BLOCK_TYPES = Object.keys(BLOCK_RENDERERS)

export default function TemplateEngine({
  templateConfig,
  data = {},
  onDataChange,
  mode = 'edit',
}) {
  // Error state jika config tidak ditemukan
  if (!templateConfig) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-700">
          <span className="material-symbols-outlined">warning</span>
          <span className="text-sm">Template tidak ditemukan.</span>
        </div>
      </div>
    )
  }

  // Handler untuk perubahan data
  const handleChange = (field, value) => {
    if (onDataChange) {
      onDataChange({ ...(safeData), [field]: value })
    }
  }

  // Kertas A4/F4 pilihan user (spj_kertas) — ikut tanpa reload.
  const [kertas, setKertas] = useState(getPaperSize())
  useEffect(() => {
    const sinkron = (e) => {
      if (e?.detail?.paper) setKertas(e.detail.paper)
    }
    window.addEventListener(PAPER_EVENT, sinkron)
    return () => window.removeEventListener(PAPER_EVENT, sinkron)
  }, [])

  return (
    <div
      className={`template-engine ${
        mode === 'print' ? 'print-container' : 'preview-container'
      } ${templateConfig.orientation || 'portrait'} paper-${kertas.toLowerCase()}`}
    >
      {/* Sprint 001 FASE 5 (task 5.2): peringatan data kosong — tampil di SEMUA
          form template (mode edit). Varian pesan + tautan aksi ada di komponen. */}
      {mode === 'edit' && <PeringatanData />}

      {/* Source file indicator (mode edit only) - DISABLED */}
      {/* mode === 'edit' && templateConfig.sourceFile && (
        <div className="text-[10px] text-text-low mb-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">info</span>
          Sumber: {templateConfig.sourceFile}
        </div>
      ) */}

      {/* Render blocks berurutan sesuai config */}
      {blocks.map((block, i) => {
        const BlockComponent = BLOCK_RENDERERS[block?.type]

        if (!BlockComponent) {
          console.warn(`Block type "${block?.type}" tidak dikenal`)
          if (mode === 'print') return null
          return (
            <div key={`${templateConfig.id}-block-${i}`} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <span className="material-symbols-outlined">warning</span>
                <span className="text-sm">Blok “{String(block?.type)}” tidak dikenal — dilewati.</span>
              </div>
            </div>
          )
        }

        return (
          <BlockErrorBoundary
            key={`${templateConfig.id}-block-${i}`}
            blockType={block.type}
            mode={mode}
          >
            <BlockComponent
              blockConfig={block}
              data={safeData}
              onChange={handleChange}
              mode={mode}
            />
          </BlockErrorBoundary>
        )
      })}
    </div>
  )
}
