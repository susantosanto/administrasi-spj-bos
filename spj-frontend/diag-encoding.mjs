// Diagnosa: tampilkan code point pola mojibake yang tersisa.
import { readFileSync } from 'node:fs'
const file = process.argv[2]
const t = readFileSync(file, 'utf8')
const re = /[\u00e2\u00c3\u00c2][^\s]*/g
const found = [...new Set(t.match(re) || [])]
for (const f of found) {
  const codes = [...f].map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ')
  const ctx = t.slice(Math.max(0, t.indexOf(f) - 30), t.indexOf(f) + 30).replace(/\n/g, ' ')
  console.log(`${f}  [${codes}]\n    ...${ctx}...`)
}
