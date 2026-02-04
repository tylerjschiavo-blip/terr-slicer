/**
 * Core TypeScript type definitions for Territory Allocation Engine
 * 
 * These types match the data structures defined in DATA.md and INTENT.md
 */

/**
 * Represents a sales representative
 */
export interface Rep {
  /** Rep's full name */
  Rep_Name: string;
  /** Market segment: Enterprise or Mid-Market */
  Segment: 'Enterprise' | 'Mid Market';
  /** Geographic location for geo matching */
  Location: string;
}

/**
 * Represents a customer account
 */
export interface Account {
  /** Unique account identifier */
  Account_ID: string;
  /** Account company name */
  Account_Name: string;
  /** Original rep assigned to this account (baseline for comparison) */
  Original_Rep: string;
  /** Annual Recurring Revenue */
  ARR: number;
  /** Number of employees at the account */
  Num_Employees: number;
  /** Geographic location for geo matching */
  Location: string;
  /** Risk score (0-100), optional - null if not provided */
  Risk_Score: number | null;
}

/**
 * Configuration for the allocation algorithm
 */
export interface AllocationConfig {
  /** Employee count threshold for segment assignment (≥threshold = Enterprise) */
  threshold: number;
  /** Weight for ARR balance (0-100, percentage) */
  arrWeight: number;
  /** Weight for account count balance (0-100, percentage) */
  accountWeight: number;
  /** Weight for risk distribution balance (0-100, percentage) */
  riskWeight: number;
  /** Geographic match bonus multiplier (0.00-0.10) */
  geoMatchBonus: number;
  /** Preserve existing rep relationship bonus multiplier (0.00-0.10) */
  preserveBonus: number;
  /** High-risk threshold for risk_score classification (0-100) */
  highRiskThreshold: number;
}

/**
 * Fairness metrics for evaluating allocation quality
 */
export interface FairnessMetrics {
  /** ARR distribution fairness score (0-100, null if undefined) */
  arrFairness: number | null;
  /** Account count distribution fairness score (0-100, null if undefined) */
  accountFairness: number | null;
  /** Risk distribution fairness score (0-100, null if undefined) */
  riskFairness: number | null;
  /** Custom composite fairness using user's balance weights (0-100, null if undefined) */
  customComposite: number | null;
  /** Balanced composite fairness using equal weights 33/33/33 (0-100, null if undefined) */
  balancedComposite: number | null;
}

/**
 * Result of allocating a single account to a rep
 */
export interface AllocationResult {
  /** Account identifier */
  accountId: string;
  /** Assigned rep name */
  assignedRep: string;
  /** Segment assignment (Enterprise or Mid-Market) */
  segment: 'Enterprise' | 'Mid Market';
  /** Blended need score (balance component) */
  blendedScore: number;
  /** Geographic match bonus applied */
  geoBonus: number;
  /** Preserve relationship bonus applied */
  preserveBonus: number;
  /** Total score (blended + bonuses) */
  totalScore: number;
}

/**
 * Represents a single step in the audit trail
 */
export interface AuditStep {
  /** The account being allocated */
  account: Account;
  /** Segment assignment for this account */
  segment: 'Enterprise' | 'Mid Market';
  /** Array of eligible rep names for this account's segment */
  eligibleReps: string[];
  /** Winning rep name */
  winner: string;
  /** Explanation of why this rep won */
  reasoning: string;
  /** Index in the allocation order (0-based) - used to determine which accounts were allocated before this one */
  allocationIndex: number;
}

/**
 * Data point for sensitivity analysis chart
 */
export interface SensitivityDataPoint {
  /** Threshold value for this data point */
  threshold: number;
  /** Balanced fairness score at this threshold (33/33/33 weights) */
  balancedFairness: number;
  /** Custom fairness score at this threshold (user's weights) */
  customFairness: number;
  /** Deal size ratio as string (e.g., "2.5:1" for Enterprise:Mid-Market) */
  dealSizeRatio: string;
}
