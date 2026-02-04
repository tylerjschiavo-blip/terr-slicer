# Allocation Methodology

How accounts are assigned to reps. Single source of truth for implementers.

---

## Segmentation

**Threshold:** User sets an employee-count threshold (dynamic range from data; rounded to nearest 1K).

**Rule:**
- Account employees **≥ threshold** → **Enterprise**
- Account employees **< threshold** → **Mid-Market**

**Rep segments:** Fixed per rep (from uploaded Reps data). Enterprise accounts → Enterprise reps only. Mid-Market accounts → Mid-Market reps only.

---

## Weighted Greedy Algorithm

Within each segment (E and MM separately), accounts are assigned **one at a time** in descending ARR order (ties broken by Account_ID).

### For Each Account:

#### Step 1: Calculate Blended Score (Balance Component)

For each eligible rep (same segment), calculate how far they are from target:

```
ARR Need = (Target ARR - Current ARR) / Target ARR
Account Need = (Target Accounts - Current Accounts) / Target Accounts
Risk Need = (Target Risk ARR - Current Risk ARR) / Target Risk ARR

Blended Score = (ARR Need × ARR Weight%) + (Account Need × Account Weight%) + (Risk Need × Risk Weight%)
```

**User weights:** Sum to 100%, adjustable in 1% increments (e.g., 50% ARR, 30% Account, 20% Risk)

**Score interpretation:**
- **Positive (0 to 1):** Rep is UNDER target. Higher = more need.
  - Example: 0.30 = 30% below target
- **Negative:** Rep is OVER target (overburdened). More negative = lower priority.
  - Example: -0.20 = 20% over target
- **Zero:** Exactly at target

#### Step 2: Apply Preference Bonuses

Two bonuses (each 0.00–0.10, user-adjustable, default 0.05):

- **Geo Match:** Account location = rep location (exact string, case-insensitive). "CA" = "ca" but "California" ≠ "CA".
- **Preserve:** Account's Original_Rep = this rep's name.

**Formula (CRITICAL - sign-aware multiplier):**

```
IF Blended Score ≥ 0 (under target):
  Total Score = Blended × (1 + Geo Bonus + Preserve Bonus)
  → Bonuses INCREASE score → higher priority

IF Blended Score < 0 (over target):
  Total Score = Blended × (1 - Geo Bonus - Preserve Bonus)
  → Bonuses make score LESS negative → more competitive
```

**Examples:**
- Alice: 0.25 blended, +0.05 geo, +0.05 preserve → 0.25 × 1.10 = **0.275**
- Bob: 0.27 blended, no bonuses → **0.27**
- Carol: -0.20 blended, +0.05 geo → -0.20 × 0.95 = **-0.19**

**Preference bonus math:** Bonus B can overcome relative need gap of at most B/(1+B). At 0.10 max, preferences flip decisions only when reps within ~9% of each other. Combined max bonus (0.20) designed to never exceed smallest driver weight—true tiebreaker, not override.

#### Step 3: Select Winner

**Highest total score wins** (most under target = highest priority).

**Tie-breaking (exact score ties):**
1. Lowest current ARR wins
2. Then alphabetical by Rep_Name

**Update state:** Winner's current ARR, account count, and risk ARR increase. Next account processes with updated balances.

---

## High-Risk Accounts

**Definition:** Account is "high-risk" if `risk_score ≥ High-Risk Threshold` (user slider, 0–100).

**Use:** High-risk ARR tracked separately for fairness (Risk CV%) and stacked-bar display. Does NOT change who gets the account—only affects balance metrics and visuals.

**Missing risk_score:** If column missing from data, Risk weight locked to 0%, Risk CV% shows N/A, info banner displayed. Tool remains functional for ARR + Account balancing.

---

## Fairness Metrics

**Per driver:** For ARR, Account count, and Risk distribution, calculate **CV%** (coefficient of variation) across reps in segment.

```
CV% = (Standard Deviation / Mean) × 100
Fairness Score = 100 - CV%
```

Higher score = more balanced. Clamped to 0–100 range.

**Empty segments:** If segment has zero accounts or zero reps, CV% is undefined. Return **N/A** (not 0 or 100).

**Composite fairness:**
- **Custom:** Weighted average using user's current balance weights (e.g., 50/30/20)
- **Balanced:** Equal-weight average (33/33/33)

**Color scale (5 bands):**
- 94–100: Dark Green
- 88–93: Light Green
- 82–87: Yellow
- 75–81: Orange
- <75: Red
- N/A: Gray

---

## Optimization

**Scope:** Optimize **weights only** (ARR/Account/Risk split). Threshold is NOT optimized—it's a business choice.

**Target:** Find weight combination maximizing **Balanced fairness** (33/33/33 composite) at **current threshold only**.

**Search space:** 1% increments for each weight (same as user sliders). No minimum constraints—optimizer may recommend 0% for any driver if that maximizes Balanced fairness.

**Output:** Recommended weights (e.g., 45/35/20) and resulting Balanced score. User can apply or ignore.

**Sensitivity chart:**
- Computed **once on data load** using current allocation weights (not per-threshold optimization)
- **Two lines:** "Balanced Fairness" (scored 33/33/33) and "Custom Fairness" (scored with user's weights)
- **~30-50 threshold samples** for fast compute (<1-2 seconds)
- **Secondary Y-axis:** Deal Size Ratio (Enterprise Avg ARR / Mid-Market Avg ARR)
- **No per-threshold optimization**—chart shows current config's performance, not optimal ceiling

---

## Audit Trail (Step-Through)

For each account assignment:

1. **This account:** Name, ARR, employees; segment reason (e.g., "Enterprise (threshold 2,750: 53K ≥ 2,750)")
2. **Eligible reps:** Table showing Blended score, Geo bonus, Preserve bonus, Total score
3. **Winner:** "[Rep] wins because: highest total score (most under target) + [bonuses if applicable]"

Tie-breaking explained when applicable (e.g., "tied score + lower current ARR").

---

## Export

**Format:** Full mirror of original data

**Columns:** All original columns + `Segment` + `Assigned_Rep`

**Renamed column:** Original rep column renamed from "Current_Rep" to **"Original_Rep"**
- Original_Rep = before allocation
- Assigned_Rep = after allocation
