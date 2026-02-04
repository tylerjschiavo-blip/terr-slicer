## Key Inputs/Outputs

### Coefficient of Variation (CV%)
Measures distribution balance. Calculated as `CV% = (Standard Deviation / Mean) × 100`—lower values mean better balance.

### Fairness Score
Derived from CV% using `Fairness Score = 100 - CV%`, where higher scores indicate better balance. Used to measure ARR, Account count, and Risk ARR distribution.

### Balance Weights
User-configurable weights (ARR%, Account%, Risk%) that sum to 100%. Control how much each driver (ARR, Account count, Risk ARR) influences allocation decisions. Higher weight = higher priority.

### Weighted Fairness
Composite fairness using your current balance weights (e.g., 50% ARR, 30% Account, 20% Risk). Reflects how balanced the allocation is according to your priorities.

### Balanced Fairness
Composite fairness with equal weighting (33/33/33 split). Provides an objective baseline treating all drivers equally.

### Geo Match Bonus
Preference bonus (0.00–0.10, default 0.05) when account location matches rep location. Makes reps more competitive for local accounts.

### Preserve Bonus
Preference bonus (0.00–0.10, default 0.05) when account's Original_Rep matches rep name. Helps preserve existing relationships.

### High Risk Threshold
Threshold (0–100) determining which accounts are "high-risk" based on risk_score. Affects how risk is measured, not which rep gets the account.

## How It Works

### Allocation Scoring Logic
Accounts assigned one-by-one using weighted greedy algorithm. Each eligible rep gets a Blended Score (how far from targets), then Preference bonuses applied. Highest score wins the account.

### Blended Score Calculation
Measures gap to target across ARR, Account count, and Risk ARR. Formula: `Blended Score = (ARR Need × ARR Weight%) + (Account Need × Account Weight%) + (Risk Need × Risk Weight%)` where `Need = (Target - Current) / Target`. Positive = under target (higher = more need). Negative = over target.

### Preference Bonus Application
Bonuses use sign-aware multiplier. Under target: `Total = Blended × (1 + Geo + Preserve)`. Over target: `Total = Blended × (1 - Geo - Preserve)`. Bonuses make reps more competitive without overriding balance logic.

### Why Higher Scores Are Better
Higher scores = more need. Algorithm assigns to highest scorer, balancing fairness with efficiency to prioritize under-target reps.
