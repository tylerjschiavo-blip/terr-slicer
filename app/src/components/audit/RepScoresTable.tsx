/**
 * Rep Scores Table Component
 * Displays rep scores comparison for the current audit step
 * 
 * Shows all eligible reps' scores (Blended, Geo, Preserve, Total) for the current account allocation
 * Highlights the winning rep and displays winner reasoning below the table
 */

import { useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import type { AuditStep, AllocationResult, Rep, Account, AllocationConfig } from '@/types';
import {
  calculateBlendedScore,
  calculateTargetARR,
  calculateTargetAccounts,
  calculateTargetRiskARR,
} from '@/lib/allocation/greedyAllocator';
import {
  calculateGeoBonus,
  calculatePreserveBonus,
  applyPreferenceBonuses,
} from '@/lib/allocation/preferences';

interface RepScoreRow {
  repName: string;
  arrNeed: number;
  accountNeed: number;
  riskNeed: number;
  blendedScore: number;
  geoBonus: number;
  preserveBonus: number;
  totalScore: number;
  isWinner: boolean;
}

interface RepScoresTableProps {
  step: AuditStep;
  allocationResults: AllocationResult[];
}

/**
 * Calculate rep state from allocation results up to a given point
 * Only includes results that come before the current account in allocation order
 */
function calculateRepState(
  rep: Rep,
  accounts: Account[],
  allocationResults: AllocationResult[],
  allocationIndex: number,
  highRiskThreshold: number
): { currentARR: number; currentAccounts: number; currentRiskARR: number } {
  let currentARR = 0;
  let currentAccounts = 0;
  let currentRiskARR = 0;

  // Only use results before the current allocation index
  const previousResults = allocationResults.slice(0, allocationIndex);

  // Find all accounts assigned to this rep from previous results
  const repResults = previousResults.filter((result) => result.assignedRep === rep.Rep_Name);

  for (const result of repResults) {
    const account = accounts.find((acc) => acc.Account_ID === result.accountId);
    if (account) {
      currentARR += account.ARR;
      currentAccounts += 1;

      // Check if high risk
      const isHighRisk =
        account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
      if (isHighRisk) {
        currentRiskARR += account.ARR;
      }
    }
  }

  return { currentARR, currentAccounts, currentRiskARR };
}

/**
 * Calculate rep scores for all eligible reps
 */
function calculateRepScores(
  step: AuditStep,
  eligibleReps: Rep[],
  accounts: Account[],
  allocationResults: AllocationResult[],
  config: AllocationConfig
): RepScoreRow[] {
  const account = step.account;
  const segmentAccounts = accounts.filter((acc) => {
    const segment = acc.Num_Employees >= config.threshold ? 'Enterprise' : 'Mid Market';
    return segment === step.segment;
  });

  // Calculate targets for this segment
  const targetARR = calculateTargetARR(eligibleReps, segmentAccounts);
  const targetAccounts = calculateTargetAccounts(eligibleReps, segmentAccounts);
  const targetRiskARR = calculateTargetRiskARR(eligibleReps, segmentAccounts, config.highRiskThreshold);

  // Calculate scores for each eligible rep
  const scores: RepScoreRow[] = eligibleReps.map((rep) => {
    // Calculate rep state from previous allocations (before current account)
    const repState = calculateRepState(
      rep,
      accounts,
      allocationResults,
      step.allocationIndex,
      config.highRiskThreshold
    );

    // Find previous results for this rep to get assigned account IDs
    const previousResults = allocationResults.slice(0, step.allocationIndex);
    const repResults = previousResults.filter((result) => result.assignedRep === rep.Rep_Name);

    // Create rep state object for score calculation
    const stateForScore = {
      rep,
      currentARR: repState.currentARR,
      currentAccounts: repState.currentAccounts,
      currentRiskARR: repState.currentRiskARR,
      assignedAccountIds: repResults.map((r) => r.accountId),
    };

    // Calculate individual need scores (same logic as in greedyAllocator)
    const arrNeed = targetARR > 0 ? (targetARR - repState.currentARR) / targetARR : 0;
    const accountNeed = targetAccounts > 0 ? (targetAccounts - repState.currentAccounts) / targetAccounts : 0;
    const riskNeed = targetRiskARR > 0 ? (targetRiskARR - repState.currentRiskARR) / targetRiskARR : 0;

    // Calculate blended score
    const blendedScore = calculateBlendedScore(
      stateForScore,
      targetARR,
      targetAccounts,
      targetRiskARR,
      config
    );

    // Calculate bonuses
    const geoBonus = calculateGeoBonus(account, rep, config.geoMatchBonus);
    const preserveBonus = calculatePreserveBonus(account, rep, config.preserveBonus);

    // Calculate total score
    const totalScore = applyPreferenceBonuses(blendedScore, geoBonus, preserveBonus);

    return {
      repName: rep.Rep_Name,
      arrNeed,
      accountNeed,
      riskNeed,
      blendedScore,
      geoBonus,
      preserveBonus,
      totalScore,
      isWinner: rep.Rep_Name === step.winner,
    };
  });

  // Sort by total score descending (winner should be first)
  scores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // Tie-breaking: lower ARR first, then alphabetical
    const aRep = eligibleReps.find((r) => r.Rep_Name === a.repName)!;
    const bRep = eligibleReps.find((r) => r.Rep_Name === b.repName)!;
    const aState = calculateRepState(aRep, accounts, allocationResults, step.allocationIndex, config.highRiskThreshold);
    const bState = calculateRepState(bRep, accounts, allocationResults, step.allocationIndex, config.highRiskThreshold);
    if (aState.currentARR !== bState.currentARR) {
      return aState.currentARR - bState.currentARR;
    }
    return a.repName.localeCompare(b.repName);
  });

  return scores;
}

import { formatDecimalScore } from '@/lib/utils/formatting';

/**
 * Format score to 3 decimal places
 */
function formatScore(value: number): string {
  return formatDecimalScore(value, 3);
}

/**
 * Format bonus with + prefix if positive (2 decimals for hundredths increments)
 */
function formatBonus(value: number): string {
  if (value === 0) return '0.00';
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

function RepScoresTable({ step, allocationResults }: RepScoresTableProps) {
  const { reps, accounts, threshold, arrWeight, accountWeight, riskWeight, geoMatchBonus, preserveBonus, highRiskThreshold } =
    useAllocationStore();

  // Find the actual allocation index by matching account ID in allocationResults
  const actualAllocationIndex = useMemo(() => {
    return allocationResults.findIndex(result => result.accountId === step.account.Account_ID);
  }, [allocationResults, step.account.Account_ID]);

  // Build config object
  const config: AllocationConfig = useMemo(
    () => ({
      threshold,
      arrWeight,
      accountWeight,
      riskWeight,
      geoMatchBonus,
      preserveBonus,
      highRiskThreshold,
    }),
    [threshold, arrWeight, accountWeight, riskWeight, geoMatchBonus, preserveBonus, highRiskThreshold]
  );

  // Get eligible reps for this step's segment
  const eligibleReps = useMemo(() => {
    return reps.filter((rep) => step.eligibleReps.includes(rep.Rep_Name));
  }, [reps, step.eligibleReps]);

  // Calculate scores for all eligible reps
  const repScores = useMemo(() => {
    if (eligibleReps.length === 0) return [];
    // Use the actual allocation index from allocationResults, not the audit trail index
    const stepWithCorrectIndex = { ...step, allocationIndex: actualAllocationIndex };
    return calculateRepScores(stepWithCorrectIndex, eligibleReps, accounts, allocationResults, config);
  }, [step, actualAllocationIndex, eligibleReps, accounts, allocationResults, config]);

  return (
    <div className="mb-8">
      {/* Section Title */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Reps — Scores for this load turn
      </h3>

      {/* Formula Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Scoring:</span> Each need score shows how far the rep is from their fair share (positive = under, negative = over). 
          These are weighted and summed to get the Blended score. Geo and Preserve bonuses then multiply the Blended score to get the Total.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Rep</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">
                  ARR Need<br/>
                  <span className="text-xs font-normal text-gray-500">(×{(arrWeight/100).toFixed(2)})</span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">
                  Acct Need<br/>
                  <span className="text-xs font-normal text-gray-500">(×{(accountWeight/100).toFixed(2)})</span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">
                  Risk Need<br/>
                  <span className="text-xs font-normal text-gray-500">(×{(riskWeight/100).toFixed(2)})</span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    Blended Need
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Geo</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Preserve</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Calculation</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {repScores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                    No eligible reps for this segment
                  </td>
                </tr>
              ) : (
                repScores.map((score) => {
                  const sign = score.blendedScore >= 0 ? '+' : '−';
                  const multiplier = score.blendedScore >= 0 
                    ? (1 + score.geoBonus + score.preserveBonus).toFixed(2)
                    : (1 - score.geoBonus - score.preserveBonus).toFixed(2);
                  const calculation = `${formatScore(score.blendedScore)} × ${multiplier}`;
                  
                  return (
                    <tr
                      key={score.repName}
                      className={score.isWinner ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50 transition-colors'}
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {score.repName}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">
                        {formatScore(score.arrNeed)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">
                        {formatScore(score.accountNeed)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">
                        {formatScore(score.riskNeed)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 font-medium">
                        {formatScore(score.blendedScore)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {formatBonus(score.geoBonus)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {formatBonus(score.preserveBonus)}
                      </td>
                      <td className="px-4 py-3 text-left text-gray-600 text-xs font-mono">
                        {calculation}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 font-medium">
                        {score.totalScore.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {score.isWinner && <span className="text-green-700 font-medium">← Winner</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Winner Reasoning Card */}
      {step.reasoning && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-900">
            <span className="font-medium text-gray-900">{step.winner}</span> wins because:{' '}
            {step.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}

export default RepScoresTable;
