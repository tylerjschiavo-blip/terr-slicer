/**
 * Tooltip content constants
 * Centralized tooltip text matching app/docs/tooltips.md
 */

export const TOOLTIP_CONTENT = {
  // Fairness Scores
  fairness: {
    custom: "Distribution fairness based on your current weight settings. Score of 100 = perfect fairness, lower scores indicate imbalance across reps.",
    
    balanced: "Distribution fairness using equal weights (33% ARR, 33% Accounts, 33% Risk). Provides an unbiased fairness benchmark.",
    
    cv: "Statistical measure of distribution balance. Lower is better. CV% < 10% = Excellent, 10-15% = Good, 15-20% = Fair, >20% = Poor distribution.",
    
    segment: "Fairness score for Enterprise or Mid-Market segment only. Helps identify if one segment is better balanced than the other.",
    
    average: "Overall fairness across both segments, weighted by number of reps in each segment.",
  },

  // Blended Score
  blendedScore: {
    what: "Normalized priority score combining ARR, Account, and Risk distribution needs. Each rep's needs are weighted by your current settings to determine allocation priority.",
    
    full: `**What is Blended Score?**
Normalized priority score combining ARR, Account, and Risk distribution needs. Each rep's needs are weighted by your current settings to determine allocation priority.

**How it's calculated:**
1. Calculate each rep's "need" relative to their target for ARR, Accounts, and Risk
2. Normalize these needs to a 0-100 scale
3. Multiply by your weight settings (ARR%, Account%, Risk%)
4. Sum to create the blended score

Higher blended score = higher priority for receiving accounts.`,
  },

  // Geo Match Preference
  geoMatch: {
    short: "Bonus applied when assigning accounts to reps in the same geographic region. Helps preserve local relationships and reduce travel costs.",
    
    full: `**What is Geo Match?**
Bonus applied when assigning accounts to reps in the same geographic region. Helps preserve local relationships and reduce travel costs.

**How to use:**
Set the Geo Match multiplier (0.00 to 0.10). For example:
- 0.05 = 5% bonus to blended score for geo-matched reps
- 0.10 = 10% bonus (maximum)

**Recommendation:** Start with 0.03 (3%) and adjust based on results.`,
  },

  // Preserve Existing Assignment
  preserve: {
    short: "Bonus applied to the account's current assigned rep. Minimizes customer disruption by favoring existing relationships when allocation is close.",
    
    full: `**What is Preserve?**
Bonus applied to the account's current assigned rep. Minimizes customer disruption by favoring existing relationships when allocation is close.

**How to use:**
Set the Preserve multiplier (0.00 to 0.10). For example:
- 0.05 = 5% bonus to existing rep's blended score
- 0.10 = 10% bonus (maximum)

**Recommendation:** Start with 0.05 (5%). Use higher values to minimize reassignments.`,
  },

  // Optimize Weights
  optimizeWeights: {
    short: "Automatically searches for the best combination of ARR, Account, and Risk weights to maximize Balanced Fairness Score (using 1% increments).",
    
    full: `**What does Optimize do?**
Automatically searches for the best combination of ARR, Account, and Risk weights to maximize Balanced Fairness Score (using 1% increments).

**When to use:**
- You're unsure which weights produce the fairest distribution
- You want to find the optimal starting point before fine-tuning
- You need a data-driven weight recommendation

**What it shows:**
Displays the recommended weights and the resulting Balanced Fairness Score improvement.

**Note:** Optimize only adjusts weights, not preferences (Geo Match/Preserve).`,
  },

  // High-Risk Threshold
  highRisk: {
    short: "Accounts with risk_score above this threshold are flagged as 'High-Risk' in visualizations. Helps identify reps with concentrated churn risk.",
    
    full: `**What is High-Risk?**
Accounts with risk_score above this threshold are flagged as "High-Risk" in visualizations. Helps identify reps with concentrated churn risk.

**How to use:**
Set a threshold from 0-100. Default is 70.
- Higher threshold (e.g., 80) = fewer accounts flagged
- Lower threshold (e.g., 60) = more accounts flagged

**Note:** If no accounts have risk_score, Risk weight is locked and High-Risk features are disabled.`,
  },

  // Sensitivity Chart
  sensitivityChart: {
    short: "Shows how fairness and segment balance change as you adjust the employee count threshold. Helps identify the optimal threshold for your goals.",
    
    axes: `**How to read it:**
- **X-axis:** Employee count threshold (Enterprise/Mid-Market split point)
- **Left Y-axis:** Fairness scores (Custom and Balanced)
- **Right Y-axis:** Deal Size Ratio (Enterprise ARR / Mid-Market ARR)

**Tip:** Look for thresholds where fairness scores peak and Deal Size Ratio is reasonable for your sales model.`,
  },

  // Territory Comparison
  comparison: {
    accountMovement: "Shows accounts that changed reps between original and new allocation. Helps identify potential customer disruption.",
    
    kpiImprovement: "Before/After comparison of CV% for ARR, Accounts, and Risk. Green = improvement, red = worse distribution.",
  },

  // Audit Trail
  auditTrail: {
    full: `**What is the Audit Trail?**
Step-through view showing exactly why each account was assigned to its winning rep. Full transparency into the allocation algorithm.

**How it works:**
1. Shows account details and segment assignment reasoning
2. Displays all reps' scores (Blended, Geo Bonus, Preserve Bonus, Total)
3. Explains why the winner was selected (tie-breaking rules if applicable)

**Navigation:** Use Previous/Next to step through all accounts in order.`,
  },
} as const;

// Type-safe tooltip key access
export type TooltipKey = keyof typeof TOOLTIP_CONTENT;
