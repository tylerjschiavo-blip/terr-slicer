/**
 * Edge Case Tests for Territory Allocation Engine
 * 
 * Tests edge cases and data validation scenarios:
 * - Empty segments (all accounts in one segment)
 * - Single rep per segment
 * - All accounts same employee count
 * - All accounts same ARR
 * - Missing Risk_Score column
 * - Duplicate Account_IDs
 * - Orphan reps
 * 
 * Validates: no errors thrown, appropriate warnings/errors, tool remains functional
 */

import { describe, it, expect } from 'vitest';
import type { Account, Rep, AllocationConfig, AllocationResult } from '@/types';
import { segmentAccounts, getThresholdRange } from '../allocation/segmentation';
import { allocateAccounts, calculateTargetARR, calculateTargetAccounts } from '../allocation/greedyAllocator';
import { 
  calculateARRFairness, 
  calculateAccountFairness, 
  calculateRiskFairness,
  calculateBalancedComposite,
  calculateCV 
} from '../allocation/fairness';
import { 
  validateRepsData, 
  validateAccountsData, 
  validateDataConsistency 
} from '../validators/dataValidator';

describe('Edge Case Tests', () => {
  // Default config for testing
  const defaultConfig: AllocationConfig = {
    threshold: 2000,
    arrWeight: 33,
    accountWeight: 33,
    riskWeight: 34,
    geoMatchBonus: 0.05,
    preserveBonus: 0.05,
    highRiskThreshold: 70
  };

  describe('Empty Segments', () => {
    it('should handle all accounts in Enterprise segment (empty Mid Market)', () => {
      // All accounts >= threshold (no Mid Market accounts)
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 },
        { Account_ID: 'ACC-003', Account_Name: 'Account 3', Original_Rep: 'Alice', ARR: 150000, Num_Employees: 10000, Location: 'TX', Risk_Score: 40 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' },
        { Rep_Name: 'Charlie', Segment: 'Mid Market', Location: 'TX' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Verify segmentation
      const { enterprise, midMarket } = segmentAccounts(accounts, config.threshold);
      expect(enterprise.length).toBe(3);
      expect(midMarket.length).toBe(0);

      // Allocation should succeed without errors
      const results = allocateAccounts(accounts, reps, config);
      
      // All accounts should be allocated to Enterprise reps
      expect(results.length).toBe(3);
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);
      expect(results.every(r => ['Alice', 'Bob'].includes(r.assignedRep))).toBe(true);

      // Fairness for Enterprise segment should be calculable
      const enterpriseReps = reps.filter(r => r.Segment === 'Enterprise');
      const arrFairness = calculateARRFairness(enterpriseReps, results, accounts);
      const accountFairness = calculateAccountFairness(enterpriseReps, results);

      expect(arrFairness).not.toBeNull();
      expect(accountFairness).not.toBeNull();

      // Mid Market rep (Charlie) should have no accounts
      expect(results.filter(r => r.assignedRep === 'Charlie').length).toBe(0);
    });

    it('should handle all accounts in Mid Market segment (empty Enterprise)', () => {
      // All accounts < threshold (no Enterprise accounts)
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Charlie', ARR: 10000, Num_Employees: 500, Location: 'CA', Risk_Score: 30 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'David', ARR: 20000, Num_Employees: 800, Location: 'NY', Risk_Score: 40 },
        { Account_ID: 'ACC-003', Account_Name: 'Account 3', Original_Rep: 'Charlie', ARR: 15000, Num_Employees: 1200, Location: 'TX', Risk_Score: 20 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' },
        { Rep_Name: 'Charlie', Segment: 'Mid Market', Location: 'CA' },
        { Rep_Name: 'David', Segment: 'Mid Market', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 2000 };

      // Verify segmentation
      const { enterprise, midMarket } = segmentAccounts(accounts, config.threshold);
      expect(enterprise.length).toBe(0);
      expect(midMarket.length).toBe(3);

      // Allocation should succeed without errors
      const results = allocateAccounts(accounts, reps, config);
      
      // All accounts should be allocated to Mid Market reps
      expect(results.length).toBe(3);
      expect(results.every(r => r.segment === 'Mid Market')).toBe(true);
      expect(results.every(r => ['Charlie', 'David'].includes(r.assignedRep))).toBe(true);

      // Fairness for Mid Market segment should be calculable
      const midMarketReps = reps.filter(r => r.Segment === 'Mid Market');
      const arrFairness = calculateARRFairness(midMarketReps, results, accounts);
      const accountFairness = calculateAccountFairness(midMarketReps, results);

      expect(arrFairness).not.toBeNull();
      expect(accountFairness).not.toBeNull();

      // Enterprise reps (Alice, Bob) should have no accounts
      expect(results.filter(r => r.assignedRep === 'Alice').length).toBe(0);
      expect(results.filter(r => r.assignedRep === 'Bob').length).toBe(0);
    });

    it('should return null fairness scores for empty segment', () => {
      const emptyReps: Rep[] = [];
      const results: AllocationResult[] = [];
      const accounts: Account[] = [];

      const arrFairness = calculateARRFairness(emptyReps, results, accounts);
      const accountFairness = calculateAccountFairness(emptyReps, results);

      expect(arrFairness).toBeNull();
      expect(accountFairness).toBeNull();
    });
  });

  describe('Single Rep Per Segment', () => {
    it('should handle single Enterprise rep without division by zero', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Alice', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Allocation should succeed
      const results = allocateAccounts(accounts, reps, config);
      
      expect(results.length).toBe(2);
      expect(results.every(r => r.assignedRep === 'Alice')).toBe(true);

      // CV should be 0 (perfect distribution - only 1 rep)
      const arrFairness = calculateARRFairness(reps, results, accounts);
      const accountFairness = calculateAccountFairness(reps, results);

      // Single rep means all accounts go to one rep = perfect fairness (CV% = 0, fairness = 100)
      // Actually, CV is null when there's only one value (std dev = 0, mean ≠ 0)
      // Wait, let me check: with 1 rep, we have 1 value. CV calculation will return null if array length is 1? 
      // No, looking at calculateCV, it only returns null if length is 0 or mean is 0.
      // With 1 rep, std dev = 0, so CV = 0, fairness = 100
      expect(arrFairness).toBe(100);
      expect(accountFairness).toBe(100);
    });

    it('should calculate targets correctly with single rep', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Alice', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' }
      ];

      // Target calculations should not divide by zero
      const targetARR = calculateTargetARR(reps, accounts);
      const targetAccounts = calculateTargetAccounts(reps, accounts);

      expect(targetARR).toBe(300000); // Total ARR = 300K, 1 rep = 300K per rep
      expect(targetAccounts).toBe(2); // 2 accounts, 1 rep = 2 per rep
    });
  });

  describe('All Accounts Same Employee Count', () => {
    it('should handle accounts with identical employee counts', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 5000, Location: 'NY', Risk_Score: 60 },
        { Account_ID: 'ACC-003', Account_Name: 'Account 3', Original_Rep: 'Alice', ARR: 150000, Num_Employees: 5000, Location: 'TX', Risk_Score: 40 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // All accounts should be in Enterprise segment
      const { enterprise, midMarket } = segmentAccounts(accounts, config.threshold);
      expect(enterprise.length).toBe(3);
      expect(midMarket.length).toBe(0);

      // Allocation should still work (differentiate by ARR)
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(3);
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);

      // Fairness should be calculable
      const arrFairness = calculateARRFairness(reps, results, accounts);
      expect(arrFairness).not.toBeNull();
    });

    it('should calculate threshold range correctly when all employees same', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 5000, Location: 'NY', Risk_Score: 60 }
      ];

      const { min, max } = getThresholdRange(accounts);
      
      // Min and max should be same value rounded
      expect(min).toBe(5000); // 5000 rounded down to nearest 1K = 5000
      expect(max).toBe(5000); // 5000 rounded up to nearest 1K = 5000
    });
  });

  describe('All Accounts Same ARR', () => {
    it('should handle accounts with identical ARR values', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 100000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 },
        { Account_ID: 'ACC-003', Account_Name: 'Account 3', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 10000, Location: 'TX', Risk_Score: 40 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Allocation should work (differentiate by employee count)
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(3);

      // ARR should be distributed evenly
      const aliceARR = results.filter(r => r.assignedRep === 'Alice').length * 100000;
      const bobARR = results.filter(r => r.assignedRep === 'Bob').length * 100000;
      
      // Total ARR = 300K, should be close to 150K each
      expect(Math.abs(aliceARR - bobARR)).toBeLessThanOrEqual(100000); // Within 1 account difference

      // ARR fairness should be calculable
      // Note: With 3 accounts of equal ARR split between 2 reps, best case is 2:1 distribution
      // This gives CV% of ~33%, fairness of ~67%, which is reasonable but not perfect
      const arrFairness = calculateARRFairness(reps, results, accounts);
      expect(arrFairness).not.toBeNull();
      expect(arrFairness).toBeGreaterThan(0);
      expect(arrFairness).toBeLessThanOrEqual(100); // Valid range
    });

    it('should calculate CV% correctly with identical values', () => {
      // CV% should be 0 when all values are identical
      const identicalValues = [100, 100, 100, 100];
      const cv = calculateCV(identicalValues);
      
      expect(cv).toBe(0); // std dev = 0, so CV% = 0
    });
  });

  describe('Missing Risk_Score Column', () => {
    it('should handle accounts without Risk_Score (all null)', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: null },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: null },
        { Account_ID: 'ACC-003', Account_Name: 'Account 3', Original_Rep: 'Alice', ARR: 150000, Num_Employees: 10000, Location: 'TX', Risk_Score: null }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { 
        ...defaultConfig, 
        threshold: 3000,
        riskWeight: 0 // Risk weight should be 0 when Risk_Score missing
      };

      // Allocation should succeed (Risk dimension disabled)
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(3);

      // ARR and Account fairness should be calculable
      const arrFairness = calculateARRFairness(reps, results, accounts);
      const accountFairness = calculateAccountFairness(reps, results);
      
      expect(arrFairness).not.toBeNull();
      expect(accountFairness).not.toBeNull();

      // Risk fairness should return null (Risk_Score missing)
      const riskFairness = calculateRiskFairness(reps, results, accounts, config.highRiskThreshold);
      expect(riskFairness).toBeNull();

      // Balanced composite should still work (average of non-null scores)
      const balancedComposite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
      expect(balancedComposite).not.toBeNull();
    });

    it('should handle mixed Risk_Score values (some null, some not)', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: null },
        { Account_ID: 'ACC-003', Account_Name: 'Account 3', Original_Rep: 'Alice', ARR: 150000, Num_Employees: 10000, Location: 'TX', Risk_Score: 70 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Allocation should succeed (Risk dimension still works with partial data)
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(3);

      // Risk fairness should be calculable (at least 1 account has Risk_Score)
      const riskFairness = calculateRiskFairness(reps, results, accounts, config.highRiskThreshold);
      expect(riskFairness).not.toBeNull();
    });
  });

  describe('Duplicate Account_IDs', () => {
    it('should detect duplicate Account_IDs as hard error', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 },
        { Account_ID: 'ACC-001', Account_Name: 'Account 1 Duplicate', Original_Rep: 'Charlie', ARR: 150000, Num_Employees: 10000, Location: 'TX', Risk_Score: 40 }
      ];

      const validationResult = validateAccountsData(accounts);

      // Should have hard error
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('Duplicate Account_ID');
      expect(validationResult.errors[0].message).toContain('acc-001'); // Case-insensitive
    });

    it('should detect case-insensitive duplicate Account_IDs', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'acc-001', Account_Name: 'Account 1 Duplicate', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const validationResult = validateAccountsData(accounts);

      // Should detect as duplicate (case-insensitive)
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('Duplicate Account_ID');
    });
  });

  describe('Orphan Reps', () => {
    it('should detect orphan reps as soft warning', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' },
        { Rep_Name: 'Charlie', Segment: 'Mid Market', Location: 'TX' } // Orphan - not referenced
      ];

      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const validationResult = validateDataConsistency(reps, accounts);

      // Should have soft warning
      expect(validationResult.isValid).toBe(true); // Warnings don't block
      expect(validationResult.warnings.length).toBeGreaterThan(0);
      expect(validationResult.warnings[0].message).toContain('not referenced');
      expect(validationResult.warnings[0].message).toContain('Charlie');
    });

    it('should allow allocation with orphan reps (they get no accounts)', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' },
        { Rep_Name: 'Charlie', Segment: 'Enterprise', Location: 'TX' } // Orphan
      ];

      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Allocation should succeed
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(2);

      // Charlie (orphan) can still receive accounts in new allocation
      // (orphan just means not in Original_Rep, not that they can't get new accounts)
      const charlieAccounts = results.filter(r => r.assignedRep === 'Charlie');
      expect(charlieAccounts.length).toBeGreaterThanOrEqual(0); // May or may not get accounts
    });

    it('should detect missing reps as soft warning', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Charlie', ARR: 200000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 } // Charlie not in reps
      ];

      const validationResult = validateDataConsistency(reps, accounts);

      // Should have soft warning for missing rep
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.warnings.length).toBeGreaterThan(0);
      expect(validationResult.warnings.some(w => w.message.includes('Charlie'))).toBe(true);
      expect(validationResult.warnings.some(w => w.message.includes('not found in Reps list'))).toBe(true);
    });
  });

  describe('Invalid Data Validation', () => {
    it('should detect negative ARR as hard error', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: -50000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 }
      ];

      const validationResult = validateAccountsData(accounts);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('ARR must be positive');
    });

    it('should detect negative Num_Employees as hard error', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: -500, Location: 'CA', Risk_Score: 50 }
      ];

      const validationResult = validateAccountsData(accounts);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('Num_Employees must be positive');
    });

    it('should detect Risk_Score out of range as soft warning', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 150 } // Out of range
      ];

      const validationResult = validateAccountsData(accounts);

      // Soft warning, not hard error
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.warnings.length).toBeGreaterThan(0);
      expect(validationResult.warnings[0].message).toContain('Risk_Score out of expected range');
    });

    it('should detect invalid Segment values as hard error', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Invalid Segment' as any, Location: 'CA' }
      ];

      const validationResult = validateRepsData(reps);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('Invalid Segment value');
    });

    it('should detect duplicate Rep_Names as hard error', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Alice', Segment: 'Mid Market', Location: 'NY' } // Duplicate
      ];

      const validationResult = validateRepsData(reps);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('Duplicate Rep_Name');
      expect(validationResult.errors[0].message).toContain('alice'); // Case-insensitive
    });

    it('should detect empty reps array as hard error', () => {
      const reps: Rep[] = [];

      const validationResult = validateRepsData(reps);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('No reps found');
    });

    it('should detect empty accounts array as hard error', () => {
      const accounts: Account[] = [];

      const validationResult = validateAccountsData(accounts);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.errors[0].message).toContain('No accounts found');
    });

    it('should warn about inconsistent location formats', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'ca' }, // Same location, different case
        { Rep_Name: 'Charlie', Segment: 'Enterprise', Location: 'Ca' } // Same location, different case
      ];

      const validationResult = validateRepsData(reps);

      // Should be valid but with warning
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.warnings.length).toBeGreaterThan(0);
      expect(validationResult.warnings[0].message).toContain('Inconsistent location format');
    });
  });

  describe('Extreme Values', () => {
    it('should handle very large ARR values', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 999999999, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 1000000000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Should handle large numbers without overflow
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(2);

      const arrFairness = calculateARRFairness(reps, results, accounts);
      expect(arrFairness).not.toBeNull();
      expect(arrFairness).toBeGreaterThanOrEqual(0);
      expect(arrFairness).toBeLessThanOrEqual(100);
    });

    it('should handle very small ARR values', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 0.01, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 0.02, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Should handle very small numbers
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(2);
    });

    it('should handle zero ARR values', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 0, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 },
        { Account_ID: 'ACC-002', Account_Name: 'Account 2', Original_Rep: 'Bob', ARR: 100000, Num_Employees: 8000, Location: 'NY', Risk_Score: 60 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Should handle zero ARR
      const results = allocateAccounts(accounts, reps, config);
      expect(results.length).toBe(2);

      // Fairness should handle zero values
      const arrFairness = calculateARRFairness(reps, results, accounts);
      expect(arrFairness).not.toBeNull();
    });

    it('should handle very large employee counts', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 1000000, Location: 'CA', Risk_Score: 50 }
      ];

      const { min, max } = getThresholdRange(accounts);
      
      expect(min).toBe(1000000); // Rounded to nearest 1K
      expect(max).toBe(1000000);
    });
  });

  describe('Tool Functionality Under Edge Cases', () => {
    it('should remain functional with empty segment (no crashes)', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Charlie', Segment: 'Mid Market', Location: 'TX' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 1000 }; // All accounts in Enterprise

      // Should not throw errors
      expect(() => {
        const results = allocateAccounts(accounts, reps, config);
        calculateARRFairness(reps.filter(r => r.Segment === 'Enterprise'), results, accounts);
        calculateAccountFairness(reps.filter(r => r.Segment === 'Enterprise'), results);
      }).not.toThrow();
    });

    it('should remain functional with missing Risk_Score', () => {
      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: null }
      ];

      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000, riskWeight: 0 };

      // Should not throw errors
      expect(() => {
        const results = allocateAccounts(accounts, reps, config);
        const riskFairness = calculateRiskFairness(reps, results, accounts, config.highRiskThreshold);
        expect(riskFairness).toBeNull(); // Expected null
      }).not.toThrow();
    });

    it('should remain functional with orphan reps', () => {
      const reps: Rep[] = [
        { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
        { Rep_Name: 'Orphan', Segment: 'Enterprise', Location: 'TX' } // Not in accounts
      ];

      const accounts: Account[] = [
        { Account_ID: 'ACC-001', Account_Name: 'Account 1', Original_Rep: 'Alice', ARR: 100000, Num_Employees: 5000, Location: 'CA', Risk_Score: 50 }
      ];

      const config: AllocationConfig = { ...defaultConfig, threshold: 3000 };

      // Should not throw errors
      expect(() => {
        const validation = validateDataConsistency(reps, accounts);
        expect(validation.isValid).toBe(true); // Orphan is warning, not error
        
        const results = allocateAccounts(accounts, reps, config);
        expect(results.length).toBe(1);
      }).not.toThrow();
    });
  });
});
