/**
 * Weight Optimization for Territory Allocation
 * 
 * Brute-force search across all weight combinations (1% increments) to find
 * weights that maximize Balanced fairness (33/33/33 composite) at current threshold.
 */

import type { Account, Rep, AllocationConfig } from '../../types';
import { allocateAccounts } from './greedyAllocator';
import {
  calculateSegmentBasedFairness
} from './fairness';

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
 * @returns Optimization result with recommended weights and resulting score
 */
export function optimizeWeights(
  accounts: Account[],
  reps: Rep[],
  threshold: number,
  geoMatchBonus: number,
  preserveBonus: number,
  highRiskThreshold: number
): OptimizationResult {
  // Check if Risk_Score is available in data
  const hasRiskScore = accounts.some(acc => acc.Risk_Score !== null);

  // Track best result
  let bestResult: OptimizationResult = {
    arrWeight: 33,
    accountWeight: 33,
    riskWeight: 34,
    balancedScore: 0
  };

  // Search all weight combinations
  for (let arrWeight = 0; arrWeight <= 100; arrWeight++) {
    // For each ARR weight, iterate Account weight from 0 to remaining weight
    const maxAccountWeight = 100 - arrWeight;
    
    for (let accountWeight = 0; accountWeight <= maxAccountWeight; accountWeight++) {
      // Calculate Risk weight as remainder
      const riskWeight = 100 - arrWeight - accountWeight;

      // Skip combinations with Risk weight if Risk_Score not available
      if (!hasRiskScore && riskWeight > 0) {
        continue;
      }

      // Create allocation config with these weights
      const config: AllocationConfig = {
        threshold,
        arrWeight,
        accountWeight,
        riskWeight,
        geoMatchBonus,
        preserveBonus,
        highRiskThreshold
      };

      // Run allocation with these weights
      const allocationResults = allocateAccounts(accounts, reps, config);

      // Calculate segment-based fairness (matching UI display)
      const fairnessMetrics = calculateSegmentBasedFairness(
        reps,
        allocationResults,
        accounts,
        {
          arr: arrWeight,
          account: accountWeight,
          risk: riskWeight,
        },
        highRiskThreshold
      );

      const balancedScore = fairnessMetrics.balancedComposite;

      // Update best result if this is better
      if (balancedScore !== null && balancedScore > bestResult.balancedScore) {
        bestResult = {
          arrWeight,
          accountWeight,
          riskWeight,
          balancedScore
        };
      }
    }
  }

  return bestResult;
}
