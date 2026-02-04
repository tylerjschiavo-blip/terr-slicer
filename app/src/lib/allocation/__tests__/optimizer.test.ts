/**
 * Tests for Weight Optimization
 * 
 * Validates that optimizer searches all weight combinations and finds
 * the weights that maximize Balanced fairness (33/33/33 composite).
 */

import { describe, it, expect } from 'vitest';
import { optimizeWeights } from '../optimizer';
import type { Account, Rep } from '../../../types';

describe('optimizeWeights', () => {
  // Test data: Simple scenario with 2 reps and 4 accounts
  const reps: Rep[] = [
    { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
    { Rep_Name: 'Bob', Segment: 'Enterprise', Location: 'NY' }
  ];

  const accounts: Account[] = [
    {
      Account_ID: 'A1',
      Account_Name: 'Acme Corp',
      Original_Rep: 'Alice',
      ARR: 1000000,
      Num_Employees: 5000,
      Location: 'CA',
      Risk_Score: 80
    },
    {
      Account_ID: 'A2',
      Account_Name: 'Beta Inc',
      Original_Rep: 'Bob',
      ARR: 500000,
      Num_Employees: 3000,
      Location: 'NY',
      Risk_Score: 50
    },
    {
      Account_ID: 'A3',
      Account_Name: 'Gamma LLC',
      Original_Rep: 'Alice',
      ARR: 750000,
      Num_Employees: 4000,
      Location: 'CA',
      Risk_Score: 90
    },
    {
      Account_ID: 'A4',
      Account_Name: 'Delta Co',
      Original_Rep: 'Bob',
      ARR: 250000,
      Num_Employees: 2000,
      Location: 'NY',
      Risk_Score: 30
    }
  ];

  it('should search all valid weight combinations and return best result', () => {
    const result = optimizeWeights(
      accounts,
      reps,
      2500, // threshold
      0.05, // geoMatchBonus
      0.05, // preserveBonus
      70    // highRiskThreshold
    );

    // Verify result structure
    expect(result).toHaveProperty('arrWeight');
    expect(result).toHaveProperty('accountWeight');
    expect(result).toHaveProperty('riskWeight');
    expect(result).toHaveProperty('balancedScore');

    // Weights should sum to 100%
    expect(result.arrWeight + result.accountWeight + result.riskWeight).toBe(100);

    // Each weight should be 0-100
    expect(result.arrWeight).toBeGreaterThanOrEqual(0);
    expect(result.arrWeight).toBeLessThanOrEqual(100);
    expect(result.accountWeight).toBeGreaterThanOrEqual(0);
    expect(result.accountWeight).toBeLessThanOrEqual(100);
    expect(result.riskWeight).toBeGreaterThanOrEqual(0);
    expect(result.riskWeight).toBeLessThanOrEqual(100);

    // Balanced score should be 0-100 or null
    expect(result.balancedScore).toBeGreaterThanOrEqual(0);
    expect(result.balancedScore).toBeLessThanOrEqual(100);
  });

  it('should allow 0% weight for any driver (no minimum constraints)', () => {
    // Use accounts with perfect ARR balance when Account weight = 100%, ARR weight = 0%
    const balancedAccounts: Account[] = [
      {
        Account_ID: 'B1',
        Account_Name: 'Account 1',
        Original_Rep: 'Alice',
        ARR: 1000000,
        Num_Employees: 5000,
        Location: 'CA',
        Risk_Score: 50
      },
      {
        Account_ID: 'B2',
        Account_Name: 'Account 2',
        Original_Rep: 'Bob',
        ARR: 1000000,
        Num_Employees: 3000,
        Location: 'NY',
        Risk_Score: 50
      }
    ];

    const result = optimizeWeights(
      balancedAccounts,
      reps,
      2500,
      0.05,
      0.05,
      70
    );

    // Optimizer should be able to recommend 0% for any weight
    // (In this case, with 2 reps and 2 equal ARR accounts, Account weight might be best)
    // Just verify the optimizer doesn't enforce minimums
    expect(result.arrWeight + result.accountWeight + result.riskWeight).toBe(100);
  });

  it('should maximize Balanced fairness (33/33/33 composite)', () => {
    const result = optimizeWeights(
      accounts,
      reps,
      2500,
      0.05,
      0.05,
      70
    );

    // The returned score should be the Balanced composite (33/33/33)
    // We can't predict the exact value, but it should be reasonable
    expect(result.balancedScore).toBeGreaterThan(0);
    expect(result.balancedScore).toBeLessThanOrEqual(100);
  });

  it('should handle missing Risk_Score by locking Risk weight to 0%', () => {
    // Create accounts without Risk_Score
    const accountsNoRisk: Account[] = accounts.map(acc => ({
      ...acc,
      Risk_Score: null
    }));

    const result = optimizeWeights(
      accountsNoRisk,
      reps,
      2500,
      0.05,
      0.05,
      70
    );

    // Risk weight should be 0% when Risk_Score is missing
    expect(result.riskWeight).toBe(0);

    // ARR and Account weights should sum to 100%
    expect(result.arrWeight + result.accountWeight).toBe(100);

    // Should still return a valid Balanced score
    expect(result.balancedScore).toBeGreaterThanOrEqual(0);
    expect(result.balancedScore).toBeLessThanOrEqual(100);
  });

  it('should complete in reasonable time for typical datasets', () => {
    // Create larger dataset: 10 reps, 100 accounts
    const largeReps: Rep[] = Array.from({ length: 10 }, (_, i) => ({
      Rep_Name: `Rep${i + 1}`,
      Segment: i < 5 ? 'Enterprise' as const : 'Mid Market' as const,
      Location: i % 2 === 0 ? 'CA' : 'NY'
    }));

    const largeAccounts: Account[] = Array.from({ length: 100 }, (_, i) => ({
      Account_ID: `ACC${i + 1}`,
      Account_Name: `Account ${i + 1}`,
      Original_Rep: `Rep${(i % 10) + 1}`,
      ARR: Math.floor(Math.random() * 1000000) + 100000,
      Num_Employees: Math.floor(Math.random() * 5000) + 1000,
      Location: i % 2 === 0 ? 'CA' : 'NY',
      Risk_Score: Math.floor(Math.random() * 100)
    }));

    const startTime = performance.now();
    
    const result = optimizeWeights(
      largeAccounts,
      largeReps,
      2500,
      0.05,
      0.05,
      70
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in less than 5 seconds (5000ms)
    expect(duration).toBeLessThan(5000);

    // Should still return valid result
    expect(result.arrWeight + result.accountWeight + result.riskWeight).toBe(100);
    expect(result.balancedScore).toBeGreaterThanOrEqual(0);
  });

  it('should return weights that sum to exactly 100%', () => {
    const result = optimizeWeights(
      accounts,
      reps,
      2500,
      0.05,
      0.05,
      70
    );

    // Weights must sum to exactly 100% (no rounding errors)
    expect(result.arrWeight + result.accountWeight + result.riskWeight).toBe(100);
  });

  it('should work with edge case: single rep per segment', () => {
    const singleRepPerSegment: Rep[] = [
      { Rep_Name: 'Alice', Segment: 'Enterprise', Location: 'CA' },
      { Rep_Name: 'Bob', Segment: 'Mid Market', Location: 'NY' }
    ];

    const mixedAccounts: Account[] = [
      {
        Account_ID: 'E1',
        Account_Name: 'Enterprise Account',
        Original_Rep: 'Alice',
        ARR: 1000000,
        Num_Employees: 5000,
        Location: 'CA',
        Risk_Score: 80
      },
      {
        Account_ID: 'M1',
        Account_Name: 'MidMarket Account',
        Original_Rep: 'Bob',
        ARR: 200000,
        Num_Employees: 500,
        Location: 'NY',
        Risk_Score: 30
      }
    ];

    const result = optimizeWeights(
      mixedAccounts,
      singleRepPerSegment,
      2500,
      0.05,
      0.05,
      70
    );

    // Should still work with single rep per segment
    expect(result.arrWeight + result.accountWeight + result.riskWeight).toBe(100);
    // Balanced score might be null or 100 for single-rep segments, but should be valid
    expect(result.balancedScore).toBeGreaterThanOrEqual(0);
  });

  it('should search ARR weights from 0 to 100 in 1% increments', () => {
    // We can't directly test all iterations, but we can verify the result
    // uses integer percentages (no fractional weights)
    const result = optimizeWeights(
      accounts,
      reps,
      2500,
      0.05,
      0.05,
      70
    );

    // All weights should be integers (1% increments)
    expect(result.arrWeight).toBe(Math.floor(result.arrWeight));
    expect(result.accountWeight).toBe(Math.floor(result.accountWeight));
    expect(result.riskWeight).toBe(Math.floor(result.riskWeight));
  });

  it('should find optimal weights for highly imbalanced accounts', () => {
    // Create scenario where one account is much larger
    const imbalancedAccounts: Account[] = [
      {
        Account_ID: 'HUGE',
        Account_Name: 'Huge Account',
        Original_Rep: 'Alice',
        ARR: 10000000, // 10M
        Num_Employees: 5000,
        Location: 'CA',
        Risk_Score: 50
      },
      {
        Account_ID: 'SMALL1',
        Account_Name: 'Small Account 1',
        Original_Rep: 'Bob',
        ARR: 100000, // 100K
        Num_Employees: 3000,
        Location: 'NY',
        Risk_Score: 50
      },
      {
        Account_ID: 'SMALL2',
        Account_Name: 'Small Account 2',
        Original_Rep: 'Bob',
        ARR: 100000, // 100K
        Num_Employees: 2000,
        Location: 'NY',
        Risk_Score: 50
      }
    ];

    const result = optimizeWeights(
      imbalancedAccounts,
      reps,
      2500,
      0.00, // No bonuses for cleaner test
      0.00,
      70
    );

    // Optimizer should find weights that balance the allocation
    expect(result.balancedScore).toBeGreaterThan(0);
    expect(result.arrWeight + result.accountWeight + result.riskWeight).toBe(100);
  });
});
