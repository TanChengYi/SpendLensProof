# SpendLens Proof Agent Playbook

`TODO.md` tracks progress. This file routes work to the appropriate model class and records the autonomy rules.

| Phase | Preferred model | Reasoning |
| --- | --- | --- |
| Product positioning, financial semantics, architecture, privacy boundaries | GPT-6 Astra | High or XHigh |
| Core engine, import workflow, cross-cutting defects, release decisions | GPT-6 Astra | High |
| Sustained React implementation, tests, integration, visual iteration | GPT-6 Sol | High |
| Fixture generation, repository search, simple refactors, mechanical coverage | GPT-6 Luna | Medium |
| Persistent release blocker after systematic debugging | GPT-6 Astra | XHigh or Max |

## Working rules

1. Inspect `TODO.md`, Git status, recent commits, and the active plan before work.
2. Financial totals and findings come from deterministic, tested code—not generated prose.
3. Keep raw imports local and never log transaction descriptions outside the browser.
4. Reject ambiguous dates, amounts, and debit/credit conventions during import review.
5. Every insight must carry transaction IDs and a plain-language explanation.
6. Update milestones only after fresh verification; never commit local financial data.
