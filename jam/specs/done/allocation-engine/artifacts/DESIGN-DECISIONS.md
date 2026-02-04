# Design decisions

Why we chose what we chose. For handoff and future changes.

## Allocation & optimization

- **Threshold is not optimized.** Threshold is a business decision (segment sizing, deal economics). Only **weights** (ARR / Account / Risk) are optimized for fairness at the current threshold.
- **Optimization target: Balanced score.** Optimize Weights finds the weight combination (ARR/Account/Risk split) that produces the highest **Balanced** fairness score (the 33/33/33 composite) at the current threshold only. We maximize that metric; we don't fix weights at 33/33/33. "Custom" remains visible as a comparison; no second optimization target.
- **Optimizer searches 1% increments.** Same granularity as user sliders—no gap between optimizer output and achievable slider values. No minimum constraints on any driver; optimizer may recommend unexpected weights (e.g., 5/90/5) if that truly maximizes Balanced fairness.
- **High-risk is a separate metric.** We do not subtract risk from ARR; we track high-risk ARR separately and balance its distribution (Risk CV%). Simpler and more transparent than risk-adjusted ARR.
- **risk_score is optional.** If missing from uploaded data: lock Risk weight to 0% (greyed slider), show N/A for Risk CV%, display info banner. Tool remains fully functional for ARR + Account balancing.
- **Tie-breaking: balance-first philosophy.** When scores are exactly equal, winner is rep with lowest current ARR, then alphabetical by name. Since Preserve bonus already handles stability, tiebreaker pushes toward balance.

## Fairness & UI

- **5-band color scale (6-point bands).** 94–100, 88–93, 82–87, 75–81, <75. Strict but achievable; Red <75 so poor balance is obvious.
- **Fairness Index: E, MM, Average.** Per-segment scores plus an average. "Average" last; labels "Custom" / "Balanced" (clean labels). Tooltips show weight splits (e.g., "33/33/33" for Balanced, "50/30/20" for Custom).
- **Tooltips are required.** Fairness Index scores, Blended score (Audit Trail), Geo Match %, Optimize Weights. Core value add for trust and clarity.
- **Empty segment metrics.** When threshold empties a segment: CV% returns N/A (not 0 or 100), division by zero shows "—" or N/A. Warning banner: "No [Enterprise/Mid-Market] accounts at this threshold."
- **Geo match rule.** Exact string match, case-insensitive. "CA" = "ca" but "California" ≠ "CA". User responsible for data consistency; validation note on XLSX upload reminds users to align location formats between Reps and Accounts tabs.

## Sensitivity chart

- **Computes once on data load.** Uses current allocation weights. No per-threshold optimization.
- **Two lines: Balanced Fairness and Custom Fairness.** Both run the same allocation using current weights, just scored differently. "Balanced" uses 33/33/33 scoring; "Custom" uses user's current weight scoring. This is a pivot from "showing the ceiling" (optimal at every threshold) to "showing your current config's performance" (fast and actionable).
- **~30-50 threshold samples.** Fast compute (<1-2 seconds). Evenly sampled across threshold range.
- **Secondary Y-axis: Deal Size Ratio (E:MM).** Helps users see how segment economics shift.
- **Hover tooltips.** Show weight splits for both lines (e.g., "Balanced: 33/33/33" and "Custom: 50/30/20").
- **No per-threshold optimization.** Chart shows current config's performance, not optimal ceiling. Optimize Weights button handles optimization at current threshold only.

## Pages & layout

- **Three pages:** Territory Slicer (configure + view), Territory Comparison (before/after), Audit Trail (step-through). Shared sidebar; same data and controls everywhere.
- **Rep Distribution: one ARR set, one Accounts set.** Enterprise + Mid-Market side by side for each; no duplicate Accounts charts. Trend line (e.g. average) across bars; no "target" label.
- **Segment Metrics: E, MM, Total.** Total is a full summary (same KPIs as E and MM). No separate "Deal Size Ratio" card; Deal Size Ratio (E:MM) only where relevant (e.g. sensitivity chart).
- **Audit Trail: step-through only.** No full assignment log table; just "this account → segment → reps' scores → winner because …" with Previous/Next centered.

## Data & build

- **Single XLSX file upload.** User uploads one XLSX file with multiple tabs (Reps and Accounts). Parser auto-detects tabs by column headers (Reps: Rep_Name, Accounts: Account_ID). No separate CSV files.
- **Rep segment from upload.** 'Enterprise' vs 'Mid Market' for reps comes from the Reps tab (full names, not abbreviations). No segment in Accounts tab.
- **Column mapping: "Current_Rep" → "Original_Rep".** If XLSX file contains "Current_Rep" column, it is automatically mapped to "Original_Rep" during import. Users informed via validation feedback.
- **React/TypeScript web app.** Fast to build; allocation logic in modules so it can be reused or exposed via API later.
- **State management: Zustand store.** Uploaded data (reps, accounts) stored in Zustand store for persistence across page navigation. Users can switch between Territory Slicer, Comparison, and Audit Trail pages without re-uploading files. File references and UI state remain in local component state.
- **Export format: full mirror.** All original columns + Segment + Assigned_Rep. "Original_Rep" column preserved as-is (already mapped from "Current_Rep" during XLSX import if applicable). Original_Rep = before, Assigned_Rep = after.

## Sliders & ranges

- **Employee threshold:** Dynamic range from data (min/max employees, rounded to nearest 1K). Increment 1,000.
- **Balance weights:** 0–100% each, **1% steps**; must sum to 100%.
- **Balance weight auto-adjustment:** When user adjusts one weight, the other two adjust proportionally to maintain sum of 100%. Rounding: calculate proportional values, round to nearest integer, reconcile any ±1 difference by adjusting the larger slider. Example: ARR 50→53 with Account=30, Risk=20 → Account=28, Risk=19. Compute: microseconds (trivial arithmetic, no performance impact).
- **Geo / Preserve:** **0.00–0.10**, step 0.01, **default 0.05 each**.
- **Preference bonus math:** Bonus B can overcome a relative need gap of B/(1+B). At 0.10 max, preferences flip decisions only when reps are within ~9% of each other—tiebreaker, not override.
- **High-Risk Threshold:** 0–100, step 5.
- **Sensitivity x-axis:** Same range as threshold; e.g. 1K increments for smooth curve.
