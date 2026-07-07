# Graph Report - .  (2026-07-06)

## Corpus Check
- Corpus is ~15.578 words - fits in a single context window. You may not need a graph.

## Summary
- 40 nodes · 35 edges · 14 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: uses: 14 · renders: 10 · depends: 6 · contains: 4 · defines: 1


## Input Scope
- Requested: all
- Resolved: all (source: cli)
- Included files: 6 · Candidates: recursive
- Excluded: 0 untracked · 0 ignored · 0 sensitive · 0 missing committed
## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- `Cetak Page` --uses--> `17 BKU Templates`  [EXTRACTED]
   →   _Bridges community 0 → community 3_
- `Realisasi Page` --uses--> `Card Design System`  [EXTRACTED]
   →   _Bridges community 2 → community 0_
- `Skema SPJ` --defines--> `Bukti Fisik`  [EXTRACTED]
   →   _Bridges community 1 → community 3_

## Communities

### Community 1 - "Architecture & Planning Docs"
Cohesion: 0.38
Nodes (7): Skema SPJ, Frontend Blueprint, Tech Comparison, Architecture Guide, Dapodik eRapor Research, State Management, Sidebar Navigation

### Community 11 - "Login Authentication"
Cohesion: 1.00
Nodes (1): Login Auth

### Community 10 - "Data Entry Feature"
Cohesion: 1.00
Nodes (1): Data Entry

### Community 13 - "Excel Upload Feature"
Cohesion: 1.00
Nodes (1): Excel Upload

### Community 3 - "Bukti Fisik & BKU"
Cohesion: 0.50
Nodes (4): BKU Table, Cetak Documents, 17 BKU Templates, Bukti Fisik

### Community 0 - "Document Card System"
Cohesion: 0.29
Nodes (8): Wajib Docs, Cetak Route, Dokumen Wajib Route, Cetak Page, Dokumen Wajib Page, 6 Wajib Templates, UI Patterns, Card Design System

### Community 2 - "Realisasi Dana BOSP"
Cohesion: 0.40
Nodes (5): Realisasi BOSP, Realisasi Route, Pengaturan Route, Realisasi Page, 3 Realisasi Templates

### Community 12 - "Settings Feature"
Cohesion: 1.00
Nodes (1): Settings

### Community 8 - "Landing Page & Route"
Cohesion: 1.00
Nodes (2): Landing Route, Landing Page

### Community 9 - "Login Page & Route"
Cohesion: 1.00
Nodes (2): Login Route, Login Page

### Community 5 - "Dashboard Page & Route"
Cohesion: 1.00
Nodes (2): Dashboard Route, Dashboard Page

### Community 7 - "Data Sekolah Page & Route"
Cohesion: 1.00
Nodes (2): Data Sekolah Route, Data Sekolah Page

### Community 6 - "Data Guru Page & Route"
Cohesion: 1.00
Nodes (2): Data Guru Route, Data Guru Page

### Community 4 - "BKU Page & Route"
Cohesion: 1.00
Nodes (2): BKU Route, BKU Page

## Knowledge Gaps
- **Thin community `Login Authentication`** (1 nodes): `Login Auth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Entry Feature`** (1 nodes): `Data Entry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Excel Upload Feature`** (1 nodes): `Excel Upload`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Feature`** (1 nodes): `Settings`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Landing Page & Route`** (2 nodes): `Landing Route`, `Landing Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Page & Route`** (2 nodes): `Login Route`, `Login Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Page & Route`** (2 nodes): `Dashboard Route`, `Dashboard Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Sekolah Page & Route`** (2 nodes): `Data Sekolah Route`, `Data Sekolah Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Guru Page & Route`** (2 nodes): `Data Guru Route`, `Data Guru Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BKU Page & Route`** (2 nodes): `BKU Route`, `BKU Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._