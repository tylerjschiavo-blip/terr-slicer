/**
 * Data validation functions for business rules
 * 
 * Validates Rep and Account data for:
 * - Duplicate detection (Rep_Names, Account_IDs)
 * - Invalid data ranges (ARR, Num_Employees, Risk_Score)
 * - Data consistency (orphan reps, location format)
 */

import type { Rep, Account } from '@/types';

/**
 * Validation error or warning
 */
export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  row?: number;
  column?: string;
  value?: string;
}

/**
 * Result of validation
 */
export interface ValidationResult {
  /** Hard errors that block processing */
  errors: ValidationIssue[];
  /** Soft warnings that don't block processing */
  warnings: ValidationIssue[];
  /** Whether validation passed (no hard errors) */
  isValid: boolean;
}

/**
 * Validate Reps data
 * 
 * Checks for:
 * - Duplicate Rep_Names (hard error)
 * - Invalid Segments (hard error - should be caught by parser)
 * 
 * @param reps - Array of Rep objects to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateRepsData(reps: Rep[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (reps.length === 0) {
    errors.push({
      type: 'error',
      message: 'No reps found in CSV file'
    });
    return { errors, warnings, isValid: false };
  }

  // Check for duplicate Rep_Names
  const repNameCounts = new Map<string, number[]>();
  reps.forEach((rep, index) => {
    const normalizedName = rep.Rep_Name.toLowerCase().trim();
    if (!repNameCounts.has(normalizedName)) {
      repNameCounts.set(normalizedName, []);
    }
    repNameCounts.get(normalizedName)!.push(index + 2); // +2 for header row and 0-based index
  });

  // Report duplicates
  repNameCounts.forEach((rows, name) => {
    if (rows.length > 1) {
      errors.push({
        type: 'error',
        message: `Duplicate Rep_Name "${name}" found in rows: ${rows.join(', ')}`,
        column: 'Rep_Name',
        value: name
      });
    }
  });

  // Validate Segment values (defensive check, should be caught by parser)
  reps.forEach((rep, index) => {
    if (rep.Segment !== 'Enterprise' && rep.Segment !== 'Mid Market') {
      errors.push({
        type: 'error',
        message: `Invalid Segment value: "${rep.Segment}". Must be "Enterprise" or "Mid Market"`,
        row: index + 2,
        column: 'Segment',
        value: rep.Segment
      });
    }
  });

  // Check for location format inconsistencies (soft warning)
  const locationFormats = new Map<string, string[]>();
  reps.forEach((rep) => {
    const normalized = rep.Location.toLowerCase().trim();
    if (!locationFormats.has(normalized)) {
      locationFormats.set(normalized, []);
    }
    // Track different capitalizations of the same location
    if (!locationFormats.get(normalized)!.includes(rep.Location)) {
      locationFormats.get(normalized)!.push(rep.Location);
    }
  });

  // Warn about inconsistent location formats
  locationFormats.forEach((formats) => {
    if (formats.length > 1) {
      warnings.push({
        type: 'warning',
        message: `Inconsistent location format detected: ${formats.join(', ')}. Geo matching is case-insensitive but uses exact string comparison.`,
        column: 'Location'
      });
    }
  });

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
}

/**
 * Validate Accounts data
 * 
 * Checks for:
 * - Duplicate Account_IDs (hard error)
 * - Invalid ARR values (hard error - should be caught by parser)
 * - Invalid Num_Employees values (hard error - should be caught by parser)
 * - Risk_Score out of range (soft warning)
 * 
 * @param accounts - Array of Account objects to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateAccountsData(accounts: Account[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (accounts.length === 0) {
    errors.push({
      type: 'error',
      message: 'No accounts found in CSV file'
    });
    return { errors, warnings, isValid: false };
  }

  // Check for duplicate Account_IDs
  const accountIdCounts = new Map<string, number[]>();
  accounts.forEach((account, index) => {
    const normalizedId = account.Account_ID.toLowerCase().trim();
    if (!accountIdCounts.has(normalizedId)) {
      accountIdCounts.set(normalizedId, []);
    }
    accountIdCounts.get(normalizedId)!.push(index + 2); // +2 for header row and 0-based index
  });

  // Report duplicates
  accountIdCounts.forEach((rows, id) => {
    if (rows.length > 1) {
      errors.push({
        type: 'error',
        message: `Duplicate Account_ID "${id}" found in rows: ${rows.join(', ')}`,
        column: 'Account_ID',
        value: id
      });
    }
  });

  // Validate numeric ranges (defensive checks, should be caught by parser)
  accounts.forEach((account, index) => {
    const rowNum = index + 2;

    if (account.ARR < 0) {
      errors.push({
        type: 'error',
        message: `ARR must be positive: ${account.ARR}`,
        row: rowNum,
        column: 'ARR',
        value: String(account.ARR)
      });
    }

    if (account.Num_Employees < 0) {
      errors.push({
        type: 'error',
        message: `Num_Employees must be positive: ${account.Num_Employees}`,
        row: rowNum,
        column: 'Num_Employees',
        value: String(account.Num_Employees)
      });
    }

    // Check Risk_Score range (soft warning if out of range)
    if (account.Risk_Score !== null) {
      if (account.Risk_Score < 0 || account.Risk_Score > 100) {
        warnings.push({
          type: 'warning',
          message: `Risk_Score out of expected range (0-100): ${account.Risk_Score}`,
          row: rowNum,
          column: 'Risk_Score',
          value: String(account.Risk_Score)
        });
      }
    }
  });

  // Check for location format inconsistencies (soft warning)
  const locationFormats = new Map<string, string[]>();
  accounts.forEach((account) => {
    const normalized = account.Location.toLowerCase().trim();
    if (!locationFormats.has(normalized)) {
      locationFormats.set(normalized, []);
    }
    // Track different capitalizations of the same location
    if (!locationFormats.get(normalized)!.includes(account.Location)) {
      locationFormats.get(normalized)!.push(account.Location);
    }
  });

  // Warn about inconsistent location formats
  locationFormats.forEach((formats) => {
    if (formats.length > 1) {
      warnings.push({
        type: 'warning',
        message: `Inconsistent location format detected: ${formats.join(', ')}. Geo matching is case-insensitive but uses exact string comparison.`,
        column: 'Location'
      });
    }
  });

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
}

/**
 * Validate data consistency between Reps and Accounts
 * 
 * Checks for:
 * - Orphan reps: reps not referenced in any account's Original_Rep (soft warning)
 * - Missing reps: Original_Rep values not found in Reps list (soft warning)
 * 
 * @param reps - Array of Rep objects
 * @param accounts - Array of Account objects
 * @returns ValidationResult with errors and warnings
 */
export function validateDataConsistency(reps: Rep[], accounts: Account[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Create set of rep names (case-insensitive)
  const repNames = new Set(reps.map(rep => rep.Rep_Name.toLowerCase().trim()));

  // Track which reps are referenced in accounts
  const referencedReps = new Set<string>();

  // Check for missing reps in accounts
  accounts.forEach((account, index) => {
    const normalizedOriginalRep = account.Original_Rep.toLowerCase().trim();
    referencedReps.add(normalizedOriginalRep);

    if (!repNames.has(normalizedOriginalRep)) {
      warnings.push({
        type: 'warning',
        message: `Account "${account.Account_Name}" references Original_Rep "${account.Original_Rep}" which is not found in Reps list`,
        row: index + 2,
        column: 'Original_Rep',
        value: account.Original_Rep
      });
    }
  });

  // Check for orphan reps (reps not referenced in any account)
  const orphanReps: string[] = [];
  reps.forEach((rep) => {
    const normalizedRepName = rep.Rep_Name.toLowerCase().trim();
    if (!referencedReps.has(normalizedRepName)) {
      orphanReps.push(rep.Rep_Name);
    }
  });

  if (orphanReps.length > 0) {
    warnings.push({
      type: 'warning',
      message: `${orphanReps.length} rep(s) not referenced in any account: ${orphanReps.join(', ')}. These reps will not receive any accounts in the allocation.`,
      column: 'Rep_Name'
    });
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
}
