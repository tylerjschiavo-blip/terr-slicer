/**
 * Segmentation Logic for Territory Allocation Engine
 * 
 * Threshold-based segmentation that classifies accounts as Enterprise or Mid Market
 * based on employee count.
 */

import type { Account } from '../../types';

/**
 * Segment a single account based on employee count threshold
 * 
 * @param account - The account to segment
 * @param threshold - Employee count threshold (accounts >= threshold are Enterprise)
 * @returns 'Enterprise' if Num_Employees >= threshold, otherwise 'Mid Market'
 */
export function segmentAccount(
  account: Account,
  threshold: number
): 'Enterprise' | 'Mid Market' {
  return account.Num_Employees >= threshold ? 'Enterprise' : 'Mid Market';
}

/**
 * Segment all accounts into Enterprise and Mid Market arrays
 * 
 * @param accounts - Array of accounts to segment
 * @param threshold - Employee count threshold (accounts >= threshold are Enterprise)
 * @returns Object with enterprise and midMarket arrays
 */
export function segmentAccounts(
  accounts: Account[],
  threshold: number
): { enterprise: Account[]; midMarket: Account[] } {
  const enterprise: Account[] = [];
  const midMarket: Account[] = [];

  for (const account of accounts) {
    if (segmentAccount(account, threshold) === 'Enterprise') {
      enterprise.push(account);
    } else {
      midMarket.push(account);
    }
  }

  return { enterprise, midMarket };
}

/**
 * Calculate threshold range from account data
 * 
 * Returns min and max employee counts rounded to nearest 1,000 for clean slider values.
 * Min is rounded down, max is rounded up.
 * 
 * @param accounts - Array of accounts to analyze
 * @returns Object with min and max threshold values (rounded to nearest 1K)
 */
export function getThresholdRange(
  accounts: Account[]
): { min: number; max: number } {
  if (accounts.length === 0) {
    return { min: 0, max: 0 };
  }

  let min = accounts[0].Num_Employees;
  let max = accounts[0].Num_Employees;

  for (const account of accounts) {
    if (account.Num_Employees < min) {
      min = account.Num_Employees;
    }
    if (account.Num_Employees > max) {
      max = account.Num_Employees;
    }
  }

  // Round min down to nearest 1K, max up to nearest 1K
  return {
    min: Math.floor(min / 1000) * 1000,
    max: Math.ceil(max / 1000) * 1000,
  };
}

/**
 * Round a value to the nearest thousand
 * 
 * @param value - The numeric value to round
 * @returns Value rounded to nearest 1,000
 */
export function roundToNearestThousand(value: number): number {
  return Math.round(value / 1000) * 1000;
}
