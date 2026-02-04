/**
 * Segment Summary Cards Component
 * Displays Enterprise, Mid-Market, and Total segment metrics
 * 
 * Task: AE-24 - Build segment summary cards with metrics
 * 
 * Shows three cards with segment-level metrics:
 * - ARR (total for segment)
 * - Accounts (count)
 * - ARR/Rep (E:MM) - Ratio of Enterprise to Mid-Market ARR per rep
 * - Accts/Rep (E:MM) - Ratio of Enterprise to Mid-Market accounts per rep
 * - Avg Deal Size (E:MM) - Ratio of Enterprise to Mid-Market average deal size
 */

import { useMemo } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { segmentAccounts } from '@/lib/allocation/segmentation';
import {
  formatCurrency,
  formatRatio,
  formatComparisonRatio,
  formatPercentage,
} from '@/lib/utils/formatting';
import type { Rep } from '@/types';

interface SegmentMetrics {
  arr: number;
  accountCount: number;
  arrPerRep: number | null;
  acctsPerRep: number | null;
  avgDeal: number | null;
  highRiskArrPct: number | null;
}

/**
 * Calculate metrics for a segment
 */
function calculateSegmentMetrics(
  segmentAccounts: any[],
  segmentReps: Rep[],
  highRiskThreshold: number,
  hasRiskScore: boolean
): SegmentMetrics {
  const arr = segmentAccounts.reduce((sum, acc) => sum + acc.ARR, 0);
  const accountCount = segmentAccounts.length;
  const repCount = segmentReps.length;

  // Calculate high-risk ARR percentage
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

  // Handle empty segments or no reps
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

function SegmentSummaryCards() {
  const { reps, accounts, threshold, highRiskThreshold, hasRiskScore } = useAllocationStore();

  // Calculate segment metrics
  const metrics = useMemo(() => {
    // Segment accounts by threshold
    const { enterprise, midMarket } = segmentAccounts(accounts, threshold);

    // Filter reps by segment
    const enterpriseReps = reps.filter((rep) => rep.Segment === 'Enterprise');
    const midMarketReps = reps.filter((rep) => rep.Segment === 'Mid Market');

    // Calculate metrics for each segment
    const enterpriseMetrics = calculateSegmentMetrics(enterprise, enterpriseReps, highRiskThreshold, hasRiskScore);
    const midMarketMetrics = calculateSegmentMetrics(midMarket, midMarketReps, highRiskThreshold, hasRiskScore);

    // Calculate total metrics
    const totalArr = enterpriseMetrics.arr + midMarketMetrics.arr;
    const totalAccounts = enterpriseMetrics.accountCount + midMarketMetrics.accountCount;
    const totalReps = reps.length;
    const totalArrPerRep = totalReps > 0 ? totalArr / totalReps : null;
    const totalAcctsPerRep = totalReps > 0 ? totalAccounts / totalReps : null;
    const totalAvgDeal = totalAccounts > 0 ? totalArr / totalAccounts : null;
    
    // Calculate total high-risk ARR percentage
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

    // Calculate Enterprise to Mid-Market ratios
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

    return {
      enterprise: enterpriseMetrics,
      midMarket: midMarketMetrics,
      total: {
        arr: totalArr,
        accountCount: totalAccounts,
        arrPerRep: totalArrPerRep,
        acctsPerRep: totalAcctsPerRep,
        avgDeal: totalAvgDeal,
        highRiskArrPct: totalHighRiskArrPct,
      },
      ratios: {
        arrPerRep: arrPerRepRatio,
        acctsPerRep: acctsPerRepRatio,
        avgDeal: avgDealRatio,
      },
    };
  }, [accounts, reps, threshold, highRiskThreshold, hasRiskScore]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Enterprise Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-center font-semibold text-gray-900 mb-4">ENTERPRISE</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ARR:</span>
            <span className="font-medium">
              {metrics.enterprise.accountCount > 0
                ? formatCurrency(metrics.enterprise.arr)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accounts:</span>
            <span className="font-medium">
              {metrics.enterprise.accountCount > 0
                ? metrics.enterprise.accountCount
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ARR/Rep:</span>
            <span className="font-medium">
              {metrics.enterprise.arrPerRep !== null
                ? formatCurrency(metrics.enterprise.arrPerRep)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accts/Rep:</span>
            <span className="font-medium">
              {metrics.enterprise.acctsPerRep !== null
                ? formatRatio(metrics.enterprise.acctsPerRep)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Deal Size:</span>
            <span className="font-medium">
              {metrics.enterprise.avgDeal !== null
                ? formatCurrency(metrics.enterprise.avgDeal)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">High-Risk ARR %:</span>
            <span className="font-medium">
              {metrics.enterprise.highRiskArrPct !== null
                ? formatPercentage(metrics.enterprise.highRiskArrPct)
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Mid Market Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-center font-semibold text-gray-900 mb-4">MID MARKET</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ARR:</span>
            <span className="font-medium">
              {metrics.midMarket.accountCount > 0
                ? formatCurrency(metrics.midMarket.arr)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accounts:</span>
            <span className="font-medium">
              {metrics.midMarket.accountCount > 0
                ? metrics.midMarket.accountCount
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ARR/Rep:</span>
            <span className="font-medium">
              {metrics.midMarket.arrPerRep !== null
                ? formatCurrency(metrics.midMarket.arrPerRep)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accts/Rep:</span>
            <span className="font-medium">
              {metrics.midMarket.acctsPerRep !== null
                ? formatRatio(metrics.midMarket.acctsPerRep)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Deal Size:</span>
            <span className="font-medium">
              {metrics.midMarket.avgDeal !== null
                ? formatCurrency(metrics.midMarket.avgDeal)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">High-Risk ARR %:</span>
            <span className="font-medium">
              {metrics.midMarket.highRiskArrPct !== null
                ? formatPercentage(metrics.midMarket.highRiskArrPct)
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Total Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-center font-semibold text-gray-900 mb-4">TOTAL</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ARR:</span>
            <span className="font-medium">
              {metrics.total.accountCount > 0
                ? formatCurrency(metrics.total.arr)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accounts:</span>
            <span className="font-medium">
              {metrics.total.accountCount > 0
                ? metrics.total.accountCount
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ARR/Rep (E/MM):</span>
            <span className="font-medium">
              {metrics.ratios.arrPerRep !== null
                ? formatComparisonRatio(metrics.ratios.arrPerRep)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accts/Rep (E/MM):</span>
            <span className="font-medium">
              {metrics.ratios.acctsPerRep !== null
                ? formatComparisonRatio(metrics.ratios.acctsPerRep)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Deal Size (E/MM):</span>
            <span className="font-medium">
              {metrics.ratios.avgDeal !== null
                ? formatComparisonRatio(metrics.ratios.avgDeal)
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">High-Risk ARR %:</span>
            <span className="font-medium">
              {metrics.total.highRiskArrPct !== null
                ? formatPercentage(metrics.total.highRiskArrPct)
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SegmentSummaryCards;
