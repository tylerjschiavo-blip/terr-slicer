/**
 * Core TypeScript interfaces for Territory Slicer application
 */

/**
 * Represents a sales representative with their targets and attributes
 */
export interface Rep {
  /** Unique identifier for the rep */
  id: string;
  /** Rep's full name */
  name: string;
  /** Market segment the rep covers (e.g., 'Enterprise', 'Mid-Market', 'SMB') */
  segment: string;
  /** Annual Recurring Revenue target for the rep */
  arr_target: number;
  /** Target number of accounts to manage */
  accounts_target: number;
  /** Target risk score threshold */
  risk_target: number;
  /** Geographic region assigned to the rep */
  geo_region: string;
}

/**
 * Represents a customer account with its attributes and assignments
 */
export interface Account {
  /** Unique identifier for the account */
  id: string;
  /** Account company name */
  name: string;
  /** Annual Recurring Revenue from this account */
  arr: number;
  /** Number of employees at the account */
  employees: number;
  /** Market segment classification */
  segment: string;
  /** Original rep assigned to this account */
  original_rep: string;
  /** Currently assigned rep (may differ from original after reallocation) */
  assigned_rep: string;
  /** Geographic region of the account */
  geo_region: string;
  /** Risk score indicating likelihood of churn or issues */
  risk_score: number;
}

/**
 * Fairness metrics for evaluating allocation quality
 */
export interface FairnessMetrics {
  /** Coefficient of Variation for ARR distribution across reps */
  cv_arr: number;
  /** Coefficient of Variation for account count distribution across reps */
  cv_accounts: number;
  /** Coefficient of Variation for risk score distribution across reps */
  cv_risk: number;
  /** Custom fairness score (user-defined calculation) */
  custom_score: number;
  /** Balanced composite score combining multiple metrics */
  balanced_score: number;
}

/**
 * Complete allocation result with accounts, reps, and fairness metrics
 */
export interface Allocation {
  /** Array of accounts with their assignments */
  accounts: Account[];
  /** Array of reps with their targets */
  reps: Rep[];
  /** Fairness metrics for this allocation */
  fairness_metrics: FairnessMetrics;
}
