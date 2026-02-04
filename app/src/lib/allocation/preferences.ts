/**
 * Preference Bonus System for Territory Allocation
 * 
 * Implements geographic matching and rep preservation bonuses that modify
 * blended scores using sign-aware multipliers.
 */

import type { Account, Rep } from '../../types';

/**
 * Check if account and rep locations match exactly (case-insensitive)
 * 
 * @param accountLocation - Account's location string
 * @param repLocation - Rep's location string
 * @returns True if locations match exactly (case-insensitive), false otherwise
 * 
 * @example
 * geoMatch("CA", "ca") // true - case insensitive
 * geoMatch("California", "CA") // false - exact string match required
 */
export function geoMatch(accountLocation: string, repLocation: string): boolean {
  return accountLocation.trim().toLowerCase() === repLocation.trim().toLowerCase();
}

/**
 * Calculate geographic match bonus for an account-rep pair
 * 
 * Returns the configured geoMatchBonus if account and rep locations match exactly
 * (case-insensitive string comparison), otherwise returns 0.
 * 
 * @param account - Account to evaluate
 * @param rep - Rep to evaluate
 * @param geoMatchBonus - Configured geo match bonus (0.00-0.10)
 * @returns geoMatchBonus if locations match, 0 otherwise
 */
export function calculateGeoBonus(
  account: Account,
  rep: Rep,
  geoMatchBonus: number
): number {
  if (geoMatch(account.Location, rep.Location)) {
    return geoMatchBonus;
  }
  return 0;
}

/**
 * Calculate preserve relationship bonus for an account-rep pair
 * 
 * Returns the configured preserveBonus if the account's Original_Rep matches
 * the rep's Rep_Name (exact match), otherwise returns 0.
 * 
 * @param account - Account to evaluate
 * @param rep - Rep to evaluate
 * @param preserveBonus - Configured preserve bonus (0.00-0.10)
 * @returns preserveBonus if Original_Rep matches rep name, 0 otherwise
 */
export function calculatePreserveBonus(
  account: Account,
  rep: Rep,
  preserveBonus: number
): number {
  if (account.Original_Rep === rep.Rep_Name) {
    return preserveBonus;
  }
  return 0;
}

/**
 * Apply preference bonuses to blended score using sign-aware multiplier
 * 
 * The sign-aware multiplier ensures bonuses work correctly in both directions:
 * - Positive blended scores (rep under target): bonuses INCREASE priority
 *   Formula: blendedScore * (1 + geoBonus + preserveBonus)
 *   Example: 0.5 * (1 + 0.05 + 0.05) = 0.55 (higher priority)
 * 
 * - Negative blended scores (rep over target): bonuses REDUCE penalty
 *   Formula: blendedScore * (1 - geoBonus - preserveBonus)
 *   Example: -0.3 * (1 - 0.05 - 0.05) = -0.27 (less negative = higher priority)
 * 
 * This ensures that preference bonuses always increase the rep's priority,
 * regardless of whether they're under or over target.
 * 
 * @param blendedScore - Base blended need score (positive = under target, negative = over target)
 * @param geoBonus - Geographic match bonus (0.00-0.10)
 * @param preserveBonus - Preserve relationship bonus (0.00-0.10)
 * @returns Total score with bonuses applied
 */
export function applyPreferenceBonuses(
  blendedScore: number,
  geoBonus: number,
  preserveBonus: number
): number {
  if (blendedScore >= 0) {
    // Positive score (under target): bonuses increase priority
    return blendedScore * (1 + geoBonus + preserveBonus);
  } else {
    // Negative score (over target): bonuses reduce penalty
    return blendedScore * (1 - geoBonus - preserveBonus);
  }
}
