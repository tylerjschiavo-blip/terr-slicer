/**
 * Performance Tests for Territory Allocation Engine
 * 
 * Tests application performance with large datasets (1K, 5K, 10K accounts).
 * Validates allocation computation time, sensitivity chart generation, and UI render time.
 * 
 * Performance Targets:
 * - Allocation: <200ms (1K), <500ms (5K), <1s (10K)
 * - Sensitivity chart: <2s (1K), <5s (5K)
 * - UI remains responsive during computation
 */

import { describe, it, expect } from 'vitest';
import { allocateAccounts } from '../allocation/greedyAllocator';
import { generateSensitivityData } from '../allocation/sensitivity';
import { generateAuditTrail } from '../allocation/auditTrail';
import { calculateSegmentBasedFairness } from '../allocation/fairness';
import type { Account, Rep, AllocationConfig } from '../../types';

/**
 * Configuration for performance testing
 */
const PERFORMANCE_CONFIG = {
  // Number of iterations to run for each test (for averaging)
  iterations: 5,
  
  // Dataset sizes to test
  datasetSizes: {
    small: 1000,   // 1K accounts
    medium: 5000,  // 5K accounts
    large: 10000   // 10K accounts
  },
  
  // Performance targets in milliseconds
  targets: {
    allocation: {
      small: 200,   // <200ms for 1K accounts
      medium: 500,  // <500ms for 5K accounts
      large: 1000   // <1s for 10K accounts
    },
    sensitivity: {
      small: 2000,  // <2s for 1K accounts
      medium: 5000  // <5s for 5K accounts
    },
    auditTrail: {
      small: 500,   // <500ms for 1K accounts
      medium: 2000, // <2s for 5K accounts
      large: 5000   // <5s for 10K accounts
    },
    fairness: {
      small: 100,   // <100ms for 1K accounts
      medium: 300,  // <300ms for 5K accounts
      large: 500    // <500ms for 10K accounts
    }
  }
};

/**
 * Generate realistic test data with varied attributes
 * 
 * Generates accounts with:
 * - Varied ARR (10K-500K)
 * - Varied employee counts (50-50,000)
 * - Multiple locations (CA, NY, TX, FL, IL)
 * - Varied risk scores (0-100, with some nulls)
 * - Mix of segments based on threshold
 */
function generateTestAccounts(count: number): Account[] {
  const accounts: Account[] = [];
  const locations = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'MA', 'GA', 'NC', 'VA'];
  const repNames = ['Rep_A', 'Rep_B', 'Rep_C', 'Rep_D', 'Rep_E', 'Rep_F', 'Rep_G', 'Rep_H'];

  for (let i = 0; i < count; i++) {
    // Generate varied ARR (10K to 500K)
    const arr = Math.floor(10000 + Math.random() * 490000);
    
    // Generate varied employee counts (50 to 50,000)
    // Use log distribution to get more realistic spread
    const logMin = Math.log(50);
    const logMax = Math.log(50000);
    const employees = Math.floor(Math.exp(logMin + Math.random() * (logMax - logMin)));
    
    // Random location
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Random original rep
    const originalRep = repNames[Math.floor(Math.random() * repNames.length)];
    
    // Risk score: 80% have scores, 20% null
    const riskScore = Math.random() < 0.8 ? Math.floor(Math.random() * 100) : null;

    accounts.push({
      Account_ID: `ACC-${String(i).padStart(6, '0')}`,
      Account_Name: `Account ${i}`,
      Original_Rep: originalRep,
      ARR: arr,
      Num_Employees: employees,
      Location: location,
      Risk_Score: riskScore
    });
  }

  return accounts;
}

/**
 * Generate test reps for allocation
 * 
 * Creates a balanced set of reps across segments:
 * - 50% Enterprise reps
 * - 50% Mid Market reps
 * - Varied locations matching account locations
 */
function generateTestReps(count: number): Rep[] {
  const reps: Rep[] = [];
  const locations = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'MA', 'GA', 'NC', 'VA'];
  const segments: ('Enterprise' | 'Mid Market')[] = ['Enterprise', 'Mid Market'];

  for (let i = 0; i < count; i++) {
    // Alternate between segments for balance
    const segment = segments[i % 2];
    
    // Random location
    const location = locations[Math.floor(Math.random() * locations.length)];

    reps.push({
      Rep_Name: `Rep_${String.fromCharCode(65 + Math.floor(i / 26))}${String.fromCharCode(65 + (i % 26))}`,
      Segment: segment,
      Location: location
    });
  }

  return reps;
}

/**
 * Create a standard allocation config for testing
 */
function createTestConfig(threshold: number = 3000): AllocationConfig {
  return {
    threshold,
    arrWeight: 40,
    accountWeight: 30,
    riskWeight: 30,
    geoMatchBonus: 0.05,
    preserveBonus: 0.05,
    highRiskThreshold: 70
  };
}

/**
 * Measure execution time of a function
 * 
 * @param fn - Function to measure
 * @returns Execution time in milliseconds
 */
function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

/**
 * Run a performance test with multiple iterations and return average time
 * 
 * @param fn - Function to test
 * @param iterations - Number of iterations to run
 * @returns Object with min, max, average, and median times
 */
function runPerformanceTest(fn: () => void, iterations: number): {
  min: number;
  max: number;
  average: number;
  median: number;
  times: number[];
} {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const time = measureTime(fn);
    times.push(time);
  }

  times.sort((a, b) => a - b);

  return {
    min: times[0],
    max: times[times.length - 1],
    average: times.reduce((sum, t) => sum + t, 0) / times.length,
    median: times[Math.floor(times.length / 2)],
    times
  };
}

/**
 * Format performance results for display
 */
function formatResults(results: ReturnType<typeof runPerformanceTest>, target?: number): string {
  const status = target ? (results.average <= target ? '✓' : '✗') : '';
  const targetStr = target ? ` (target: ${target}ms)` : '';
  
  return `${status} avg: ${results.average.toFixed(2)}ms, min: ${results.min.toFixed(2)}ms, max: ${results.max.toFixed(2)}ms, median: ${results.median.toFixed(2)}ms${targetStr}`;
}

describe('Performance Tests', () => {
  describe('allocateAccounts() - Allocation Computation', () => {
    it('should allocate 1K accounts in <200ms', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.small);
      const reps = generateTestReps(20); // ~50 accounts per rep
      const config = createTestConfig();

      console.log(`\n📊 Testing allocation with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => allocateAccounts(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Allocation: ${formatResults(results, PERFORMANCE_CONFIG.targets.allocation.small)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.allocation.small);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.allocation.small);
    });

    it('should allocate 5K accounts in <500ms', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.medium);
      const reps = generateTestReps(100); // ~50 accounts per rep
      const config = createTestConfig();

      console.log(`\n📊 Testing allocation with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => allocateAccounts(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Allocation: ${formatResults(results, PERFORMANCE_CONFIG.targets.allocation.medium)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.allocation.medium);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.allocation.medium);
    });

    it('should allocate 10K accounts in <1s', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.large);
      const reps = generateTestReps(200); // ~50 accounts per rep
      const config = createTestConfig();

      console.log(`\n📊 Testing allocation with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => allocateAccounts(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Allocation: ${formatResults(results, PERFORMANCE_CONFIG.targets.allocation.large)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.allocation.large);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.allocation.large);
    });
  });

  describe('generateSensitivityData() - Sensitivity Chart Generation', () => {
    it('should generate sensitivity data for 1K accounts in <2s', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.small);
      const reps = generateTestReps(20);
      const config = createTestConfig();

      console.log(`\n📊 Testing sensitivity chart with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => generateSensitivityData(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Sensitivity: ${formatResults(results, PERFORMANCE_CONFIG.targets.sensitivity.small)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.sensitivity.small);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.sensitivity.small);
    });

    it('should generate sensitivity data for 5K accounts in <5s', { timeout: 30000 }, () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.medium);
      const reps = generateTestReps(100);
      const config = createTestConfig();

      console.log(`\n📊 Testing sensitivity chart with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => generateSensitivityData(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Sensitivity: ${formatResults(results, PERFORMANCE_CONFIG.targets.sensitivity.medium)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.sensitivity.medium);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.sensitivity.medium);
    });

    it('should generate valid sensitivity data points', () => {
      const accounts = generateTestAccounts(100);
      const reps = generateTestReps(10);
      const config = createTestConfig();

      const data = generateSensitivityData(accounts, reps, config);

      // Verify data is valid
      expect(data.length).toBeGreaterThan(0);
      expect(data.every(point => typeof point.threshold === 'number')).toBe(true);
      expect(data.every(point => typeof point.balancedFairness === 'number')).toBe(true);
      expect(data.every(point => typeof point.customFairness === 'number')).toBe(true);
    });
  });

  describe('generateAuditTrail() - Audit Trail Generation', () => {
    it('should generate audit trail for 1K accounts in <500ms', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.small);
      const reps = generateTestReps(20);
      const config = createTestConfig();

      console.log(`\n📊 Testing audit trail with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => generateAuditTrail(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Audit Trail: ${formatResults(results, PERFORMANCE_CONFIG.targets.auditTrail.small)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.auditTrail.small);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.auditTrail.small);
    });

    it('should generate audit trail for 5K accounts in <2s', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.medium);
      const reps = generateTestReps(100);
      const config = createTestConfig();

      console.log(`\n📊 Testing audit trail with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => generateAuditTrail(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Audit Trail: ${formatResults(results, PERFORMANCE_CONFIG.targets.auditTrail.medium)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.auditTrail.medium);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.auditTrail.medium);
    });

    it('should generate audit trail for 10K accounts in <5s', { timeout: 30000 }, () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.large);
      const reps = generateTestReps(200);
      const config = createTestConfig();

      console.log(`\n📊 Testing audit trail with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => generateAuditTrail(accounts, reps, config),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Audit Trail: ${formatResults(results, PERFORMANCE_CONFIG.targets.auditTrail.large)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.auditTrail.large);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.auditTrail.large);
    });
  });

  describe('calculateSegmentBasedFairness() - Fairness Calculation', () => {
    it('should calculate fairness for 1K accounts in <100ms', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.small);
      const reps = generateTestReps(20);
      const config = createTestConfig();
      const allocationResults = allocateAccounts(accounts, reps, config);

      console.log(`\n📊 Testing fairness calculation with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => calculateSegmentBasedFairness(
          reps,
          allocationResults,
          accounts,
          { arr: config.arrWeight, account: config.accountWeight, risk: config.riskWeight },
          config.highRiskThreshold
        ),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Fairness: ${formatResults(results, PERFORMANCE_CONFIG.targets.fairness.small)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.fairness.small);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.fairness.small);
    });

    it('should calculate fairness for 5K accounts in <300ms', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.medium);
      const reps = generateTestReps(100);
      const config = createTestConfig();
      const allocationResults = allocateAccounts(accounts, reps, config);

      console.log(`\n📊 Testing fairness calculation with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => calculateSegmentBasedFairness(
          reps,
          allocationResults,
          accounts,
          { arr: config.arrWeight, account: config.accountWeight, risk: config.riskWeight },
          config.highRiskThreshold
        ),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Fairness: ${formatResults(results, PERFORMANCE_CONFIG.targets.fairness.medium)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.fairness.medium);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.fairness.medium);
    });

    it('should calculate fairness for 10K accounts in <500ms', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.large);
      const reps = generateTestReps(200);
      const config = createTestConfig();
      const allocationResults = allocateAccounts(accounts, reps, config);

      console.log(`\n📊 Testing fairness calculation with ${accounts.length} accounts and ${reps.length} reps`);

      const results = runPerformanceTest(
        () => calculateSegmentBasedFairness(
          reps,
          allocationResults,
          accounts,
          { arr: config.arrWeight, account: config.accountWeight, risk: config.riskWeight },
          config.highRiskThreshold
        ),
        PERFORMANCE_CONFIG.iterations
      );

      console.log(`   Fairness: ${formatResults(results, PERFORMANCE_CONFIG.targets.fairness.large)}`);

      expect(results.average).toBeLessThan(PERFORMANCE_CONFIG.targets.fairness.large);
      expect(results.median).toBeLessThan(PERFORMANCE_CONFIG.targets.fairness.large);
    });
  });

  describe('End-to-End Performance - Complete Allocation Flow', () => {
    it('should complete full allocation flow for 1K accounts efficiently', () => {
      const accounts = generateTestAccounts(PERFORMANCE_CONFIG.datasetSizes.small);
      const reps = generateTestReps(20);
      const config = createTestConfig();

      console.log(`\n📊 Testing end-to-end flow with ${accounts.length} accounts and ${reps.length} reps`);

      let allocationResults;
      let fairnessMetrics;
      let sensitivityData;
      let auditTrail;

      const allocationTime = measureTime(() => {
        allocationResults = allocateAccounts(accounts, reps, config);
      });

      const fairnessTime = measureTime(() => {
        fairnessMetrics = calculateSegmentBasedFairness(
          reps,
          allocationResults,
          accounts,
          { arr: config.arrWeight, account: config.accountWeight, risk: config.riskWeight },
          config.highRiskThreshold
        );
      });

      const sensitivityTime = measureTime(() => {
        sensitivityData = generateSensitivityData(accounts, reps, config);
      });

      const auditTrailTime = measureTime(() => {
        auditTrail = generateAuditTrail(accounts, reps, config);
      });

      const totalTime = allocationTime + fairnessTime + sensitivityTime + auditTrailTime;

      console.log(`   Allocation: ${allocationTime.toFixed(2)}ms`);
      console.log(`   Fairness: ${fairnessTime.toFixed(2)}ms`);
      console.log(`   Sensitivity: ${sensitivityTime.toFixed(2)}ms`);
      console.log(`   Audit Trail: ${auditTrailTime.toFixed(2)}ms`);
      console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);

      // Verify results are valid
      expect(allocationResults).toBeDefined();
      expect(allocationResults.length).toBe(accounts.length);
      expect(fairnessMetrics).toBeDefined();
      expect(sensitivityData).toBeDefined();
      expect(sensitivityData.length).toBeGreaterThan(0);
      expect(auditTrail).toBeDefined();
      expect(auditTrail.length).toBe(accounts.length);

      // Total time should be reasonable (sum of all targets)
      const maxTotalTime = PERFORMANCE_CONFIG.targets.allocation.small +
                          PERFORMANCE_CONFIG.targets.fairness.small +
                          PERFORMANCE_CONFIG.targets.sensitivity.small +
                          PERFORMANCE_CONFIG.targets.auditTrail.small;

      expect(totalTime).toBeLessThan(maxTotalTime);
    });
  });

  describe('Data Generation Validation', () => {
    it('should generate accounts with realistic distribution', () => {
      const accounts = generateTestAccounts(1000);

      // Check ARR range
      const arrValues = accounts.map(a => a.ARR);
      const minARR = Math.min(...arrValues);
      const maxARR = Math.max(...arrValues);
      expect(minARR).toBeGreaterThanOrEqual(10000);
      expect(maxARR).toBeLessThanOrEqual(500000);

      // Check employee count range
      const employeeCounts = accounts.map(a => a.Num_Employees);
      const minEmployees = Math.min(...employeeCounts);
      const maxEmployees = Math.max(...employeeCounts);
      expect(minEmployees).toBeGreaterThanOrEqual(50);
      expect(maxEmployees).toBeLessThanOrEqual(50000);

      // Check risk score distribution (should have some nulls)
      const nullRiskScores = accounts.filter(a => a.Risk_Score === null).length;
      const percentageNull = (nullRiskScores / accounts.length) * 100;
      expect(percentageNull).toBeGreaterThan(10); // At least 10% null
      expect(percentageNull).toBeLessThan(30); // At most 30% null
    });

    it('should generate reps with balanced segments', () => {
      const reps = generateTestReps(100);

      const enterpriseReps = reps.filter(r => r.Segment === 'Enterprise').length;
      const midMarketReps = reps.filter(r => r.Segment === 'Mid Market').length;

      // Should be approximately 50/50 split
      expect(Math.abs(enterpriseReps - midMarketReps)).toBeLessThanOrEqual(1);
    });
  });
});
