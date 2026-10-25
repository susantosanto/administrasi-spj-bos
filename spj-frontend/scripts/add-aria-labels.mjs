/**
 * Codemod a11y: tambah aria-label pada <button>/<a> yang hanya berisi ikon.
 * - Skip jika sudah punya aria-label / aria-hidden, atau punya teks terlihat.
 * - Prioritas label: atribut title (static / literal pertama) → ikon pertama → fallback.
 * - Heuristik teks: literal string dihitung sebagai teks jika mengandung spasi,
 *   huruf kapital, atau karakter non-ASCII (nama ikon = satu kata lowercase).
 * Jalankan: node scripts/add-aria-labels.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(__dirname, '..', 'src')

const ICON_LABELS = {
  close: 'Tutup', cancel: 'Batal', add: 'Tambah', add_circle: 'Tambah', remove: 'Kurangi',
  delete: 'Hapus', delete_forever: 'Hapus Permanen', delete_outline: 'Hapus',
  edit: 'Ubah', edit_note: 'Ubah Catatan', refresh: 'Segarkan', sync: 'Muat Ulang',
  autorenew: 'Muat Ulang', search: 'Cari', notifications: 'Notifikasi',
  help_outline: 'Bantuan', person: 'Profil', settings: 'Pengaturan', menu: 'Menu',
  upload: 'Unggah', upload_file: 'Unggah File', cloud_upload: 'Unggah',
  download: 'Unduh', download_file: 'Unduh', print: 'Cetak',
  visibility: 'Tampilkan', visibility_off: 'Sembunyikan',
  check: 'Tandai', check_circle: 'Tandai Selesai', done: 'Selesai', done_all: 'Tandai Semua',
  radio_button_unchecked: 'Tandai', remove_circle_outline: 'Tidak Tersedia',
  arrow_back: 'Kembali', arrow_forward: 'Lanjut', arrow_upward: 'Naik', arrow_downward: 'Turun',
  chevron_left: 'Sebelumnya', chevron_right: 'Berikutnya', chevron_up: 'Naik', chevron_down: 'Turun',
  keyboard_arrow_down: 'Perluas', keyboard_arrow_up: 'Ciutkan',
  keyboard_arrow_left: 'Sebelumnya', keyboard_arrow_right: 'Berikutnya',
  navigate_before: 'Sebelumnya', navigate_next: 'Berikutnya',
  expand_more: 'Perluas', expand_less: 'Ciutkan', first_page: 'Awal', last_page: 'Akhir',
  more_vert: 'Menu Lainnya', more_horiz: 'Menu Lainnya',
  content_copy: 'Salin', copy_all: 'Salin', save: 'Simpan',
  info: 'Info', info_outline: 'Info', warning: 'Peringatan', error_outline: 'Kesalahan',
  filter_alt: 'Filter', filter_list: 'Filter', send: 'Kirim', preview: 'Pratinjau',
  note_add: 'Dokumen Baru', description: 'Dokumen', folder: 'Folder',
  picture_as_pdf: 'Buka PDF', image: 'Gambar', photo_camera: 'Foto',
  open_in_new: 'Buka di Tab Baru', fullscreen: 'Layar Penuh', close_fullscreen: 'Keluar Layar Penuh',
  drag_indicator: 'Geser', zoom_in: 'Perbesar', zoom_out: 'Perkecil',
  table_rows: 'Data', logout: 'Keluar', login: 'Masuk', history: 'Riwayat',
  schedule: 'Jadwal', event: 'Kalender', calendar_month: 'Kalender',
  star: 'Favorit', favorite: 'Favorit', share: 'Bagikan', link: 'Tautan',
  play_arrow: 'Putar', pause: 'Jeda', stop_circle: 'Hentikan',
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) walk(p, out)
    else if (/\.jsx$/.test(f.name)) out.push(p)
  }
  return out
}

function looksLikeText(s) {
  if (!s || !/[a-zA-Z]/.test(s)) return false
  if (/\s/.test(s.trim())) return true       // multi-kata → teks
  if (/[A-Z]/.test(s)) return true           // ada kapital → teks
  if (/[^\x00-\x7F_]/.test(s)) return true   // non-ascii (mis. "✓") → teks
  return false                               // satu kata lowercase → nama ikon
}

/** Temukan indeks akhir blok seimbang openTag/closeTag mulai dari startIdx. */
function findBlockEnd(source, startIdx, openName, closeTag) {
  const openRe = new RegExp(`<${openName}[\\s>]`, 'g')
  const closeRe = new RegExp(closeTag, 'g')
  const tokens = []
  let m
  while ((m = openRe.exec(source)) !== null) tokens.push({ idx: m.index, open: true, len: m[0].length })
  while ((m = closeRe.exec(source)) !== null) tokens.push({ idx: m.index, open: false, len: closeTag.length })
  tokens.sort((a, b) => a.idx - b.idx)
  let depth = 0
  for (const t of tokens) {
    if (t.idx < startIdx) continue
    if (t.open) depth++
    else { depth--; if (depth === 0) return t.idx + t.len }
  }
  return null
}

/** Cari indeks `>` penutup opening tag JSX, sadar brace & string (onClick={(e) => ...}). */
function findTagEnd(source, from) {
  let depth = 0, i = from
  while (i < source.length) {
    const c = source[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++
      while (i < source.length && source[i] !== q) { if (source[i] === '\\') i++; i++ }
      i++; continue
    }
    if (c === '{' || c === '(') depth++
    else if (c === '}' || c === ')') depth--
    else if (c === '>' && depth === 0) return i
    i++
  }
  return -1
}

let totalAdded = 0

for (const file of walk(SRC)) {
  const orig = fs.readFileSync(file, 'utf8')
  const edits = [] // { pos, len, text } pada snapshot `orig`

  for (const [openName, closeTag] of [['button', '</button>'], ['a', '</a>']]) {
    const re = new RegExp(`<${openName}(?=[\\s>])`, 'g')
    let m
    while ((m = re.exec(orig)) !== null) {
      const tagStart = m.index
      const gt = findTagEnd(orig, tagStart)
      if (gt === -1) break
      const openTag = orig.slice(tagStart, gt + 1)
      if (/aria-label|aria-hidden/.test(openTag)) continue

      const blockEnd = findBlockEnd(orig, tagStart, openName, closeTag)
      if (!blockEnd) continue
      const inner = orig.slice(gt + 1, blockEnd - closeTag.length)

      // teks terlihat = literal string yang "seperti teks" ATAU text node polos
      // (di luar tag dan di luar {...}). Identifier JSX (mis. {item}) tidak dianggap.
      const stripped = inner.replace(/<[^<>]*>/g, ' ')
      const literals = [...stripped.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)]
        .map(x => x[1] ?? x[2] ?? x[3] ?? '')
      const bareNodes = stripped.replace(/\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, ' ')
        .replace(/\s+/g, ' ').trim()
      if (literals.some(looksLikeText) || looksLikeText(bareNodes)) continue
      // expression merujuk properti ber-teks (mis. {opt.label}, {item.nama}) → punya teks
      const exprProps = [...stripped.matchAll(/\{([^{}]*)\}/g)].map(x => x[1])
      if (exprProps.some(e => /\.(label|title|nama|name|text|question|deskripsi|nomor)\b/i.test(e))) continue
      // child hanya identifier tunggal: {icon} → icon-only; {item} → teks (skip)
      const bareOnly = stripped.replace(/\s+/g, ' ').trim()
      if (/^\{[A-Za-z_$][\w$.]*\}$/.test(bareOnly)) {
        if (!/icon|ikon/i.test(bareOnly)) continue
        if (!/material-symbols-outlined/.test(inner)) continue
      }

      // label kandidat: title static → literal pertama di title → ikon pertama
      let label = null
      const tStatic = openTag.match(/\stitle="([^"]+)"/)
      if (tStatic) label = tStatic[1]
      if (!label) {
        const tExpr = openTag.match(/\stitle=\{[^}]*?'([^']+)'/)
        if (tExpr) label = tExpr[1]
      }
      if (!label) {
        const icons = [
          ...inner.matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)/g),
        ].map(x => x[1])
        const first = icons.find(Boolean)
        if (first) {
          label = ICON_LABELS[first] ||
            first.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }
      }
      if (!label) label = openName === 'button' ? 'Tombol Aksi' : 'Tautan'

      const insertAt = tagStart + m[0].length
      edits.push({ pos: insertAt, len: 0, text: ` aria-label="${label}"` })
      totalAdded++
    }
  }

  if (edits.length === 0) continue
  edits.sort((a, b) => b.pos - a.pos)
  let out = orig
  for (const e of edits) {
    out = out.slice(0, e.pos) + e.text + out.slice(e.pos + e.len)
  }
  fs.writeFileSync(file, out)
  console.log(`${path.relative(SRC, file)}: +${edits.length} aria-label`)
}
console.log(`Total ditambahkan: ${totalAdded}`)
