/**
 * Unit tests for Greedy Allocation Algorithm
 * 
 * Tests cover:
 * - Simple case: 2 reps, 4 accounts, equal weights
 * - Edge case: 1 rep per segment, empty segment handling
 * - Complex case: 10 reps, 100 accounts, various weight combinations
 * - Segment assignment validation (Enterprise accounts → Enterprise reps, Mid Market accounts → Mid Market reps)
 * - Blended score calculation validation (positive = under target, negative = over target)
 * - Preference bonus formula validation (sign-aware multiplier) - NOTE: bonuses implemented in AE-13, test structure only
 * - Winner selection validation (highest total score wins)
 * - Tie-breaking validation (lowest ARR, then alphabetical)
 */

import { describe, it, expect } from 'vitest';
import {
  allocateAccounts,
  calculateBlendedScore,
  calculateTargetARR,
  calculateTargetAccounts,
  calculateTargetRiskARR,
} from '../greedyAllocator';
import type { Account, Rep, AllocationConfig } from '../../../types';

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
 * Helper function to create a basic allocation config
 */
function createConfig(
  threshold: number,
  arrWeight: number = 33,
  accountWeight: number = 33,
  riskWeight: number = 34
): AllocationConfig {
  return {
    threshold,
    arrWeight,
    accountWeight,
    riskWeight,
    geoMatchBonus: 0.05,
    preserveBonus: 0.05,
    highRiskThreshold: 70,
  };
}

describe('greedyAllocator', () => {
  describe('calculateTargetARR', () => {
    it('should calculate correct target ARR per rep', () => {
      const reps = [
        createRep('Rep1', 'Enterprise', 'CA'),
        createRep('Rep2', 'Enterprise', 'NY'),
      ];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Rep2', 200000, 6000, 'NY'),
      ];

      const target = calculateTargetARR(reps, accounts);
      expect(target).toBe(150000); // (100000 + 200000) / 2
    });

    it('should return 0 when there are no reps', () => {
      const reps: Rep[] = [];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA'),
      ];

      const target = calculateTargetARR(reps, accounts);
      expect(target).toBe(0);
    });
  });

  describe('calculateTargetAccounts', () => {
    it('should calculate correct target account count per rep', () => {
      const reps = [
        createRep('Rep1', 'Enterprise', 'CA'),
        createRep('Rep2', 'Enterprise', 'NY'),
      ];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Rep2', 200000, 6000, 'NY'),
        createAccount('A3', 'Account 3', 'Rep1', 150000, 5500, 'CA'),
        createAccount('A4', 'Account 4', 'Rep2', 250000, 6500, 'NY'),
      ];

      const target = calculateTargetAccounts(reps, accounts);
      expect(target).toBe(2); // 4 accounts / 2 reps
    });

    it('should return 0 when there are no reps', () => {
      const reps: Rep[] = [];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA'),
      ];

      const target = calculateTargetAccounts(reps, accounts);
      expect(target).toBe(0);
    });
  });

  describe('calculateTargetRiskARR', () => {
    it('should calculate correct target risk ARR per rep', () => {
      const reps = [
        createRep('Rep1', 'Enterprise', 'CA'),
        createRep('Rep2', 'Enterprise', 'NY'),
      ];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA', 80), // High risk
        createAccount('A2', 'Account 2', 'Rep2', 200000, 6000, 'NY', 50), // Not high risk
        createAccount('A3', 'Account 3', 'Rep1', 150000, 5500, 'CA', 90), // High risk
      ];

      const target = calculateTargetRiskARR(reps, accounts, 70);
      expect(target).toBe(125000); // (100000 + 150000) / 2
    });

    it('should return 0 when there are no high-risk accounts', () => {
      const reps = [
        createRep('Rep1', 'Enterprise', 'CA'),
        createRep('Rep2', 'Enterprise', 'NY'),
      ];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA', 50),
        createAccount('A2', 'Account 2', 'Rep2', 200000, 6000, 'NY', 60),
      ];

      const target = calculateTargetRiskARR(reps, accounts, 70);
      expect(target).toBe(0);
    });

    it('should handle null risk scores', () => {
      const reps = [
        createRep('Rep1', 'Enterprise', 'CA'),
        createRep('Rep2', 'Enterprise', 'NY'),
      ];
      const accounts = [
        createAccount('A1', 'Account 1', 'Rep1', 100000, 5000, 'CA', null),
        createAccount('A2', 'Account 2', 'Rep2', 200000, 6000, 'NY', null),
      ];

      const target = calculateTargetRiskARR(reps, accounts, 70);
      expect(target).toBe(0);
    });
  });

  describe('calculateBlendedScore', () => {
    it('should calculate positive score when rep is under target', () => {
      const config = createConfig(3000, 50, 50, 0); // Equal weights for ARR and Account
      const repState = {
        rep: createRep('Rep1', 'Enterprise', 'CA'),
        currentARR: 50000,
        currentAccounts: 1,
        currentRiskARR: 0,
        assignedAccountIds: ['A1'],
      };

      // Targets: ARR = 100000, Accounts = 2
      const blendedScore = calculateBlendedScore(repState, 100000, 2, 0, config);

      // ARR need: (100000 - 50000) / 100000 = 0.5
      // Account need: (2 - 1) / 2 = 0.5
      // Blended: 0.5 * 0.5 + 0.5 * 0.5 = 0.5
      expect(blendedScore).toBeCloseTo(0.5, 5);
    });

    it('should calculate negative score when rep is over target', () => {
      const config = createConfig(3000, 100, 0, 0); // 100% ARR weight
      const repState = {
        rep: createRep('Rep1', 'Enterprise', 'CA'),
        currentARR: 150000,
        currentAccounts: 2,
        currentRiskARR: 0,
        assignedAccountIds: ['A1', 'A2'],
      };

      // Target: ARR = 100000
      const blendedScore = calculateBlendedScore(repState, 100000, 2, 0, config);

      // ARR need: (100000 - 150000) / 100000 = -0.5
      expect(blendedScore).toBeCloseTo(-0.5, 5);
    });

    it('should handle zero targets gracefully', () => {
      const config = createConfig(3000, 50, 50, 0);
      const repState = {
        rep: createRep('Rep1', 'Enterprise', 'CA'),
        currentARR: 0,
        currentAccounts: 0,
        currentRiskARR: 0,
        assignedAccountIds: [],
      };

      const blendedScore = calculateBlendedScore(repState, 0, 0, 0, config);
      expect(blendedScore).toBe(0);
    });

    it('should apply weights correctly', () => {
      const config = createConfig(3000, 100, 0, 0); // 100% ARR weight
      const repState = {
        rep: createRep('Rep1', 'Enterprise', 'CA'),
        currentARR: 50000,
        currentAccounts: 0,
        currentRiskARR: 0,
        assignedAccountIds: [],
      };

      const blendedScore = calculateBlendedScore(repState, 100000, 2, 0, config);

      // ARR need: (100000 - 50000) / 100000 = 0.5
      // Account need ignored (0% weight)
      // Blended: 0.5 * 1.0 = 0.5
      expect(blendedScore).toBeCloseTo(0.5, 5);
    });
  });

  describe('allocateAccounts - Simple Case (2 reps, 4 accounts)', () => {
    it('should allocate accounts evenly with equal weights', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 180000, 5500, 'NY'),
        createAccount('A3', 'Account 3', 'Alice', 160000, 6000, 'CA'),
        createAccount('A4', 'Account 4', 'Bob', 140000, 5200, 'NY'),
      ];

      const config = createConfig(3000, 50, 50, 0); // 50/50 ARR/Account weight

      const results = allocateAccounts(accounts, reps, config);

      // All accounts should be allocated
      expect(results).toHaveLength(4);

      // All accounts should be Enterprise segment
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);

      // Check that both reps got accounts (fair distribution)
      const aliceAccounts = results.filter(r => r.assignedRep === 'Alice');
      const bobAccounts = results.filter(r => r.assignedRep === 'Bob');

      expect(aliceAccounts).toHaveLength(2);
      expect(bobAccounts).toHaveLength(2);
    });
  });

  describe('allocateAccounts - Edge Cases', () => {
    it('should handle 1 rep per segment', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Alice', 180000, 5500, 'CA'),
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      // All accounts should go to the only rep
      expect(results).toHaveLength(2);
      expect(results.every(r => r.assignedRep === 'Alice')).toBe(true);
    });

    it('should handle empty Enterprise segment gracefully', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Mid Market', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Bob', 50000, 500, 'NY'), // Mid Market
        createAccount('A2', 'Account 2', 'Bob', 60000, 600, 'NY'), // Mid Market
      ];

      const config = createConfig(3000, 50, 50, 0); // Threshold = 3000, all accounts < 3000

      const results = allocateAccounts(accounts, reps, config);

      // All accounts should be Mid Market
      expect(results).toHaveLength(2);
      expect(results.every(r => r.segment === 'Mid Market')).toBe(true);
      expect(results.every(r => r.assignedRep === 'Bob')).toBe(true);
    });

    it('should handle empty Mid Market segment gracefully', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Mid Market', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'), // Enterprise
        createAccount('A2', 'Account 2', 'Alice', 180000, 5500, 'CA'), // Enterprise
      ];

      const config = createConfig(3000, 50, 50, 0); // Threshold = 3000, all accounts >= 3000

      const results = allocateAccounts(accounts, reps, config);

      // All accounts should be Enterprise
      expect(results).toHaveLength(2);
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);
      expect(results.every(r => r.assignedRep === 'Alice')).toBe(true);
    });

    it('should handle no accounts', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];
      const accounts: Account[] = [];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(0);
    });

    it('should handle no reps in segment', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Bob', 50000, 500, 'NY'), // Mid Market
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      // No Mid Market reps, so Mid Market account cannot be allocated
      expect(results).toHaveLength(0);
    });
  });

  describe('allocateAccounts - Segment Assignment Validation', () => {
    it('should assign Enterprise accounts only to Enterprise reps', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Mid Market', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'), // Enterprise (>= 3000)
        createAccount('A2', 'Account 2', 'Alice', 180000, 5500, 'CA'), // Enterprise
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      // All Enterprise accounts should go to Enterprise rep
      expect(results).toHaveLength(2);
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);
      expect(results.every(r => r.assignedRep === 'Alice')).toBe(true);
    });

    it('should assign Mid Market accounts only to Mid Market reps', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Mid Market', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Bob', 50000, 500, 'NY'), // Mid Market (< 3000)
        createAccount('A2', 'Account 2', 'Bob', 60000, 800, 'NY'), // Mid Market
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      // All Mid Market accounts should go to Mid Market rep
      expect(results).toHaveLength(2);
      expect(results.every(r => r.segment === 'Mid Market')).toBe(true);
      expect(results.every(r => r.assignedRep === 'Bob')).toBe(true);
    });

    it('should correctly segment mixed accounts', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Mid Market', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'), // Enterprise
        createAccount('A2', 'Account 2', 'Bob', 50000, 500, 'NY'),     // Mid Market
        createAccount('A3', 'Account 3', 'Alice', 180000, 4000, 'CA'), // Enterprise
        createAccount('A4', 'Account 4', 'Bob', 60000, 800, 'NY'),     // Mid Market
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(4);

      const enterpriseResults = results.filter(r => r.segment === 'Enterprise');
      const midMarketResults = results.filter(r => r.segment === 'Mid Market');

      expect(enterpriseResults).toHaveLength(2);
      expect(midMarketResults).toHaveLength(2);

      expect(enterpriseResults.every(r => r.assignedRep === 'Alice')).toBe(true);
      expect(midMarketResults.every(r => r.assignedRep === 'Bob')).toBe(true);
    });
  });

  describe('allocateAccounts - Winner Selection (Highest Total Score)', () => {
    it('should assign account to rep with highest total score', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      // First account will go to whoever has highest score (both start at 0, so first alphabetically)
      // Second account should go to the rep with lower current ARR
      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 100000, 5500, 'NY'),
      ];

      const config = createConfig(3000, 100, 0, 0); // 100% ARR weight

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(2);

      // First account (200k) should go to Alice (alphabetically first when tied)
      const firstResult = results.find(r => r.accountId === 'A1');
      expect(firstResult?.assignedRep).toBe('Alice');

      // Second account (100k) should go to Bob (lower current ARR after A1 assignment)
      const secondResult = results.find(r => r.accountId === 'A2');
      expect(secondResult?.assignedRep).toBe('Bob');
    });
  });

  describe('allocateAccounts - Tie-Breaking', () => {
    it('should break ties by lowest current ARR', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 100000, 5500, 'NY'),
        createAccount('A3', 'Account 3', 'Charlie', 50000, 6000, 'TX'),
      ];

      const config = createConfig(3000, 100, 0, 0); // 100% ARR weight

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(3);

      // Track ARR per rep
      const aliceARR = results
        .filter(r => r.assignedRep === 'Alice')
        .reduce((sum, r) => {
          const account = accounts.find(a => a.Account_ID === r.accountId);
          return sum + (account?.ARR || 0);
        }, 0);

      const bobARR = results
        .filter(r => r.assignedRep === 'Bob')
        .reduce((sum, r) => {
          const account = accounts.find(a => a.Account_ID === r.accountId);
          return sum + (account?.ARR || 0);
        }, 0);

      // Distribution should be relatively balanced
      expect(Math.abs(aliceARR - bobARR)).toBeLessThanOrEqual(100000);
    });

    it('should break ties alphabetically when ARR is equal', () => {
      const reps = [
        createRep('Charlie', 'Enterprise', 'TX'),
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
      ];

      const config = createConfig(3000, 100, 0, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(1);

      // When all reps have 0 ARR, should choose alphabetically first
      expect(results[0].assignedRep).toBe('Alice');
    });
  });

  describe('allocateAccounts - Allocation Order (Descending ARR)', () => {
    it('should process accounts in descending ARR order', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Charlie', 50000, 5000, 'TX'),   // Smallest ARR, no bonuses
        createAccount('A2', 'Account 2', 'Charlie', 200000, 5500, 'TX'),  // Largest ARR, no bonuses
        createAccount('A3', 'Account 3', 'Charlie', 100000, 6000, 'TX'),  // Middle ARR, no bonuses
      ];

      const config = createConfig(3000, 100, 0, 0); // 100% ARR weight

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(3);

      // The algorithm processes in order: A2 (200k), A3 (100k), A1 (50k)
      // With 100% ARR weight and no bonuses, distribution should balance ARR
      const aliceARR = results
        .filter(r => r.assignedRep === 'Alice')
        .reduce((sum, r) => {
          const account = accounts.find(a => a.Account_ID === r.accountId);
          return sum + (account?.ARR || 0);
        }, 0);

      const bobARR = results
        .filter(r => r.assignedRep === 'Bob')
        .reduce((sum, r) => {
          const account = accounts.find(a => a.Account_ID === r.accountId);
          return sum + (account?.ARR || 0);
        }, 0);

      // Distribution should be balanced (both get ~175k)
      expect(Math.abs(aliceARR - bobARR)).toBeLessThanOrEqual(50000);
    });
  });

  describe('allocateAccounts - Complex Case (Multiple reps, varied weights)', () => {
    it('should handle 4 reps with 10 accounts and varied weights', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
        createRep('Charlie', 'Mid Market', 'TX'),
        createRep('Diana', 'Mid Market', 'FL'),
      ];

      const accounts = [
        // Enterprise accounts (>= 3000 employees)
        createAccount('E1', 'Enterprise 1', 'Alice', 500000, 10000, 'CA', 80),
        createAccount('E2', 'Enterprise 2', 'Bob', 400000, 8000, 'NY', 50),
        createAccount('E3', 'Enterprise 3', 'Alice', 300000, 7000, 'CA', 90),
        createAccount('E4', 'Enterprise 4', 'Bob', 250000, 6000, 'NY', 40),
        createAccount('E5', 'Enterprise 5', 'Alice', 200000, 5000, 'CA', 70),
        // Mid Market accounts (< 3000 employees)
        createAccount('M1', 'Mid Market 1', 'Charlie', 100000, 1500, 'TX', 60),
        createAccount('M2', 'Mid Market 2', 'Diana', 90000, 1200, 'FL', 30),
        createAccount('M3', 'Mid Market 3', 'Charlie', 80000, 1000, 'TX', 75),
        createAccount('M4', 'Mid Market 4', 'Diana', 70000, 900, 'FL', 45),
        createAccount('M5', 'Mid Market 5', 'Charlie', 60000, 800, 'TX', 80),
      ];

      const config = createConfig(3000, 40, 30, 30); // Mixed weights

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(10);

      // Verify segment assignments
      const enterpriseResults = results.filter(r => r.segment === 'Enterprise');
      const midMarketResults = results.filter(r => r.segment === 'Mid Market');

      expect(enterpriseResults).toHaveLength(5);
      expect(midMarketResults).toHaveLength(5);

      // Verify rep assignments (only Enterprise reps get Enterprise accounts)
      expect(enterpriseResults.every(r => r.assignedRep === 'Alice' || r.assignedRep === 'Bob')).toBe(true);
      expect(midMarketResults.every(r => r.assignedRep === 'Charlie' || r.assignedRep === 'Diana')).toBe(true);

      // Verify distribution is reasonably balanced
      const aliceCount = results.filter(r => r.assignedRep === 'Alice').length;
      const bobCount = results.filter(r => r.assignedRep === 'Bob').length;
      const charlieCount = results.filter(r => r.assignedRep === 'Charlie').length;
      const dianaCount = results.filter(r => r.assignedRep === 'Diana').length;

      // Each rep should get at least 1 account (reasonable distribution)
      expect(aliceCount).toBeGreaterThan(0);
      expect(bobCount).toBeGreaterThan(0);
      expect(charlieCount).toBeGreaterThan(0);
      expect(dianaCount).toBeGreaterThan(0);
    });

    it('should handle 100% ARR weight allocation', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 200000, 5500, 'NY'),
        createAccount('A3', 'Account 3', 'Alice', 200000, 6000, 'CA'),
        createAccount('A4', 'Account 4', 'Bob', 200000, 5200, 'NY'),
      ];

      const config = createConfig(3000, 100, 0, 0); // 100% ARR weight

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(4);

      // With equal ARR accounts and 100% ARR weight, should distribute evenly
      const aliceARR = results
        .filter(r => r.assignedRep === 'Alice')
        .reduce((sum, r) => {
          const account = accounts.find(a => a.Account_ID === r.accountId);
          return sum + (account?.ARR || 0);
        }, 0);

      const bobARR = results
        .filter(r => r.assignedRep === 'Bob')
        .reduce((sum, r) => {
          const account = accounts.find(a => a.Account_ID === r.accountId);
          return sum + (account?.ARR || 0);
        }, 0);

      // Should be perfectly balanced
      expect(aliceARR).toBe(bobARR);
      expect(aliceARR).toBe(400000);
    });

    it('should handle 100% Account weight allocation', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 500000, 5000, 'CA'), // Large ARR
        createAccount('A2', 'Account 2', 'Bob', 100000, 5500, 'NY'),   // Small ARR
        createAccount('A3', 'Account 3', 'Alice', 400000, 6000, 'CA'), // Large ARR
        createAccount('A4', 'Account 4', 'Bob', 50000, 5200, 'NY'),    // Small ARR
      ];

      const config = createConfig(3000, 0, 100, 0); // 100% Account weight

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(4);

      // With 100% account weight, should distribute accounts evenly (ignoring ARR)
      const aliceCount = results.filter(r => r.assignedRep === 'Alice').length;
      const bobCount = results.filter(r => r.assignedRep === 'Bob').length;

      expect(aliceCount).toBe(2);
      expect(bobCount).toBe(2);
    });
  });

  describe('allocateAccounts - Preference Bonus Application (AE-13)', () => {
    it('should include geoBonus and preserveBonus fields in results', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'), // Both bonuses apply
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('geoBonus');
      expect(results[0]).toHaveProperty('preserveBonus');
      expect(results[0]).toHaveProperty('totalScore');

      // Both bonuses should apply (geo match: CA = CA, preserve: Alice = Alice)
      expect(results[0].geoBonus).toBe(0.05);
      expect(results[0].preserveBonus).toBe(0.05);
    });

    it('should apply geo bonus when locations match', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Bob', 100000, 5000, 'CA'), // Geo bonus only
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(1);
      expect(results[0].geoBonus).toBe(0.05); // Geo match
      expect(results[0].preserveBonus).toBe(0); // No preserve
    });

    it('should apply preserve bonus when original rep matches', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'NY'), // Preserve bonus only
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(1);
      expect(results[0].geoBonus).toBe(0); // No geo match (CA vs NY)
      expect(results[0].preserveBonus).toBe(0.05); // Preserve match
    });

    it('should apply no bonuses when neither condition matches', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Bob', 100000, 5000, 'NY'), // No bonuses
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(1);
      expect(results[0].geoBonus).toBe(0);
      expect(results[0].preserveBonus).toBe(0);

      // Total score should equal blended score when no bonuses applied
      expect(results[0].totalScore).toBe(results[0].blendedScore);
    });

    it('should apply sign-aware multiplier for bonuses (positive score)', () => {
      const reps = [createRep('Alice', 'Enterprise', 'CA')];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 100000, 5000, 'CA'),
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(1);

      // Blended score should be positive (rep under target initially)
      expect(results[0].blendedScore).toBeGreaterThan(0);

      // With bonuses, total score = blendedScore * (1 + geoBonus + preserveBonus)
      const expectedTotal = results[0].blendedScore * (1 + 0.05 + 0.05);
      expect(results[0].totalScore).toBeCloseTo(expectedTotal, 5);
      expect(results[0].totalScore).toBeGreaterThan(results[0].blendedScore);
    });
  });

  describe('allocateAccounts - Deterministic Behavior', () => {
    it('should produce identical results with same input', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA'),
        createAccount('A2', 'Account 2', 'Bob', 180000, 5500, 'NY'),
        createAccount('A3', 'Account 3', 'Alice', 160000, 6000, 'CA'),
        createAccount('A4', 'Account 4', 'Bob', 140000, 5200, 'NY'),
      ];

      const config = createConfig(3000, 50, 50, 0);

      // Run allocation twice
      const results1 = allocateAccounts(accounts, reps, config);
      const results2 = allocateAccounts(accounts, reps, config);

      expect(results1).toEqual(results2);
    });
  });

  describe('allocateAccounts - Risk Score Handling', () => {
    it('should handle accounts with risk scores', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA', 85), // High risk
        createAccount('A2', 'Account 2', 'Bob', 180000, 5500, 'NY', 45),   // Low risk
      ];

      const config = createConfig(3000, 33, 33, 34); // Include risk weight

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);
    });

    it('should handle accounts without risk scores (null)', () => {
      const reps = [
        createRep('Alice', 'Enterprise', 'CA'),
        createRep('Bob', 'Enterprise', 'NY'),
      ];

      const accounts = [
        createAccount('A1', 'Account 1', 'Alice', 200000, 5000, 'CA', null),
        createAccount('A2', 'Account 2', 'Bob', 180000, 5500, 'NY', null),
      ];

      const config = createConfig(3000, 50, 50, 0);

      const results = allocateAccounts(accounts, reps, config);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.segment === 'Enterprise')).toBe(true);
    });
  });
});
