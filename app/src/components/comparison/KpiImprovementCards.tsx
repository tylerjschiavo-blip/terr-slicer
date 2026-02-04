/**
 * KPI Improvement Cards Component - V2 Segment-Based Design
 * 
 * Displays fairness improvement metrics by segment (Enterprise, Mid Market, Total).
 * Compares baseline (Original_Rep) to current allocation using fairness scores (0-100).
 * 
 * Each card shows:
 * - Geo Match % and Rep Preservation % in metrics section
 * - Fairness Index with ARR, Account, and Risk fairness scores
 * - Before → After with delta for each metric
 */

import { useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import {
  calculateARRFairness,
  calculateAccountFairness,
  calculateRiskFairness,
} from '@/lib/allocation/fairness';
import { geoMatch } from '@/lib/allocation/preferences';
import type { Rep, Account, AllocationResult } from '@/types';

/**
 * Calculate preserve percentage from allocation results
 */
function calculatePreservePercent(
  allocationResults: AllocationResult[],
  accounts: Account[]
): number | null {
  if (allocationResults.length === 0) {
    return null;
  }

  const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

  let preserveCount = 0;
  let totalCount = 0;

  allocationResults.forEach(result => {
    const account = accountMap.get(result.accountId);
    if (account) {
      totalCount++;
      if (account.Original_Rep === result.assignedRep) {
        preserveCount++;
      }
    }
  });

  return totalCount > 0 ? (preserveCount / totalCount) * 100 : null;
}

/**
 * Calculate geo match percentage from allocation results
 */
function calculateGeoMatchPercent(
  reps: Rep[],
  allocationResults: AllocationResult[],
  accounts: Account[]
): number | null {
  if (allocationResults.length === 0) {
    return null;
  }

  const repMap = new Map(reps.map(rep => [rep.Rep_Name, rep]));
  const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

  let matchCount = 0;
  let totalCount = 0;

  allocationResults.forEach(result => {
    const account = accountMap.get(result.accountId);
    const rep = repMap.get(result.assignedRep);
    
    if (account && rep) {
      totalCount++;
      if (geoMatch(account.Location, rep.Location)) {
        matchCount++;
      }
    }
  });

  return totalCount > 0 ? (matchCount / totalCount) * 100 : null;
}

/**
 * Create baseline allocation results from Original_Rep assignments
 */
function createBaselineAllocation(
  accounts: Account[],
  reps: Rep[]
): AllocationResult[] {
  return accounts.map(account => ({
    accountId: account.Account_ID,
    assignedRep: account.Original_Rep,
    segment: 'Enterprise' as const, // Segment doesn't affect fairness calculations
    blendedScore: 0,
    geoBonus: 0,
    preserveBonus: 0,
    totalScore: 0,
  }));
}

interface SegmentComparison {
  segment: 'Enterprise' | 'Mid Market' | 'Total';
  geoMatchBefore: number | null;
  geoMatchAfter: number | null;
  geoMatchDelta: number | null;
  preserveAfter: number | null;
  arrFairnessBefore: number | null;
  arrFairnessAfter: number | null;
  arrFairnessDelta: number | null;
  accountFairnessBefore: number | null;
  accountFairnessAfter: number | null;
  accountFairnessDelta: number | null;
  riskFairnessBefore: number | null;
  riskFairnessAfter: number | null;
  riskFairnessDelta: number | null;
}

export function KpiImprovementCards() {
  const reps = useAllocationStore((state) => state.reps);
  const accounts = useAllocationStore((state) => state.accounts);
  const results = useAllocationStore((state) => state.results);
  const highRiskThreshold = useAllocationStore((state) => state.highRiskThreshold);
  const hasRiskScore = useAllocationStore((state) => state.hasRiskScore);

  const segmentComparisons = useMemo<SegmentComparison[]>(() => {
    if (reps.length === 0 || accounts.length === 0 || results.length === 0) {
      return [];
    }

    // Create baseline allocation from Original_Rep
    const baselineResults = createBaselineAllocation(accounts, reps);

    const comparisons: SegmentComparison[] = [];

    // Enterprise segment
    const enterpriseReps = reps.filter(r => r.Segment === 'Enterprise');
    const enterpriseBaselineResults = baselineResults.filter(r => 
      enterpriseReps.some(rep => rep.Rep_Name === r.assignedRep)
    );
    const enterpriseCurrentResults = results.filter(r => r.segment === 'Enterprise');

    if (enterpriseReps.length > 0) {
      const geoMatchBefore = calculateGeoMatchPercent(enterpriseReps, enterpriseBaselineResults, accounts);
      const geoMatchAfter = calculateGeoMatchPercent(enterpriseReps, enterpriseCurrentResults, accounts);
      const preserveAfter = calculatePreservePercent(enterpriseCurrentResults, accounts);

      const arrFairnessBefore = calculateARRFairness(enterpriseReps, enterpriseBaselineResults, accounts);
      const arrFairnessAfter = calculateARRFairness(enterpriseReps, enterpriseCurrentResults, accounts);

      const accountFairnessBefore = calculateAccountFairness(enterpriseReps, enterpriseBaselineResults);
      const accountFairnessAfter = calculateAccountFairness(enterpriseReps, enterpriseCurrentResults);

      const riskFairnessBefore = calculateRiskFairness(enterpriseReps, enterpriseBaselineResults, accounts, highRiskThreshold);
      const riskFairnessAfter = calculateRiskFairness(enterpriseReps, enterpriseCurrentResults, accounts, highRiskThreshold);

      comparisons.push({
        segment: 'Enterprise',
        geoMatchBefore,
        geoMatchAfter,
        geoMatchDelta: geoMatchBefore !== null && geoMatchAfter !== null ? geoMatchAfter - geoMatchBefore : null,
        preserveAfter,
        arrFairnessBefore,
        arrFairnessAfter,
        arrFairnessDelta: arrFairnessBefore !== null && arrFairnessAfter !== null ? arrFairnessAfter - arrFairnessBefore : null,
        accountFairnessBefore,
        accountFairnessAfter,
        accountFairnessDelta: accountFairnessBefore !== null && accountFairnessAfter !== null ? accountFairnessAfter - accountFairnessBefore : null,
        riskFairnessBefore,
        riskFairnessAfter,
        riskFairnessDelta: riskFairnessBefore !== null && riskFairnessAfter !== null ? riskFairnessAfter - riskFairnessBefore : null,
      });
    }

    // Mid Market segment
    const midMarketReps = reps.filter(r => r.Segment === 'Mid Market');
    const midMarketBaselineResults = baselineResults.filter(r => 
      midMarketReps.some(rep => rep.Rep_Name === r.assignedRep)
    );
    const midMarketCurrentResults = results.filter(r => r.segment === 'Mid Market');

    if (midMarketReps.length > 0) {
      const geoMatchBefore = calculateGeoMatchPercent(midMarketReps, midMarketBaselineResults, accounts);
      const geoMatchAfter = calculateGeoMatchPercent(midMarketReps, midMarketCurrentResults, accounts);
      const preserveAfter = calculatePreservePercent(midMarketCurrentResults, accounts);

      const arrFairnessBefore = calculateARRFairness(midMarketReps, midMarketBaselineResults, accounts);
      const arrFairnessAfter = calculateARRFairness(midMarketReps, midMarketCurrentResults, accounts);

      const accountFairnessBefore = calculateAccountFairness(midMarketReps, midMarketBaselineResults);
      const accountFairnessAfter = calculateAccountFairness(midMarketReps, midMarketCurrentResults);

      const riskFairnessBefore = calculateRiskFairness(midMarketReps, midMarketBaselineResults, accounts, highRiskThreshold);
      const riskFairnessAfter = calculateRiskFairness(midMarketReps, midMarketCurrentResults, accounts, highRiskThreshold);

      comparisons.push({
        segment: 'Mid Market',
        geoMatchBefore,
        geoMatchAfter,
        geoMatchDelta: geoMatchBefore !== null && geoMatchAfter !== null ? geoMatchAfter - geoMatchBefore : null,
        preserveAfter,
        arrFairnessBefore,
        arrFairnessAfter,
        arrFairnessDelta: arrFairnessBefore !== null && arrFairnessAfter !== null ? arrFairnessAfter - arrFairnessBefore : null,
        accountFairnessBefore,
        accountFairnessAfter,
        accountFairnessDelta: accountFairnessBefore !== null && accountFairnessAfter !== null ? accountFairnessAfter - accountFairnessBefore : null,
        riskFairnessBefore,
        riskFairnessAfter,
        riskFairnessDelta: riskFairnessBefore !== null && riskFairnessAfter !== null ? riskFairnessAfter - riskFairnessBefore : null,
      });
    }

    // Total - Before (global CV across all original assignments) vs After (segment-averaged)
    const geoMatchBefore = calculateGeoMatchPercent(reps, baselineResults, accounts);
    const geoMatchAfter = calculateGeoMatchPercent(reps, results, accounts);
    const preserveAfter = calculatePreservePercent(results, accounts);

    // Before: Calculate globally across all original rep assignments
    const arrFairnessBefore = calculateARRFairness(reps, baselineResults, accounts);
    const accountFairnessBefore = calculateAccountFairness(reps, baselineResults);
    const riskFairnessBefore = calculateRiskFairness(reps, baselineResults, accounts, highRiskThreshold);

    // After: Calculate as average of segments (matching Analyze page)
    const entComp = comparisons.find(c => c.segment === 'Enterprise');
    const mmComp = comparisons.find(c => c.segment === 'Mid Market');

    const arrFairnessAfter = (entComp?.arrFairnessAfter !== null && mmComp?.arrFairnessAfter !== null)
      ? ((entComp?.arrFairnessAfter ?? 0) + (mmComp?.arrFairnessAfter ?? 0)) / 2
      : entComp?.arrFairnessAfter ?? mmComp?.arrFairnessAfter ?? null;

    const accountFairnessAfter = (entComp?.accountFairnessAfter !== null && mmComp?.accountFairnessAfter !== null)
      ? ((entComp?.accountFairnessAfter ?? 0) + (mmComp?.accountFairnessAfter ?? 0)) / 2
      : entComp?.accountFairnessAfter ?? mmComp?.accountFairnessAfter ?? null;

    const riskFairnessAfter = (entComp?.riskFairnessAfter !== null && mmComp?.riskFairnessAfter !== null)
      ? ((entComp?.riskFairnessAfter ?? 0) + (mmComp?.riskFairnessAfter ?? 0)) / 2
      : entComp?.riskFairnessAfter ?? mmComp?.riskFairnessAfter ?? null;

    comparisons.push({
      segment: 'Total',
      geoMatchBefore,
      geoMatchAfter,
      geoMatchDelta: geoMatchBefore !== null && geoMatchAfter !== null ? geoMatchAfter - geoMatchBefore : null,
      preserveAfter,
      arrFairnessBefore,
      arrFairnessAfter,
      arrFairnessDelta: arrFairnessBefore !== null && arrFairnessAfter !== null ? arrFairnessAfter - arrFairnessBefore : null,
      accountFairnessBefore,
      accountFairnessAfter,
      accountFairnessDelta: accountFairnessBefore !== null && accountFairnessAfter !== null ? accountFairnessAfter - accountFairnessBefore : null,
      riskFairnessBefore,
      riskFairnessAfter,
      riskFairnessDelta: riskFairnessBefore !== null && riskFairnessAfter !== null ? riskFairnessAfter - riskFairnessBefore : null,
    });

    return comparisons;
  }, [reps, accounts, results, highRiskThreshold, hasRiskScore]);

  if (segmentComparisons.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {segmentComparisons.map((comparison) => (
        <div key={comparison.segment} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
          {/* Segment Title */}
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-4 capitalize">{comparison.segment.toLowerCase()}</h3>

          {/* Metrics Section - 2 per row */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Geo Match */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                  Geo Match
                </div>
                {comparison.geoMatchBefore !== null && comparison.geoMatchAfter !== null ? (
                  <>
                    <div className={`text-xl font-semibold ${
                      comparison.geoMatchDelta && comparison.geoMatchDelta > 0 ? 'text-green-600' :
                      comparison.geoMatchDelta && comparison.geoMatchDelta < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {comparison.geoMatchDelta !== null ? `${comparison.geoMatchDelta > 0 ? '+' : ''}${comparison.geoMatchDelta.toFixed(1)}%` : '—'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {comparison.geoMatchBefore.toFixed(1)}%
                      <span className="mx-1">→</span>
                      <span className="text-gray-900 font-medium">
                        {comparison.geoMatchAfter.toFixed(1)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">N/A</div>
                )}
              </div>

              {/* Preserved Rep */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                  Preserved Rep
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {comparison.preserveAfter !== null ? `${comparison.preserveAfter.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-b border-gray-100 mb-4"></div>

          {/* Fairness Index Section - 3 across */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fairness Index</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {/* ARR Fairness */}
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">ARR</div>
                <div className={`text-lg font-semibold ${
                  comparison.arrFairnessDelta && comparison.arrFairnessDelta > 0 ? 'text-green-600' :
                  comparison.arrFairnessDelta && comparison.arrFairnessDelta < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {comparison.arrFairnessDelta !== null ? `${comparison.arrFairnessDelta > 0 ? '+' : ''}${comparison.arrFairnessDelta.toFixed(0)}` : '—'}
                </div>
                <div className="text-xs text-gray-600">
                  {comparison.arrFairnessBefore !== null ? Math.round(comparison.arrFairnessBefore) : 'N/A'}
                  <span className="mx-1">→</span>
                  <span className="text-gray-900 font-medium">
                    {comparison.arrFairnessAfter !== null ? Math.round(comparison.arrFairnessAfter) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Account Fairness */}
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Account</div>
                <div className={`text-lg font-semibold ${
                  comparison.accountFairnessDelta && comparison.accountFairnessDelta > 0 ? 'text-green-600' :
                  comparison.accountFairnessDelta && comparison.accountFairnessDelta < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {comparison.accountFairnessDelta !== null ? `${comparison.accountFairnessDelta > 0 ? '+' : ''}${comparison.accountFairnessDelta.toFixed(0)}` : '—'}
                </div>
                <div className="text-xs text-gray-600">
                  {comparison.accountFairnessBefore !== null ? Math.round(comparison.accountFairnessBefore) : 'N/A'}
                  <span className="mx-1">→</span>
                  <span className="text-gray-900 font-medium">
                    {comparison.accountFairnessAfter !== null ? Math.round(comparison.accountFairnessAfter) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Risk Fairness */}
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Risk</div>
                {!hasRiskScore || comparison.riskFairnessBefore === null || comparison.riskFairnessAfter === null ? (
                  <div className="text-gray-400 text-sm">N/A</div>
                ) : (
                  <>
                    <div className={`text-lg font-semibold ${
                      comparison.riskFairnessDelta && comparison.riskFairnessDelta > 0 ? 'text-green-600' :
                      comparison.riskFairnessDelta && comparison.riskFairnessDelta < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {comparison.riskFairnessDelta !== null ? `${comparison.riskFairnessDelta > 0 ? '+' : ''}${comparison.riskFairnessDelta.toFixed(0)}` : '—'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {Math.round(comparison.riskFairnessBefore)}
                      <span className="mx-1">→</span>
                      <span className="text-gray-900 font-medium">
                        {Math.round(comparison.riskFairnessAfter)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
