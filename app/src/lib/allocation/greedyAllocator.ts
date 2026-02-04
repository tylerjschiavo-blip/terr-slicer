/**
 * Weighted Greedy Allocation Algorithm for Territory Assignment
 * 
 * Assigns accounts to reps within each segment based on blended need scores,
 * processing accounts in descending ARR order for fairness.
 */

import type { Account, Rep, AllocationConfig, AllocationResult } from '../../types';
import { segmentAccounts } from './segmentation';
import { calculateGeoBonus, calculatePreserveBonus, applyPreferenceBonuses } from './preferences';

/**
 * Calculate target ARR per rep for a segment
 * 
 * @param reps - Array of reps in the segment
 * @param accounts - Array of accounts in the segment
 * @returns Target ARR per rep (total ARR / number of reps)
 */
export function calculateTargetARR(reps: Rep[], accounts: Account[]): number {
  if (reps.length === 0) {
    return 0;
  }

  const totalARR = accounts.reduce((sum, account) => sum + account.ARR, 0);
  return totalARR / reps.length;
}

/**
 * Calculate target account count per rep for a segment
 * 
 * @param reps - Array of reps in the segment
 * @param accounts - Array of accounts in the segment
 * @returns Target account count per rep (total accounts / number of reps)
 */
export function calculateTargetAccounts(reps: Rep[], accounts: Account[]): number {
  if (reps.length === 0) {
    return 0;
  }

  return accounts.length / reps.length;
}

/**
 * Calculate target risk ARR per rep for a segment
 * 
 * @param reps - Array of reps in the segment
 * @param accounts - Array of accounts in the segment
 * @param highRiskThreshold - Threshold for classifying high-risk accounts
 * @returns Target high-risk ARR per rep (total high-risk ARR / number of reps)
 */
export function calculateTargetRiskARR(
  reps: Rep[],
  accounts: Account[],
  highRiskThreshold: number
): number {
  if (reps.length === 0) {
    return 0;
  }

  const totalRiskARR = accounts.reduce((sum, account) => {
    const isHighRisk = account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
    return sum + (isHighRisk ? account.ARR : 0);
  }, 0);

  return totalRiskARR / reps.length;
}

/**
 * Track rep state during allocation
 */
interface RepState {
  rep: Rep;
  currentARR: number;
  currentAccounts: number;
  currentRiskARR: number;
  assignedAccountIds: string[];
}

/**
 * Calculate blended need score for a rep
 * 
 * Blended score = normalized need across ARR, Account count, and Risk, weighted by user sliders
 * Positive score (0 to 1) = under target, higher = more need
 * Negative score = over target, more negative = lower priority
 * 
 * @param repState - Current state of the rep
 * @param targetARR - Target ARR per rep in segment
 * @param targetAccounts - Target account count per rep in segment
 * @param targetRiskARR - Target risk ARR per rep in segment
 * @param config - Allocation configuration with weights
 * @returns Blended need score
 */
export function calculateBlendedScore(
  repState: RepState,
  targetARR: number,
  targetAccounts: number,
  targetRiskARR: number,
  config: AllocationConfig
): number {
  // Calculate normalized needs for each dimension
  // Need = (Target - Current) / Target
  // Positive = under target, Negative = over target
  
  const arrNeed = targetARR > 0 ? (targetARR - repState.currentARR) / targetARR : 0;
  const accountNeed = targetAccounts > 0 ? (targetAccounts - repState.currentAccounts) / targetAccounts : 0;
  const riskNeed = targetRiskARR > 0 ? (targetRiskARR - repState.currentRiskARR) / targetRiskARR : 0;

  // Convert percentage weights (0-100) to decimal (0-1)
  const arrWeight = config.arrWeight / 100;
  const accountWeight = config.accountWeight / 100;
  const riskWeight = config.riskWeight / 100;

  // Calculate weighted blend
  const blendedScore = (arrNeed * arrWeight) + (accountNeed * accountWeight) + (riskNeed * riskWeight);

  return blendedScore;
}

/**
 * Allocate accounts to reps using weighted greedy algorithm
 * 
 * Algorithm:
 * 1. Segment accounts by threshold (Enterprise vs Mid Market)
 * 2. Filter reps by segment (E reps for E accounts, MM reps for MM accounts)
 * 3. Process accounts in descending ARR order (then by Account_ID)
 * 4. For each account:
 *    - Calculate blended score for each eligible rep
 *    - Apply preference bonuses (geo match, preserve)
 *    - Assign to rep with highest total score (most under target)
 *    - Update rep's current state
 * 5. Return allocation results with scores
 * 
 * @param accounts - Array of all accounts to allocate
 * @param reps - Array of all reps
 * @param config - Allocation configuration
 * @returns Array of allocation results with scores
 */
export function allocateAccounts(
  accounts: Account[],
  reps: Rep[],
  config: AllocationConfig
): AllocationResult[] {
  // Segment accounts by threshold
  const { enterprise: enterpriseAccounts, midMarket: midMarketAccounts } = segmentAccounts(
    accounts,
    config.threshold
  );

  // Filter reps by segment
  const enterpriseReps = reps.filter(rep => rep.Segment === 'Enterprise');
  const midMarketReps = reps.filter(rep => rep.Segment === 'Mid Market');

  // Initialize results array
  const results: AllocationResult[] = [];

  // Process Enterprise segment
  if (enterpriseAccounts.length > 0 && enterpriseReps.length > 0) {
    const enterpriseResults = allocateSegment(
      enterpriseAccounts,
      enterpriseReps,
      'Enterprise',
      config
    );
    results.push(...enterpriseResults);
  }

  // Process Mid Market segment
  if (midMarketAccounts.length > 0 && midMarketReps.length > 0) {
    const midMarketResults = allocateSegment(
      midMarketAccounts,
      midMarketReps,
      'Mid Market',
      config
    );
    results.push(...midMarketResults);
  }

  return results;
}

/**
 * Allocate accounts within a single segment
 * 
 * @param segmentAccounts - Accounts in this segment
 * @param segmentReps - Reps in this segment
 * @param segment - Segment name
 * @param config - Allocation configuration
 * @returns Array of allocation results for this segment
 */
function allocateSegment(
  segmentAccounts: Account[],
  segmentReps: Rep[],
  segment: 'Enterprise' | 'Mid Market',
  config: AllocationConfig
): AllocationResult[] {
  // Calculate targets for this segment
  const targetARR = calculateTargetARR(segmentReps, segmentAccounts);
  const targetAccounts = calculateTargetAccounts(segmentReps, segmentAccounts);
  const targetRiskARR = calculateTargetRiskARR(segmentReps, segmentAccounts, config.highRiskThreshold);

  // Initialize rep states
  const repStates: RepState[] = segmentReps.map(rep => ({
    rep,
    currentARR: 0,
    currentAccounts: 0,
    currentRiskARR: 0,
    assignedAccountIds: []
  }));

  // Sort accounts by descending ARR, then by Account_ID for deterministic order
  const sortedAccounts = [...segmentAccounts].sort((a, b) => {
    if (b.ARR !== a.ARR) {
      return b.ARR - a.ARR; // Descending ARR
    }
    return a.Account_ID.localeCompare(b.Account_ID); // Ascending Account_ID for ties
  });

  // Allocate each account
  const results: AllocationResult[] = [];

  for (const account of sortedAccounts) {
    // Calculate scores for each rep
    const repScores = repStates.map(repState => {
      const blendedScore = calculateBlendedScore(
        repState,
        targetARR,
        targetAccounts,
        targetRiskARR,
        config
      );

      // Calculate preference bonuses
      const geoBonus = calculateGeoBonus(account, repState.rep, config.geoMatchBonus);
      const preserveBonus = calculatePreserveBonus(account, repState.rep, config.preserveBonus);
      
      // Apply bonuses using sign-aware multiplier to get total score
      const totalScore = applyPreferenceBonuses(blendedScore, geoBonus, preserveBonus);

      return {
        repState,
        blendedScore,
        geoBonus,
        preserveBonus,
        totalScore
      };
    });

    // Find winner: highest total score (most under target)
    // Tie-breaking: lowest current ARR, then alphabetical by Rep_Name
    let winner = repScores[0];
    for (let i = 1; i < repScores.length; i++) {
      const candidate = repScores[i];
      
      if (candidate.totalScore > winner.totalScore) {
        // Higher total score wins
        winner = candidate;
      } else if (candidate.totalScore === winner.totalScore) {
        // Tie-breaking
        if (candidate.repState.currentARR < winner.repState.currentARR) {
          // Lower current ARR wins
          winner = candidate;
        } else if (candidate.repState.currentARR === winner.repState.currentARR) {
          // Alphabetical by Rep_Name
          if (candidate.repState.rep.Rep_Name < winner.repState.rep.Rep_Name) {
            winner = candidate;
          }
        }
      }
    }

    // Assign account to winner
    winner.repState.currentARR += account.ARR;
    winner.repState.currentAccounts += 1;
    
    // Track high-risk ARR
    const isHighRisk = account.Risk_Score !== null && account.Risk_Score >= config.highRiskThreshold;
    if (isHighRisk) {
      winner.repState.currentRiskARR += account.ARR;
    }
    
    winner.repState.assignedAccountIds.push(account.Account_ID);

    // Record result
    results.push({
      accountId: account.Account_ID,
      assignedRep: winner.repState.rep.Rep_Name,
      segment,
      blendedScore: winner.blendedScore,
      geoBonus: winner.geoBonus,
      preserveBonus: winner.preserveBonus,
      totalScore: winner.totalScore
    });
  }

  return results;
}
