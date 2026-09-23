# SpendLens Proof Implementation Plan

## Goal

Ship a polished local-first browser proof that converts statement CSVs into an explainable monthly change brief.

## Architecture

- React + TypeScript + Vite single-page app.
- Pure domain modules own money, dates, import mapping, normalization, categorization, recurrence, anomalies, and monthly comparison.
- A small repository adapter owns versioned `localStorage` persistence.
- UI features consume a derived analysis model; components never calculate financial totals.
- Papa Parse handles CSV tokenization; Recharts renders accessible summaries; no backend exists.

## Delivery slices

### 1. Foundation and fixtures

- Install test, CSV, icon, and chart dependencies.
- Replace scaffold styling and establish tokens, layout, and demo fixture.
- Add Vitest/jsdom and Playwright configuration.

### 2. Finance engine

- Define minor-unit transaction types and strict parsing results.
- Implement header inference, row validation, debit/credit normalization, and duplicate hashes.
- Implement merchant normalization, ordered category rules, recurrence, anomaly, and monthly-delta analysis.
- Cover edge cases before connecting UI.

### 3. Import confidence workflow

- Drag/drop and file picker.
- Mapping controls and normalized preview.
- Validation cards for rejected rows, duplicates, sign convention, date range, and totals.
- Commit only when required mappings and valid rows exist.

### 4. Monthly Lens and evidence navigation

- Headline month comparison, category change chart, cash-flow cards.
- Ranked findings with method/confidence copy.
- Evidence drawer and transaction explorer linked by transaction IDs.
- Category correction with visible local rule creation.

### 5. Persistence and product states

- Versioned local snapshot, first-run demo, import append/replace choice, and reset.
- Empty, malformed, loading, success, and recovery states.
- Responsive desktop/tablet/mobile layouts and keyboard-visible focus.

### 6. Verification and publication

- Unit/integration tests, browser acceptance journey, lint, typecheck, and build.
- Visual inspection at 1440×1000 and 390×844.
- Dogfood with realistic multi-month CSV, inspect exact totals/findings, update `TODO.md`.
- Commit clean history and publish a separate GitHub repository.
