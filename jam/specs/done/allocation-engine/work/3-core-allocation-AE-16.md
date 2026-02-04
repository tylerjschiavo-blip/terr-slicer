# AE-16: Build optimize weights search function

**Task ID:** AE-16  
**Wave:** 3 (Core Allocation)  
**Group:** core-allocation  
**Status:** Completed  
**Started:** 2026-02-03T23:36:00.000Z  
**Completed:** 2026-02-03T23:37:00.000Z

## Overview

Implemented brute-force optimization function that searches all valid weight combinations (1% increments) to find the weights that maximize Balanced fairness (33/33/33 composite) at the current threshold. The optimizer handles missing Risk_Score data by constraining search space to ARR/Account weights only.

## Deliverables

### Core File Created

**`app/src/lib/allocation/optimizer.ts`** - Weight optimization module with `optimizeWeights()` function

#### Function Signature

```typescript
export function optimizeWeights(
  accounts: Account[],
  reps: Rep[],
  threshold: number,
  geoMatchBonus: number,
  preserveBonus: number,
  highRiskThreshold: number
): OptimizationResult
```

#### Return Type

```typescript
export interface OptimizationResult {
  arrWeight: number;       // Recommended ARR weight (0-100)
  accountWeight: number;   // Recommended Account weight (0-100)
  riskWeight: number;      // Recommended Risk weight (0-100)
  balancedScore: number;   // Resulting Balanced fairness score (0-100)
}
```

### Algorithm Details

**Search Strategy:**
1. Detect if Risk_Score is available in data
2. If Risk_Score missing: only search ARR/Account weights (Risk locked to 0%)
3. Iterate through all valid weight combinations:
   - ARR weight: 0-100% in 1% steps (101 values)
   - Account weight: 0 to (100 - ARR weight)% in 1% steps
   - Risk weight: 100 - ARR weight - Account weight
4. For each weight combination:
   - Run allocation with these weights
   - Calculate Balanced fairness (33/33/33 composite)
   - Track best result
5. Return weights with highest Balanced score

**Search Space Size:**
- With Risk_Score: (101 × 102) / 2 = 5,151 combinations
- Without Risk_Score: Same (5,151 combinations for ARR + Account only)

**Optimization Target:**
- **Balanced fairness** (33/33/33 composite), NOT Custom fairness
- This provides unbiased weight recommendations

## Test Suite

**`app/src/lib/allocation/__tests__/optimizer.test.ts`** - Comprehensive test suite with 9 tests

### Test Coverage

1. **`should search all valid weight combinations and return best result`**
   - Validates result structure (arrWeight, accountWeight, riskWeight, balancedScore)
   - Ensures weights sum to exactly 100%
   - Verifies each weight is in [0, 100] range
   - Validates balancedScore is in [0, 100] range

2. **`should allow 0% weight for any driver (no minimum constraints)`**
   - Tests with balanced accounts where one driver might be 0%
   - Verifies optimizer doesn't enforce artificial minimums

3. **`should maximize Balanced fairness (33/33/33 composite)`**
   - Confirms optimization target is Balanced composite
   - Validates reasonable score returned

4. **`should handle missing Risk_Score by locking Risk weight to 0%`**
   - Tests with accounts where Risk_Score = null
   - Verifies riskWeight = 0 in result
   - Ensures ARR + Account weights sum to 100%
   - Confirms valid Balanced score still returned

5. **`should complete in reasonable time for typical datasets`**
   - Tests with 10 reps and 100 accounts
   - Verifies completion in < 5 seconds (5000ms)
   - Confirms valid result structure

6. **`should return weights that sum to exactly 100%`**
   - Validates no rounding errors in weight calculation
   - Ensures exact integer arithmetic

7. **`should work with edge case: single rep per segment`**
   - Tests with 1 Enterprise rep and 1 Mid Market rep
   - Validates handling of minimal rep scenarios

8. **`should search ARR weights from 0 to 100 in 1% increments`**
   - Verifies all weights are integers (no fractional percentages)
   - Confirms 1% increment constraint

9. **`should find optimal weights for highly imbalanced accounts`**
   - Tests with 1 huge account (10M ARR) and 2 small accounts (100K each)
   - Validates optimizer can balance extreme disparities

## Test Results

### Latest Verification (2026-02-03)

```
✓ src/lib/allocation/__tests__/optimizer.test.ts (9 tests) 412ms
    ✓ should complete in reasonable time for typical datasets  337ms

Test Files  1 passed (1)
     Tests  9 passed (9)
  Duration  590ms
```

**Performance Benchmarks:**
- ✅ 10 reps × 100 accounts: ~337ms (well under 5s target)
- ✅ All 9 tests pass on first run
- ✅ No linter errors or TypeScript issues

**Test Breakdown:**
- Basic functionality: 3 tests ✓
- Missing Risk_Score handling: 1 test ✓
- Performance validation: 1 test ✓
- Edge cases: 2 tests ✓
- Constraints validation: 2 tests ✓

## Acceptance Criteria - All Met ✓

- [x] Searches all valid weight combinations (sum to 100%, 1% increments)
- [x] No minimum constraints (optimizer may recommend 0% for any driver)
- [x] Optimization target: maximize Balanced fairness (33/33/33 composite)
- [x] Runs allocation for each weight combination
- [x] Returns best weights and resulting Balanced score
- [x] Handles missing Risk_Score: only searches ARR/Account weights (Risk locked to 0%)
- [x] Completes in reasonable time (<5 seconds for typical datasets)

## Key Features

1. **Exhaustive Search**
   - Tests all 5,151 valid weight combinations
   - No heuristics or shortcuts - guarantees finding global maximum
   - Deterministic results (same input = same output)

2. **Missing Risk_Score Handling**
   - Detects missing Risk_Score: `accounts.some(acc => acc.Risk_Score !== null)`
   - Automatically skips weight combinations with riskWeight > 0
   - Reduces search space for data without risk dimension

3. **Optimization Target**
   - Uses Balanced composite (33/33/33) for scoring
   - Unbiased recommendation independent of user's current weights
   - Provides objective "best" weights for exploration

4. **Performance**
   - Completes in ~337ms for 10 reps × 100 accounts
   - Reasonable for typical datasets (<1,000 accounts)
   - May be slow for very large datasets (10K+ accounts)
   - Future optimization opportunity: early termination if score plateaus

5. **Type Safety**
   - Full TypeScript type definitions
   - Explicit `OptimizationResult` interface
   - Integration with existing allocation types

## Implementation Details

### Dependencies

- **`allocateAccounts`** from `greedyAllocator.ts` - Runs allocation with each weight combination
- **Fairness functions** from `fairness.ts`:
  - `calculateARRFairness` - ARR distribution fairness
  - `calculateAccountFairness` - Account count distribution fairness
  - `calculateRiskFairness` - Risk distribution fairness
  - `calculateBalancedComposite` - 33/33/33 composite scoring

### Algorithm Complexity

**Time Complexity:** O(W² × A × R)
- W = 101 weight values (0-100% in 1% steps)
- A = number of accounts
- R = number of reps

**Space Complexity:** O(1)
- Only stores best result
- No intermediate storage of all results

**Example Performance:**
- 10 reps × 100 accounts × 5,151 combinations = ~51.5M allocation operations
- Actual runtime: 337ms
- ~6.5µs per allocation operation

### Search Space Reduction

**With Risk_Score available:**
- Total combinations: 5,151
- All weights from 0-100% explored

**Without Risk_Score:**
- Total combinations: 5,151 (same)
- But skip combinations where riskWeight > 0
- Effective combinations: 5,151 (ARR + Account only)

The key insight: whether Risk_Score exists or not, we still search the same number of combinations, but we constrain riskWeight differently.

## Technical Decisions

1. **Brute-Force vs Heuristic:** Chose exhaustive search over heuristics (gradient descent, genetic algorithms) for simplicity and guaranteed global maximum. With only 5,151 combinations, brute-force is fast enough.

2. **Optimization Target:** Use Balanced composite (not Custom) to provide unbiased recommendations. Custom composite would be circular - optimizing for user's current priorities.

3. **Integer Weights Only:** Enforce 1% increment constraint (no fractional percentages like 33.33%) for simplicity and UI slider compatibility.

4. **Early Termination:** Not implemented in v1. Could add optimization: if Balanced score hasn't improved in last 500 combinations, stop early.

5. **Parallelization:** Not implemented. Could use Web Workers for parallel search, but adds complexity and may not be needed for typical datasets.

## Integration Points

### Used By

- **AE-30:** Optimize Weights button (`OptimizeWeightsButton.tsx`)
  - Calls `optimizeWeights()` when user clicks "Optimize Weights"
  - Displays results in modal with current/recommended weights
  - Allows user to apply recommended weights to sliders

### Uses

- **AE-11:** `allocateAccounts()` from `greedyAllocator.ts`
- **AE-14:** Fairness functions from `fairness.ts`

## Next Steps

- **AE-17:** Generate sensitivity chart data (will use similar iteration approach)
- **AE-30:** Build Optimize Weights button and modal UI (will call `optimizeWeights()`)
- **Future optimization:** Add progress callback for long-running optimizations (10K+ accounts)

## Files Created

- `app/src/lib/allocation/optimizer.ts` (~120 lines)
- `app/src/lib/allocation/__tests__/optimizer.test.ts` (~280 lines, 9 tests)

## Performance Considerations

### Current Performance (v1)

- ✅ Fast enough for typical datasets (<1,000 accounts)
- ✅ Completes in <500ms for 100 accounts
- ⚠️ May be slow for large datasets (10K+ accounts)

### Future Optimizations (if needed)

1. **Early Termination:** Stop if score hasn't improved in last N combinations
2. **Web Workers:** Run optimization in background thread to avoid UI blocking
3. **Progress Callback:** Show progress bar for long-running optimizations
4. **Heuristic Search:** Use gradient descent for 10K+ account datasets
5. **Caching:** Memoize allocation results for repeated weight combinations

## Notes

- All 9 tests pass on first run
- Optimizer is deterministic (same input = same output)
- Works correctly with and without Risk_Score
- Ready for integration with UI (AE-30)
- No linter warnings or TypeScript errors
- Performance well within acceptable range (<5s target)
- Algorithm is simple and auditable (important for transparency)
- Future optimization possible but not needed for v1
