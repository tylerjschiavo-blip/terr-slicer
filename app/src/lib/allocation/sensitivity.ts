/**
 * Sensitivity Analysis for Territory Allocation Engine
 * 
 * Generates fairness and Deal Size Ratio data across threshold range
 * for sensitivity chart visualization.
 */

import type { Account, Rep, AllocationConfig, SensitivityDataPoint } from '../../types';
import { getThresholdRange, segmentAccounts } from './segmentation';
import { allocateAccounts } from './greedyAllocator';
import {
  calculateSegmentBasedFairness
} from './fairness';
import { THRESHOLD_STEP_SIZE } from './constants';

/**
 * Calculate Deal Size Ratio (Enterprise Avg ARR / Mid-Market Avg ARR)
 * 
 * @param enterpriseAccounts - Accounts in Enterprise segment
 * @param midMarketAccounts - Accounts in Mid-Market segment
 * @returns Deal Size Ratio as number, or null if empty segment
 */
export function calculateDealSizeRatio(
  enterpriseAccounts: Account[],
  midMarketAccounts: Account[]
): number | null {
  // Handle empty segments
  if (enterpriseAccounts.length === 0 || midMarketAccounts.length === 0) {
    return null;
  }

  // Calculate average ARR for Enterprise segment
  const enterpriseTotalARR = enterpriseAccounts.reduce((sum, acc) => sum + acc.ARR, 0);
  const enterpriseAvgARR = enterpriseTotalARR / enterpriseAccounts.length;

  // Calculate average ARR for Mid-Market segment
  const midMarketTotalARR = midMarketAccounts.reduce((sum, acc) => sum + acc.ARR, 0);
  const midMarketAvgARR = midMarketTotalARR / midMarketAccounts.length;

  // Return ratio (E:MM)
  if (midMarketAvgARR === 0) {
    return null;
  }

  return enterpriseAvgARR / midMarketAvgARR;
}

/**
 * Generate sensitivity data points across threshold range
 * 
 * Samples thresholds in 1K increments (matching threshold slider), runs allocation
 * with current weights for each threshold, and calculates:
 * - Balanced fairness (segment-based: average of Enterprise and Mid Market)
 * - Custom fairness (segment-based: average of Enterprise and Mid Market)
 * - Deal Size Ratio (E Avg ARR / MM Avg ARR)
 * 
 * @param accounts - Array of all accounts
 * @param reps - Array of all reps
 * @param config - Allocation configuration with current weights
 * @returns Array of sensitivity data points, sorted by threshold
 */
export function generateSensitivityData(
  accounts: Account[],
  reps: Rep[],
  config: AllocationConfig
): SensitivityDataPoint[] {
  // Handle empty data
  if (accounts.length === 0 || reps.length === 0) {
    return [];
  }

  // Get threshold range (min/max employees, rounded to nearest 1K)
  const thresholdRange = getThresholdRange(accounts);
  const minThreshold = thresholdRange.min;
  const maxThreshold = thresholdRange.max;

  // Handle edge case: no valid threshold range
  if (minThreshold === maxThreshold) {
    return [];
  }

  // Calculate number of samples using same increments as threshold slider
  const rangeSize = maxThreshold - minThreshold;
  const stepSize = THRESHOLD_STEP_SIZE;
  const numSamples = Math.floor(rangeSize / stepSize) + 1;

  // Generate threshold samples evenly across range
  const thresholds: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const threshold = minThreshold + (i * stepSize);
    if (threshold <= maxThreshold) {
      thresholds.push(threshold);
    }
  }

  // Ensure max threshold is included
  if (thresholds[thresholds.length - 1] !== maxThreshold) {
    thresholds.push(maxThreshold);
  }

  // Generate data points for each threshold
  const dataPoints: SensitivityDataPoint[] = [];

  for (const threshold of thresholds) {
    // Create config with this threshold (keep all other settings)
    const thresholdConfig: AllocationConfig = {
      ...config,
      threshold
    };

    // Run allocation with current weights
    const allocationResults = allocateAccounts(accounts, reps, thresholdConfig);

    // Segment accounts for Deal Size Ratio calculation
    const { enterprise: enterpriseAccounts, midMarket: midMarketAccounts } = segmentAccounts(
      accounts,
      threshold
    );

    // Calculate segment-based fairness metrics (matching UI and optimizer)
    const fairnessMetrics = calculateSegmentBasedFairness(
      reps,
      allocationResults,
      accounts,
      {
        arr: config.arrWeight,
        account: config.accountWeight,
        risk: config.riskWeight
      },
      config.highRiskThreshold
    );

    // Extract fairness scores (default to 0 if null)
    const balancedFairness = fairnessMetrics.balancedComposite || 0;
    const customFairness = fairnessMetrics.customComposite || 0;

    // Calculate Deal Size Ratio (E:MM)
    const dealSizeRatioValue = calculateDealSizeRatio(enterpriseAccounts, midMarketAccounts);
    
    // Format Deal Size Ratio as string (e.g., "2.5:1" or "N/A")
    const dealSizeRatio = dealSizeRatioValue !== null
      ? `${dealSizeRatioValue.toFixed(1)}:1`
      : 'N/A';

    // Add data point
    dataPoints.push({
      threshold,
      balancedFairness,
      customFairness,
      dealSizeRatio
    });
  }

  // Return data points sorted by threshold (ascending)
  return dataPoints.sort((a, b) => a.threshold - b.threshold);
}
