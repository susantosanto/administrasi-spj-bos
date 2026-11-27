/**
 * Utility state for temporary document selection before printing.
 * Selection stays in UI memory and is never persisted with LPJ/BKU data.
 */
export function flattenPrintDocs(docs = []) {
  return docs.flatMap((doc) => {
    if (!doc || typeof doc !== 'object') return []
    if (doc.kind !== 'transport-set') return [doc]
    return Array.isArray(doc.children) ? doc.children.filter(Boolean) : []
  })
}

export function createPrintSelection(docs = []) {
  return new Set(flattenPrintDocs(docs).map((doc) => doc.key).filter(Boolean))
}

export function syncPrintSelection(docs = [], selected = new Set(), previousKeys = []) {
  const next = new Set()
  for (const doc of flattenPrintDocs(docs)) {
    if (!doc.key) continue
    if (!previousKeys.includes(doc.key) || selected.has(doc.key)) next.add(doc.key)
  }
  return next
}

export function togglePrintSelection(selected = new Set(), key) {
  if (!key) return new Set(selected)
  const next = new Set(selected)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

export function selectedPrintDocs(docs = [], selected = new Set()) {
  return flattenPrintDocs(docs).filter((doc) => selected.has(doc.key))
}
