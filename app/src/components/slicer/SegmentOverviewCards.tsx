/**
 * Segment Overview Cards Component - V3 Design
 * Combines segment metrics and fairness index into unified cards
 * 
 * Each card contains:
 * - Main header with black underline
 * - "Metrics" subsection with KPIs
 * - Darker grey separator
 * - "Fairness Index" subsection with colored bars
 */

import { useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { segmentAccounts } from '@/lib/allocation/segmentation';
import {
  calculateARRFairness,
  calculateAccountFairness,
  calculateRiskFairness,
  calculateCustomComposite,
  calculateBalancedComposite,
  getFairnessColor,
} from '@/lib/allocation/fairness';
import {
  formatCurrency,
  formatRatio,
  formatComparisonRatio,
  formatPercentage,
  formatScore,
  formatRange,
  getColorClasses,
} from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';
import EmptySegmentWarning from '@/components/common/EmptySegmentWarning';
import type { Rep, AllocationResult, Account } from '@/types';

// ============================================================================
// Types & Calculation Functions
// ============================================================================

interface SegmentMetrics {
  arr: number;
  accountCount: number;
  arrPerRep: number | null;
  acctsPerRep: number | null;
  avgDeal: number | null;
  highRiskArrPct: number | null;
}

interface FairnessMetrics {
  arrFairness: number | null;
  accountFairness: number | null;
  riskFairness: number | null;
  customComposite: number | null;
  balancedComposite: number | null;
  arrRange: { min: number; max: number } | null;
  accountRange: { min: number; max: number } | null;
  riskRange: { min: number; max: number } | null;
  /** ARR max/min ratio (max rep ARR / min rep ARR); null if min is 0 or no data */
  arrMaxMinRatio: number | null;
}

function calculateSegmentMetrics(
  segmentAccounts: any[],
  segmentReps: Rep[],
  highRiskThreshold: number,
  hasRiskScore: boolean
): SegmentMetrics {
  const arr = segmentAccounts.reduce((sum, acc) => sum + acc.ARR, 0);
  const accountCount = segmentAccounts.length;
  const repCount = segmentReps.length;

  let highRiskArrPct: number | null = null;
  if (hasRiskScore && arr > 0) {
    const highRiskArr = segmentAccounts.reduce((sum, acc) => {
      if (acc.Risk_Score !== null && acc.Risk_Score >= highRiskThreshold) {
        return sum + acc.ARR;
      }
      return sum;
    }, 0);
    highRiskArrPct = (highRiskArr / arr) * 100;
  }

  const arrPerRep = repCount > 0 ? arr / repCount : null;
  const acctsPerRep = repCount > 0 ? accountCount / repCount : null;
  const avgDeal = accountCount > 0 ? arr / accountCount : null;

  return {
    arr,
    accountCount,
    arrPerRep,
    acctsPerRep,
    avgDeal,
    highRiskArrPct,
  };
}

function calculateSegmentFairness(
  segment: 'Enterprise' | 'Mid Market',
  reps: Rep[],
  results: AllocationResult[],
  accounts: Account[],
  weights: { arr: number; account: number; risk: number },
  highRiskThreshold: number
): FairnessMetrics {
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
      arrMaxMinRatio: null,
    };
  }

  const accountMap = new Map(accounts.map(acc => [acc.Account_ID, acc]));

  // Calculate ARR ranges
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

  // Calculate account ranges
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

  // Calculate risk ranges
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

  const arrFairness = calculateARRFairness(segmentReps, segmentResults, accounts);
  const accountFairness = calculateAccountFairness(segmentReps, segmentResults);
  const riskFairness = calculateRiskFairness(segmentReps, segmentResults, accounts, highRiskThreshold);
  const customComposite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
  const balancedComposite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);

  const arrMaxMinRatio =
    arrRange && arrRange.min > 0 ? arrRange.max / arrRange.min : null;

  return {
    arrFairness,
    accountFairness,
    riskFairness,
    customComposite,
    balancedComposite,
    arrRange,
    accountRange,
    riskRange,
    arrMaxMinRatio,
  };
}

// ============================================================================
// Unified Card Component
// ============================================================================

interface SegmentOverviewCardProps {
  title: string;
  metrics: SegmentMetrics;
  fairness: FairnessMetrics;
  isTotal: boolean;
  ratios?: {
    arrPerRep: number | null;
    acctsPerRep: number | null;
    avgDeal: number | null;
  };
  showRange?: boolean;
  segmentName?: 'Enterprise' | 'Mid Market';
}

function SegmentOverviewCard({
  title,
  metrics,
  fairness,
  isTotal,
  ratios,
  showRange = true,
  segmentName,
}: SegmentOverviewCardProps) {
  const customColor = getColorClasses(getFairnessColor(fairness.customComposite));
  const balancedColor = getColorClasses(getFairnessColor(fairness.balancedComposite));
  const arrColor = getColorClasses(getFairnessColor(fairness.arrFairness));
  const accountColor = getColorClasses(getFairnessColor(fairness.accountFairness));
  const riskColor = getColorClasses(getFairnessColor(fairness.riskFairness));

  // Check if segment is empty (has zero accounts)
  const isEmptySegment = !isTotal && segmentName && metrics.accountCount === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      {/* Main Header */}
      <h3 className="text-center text-lg font-semibold text-gray-900 mb-4 capitalize">{title.toLowerCase()}</h3>

      {/* Empty Segment Warning */}
      {isEmptySegment && (
        <EmptySegmentWarning segment={segmentName} />
      )}

      {/* Metrics Subsection */}
      <div className="mb-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ARR</span>
            <span className="font-medium text-gray-900">
              {metrics.accountCount > 0 ? formatCurrency(metrics.arr) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Accounts</span>
            <span className="font-medium text-gray-900">
              {metrics.accountCount > 0 ? metrics.accountCount : 'N/A'}
            </span>
          </div>
          {!isTotal && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ARR/Rep</span>
                <span className="font-medium text-gray-900">
                  {metrics.arrPerRep !== null ? formatCurrency(metrics.arrPerRep) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accts/Rep</span>
                <span className="font-medium text-gray-900">
                  {metrics.acctsPerRep !== null ? Math.round(metrics.acctsPerRep).toString() : 'N/A'}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {isTotal ? 'Avg Deal Size (E/MM)' : 'Avg Deal Size'}
            </span>
            <span className="font-medium text-gray-900">
              {isTotal && ratios
                ? ratios.avgDeal !== null ? formatComparisonRatio(ratios.avgDeal) : 'N/A'
                : metrics.avgDeal !== null ? formatCurrency(metrics.avgDeal) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">High-Risk ARR %</span>
            <span className="font-medium text-gray-900">
              {metrics.highRiskArrPct !== null ? formatPercentage(metrics.highRiskArrPct) : 'N/A'}
            </span>
          </div>
          {isTotal && (
            <>
              {/* Invisible spacers to maintain alignment */}
              <div className="flex justify-between items-center" style={{ visibility: 'hidden' }}>
                <span className="text-gray-600">Spacer</span>
                <span className="font-medium text-gray-900">N/A</span>
              </div>
              <div className="flex justify-between items-center" style={{ visibility: 'hidden' }}>
                <span className="text-gray-600">Spacer</span>
                <span className="font-medium text-gray-900">N/A</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subtle Separator */}
      <div className="border-b border-gray-100 mb-4"></div>

      {/* Fairness Index Subsection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Fairness Index</h4>
        <div className="space-y-2.5 text-sm">
          {/* Composite Scores - Side by Side */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-gray-600 text-xs">
                  Custom Score
                </span>
              </div>
              <span className={cn(
                'px-3 py-1.5 rounded-lg font-semibold text-sm shadow-sm',
                customColor.badge
              )}>
                {formatScore(fairness.customComposite)}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-gray-600 text-xs">
                  Balanced Score
                </span>
              </div>
              <span className={cn(
                'px-3 py-1.5 rounded-lg font-semibold text-sm shadow-sm',
                balancedColor.badge
              )}>
                {formatScore(fairness.balancedComposite)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            {/* ARR Balance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-xs">ARR Balance</span>
                </div>
                <span className="font-medium text-gray-900 text-sm">
                  {formatScore(fairness.arrFairness)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full relative group">
                {fairness.arrFairness !== null && (
                  <div 
                    className={cn('h-full transition-all rounded-full', arrColor.bar)}
                    style={{ width: `${Math.min(fairness.arrFairness, 100)}%` }}
                  />
                )}
                {showRange && fairness.arrRange && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 whitespace-nowrap z-50">
                    <div className="text-xs text-gray-600">ARR Range</div>
                    <div className="text-sm font-medium text-gray-900">{formatRange(fairness.arrRange, { isCurrency: true })}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Balance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-xs">Account Balance</span>
                </div>
                <span className="font-medium text-gray-900 text-sm">
                  {formatScore(fairness.accountFairness)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full relative group">
                {fairness.accountFairness !== null && (
                  <div 
                    className={cn('h-full transition-all rounded-full', accountColor.bar)}
                    style={{ width: `${Math.min(fairness.accountFairness, 100)}%` }}
                  />
                )}
                {showRange && fairness.accountRange && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 whitespace-nowrap z-50">
                    <div className="text-xs text-gray-600">Account Range</div>
                    <div className="text-sm font-medium text-gray-900">{formatRange(fairness.accountRange)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Distribution */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-xs">Risk Distribution</span>
                </div>
                <span className="font-medium text-gray-900 text-sm">
                  {formatScore(fairness.riskFairness)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full relative group">
                {fairness.riskFairness !== null && (
                  <div 
                    className={cn('h-full transition-all rounded-full', riskColor.bar)}
                    style={{ width: `${Math.min(fairness.riskFairness, 100)}%` }}
                  />
                )}
                {showRange && fairness.riskRange && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 whitespace-nowrap z-50">
                    <div className="text-xs text-gray-600">Risk Range</div>
                    <div className="text-sm font-medium text-gray-900">{formatRange(fairness.riskRange, { isPercentage: true })}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ARR Max/Min Ratio - segment cards only */}
            {!isTotal && segmentName && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600 text-xs">ARR Max/Min</span>
                <span className="font-medium text-gray-900 text-sm">
                  {fairness.arrMaxMinRatio != null ? formatComparisonRatio(fairness.arrMaxMinRatio, 2) : 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function SegmentOverviewCards() {
  const { reps, accounts, threshold, results, arrWeight, accountWeight, riskWeight, highRiskThreshold, hasRiskScore } = useAllocationStore();

  const data = useMemo(() => {
    const { enterprise, midMarket } = segmentAccounts(accounts, threshold);

    const enterpriseReps = reps.filter((rep) => rep.Segment === 'Enterprise');
    const midMarketReps = reps.filter((rep) => rep.Segment === 'Mid Market');

    // Calculate metrics
    const enterpriseMetrics = calculateSegmentMetrics(enterprise, enterpriseReps, highRiskThreshold, hasRiskScore);
    const midMarketMetrics = calculateSegmentMetrics(midMarket, midMarketReps, highRiskThreshold, hasRiskScore);

    // Calculate total metrics
    const totalArr = enterpriseMetrics.arr + midMarketMetrics.arr;
    const totalAccounts = enterpriseMetrics.accountCount + midMarketMetrics.accountCount;
    const totalReps = reps.length;
    const totalArrPerRep = totalReps > 0 ? totalArr / totalReps : null;
    const totalAcctsPerRep = totalReps > 0 ? totalAccounts / totalReps : null;
    const totalAvgDeal = totalAccounts > 0 ? totalArr / totalAccounts : null;
    
    let totalHighRiskArrPct: number | null = null;
    if (hasRiskScore && totalArr > 0) {
      const allAccounts = [...enterprise, ...midMarket];
      const totalHighRiskArr = allAccounts.reduce((sum, acc) => {
        if (acc.Risk_Score !== null && acc.Risk_Score >= highRiskThreshold) {
          return sum + acc.ARR;
        }
        return sum;
      }, 0);
      totalHighRiskArrPct = (totalHighRiskArr / totalArr) * 100;
    }

    const totalMetrics: SegmentMetrics = {
      arr: totalArr,
      accountCount: totalAccounts,
      arrPerRep: totalArrPerRep,
      acctsPerRep: totalAcctsPerRep,
      avgDeal: totalAvgDeal,
      highRiskArrPct: totalHighRiskArrPct,
    };

    // Calculate ratios
    const arrPerRepRatio = 
      enterpriseMetrics.arrPerRep !== null && 
      midMarketMetrics.arrPerRep !== null && 
      midMarketMetrics.arrPerRep > 0
        ? enterpriseMetrics.arrPerRep / midMarketMetrics.arrPerRep
        : null;
    
    const acctsPerRepRatio = 
      enterpriseMetrics.acctsPerRep !== null && 
      midMarketMetrics.acctsPerRep !== null && 
      midMarketMetrics.acctsPerRep > 0
        ? enterpriseMetrics.acctsPerRep / midMarketMetrics.acctsPerRep
        : null;
    
    const avgDealRatio = 
      enterpriseMetrics.avgDeal !== null && 
      midMarketMetrics.avgDeal !== null && 
      midMarketMetrics.avgDeal > 0
        ? enterpriseMetrics.avgDeal / midMarketMetrics.avgDeal
        : null;

    // Calculate fairness
    const weights = { arr: arrWeight, account: accountWeight, risk: riskWeight };
    
    const enterpriseFairness = calculateSegmentFairness(
      'Enterprise',
      reps,
      results,
      accounts,
      weights,
      highRiskThreshold
    );

    const midMarketFairness = calculateSegmentFairness(
      'Mid Market',
      reps,
      results,
      accounts,
      weights,
      highRiskThreshold
    );

    // Calculate average fairness
    const avgFairness: FairnessMetrics = {
      arrFairness: (enterpriseFairness.arrFairness !== null && midMarketFairness.arrFairness !== null)
        ? (enterpriseFairness.arrFairness + midMarketFairness.arrFairness) / 2
        : enterpriseFairness.arrFairness ?? midMarketFairness.arrFairness,
      accountFairness: (enterpriseFairness.accountFairness !== null && midMarketFairness.accountFairness !== null)
        ? (enterpriseFairness.accountFairness + midMarketFairness.accountFairness) / 2
        : enterpriseFairness.accountFairness ?? midMarketFairness.accountFairness,
      riskFairness: (enterpriseFairness.riskFairness !== null && midMarketFairness.riskFairness !== null)
        ? (enterpriseFairness.riskFairness + midMarketFairness.riskFairness) / 2
        : enterpriseFairness.riskFairness ?? midMarketFairness.riskFairness,
      customComposite: (enterpriseFairness.customComposite !== null && midMarketFairness.customComposite !== null)
        ? (enterpriseFairness.customComposite + midMarketFairness.customComposite) / 2
        : enterpriseFairness.customComposite ?? midMarketFairness.customComposite,
      balancedComposite: (enterpriseFairness.balancedComposite !== null && midMarketFairness.balancedComposite !== null)
        ? (enterpriseFairness.balancedComposite + midMarketFairness.balancedComposite) / 2
        : enterpriseFairness.balancedComposite ?? midMarketFairness.balancedComposite,
      arrRange: null,
      accountRange: null,
      riskRange: null,
      arrMaxMinRatio: null,
    };

    return {
      enterpriseMetrics,
      midMarketMetrics,
      totalMetrics,
      enterpriseFairness,
      midMarketFairness,
      avgFairness,
      ratios: {
        arrPerRep: arrPerRepRatio,
        acctsPerRep: acctsPerRepRatio,
        avgDeal: avgDealRatio,
      },
    };
  }, [accounts, reps, threshold, results, arrWeight, accountWeight, riskWeight, highRiskThreshold, hasRiskScore]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <SegmentOverviewCard
        title="ENTERPRISE"
        metrics={data.enterpriseMetrics}
        fairness={data.enterpriseFairness}
        isTotal={false}
        segmentName="Enterprise"
      />

      <SegmentOverviewCard
        title="MID MARKET"
        metrics={data.midMarketMetrics}
        fairness={data.midMarketFairness}
        isTotal={false}
        segmentName="Mid Market"
      />

      <SegmentOverviewCard
        title="TOTAL"
        metrics={data.totalMetrics}
        fairness={data.avgFairness}
        isTotal={true}
        ratios={data.ratios}
        showRange={false}
      />
    </div>
  );
}

export default SegmentOverviewCards;
