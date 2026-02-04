/**
 * Fairness Score Display Component
 * Displays Custom and Balanced fairness scores with color bands
 * 
 * Task: AE-25
 * 
 * Color bands:
 * - 94-100: Dark Green (excellent)
 * - 88-93: Light Green (good)
 * - 82-87: Yellow (acceptable)
 * - 75-81: Orange (concerning)
 * - <75: Red (poor)
 * - null: Gray (not applicable)
 */

import { useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import {
  calculateARRFairness,
  calculateAccountFairness,
  calculateRiskFairness,
  calculateCustomComposite,
  calculateBalancedComposite,
  getFairnessColor,
} from '@/lib/allocation/fairness';
import {
  formatScore,
  formatRange,
  getColorClasses,
} from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';
import type { Rep, AllocationResult, Account } from '@/types';

interface FairnessCardProps {
  title: string;
  customScore: number | null;
  balancedScore: number | null;
  arrScore: number | null;
  accountScore: number | null;
  riskScore: number | null;
  arrRange: { min: number; max: number } | null;
  accountRange: { min: number; max: number } | null;
  riskRange: { min: number; max: number } | null;
  showRange?: boolean;
}

/**
 * Single fairness card component
 */
function FairnessCard({
  title,
  customScore,
  balancedScore,
  arrScore,
  accountScore,
  riskScore,
  arrRange,
  accountRange,
  riskRange,
  showRange = true,
}: FairnessCardProps) {
  const customColor = getColorClasses(getFairnessColor(customScore));
  const balancedColor = getColorClasses(getFairnessColor(balancedScore));
  const arrColor = getColorClasses(getFairnessColor(arrScore));
  const accountColor = getColorClasses(getFairnessColor(accountScore));
  const riskColor = getColorClasses(getFairnessColor(riskScore));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-center font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3 text-sm">
        {/* Composite Scores - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Custom Composite Score */}
          <div className="flex flex-col items-center">
            <span className="text-gray-600 text-xs mb-1" title="Custom average using your current balance weights">
              Custom Score
            </span>
            <span className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-sm',
              customColor.badge
            )}>
              {formatScore(customScore)}
            </span>
          </div>

          {/* Balanced Composite Score */}
          <div className="flex flex-col items-center">
            <span className="text-gray-600 text-xs mb-1" title="Equal-weight average (33/33/33)">
              Balanced Score
            </span>
            <span className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-sm',
              balancedColor.badge
            )}>
              {formatScore(balancedScore)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-3">
          {/* ARR Balance */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600" title="ARR distribution fairness">
                ARR Bal:
              </span>
              <span className="font-medium text-gray-900">
                {formatScore(arrScore)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded relative group">
              {arrScore !== null && (
                <div 
                  className={cn('h-full transition-all', arrColor.bar)}
                  style={{ width: `${Math.min(arrScore, 100)}%` }}
                />
              )}
              {showRange && arrRange && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-300 shadow-lg rounded px-3 py-2 whitespace-nowrap z-50">
                  <div className="text-xs text-gray-600">ARR Range:</div>
                  <div className="text-sm font-medium text-gray-900">{formatRange(arrRange, { isCurrency: true })}</div>
                </div>
              )}
            </div>
          </div>

          {/* Account Balance */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600" title="Account count distribution fairness">
                Acct Bal:
              </span>
              <span className="font-medium text-gray-900">
                {formatScore(accountScore)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded relative group">
              {accountScore !== null && (
                <div 
                  className={cn('h-full transition-all', accountColor.bar)}
                  style={{ width: `${Math.min(accountScore, 100)}%` }}
                />
              )}
              {showRange && accountRange && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-300 shadow-lg rounded px-3 py-2 whitespace-nowrap z-50">
                  <div className="text-xs text-gray-600">Account Range:</div>
                  <div className="text-sm font-medium text-gray-900">{formatRange(accountRange)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Distribution */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600" title="Risk distribution fairness">
                Risk Dist:
              </span>
              <span className="font-medium text-gray-900">
                {formatScore(riskScore)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded relative group">
              {riskScore !== null && (
                <div 
                  className={cn('h-full transition-all', riskColor.bar)}
                  style={{ width: `${Math.min(riskScore, 100)}%` }}
                />
              )}
              {showRange && riskRange && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-300 shadow-lg rounded px-3 py-2 whitespace-nowrap z-50">
                  <div className="text-xs text-gray-600">Risk Range:</div>
                  <div className="text-sm font-medium text-gray-900">{formatRange(riskRange, { isPercentage: true })}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate segment-specific fairness metrics with ranges
 */
function calculateSegmentMetrics(
  segment: 'Enterprise' | 'Mid Market',
  reps: Rep[],
  results: AllocationResult[],
  accounts: Account[],
  weights: { arr: number; account: number; risk: number },
  highRiskThreshold: number
) {
  // Filter reps and results for this segment
  const segmentReps = reps.filter(r => r.Segment === segment);
  const segmentResults = results.filter(r => r.segment === segment);

  if (segmentReps.length === 0 || segmentResults.length === 0) {
    return {
      arrFairness: null,
      accountFairness: null,
      riskFairness: null,
      customComposite: null,
      balancedComposite: null,
      arrRange: null,
      accountRange: null,
      riskRange: null,
    };
  }

  // Build account map
  const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

  // Calculate ARR per rep and range
  const repARR = new Map<string, number>();
  segmentReps.forEach(rep => repARR.set(rep.Rep_Name, 0));
  segmentResults.forEach(result => {
    const account = accountMap.get(result.accountId);
    if (account) {
      const current = repARR.get(result.assignedRep) || 0;
      repARR.set(result.assignedRep, current + account.ARR);
    }
  });
  const arrValues = Array.from(repARR.values());
  const arrRange = arrValues.length > 0 
    ? { min: Math.min(...arrValues), max: Math.max(...arrValues) }
    : null;

  // Calculate accounts per rep and range
  const repAccounts = new Map<string, number>();
  segmentReps.forEach(rep => repAccounts.set(rep.Rep_Name, 0));
  segmentResults.forEach(result => {
    const current = repAccounts.get(result.assignedRep) || 0;
    repAccounts.set(result.assignedRep, current + 1);
  });
  const accountValues = Array.from(repAccounts.values());
  const accountRange = accountValues.length > 0
    ? { min: Math.min(...accountValues), max: Math.max(...accountValues) }
    : null;

  // Calculate high-risk % per rep and range
  const hasRiskScore = accounts.some(acc => acc.Risk_Score !== null);
  let riskRange: { min: number; max: number } | null = null;
  
  if (hasRiskScore) {
    const repTotalARR = new Map<string, number>();
    const repHighRiskARR = new Map<string, number>();
    segmentReps.forEach(rep => {
      repTotalARR.set(rep.Rep_Name, 0);
      repHighRiskARR.set(rep.Rep_Name, 0);
    });

    segmentResults.forEach(result => {
      const account = accountMap.get(result.accountId);
      if (account) {
        const repName = result.assignedRep;
        const currentTotal = repTotalARR.get(repName) || 0;
        repTotalARR.set(repName, currentTotal + account.ARR);

        const isHighRisk = account.Risk_Score !== null && account.Risk_Score >= highRiskThreshold;
        if (isHighRisk) {
          const currentRisk = repHighRiskARR.get(repName) || 0;
          repHighRiskARR.set(repName, currentRisk + account.ARR);
        }
      }
    });

    const riskPercentages: number[] = [];
    segmentReps.forEach(rep => {
      const totalARR = repTotalARR.get(rep.Rep_Name) || 0;
      const highRiskARR = repHighRiskARR.get(rep.Rep_Name) || 0;
      const riskPercent = totalARR > 0 ? (highRiskARR / totalARR) * 100 : 0;
      riskPercentages.push(riskPercent);
    });

    riskRange = riskPercentages.length > 0
      ? { min: Math.min(...riskPercentages), max: Math.max(...riskPercentages) }
      : null;
  }

  // Calculate individual fairness scores
  const arrFairness = calculateARRFairness(segmentReps, segmentResults, accounts);
  const accountFairness = calculateAccountFairness(segmentReps, segmentResults);
  const riskFairness = calculateRiskFairness(segmentReps, segmentResults, accounts, highRiskThreshold);

  // Calculate composite scores
  const customComposite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
  const balancedComposite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);

  return {
    arrFairness,
    accountFairness,
    riskFairness,
    customComposite,
    balancedComposite,
    arrRange,
    accountRange,
    riskRange,
  };
}

/**
 * Main component
 */
function FairnessScoreDisplay() {
  const {
    reps,
    accounts,
    results,
    arrWeight,
    accountWeight,
    riskWeight,
    highRiskThreshold,
  } = useAllocationStore();

  // Calculate segment-specific metrics
  const metrics = useMemo(() => {
    if (results.length === 0) {
      return {
        enterprise: {
          arrFairness: null,
          accountFairness: null,
          riskFairness: null,
          customComposite: null,
          balancedComposite: null,
          arrRange: null,
          accountRange: null,
          riskRange: null,
        },
        midMarket: {
          arrFairness: null,
          accountFairness: null,
          riskFairness: null,
          customComposite: null,
          balancedComposite: null,
          arrRange: null,
          accountRange: null,
          riskRange: null,
        },
        average: {
          arrFairness: null,
          accountFairness: null,
          riskFairness: null,
          customComposite: null,
          balancedComposite: null,
          arrRange: null,
          accountRange: null,
          riskRange: null,
        },
      };
    }

    const weights = { arr: arrWeight, account: accountWeight, risk: riskWeight };

    // Enterprise metrics
    const enterprise = calculateSegmentMetrics(
      'Enterprise',
      reps,
      results,
      accounts,
      weights,
      highRiskThreshold
    );

    // Mid-Market metrics
    const midMarket = calculateSegmentMetrics(
      'Mid Market',
      reps,
      results,
      accounts,
      weights,
      highRiskThreshold
    );

    // Average metrics - simple average of Enterprise and Mid-Market scores
    const avgArr = (enterprise.arrFairness !== null && midMarket.arrFairness !== null)
      ? (enterprise.arrFairness + midMarket.arrFairness) / 2
      : enterprise.arrFairness !== null ? enterprise.arrFairness
      : midMarket.arrFairness !== null ? midMarket.arrFairness
      : null;

    const avgAccount = (enterprise.accountFairness !== null && midMarket.accountFairness !== null)
      ? (enterprise.accountFairness + midMarket.accountFairness) / 2
      : enterprise.accountFairness !== null ? enterprise.accountFairness
      : midMarket.accountFairness !== null ? midMarket.accountFairness
      : null;

    const avgRisk = (enterprise.riskFairness !== null && midMarket.riskFairness !== null)
      ? (enterprise.riskFairness + midMarket.riskFairness) / 2
      : enterprise.riskFairness !== null ? enterprise.riskFairness
      : midMarket.riskFairness !== null ? midMarket.riskFairness
      : null;

    const avgCustom = (enterprise.customComposite !== null && midMarket.customComposite !== null)
      ? (enterprise.customComposite + midMarket.customComposite) / 2
      : enterprise.customComposite !== null ? enterprise.customComposite
      : midMarket.customComposite !== null ? midMarket.customComposite
      : null;

    const avgBalanced = (enterprise.balancedComposite !== null && midMarket.balancedComposite !== null)
      ? (enterprise.balancedComposite + midMarket.balancedComposite) / 2
      : enterprise.balancedComposite !== null ? enterprise.balancedComposite
      : midMarket.balancedComposite !== null ? midMarket.balancedComposite
      : null;

    // Average ranges - take combined min/max across both segments
    const avgArrRange = (enterprise.arrRange !== null && midMarket.arrRange !== null)
      ? { 
          min: Math.min(enterprise.arrRange.min, midMarket.arrRange.min),
          max: Math.max(enterprise.arrRange.max, midMarket.arrRange.max)
        }
      : enterprise.arrRange !== null ? enterprise.arrRange
      : midMarket.arrRange !== null ? midMarket.arrRange
      : null;

    const avgAccountRange = (enterprise.accountRange !== null && midMarket.accountRange !== null)
      ? { 
          min: Math.min(enterprise.accountRange.min, midMarket.accountRange.min),
          max: Math.max(enterprise.accountRange.max, midMarket.accountRange.max)
        }
      : enterprise.accountRange !== null ? enterprise.accountRange
      : midMarket.accountRange !== null ? midMarket.accountRange
      : null;

    const avgRiskRange = (enterprise.riskRange !== null && midMarket.riskRange !== null)
      ? { 
          min: Math.min(enterprise.riskRange.min, midMarket.riskRange.min),
          max: Math.max(enterprise.riskRange.max, midMarket.riskRange.max)
        }
      : enterprise.riskRange !== null ? enterprise.riskRange
      : midMarket.riskRange !== null ? midMarket.riskRange
      : null;

    const average = {
      arrFairness: avgArr,
      accountFairness: avgAccount,
      riskFairness: avgRisk,
      customComposite: avgCustom,
      balancedComposite: avgBalanced,
      arrRange: avgArrRange,
      accountRange: avgAccountRange,
      riskRange: avgRiskRange,
    };

    return { enterprise, midMarket, average };
  }, [reps, accounts, results, arrWeight, accountWeight, riskWeight, highRiskThreshold]);

  // Update store with average metrics (for use in other components)
  // Removed useEffect to prevent infinite render loop - metrics are already calculated in TerritorySlicerPage
  // useEffect(() => {
  //   setFairnessMetrics(metrics.average);
  // }, [metrics.average, setFairnessMetrics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Enterprise Card */}
      <FairnessCard
        title="ENTERPRISE"
        customScore={metrics.enterprise.customComposite}
        balancedScore={metrics.enterprise.balancedComposite}
        arrScore={metrics.enterprise.arrFairness}
        accountScore={metrics.enterprise.accountFairness}
        riskScore={metrics.enterprise.riskFairness}
        arrRange={metrics.enterprise.arrRange}
        accountRange={metrics.enterprise.accountRange}
        riskRange={metrics.enterprise.riskRange}
      />

      {/* Mid Market Card */}
      <FairnessCard
        title="MID MARKET"
        customScore={metrics.midMarket.customComposite}
        balancedScore={metrics.midMarket.balancedComposite}
        arrScore={metrics.midMarket.arrFairness}
        accountScore={metrics.midMarket.accountFairness}
        riskScore={metrics.midMarket.riskFairness}
        arrRange={metrics.midMarket.arrRange}
        accountRange={metrics.midMarket.accountRange}
        riskRange={metrics.midMarket.riskRange}
      />

      {/* Average Card */}
      <FairnessCard
        title="AVERAGE"
        customScore={metrics.average.customComposite}
        balancedScore={metrics.average.balancedComposite}
        arrScore={metrics.average.arrFairness}
        accountScore={metrics.average.accountFairness}
        riskScore={metrics.average.riskFairness}
        arrRange={metrics.average.arrRange}
        accountRange={metrics.average.accountRange}
        riskRange={metrics.average.riskRange}
        showRange={false}
      />
    </div>
  );
}

export default FairnessScoreDisplay;
