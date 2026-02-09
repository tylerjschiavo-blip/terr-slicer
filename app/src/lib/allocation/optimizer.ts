/**
 * Weight Optimization for Territory Allocation
 *
 * Brute-force search across all weight combinations (1% increments) to find
 * weights that maximize Balanced fairness (33/33/33 composite) at current threshold.
 * Optional caps on segment ARR max/min ratio: when set, returns the best (most fair)
 * combination that satisfies the caps; if none do, returns the best overall and
 * constraintsMet is false.
 */

import type { Account, Rep, AllocationConfig, AllocationResult } from '../../types';
import { allocateAccounts } from './greedyAllocator';
import { calculateSegmentBasedFairness } from './fairness';

/**
 * Result of weight optimization
 */
export interface OptimizationResult {
  /** Recommended ARR weight (0-100) */
  arrWeight: number;
  /** Recommended Account weight (0-100) */
  accountWeight: number;
  /** Recommended Risk weight (0-100) */
  riskWeight: number;
  /** Resulting Balanced fairness score (0-100) */
  balancedScore: number;
  /** True if returned result satisfied optional Enterprise/Mid Market caps */
  constraintsMet: boolean;
}

/**
 * Compute ARR max/min ratio for a segment (max rep ARR / min rep ARR).
 * Returns null if segment has no reps, no assignments, or min rep ARR is 0.
 */
function segmentARRMaxMinRatio(
  segment: 'Enterprise' | 'Mid Market',
  reps: Rep[],
  results: AllocationResult[],
  accounts: Account[]
): number | null {
  const segmentReps = reps.filter((r) => r.Segment === segment);
  const segmentResults = results.filter((r) => r.segment === segment);
  if (segmentReps.length === 0 || segmentResults.length === 0) return null;

  const accountMap = new Map(accounts.map((acc) => [acc.Account_ID, acc]));
  const repARR = new Map<string, number>();
  segmentReps.forEach((rep) => repARR.set(rep.Rep_Name, 0));
  segmentResults.forEach((result) => {
    const account = accountMap.get(result.accountId);
    if (account) {
      const cur = repARR.get(result.assignedRep) ?? 0;
      repARR.set(result.assignedRep, cur + account.ARR);
    }
  });
  const values = Array.from(repARR.values());
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min <= 0) return null;
  return max / min;
}

/**
 * Optimize allocation weights to maximize Balanced fairness
 * 
 * Searches all valid weight combinations (sum to 100%, 1% increments) to find
 * the weight split (ARR/Account/Risk) that produces the highest Balanced fairness
 * score at the current threshold.
 * 
 * Algorithm:
 * 1. Detect if Risk_Score is available in data
 * 2. If Risk_Score missing: only search ARR/Account weights (Risk locked to 0%)
 * 3. Iterate through all valid weight combinations:
 *    - ARR weight: 0-100% in 1% steps
 *    - Account weight: 0 to (100 - ARR weight)% in 1% steps
 *    - Risk weight: 100 - ARR weight - Account weight
 * 4. For each weight combination:
 *    - Run allocation with these weights
 *    - Calculate Balanced fairness (33/33/33 composite)
 *    - Track best result
 * 5. Return weights with highest Balanced score
 * 
 * Optimization target: Balanced fairness (33/33/33), not Custom fairness
 * 
 * @param accounts - Array of all accounts to allocate
 * @param reps - Array of all reps
 * @param threshold - Current employee count threshold
 * @param geoMatchBonus - Geographic match bonus (0.00-0.10)
 * @param preserveBonus - Preserve relationship bonus (0.00-0.10)
 * @param highRiskThreshold - High-risk classification threshold (0-100)
 * @param enterpriseCap - If set, only consider combos where Enterprise ARR max/min ≤ this
 * @param midMarketCap - If set, only consider combos where Mid Market ARR max/min ≤ this
 * @returns Optimization result; constraintsMet is false if no combo satisfied caps
 */
export function optimizeWeights(
  accounts: Account[],
  reps: Rep[],
  threshold: number,
  geoMatchBonus: number,
  preserveBonus: number,
  highRiskThreshold: number,
  enterpriseCap: number | null = null,
  midMarketCap: number | null = null
): OptimizationResult {
  const hasRiskScore = accounts.some((acc) => acc.Risk_Score !== null);

  interface Candidate {
    arrWeight: number;
    accountWeight: number;
    riskWeight: number;
    balancedScore: number;
    entRatio: number | null;
    mmRatio: number | null;
  }

  const candidates: Candidate[] = [];

  for (let arrWeight = 0; arrWeight <= 100; arrWeight++) {
    const maxAccountWeight = 100 - arrWeight;
    for (let accountWeight = 0; accountWeight <= maxAccountWeight; accountWeight++) {
      const riskWeight = 100 - arrWeight - accountWeight;
      if (!hasRiskScore && riskWeight > 0) continue;

      const config: AllocationConfig = {
        threshold,
        arrWeight,
        accountWeight,
        riskWeight,
        geoMatchBonus,
        preserveBonus,
        highRiskThreshold,
      };
      const allocationResults = allocateAccounts(accounts, reps, config);

      const fairnessMetrics = calculateSegmentBasedFairness(
        reps,
        allocationResults,
        accounts,
        { arr: arrWeight, account: accountWeight, risk: riskWeight },
        highRiskThreshold
      );
      const balancedScore = fairnessMetrics.balancedComposite ?? 0;

      const entRatio = segmentARRMaxMinRatio('Enterprise', reps, allocationResults, accounts);
      const mmRatio = segmentARRMaxMinRatio('Mid Market', reps, allocationResults, accounts);

      candidates.push({
        arrWeight,
        accountWeight,
        riskWeight,
        balancedScore,
        entRatio,
        mmRatio,
      });
    }
  }

  // Rank by balanced score descending
  candidates.sort((a, b) => b.balancedScore - a.balancedScore);

  const meetsCaps = (c: Candidate): boolean => {
    if (enterpriseCap != null && (c.entRatio == null || c.entRatio > enterpriseCap)) return false;
    if (midMarketCap != null && (c.mmRatio == null || c.mmRatio > midMarketCap)) return false;
    return true;
  };

  const feasible = candidates.find(meetsCaps);
  const best = candidates[0];
  const use = feasible ?? best;

  return {
    arrWeight: use.arrWeight,
    accountWeight: use.accountWeight,
    riskWeight: use.riskWeight,
    balancedScore: use.balancedScore,
    constraintsMet: feasible != null,
  };
}
