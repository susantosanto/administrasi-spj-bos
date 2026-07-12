/**
 * TabelDinamis — Tabel + baris dinamis (Honor, Transport, dll)
 * RESEARCH §2.3
 *
 * Mendukung auto-calculation:
 * - auto: { type: 'sum', fields: ['colA','colB'] } → colA + colB
 * - auto: { type: 'mul', fields: ['vol','unitCost'] } → vol × unitCost
 * - auto: { type: 'sub', fields: ['jumlah','pph'] } → jumlah - pph
 */
import { formatCurrency, EmptyTableState } from '../../../utils/templateHelpers'

/**
 * Hitung nilai auto berdasarkan formula
 */
function computeAuto(row, autoConfig) {
  if (!autoConfig || !autoConfig.type) return ''
  const fields = autoConfig.fields || []
  const values = fields.map((f) => {
    const v = parseFloat(String(row[f] || '0').replace(/[^\d.-]/g, ''))
    return isNaN(v) ? 0 : v
  })

  switch (autoConfig.type) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'mul':
      return values.reduce((a, b) => a * b, 1)
    case 'sub':
      return values.length >= 2 ? values[0] - values[1] : 0
    default:
      return ''
  }
}

/**
 * Detect if a column is auto-calculated (not user-editable)
 */
function isAutoColumn(col) {
  return col.auto && col.auto.type
}

/**
 * Get all auto column keys that depend on a given field
 */
function getAutoColumnsForField(fieldKey, columns) {
  return columns.filter((col) => {
    if (!isAutoColumn(col)) return false
    return (col.auto.fields || []).includes(fieldKey)
  })
}

export default function TabelDinamis({ blockConfig, data = {}, onChange, mode }) {
  const rows = data.rows || []
  const columns = blockConfig.columns || []

  const addRow = () => {
    const newRow = { id: Date.now() }
    columns.forEach((col) => {
      if (!isAutoColumn(col)) {
        newRow[col.key] = ''
      }
    })
    // Compute auto values for the new row
    columns.forEach((col) => {
      if (isAutoColumn(col)) {
        newRow[col.key] = computeAuto(newRow, col.auto)
      }
    })
    onChange('rows', [...rows, newRow])
  }

  const updateRow = (id, key, value) => {
    let updatedRow = { ...rows.find((r) => r.id === id), [key]: value }

    // Re-compute all auto columns that depend on this field
    const dependentAutoCols = getAutoColumnsForField(key, columns)
    dependentAutoCols.forEach((col) => {
      updatedRow[col.key] = computeAuto(updatedRow, col.auto)
    })

    onChange(
      'rows',
      rows.map((r) => (r.id === id ? updatedRow : r))
    )
  }

  const deleteRow = (id) => {
    onChange(
      'rows',
      rows.filter((r) => r.id !== id)
    )
  }

  const formatCellValue = (row, col) => {
    const value = row[col.key]
    if (value === undefined || value === null || value === '') {
      return col.format === 'currency' ? '-' : ''
    }
    if (col.format === 'currency') {
      return formatCurrency(value)
    }
    return value
  }

  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-xs border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: `${col.width || 10}%` }}
                className={`border border-gray-300 px-2 py-1 text-left font-semibold text-[10px] ${col.spacer ? 'border-x-0 bg-transparent' : ''}`}
              >
                {col.label}
              </th>
            ))}
            {mode === 'edit' && (
              <th className="border border-gray-300 px-2 py-1 w-10 text-[10px]">#</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (mode === 'edit' ? 1 : 0)}
                className="border border-gray-300"
              >
                <EmptyTableState />
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((col) => {
                  const isAuto = isAutoColumn(col)
                  const isSpacer = col.spacer
                  return (
                    <td 
                      key={col.key} 
                      className={`border border-gray-300 px-2 py-1 ${isSpacer ? 'border-x-0 bg-transparent' : ''}`}
                    >
                      {isSpacer ? null : (
                        mode === 'edit' && !isAuto ? (
                          <input
                            type="text"
                            className="w-full border-b border-dashed border-primary/20 outline-none bg-transparent text-[10px]"
                            value={row[col.key] || ''}
                            onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                          />
                        ) : (
                          <span
                            className={`text-[10px] ${isAuto ? 'font-medium text-gray-700' : ''}`}
                          >
                            {formatCellValue(row, col)}
                          </span>
                        )
                      )}
                    </td>
                  )
                })}
                {mode === 'edit' && (
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Hapus baris"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {mode === 'edit' && (
        <button
          onClick={addRow}
          className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Baris
        </button>
      )}
    </div>
  )
}
