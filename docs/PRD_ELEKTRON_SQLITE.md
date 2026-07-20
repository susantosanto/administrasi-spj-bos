# 📋 PRD: Migrasi Aplikasi SPJ ke Electron + SQLite
*Dibuat: 18 Juli 2026 | Versi: 1.0 | Status: PLAN*

---

## 📌 Executive Summary

**Masalah:**
- API Key AI bocor ke browser bundle (`VITE_*_API_KEY`)
- Data di `localStorage` terbatas (5-10MB) dan bisa hilang
- Tidak bisa offline penuh (butuh Vite proxy)
- Distribusi ke operator sekolah sulit (butuh setup dev server)

**Solusi:**
Migrasi dari SPA (Vite + React + localStorage) ke **Electron + SQLite** dengan:
- 90% kode React TIDAK berubah (hanya storage adapter)
- API Key aman di main process Node.js
- Data permanen di SQLite (backup = copy 1 file)
- Installer `.exe` siap distribusi
- Dual-Path AI tetap jalan, bahkan lebih optimal

---

## 🎯 Tujuan

1. **Keamanan** — API Key AI tidak bocor ke bundle publik
2. **Persistensi** — Data tidak hilang walau browser cache dibersihkan
3. **Performa** — SQL query > JavaScript array filter untuk ribuan transaksi
4. **Distribusi** — Installer `.exe` → double-click → jalan
5. **Offline** — Tidak butuh internet untuk data lokal (AI tetap butuh internet)
6. **Backup** — Copy 1 file `.db` = backup total

---

## 🏗️ Arsitektur

**[Lihat diagram lengkap di `ROADMAP_ELEKTRON_SQLITE.md`]**

```
┌───────────────────────────────────────────────────────────┐
│                    ELECTRON APP                            │
│                                                           │
│  Renderer (React) ←─ IPC ──→ Main Process (Node)         │
│     │                            │                        │
│     │ storageHelper.js           │ SQLite (better-sqlite3)│
│     │ aiHelper.js (sama)         │ AI Proxy (API Key)     │
│     │ Semua komponen             │ Semantic Cache Table   │
│     │ (TIDAK BERUBAH)            │                        │
└───────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data Model (SQLite)

### Tabel Utama

| Tabel | Source dari localStorage | Catatan |
|-------|-------------------------|---------|
| `bku_transactions` | `spj_bku_data.transactions` | Di-flatten per transaksi |
| `guru` | `spj_data_guru` | Index by nip |
| `tendik` | `spj_data_tendik` | Index by nip |
| `sekolah` | `spj_data_sekolah` | Single row |
| `settings` | Semua key-value lainnya | Generic key-value |
| `ai_cache` | In-memory semantic cache | Persist cache ke SQLite |
| `chat_history` | `spj_ai_chat_history` | Riwayat chat AI |

### Query Engine Migration

**Sekarang (localStorage):**
```javascript
// applyFilter + applyAggregate di JavaScript
const filtered = txs.filter(t => t.bulan === 1 && t.tipe === 'PEMBAYARAN')
const total = filtered.reduce((s, t) => s + t.pengeluaran, 0)
// O(n) linear scan — lambat untuk 10rb+ transaksi
```

**Nanti (SQLite via IPC):**
```javascript
// SQL query langsung dari database — jauh lebih cepat!
const result = await window.electronAPI.dbQuery(`
  SELECT SUM(pengeluaran) as total, COUNT(*) as count
  FROM bku_transactions
  WHERE bulan = 1 AND tipe = 'PEMBAYARAN'
`)
// O(1) index lookup — instant untuk jutaan baris
```

---

## 🔐 Keamanan API Key

### Sekarang (Risiko Tinggi)
```javascript
// aiConfig.js — SEMUA ORANG bisa lihat ini di browser DevTools!
const PROVIDERS = {
  cerebras: {
    apiKey: import.meta.env.VITE_CEREBRAS_API_KEY, // ← BOCOR!
  }
}
```

### Nanti (Aman)
```javascript
// electron/main.js — API Key hanya di sini
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY

// Atau disimpan di SQLite (terenkripsi)
ipcMain.handle('ai:chat', async (event, { messages }) => {
  const apiKey = await db.getSetting('cerebras_api_key')
  // ... fetch ke Cerebras dengan apiKey dari server
})
```

---

## 📦 Fitur yang Sama persis (No Change)

| Fitur | File | Status |
|-------|------|--------|
| Dual-Path AI | `intentClassifier.js` | ✅ Sama |
| Semantic Cache | `semanticCache.js` | ✅ Sama (bisa persist ke SQLite nanti) |
| Query Engine | `queryEngine.js` | ✅ Sama (source fetcher diganti) |
| AskAI Panel | `AskAIPanel.jsx` | ✅ Sama |
| Streaming | `aiHelper.js` | ✅ Sama |
| Multi-Agent Notulen | `aiHelper.js` | ✅ Sama |
| Template Engine | `TemplateEngine.jsx` | ✅ Sama |
| Dokumen LPJ | `DokumenSPJPage.jsx` | ✅ Sama |
| BKU Page | `BKUPage.jsx` | ✅ Sama |
| Context Map | `contextMap.js` | ✅ Sama |

---

## 📋 Definisi Selesai (Definition of Done)

### Fase 1: ✅ Boilerplate Electron
- [ ] `npm run electron:dev` jalan di lokal
- [ ] Window Electron muncul dengan React app
- [ ] `preload.js` expose API lewat `contextBridge`

### Fase 2: ✅ Storage Adapter
- [ ] `storageHelper.js` bisa baca/tulis dari SQLite
- [ ] Fallback ke localStorage jika tidak di Electron
- [ ] Semua komponen jalan tanpa perubahan

### Fase 3: ✅ AI Proxy
- [ ] API Key di main process, tidak pernah ke renderer
- [ ] Streaming tetap jalan via IPC
- [ ] Fallback ke fetch langsung untuk dev di browser

### Fase 4: ✅ SQLite Schema
- [ ] Semua tabel terbuat otomatis saat first run
- [ ] Migrasi data dari localStorage ke SQLite
- [ ] Data lama tetap aman (backup)

### Fase 5: ✅ Installer
- [ ] `npm run build:electron` menghasilkan `.exe`
- [ ] Installer double-click → jalan
- [ ] Shortcut desktop

### General
- [ ] Build `npm run build` masih jalan (Electron + Vite)
- [ ] `npm run dev` masih jalan di browser (untuk development)
- [ ] Tidak ada error console
- [ ] All existing features work (AI chat, template engine, BKU, dll)

---

## 💻 Tim & Resource

| Role | Kebutuhan |
|------|-----------|
| **Frontend Engineer** | 1 orang (React, Vite) — sudah ada |
| **Electron Engineer** | 1 orang (Electron, Node.js IPC) — perlu tambahan |
| **Testing** | Automated + manual di Windows |
| **Tooling** | VS Code, Git, Electron DevTools |

---

## ⏱️ Timeline

| Fase | Durasi | Mulai | Selesai |
|------|--------|-------|---------|
| **Fase 0: Persiapan** | ✅ Selesai | - | 18 Juli 2026 |
| **Fase 1: Boilerplate Electron** | 5 hari | - | - |
| **Fase 2: Storage Adapter** | 3 hari | - | - |
| **Fase 3: AI Proxy** | 2 hari | - | - |
| **Fase 4: SQLite Schema + Migrasi** | 4 hari | - | - |
| **Fase 5: Installer & Distribusi** | 2 hari | - | - |
| **Buffer** | 2 hari | - | - |
| **TOTAL** | **~18 hari** | - | - |

---

## 📊 Estimasi Biaya

| Item | Biaya |
|------|-------|
| Development | 0 (dikerjakan sendiri) |
| Electron infrastructure | ✅ Gratis (open source) |
| Code signing certificate | ~Rp 500rb-1jt (opsional) |
| Hosting update server | ✅ Gratis (GitHub Releases) |
| **TOTAL** | **~Rp 0-1jt** |

---

## 🔄 Rollback Plan

Jika migrasi gagal di fase mana pun:
1. **Fase 1-2:** Hapus folder `electron/`, revert `package.json`, `npm run dev` masih jalan
2. **Fase 3-4:** Data masih aman di localStorage (dual-write aktif), SQLite bisa dihapus
3. **Fase 5:** Installer lama backup di GitHub Releases

**Prinsip:** Setiap fase harus **independen dan reversible**.

---

## 📁 Struktur File Akhir

```
spj-frontend/
├── electron/
│   ├── main.js           ← Main process entry
│   ├── preload.js        ← contextBridge
│   └── db.js             ← SQLite + migrations
├── src/
│   ├── utils/
│   │   ├── storageHelper.js  ← UPDATED: IPC adapter
│   │   ├── aiHelper.js       ← SAME (callProvider minor update)
│   │   ├── aiConfig.js       ← SAME
│   │   ├── semanticCache.js  ← SAME
│   │   └── intentClassifier.js ← SAME
│   ├── components/      ← ALL SAME
│   ├── contexts/        ← ALL SAME
│   ├── pages/           ← ALL SAME
│   └── data/            ← ALL SAME
├── package.json         ← UPDATED: +electron +better-sqlite3
├── vite.config.js       ← UPDATED: base path
└── electron-builder.yml ← NEW
```
