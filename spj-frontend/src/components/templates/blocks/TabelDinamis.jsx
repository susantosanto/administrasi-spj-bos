/**
 * TabelDinamis — Tabel + baris dinamis (Honor, Transport, dll)
 * RESEARCH §2.3
 */
import { formatCurrency, EmptyTableState } from '../../../utils/templateHelpers'

export default function TabelDinamis({ blockConfig, data = {}, onChange, mode }) {
  const rows = data.rows || []
  const columns = blockConfig.columns || []

  const addRow = () => {
    const newRow = { id: Date.now() }
    columns.forEach((col) => { newRow[col.key] = '' })
    onChange('rows', [...rows, newRow])
  }

  const updateRow = (id, key, value) => {
    onChange(
      'rows',
      rows.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    )
  }

  const deleteRow = (id) => {
    onChange(
      'rows',
      rows.filter((r) => r.id !== id)
    )
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
                className="border border-gray-300 px-2 py-1 text-left font-semibold text-[10px]"
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
                {columns.map((col) => (
                  <td key={col.key} className="border border-gray-300 px-2 py-1">
                    {mode === 'edit' ? (
                      <input
                        type="text"
                        className="w-full border-b border-dashed border-primary/20 outline-none bg-transparent text-[10px]"
                        value={row[col.key] || ''}
                        onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                      />
                    ) : (
                      <span className="text-[10px]">
                        {col.format === 'currency'
                          ? formatCurrency(row[col.key])
                          : row[col.key] || '-'}
                      </span>
                    )}
                  </td>
                ))}
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
