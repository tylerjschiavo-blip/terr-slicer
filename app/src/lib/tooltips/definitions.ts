/**
 * Tooltip Content Definitions (AE-41)
 * 
 * Centralized definitions for key concepts in the allocation engine.
 * Used by the Tooltip component to provide consistent help text across the app.
 */

export const TooltipDefinitions = {
  FAIRNESS_SCORE: "Fairness score (0-100) calculated as 100 - CV%. Higher scores indicate more balanced distribution. CV% measures coefficient of variation across reps.",
  
  BALANCED_FAIRNESS: "Average of ARR CV%, Account CV%, and Risk CV% fairness scores using equal weights (33/33/33). Unbiased baseline for comparison.",
  
  CUSTOM_FAIRNESS: "Weighted average of ARR CV%, Account CV%, and Risk CV% fairness scores using your current balance weights. Reflects your priorities.",
  
  BLENDED_SCORE: "Normalized need score combining ARR balance, Account balance, and Risk balance with your current weights. Positive scores (0 to 1) indicate rep is under target—higher means more need. Negative scores indicate rep is over target. Preference bonuses are then applied to calculate final priority.",
  
  GEO_MATCH: "Bonus (0.00-0.10) applied when account and rep location strings match exactly (case-insensitive). Example: 'CA' = 'ca' but 'California' ≠ 'CA'.",
  
  OPTIMIZE_WEIGHTS: "Searches all weight combinations (1% increments) to find the weight split (ARR/Account/Risk) that produces the highest Balanced fairness score at your current threshold. Optimization target: Balanced fairness (33/33/33 composite), not Custom fairness.",
  
  PRESERVE_BONUS: "Bonus (0.00-0.10) applied when account's Original_Rep matches this rep. Helps maintain existing rep relationships while balancing workload.",
  
  DEAL_SIZE_RATIO: "Ratio of Enterprise average ARR to Mid-Market average ARR. Higher ratio indicates larger Enterprise deals relative to Mid-Market deals.",
} as const;

export type TooltipKey = keyof typeof TooltipDefinitions;
