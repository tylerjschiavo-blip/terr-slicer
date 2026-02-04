# Intent: Territory Allocation Engine

**Date:** 2026-02-02  
**Status:** Draft

---

## The Problem

Sales leaders restructuring from a Generalist model to a segmented Enterprise/Mid-Market model face a critical challenge: **where to draw the employee-count threshold that separates the two segments**. Current approaches fail in fundamental ways:

- **Gut feel:** Pick an arbitrary number (e.g., 500 employees), hope it works—no visibility into fairness or workload impact
- **Manual spreadsheet:** Iterate threshold values, manually recalculate distributions—slow, error-prone, doesn't scale
- **Static model:** Build once, run once—no real-time exploration of trade-offs

All options lack transparency: even if the allocation is fair, reps don't *see* why, which breeds distrust. None provide a before/after comparison to justify the change to stakeholders. The result is unfair territories, rep attrition, compensation disputes, risk concentration, and threshold regret that forces expensive mid-year re-orgs.

**Root cause:** No tool exists that makes threshold exploration interactive, allocation logic transparent, and fairness metrics multi-dimensional and defensible.

---

## The Solution

An **Interactive Territory Allocation Engine** consisting of three integrated components:

### 1. Territory Slicer (Exploration & Configuration)
- **Threshold slider:** Drag to explore employee-count thresholds from data min to max (1K increments)
- **Real-time segmentation:** Accounts dynamically assigned to Enterprise (≥threshold) or Mid-Market (<threshold)
- **Weighted greedy allocation:** Balance three drivers (ARR, Account count, Risk distribution) with user-tunable weights (1% increments, sum to 100%)
- **Preference bonuses:** Geographic match and preservation of existing rep relationships (0.00–0.10 range, tiebreakers not overrides)
- **Multi-dimensional fairness:** CV%-based scores (0–100) with strict 5-band color scale, Custom (user weights) vs Balanced (33/33/33) composites
- **Optimize Weights button:** Find best weight combination at current threshold for maximizing Balanced fairness
- **Sensitivity chart:** See how Balanced and Custom fairness perform across ~30-50 threshold samples; secondary Y-axis shows Deal Size Ratio (E:MM)
- **Rep workload views:** ARR and account distribution across Enterprise and Mid-Market reps
- **Real-time feedback:** Every slider adjustment recalculates allocation, fairness, and distributions instantly

### 2. Territory Comparison (Before/After Analysis)
- **Current vs Proposed:** Side-by-side charts showing ARR and account distribution before and after
- **KPI improvements:** Display fairness score deltas (CV% improvements) for ARR, Accounts, and Risk
- **Account movement table:** Detailed list of which accounts moved, from whom to whom, with ARR impact
- **Justification support:** Clear metrics for stakeholder communication

### 3. Audit Trail (Explainability)
- **Step-through allocation:** Navigate each account assignment decision one at a time
- **Transparency:** For each account, see: segment assignment reason → eligible reps' scores (blended need, geo bonus, preserve bonus) → winner with explanation
- **Trust building:** Reps can verify *why* they got (or didn't get) specific accounts
- **Debug support:** Validate allocation logic is working as intended

### Key Architecture Decisions
- **Threshold is a business choice, not optimized:** Tool illuminates trade-offs; humans decide based on segment sizing, deal economics, team capacity
- **Modular allocation engine:** Logic separated from UI for future API exposure or CRM integration
- **Graceful degradation:** Missing risk_score locks Risk weight to 0% but tool remains functional for ARR + Account balancing
- **Empty segment handling:** Thresholds that empty a segment show N/A for undefined metrics with warning banner (not errors)

---

## Scope

### In Scope

**Data & Upload:**
- Single XLSX file upload with Reps and Accounts tabs (auto-detected by column headers: Reps by Rep_Name, Accounts by Account_ID)
- Reps tab: Rep_Name, Segment ('Enterprise' | 'Mid Market'), Location
- Accounts tab: Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location; Risk_Score optional
- Automatic column mapping: "Current_Rep" → "Original_Rep" during import
- Hard errors for structural issues (missing columns, bad types, duplicates, invalid Segment values, missing tabs); soft warnings for data quality issues
- Validation feedback with clear guidance; graceful degradation for optional fields

**Threshold Exploration:**
- Dynamic slider range from data (min/max employees, rounded to nearest 1K)
- 1,000-employee increments
- Real-time segmentation: ≥threshold → Enterprise, <threshold → Mid-Market

**Allocation Algorithm:**
- Weighted greedy: assign accounts one at a time to "neediest" rep per priority score
- Three balance drivers: ARR, Account count, Risk distribution (high-risk ARR tracked separately)
- Balance weight sliders: 0–100% each, 1% increments, must sum to 100%
- Auto-adjustment: changing one weight proportionally adjusts others to maintain 100% sum
- Two preference bonuses: Geo match and Preserve, each 0.00–0.10 range (step 0.01), default 0.05
- Preference bonus math: bonus B overcomes need gap of at most B/(1+B); at 0.10 max, flips decisions only when reps within ~9% of each other
- Tie-breaking: lowest current ARR → alphabetical by name (balance-first philosophy)

**Fairness Metrics:**
- CV% (coefficient of variation) per driver across reps, inverted to 0–100 fairness score
- Custom composite: weighted average using user's balance weights
- Balanced composite: equal-weight average (33/33/33)
- Strict 5-band color scale: 94–100 Dark Green, 88–93 Light Green, 82–87 Yellow, 75–81 Orange, <75 Red
- Empty segment handling: N/A for undefined CV%, warning banner (not errors)
- Missing risk_score: lock Risk weight to 0%, show N/A for Risk CV%, info banner

**Optimization:**
- "Optimize Weights" button: search 1% increments (same as sliders) to find weight combination maximizing Balanced fairness at current threshold only
- No minimum constraints on any driver (optimizer may recommend unexpected weights like 5/90/5 if data warrants)
- Display recommended weights with resulting Balanced score; user applies or ignores

**Sensitivity Chart:**
- Computed once on data load using current allocation weights
- Two lines: "Balanced Fairness" (scored 33/33/33) and "Custom Fairness" (scored with user's weights)
- Both lines run same allocation, scored differently
- ~30-50 threshold samples for fast compute (<1-2 seconds)
- Secondary Y-axis: Deal Size Ratio (E:MM)
- Hover tooltips: show weight splits for both lines
- No per-threshold optimization (chart shows current config's performance, not optimal ceiling)

**Three Pages:**
- **Territory Slicer:** Configure threshold and weights, view fairness metrics, rep workload distribution, sensitivity chart, rep summary table, account assignments
- **Territory Comparison:** Before/after ARR and account charts, KPI improvements (CV% deltas), account movement table
- **Audit Trail:** Step-through explainability: this account → segment reason → reps' scores (blended, geo, preserve, total) → winner explanation; Previous/Next controls

**Export:**
- CSV with all original columns + Segment + Assigned_Rep
- "Original_Rep" column preserved as-is (already mapped from "Current_Rep" during XLSX import if applicable; Original_Rep = before, Assigned_Rep = after)

**UI/UX:**
- Tooltips required for: fairness scores, blended scores, geo match, optimize weights
- Geo match rule: exact string match, case-insensitive ("CA" = "ca" but "California" ≠ "CA")
- Validation note on upload reminds users to align location formats between Reps and Accounts tabs
- Auto-detection message: "The parser will auto-detect Reps (Rep_Name column) and Accounts (Account_ID column) tabs"
- Column mapping info: "'Current_Rep' column is automatically mapped to 'Original_Rep' during import"
- High-Risk Threshold slider: 0–100, step 5 (defines risk_score cutoff for "high-risk" accounts)

**Technical:**
- Interactive web application (browser-based, no installation)
- Modular allocation logic for future reuse (API exposure, CRM integration)
- All allocation decisions deterministic and reproducible

### Out of Scope

**Not Building in v1:**
- **Threshold optimization:** Threshold is a business decision (segment sizing, deal economics, team capacity), not automated
- **Multi-segment beyond Enterprise/Mid-Market:** v1 is two segments only
- **CRM integration:** Standalone tool; API exposure is future work
- **Historical tracking:** No persistence of past runs; each session is fresh
- **Team hierarchy:** Flat rep list; no manager roll-ups or approval workflows
- **Quota setting:** Allocation only; quota is a separate concern
- **Real-time collaboration:** Single-user tool; no multi-user state or session sharing
- **Per-threshold optimization on sensitivity chart:** Chart shows current config's performance, not optimal ceiling at every point; Optimize Weights handles optimization at current threshold only
- **Mobile optimization:** Standard responsive patterns; not explicitly prioritized
- **Dark mode:** Standard theming support; if easy, fine, but not a requirement

---

## Success Criteria

The Territory Allocation Engine is successful when:

**Data Upload & Validation:**
- [ ] User can upload single XLSX file with Reps tab (Rep_Name, Segment, Location) and Accounts tab (Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location; Risk_Score optional)
- [ ] Auto-detects tabs by column headers (Reps: Rep_Name, Accounts: Account_ID)
- [ ] Automatically maps "Current_Rep" column to "Original_Rep" during import
- [ ] Hard errors block processing for structural issues (missing columns, bad types, duplicates, invalid Segment values, missing tabs) with clear feedback
- [ ] Soft warnings inform about data quality issues (risk_score out of range, orphan reps) but allow processing
- [ ] Validation note on upload reminds users to align location formats between Reps and Accounts tabs for geo matching
- [ ] Display auto-detection and column mapping info to users

**Threshold & Segmentation:**
- [ ] Threshold slider dynamic range matches data (min/max employees, rounded to nearest 1K)
- [ ] Sliding threshold updates segment sizes (Enterprise ≥ threshold, Mid-Market < threshold) in real-time
- [ ] Empty segments show N/A for undefined metrics (CV%, per-rep calculations) with warning banner, not errors

**Allocation & Weighting:**
- [ ] Balance weight sliders (ARR/Account/Risk) adjust in 1% increments, sum to 100%, recalculate allocation and fairness in real-time
- [ ] Changing one balance weight proportionally adjusts other two to maintain 100% sum
- [ ] Preference sliders (Geo Match, Preserve) function in 0.00–0.10 range with 0.01 steps, default 0.05 each
- [ ] Allocation algorithm follows weighted greedy logic: accounts assigned to "neediest" rep per blended need score + preference bonuses
- [ ] Geo match rule works: exact string match, case-insensitive ("CA" = "ca" but "California" ≠ "CA")
- [ ] Preserve bonus applies when current rep matches account's Original_Rep
- [ ] Tie-breaking: when scores equal, winner is rep with lowest current ARR, then alphabetical

**Fairness Metrics:**
- [ ] Fairness scores display CV%-based 0–100 scores for ARR, Account count, Risk distribution per segment
- [ ] Custom composite: weighted average using user's balance weights
- [ ] Balanced composite: equal-weight average (33/33/33)
- [ ] 5-band color scale applied: 94–100 Dark Green, 88–93 Light Green, 82–87 Yellow, 75–81 Orange, <75 Red
- [ ] Tooltips explain fairness scores (CV% method, what scores mean)
- [ ] Missing risk_score gracefully degrades: Risk weight locked to 0%, Risk CV% shows N/A, info banner displayed, tool remains functional

**Optimization:**
- [ ] "Optimize Weights" button finds best weight combination (1% increments) maximizing Balanced fairness at current threshold only
- [ ] Displays recommended weights with resulting Balanced score
- [ ] User can apply recommended weights or ignore them
- [ ] Tooltips explain what "Optimize Weights" does and what "Balanced fairness" means

**Sensitivity Chart:**
- [ ] Chart computed once on data load using current allocation weights
- [ ] Two lines: "Balanced Fairness" (33/33/33 scoring) and "Custom Fairness" (user's weight scoring)
- [ ] ~30-50 threshold samples across range for smooth curve, computes in <1-2 seconds
- [ ] Secondary Y-axis shows Deal Size Ratio (E:MM)
- [ ] Hover tooltips show weight splits for both lines (e.g., "Balanced: 33/33/33", "Custom: 50/30/20")

**Rep Workload Views:**
- [ ] Rep Distribution shows ARR distribution (Enterprise reps + Mid-Market reps) and Account distribution (Enterprise reps + Mid-Market reps)
- [ ] Rep Summary table displays per-rep metrics (ARR, Account count, High-Risk ARR if available)

**Territory Comparison Page:**
- [ ] Before/after charts show Current vs Proposed ARR and account distribution
- [ ] KPI improvements display CV% deltas (fairness score improvements) for ARR, Accounts, Risk
- [ ] Account Movement table lists accounts that changed reps with ARR impact

**Audit Trail Page:**
- [ ] Step-through navigation (Previous/Next) for each account assignment
- [ ] For each account: displays segment assignment reason, eligible reps' scores (blended need, geo bonus, preserve bonus, total), winner explanation
- [ ] Explanations clear and defensible (e.g., "Mickey wins because: lowest blended score + geo match bonus")

**Export:**
- [ ] CSV export includes all original columns + Segment + Assigned_Rep
- [ ] "Original_Rep" column preserved as-is (already mapped from "Current_Rep" during XLSX import if applicable)

**Overall Experience:**
- [ ] Real-time feedback: all slider adjustments recalculate allocation, fairness, and distributions without lag
- [ ] Tooltips required and present for: fairness scores, blended score (Audit Trail), geo match percentage, optimize weights
- [ ] UI is clear, organized, and accessible (standard web patterns for v1)

---

## Testing Strategy

**Philosophy: Progressive Validation, Not End-Loaded Testing**

Testing happens throughout development, not as a final phase. Each wave has acceptance gates that verify correctness before proceeding to the next wave. Critical business logic (allocation algorithm, fairness calculations) is unit tested when built, not after UI is complete.

**Wave-by-Wave Testing Approach:**

**Wave 1 (Foundation):**
- Manual: Verify project builds, dev server runs, routing navigates between pages
- Automated: TypeScript compilation passes, no linter errors
- Gate: Application loads without errors

**Wave 2 (Data Layer):**
- Automated: Unit tests for XLSX parsing, schema validation, error detection, tab auto-detection
- Test cases: Valid XLSX, missing columns, duplicate IDs, orphan reps, invalid types, missing tabs, column mapping ("Current_Rep" → "Original_Rep")
- Manual: Upload sample XLSX file with Reps/Accounts tabs, verify validation messages, verify auto-detection, verify column mapping info display
- Gate: Data validation catches all structural issues, gracefully handles data quality issues, tab auto-detection works correctly

**Wave 3 (Core Allocation) — CRITICAL TESTING GATE:**
- **Automated (created in Wave 3, not deferred):**
  - Unit tests for allocation algorithm (weighted greedy, segment assignment, winner selection)
  - Unit tests for preference bonuses (sign-aware multiplier, geo match, preserve)
  - Unit tests for fairness calculations (CV%, composite scores, color bands)
  - Test cases: Simple (2 reps, 4 accounts), edge (1 rep, empty segment), complex (10 reps, 100 accounts, all weights)
- **Test files created in Wave 3:**
  - `src/lib/allocation/__tests__/greedyAllocator.test.ts`
  - `src/lib/allocation/__tests__/fairness.test.ts`
  - `src/lib/allocation/__tests__/edgeCases.test.ts`
- **Manual verification:**
  - Run allocation with known inputs, manually calculate expected output, verify match
  - Test all preference bonus scenarios (positive scores, negative scores, tie-breaking)
- **Gate: ALL allocation tests pass (>80% coverage) before ANY UI work (Wave 4) starts**
- Rationale: Building UI on broken allocation logic wastes 4 waves of effort

**Wave 4-6 (UI Pages):**
- Automated: Component tests for sliders, charts, tables (verify props render correctly)
- Manual: Visual verification against wireframes, test user interactions
- Gate: Each page renders without errors, user interactions work as expected

**Wave 7 (Polish):**
- Automated: Integration tests for tooltips, export CSV validation, responsive breakpoints
- Manual: Multi-page workflow testing (upload → slicer → comparison → audit → export)
- Gate: End-to-end workflow completes successfully

**Wave 8 (Quality & Scale):**
- Automated: Cross-browser compatibility tests, performance benchmarks (1K, 5K, 10K accounts)
- Manual: Stress testing with edge case data (all accounts same ARR, empty segments, single rep)
- Gate: Performance targets met (<200ms allocation, <2s sensitivity chart), no browser-specific bugs

**Testing Tools & Framework:**
- Jest + React Testing Library for unit and component tests
- Vitest (optional alternative, faster for Vite projects)
- Manual testing with documented test cases and sample datasets

**Test Coverage Targets:**
- Core allocation logic: >80% line coverage
- Fairness calculations: 100% coverage (mathematically critical)
- Data validation: >70% coverage
- UI components: >60% coverage (focus on logic, not trivial rendering)

**Acceptance Gates Between Waves:**
- Wave 3 → Wave 4: All allocation and fairness tests pass
- Wave 7 → Wave 8: End-to-end workflow completes without errors
- Wave 8 complete: Performance targets met, cross-browser validated

**Rationale:**
Progressive testing catches bugs early when they're cheapest to fix. Testing allocation logic in Wave 3 prevents building 4 waves of UI (Waves 4-7) on a broken foundation. Wave 8 focuses on integration, performance, and cross-cutting concerns—not first-time validation of core business logic.

---

## What We're NOT Building

**Automated Decision-Making:**
- Not auto-picking the "optimal" threshold—threshold is a strategic business decision requiring human judgment about segment sizing, deal economics, and team capacity
- Not auto-applying optimized weights—recommendations are guidance; user decides whether to apply

**Advanced Segmentation:**
- Not supporting more than two segments (Enterprise and Mid-Market only in v1)
- Not supporting multi-dimensional segmentation (e.g., by vertical, geography, product line)
- Not supporting dynamic segment definitions beyond employee count

**Integration & Persistence:**
- Not integrating with CRM systems (Salesforce, HubSpot, etc.)—standalone tool
- Not exposing an API (future work)
- Not persisting historical runs or versions—each session is fresh
- Not enabling multi-user collaboration or session sharing

**Organizational Hierarchy:**
- Not supporting team hierarchy (manager roll-ups, approval workflows)
- Not handling quota setting or territory quota allocation
- Not supporting rep capacity planning or headcount modeling

**Advanced Optimization:**
- Not optimizing threshold (business decision, not algorithmic)
- Not computing per-threshold optimal weights on sensitivity chart (shows current config's performance only)
- Not supporting custom fairness targets or user-defined "fair" reference points

**Production-Grade Features:**
- Not building mobile-responsive UI (standard responsive patterns only)
- Not implementing dark mode (unless trivial via standard theming)
- Not supporting real-time collaboration or concurrent users
- Not implementing authentication, authorization, or user management
- Not building audit logging or change history tracking

**Data Features:**
- Not supporting live data feeds or auto-refresh
- Not validating data quality beyond structural checks and basic ranges
- Not providing data cleaning or transformation tools
- Not supporting multiple data formats beyond CSV

---

## Decisions

**Architecture & Technology:**
- **Interactive web application:** Browser-based, no installation required; allocation logic in modules for future reuse/API exposure
- **Modular allocation engine:** Weighted greedy algorithm separated from UI for reusability
- **Client-side computation:** All processing happens in the browser for privacy and simplicity
- **Single XLSX file upload:** User uploads one XLSX file with multiple tabs; parser auto-detects tabs by column headers

**Allocation Methodology:**
- **Threshold is not optimized:** Business decision (segment sizing, deal economics) left to humans; tool illuminates trade-offs
- **Weighted greedy over LP/optimization:** Simpler, faster, more transparent than linear programming; good-enough solutions in real-time
- **Three balance drivers:** ARR, Account count, Risk distribution—covers revenue, workload, and risk dimensions
- **High-risk as separate metric:** Track high-risk ARR separately (not subtracted from ARR) for transparency
- **Preference bonuses as tiebreakers:** Geo and Preserve in 0.00–0.10 range ensure they influence close calls without overriding clear need gaps
- **Tie-breaking: balance-first:** When scores equal, lowest current ARR wins (pushes toward balance); alphabetical as final tiebreaker

**Optimization:**
- **Optimize weights only, not threshold:** Threshold is strategic; weights are tactical tuning
- **Target: Balanced fairness (33/33/33 composite):** Maximize equal-weight composite; shows unbiased ceiling
- **1% increments:** Same granularity as sliders—no gap between optimizer output and achievable settings
- **No minimum constraints:** Optimizer may recommend 0% for any driver if data warrants (e.g., all reps have equal ARR, so ARR weight can be 0%)
- **Current threshold only:** Optimization runs at user's current threshold, not across all thresholds (speed and focus)

**Fairness Metrics:**
- **CV% as core metric:** Coefficient of variation captures "how spread out is the distribution?" in a normalized, interpretable way
- **Invert to 0–100 score:** 100 - CV% creates intuitive scale (higher = better)
- **5-band color scale:** Strict bands (94–100, 88–93, 82–87, 75–81, <75) with Red at <75 to make poor balance obvious
- **Custom vs Balanced composites:** Custom uses user's weights; Balanced uses 33/33/33; both visible for comparison

**Sensitivity Chart:**
- **Compute once on load:** Using current allocation weights; no per-threshold optimization
- **Two lines (Balanced and Custom):** Both run same allocation, scored differently; fast and actionable
- **~30-50 samples:** Balance curve smoothness with compute speed (<1-2 seconds)
- **Secondary Y-axis for Deal Size Ratio:** Shows E:MM economics shift as threshold changes

**Data & Validation:**
- **Single XLSX file with multiple tabs:** Auto-detects Reps (Rep_Name column) and Accounts (Account_ID column) tabs
- **Column mapping:** "Current_Rep" → "Original_Rep" during XLSX import (transparent to users, displayed in validation feedback)
- **Segment values:** 'Enterprise' | 'Mid Market' (full names, not abbreviations like 'E' | 'MM')
- **risk_score is optional:** Graceful degradation (lock Risk weight to 0%, show N/A) rather than hard failure
- **Hard errors vs soft warnings:** Structural issues block (including missing tabs); data quality issues warn
- **Geo match: exact string, case-insensitive:** User responsible for data consistency; validation note reminds them to align formats between tabs
- **Empty segments allowed:** Show N/A and warning banner, not errors—users should see what happens at extreme thresholds

**UI/UX:**
- **Tooltips required:** For fairness, blended score, geo match, optimize—core to trust and understanding
- **Three pages:** Slicer (explore), Comparison (justify), Audit Trail (explain)—separation of concerns
- **Real-time feedback:** Every interaction recalculates instantly—exploration requires speed
- **Export full mirror:** All original columns preserved + new columns (Segment, Assigned_Rep)—respects user's data structure

---

## Context

**Project:** terr-slicer (territory planning tools)

**Spec:** allocation-engine

**Business Context:**
Sales teams restructuring from Generalist to segmented models (Enterprise vs Mid-Market) face a critical threshold decision with no good tooling. Current approaches (gut feel, manual spreadsheets, static models) lack transparency, fairness visibility, and before/after comparison. This creates organizational friction: unfair territories breed rep distrust and attrition; poor threshold choices force expensive mid-year re-orgs; opaque processes damage morale.

**User Personas:**
- **Primary:** Sales operations leaders and managers planning territory restructures
- **Secondary:** Sales reps wanting to understand territory assignments
- **Tertiary:** Executive leadership needing defensible metrics for restructuring decisions

**Technical Context:**
- Web-based tool, no installation required
- CSV data upload (Reps and Accounts files)
- Real-time computation (<1-2 seconds for full allocation + sensitivity chart)
- Modular allocation engine for future API exposure or CRM integration

**Prior Art:**
This spec builds on insights from IDEA.md exploration, including 10+ pivots:
1. ARR-only → multi-driver balance
2. Risk-adjusted ARR → separate risk tracking
3. Threshold + weights optimization → weights-only optimization
4. Single-page → three pages (Slicer, Comparison, Audit Trail)
5. Loose fairness bands → strict 5-band scale
6. Tooltips optional → tooltips required
7. 5% weight increments → 1% increments
8. Preference range 0.00–0.25 → 0.00–0.10
9. "Equal Weight" → "Balanced" label
10. Sensitivity chart: optimal ceiling → current config performance

**Dependencies:**
- Clean Reps and Accounts data in single XLSX file with consistent location formats for geo matching between tabs
- Web browser (modern, JavaScript-enabled)
- No backend infrastructure required (client-side processing)

**Related Artifacts:**
- [IDEA.md](./IDEA.md) — Full idea document with thesis, journey, pivots, and insights
- [artifacts/ALLOCATION.md](./artifacts/ALLOCATION.md) — Allocation methodology and algorithm details
- [artifacts/DATA.md](./artifacts/DATA.md) — Data model and validation rules
- [artifacts/DESIGN-DECISIONS.md](./artifacts/DESIGN-DECISIONS.md) — Design decision rationale
- [artifacts/wireframes.md](./artifacts/wireframes.md) — UI wireframes and component specifications
- [PLAN-streamlit.md](./PLAN-streamlit.md) — Python/Streamlit implementation plan (if exists)
- [PLAN-webapp.md](./PLAN-webapp.md) — React/TypeScript implementation plan (if exists)

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Over-engineering fairness** — Chasing perfect CV% at the cost of business reality (e.g., forcing a terrible threshold for +2 fairness points). | Medium | Medium | Threshold is a business decision, not optimized. Optimize only weights. Show trade-offs via sensitivity chart, don't dictate. |
| **Analysis paralysis** — Too many knobs (three weights, two preference sliders, threshold) overwhelm users; they freeze and don't explore. | High | Medium | Sensible defaults (33/33/33 weights, 0.05 geo, 0.05 preserve). Optimize Weights button for guidance. Clear UI hierarchy. Tooltips explain each control. |
| **False precision** — Users treat fairness scores as ground truth when they're model outputs; chase 97.3 vs 96.8 without considering real-world context. | Medium | High | Tooltips explain CV% and what scores mean. 5-band color scale communicates "good enough" vs "problematic" rather than exact targets. |
| **Adoption friction** — Tool requires clean data; garbage in, garbage out. Users upload messy data and get confusing results. | High | High | Validation on upload with hard errors for structural issues, soft warnings for data quality. Clear error messages. Empty state guidance. Graceful degradation for optional fields (e.g., risk_score). Validation note reminds users to align location formats. |
| **Threshold regret** — User picks threshold based on fairness alone, realizes later that deal sizes don't align with segment expectations. | High | Medium | Sensitivity chart shows Deal Size Ratio (E:MM) on secondary Y-axis. Territory Comparison shows before/after metrics. Tooltips emphasize threshold is strategic, not purely algorithmic. |
| **Opaque recommendations** — Optimize Weights suggests unexpected results (e.g., 5/90/5); users reject without understanding why. | Medium | Medium | Tooltips explain Balanced fairness target (33/33/33 composite). Audit Trail lets users verify allocation logic. Optimizer output shows resulting Balanced score so user can see improvement. |
| **Risk concentration unnoticed** — Users focus on ARR and Account balance, ignore Risk distribution; high-risk accounts cluster on one rep. | Medium | Medium | Risk CV% visible in fairness metrics. High-risk ARR shown in stacked bars. Balanced composite includes Risk dimension equally. Tooltips explain importance of risk distribution. |
| **Preserve vs fairness tension** — High Preserve bonus (0.10) keeps accounts with current reps even when allocation is unfair. | Medium | Low | Preference range capped at 0.10; at max, can only flip decisions when reps within ~9% of each other (tiebreaker, not override). Tooltips explain preference math. Fairness scores show impact; user can reduce Preserve if fairness suffers. |
| **Geo match data inconsistency** — Reps file has "CA", Accounts file has "California"; geo match fails silently; users don't realize. | Medium | High | Validation note on upload reminds users: "Geo match uses exact string match (case-insensitive). Ensure location formats align between Reps and Accounts files." Example: "CA" = "ca" but "California" ≠ "CA". |
| **Empty segment confusion** — Threshold empties one segment (e.g., threshold 100K leaves no Enterprise accounts); users see N/A metrics and think tool is broken. | Low | Medium | Warning banner: "No [Enterprise/Mid-Market] accounts at this threshold." Show N/A for undefined metrics (not 0 or 100). Tooltips explain why. Thresholds at extremes are valid exploration, not errors. |
| **Missing risk_score panic** — User uploads data without risk_score; tool shows locked Risk weight and N/A metrics; user thinks something is wrong. | Low | High | Info banner: "Risk_Score column not found. Risk dimension disabled. Tool remains functional for ARR and Account balancing." Risk weight slider greyed with tooltip explanation. Show N/A for Risk CV% with tooltip. |
| **Sensitivity chart misinterpretation** — Users think chart shows "optimal" fairness at every threshold; expect to see ceiling, not current config performance. | Low | Medium | Chart labels: "Balanced Fairness (current config)" and "Custom Fairness (current config)". Tooltips explain: "Shows how your current allocation weights perform at different thresholds." Optimize Weights button for finding optimal weights at current threshold. |
| **Audit Trail tedium** — 500 accounts means 500 steps; users don't have patience to step through all; lose trust because they can't verify. | Low | Low | Audit Trail is for spot-checking and debugging, not exhaustive review. Users can jump to specific accounts (if we add search/filter in future). Export CSV provides full assignment list for external analysis. |
| **Export confusion** — Users don't understand difference between Original_Rep (before) and Assigned_Rep (after). | Low | Medium | Clear column labels: "Original_Rep" (current assignments) and "Assigned_Rep" (proposed assignments). Documentation in tooltips or export dialog. |
| **Single-user limitation** — Two people on team want to explore different scenarios simultaneously; single-session tool blocks collaboration. | Low | Low | Document as out-of-scope for v1. Future: multi-session support or API for parallel exploration. Workaround: run on separate machines or take turns. |
| **Performance degradation** — Large datasets (10K+ accounts, 50+ reps) slow down real-time allocation; users wait >5 seconds per slider change. | Medium | Low | Optimize allocation algorithm (weighted greedy is O(n·m) per iteration, manageable for expected dataset sizes <1K accounts, <20 reps). If performance suffers, add loading indicator and async computation. Future: memoization or incremental updates. |

**Risk of Inaction:**
| Risk | Consequence |
|------|-------------|
| **Unfair territories** — Imbalanced ARR or account loads create winner/loser dynamics. | Rep attrition, comp disputes, morale damage. |
| **Threshold regret** — Pick the wrong threshold, realize months later that deal sizes don't align with segment expectations. | Expensive mid-year territory re-org, quota resets, pipeline disruption. |
| **Opaque process** — Reps don't understand how territories were assigned. | Distrust, "the game is rigged" perception, disengagement. |
| **Risk concentration** — High-risk accounts cluster on one or two reps by accident. | Single-rep blowups; revenue volatility. |
| **Lost institutional knowledge** — No record of *why* this threshold was chosen. | Future re-orgs start from scratch, repeat past mistakes. |

---

## Notes

**Open Questions:**
No significant open questions remain. All major design decisions have been resolved through the journey documented in IDEA.md. Minor implementation details (exact tooltip wording, animation timing, etc.) can be decided during build.

**Future Enhancements (Post-v1):**
- Multi-segment support (more than two segments)
- CRM integration (Salesforce, HubSpot)
- API exposure for allocation engine
- Historical tracking and versioning
- Multi-user collaboration
- Team hierarchy and approval workflows
- Quota allocation integration
- Mobile-responsive UI
- Advanced data validation and cleaning tools
- Real-time data feeds
