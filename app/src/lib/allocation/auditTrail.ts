/**
 * Audit Trail Generation for Territory Allocation Engine
 * 
 * Captures step-by-step allocation decisions for explainability:
 * account → segment → eligible reps' scores → winner
 */

import type { Account, Rep, AllocationConfig, AuditStep } from '../../types';
import { segmentAccount } from './segmentation';
import { calculateGeoBonus, calculatePreserveBonus, applyPreferenceBonuses } from './preferences';
import { calculateBlendedScore, calculateTargetARR, calculateTargetAccounts, calculateTargetRiskARR } from './greedyAllocator';

/**
 * Rep score details for audit trail
 */
interface RepScoreDetails {
  repName: string;
  blendedScore: number;
  geoBonus: number;
  preserveBonus: number;
  totalScore: number;
  currentARR: number;
  currentAccounts: number;
  currentRiskARR: number;
}

/**
 * Track rep state during audit trail generation
 */
interface RepState {
  rep: Rep;
  currentARR: number;
  currentAccounts: number;
  currentRiskARR: number;
  assignedAccountIds: string[];
}

/**
 * Format segment assignment reason
 * 
 * @param account - Account being segmented
 * @param segment - Determined segment
 * @param threshold - Employee count threshold
 * @returns Formatted reason string
 * 
 * @example
 * formatSegmentReason(account, "Enterprise", 2750)
 * // "Enterprise (threshold 2,750: 53,000 ≥ 2,750)"
 * 
 * formatSegmentReason(account, "Mid Market", 2750)
 * // "Mid Market (threshold 2,750: 450 < 2,750)"
 */
export function formatSegmentReason(
  account: Account,
  segment: 'Enterprise' | 'Mid Market',
  threshold: number
): string {
  const employeeCount = account.Num_Employees.toLocaleString();
  const thresholdFormatted = threshold.toLocaleString();
  const operator = segment === 'Enterprise' ? '≥' : '<';
  
  return `${segment} (threshold ${thresholdFormatted}: ${employeeCount} ${operator} ${thresholdFormatted})`;
}

/**
 * Format winner reasoning explanation
 * 
 * Explains why a specific rep won the account assignment with clear logic.
 * Focuses on the reason/mechanism rather than repeating numbers visible in the table.
 * 
 * @param winner - Winner's rep name
 * @param winnerScore - Winner's score details
 * @param allScores - All eligible reps' scores for comparison
 * @returns Formatted reasoning string
 * 
 * @example
 * "Geo bonus pushed score above Sarah's need score"
 * "Had the highest need (most under target)"
 * "Tied with Sarah but had lower current ARR"
 */
export function formatWinnerReason(
  winner: string,
  winnerScore: RepScoreDetails,
  allScores: RepScoreDetails[]
): string {
  // Find runner-up (highest score that isn't the winner)
  const otherScores = allScores.filter(score => score.repName !== winner);
  otherScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.currentARR !== b.currentARR) return a.currentARR - b.currentARR;
    return a.repName.localeCompare(b.repName);
  });
  
  const runnerUp = otherScores[0];
  
  // Check for ties
  const tiedReps = allScores.filter(
    score => score.repName !== winner && score.totalScore === winnerScore.totalScore
  );
  
  if (tiedReps.length > 0) {
    // Tied total score - explain tie-breaking
    const tiedName = tiedReps[0].repName;
    const lowerARRThanTied = tiedReps.every(
      rep => winnerScore.currentARR < rep.currentARR
    );
    
    if (lowerARRThanTied) {
      return `Tied with ${tiedName} but had lower current ARR`;
    } else {
      return `Tied with ${tiedName}, won alphabetically`;
    }
  }
  
  // Not tied - analyze what led to victory
  const hasBonuses = winnerScore.geoBonus > 0 || winnerScore.preserveBonus > 0;
  const winnerBlended = winnerScore.blendedScore;
  
  // Check if bonuses were decisive
  if (hasBonuses) {
    // Were bonuses decisive? (would have lost without them)
    if (winnerBlended <= runnerUp.totalScore) {
      // Yes! Bonuses made the difference
      const bonusNames: string[] = [];
      if (winnerScore.geoBonus > 0) bonusNames.push('geo');
      if (winnerScore.preserveBonus > 0) bonusNames.push('preserve');
      
      const bonusText = bonusNames.join(' + ');
      return `${bonusText} bonus${bonusNames.length > 1 ? 'es' : ''} pushed score above ${runnerUp.repName}'s need score`;
    }
  }
  
  // Bonuses weren't decisive (or no bonuses) - blended score was the key
  const needStatus = winnerBlended >= 0 ? 'most under target' : 'least over target';
  return `Had the highest need (${needStatus})`;
}

/**
 * Generate audit trail for allocation results
 * 
 * Processes accounts in the same order as allocation (descending ARR, then Account_ID)
 * and captures decision-making details for each account assignment.
 * 
 * @param accounts - All accounts to allocate
 * @param reps - All available reps
 * @param config - Allocation configuration
 * @returns Array of audit steps, one per account
 */
export function generateAuditTrail(
  accounts: Account[],
  reps: Rep[],
  config: AllocationConfig
): AuditStep[] {
  // Segment accounts
  const enterpriseAccounts: Account[] = [];
  const midMarketAccounts: Account[] = [];
  
  for (const account of accounts) {
    const segment = segmentAccount(account, config.threshold);
    if (segment === 'Enterprise') {
      enterpriseAccounts.push(account);
    } else {
      midMarketAccounts.push(account);
    }
  }
  
  // Process Enterprise segment
  const enterpriseSteps = generateSegmentAuditTrail(
    enterpriseAccounts,
    reps.filter(rep => rep.Segment === 'Enterprise'),
    'Enterprise',
    config
  );
  
  // Process Mid Market segment
  const midMarketSteps = generateSegmentAuditTrail(
    midMarketAccounts,
    reps.filter(rep => rep.Segment === 'Mid Market'),
    'Mid Market',
    config
  );
  
  // Combine all steps
  const allSteps = [...enterpriseSteps, ...midMarketSteps];
  
  // Sort by ARR descending, then Account_ID to match allocation order
  allSteps.sort((a, b) => {
    if (b.account.ARR !== a.account.ARR) {
      return b.account.ARR - a.account.ARR;
    }
    return a.account.Account_ID.localeCompare(b.account.Account_ID);
  });
  
  return allSteps;
}

/**
 * Generate audit trail for a single segment
 * 
 * @param segmentAccounts - Accounts in this segment
 * @param segmentReps - Reps in this segment
 * @param segment - Segment name
 * @param config - Allocation configuration
 * @returns Array of audit steps for this segment
 */
function generateSegmentAuditTrail(
  segmentAccounts: Account[],
  segmentReps: Rep[],
  segment: 'Enterprise' | 'Mid Market',
  config: AllocationConfig
): AuditStep[] {
  // Handle empty segment
  if (segmentAccounts.length === 0 || segmentReps.length === 0) {
    return [];
  }
  
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
      return b.ARR - a.ARR;
    }
    return a.Account_ID.localeCompare(b.Account_ID);
  });
  
  // Generate audit steps
  const steps: AuditStep[] = [];
  let allocationIndex = 0;
  
  for (const account of sortedAccounts) {
    // Calculate scores for all eligible reps
    const repScores: RepScoreDetails[] = repStates.map(repState => {
      const blendedScore = calculateBlendedScore(
        repState,
        targetARR,
        targetAccounts,
        targetRiskARR,
        config
      );
      
      const geoBonus = calculateGeoBonus(account, repState.rep, config.geoMatchBonus);
      const preserveBonus = calculatePreserveBonus(account, repState.rep, config.preserveBonus);
      const totalScore = applyPreferenceBonuses(blendedScore, geoBonus, preserveBonus);
      
      return {
        repName: repState.rep.Rep_Name,
        blendedScore,
        geoBonus,
        preserveBonus,
        totalScore,
        currentARR: repState.currentARR,
        currentAccounts: repState.currentAccounts,
        currentRiskARR: repState.currentRiskARR
      };
    });
    
    // Find winner (matches allocation logic)
    let winner = repScores[0];
    let winnerState = repStates[0];
    
    for (let i = 1; i < repScores.length; i++) {
      const candidate = repScores[i];
      const candidateState = repStates[i];
      
      if (candidate.totalScore > winner.totalScore) {
        winner = candidate;
        winnerState = candidateState;
      } else if (candidate.totalScore === winner.totalScore) {
        // Tie-breaking: lowest current ARR, then alphabetical
        if (candidate.currentARR < winner.currentARR) {
          winner = candidate;
          winnerState = candidateState;
        } else if (candidate.currentARR === winner.currentARR) {
          if (candidate.repName < winner.repName) {
            winner = candidate;
            winnerState = candidateState;
          }
        }
      }
    }
    
    // Update winner's state
    winnerState.currentARR += account.ARR;
    winnerState.currentAccounts += 1;
    
    const isHighRisk = account.Risk_Score !== null && account.Risk_Score >= config.highRiskThreshold;
    if (isHighRisk) {
      winnerState.currentRiskARR += account.ARR;
    }
    
    winnerState.assignedAccountIds.push(account.Account_ID);
    
    // Create audit step
    const step: AuditStep = {
      account,
      segment,
      eligibleReps: segmentReps.map(rep => rep.Rep_Name),
      winner: winner.repName,
      reasoning: formatWinnerReason(winner.repName, winner, repScores),
      allocationIndex: allocationIndex
    };
    
    steps.push(step);
    allocationIndex++;
  }
  
  return steps;
}
