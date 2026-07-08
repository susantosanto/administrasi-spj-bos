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
import {
  KopSurat,
  HeaderDokumen,
  TabelFields,
  TabelDinamis,
  InfoKeuangan,
  PoinPembahasan,
  UraianKegiatan,
  SignatureFooter,
} from './blocks'

// Block type → Component mapping
const BLOCK_RENDERERS = {
  'kop-surat': KopSurat,
  'header': HeaderDokumen,
  'table-fields': TabelFields,
  'table-dinamis': TabelDinamis,
  'info-keuangan': InfoKeuangan,
  'signature': SignatureFooter,
  'poin-pembahasan': PoinPembahasan,
  'uraian-kegiatan': UraianKegiatan,
}

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
      onDataChange({ ...data, [field]: value })
    }
  }

  return (
    <div
      className={`template-engine ${
        mode === 'print' ? 'print-container' : 'preview-container'
      }`}
    >
      {/* Source file indicator (mode edit only) */}
      {mode === 'edit' && templateConfig.sourceFile && (
        <div className="text-[10px] text-text-low mb-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">info</span>
          Sumber: {templateConfig.sourceFile}
        </div>
      )}

      {/* Render blocks berurutan sesuai config */}
      {(templateConfig.blocks || []).map((block, i) => {
        const BlockComponent = BLOCK_RENDERERS[block.type]

        if (!BlockComponent) {
          console.warn(`Block type "${block.type}" tidak dikenal`)
          return null
        }

        return (
          <BlockComponent
            key={`${templateConfig.id}-block-${i}`}
            blockConfig={block}
            data={data}
            onChange={handleChange}
            mode={mode}
          />
        )
      })}
    </div>
  )
}
