# Allocation Engine — IDEA

## Status

**spec-ready**

---

## Thesis

A dynamic Territory Slicer that lets sales leaders find the "sweet spot" employee-count threshold for segmenting accounts into Enterprise vs Mid-Market, while a weighted greedy algorithm allocates accounts to reps with fairness, transparency, and explainability baked in.

---

## Synopsis

We are restructuring a sales team from a Generalist model to a segmented model with dedicated Enterprise and Mid-Market reps. The central question: *where do we draw the line?* Rather than guessing a threshold and hoping it works, we need a tool that lets us explore the trade-offs in real time.

The Territory Slicer is an interactive application where users slide an employee-count threshold and immediately see how that impacts segment sizes, rep workloads, and allocation fairness. Behind the scenes, a weighted greedy algorithm assigns accounts to reps by balancing three drivers—ARR, account count, and risk distribution—with preference bonuses for geographic match and preserving existing rep relationships. Fairness is measured via coefficient of variation (CV%) across reps, converted to a 0–100 score with a strict 5-band color scale. An Audit Trail lets users step through each assignment decision to understand *why* a rep won an account—building trust in the result.

---

## Telos

**Enable sales leaders to make confident, defensible territory decisions by surfacing the trade-offs hidden in threshold choices and making the allocation logic fully transparent.**

The ultimate good this serves is *organizational trust*: reps trust that territories are fair; leadership trusts that the model is explainable; the business trusts that the segmentation balances revenue potential with risk and workload. This is not just about optimizing a number—it's about giving humans the insight and agency to choose the threshold that fits their strategy, knowing exactly what they're trading off.

---

## Value

- **Speed to insight.** Slide a threshold, see the impact instantly—no spreadsheet gymnastics or waiting for ops to rerun models.
- **Multi-dimensional fairness.** Balance ARR, account count, and risk distribution simultaneously, with tunable weights.
- **Preference-aware allocation.** Reward geographic fit and preserve rep relationships where possible, reducing churn and transition friction.
- **Explainability.** Audit Trail shows *this account → this segment → these reps' scores → this winner because X*. No black boxes.
- **Before/After clarity.** Territory Comparison page shows exactly what changed from current assignments, with CV% improvements and account movement.
- **Optimization assist.** One-click "Optimize Weights" finds the best weight combination for your current threshold—guidance, not autopilot.

---

## Impact

- **For sales reps:** Fairer territories mean fairer comp opportunities. Transparency reduces "why did *they* get that account?" friction.
- **For sales leadership:** Defensible allocation decisions. Clear metrics to justify threshold choices to executives and finance.
- **For rev ops:** Faster territory planning cycles. Reusable allocation logic that can evolve into an API or integrate with CRM systems.
- **For the business:** Better risk distribution prevents single-rep catastrophe. Geo match improves coverage efficiency.

---

## Opportunity

- **Short-term:** Solve the immediate segmentation challenge—decide the E/MM threshold with confidence.
- **Mid-term:** Establish a repeatable territory rebalancing process as the team grows or market conditions shift.
- **Long-term:** The allocation engine (weighted greedy, fairness scoring, audit logging) is a reusable module. Expose it as an API for integration with Salesforce, HubSpot, or custom CRM. Extend to other segmentation dimensions (vertical, geo, product line).

---

## Problem

Current state: the team is about to segment into Enterprise and Mid-Market, but there's no clear method to decide *where* the threshold should be. Options being considered:

1. **Gut feel** — pick 500 employees, hope it works. No visibility into fairness or workload impact.
2. **Manual spreadsheet** — iterate threshold values, manually recalculate distributions. Slow, error-prone, doesn't scale.
3. **Static model** — build once, run once. Doesn't allow real-time exploration of trade-offs.

All options lack transparency: even if the allocation is fair, reps don't *see* why, which breeds distrust. And none provide a before/after comparison to justify the change.

---

## Risk of Action

| Risk | Mitigation |
|------|------------|
| **Over-engineering fairness** — Chasing perfect CV% at the cost of business reality (e.g., forcing a terrible threshold for +2 fairness points). | Threshold is a business decision, not optimized. Optimize only weights. Show trade-offs, don't dictate. |
| **Analysis paralysis** — Too many knobs (three weights, two preference sliders, threshold) overwhelm users. | Sensible defaults (33/33/33 weights, 0.05 geo, 0.05 preserve). Optimize Weights button for guidance. Clear UI hierarchy. |
| **False precision** — Users treat fairness scores as ground truth when they're model outputs. | Tooltips explain CV% and what scores mean. 5-band color scale communicates "good enough" vs "problematic" rather than exact targets. |
| **Adoption friction** — Tool requires clean data; garbage in, garbage out. | Validation on upload. Clear error messages for missing columns. Empty state guidance. Graceful degradation for optional fields (e.g., risk_score). |

---

## Risk of Inaction

| Risk | Consequence |
|------|-------------|
| **Unfair territories** — Imbalanced ARR or account loads create winner/loser dynamics. | Rep attrition, comp disputes, morale damage. |
| **Threshold regret** — Pick the wrong threshold, realize months later that deal sizes don't align with segment expectations. | Expensive mid-year territory re-org, quota resets, pipeline disruption. |
| **Opaque process** — Reps don't understand how territories were assigned. | Distrust, "the game is rigged" perception, disengagement. |
| **Risk concentration** — High-risk accounts cluster on one or two reps by accident. | Single-rep blowups; revenue volatility. |
| **Lost institutional knowledge** — No record of *why* this threshold was chosen. | Future re-orgs start from scratch, repeat past mistakes. |

---

## Journey

### Origin

The challenge came from a real restructuring: *"We're moving from Generalist to segmented. Where do we draw the line between Enterprise and Mid-Market?"* The initial framing was simple: build a tool where you slide a threshold and see the ARR distribution change. "Equitable" was defined as "balance ARR."

### Pivots

1. **ARR-only → Multi-driver balance.** Early exploration revealed that ARR balance alone could produce wildly unequal account counts (one rep with 10 huge accounts, another with 80 small ones). We added account count as a second driver, then risk distribution as a third. The algorithm became a weighted greedy approach with user-tunable weights.

2. **Risk-adjusted ARR → Separate risk tracking.** Considered subtracting risk from ARR (e.g., risk-adjusted value). Decided this was opaque and lost information. Pivoted to tracking high-risk ARR *separately*—visible in stacked bars, balanced via Risk CV%, but not subtracted from headline ARR.

3. **Threshold + Weights optimization → Weights-only optimization.** Initial design had checkboxes to optimize both threshold and weights. Realized threshold is a *business* decision (segment sizing, deal economics, team capacity)—not something the algorithm should auto-pick. Simplified to "Optimize Weights" at the *current* threshold. Threshold Sensitivity chart still lets users explore what-ifs.

4. **Single-page → Three pages.** Started with one page (slicer). Added Territory Comparison page for before/after analysis—essential for justifying the change. Added Audit Trail page for step-through explainability—core to building trust.

5. **Loose fairness bands → Strict 5-band scale.** Early designs had vague color coding. Tightened to a defined 5-band scale (94–100 Dark Green, 88–93 Light Green, 82–87 Yellow, 75–81 Orange, <75 Red). Red at <75 makes poor balance is obvious.

6. **Tooltips optional → Tooltips required.** Initially treated tooltips as nice-to-have. Elevated to required for fairness scores, blended scores, geo match, and optimize weights. These explanations are *the* value add for trust.

7. **5% weight increments → 1% increments.** Originally constrained weights to 5% steps for simplicity. Changed to 1% increments so optimizer output maps directly to slider values—no gap between "recommended" and "achievable." Same search space for user and algorithm.

8. **Preference range 0.00–0.25 → 0.00–0.10.** Original generous preference bonus range could let preferences override significant need gaps. Tightened to 0.10 max based on math: combined max bonus (0.20) should never exceed smallest driver weight. At 0.10, preferences can flip decisions only when reps are within ~9% of each other—true tiebreaker, not override.

9. **"Equal Weight" → "Balanced."** Renamed the 33/33/33 benchmark to "Balanced" for clarity. Labels now read "Custom" (user's weights) and "Balanced" (33/33/33) to avoid confusion with the concept of equal distribution.

10. **Sensitivity chart: speed over ceiling.** Original design computed *optimal* fairness at every threshold—running full optimization at each point. This was theoretically interesting (showing the ceiling) but slow and expensive. Pivoted to showing two lines using the *current* allocation weights: "Balanced Fairness" (scored with 33/33/33) and "Custom Fairness" (scored with user's weights). Both run the same allocation, just scored differently. Computes in <1-2 seconds with ~30-50 threshold samples. "Optimize Weights" button still finds optimal weights but only for the current threshold.

### Dead Ends

- **Disruption score.** Considered a composite metric tracking how much churn the new allocation causes (accounts moved, ARR shifted). Dropped as overkill—Account Movement table on Comparison page covers this more simply.
- **Auto-apply optimization.** Considered having "Optimize" auto-apply the recommended weights. Rejected; user should see the recommendation and choose to apply. Agency > automation.
- **Segment assignment in Accounts file.** Early data model had segment in the Accounts file. Removed—segment is determined by threshold + employee count, not pre-assigned. Simplifies the model and makes threshold exploration coherent.
- **Configurable benchmark.** Considered letting users set their own "fair" reference point (e.g., 50/30/20 instead of 33/33/33). Rejected—adds complexity without clear value. Balanced (33/33/33) is the intuitive unbiased baseline.

---

## Insights

1. **Fairness is multi-dimensional.** Balancing ARR alone is insufficient; account count and risk distribution matter too. The weighted approach lets different orgs tune to their priorities.

2. **Transparency builds trust.** The Audit Trail isn't just for debugging—it's for *selling* the allocation to reps. "Mickey wins because lowest blended + geo match + lower current ARR" is more convincing than "the model said so."

3. **Threshold is strategy, not math.** Automating threshold selection would remove the human judgment that *should* be part of segmentation decisions. The tool's job is to illuminate trade-offs, not make the call.

4. **CV% is a powerful, understandable metric.** Coefficient of variation maps cleanly to "how spread out is the distribution?" and inverts to a 0–100 fairness score that non-technical users grasp.

5. **Preserve and Geo bonuses soften the blow.** Without them, optimal fairness might require shuffling every account. Preference multipliers let you get *good* fairness while minimizing disruption.

6. **Before/After comparison is non-negotiable.** You can't justify a change without showing what changed. Territory Comparison page is essential, not a nice-to-have.

7. **Preference bonus math: B/(1+B).** A preference bonus B can overcome a relative need gap of at most B/(1+B). At 0.10 max, preferences flip decisions only when reps are within ~9% of each other. This ensures preferences are tiebreakers, not overrides—they influence close calls without steamrolling clear mismatches.

8. **1% weight increments align user and optimizer.** When sliders and optimizer search the same increment space, "Apply Recommended Weights" is a direct action—no rounding, no "closest achievable" approximation. What the optimizer finds is exactly what the user can set.

9. **Graceful degradation > hard failures.** If risk_score is missing, disable the Risk dimension rather than blocking the tool. Users can still balance ARR and Account count. Warnings inform; failures frustrate.

10. **Empty segments need explicit handling.** When a threshold puts zero accounts in a segment, CV% is undefined (not 0 or 100). Show N/A and a warning banner rather than breaking the dashboard or showing misleading metrics.

11. **Balanced is the right benchmark.** 33/33/33 is the unbiased starting point—no driver prioritized over another. Calling it "Balanced" clarifies that it's a baseline for comparison, not a recommendation.

12. **Geo match: exact string, case-insensitive.** "CA" = "ca" but "California" ≠ "CA". User responsible for data consistency between Reps and Accounts files. Validation note on upload reminds users to align location formats.

13. **Tie-breaking: balance-first philosophy.** When scores are exactly equal, winner is the rep with lowest current ARR, then alphabetical by name. Since Preserve bonus already handles stability, tiebreaker pushes toward balance. Audit trail explains: "Mickey wins because tied score + lower current ARR ($2.1M vs $2.4M)."

14. **Validation: hard errors vs soft warnings.** Structural issues (missing columns, bad types, duplicates) block processing. Data quality issues (risk_score out of range, orphan reps) show warnings but proceed. Clear feedback without frustrating users who have mostly-good data.

15. **Sensitivity chart: speed over ceiling.** Showing "optimal fairness at every threshold" required expensive optimization at each point. Pivoted to showing "your config's performance at every threshold"—two lines (Balanced and Custom scoring) using current allocation weights. Computes in <1-2 seconds, gives actionable insight. Optimization reserved for current threshold only.

---

## Open Questions

*No significant open questions remain.* All major design decisions have been resolved. Minor implementation details (exact tooltip wording, animation timing, etc.) can be decided during build.

---

## Scope Sketch

### In (for v1)

- **Threshold slider** — dynamic range from data, 1K increments
- **Weighted greedy allocation** — three drivers (ARR, Account, Risk) + two preference bonuses (Geo, Preserve)
- **Balance weight sliders** — 0–100% each, **1% increments**, must sum to 100%
- **Preference sliders** — Geo and Preserve: **0.00–0.10 range**, step 0.01, **default 0.05 each**
- **Fairness metrics** — CV%-based scores, 5-band color scale, **Custom / Balanced** composites (tooltips show weight splits)
- **Optimize Weights** — single button, searches **1% increments** (same as sliders), finds best weights at **current threshold only** for Balanced fairness; no minimum constraints on any driver
- **Sensitivity chart** — computes **once on data load** using current allocation weights; **two lines**: "Balanced Fairness" (33/33/33 scoring) and "Custom Fairness" (user's weight scoring); secondary Y-axis shows **Deal Size Ratio (E:MM)**; **~30-50 threshold samples** for fast compute (<1-2 seconds); hover tooltips show weight splits
- **Empty segment handling** — allow thresholds that empty a segment; show N/A for undefined metrics (CV%, per-rep calculations); display **warning banner** ("No [Enterprise/Mid-Market] accounts at this threshold")
- **Missing risk_score handling** — graceful degradation: lock Risk weight to 0% (greyed slider), show N/A for Risk CV%, display info banner; tool remains functional for ARR + Account balancing
- **Three pages:**
  - Territory Slicer (configure, view fairness, rep distribution, sensitivity, rep summary, account assignments)
  - Territory Comparison (before/after ARR/accounts charts, KPI improvement, account movement)
  - Audit Trail (step-through: account → segment → reps' scores → winner)
- **Data upload** — Reps (Rep_Name, Segment, Location) + Accounts (Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location; Risk_Score optional). **Hard errors** for missing columns, bad types, duplicates. **Soft warnings** for risk_score range issues, orphan reps. Validation note on upload reminds users to align location formats.
- **Export** — CSV with all original columns + **Segment** + **Assigned_Rep**; rename original rep column from "Current_Rep" to **"Original_Rep"** (Original_Rep = before, Assigned_Rep = after)
- **Tooltips** — required for fairness, blended score, geo match, optimize
- **Modular architecture** — allocation logic separated from UI for reuse

### Out (for now)

- **Threshold optimization** — business decision, not automated
- **Multi-segment beyond E/MM** — v1 is two segments only
- **CRM integration** — standalone tool; API exposure is future
- **Historical tracking** — no persistence of past runs; each session is fresh
- **Team hierarchy** — flat rep list; no manager roll-ups
- **Quota setting** — allocation only; quota is a separate concern
- **Real-time collaboration** — single-user tool; no multi-user state
- **Per-threshold optimization on sensitivity chart** — chart shows current config's performance, not optimal ceiling; Optimize Weights button handles optimization at current threshold only

### Fuzzy / TBD

- **Mobile responsiveness** — standard responsive patterns; not a priority but not explicitly excluded
- **Dark mode** — standard theming support; if it's easy, sure

---

## Related

- **terr-slicer project** — parent project for territory planning tools
- **allocation-engine spec** — this idea becomes the spec; artifacts folder contains ALLOCATION.md, DATA.md, DESIGN-DECISIONS.md, wireframes.md

---

*Detailed spec artifacts:* See `artifacts/README.md` for index of methodology, data model, design decisions, and wireframes.
