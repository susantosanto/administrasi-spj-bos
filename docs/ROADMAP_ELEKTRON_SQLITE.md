# 🗺️ Roadmap Migrasi: SPA → Electron + SQLite
*Dibuat: 18 Juli 2026 | Versi: 1.0 | Status: PLAN*

---

## 📋 Executive Summary

**Kondisi Saat Ini:** Aplikasi SPJ adalah 100% frontend SPA (Vite + React) dengan data di `localStorage` dan AI API call langsung dari browser.

**Tujuan:** Migrasi ke Electron + SQLite agar:
1. **API Key aman** — di main process Node.js, tidak bocor ke browser bundle
2. **Data permanen** — SQLite file-based, backup/restore 1 file
3. **Performa lebih cepat** — SQL query > JavaScript array filter untuk data besar
4. **Distribusi mudah** — 1 installer `.exe`, double-click jalan
5. **Offline total** — tidak perlu internet untuk akses data

**Prinsip Migrasi:** **Zero disruption** — 90% kode React TIDAK BERUBAH. Cuma `storageHelper.js` dan `aiHelper.js` yang dimodifikasi.

---

## 🏗️ Arsitektur Target

```
┌────────────────────────────────────────────────────────────────────┐
│                      ELECTRON APP                                   │
│                                                                    │
│  ┌──────────────────────┐          ┌──────────────────────────┐   │
│  │   RENDERER PROCESS    │   IPC    │    MAIN PROCESS (Node)   │   │
│  │     (React UI)        │◄────────►│                          │   │
│  │                        │  invoke  │  ┌──────────────────┐   │   │
│  │  Semua komponen React │  handle  │  │   SQLite DB        │   │   │
│  │  (TemplateEngine,     │          │  │   (better-sqlite3) │   │   │
│  │   AskAIPanel, BKU,    │          │  └──────────────────┘   │   │
│  │   DokumenLPJ, dll)    │          │                          │   │
│  │                        │          │  ┌──────────────────┐   │   │
│  │  ┌──────────────────┐  │          │  │   AI Proxy        │   │   │
│  │  │ storageHelper.js │──┼─ get/set─►│   (API Key aman!)   │   │   │
│  │  │ (adapter layer)  │◄─┼─ result──│   Cerebras/Groq     │   │   │
│  │  └──────────────────┘  │          │  └──────────────────┘   │   │
│  │                        │          │                          │   │
│  │  ┌──────────────────┐  │          │  ┌──────────────────┐   │   │
│  │  │ aiHelper.js       │──┼─ askAI──►│   Semantic Cache   │   │   │
│  │  │ (sama persis!)    │◄─┼─ answer─│   (SQLite table)    │   │   │
│  │  └──────────────────┘  │          │  └──────────────────┘   │   │
│  └──────────────────────┘          └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Komponen Utama:

| Lapisan | Teknologi | Lokasi | Fungsi |
|---------|-----------|--------|--------|
| **UI** | React 18 + Tailwind | Renderer | Semua komponen yang ada sekarang |
| **Storage Adapter** | `storageHelper.js` (diupdate) | Renderer | IPC bridge → baca/tulis ke SQLite |
| **AI Orchestrator** | `aiHelper.js` (sama) | Renderer | Dual-Path, Streaming, Cache (sama!) |
| **IPC Bridge** | `contextBridge` + `ipcRenderer` | Preload | Jembatan aman renderer ↔ main |
| **Database** | `better-sqlite3` | Main Process | SQLite — semua data aplikasi |
| **AI Proxy** | `fetch` dari main process | Main Process | API Key aman, streaming dari sini |

---

## 📦 Fase Migrasi (5 Fase)

### Fase 0: Persiapan ✅ (Sekarang — sudah selesai)
- [x] Modular AI config (`aiConfig.js`)
- [x] Semantic cache (`semanticCache.js`)
- [x] Dual-Path Query Engine (`intentClassifier.js`)
- [x] Context map terpisah (`contextMap.js`)
- [x] Streaming support di AIContext + AskAIPanel

### Fase 1: Boilerplate Electron 🔜 (Estimasi: 3-5 hari)

**Tujuan:** Setup Electron + React bisa jalan sebagai desktop app.

```
spj-frontend/
├── electron/
│   ├── main.js          ← Entry point Electron main process
│   ├── preload.js       ← contextBridge untuk IPC aman
│   └── db.js            ← Inisialisasi SQLite + migrations
├── package.json         ← Tambah electron, electron-builder, better-sqlite3
├── src/
│   └── utils/
│       └── storageHelper.js  ← Update: dual-write localStorage + SQLite
└── electron-builder.yml ← Konfigurasi build installer
```

**Paket NPM yang diperlukan:**
```json
{
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "electron-rebuild": "^3.2.0"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0"
  }
}
```

**File yang perlu dibuat:**
1. `electron/main.js` — Window management, IPC handlers
2. `electron/preload.js` — contextBridge exposure
3. `electron/db.js` — SQLite init + migrations
4. `electron-builder.yml` — Build config

**File yang perlu diupdate:**
1. `package.json` — Tambah electron scripts + dependencies
2. `vite.config.js` — Base path untuk Electron
3. `src/utils/storageHelper.js` — Dual-write pattern

### Fase 2: Storage Adapter 🔜 (Estimasi: 2-3 hari)

**Tujuan:** `storageHelper.js` jadi adapter yang bisa tulis ke localStorage (lama) DAN SQLite (baru) secara bersamaan.

```javascript
// src/utils/storageHelper.js — SETELAH migrasi
export const storageHelper = {
  async get(key, defaultValue = null) {
    // Prioritas: SQLite → localStorage → default
    if (window.electronAPI) {
      return await window.electronAPI.dbGet(key) || defaultValue
    }
    // Fallback: localStorage (untuk dev di browser)
    try {
      const raw = localStorage.getItem('spj_' + key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch { return defaultValue }
  },

  async set(key, value) {
    if (window.electronAPI) {
      await window.electronAPI.dbSet(key, JSON.stringify(value))
    }
    // Dual-write untuk safety selama transisi
    localStorage.setItem('spj_' + key, JSON.stringify(value))
  }
}
```

**Keuntungan:** Semua komponen React yang panggil `storageHelper.get('bku_data')` **TIDAK PERLU DIUBAH**.

### Fase 3: AI Proxy di Main Process 🔜 (Estimasi: 2 hari)

**Tujuan:** Pindahkan AI API call dari renderer ke main process — API Key aman.

```javascript
// electron/main.js — IPC handler AI
ipcMain.handle('ai:chat', async (event, { messages, stream }) => {
  const apiKey = process.env.CEREBRAS_API_KEY // ← AMAN di sini!
  
  if (stream) {
    // Streaming: pipe response ke renderer via IPC
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-oss-120b', messages, stream: true })
    })
    
    // Kirim tiap chunk ke renderer
    for await (const chunk of response.body) {
      event.sender.send('ai:token', chunk.toString())
    }
    event.sender.send('ai:done')
  } else {
    // Non-streaming
    const response = await fetch(...)
    return await response.json()
  }
})
```

**Perubahan di aiHelper.js:**
```javascript
// SETELAH migrasi — ganti fetch langsung dengan IPC call
async function callProvider(provider, messages, options = {}) {
  if (window.electronAPI) {
    // Panggil AI dari main process (API Key aman)
    return await window.electronAPI.aiChat({ messages, ...options })
  }
  // Fallback: fetch langsung (untuk dev di browser)
  const res = await fetch(provider.endpoint, { ... })
  return res.json()
}
```

### Fase 4: SQLite Schema + Migrasi Data 🔜 (Estimasi: 3-4 hari)

**Tujuan:** Buat schema SQLite dan migrasi data dari localStorage.

```sql
-- Schema database.sqlite
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bku_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bulan INTEGER NOT NULL,
  tipe TEXT NOT NULL,
  tanggal TEXT,
  uraian TEXT,
  kode_rekening TEXT,
  kode_kegiatan TEXT,
  penerimaan REAL DEFAULT 0,
  pengeluaran REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guru (
  nip TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  status TEXT,
  jabatan TEXT,
  nuptk TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sekolah (
  id INTEGER PRIMARY KEY,
  npsn TEXT,
  nama TEXT,
  alamat TEXT,
  pejabat TEXT, -- JSON
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_cache (
  question_hash TEXT PRIMARY KEY,
  question TEXT,
  answer TEXT,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk query cepat
CREATE INDEX idx_bku_bulan ON bku_transactions(bulan);
CREATE INDEX idx_bku_tipe ON bku_transactions(tipe);
CREATE INDEX idx_bku_kode_rekening ON bku_transactions(kode_rekening);
CREATE INDEX idx_guru_status ON guru(status);
```

**Migrasi data:**
```javascript
// electron/db.js
async function migrateFromLocalStorage() {
  const dataKeys = [
    'bku_data', 'data_guru', 'data_tendik', 'data_sekolah',
    'dokumen_lpj', 'dokumen_kelengkapan_status',
    'spj_nomor_surat', 'notes', 'realisasi_status',
    'ai_chat_history',
  ]
  
  for (const key of dataKeys) {
    const raw = localStorage.getItem('spj_' + key)
    if (raw) {
      // Parse + insert ke SQLite
      const data = JSON.parse(raw)
      await insertToSQLite(key, data)
      
      // Backup localStorage key
      localStorage.setItem('spj_migrated_' + key, '✓')
    }
  }
}
```

### Fase 5: Installer & Distribusi 🔜 (Estimasi: 2 hari)

**Tujuan:** Buat installer `.exe` yang double-click → langsung jalan.

```yaml
# electron-builder.yml
appId: com.spj.app
productName: Aplikasi SPJ
directories:
  output: dist-electron
win:
  target:
    - target: nsis
      arch: [x64]
  icon: public/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  shortcutName: Aplikasi SPJ
```

**Hasil:** File `dist-electron/Aplikasi SPJ Setup 1.0.0.exe` (~80-100MB)

---

## 🔄 Migration Path (Backward Compatible)

### Dual-Write Strategy

```
Fase 1-2:   localStorage + SQLite (dual-write)
Fase 3-4:   SQLite primer, localStorage cadangan
Fase 5:     SQLite only (localStorage bisa dihapus)
```

### Kode yang TIDAK Berubah (90% dari total)

| File | Alasan |
|------|--------|
| Semua komponen di `src/components/` | Panggil `storageHelper` dan `aiHelper` — adapter |
| `src/utils/aiConfig.js` | Sudah modular, tinggal tambah `platform: 'electron'` |
| `src/utils/semanticCache.js` | Bisa pindah ke SQLite atau tetap di memory |
| `src/utils/intentClassifier.js` | Tidak tergantung storage |
| `src/utils/queryEngine.js` | Ganti `fetchSource` → query SQL via IPC |
| `src/contexts/AIContext.jsx` | Sama, panggil `askAI` dari aiHelper |
| `src/components/ai/AskAIPanel.jsx` | Sama persis |
| `src/data/` | Semua data konfigurasi tetap |
| `src/pages/` | Semua halaman tetap |

### Kode yang BERUBAH (10%)

| File | Perubahan |
|------|-----------|
| `src/utils/storageHelper.js` | Tambah IPC call ke SQLite |
| `src/utils/aiHelper.js` | `callProvider` → IPC call ke main process |
| `package.json` | Tambah electron dependencies |
| `vite.config.js` | Base path untuk Electron |
| `electron/main.js` | **Baru** — entry point |
| `electron/preload.js` | **Baru** — contextBridge |
| `electron/db.js` | **Baru** — SQLite |

---

## ⏱️ Timeline Estimasi

| Fase | Durasi | Hasil |
|------|--------|-------|
| **Fase 0: Persiapan** | ✅ Selesai | Modular AI config, Dual-Path, Semantic Cache, Streaming |
| **Fase 1: Boilerplate Electron** | 3-5 hari | Electron app bisa jalan, window muncul |
| **Fase 2: Storage Adapter** | 2-3 hari | Data baca/tulis dari SQLite (fallback localStorage) |
| **Fase 3: AI Proxy** | 2 hari | API Key aman di main process |
| **Fase 4: SQLite Schema** | 3-4 hari | Semua data di SQLite, migrasi dari localStorage |
| **Fase 5: Installer** | 2 hari | File .exe siap distribusi |
| **TOTAL** | **~12-16 hari** | Full Electron + SQLite app |

---

## 📊 Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Data hilang saat migrasi | Tinggi | Dual-write di Fase 1-2, backup otomatis sebelum migrasi |
| better-sqlite3 tidak compile | Sedang | `electron-rebuild` otomatis di postinstall |
| API Key bocor di development | Rendah | `.env` di `.gitignore`, key cuma di main process |
| IPC overhead lambat | Rendah | Batch query, cache di renderer |
| Ukuran installer besar | Sedang | ASAR packaging, kompresi NSIS |
