/**
 * Performance Benchmark Script
 * 
 * Standalone script to run performance benchmarks and generate detailed report.
 * Run with: npm run tsx src/lib/__tests__/benchmark.ts
 */

import { allocateAccounts } from '../allocation/greedyAllocator';
import { generateSensitivityData } from '../allocation/sensitivity';
import { generateAuditTrail } from '../allocation/auditTrail';
import { calculateSegmentBasedFairness } from '../allocation/fairness';
import type { Account, Rep, AllocationConfig } from '../../types';

/**
 * Performance configuration
 */
const CONFIG = {
  iterations: 5,
  datasetSizes: {
    small: 1000,
    medium: 5000,
    large: 10000
  },
  targets: {
    allocation: { small: 200, medium: 500, large: 1000 },
    sensitivity: { small: 2000, medium: 5000 },
    auditTrail: { small: 500, medium: 2000, large: 5000 },
    fairness: { small: 100, medium: 300, large: 500 }
  }
};

/**
 * Generate test accounts
 */
function generateTestAccounts(count: number): Account[] {
  const accounts: Account[] = [];
  const locations = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'MA', 'GA', 'NC', 'VA'];
  const repNames = ['Rep_A', 'Rep_B', 'Rep_C', 'Rep_D', 'Rep_E', 'Rep_F', 'Rep_G', 'Rep_H'];

  for (let i = 0; i < count; i++) {
    const arr = Math.floor(10000 + Math.random() * 490000);
    const logMin = Math.log(50);
    const logMax = Math.log(50000);
    const employees = Math.floor(Math.exp(logMin + Math.random() * (logMax - logMin)));
    const location = locations[Math.floor(Math.random() * locations.length)];
    const originalRep = repNames[Math.floor(Math.random() * repNames.length)];
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
 * Generate test reps
 */
function generateTestReps(count: number): Rep[] {
  const reps: Rep[] = [];
  const locations = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'MA', 'GA', 'NC', 'VA'];
  const segments: ('Enterprise' | 'Mid Market')[] = ['Enterprise', 'Mid Market'];

  for (let i = 0; i < count; i++) {
    const segment = segments[i % 2];
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
 * Create test config
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
 * Measure execution time
 */
function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

/**
 * Run benchmark with multiple iterations
 */
function runBenchmark(name: string, fn: () => void, iterations: number): {
  min: number;
  max: number;
  average: number;
  median: number;
  times: number[];
} {
  console.log(`\n  Running ${name}...`);
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const time = measureTime(fn);
    times.push(time);
    console.log(`    Iteration ${i + 1}: ${time.toFixed(2)}ms`);
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
 * Format results
 */
function formatResults(results: ReturnType<typeof runBenchmark>, target: number): string {
  const status = results.average <= target ? '✓ PASS' : '✗ FAIL';
  const percentage = ((results.average / target) * 100).toFixed(1);
  return `${status} | avg: ${results.average.toFixed(2)}ms (${percentage}% of target ${target}ms) | min: ${results.min.toFixed(2)}ms | max: ${results.max.toFixed(2)}ms | median: ${results.median.toFixed(2)}ms`;
}

/**
 * Main benchmark runner
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  TERRITORY ALLOCATION ENGINE - PERFORMANCE BENCHMARK REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Date: ${new Date().toLocaleString()}`);
  console.log(`Iterations per test: ${CONFIG.iterations}`);
  console.log(`Node version: ${process.version}\n`);

  const allResults: Array<{
    category: string;
    test: string;
    size: string;
    results: ReturnType<typeof runBenchmark>;
    target: number;
    passed: boolean;
  }> = [];

  // ==================== ALLOCATION TESTS ====================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  1. ALLOCATION COMPUTATION (allocateAccounts)');
  console.log('═══════════════════════════════════════════════════════════════');

  // 1K accounts
  console.log('\n▶ Testing with 1,000 accounts (20 reps, ~50 accounts/rep)');
  const accounts1k = generateTestAccounts(CONFIG.datasetSizes.small);
  const reps20 = generateTestReps(20);
  const config = createTestConfig();
  
  const alloc1k = runBenchmark(
    'Allocation - 1K accounts',
    () => allocateAccounts(accounts1k, reps20, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(alloc1k, CONFIG.targets.allocation.small)}`);
  allResults.push({
    category: 'Allocation',
    test: 'allocateAccounts()',
    size: '1K accounts',
    results: alloc1k,
    target: CONFIG.targets.allocation.small,
    passed: alloc1k.average <= CONFIG.targets.allocation.small
  });

  // 5K accounts
  console.log('\n▶ Testing with 5,000 accounts (100 reps, ~50 accounts/rep)');
  const accounts5k = generateTestAccounts(CONFIG.datasetSizes.medium);
  const reps100 = generateTestReps(100);
  
  const alloc5k = runBenchmark(
    'Allocation - 5K accounts',
    () => allocateAccounts(accounts5k, reps100, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(alloc5k, CONFIG.targets.allocation.medium)}`);
  allResults.push({
    category: 'Allocation',
    test: 'allocateAccounts()',
    size: '5K accounts',
    results: alloc5k,
    target: CONFIG.targets.allocation.medium,
    passed: alloc5k.average <= CONFIG.targets.allocation.medium
  });

  // 10K accounts
  console.log('\n▶ Testing with 10,000 accounts (200 reps, ~50 accounts/rep)');
  const accounts10k = generateTestAccounts(CONFIG.datasetSizes.large);
  const reps200 = generateTestReps(200);
  
  const alloc10k = runBenchmark(
    'Allocation - 10K accounts',
    () => allocateAccounts(accounts10k, reps200, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(alloc10k, CONFIG.targets.allocation.large)}`);
  allResults.push({
    category: 'Allocation',
    test: 'allocateAccounts()',
    size: '10K accounts',
    results: alloc10k,
    target: CONFIG.targets.allocation.large,
    passed: alloc10k.average <= CONFIG.targets.allocation.large
  });

  // ==================== SENSITIVITY TESTS ====================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  2. SENSITIVITY CHART GENERATION (generateSensitivityData)');
  console.log('═══════════════════════════════════════════════════════════════');

  // 1K accounts
  console.log('\n▶ Testing with 1,000 accounts (20 reps)');
  const sens1k = runBenchmark(
    'Sensitivity - 1K accounts',
    () => generateSensitivityData(accounts1k, reps20, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(sens1k, CONFIG.targets.sensitivity.small)}`);
  allResults.push({
    category: 'Sensitivity',
    test: 'generateSensitivityData()',
    size: '1K accounts',
    results: sens1k,
    target: CONFIG.targets.sensitivity.small,
    passed: sens1k.average <= CONFIG.targets.sensitivity.small
  });

  // 5K accounts
  console.log('\n▶ Testing with 5,000 accounts (100 reps)');
  const sens5k = runBenchmark(
    'Sensitivity - 5K accounts',
    () => generateSensitivityData(accounts5k, reps100, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(sens5k, CONFIG.targets.sensitivity.medium)}`);
  allResults.push({
    category: 'Sensitivity',
    test: 'generateSensitivityData()',
    size: '5K accounts',
    results: sens5k,
    target: CONFIG.targets.sensitivity.medium,
    passed: sens5k.average <= CONFIG.targets.sensitivity.medium
  });

  // ==================== AUDIT TRAIL TESTS ====================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  3. AUDIT TRAIL GENERATION (generateAuditTrail)');
  console.log('═══════════════════════════════════════════════════════════════');

  // 1K accounts
  console.log('\n▶ Testing with 1,000 accounts (20 reps)');
  const audit1k = runBenchmark(
    'Audit Trail - 1K accounts',
    () => generateAuditTrail(accounts1k, reps20, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(audit1k, CONFIG.targets.auditTrail.small)}`);
  allResults.push({
    category: 'Audit Trail',
    test: 'generateAuditTrail()',
    size: '1K accounts',
    results: audit1k,
    target: CONFIG.targets.auditTrail.small,
    passed: audit1k.average <= CONFIG.targets.auditTrail.small
  });

  // 5K accounts
  console.log('\n▶ Testing with 5,000 accounts (100 reps)');
  const audit5k = runBenchmark(
    'Audit Trail - 5K accounts',
    () => generateAuditTrail(accounts5k, reps100, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(audit5k, CONFIG.targets.auditTrail.medium)}`);
  allResults.push({
    category: 'Audit Trail',
    test: 'generateAuditTrail()',
    size: '5K accounts',
    results: audit5k,
    target: CONFIG.targets.auditTrail.medium,
    passed: audit5k.average <= CONFIG.targets.auditTrail.medium
  });

  // 10K accounts
  console.log('\n▶ Testing with 10,000 accounts (200 reps)');
  const audit10k = runBenchmark(
    'Audit Trail - 10K accounts',
    () => generateAuditTrail(accounts10k, reps200, config),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(audit10k, CONFIG.targets.auditTrail.large)}`);
  allResults.push({
    category: 'Audit Trail',
    test: 'generateAuditTrail()',
    size: '10K accounts',
    results: audit10k,
    target: CONFIG.targets.auditTrail.large,
    passed: audit10k.average <= CONFIG.targets.auditTrail.large
  });

  // ==================== FAIRNESS TESTS ====================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  4. FAIRNESS CALCULATION (calculateSegmentBasedFairness)');
  console.log('═══════════════════════════════════════════════════════════════');

  // Pre-compute allocations for fairness tests
  const alloc1kResults = allocateAccounts(accounts1k, reps20, config);
  const alloc5kResults = allocateAccounts(accounts5k, reps100, config);
  const alloc10kResults = allocateAccounts(accounts10k, reps200, config);

  // 1K accounts
  console.log('\n▶ Testing with 1,000 accounts (20 reps)');
  const fair1k = runBenchmark(
    'Fairness - 1K accounts',
    () => calculateSegmentBasedFairness(
      reps20,
      alloc1kResults,
      accounts1k,
      { arr: 40, account: 30, risk: 30 },
      70
    ),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(fair1k, CONFIG.targets.fairness.small)}`);
  allResults.push({
    category: 'Fairness',
    test: 'calculateSegmentBasedFairness()',
    size: '1K accounts',
    results: fair1k,
    target: CONFIG.targets.fairness.small,
    passed: fair1k.average <= CONFIG.targets.fairness.small
  });

  // 5K accounts
  console.log('\n▶ Testing with 5,000 accounts (100 reps)');
  const fair5k = runBenchmark(
    'Fairness - 5K accounts',
    () => calculateSegmentBasedFairness(
      reps100,
      alloc5kResults,
      accounts5k,
      { arr: 40, account: 30, risk: 30 },
      70
    ),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(fair5k, CONFIG.targets.fairness.medium)}`);
  allResults.push({
    category: 'Fairness',
    test: 'calculateSegmentBasedFairness()',
    size: '5K accounts',
    results: fair5k,
    target: CONFIG.targets.fairness.medium,
    passed: fair5k.average <= CONFIG.targets.fairness.medium
  });

  // 10K accounts
  console.log('\n▶ Testing with 10,000 accounts (200 reps)');
  const fair10k = runBenchmark(
    'Fairness - 10K accounts',
    () => calculateSegmentBasedFairness(
      reps200,
      alloc10kResults,
      accounts10k,
      { arr: 40, account: 30, risk: 30 },
      70
    ),
    CONFIG.iterations
  );
  console.log(`  ${formatResults(fair10k, CONFIG.targets.fairness.large)}`);
  allResults.push({
    category: 'Fairness',
    test: 'calculateSegmentBasedFairness()',
    size: '10K accounts',
    results: fair10k,
    target: CONFIG.targets.fairness.large,
    passed: fair10k.average <= CONFIG.targets.fairness.large
  });

  // ==================== END-TO-END TEST ====================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  5. END-TO-END PERFORMANCE (Complete Allocation Flow)');
  console.log('═══════════════════════════════════════════════════════════════');

  console.log('\n▶ Testing complete flow with 1,000 accounts (20 reps)');
  console.log('  (Allocation → Fairness → Sensitivity → Audit Trail)');

  const e2eResults: number[] = [];
  const breakdownResults = {
    allocation: [] as number[],
    fairness: [] as number[],
    sensitivity: [] as number[],
    auditTrail: [] as number[]
  };

  for (let i = 0; i < CONFIG.iterations; i++) {
    let allocResults;
    let fairnessMetrics;
    let sensitivityData;
    let auditTrail;

    const allocTime = measureTime(() => {
      allocResults = allocateAccounts(accounts1k, reps20, config);
    });
    breakdownResults.allocation.push(allocTime);

    const fairTime = measureTime(() => {
      fairnessMetrics = calculateSegmentBasedFairness(
        reps20,
        allocResults,
        accounts1k,
        { arr: 40, account: 30, risk: 30 },
        70
      );
    });
    breakdownResults.fairness.push(fairTime);

    const sensTime = measureTime(() => {
      sensitivityData = generateSensitivityData(accounts1k, reps20, config);
    });
    breakdownResults.sensitivity.push(sensTime);

    const auditTime = measureTime(() => {
      auditTrail = generateAuditTrail(accounts1k, reps20, config);
    });
    breakdownResults.auditTrail.push(auditTime);

    const totalTime = allocTime + fairTime + sensTime + auditTime;
    e2eResults.push(totalTime);

    console.log(`\n  Iteration ${i + 1}:`);
    console.log(`    Allocation:   ${allocTime.toFixed(2)}ms`);
    console.log(`    Fairness:     ${fairTime.toFixed(2)}ms`);
    console.log(`    Sensitivity:  ${sensTime.toFixed(2)}ms`);
    console.log(`    Audit Trail:  ${auditTime.toFixed(2)}ms`);
    console.log(`    Total:        ${totalTime.toFixed(2)}ms`);
  }

  const avgAlloc = breakdownResults.allocation.reduce((a, b) => a + b, 0) / CONFIG.iterations;
  const avgFair = breakdownResults.fairness.reduce((a, b) => a + b, 0) / CONFIG.iterations;
  const avgSens = breakdownResults.sensitivity.reduce((a, b) => a + b, 0) / CONFIG.iterations;
  const avgAudit = breakdownResults.auditTrail.reduce((a, b) => a + b, 0) / CONFIG.iterations;
  const avgTotal = e2eResults.reduce((a, b) => a + b, 0) / CONFIG.iterations;

  console.log('\n  Average Times:');
  console.log(`    Allocation:   ${avgAlloc.toFixed(2)}ms`);
  console.log(`    Fairness:     ${avgFair.toFixed(2)}ms`);
  console.log(`    Sensitivity:  ${avgSens.toFixed(2)}ms`);
  console.log(`    Audit Trail:  ${avgAudit.toFixed(2)}ms`);
  console.log(`    Total:        ${avgTotal.toFixed(2)}ms`);

  // ==================== SUMMARY ====================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passedTests = allResults.filter(r => r.passed).length;
  const totalTests = allResults.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${passRate}%)`);
  console.log(`Failed: ${totalTests - passedTests}\n`);

  // Group by category
  const categories = ['Allocation', 'Sensitivity', 'Audit Trail', 'Fairness'];
  
  for (const category of categories) {
    const categoryResults = allResults.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const categoryTotal = categoryResults.length;
    
    console.log(`\n${category}:`);
    for (const result of categoryResults) {
      const status = result.passed ? '✓' : '✗';
      const percentage = ((result.results.average / result.target) * 100).toFixed(1);
      console.log(`  ${status} ${result.size}: ${result.results.average.toFixed(2)}ms (${percentage}% of ${result.target}ms target)`);
    }
  }

  // ==================== OPTIMIZATION OPPORTUNITIES ====================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  OPTIMIZATION OPPORTUNITIES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const failedTests = allResults.filter(r => !r.passed);
  
  if (failedTests.length === 0) {
    console.log('✓ All performance targets met!');
    console.log('  No immediate optimizations required.\n');
  } else {
    console.log('The following tests did not meet performance targets:\n');
    for (const test of failedTests) {
      const overage = ((test.results.average / test.target - 1) * 100).toFixed(1);
      console.log(`  ✗ ${test.test} - ${test.size}`);
      console.log(`    Current: ${test.results.average.toFixed(2)}ms | Target: ${test.target}ms | Overage: +${overage}%`);
    }
    console.log('\nRecommendations:');
    
    if (failedTests.some(t => t.category === 'Sensitivity')) {
      console.log('  1. Sensitivity Chart Generation:');
      console.log('     - Consider reducing number of threshold samples');
      console.log('     - Implement caching for repeated allocations');
      console.log('     - Use Web Workers for parallel computation');
    }
    
    if (failedTests.some(t => t.category === 'Allocation')) {
      console.log('  2. Allocation Computation:');
      console.log('     - Profile the greedy algorithm for bottlenecks');
      console.log('     - Consider using typed arrays for numeric operations');
      console.log('     - Optimize score calculation loops');
    }
    
    if (failedTests.some(t => t.category === 'Audit Trail')) {
      console.log('  3. Audit Trail Generation:');
      console.log('     - Implement lazy generation (compute on-demand)');
      console.log('     - Consider streaming/pagination for large datasets');
    }
    
    if (failedTests.some(t => t.category === 'Fairness')) {
      console.log('  4. Fairness Calculation:');
      console.log('     - Optimize CV% calculation with single-pass algorithms');
      console.log('     - Cache intermediate results');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  END OF REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Exit with appropriate code
  process.exit(failedTests.length > 0 ? 1 : 0);
}

// Run benchmark
main().catch(err => {
  console.error('Error running benchmarks:', err);
  process.exit(1);
});
