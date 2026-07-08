/**
 * PoinPembahasan — Notulen poin-poin rapat
 * RESEARCH §2.3
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function PoinPembahasan({ blockConfig, data = {}, onChange, mode }) {
  const poin = data.poinPembahasan || []
  const label = blockConfig.label || 'Rapat membahas dan menyimpulkan sebagai berikut:'

  const addPoin = () => {
    onChange('poinPembahasan', [...poin, { id: Date.now(), text: '' }])
  }

  const updatePoin = (id, text) => {
    onChange(
      'poinPembahasan',
      poin.map((p) => (p.id === id ? { ...p, text } : p))
    )
  }

  const deletePoin = (id) => {
    onChange(
      'poinPembahasan',
      poin.filter((p) => p.id !== id)
    )
  }

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>

      {mode === 'edit' ? (
        <div className="space-y-2">
          {poin.map((item, i) => (
            <div key={item.id} className="flex items-start gap-2">
              <span className="text-xs text-gray-500 mt-1">{i + 1}.</span>
              <textarea
                className="flex-1 border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                value={item.text}
                onChange={(e) => updatePoin(item.id, e.target.value)}
                rows={2}
                placeholder={`Poin ${i + 1}`}
              />
              <button
                onClick={() => deletePoin(item.id)}
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addPoin}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Poin
          </button>
        </div>
      ) : (
        <ol className="list-decimal list-inside text-xs space-y-1">
          {poin.length > 0 ? (
            poin.map((item) => (
              <li key={item.id} className="text-gray-700">
                {item.text || <PlaceholderText label="poin pembahasan" />}
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic">
              <PlaceholderText label="poin pembahasan" />
            </li>
          )}
        </ol>
      )}
    </div>
  )
}
