# Handoff to Idea-Writer

**You are the idea-writer.** Your job is to transform the explored allocation-engine idea into a structured IDEA.md that captures Thesis, Telos, Journey, and Open Questions.

**Get your full role:** Run `jam get --session=$SESSION @jam:role/idea-writer` from the project root (or use the role summary below). If you don't have a session, use any session id for the get; the role content is what matters.

**Role summary:** Create/update IDEA.md at `specs/draft/allocation-engine/IDEA.md` with these sections: Status, Thesis, Synopsis, Telos, Value, Impact, Opportunity, Problem, Risk of Action, Risk of Inaction, Journey (Origin, Pivots, Dead Ends), Insights, Open Questions, Scope Sketch, Related. Preserve the journey (how we got here), not just the destination. Do not create INTENT.md or PLAN.md.

---

## Project & spec context

- **Project:** terr-slicer (repo root: workspace)
- **Spec:** allocation-engine
- **Spec path:** `jam/specs/draft/allocation-engine/`
- **Current IDEA.md:** Short original challenge/goal/task; has a pointer to artifacts. It has *not* been expanded into the full idea-writer structure yet.
- **Artifacts (read these for full context):**
  - `artifacts/README.md` — index of artifacts
  - `artifacts/ALLOCATION.md` — allocation methodology (weighted greedy, fairness, optimization)
  - `artifacts/DATA.md` — data model, validation, export
  - `artifacts/DESIGN-DECISIONS.md` — why we chose threshold vs weights, 5-band scale, tooltips, etc.
  - `artifacts/wireframes.md` — full UI (Territory Slicer, Territory Comparison, Audit Trail), implementation notes

Use this handoff plus everything you can read from the spec folder as your initial context. Do not rely on any external conversation transcript; the artifacts are the source of truth.

---

## What we’ve been discussing (summary for context)

**Core idea:** A Dynamic Territory Slicer: user sets an employee-count threshold to split accounts into Enterprise vs Mid-Market; the tool allocates accounts to reps (E→E reps, MM→MM reps) using a weighted greedy algorithm that balances ARR, account count, and risk distribution, with preference bonuses for geo match and keeping the current rep. Goal: find a “sweet spot” threshold and see fair, explainable territory balance.

**Key decisions we made:**
- **Allocation:** Weighted greedy within each segment. Priority = blended “need” score (ARR, accounts, risk) + geo/preserve multipliers. High-risk = risk_score ≥ threshold (tracked separately for fairness, not subtracted from ARR).
- **Fairness:** CV-based scores per driver; composite “Your Weight” (user’s weights) and “Equal Weight” (33/33/33). 5-band color scale: 94–100, 88–93, 82–87, 75–81, <75.
- **Optimization:** Weights only (not threshold). Find the weight combination that maximizes the Equal Weight fairness score at the current threshold. Single “Optimize Weights” button.
- **UI:** Three pages—Territory Slicer (configure + view fairness, rep distribution, sensitivity chart, Rep Summary, Account Assignments), Territory Comparison (before/after ARR & Accounts charts, KPI improvement, Account Movement), Audit Trail (step-through: this account → segment → reps’ scores → winner because …). Shared sidebar; upload, threshold, weights, preferences, high-risk slider. Tooltips required for key metrics.
- **Data:** Reps (segment E|MM, location) + Accounts (current_rep, ARR, employees, risk_score, location). Baseline for comparison = current assignments from upload. Export = full account list with Assigned_Rep (and Segment).
- **Build:** Streamlit first; allocation logic in modules for reuse.

**Journey highlights:** We moved from “equitable = balance ARR” to a weighted greedy with three balance drivers plus geo/preserve; added risk as a separate dimension (high-risk ARR); dropped disruption score; simplified optimization to weights-only and a single button; added Territory Comparison and Audit Trail; tightened fairness scale to 5 bands with Red <75; added implementation notes and tooltips as required; condensed everything into ALLOCATION.md, DATA.md, DESIGN-DECISIONS.md, wireframes.

---

## Your task

1. Read the spec folder: IDEA.md and all of `artifacts/` (README, ALLOCATION, DATA, DESIGN-DECISIONS, wireframes). Use that plus this handoff as your full context.
2. Produce a high-quality IDEA.md that follows the idea-writer structure (Status, Thesis, Synopsis, Telos, Value, Impact, Opportunity, Problem, Risk of Action, Risk of Inaction, Journey, Insights, Open Questions, Scope Sketch, Related).
3. Capture the allocation-engine idea as we explored it: the thesis (dynamic territory slicer with threshold + weighted greedy + fairness + three pages), the telos (find sweet spot, fair and explainable territories), the journey (pivots and dead ends above), and any open questions or scope sketch that fits.
4. Write to `jam/specs/draft/allocation-engine/IDEA.md`. Replace or substantially expand the current IDEA.md; keep it one coherent idea document.

Be curious. If something in the artifacts is unclear, ask. Otherwise, produce the IDEA.md.
