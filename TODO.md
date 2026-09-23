# SpendLens Proof Progress

**Current phase:** Product foundation
**Next milestone:** Deterministic finance engine
**Overall status:** In progress

## Milestones

- [x] Research commercial and open-source competitors.
- [x] Define the differentiated product promise.
- [x] Create the standalone repository.
- [x] Write the product specification and implementation plan.
- [ ] Build and test CSV normalization, categorization, duplicate detection, recurring detection, and anomaly detection.
- [ ] Build the import review and confidence workflow.
- [ ] Build the monthly lens, insight feed, and transaction explorer.
- [ ] Persist data locally and support reset/demo recovery.
- [ ] Complete responsive and accessibility verification.
- [ ] Run unit, integration, browser, and production-build gates.
- [ ] Dogfood a realistic multi-month statement and publish to GitHub.

## Product proof

- The demo must explain why the current month changed versus the previous month.
- Every anomaly, subscription, and category delta must link to contributing transactions.
- A malformed or ambiguous CSV must stop at review; it must never silently alter totals.
- The app must remain useful without an AI key, account, backend, or bank connection.

## Blockers

None.
