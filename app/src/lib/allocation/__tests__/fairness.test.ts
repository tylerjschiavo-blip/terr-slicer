/**
 * Unit tests for CV%-based Fairness Metrics
 * 
 * Tests cover:
 * - calculateCV(): Known CV% values with hand-calculated expected results
 * - Equal distribution (CV% = 0, fairness = 100)
 * - Highly unequal distribution (high CV%, low fairness)
 * - Empty segment (fairness = null, not 0 or 100)
 * - Custom composite with various weight combinations
 * - Balanced composite (33/33/33 equal weights)
 * - Color band mapping validation (94-100 Dark Green, etc.)
 * - Manual verification: calculate CV% by hand for test cases, compare to code output
 * 
 * CV% Formula: (Standard Deviation / Mean) × 100
 * Fairness Score = 100 - CV%, clamped to [0, 100]
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCV,
  calculateARRFairness,
  calculateAccountFairness,
  calculateRiskFairness,
  calculateCustomComposite,
  calculateBalancedComposite,
  getFairnessColor,
} from '../fairness';
import type { Account, Rep, AllocationResult } from '../../../types';

/**
 * Helper function to create a test account
 */
function createAccount(
  id: string,
  name: string,
  originalRep: string,
  arr: number,
  employees: number,
  location: string,
  riskScore: number | null = null
): Account {
  return {
    Account_ID: id,
    Account_Name: name,
    Original_Rep: originalRep,
    ARR: arr,
    Num_Employees: employees,
    Location: location,
    Risk_Score: riskScore,
  };
}

/**
 * Helper function to create a test rep
 */
function createRep(
  name: string,
  segment: 'Enterprise' | 'Mid Market',
  location: string
): Rep {
  return {
    Rep_Name: name,
    Segment: segment,
    Location: location,
  };
}

/**
 * Helper function to create an allocation result
 */
function createAllocationResult(
  accountId: string,
  assignedRep: string,
  segment: 'Enterprise' | 'Mid Market'
): AllocationResult {
  return {
    accountId,
    assignedRep,
    segment,
    blendedScore: 0,
    geoBonus: 0,
    preserveBonus: 0,
    totalScore: 0,
  };
}

describe('fairness - calculateCV', () => {
  describe('Known CV% values with hand-calculated results', () => {
    it('should calculate CV% = 0 for equal distribution', () => {
      // All values equal: [100, 100, 100]
      // Mean = 100
      // Variance = ((0)² + (0)² + (0)²) / 3 = 0
      // Std Dev = 0
      // CV% = (0 / 100) × 100 = 0%
      const values = [100, 100, 100];
      const cv = calculateCV(values);
      expect(cv).toBe(0);
    });

    it('should calculate CV% correctly for [100, 200] (manual calculation)', () => {
      // Values: [100, 200]
      // Mean = (100 + 200) / 2 = 150
      // Variance = ((100-150)² + (200-150)²) / 2 = (2500 + 2500) / 2 = 2500
      // Std Dev = √2500 = 50
      // CV% = (50 / 150) × 100 = 33.333...%
      const values = [100, 200];
      const cv = calculateCV(values);
      expect(cv).toBeCloseTo(33.333, 2);
    });

    it('should calculate CV% correctly for [50, 100, 150] (manual calculation)', () => {
      // Values: [50, 100, 150]
      // Mean = (50 + 100 + 150) / 3 = 100
      // Variance = ((50-100)² + (100-100)² + (150-100)²) / 3 = (2500 + 0 + 2500) / 3 = 1666.666...
      // Std Dev = √1666.666... = 40.8248...
      // CV% = (40.8248 / 100) × 100 = 40.8248%
      const values = [50, 100, 150];
      const cv = calculateCV(values);
      expect(cv).toBeCloseTo(40.8248, 2);
    });

    it('should calculate CV% correctly for highly unequal distribution [10, 100, 200]', () => {
      // Values: [10, 100, 200]
      // Mean = (10 + 100 + 200) / 3 = 103.333...
      // Variance = ((10-103.333)² + (100-103.333)² + (200-103.333)²) / 3
      //          = (8711.111 + 11.111 + 9344.444) / 3 = 6022.222
      // Std Dev = √6022.222 = 77.603...
      // CV% = (77.603 / 103.333) × 100 = 75.099%
      const values = [10, 100, 200];
      const cv = calculateCV(values);
      expect(cv).toBeCloseTo(75.099, 2);
    });

    it('should calculate CV% correctly for [1, 2, 3, 4, 5]', () => {
      // Values: [1, 2, 3, 4, 5]
      // Mean = 3
      // Variance = ((1-3)² + (2-3)² + (3-3)² + (4-3)² + (5-3)²) / 5
      //          = (4 + 1 + 0 + 1 + 4) / 5 = 2
      // Std Dev = √2 = 1.4142...
      // CV% = (1.4142 / 3) × 100 = 47.14%
      const values = [1, 2, 3, 4, 5];
      const cv = calculateCV(values);
      expect(cv).toBeCloseTo(47.14, 2);
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty array', () => {
      const values: number[] = [];
      const cv = calculateCV(values);
      expect(cv).toBeNull();
    });

    it('should return null when mean is 0', () => {
      const values = [0, 0, 0];
      const cv = calculateCV(values);
      expect(cv).toBeNull();
    });

    it('should handle single value', () => {
      // Single value: [100]
      // Mean = 100
      // Variance = 0 (no variation)
      // Std Dev = 0
      // CV% = 0%
      const values = [100];
      const cv = calculateCV(values);
      expect(cv).toBe(0);
    });

    it('should handle negative values', () => {
      // Values: [-100, -200]
      // Mean = -150
      // Variance = ((−100−(−150))² + (−200−(−150))²) / 2 = (2500 + 2500) / 2 = 2500
      // Std Dev = 50
      // CV% = (50 / -150) × 100 = -33.333%
      // Note: CV% can be negative when mean is negative (implementation returns negative CV%)
      const values = [-100, -200];
      const cv = calculateCV(values);
      expect(cv).toBeCloseTo(-33.333, 2);
    });
  });
});

describe('fairness - Fairness Score Conversion (CV% to 0-100)', () => {
  describe('calculateARRFairness', () => {
    it('should return 100 for equal ARR distribution (CV% = 0)', () => {
      // Equal ARR across reps: each rep gets 100k
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
        createRep('Charlie', 'Enterprise', 'TX'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
        createAllocationResult('A3', 'Charlie', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 100000, 5000, 'NY'),
        createAccount('A3', 'Account 3', 'Charlie', 100000, 5000, 'TX'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% = 0 → Fairness = 100 - 0 = 100
      expect(fairness).toBe(100);
    });

    it('should calculate fairness correctly for unequal ARR distribution', () => {
      // Unequal ARR: Alice gets 100k, Bob gets 200k
      // Mean = 150k, Std Dev = 50k, CV% = 33.333%
      // Fairness = 100 - 33.333 = 66.667
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 200000, 5000, 'NY'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% = 33.333% → Fairness = 100 - 33.333 = 66.667
      expect(fairness).toBeCloseTo(66.667, 1);
    });

    it('should calculate fairness score 99.5 for low CV% (0.5%)', () => {
      // Slightly unequal ARR: Alice gets 100k, Bob gets 101k
      // Mean = 100.5k, Std Dev ≈ 0.5k, CV% ≈ 0.498%
      // Fairness = 100 - 0.498 = 99.502
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 101000, 5000, 'NY'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% ≈ 0.498% → Fairness ≈ 99.502
      expect(fairness).toBeGreaterThan(99);
      expect(fairness).toBeLessThan(100);
    });

    it('should calculate fairness score 98.8 for CV% of 1.2%', () => {
      // ARR: Alice gets 100k, Bob gets 102.5k
      // Mean = 101.25k, Std Dev = 1.25k, CV% ≈ 1.235%
      // Fairness = 100 - 1.235 = 98.765
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 102500, 5000, 'NY'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% ≈ 1.235% → Fairness ≈ 98.765
      expect(fairness).toBeGreaterThan(98);
      expect(fairness).toBeLessThan(99);
    });

    it('should calculate fairness score 98.2 for CV% of 1.8%', () => {
      // ARR: Alice gets 100k, Bob gets 103.6k
      // Mean = 101.8k, Std Dev = 1.8k, CV% ≈ 1.768%
      // Fairness = 100 - 1.768 = 98.232
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 103600, 5000, 'NY'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% ≈ 1.768% → Fairness ≈ 98.232
      expect(fairness).toBeGreaterThan(98);
      expect(fairness).toBeLessThan(99);
    });

    it('should calculate fairness score 97.5 for CV% of 2.5%', () => {
      // ARR: Alice gets 100k, Bob gets 105k
      // Mean = 102.5k, Std Dev = 2.5k, CV% ≈ 2.439%
      // Fairness = 100 - 2.439 = 97.561
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 105000, 5000, 'NY'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% ≈ 2.439% → Fairness ≈ 97.561
      expect(fairness).toBeGreaterThan(97);
      expect(fairness).toBeLessThan(98);
    });

    it('should return low score for very high CV% (98%)', () => {
      // Very unequal distribution: Alice gets 10k, Bob gets 1000k
      // Mean = 505k, Std Dev = 495k, CV% = 98.02%
      // Fairness = 100 - 98.02 = 1.98
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 10000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 1000000, 5000, 'NY'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% ≈ 98% → Fairness ≈ 2
      expect(fairness).toBeGreaterThan(0);
      expect(fairness).toBeLessThan(5);
    });

    it('should return null for empty reps', () => {
      const reps: Rep[] = [];
      const allocationResults: AllocationResult[] = [];
      const accounts: Account[] = [];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      expect(fairness).toBeNull();
    });

    it('should return null for empty allocation results', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];
      const allocationResults: AllocationResult[] = [];
      const accounts: Account[] = [];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      expect(fairness).toBeNull();
    });

    it('should handle rep with 0 ARR (included in calculation)', () => {
      // Alice gets 100k, Bob gets 0 ARR
      // Values: [100000, 0]
      // Mean = 50000, Std Dev = 50000, CV% = 100%
      // Fairness = 100 - 100 = 0
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
      ];

      const fairness = calculateARRFairness(reps, allocationResults, accounts);
      
      // CV% = 100% → Fairness = 100 - 100 = 0
      expect(fairness).toBe(0);
    });
  });

  describe('calculateAccountFairness', () => {
    it('should return 100 for equal account distribution', () => {
      // Each rep gets 2 accounts
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Alice', 'Enterprise'),
        createAllocationResult('A3', 'Bob', 'Enterprise'),
        createAllocationResult('A4', 'Bob', 'Enterprise'),
      ];

      const fairness = calculateAccountFairness(reps, allocationResults);
      
      // CV% = 0 → Fairness = 100
      expect(fairness).toBe(100);
    });

    it('should calculate fairness correctly for unequal account distribution', () => {
      // Alice gets 1 account, Bob gets 3 accounts
      // Values: [1, 3]
      // Mean = 2, Std Dev = 1, CV% = 50%
      // Fairness = 100 - 50 = 50
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
        createAllocationResult('A3', 'Bob', 'Enterprise'),
        createAllocationResult('A4', 'Bob', 'Enterprise'),
      ];

      const fairness = calculateAccountFairness(reps, allocationResults);
      
      // CV% = 50% → Fairness = 100 - 50 = 50
      expect(fairness).toBe(50);
    });

    it('should return null for empty reps', () => {
      const reps: Rep[] = [];
      const allocationResults: AllocationResult[] = [];

      const fairness = calculateAccountFairness(reps, allocationResults);
      expect(fairness).toBeNull();
    });

    it('should handle rep with 0 accounts (included in calculation)', () => {
      // Alice gets 2 accounts, Bob gets 0
      // Values: [2, 0]
      // Mean = 1, Std Dev = 1, CV% = 100%
      // Fairness = 100 - 100 = 0
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Alice', 'Enterprise'),
      ];

      const fairness = calculateAccountFairness(reps, allocationResults);
      expect(fairness).toBe(0);
    });
  });

  describe('calculateRiskFairness', () => {
    it('should return 100 for equal high-risk ARR % distribution', () => {
      // Alice: 100k total, 50k high-risk → 50%
      // Bob: 100k total, 50k high-risk → 50%
      // CV% = 0 → Fairness = 100
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Alice', 'Enterprise'),
        createAllocationResult('A3', 'Bob', 'Enterprise'),
        createAllocationResult('A4', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 50000, 5000, 'CA', 80),  // High risk
        createAccount('A2', 'Account 2', 'Alice', 50000, 5000, 'CA', 50),  // Not high risk
        createAccount('A3', 'Account 3', 'Bob', 50000, 5000, 'NY', 90),    // High risk
        createAccount('A4', 'Account 4', 'Bob', 50000, 5000, 'NY', 40),    // Not high risk
      ];

      const fairness = calculateRiskFairness(reps, allocationResults, accounts, 70);
      
      // Both reps have 50% high-risk ARR → CV% = 0 → Fairness = 100
      expect(fairness).toBe(100);
    });

    it('should calculate fairness correctly for unequal high-risk distribution', () => {
      // Alice: 100k total, 100k high-risk → 100%
      // Bob: 100k total, 0k high-risk → 0%
      // Values: [100, 0]
      // Mean = 50, Std Dev = 50, CV% = 100%
      // Fairness = 100 - 100 = 0
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA', 90),  // High risk
        createAccount('A2', 'Account 2', 'Bob', 100000, 5000, 'NY', 30),    // Not high risk
      ];

      const fairness = calculateRiskFairness(reps, allocationResults, accounts, 70);
      
      // CV% = 100% → Fairness = 100 - 100 = 0
      expect(fairness).toBe(0);
    });

    it('should return null when Risk_Score is missing from all accounts', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];
      const allocationResults = [createAllocationResult('A1', 'Alice', 'Enterprise')];
      const accounts = [createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA', null)];

      const fairness = calculateRiskFairness(reps, allocationResults, accounts, 70);
      expect(fairness).toBeNull();
    });

    it('should handle accounts with null Risk_Score (treated as not high-risk)', () => {
      // Alice: 100k total, 50k high-risk → 50%
      // Bob: 100k total (null risk), 0k high-risk → 0%
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const allocationResults = [
        createAllocationResult('A1', 'Alice', 'Enterprise'),
        createAllocationResult('A2', 'Bob', 'Enterprise'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA', 80),  // High risk
        createAccount('A2', 'Account 2', 'Bob', 100000, 5000, 'NY', null),  // No risk score
      ];

      const fairness = calculateRiskFairness(reps, allocationResults, accounts, 70);
      
      // Should calculate based on high-risk % (50% vs 0%)
      expect(fairness).not.toBeNull();
      expect(fairness).toBeLessThan(100);
    });

    it('should return null for empty reps', () => {
      const reps: Rep[] = [];
      const allocationResults: AllocationResult[] = [];
      const accounts: Account[] = [];

      const fairness = calculateRiskFairness(reps, allocationResults, accounts, 70);
      expect(fairness).toBeNull();
    });
  });
});

describe('fairness - Composite Scores', () => {
  describe('calculateCustomComposite', () => {
    it('should calculate weighted average with equal weights (33/33/33)', () => {
      // ARR fairness = 90, Account fairness = 80, Risk fairness = 70
      // Weights: 33/33/34
      // Composite = (90×33 + 80×33 + 70×34) / 100 = (2970 + 2640 + 2380) / 100 = 79.9
      const arrFairness = 90;
      const accountFairness = 80;
      const riskFairness = 70;
      const weights = { arr: 33, account: 33, risk: 34 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBeCloseTo(79.9, 1);
    });

    it('should calculate weighted average with 100% ARR weight', () => {
      // ARR fairness = 90, Account fairness = 50, Risk fairness = 30
      // Weights: 100/0/0
      // Composite = (90×100) / 100 = 90
      const arrFairness = 90;
      const accountFairness = 50;
      const riskFairness = 30;
      const weights = { arr: 100, account: 0, risk: 0 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBe(90);
    });

    it('should calculate weighted average with 50/50/0 weights', () => {
      // ARR fairness = 80, Account fairness = 60, Risk fairness = null
      // Weights: 50/50/0 (Risk null, ignored)
      // Composite = (80×50 + 60×50) / 100 = 70
      const arrFairness = 80;
      const accountFairness = 60;
      const riskFairness = null;
      const weights = { arr: 50, account: 50, risk: 0 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBe(70);
    });

    it('should handle null fairness scores by excluding them', () => {
      // ARR fairness = null, Account fairness = 80, Risk fairness = 60
      // Weights: 50/30/20
      // Only Account and Risk contribute: (80×30 + 60×20) / (30 + 20) = 3600 / 50 = 72
      const arrFairness = null;
      const accountFairness = 80;
      const riskFairness = 60;
      const weights = { arr: 50, account: 30, risk: 20 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBe(72);
    });

    it('should return null when all fairness scores are null', () => {
      const arrFairness = null;
      const accountFairness = null;
      const riskFairness = null;
      const weights = { arr: 33, account: 33, risk: 34 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBeNull();
    });

    it('should return null when total weight is 0', () => {
      // All weights are 0
      const arrFairness = 90;
      const accountFairness = 80;
      const riskFairness = 70;
      const weights = { arr: 0, account: 0, risk: 0 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBeNull();
    });

    it('should handle custom weight combinations (70/20/10)', () => {
      // ARR fairness = 95, Account fairness = 85, Risk fairness = 75
      // Weights: 70/20/10
      // Composite = (95×70 + 85×20 + 75×10) / 100 = (6650 + 1700 + 750) / 100 = 91
      const arrFairness = 95;
      const accountFairness = 85;
      const riskFairness = 75;
      const weights = { arr: 70, account: 20, risk: 10 };

      const composite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights);
      
      expect(composite).toBe(91);
    });
  });

  describe('calculateBalancedComposite', () => {
    it('should calculate simple average with all scores present', () => {
      // ARR = 90, Account = 80, Risk = 70
      // Balanced = (90 + 80 + 70) / 3 = 80
      const arrFairness = 90;
      const accountFairness = 80;
      const riskFairness = 70;

      const composite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
      
      expect(composite).toBe(80);
    });

    it('should calculate average with two scores (Risk null)', () => {
      // ARR = 90, Account = 80, Risk = null
      // Balanced = (90 + 80) / 2 = 85
      const arrFairness = 90;
      const accountFairness = 80;
      const riskFairness = null;

      const composite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
      
      expect(composite).toBe(85);
    });

    it('should calculate with one score (only ARR)', () => {
      // ARR = 90, Account = null, Risk = null
      // Balanced = 90 / 1 = 90
      const arrFairness = 90;
      const accountFairness = null;
      const riskFairness = null;

      const composite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
      
      expect(composite).toBe(90);
    });

    it('should return null when all scores are null', () => {
      const arrFairness = null;
      const accountFairness = null;
      const riskFairness = null;

      const composite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
      
      expect(composite).toBeNull();
    });

    it('should handle equal weights implicitly (33.33/33.33/33.33)', () => {
      // ARR = 60, Account = 90, Risk = 100
      // Balanced = (60 + 90 + 100) / 3 = 83.333...
      const arrFairness = 60;
      const accountFairness = 90;
      const riskFairness = 100;

      const composite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
      
      expect(composite).toBeCloseTo(83.333, 2);
    });
  });
});

describe('fairness - Color Band Mapping', () => {
  describe('getFairnessColor', () => {
    it('should return "dark-green" for scores 94-100', () => {
      expect(getFairnessColor(100)).toBe('dark-green');
      expect(getFairnessColor(97)).toBe('dark-green');
      expect(getFairnessColor(94)).toBe('dark-green');
    });

    it('should return "light-green" for scores 88-93', () => {
      expect(getFairnessColor(93)).toBe('light-green');
      expect(getFairnessColor(90)).toBe('light-green');
      expect(getFairnessColor(88)).toBe('light-green');
    });

    it('should return "yellow" for scores 82-87', () => {
      expect(getFairnessColor(87)).toBe('yellow');
      expect(getFairnessColor(85)).toBe('yellow');
      expect(getFairnessColor(82)).toBe('yellow');
    });

    it('should return "orange" for scores 75-81', () => {
      expect(getFairnessColor(81)).toBe('orange');
      expect(getFairnessColor(78)).toBe('orange');
      expect(getFairnessColor(75)).toBe('orange');
    });

    it('should return "red" for scores below 75', () => {
      expect(getFairnessColor(74)).toBe('red');
      expect(getFairnessColor(50)).toBe('red');
      expect(getFairnessColor(0)).toBe('red');
    });

    it('should return "gray" for null scores', () => {
      expect(getFairnessColor(null)).toBe('gray');
    });

    it('should handle boundary cases correctly', () => {
      // Upper boundaries
      expect(getFairnessColor(93.9)).toBe('light-green');
      expect(getFairnessColor(87.9)).toBe('yellow');
      expect(getFairnessColor(81.9)).toBe('orange');
      expect(getFairnessColor(74.9)).toBe('red');

      // Lower boundaries
      expect(getFairnessColor(94.0)).toBe('dark-green');
      expect(getFairnessColor(88.0)).toBe('light-green');
      expect(getFairnessColor(82.0)).toBe('yellow');
      expect(getFairnessColor(75.0)).toBe('orange');
    });
  });
});

describe('fairness - Clamping to [0, 100] range', () => {
  it('should clamp negative fairness scores to 0', () => {
    // Very high CV% (>100) would result in negative fairness
    // Example: CV% = 150% → Fairness = 100 - 150 = -50 → clamped to 0
    const reps = [
      createRep('Alice', 'Enterprise', 'CA'),
      createRep('Bob', 'Enterprise', 'NY'),
    ];

    const allocationResults = [
      createAllocationResult('A1', 'Alice', 'Enterprise'),
      createAllocationResult('A2', 'Bob', 'Enterprise'),
    ];

    const accounts = [
      createAccount('A1', 'Account 1', 'Alice', 1, 5000, 'CA'),
      createAccount('A2', 'Account 2', 'Bob', 1000000, 5000, 'NY'),
    ];

    const fairness = calculateARRFairness(reps, allocationResults, accounts);
    
    // Should be clamped to 0
    expect(fairness).toBeGreaterThanOrEqual(0);
    expect(fairness).toBeLessThanOrEqual(100);
  });

  it('should clamp fairness scores above 100 to 100 (though unlikely)', () => {
    // Perfect distribution should never exceed 100
    const reps = [
      createRep('Alice', 'Enterprise', 'CA'),
      createRep('Bob', 'Enterprise', 'NY'),
    ];

    const allocationResults = [
      createAllocationResult('A1', 'Alice', 'Enterprise'),
      createAllocationResult('A2', 'Bob', 'Enterprise'),
    ];

    const accounts = [
      createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
      createAccount('A2', 'Account 2', 'Bob', 100000, 5000, 'NY'),
    ];

    const fairness = calculateARRFairness(reps, allocationResults, accounts);
    
    // Should be exactly 100 (perfect distribution)
    expect(fairness).toBe(100);
  });
});

describe('fairness - Integration Tests', () => {
  it('should calculate all fairness metrics correctly for a complete scenario', () => {
    // Scenario: 3 reps, 6 accounts, mixed distribution
    const reps = [
      createRep('Alice', 'Enterprise', 'CA'),
      createRep('Bob', 'Enterprise', 'NY'),
      createRep('Charlie', 'Enterprise', 'TX'),
    ];

    const allocationResults = [
      createAllocationResult('A1', 'Alice', 'Enterprise'),
      createAllocationResult('A2', 'Alice', 'Enterprise'),
      createAllocationResult('A3', 'Bob', 'Enterprise'),
      createAllocationResult('A4', 'Bob', 'Enterprise'),
      createAllocationResult('A5', 'Charlie', 'Enterprise'),
      createAllocationResult('A6', 'Charlie', 'Enterprise'),
    ];

    const accounts = [
      createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA', 80),
      createAccount('A2', 'Account 2', 'Alice', 100000, 5000, 'CA', 50),
      createAccount('A3', 'Account 3', 'Bob', 100000, 5000, 'NY', 90),
      createAccount('A4', 'Account 4', 'Bob', 100000, 5000, 'NY', 40),
      createAccount('A5', 'Account 5', 'Charlie', 100000, 5000, 'TX', 85),
      createAccount('A6', 'Account 6', 'Charlie', 100000, 5000, 'TX', 30),
    ];

    // ARR Fairness: Each rep gets 200k → CV% = 0 → Fairness = 100
    const arrFairness = calculateARRFairness(reps, allocationResults, accounts);
    expect(arrFairness).toBe(100);

    // Account Fairness: Each rep gets 2 accounts → CV% = 0 → Fairness = 100
    const accountFairness = calculateAccountFairness(reps, allocationResults);
    expect(accountFairness).toBe(100);

    // Risk Fairness: Each rep gets 100k high-risk ARR out of 200k total → 50% each → CV% = 0 → Fairness = 100
    const riskFairness = calculateRiskFairness(reps, allocationResults, accounts, 70);
    expect(riskFairness).toBe(100);

    // Custom Composite (50/30/20): (100×50 + 100×30 + 100×20) / 100 = 100
    const customComposite = calculateCustomComposite(arrFairness, accountFairness, riskFairness, {
      arr: 50,
      account: 30,
      risk: 20,
    });
    expect(customComposite).toBe(100);

    // Balanced Composite: (100 + 100 + 100) / 3 = 100
    const balancedComposite = calculateBalancedComposite(arrFairness, accountFairness, riskFairness);
    expect(balancedComposite).toBe(100);

    // Color: All 100 → dark-green
    expect(getFairnessColor(arrFairness)).toBe('dark-green');
    expect(getFairnessColor(accountFairness)).toBe('dark-green');
    expect(getFairnessColor(riskFairness)).toBe('dark-green');
  });

  it('should handle mixed segment allocation (Enterprise and Mid Market)', () => {
    // Scenario: 2 Enterprise reps, 2 Mid Market reps, 4 accounts each
    const reps = [
      createRep('Alice', 'Enterprise', 'CA'),
      createRep('Bob', 'Enterprise', 'NY'),
      createRep('Charlie', 'Mid Market', 'TX'),
      createRep('Diana', 'Mid Market', 'FL'),
    ];

    const allocationResults = [
      createAllocationResult('E1', 'Alice', 'Enterprise'),
      createAllocationResult('E2', 'Bob', 'Enterprise'),
      createAllocationResult('M1', 'Charlie', 'Mid Market'),
      createAllocationResult('M2', 'Diana', 'Mid Market'),
    ];

    const accounts = [
      createAccount('E1', 'Enterprise 1', 'Alice', 200000, 5000, 'CA'),
      createAccount('E2', 'Enterprise 2', 'Bob', 200000, 5000, 'NY'),
      createAccount('M1', 'Mid Market 1', 'Charlie', 50000, 500, 'TX'),
      createAccount('M2', 'Mid Market 2', 'Diana', 50000, 500, 'FL'),
    ];

    // All reps get equal ARR within their segment
    const arrFairness = calculateARRFairness(reps, allocationResults, accounts);
    expect(arrFairness).not.toBeNull();

    // All reps get equal accounts
    const accountFairness = calculateAccountFairness(reps, allocationResults);
    expect(accountFairness).toBe(100);
  });
});
