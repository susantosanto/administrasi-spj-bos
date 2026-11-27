# PRD Idea Clarifier Revision — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the user-approved PRD `docs/PRD-IDEA-CLARIFIER-REVISI.MD` in independently testable phases without changing behavior outside approved requirements.

**Architecture:** Keep the existing React/Vite + `localStorage` architecture and follow the actual BKU-first workflow: table category correction → No Bukti group detail → editor in Zona A → document/print exception list below Detail Transaksi. `templateConfig.js` → `TemplateEngine.jsx` → blocks remains the document contract. The PRD’s proposal tab is separate within the same Detail Transaksi; other documents remain listed with inline paper previews below. No backend or new dependency.

**Tech Stack:** React 18, Vite, JavaScript/JSX, Tailwind, existing Vitest suite, localStorage via `storageHelper` (`spj_` prefix), existing print portal and TemplateEngine.

---

## Source of truth and execution gates

- Product requirements: `docs/PRD-IDEA-CLARIFIER-REVISI.MD` (user-approved PRD).
- Governance: `AGENTS.MD`, `CONSTITUTION.md`, `docs/ARCHITECTURE.MD`, `STATE.MD`, `DECISIONS.MD`.
- Sprint 030 remains active until user authorizes its revised pack/scope and acceptance ledger is reconciled.
- **Do not implement an OPEN question by guessing.** OPEN-01, 02, 03, 04, 05, 06, 07, 08 in PRD require decisions before dependent behavior is implemented.
- Existing uncommitted user work must be preserved. No commit/push without user command.
- No AI/provider call carrying school, BKU, GTK, or financial data until privacy, consent, allowlist, and credential path are approved. No unlabeled synthetic evidence photos.
- Before each phase: baseline relevant tests/build; implement one small task; run targeted tests; inspect diff; smoke browser workflow; update phase ledger. At phase end: full Vitest + build + browser evidence.

## Current-flow file map (confirmed before planning)

- BKU table/group/correction: `spj-frontend/src/pages/dashboard/BKUPage.jsx`, `src/utils/bkuKategori.js`, `src/utils/aturanPesanan.js`.
- Transaction sidebar and initial LPJ/detail route: `src/components/bku/BKUSidebar.jsx`, `BKUSidebarLpj.jsx`, `src/utils/lpjBkuStore.js`, `src/utils/lpjSidebarMuat.js`.
- Editor and preview/cetak: `src/components/templates/DokumenFormPreview.jsx`, `PanelPreviewDocument.jsx`, `src/components/dokumen/DetailDokumenLpj*.jsx`, `src/utils/previewDocs.js`, print selection helpers.
- Category/cards/templates: `src/data/kategoriLpj.js`, `src/data/templateConfig.js`, `TemplateEngine.jsx`, `components/templates/blocks/`.
- Personel: `src/pages/dashboard/DataGuruPage.jsx`, `src/utils/guruTendikParser.js`, storage keys `data_guru` and `data_tendik`.
- Chart: `src/components/dashboard/ArusKasChart.jsx`, `src/utils/arusKasSummary.js`.
- Upload/login/tax/logo/date: inspect exact current callsites during each phase; do not use candidate file list as blanket authorization.

## Suggested delivery decomposition

This PRD spans six independent packages. Use one plan per package/phase, and deliver/test each independently. Do not batch unrelated modifications into one large change.

### Phase 0 — Reconcile current working tree and Sprint 030 PRD/implementation state

**Purpose:** Establish a trustworthy baseline before further implementation; recent iterations introduced changes that may be inconsistent with one another.

**Files/artifacts:** `git status`, `git diff`; `planning/sprints/sprint-030/BUILD-REPORT.MD`, `ACCEPTANCE.MD`; `docs/PRD-IDEA-CLARIFIER-REVISI.MD`.

- [ ] Record current modified/untracked files and identify which belong to the user or prior work; do not reset/overwrite.
- [ ] Run `cd spj-frontend && npx vitest run` and `npm run build`; save raw output and exit codes.
- [ ] Inspect browser without mutating production-like data; use isolated QA profile/fixture where possible.
- [ ] Compare current BKU row category storage, print snapshot, and LPJ group persistence against PRD.
- [ ] Create a delta list of Sprint 030 acceptance items that conflict with the approved PRD; keep original requirements history and add a dated revision rather than silently rewriting prior decisions.
- [ ] Stop and request decisions for any PRD OPEN item needed by the next phase.

**Exit:** evidence-backed baseline; no user work lost; revised sprint/pack authorization obtained before code changes.

### Phase 1 — BKU group identity, category correction, and detail routing

**PRD coverage:** Fase 1; source ideas 12, 14, 15, 16, 20; Sprint 030 US-01/03/04.

**Files likely involved (verify before edit):** `BKUPage.jsx`, `bkuKategori.js`, `aturanPesanan.js`, relevant Vitest files, `BKUSidebar.jsx`.

- [ ] Add/confirm tests for grouping key tuple: No Bukti + normalized full account code + effective category; missing No Bukti and duplicate row identity cannot collide.
- [ ] Add/confirm tests that a category dropdown is shown only for uncategorized eligible transaction rows and is located in the BKU table’s **Tipe** column, never in transaction detail.
- [ ] Resolve OPEN-01 (correction scope: row vs whole group; behavior for mixed rekening/category group) before implementing the write key.
- [ ] Implement category correction storage with a narrowly scoped key matching the approved answer; legacy broad corrections require explicit migration/cleanup decision, never silent deletion.
- [ ] Add fixtures proving one correction does not relabel unrelated transactions sharing an account code.
- [ ] Verify table badge and sidebar category recalculate immediately after correction.
- [ ] Verify full account code including final digits and open/close random rows without blank/hang or uncaught browser error.
- [ ] Run targeted Vitest, then full suite/build; capture browser screenshot/evidence.

**Exit:** approved correction scope; unrelated rows unchanged; group detail correct; all targeted and regression checks pass.

### Phase 2 — One No Bukti group → one aggregate document packet + bottom print-exclusion list

**PRD coverage:** Fase 2; source ideas 3 and 12; Sprint 030 US-02/08.

**Files likely involved:** `BKUSidebar.jsx`, `BKUSidebarLpj.jsx`, `lpjBkuStore.js`, `previewDocs.js`, `PanelPreviewDocument.jsx`, `printSelection.js`/related tests, `DetailDokumenLpjBody.jsx`.

- [ ] Model one selected group as one packet whose source list is every member transaction; distinguish packet identity from member row identity.
- [ ] Resolve OPEN-07 (member summary fields and whether exclusion is per member, per document, or both) before finalizing UI controls.
- [ ] Add pure tests for packet construction, stable document keys, duplicate suppression, and row-to-packet membership.
- [ ] Render the lower Detail Transaksi area as document items with name/status **and inline paper preview**, with include/exclude controls per approved scope.
- [ ] Ensure no unrelated “stack of papers above” substitutes for the requested lower list; preserve editor as the screen-facing workspace per architecture.
- [ ] Make `previewDocs`, checklist, selected snapshot, and formal `.sk-print-area` use the same selected packet/document/member set.
- [ ] Excluding/re-including changes only ephemeral packet selection; assert `bku_data.transactions` is byte-equivalent before/after.
- [ ] Verify fresh print session defaults, empty selection, afterprint reset, pagination and A4 boundaries.
- [ ] PBJ: test current eligibility gates; do not map generic “Pembelian Barang” until OPEN-04 is answered.

**Exit:** one group packet; lower checklist and paper previews accurate; preview/print parity; source BKU immutable.

### Phase 3 — Lomba/Workshop documents, proposal tab, original-photo documentation, banner artwork

**PRD coverage:** Fase 3; source ideas 1–2; Sprint 030 US-09/10/11.

**Files likely involved:** `kategoriLpj.js`, `templateConfig.js`, `KegiatanLombaDocs.jsx`, `PanelPreviewDocument.jsx`, `DetailDokumenLpjBody.jsx`, `previewDocs.js`, `useFotoDokumen.js`, `SpandukPreview.jsx`, tests.

- [ ] Keep proposal in the same Detail Transaksi, in its **own tab/preview**, distinct from the lower checklist for Undangan/Surat Tugas/Daftar Hadir.
- [ ] For the three other documents, create lower-list items with one formal paper preview each and independent include/exclude controls; verify exactly one each, no duplicates.
- [ ] Build proposal structure only from the supplied DOCX; no sample names, budgets, legal basis, participant counts, or facts become defaults.
- [ ] Resolve OPEN-02: proposal participant fields and the exact source/sync/edit behavior for Daftar Hadir.
- [ ] Add tests for tab mapping, document list order, stable keys, per-document selection, and print parity.
- [ ] Original-photo flow: multi-file/multi-angle upload, preview, remove/re-include semantics, source identity as original upload, and no effect on BKU.
- [ ] Banner: exactly Nama Kegiatan, Nama Gugus, Tanggal, Tempat; output is a graphic preview only and clearly not evidence of installation/event.
- [ ] AI proposal remains disconnected until OPEN-08/privacy/key/allowlist consent gate is accepted. No provider network call in this phase.
- [ ] Verify the approved real BKU workflow in browser: table group → click → LPW detail → Proposal tab → lower document list → print selection; check console/network.

**Exit:** proposal tab separate; three other documents visible together below with inline previews; no duplicates; original photo and banner guardrails pass.

### Phase 4 — Guru/Tendik, honor, SK, and notula

**PRD coverage:** Fase 4; source ideas 4–8 and 25; Sprint 030 US-05/06/07.

**Files likely involved:** `DataGuruPage.jsx`, `guruTendikParser.js`, honor form/print blocks, `jumlahPeserta.js`, `previewDocs.js`, relevant tests.

- [ ] Audit actual parser output shape and every consumer before editing fields.
- [ ] Test manual add/edit/delete for Guru and Tendik, required name, storage failure, refresh persistence, and all document consumers.
- [ ] Preserve user decision: Excel re-import replaces the full list. Resolve OPEN-03 whether a destructive replace confirmation is required; until answered, do not change current replace behavior.
- [ ] NUPTK is optional; test present, missing, whitespace, and legacy records.
- [ ] Increase honor TTD width without A4 overflow; verify print bounds.
- [ ] Notula print displays participant count only, never participant names.
- [ ] Present a separate concept decision for semester SK frequency and pasal-editor placement; do not create semester/collaborative SK or remove the formal SK output without user approval.

**Exit:** CRUD/import contract and print consumers verified; no unintended data loss; SK design decision explicitly approved before implementing that slice.

### Phase 5 — PBJ eligibility, SPPD/dates, tax label, school/gugus logo and kop

**PRD coverage:** Fase 5; source ideas 10–11, 13, 17–18.

**Files likely involved:** `pbjEligibility.js`, `bkuKategori.js`, `templateConfig.js`, `previewDocs.js`, `RincianPajak.jsx`, `dokPajak.js`, kop blocks, date utilities, tests.

- [ ] Keep PBJ hidden on Honor, Perjalanan Dinas, Lomba/Workshop; visible only for approved Pembelian Barang, Mamin/Konsumsi, ATK.
- [ ] Resolve OPEN-04 against official/current category source before adding a purchase mapping.
- [ ] SPPD invitation gugus name reads current saved school/gugus data; test change-after-save and empty state.
- [ ] Resolve OPEN-05 exact Indonesian official date format and boundary fixtures before changing formatter.
- [ ] Tax activity/category descriptor is prefixed exactly once; test when already present, absent, blank, and unknown.
- [ ] Resolve OPEN-06 per-document logo source, size/position; inventory current kop/logo consumers; do not globally restyle unrelated templates.
- [ ] Test A4 bounds and missing-logo graceful state across each approved document type.

**Exit:** mapping/date/logo decisions approved; per-callsite tests and print evidence pass.

### Phase 6 — Upload affordances, login keyboard order, semester chart, full regression

**PRD coverage:** Fase 6; source ideas 19, 22–23 and all cross-phase regression.

**Files likely involved:** upload components/pages, `LoginPage.jsx`, `ArusKasChart.jsx`, `arusKasSummary.js`, tests/browser acceptance.

- [ ] Inventory every upload form and duplicate external upload action before editing. Clicking the dropzone opens file picker; keyboard activation and validation still work.
- [ ] Match the existing Data Sekolah upload visual pattern; do not change file parsing contracts outside requirements.
- [ ] Login: Tab from username focuses password; verify browser keyboard traversal.
- [ ] Chart: side-by-side Semester 1/Semester 2; monthly expenses match sum of BKU outflows; assert Rp 0 difference on accepted fixture.
- [ ] Run complete Vitest suite, production build, browser smoke on all six phases, and print checks for A4/overflow/pagination/afterprint.
- [ ] Update acceptance ledger with PASS/FAIL/UNTESTED and raw evidence. Do not claim zero bugs.

**Exit:** full regression/build pass; unresolved browser/print items explicitly UNTESTED; state/pack/build report updated.

## File/data contract summary

- BKU source: `spj_bku_data` via existing storage adapter; never mutate source rows through print exclusion.
- Personel: `spj_data_guru`, `spj_data_tendik`; import replace-all remains the accepted behavior.
- LPJ packet storage: current `lpjBkuStore` is keyed by category + No Bukti. Any change to group composite identity/migration requires explicit backcompat decision; do not silently overwrite colliding packets.
- Print selection: ephemeral UI snapshot unless separately approved; same selected docs feed screen preview and formal print portal.
- AI: no sensitive data sent until consent/privacy/allowlist/credential path is formally accepted.

## Self-review / traceability

- PRD Fase 1 → Phase 1 tasks.
- PRD Fase 2 → Phase 2 tasks.
- PRD Fase 3 → Phase 3 tasks.
- PRD Fase 4 → Phase 4 tasks.
- PRD Fase 5 → Phase 5 tasks.
- PRD Fase 6 → Phase 6 tasks.
- OPEN-01/04 gate Phase 1/2/5; OPEN-02/08 gate Phase 3; OPEN-03 gates import UX in Phase 4; OPEN-05/06 gate Phase 5; OPEN-07 gates packet/exclusion implementation Phase 2.
- Poin 7, 9, 24 do not exist in source idea file and are not invented here.
- No coding, staging, commit, or deployment is part of this plan.
