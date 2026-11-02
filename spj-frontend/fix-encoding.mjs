// Perbaiki mojibake UTF-8 (v3) — pola final hasil diagnosa.
import { readFileSync, writeFileSync } from 'node:fs'

const PETA = [
  ['\u00e2\u203a\u201d', '\u2192'], // → (tidak/salah decode)
  ['\u00e2\u2020\u201c', '\u2192'], // → (decode 0x93)
  ['\u00e2\u2020\u2019', '\u2192'], // → (decode 0x92)
  ['\u00e2\u2020\u0090', '\u2190'], // ← (decode 0x90)
  ['\u00e2\u2030\u00a5', '\u00b1'], // ±
  ['\u00e2\u2030\u00a0', '\u2260'], // ≠
  ['\u00e2\u2030 ', '\u2260'],     // ≠
  ['\u00e2\u2030\u00a4', '\u2264'], // ≤
]

const files = process.argv.slice(2)
for (const file of files) {
  const before = readFileSync(file, 'utf8')
  let t = before
  for (const [bad, good] of PETA) t = t.split(bad).join(good)
  if (t !== before) writeFileSync(file, t, 'utf8')
  const sisa = [...new Set(t.match(/[\u00e2\u00c3\u00c2][^\s]*/g) || [])]
  console.log(`${t !== before ? 'diperbaiki' : 'sama     '} | sisa ${sisa.length}: ${sisa.slice(0, 5).join(' | ')} | ${file.split(/[\\/]/).pop()}`)
}
