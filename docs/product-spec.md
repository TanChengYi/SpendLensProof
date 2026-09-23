# SpendLens Proof — Product Specification

## Promise

Import a bank CSV and understand **what changed, what repeats, and what deserves attention** in under a minute—without uploading financial data or trusting a black-box score.

## Market gap

Mature tools such as Actual Budget handle broad budgeting and multiple import formats. New local-first projects such as SpendWise AI, Compass, Networthy, and expense-intelligence already offer CSV dashboards, categorization, subscriptions, or anomalies. A generic tracker would be hard to distinguish.

SpendLens therefore competes on **explainability and import confidence**:

1. A review gate shows how columns, signs, dates, and duplicates will be interpreted before commit.
2. The primary screen is a monthly change narrative, not a static budget dashboard.
3. Every finding exposes its evidence: contributing transactions, baseline, threshold, and confidence.
4. Correcting a category creates a visible local rule rather than silently “training AI.”

Reference products and projects:

- Actual import workflow: https://github.com/actualbudget/actual/blob/master/packages/docs/docs/transactions/importing.md
- SpendWise AI: https://github.com/surpradhan/spendwise-ai
- Personal finance expense intelligence: https://github.com/DivijJaswal/personal-finance-expense-intelligence
- Networthy: https://github.com/prashant-cr/networthy
- Compass: https://github.com/tylahfam97/Compass

## Target user

A privacy-conscious person who can export CSV statements but does not want to maintain a full accounting system. They check finances monthly and want a trustworthy shortlist of changes rather than another daily budgeting habit.

## V1 journey

1. The app opens with a realistic demo so its value is visible immediately.
2. The user drops or selects a CSV.
3. SpendLens proposes date, description, and amount/debit/credit mappings and previews normalized rows.
4. The review gate flags invalid rows, duplicates, sign assumptions, date range, and inflow/outflow totals.
5. After confirmation, the Monthly Lens compares the latest complete month with the prior month.
6. The user reviews category deltas, recurring charges, anomalies, and notable merchants.
7. Selecting any finding filters the transaction explorer to its evidence.
8. Data and corrections persist only in browser storage and can be reset in one action.

## Deterministic semantics

- Expenses are stored as negative minor units; income is positive minor units.
- Parsing uses explicit column mappings and rejects ambiguous numeric/date values.
- Duplicate identity hashes normalized date, amount, description, and account.
- Categorization uses ordered visible rules with a conservative `Other` fallback.
- Merchant identity normalizes casing, punctuation, payment prefixes, and trailing reference numbers while preserving raw text.
- Recurring candidates require at least two occurrences, similar amounts, and a plausible weekly/monthly interval; confidence explains which conditions matched.
- Anomalies use robust merchant/category baselines and a minimum materiality floor; a one-off large merchant may be “notable,” not statistically anomalous.
- Month-over-month deltas exclude transfers and compare expense magnitudes.

## Information architecture

- **Lens:** month selector, headline change, category deltas, findings, cash-flow summary.
- **Transactions:** search/filter table with source descriptions and editable categories.
- **Import:** drop zone, mapping, preview, validation report, commit confirmation.
- **Rules & privacy:** ordered category rules, local-storage status, export/reset.

## Visual direction

An editorial financial brief rather than a generic admin dashboard: warm paper background, ink/navy type, copper attention accents, sea-green positive accents, strong numeric typography, compact evidence drawers, and restrained charts. Status color is never the only signal.

## Non-goals

No bank sync, budgets, investment tracking, authentication, cloud storage, collaborative household, generative financial advice, PDF parsing, tax guidance, or mobile native app in this proof.

## Success criteria

- A supported CSV reaches a correct committed dataset through an inspectable review.
- The demo and imported data both produce linked category deltas, recurring findings, and anomalies.
- Ambiguous imports cannot be committed.
- Refresh preserves committed data; reset restores the demo.
- Core engine tests, UI tests, browser workflow, lint, typecheck, and build pass.
