# SpendLens Proof

SpendLens is a local-first spending explainer. Import a bank CSV and it shows what changed month over month, which charges look unusual, and which payments appear recurring. Every finding links back to the exact source transactions.

This proof deliberately avoids bank connections, accounts, servers, and generated financial advice. Parsing and analysis run deterministically in the browser; statement data is stored only in local browser storage.

## Product proof

- Review inferred CSV columns, sign conventions, date formats, rejected rows, and duplicates before committing.
- Block ambiguous dates instead of silently guessing.
- Compare the latest month with the preceding month by category.
- Detect recurring merchants and unusual merchant-level spikes with linked evidence.
- Correct a category once and retain a visible local rule.
- Reset to a realistic three-month demo at any time.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the printed local URL. The included demo is ready to explore; choose **Import CSV** to use a statement with date, description, and either a signed amount or separate debit/credit columns.

## Quality gates

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Repository guide

- `TODO.md` records delivery progress and the next milestone.
- `AGENT.md` records autonomy rules and model routing.
- `docs/product-spec.md` explains the product decision and competitor gap.
- `docs/implementation-plan.md` records the architecture and staged plan.
- `src/domain` contains the deterministic import and analysis engine.

## Privacy boundary

SpendLens does not upload statements or require an API key. Clearing site storage removes imported data. This prototype is an explanatory tool, not financial, tax, or investment advice.
