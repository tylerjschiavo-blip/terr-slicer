/**
 * CV%-based Fairness Metrics for Territory Allocation
 * 
 * Calculates coefficient of variation (CV%) for workload distribution across reps
 * and converts to 0-100 fairness scores. Higher scores = more balanced distribution.
 * 
 * Formula: CV% = (Standard Deviation / Mean) × 100
 * Fairness Score = 100 - CV%, clamped to [0, 100]
 */

import type { Rep, AllocationResult, Account } from '../../types';

/**
 * Calculate coefficient of variation (CV%) for a set of values
 * 
 * CV% = (Standard Deviation / Mean) × 100
 * 
 * @param values - Array of numeric values
 * @returns CV% as number, or null if mean is 0 or empty array
 */
export function calculateCV(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Return null if mean is 0 (can't divide by zero)
  if (mean === 0) {
    return null;
  }

  // Calculate variance: average of squared differences from mean
  const variance = values.reduce((sum, val) => {
    const diff = val - mean;
    return sum + (diff * diff);
  }, 0) / values.length;

  // Standard deviation is square root of variance
  const stdDev = Math.sqrt(variance);

  // CV% = (std dev / mean) × 100
  const cv = (stdDev / mean) * 100;

  return cv;
}

/**
 * Calculate fairness score from CV%
 * 
 * Converts CV% to 0-100 fairness score where higher = more fair
 * Formula: 100 - CV%, clamped to [0, 100]
 * 
 * @param cv - Coefficient of variation as percentage
 * @returns Fairness score 0-100, or null if cv is null
 */
function cvToFairnessScore(cv: number | null): number | null {
  if (cv === null) {
    return null;
  }

  // Convert CV% to fairness score: 100 - CV%
  const fairness = 100 - cv;

  // Clamp to [0, 100] range
  return Math.max(0, Math.min(100, fairness));
}

/**
 * Calculate ARR distribution fairness across reps
 * 
 * Measures how evenly ARR is distributed across all reps in the allocation.
 * 
 * @param reps - Array of all reps
 * @param allocationResults - Allocation results with assigned reps
 * @param accounts - Array of all accounts with ARR values
 * @returns Fairness score 0-100, or null if undefined
 */
export function calculateARRFairness(
  reps: Rep[],
  allocationResults: AllocationResult[],
  accounts: Account[]
): number | null {
  if (reps.length === 0 || allocationResults.length === 0) {
    return null;
  }

  // Build map of account ID to account
  const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

  // Calculate total ARR per rep
  const repARR = new Map<string, number>();
  
  // Initialize all reps with 0 ARR
  reps.forEach(rep => {
    repARR.set(rep.Rep_Name, 0);
  });

  // Sum ARR for each rep from allocation results
  allocationResults.forEach(result => {
    const account = accountMap.get(result.accountId);
    if (account) {
      const currentARR = repARR.get(result.assignedRep) || 0;
      repARR.set(result.assignedRep, currentARR + account.ARR);
    }
  });

  // Get array of ARR values
  const arrValues = Array.from(repARR.values());

  // Calculate CV% and convert to fairness score
  const cv = calculateCV(arrValues);
  return cvToFairnessScore(cv);
}

/**
 * Calculate account count distribution fairness across reps
 * 
 * Measures how evenly account counts are distributed across all reps.
 * 
 * @param reps - Array of all reps
 * @param allocationResults - Allocation results with assigned reps
 * @returns Fairness score 0-100, or null if undefined
 */
export function calculateAccountFairness(
  reps: Rep[],
  allocationResults: AllocationResult[]
): number | null {
  if (reps.length === 0 || allocationResults.length === 0) {
    return null;
  }

  // Count accounts per rep
  const repAccounts = new Map<string, number>();
  
  // Initialize all reps with 0 accounts
  reps.forEach(rep => {
    repAccounts.set(rep.Rep_Name, 0);
  });

  // Count accounts for each rep
  allocationResults.forEach(result => {
    const currentCount = repAccounts.get(result.assignedRep) || 0;
    repAccounts.set(result.assignedRep, currentCount + 1);
  });

  // Get array of account count values
  const accountValues = Array.from(repAccounts.values());

  // Calculate CV% and convert to fairness score
  const cv = calculateCV(accountValues);
  return cvToFairnessScore(cv);
}

/**
 * Calculate high-risk ARR distribution fairness across reps
 * 
 * Measures how evenly high-risk ARR % is distributed across reps.
 * High-risk % = (High-risk ARR / Total ARR) × 100 for each rep.
 * 
 * @param reps - Array of all reps
 * @param allocationResults - Allocation results with assigned reps
 * @param accounts - Array of all accounts with Risk_Score values
 * @param highRiskThreshold - Threshold for classifying high-risk accounts (0-100)
 * @returns Fairness score 0-100, or null if Risk_Score missing
 */
export function calculateRiskFairness(
  reps: Rep[],
  allocationResults: AllocationResult[],
  accounts: Account[],
  highRiskThreshold: number
): number | null {
  if (reps.length === 0 || allocationResults.length === 0) {
    return null;
  }

  // Check if any account has Risk_Score
  const hasRiskScore = accounts.some(acc => acc.Risk_Score !== null);
  if (!hasRiskScore) {
    return null;
  }

  // Build map of account ID to account
  const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

  // Calculate total ARR and high-risk ARR per rep
  const repTotalARR = new Map<string, number>();
  const repHighRiskARR = new Map<string, number>();
  
  // Initialize all reps with 0
  reps.forEach(rep => {
    repTotalARR.set(rep.Rep_Name, 0);
    repHighRiskARR.set(rep.Rep_Name, 0);
  });

  // Sum ARR for each rep
  allocationResults.forEach(result => {
    const account = accountMap.get(result.accountId);
    if (account) {
      const repName = result.assignedRep;
      
      // Add to total ARR
      const currentTotal = repTotalARR.get(repName) || 0;
      repTotalARR.set(repName, currentTotal + account.ARR);

      // Add to high-risk ARR if account is high-risk
      const isHighRisk = account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
      if (isHighRisk) {
        const currentRisk = repHighRiskARR.get(repName) || 0;
        repHighRiskARR.set(repName, currentRisk + account.ARR);
      }
    }
  });

  // Calculate high-risk ARR % for each rep
  const riskPercentages: number[] = [];
  reps.forEach(rep => {
    const totalARR = repTotalARR.get(rep.Rep_Name) || 0;
    const highRiskARR = repHighRiskARR.get(rep.Rep_Name) || 0;
    
    // Calculate percentage (0 if no ARR)
    const riskPercent = totalARR > 0 ? (highRiskARR / totalARR) * 100 : 0;
    riskPercentages.push(riskPercent);
  });

  // Calculate CV% and convert to fairness score
  const cv = calculateCV(riskPercentages);
  return cvToFairnessScore(cv);
}

/**
 * Calculate custom composite fairness score using user-defined weights
 * 
 * Weighted average of ARR, Account, and Risk fairness scores.
 * 
 * @param arrFairness - ARR distribution fairness score (0-100 or null)
 * @param accountFairness - Account count distribution fairness score (0-100 or null)
 * @param riskFairness - Risk distribution fairness score (0-100 or null)
 * @param weights - User-defined weights (arr, account, risk as percentages 0-100)
 * @returns Weighted average fairness score 0-100, or null if all inputs null
 */
export function calculateCustomComposite(
  arrFairness: number | null,
  accountFairness: number | null,
  riskFairness: number | null,
  weights: { arr: number; account: number; risk: number }
): number | null {
  // Collect non-null fairness scores with their weights
  const components: { score: number; weight: number }[] = [];

  if (arrFairness !== null) {
    components.push({ score: arrFairness, weight: weights.arr });
  }
  if (accountFairness !== null) {
    components.push({ score: accountFairness, weight: weights.account });
  }
  if (riskFairness !== null) {
    components.push({ score: riskFairness, weight: weights.risk });
  }

  // Return null if no valid components
  if (components.length === 0) {
    return null;
  }

  // Calculate weighted sum and total weight
  const weightedSum = components.reduce((sum, c) => sum + (c.score * c.weight), 0);
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);

  // Return weighted average (avoid division by zero)
  if (totalWeight === 0) {
    return null;
  }

  return weightedSum / totalWeight;
}

/**
 * Calculate balanced composite fairness score using equal weights (33/33/33)
 * 
 * Simple average of ARR, Account, and Risk fairness scores.
 * 
 * @param arrFairness - ARR distribution fairness score (0-100 or null)
 * @param accountFairness - Account count distribution fairness score (0-100 or null)
 * @param riskFairness - Risk distribution fairness score (0-100 or null)
 * @returns Average fairness score 0-100, or null if all inputs null
 */
export function calculateBalancedComposite(
  arrFairness: number | null,
  accountFairness: number | null,
  riskFairness: number | null
): number | null {
  // Collect non-null fairness scores
  const scores: number[] = [];

  if (arrFairness !== null) {
    scores.push(arrFairness);
  }
  if (accountFairness !== null) {
    scores.push(accountFairness);
  }
  if (riskFairness !== null) {
    scores.push(riskFairness);
  }

  // Return null if no valid scores
  if (scores.length === 0) {
    return null;
  }

  // Return simple average
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

/**
 * Calculate segment-based fairness metrics
 * 
 * Splits allocation results by segment (Enterprise vs Mid Market), calculates
 * fairness for each segment separately, then returns the average.
 * 
 * This matches how the UI displays fairness and how the optimizer should work.
 * 
 * @param reps - Array of all reps
 * @param allocationResults - Allocation results with assigned reps
 * @param accounts - Array of all accounts
 * @param weights - Weight configuration for custom composite
 * @param highRiskThreshold - High-risk classification threshold
 * @returns Segment-averaged fairness metrics
 */
export function calculateSegmentBasedFairness(
  reps: Rep[],
  allocationResults: AllocationResult[],
  accounts: Account[],
  weights: { arr: number; account: number; risk: number },
  highRiskThreshold: number
): {
  arrFairness: number | null;
  accountFairness: number | null;
  riskFairness: number | null;
  customComposite: number | null;
  balancedComposite: number | null;
} {
  // Split reps by segment
  const enterpriseReps = reps.filter(rep => rep.Segment === 'Enterprise');
  const midMarketReps = reps.filter(rep => rep.Segment === 'Mid Market');
  
  // Split results by segment
  const enterpriseResults = allocationResults.filter(result => {
    const rep = reps.find(r => r.Rep_Name === result.assignedRep);
    return rep?.Segment === 'Enterprise';
  });
  
  const midMarketResults = allocationResults.filter(result => {
    const rep = reps.find(r => r.Rep_Name === result.assignedRep);
    return rep?.Segment === 'Mid Market';
  });

  // Calculate Enterprise segment fairness
  const entArrFairness = calculateARRFairness(enterpriseReps, enterpriseResults, accounts);
  const entAccountFairness = calculateAccountFairness(enterpriseReps, enterpriseResults);
  const entRiskFairness = calculateRiskFairness(enterpriseReps, enterpriseResults, accounts, highRiskThreshold);
  const entCustomComposite = calculateCustomComposite(entArrFairness, entAccountFairness, entRiskFairness, weights);
  const entBalancedComposite = calculateBalancedComposite(entArrFairness, entAccountFairness, entRiskFairness);

  // Calculate Mid Market segment fairness
  const mmArrFairness = calculateARRFairness(midMarketReps, midMarketResults, accounts);
  const mmAccountFairness = calculateAccountFairness(midMarketReps, midMarketResults);
  const mmRiskFairness = calculateRiskFairness(midMarketReps, midMarketResults, accounts, highRiskThreshold);
  const mmCustomComposite = calculateCustomComposite(mmArrFairness, mmAccountFairness, mmRiskFairness, weights);
  const mmBalancedComposite = calculateBalancedComposite(mmArrFairness, mmAccountFairness, mmRiskFairness);

  // Calculate average segment fairness
  const arrFairness = (entArrFairness !== null && mmArrFairness !== null)
    ? (entArrFairness + mmArrFairness) / 2
    : entArrFairness ?? mmArrFairness;
  
  const accountFairness = (entAccountFairness !== null && mmAccountFairness !== null)
    ? (entAccountFairness + mmAccountFairness) / 2
    : entAccountFairness ?? mmAccountFairness;
  
  const riskFairness = (entRiskFairness !== null && mmRiskFairness !== null)
    ? (entRiskFairness + mmRiskFairness) / 2
    : entRiskFairness ?? mmRiskFairness;
  
  const customComposite = (entCustomComposite !== null && mmCustomComposite !== null)
    ? (entCustomComposite + mmCustomComposite) / 2
    : entCustomComposite ?? mmCustomComposite;
  
  const balancedComposite = (entBalancedComposite !== null && mmBalancedComposite !== null)
    ? (entBalancedComposite + mmBalancedComposite) / 2
    : entBalancedComposite ?? mmBalancedComposite;

  return {
    arrFairness,
    accountFairness,
    riskFairness,
    customComposite,
    balancedComposite,
  };
}

/**
 * Get color class for fairness score display
 * 
 * Maps fairness scores to color bands for visual feedback:
 * - 94-100: Dark Green (excellent)
 * - 88-93: Light Green (good)
 * - 82-87: Yellow (acceptable)
 * - 75-81: Orange (concerning)
 * - <75: Red (poor)
 * - null: Gray (not applicable)
 * 
 * @param score - Fairness score 0-100, or null
 * @returns Color class string for CSS/UI
 */
export function getFairnessColor(score: number | null): string {
  if (score === null) {
    return 'gray';
  }

  if (score >= 94) {
    return 'dark-green';
  } else if (score >= 88) {
    return 'light-green';
  } else if (score >= 82) {
    return 'yellow';
  } else if (score >= 75) {
    return 'orange';
  } else {
    return 'red';
  }
}
