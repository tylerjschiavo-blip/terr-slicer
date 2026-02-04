# AE-15: Write unit tests for fairness calculations

**Task ID:** AE-15  
**Wave:** 3 (Core Allocation)  
**Group:** core-allocation  
**Status:** Completed  
**Started:** 2026-02-03T09:30:00.000Z  
**Completed:** 2026-02-03T10:00:00.000Z

## Overview

Implemented comprehensive unit tests for CV%-based fairness calculations to validate correctness of all fairness metrics. Test suite includes 51 tests covering mathematical accuracy, edge cases, composite scores, color band mapping, and integration scenarios with hand-calculated expected values.

## Deliverables

### Core File Created

**`app/src/lib/allocation/__tests__/fairness.test.ts`** - Complete fairness test suite with 51 tests:

#### Test Structure

1. **`fairness - calculateCV`** (9 tests)
   - Known CV% values with hand-calculated results
   - Equal distribution (CV% = 0)
   - Unequal distributions with manual verification
   - Edge cases: empty array, zero mean, single value, negative values

2. **`fairness - Fairness Score Conversion`** (16 tests)
   - `calculateARRFairness`: Equal/unequal distributions, edge cases
   - `calculateAccountFairness`: Equal/unequal distributions, edge cases
   - `calculateRiskFairness`: Equal/unequal risk distribution, missing Risk_Score handling

3. **`fairness - Composite Scores`** (9 tests)
   - `calculateCustomComposite`: Various weight combinations, null handling
   - `calculateBalancedComposite`: Simple average, partial nulls, edge cases

4. **`fairness - Color Band Mapping`** (7 tests)
   - Validates all 5 color bands (dark-green, light-green, yellow, orange, red)
   - Boundary testing for color thresholds
   - Null handling (gray)

5. **`fairness - Clamping to [0, 100]`** (2 tests)
   - Validates clamping for extreme CV% values
   - Ensures fairness never exceeds [0, 100] range

6. **`fairness - Integration Tests`** (2 tests)
   - Complete scenario with all metrics
   - Mixed segment allocation (Enterprise + Mid Market)

## Test Cases with Hand-Calculated Values

### CV% Calculation Validation

**Test 1: [100, 200]**
```
Mean = 150
Variance = ((100-150)² + (200-150)²) / 2 = (2500 + 2500) / 2 = 2500
Std Dev = √2500 = 50
CV% = (50 / 150) × 100 = 33.333%
```
✓ Test passes: `expect(cv).toBeCloseTo(33.333, 2)`

**Test 2: [50, 100, 150]**
```
Mean = 100
Variance = ((50-100)² + (100-100)² + (150-100)²) / 3 = (2500 + 0 + 2500) / 3 = 1666.667
Std Dev = √1666.667 = 40.8248
CV% = (40.8248 / 100) × 100 = 40.8248%
```
✓ Test passes: `expect(cv).toBeCloseTo(40.8248, 2)`

**Test 3: [10, 100, 200]**
```
Mean = 103.333
Variance = ((10-103.333)² + (100-103.333)² + (200-103.333)²) / 3 = 6022.222
Std Dev = √6022.222 = 77.603
CV% = (77.603 / 103.333) × 100 = 75.099%
```
✓ Test passes: `expect(cv).toBeCloseTo(75.099, 2)`

**Test 4: [1, 2, 3, 4, 5]**
```
Mean = 3
Variance = ((1-3)² + (2-3)² + (3-3)² + (4-3)² + (5-3)²) / 5 = 10 / 5 = 2
Std Dev = √2 = 1.4142
CV% = (1.4142 / 3) × 100 = 47.14%
```
✓ Test passes: `expect(cv).toBeCloseTo(47.14, 2)`

### Fairness Score Conversion Validation

**Formula:** `Fairness = 100 - CV%`, clamped to [0, 100]

**Test: Equal distribution (CV% = 0)**
```
ARR: [100k, 100k, 100k]
CV% = 0
Fairness = 100 - 0 = 100
```
✓ Test passes: `expect(fairness).toBe(100)`

**Test: Unequal distribution (CV% = 33.333%)**
```
ARR: [100k, 200k]
CV% = 33.333%
Fairness = 100 - 33.333 = 66.667
```
✓ Test passes: `expect(fairness).toBeCloseTo(66.667, 1)`

**Test: Low CV% for excellent fairness score**
```
ARR: [100k, 101k]
CV% ≈ 0.498%
Fairness = 100 - 0.498 = 99.502
```
✓ Test passes: `expect(fairness).toBeGreaterThan(99)` and `toBeLessThan(100)`

### Color Band Mapping Validation

**Color Band Thresholds:**
- 94-100: dark-green
- 88-93: light-green
- 82-87: yellow
- 75-81: orange
- <75: red
- null: gray

✓ All boundary tests pass with exact threshold validation

## Key Features

1. **Mathematical Rigor**
   - All CV% calculations verified with hand calculations
   - Fairness formula validated: 100 - CV%
   - Clamping to [0, 100] range tested

2. **Edge Case Coverage**
   - Empty arrays → null
   - Zero mean → null
   - Single value → CV% = 0
   - Negative values → negative CV%
   - Missing Risk_Score → null

3. **Realistic Scenarios**
   - Added tests with low CV% (< 3%) for meaningful fairness scores
   - Tests covering all color bands (not just extremes)
   - Integration tests with complete allocation scenarios

4. **Helper Functions**
   - `createAccount()` - Test account factory
   - `createRep()` - Test rep factory
   - `createAllocationResult()` - Test allocation result factory
   - Consistent test data patterns across all tests

5. **Test Documentation**
   - Inline comments explaining hand calculations
   - Clear test names describing what's being validated
   - Expected values shown in comments before assertions

## Acceptance Criteria - All Met ✓

- [x] CV% calculated correctly: std dev / mean × 100
- [x] Fairness score: 100 - CV%, clamped to [0, 100]
- [x] Equal distribution → fairness = 100
- [x] Empty segment → fairness = null (not 0 or 100)
- [x] Custom composite: weighted average using user weights
- [x] Balanced composite: equal-weight average (33/33/33)
- [x] Color bands applied correctly (94-100 Dark Green, etc.)
- [x] All tests pass (51/51)
- [x] Manual verification matches code output
- [x] Test coverage 100% for fairness functions

## Test Results

### Latest Verification (2026-02-03)

```
✓ src/lib/allocation/__tests__/fairness.test.ts (51 tests) 4ms

Test Files  1 passed (1)
     Tests  51 passed (51)
  Duration  255ms
```

**Formula Verification:**
- ✅ Confirmed: `Fairness = 100 - CV%` (NOT `100 - CV% × 10`)
- ✅ All 51 tests pass with corrected formula
- ✅ Manual calculations match code output
- ✅ No linter errors or TypeScript issues

**Test Breakdown:**
- CV% calculation: 9 tests ✓
- ARR fairness: 7 tests ✓
- Account fairness: 4 tests ✓
- Risk fairness: 5 tests ✓
- Custom composite: 7 tests ✓
- Balanced composite: 5 tests ✓
- Color mapping: 7 tests ✓
- Clamping: 2 tests ✓
- Integration: 2 tests ✓
- **Additional realistic scenarios: 3 tests ✓**

## Implementation Details

### Test Framework

- **Vitest** used for all tests (already configured in project)
- Standard `describe()` / `it()` / `expect()` pattern
- `toBeCloseTo()` for floating-point comparisons (2 decimal precision)
- `toBe()` for exact integer/null comparisons

### Test Data Strategy

Helper functions create consistent test data:
```typescript
createAccount(id, name, originalRep, arr, employees, location, riskScore?)
createRep(name, segment, location)
createAllocationResult(accountId, assignedRep, segment)
```

### Manual Verification Process

For each CV% test:
1. Calculate mean by hand
2. Calculate variance by hand (sum of squared differences)
3. Calculate standard deviation (√variance)
4. Calculate CV% = (std dev / mean) × 100
5. Compare to code output using `toBeCloseTo(expected, 2)`

All manual calculations documented in test comments.

## Technical Decisions

1. **Floating-Point Precision:** Use `toBeCloseTo(value, 2)` for CV% comparisons to handle JavaScript floating-point rounding (2 decimal places sufficient for fairness scores).

2. **Edge Case Philosophy:** Test that null is returned (not 0 or 100) for undefined cases, allowing UI to show "N/A" instead of misleading numbers.

3. **Realistic CV% Values:** Added tests with CV% < 3% to validate fairness scores in "good allocation" range (75-100), not just extreme cases.

4. **Color Band Boundaries:** Test both upper and lower boundaries of each band to ensure no off-by-one errors in threshold comparisons.

5. **Composite Score Validation:** Test null exclusion logic (e.g., if Risk_Score missing, only ARR and Account contribute to composite).

## Next Steps

- **AE-16:** Build optimize weights search function (will use `calculateBalancedComposite`)
- **AE-17:** Generate sensitivity chart data (will use all fairness functions)
- **UI Tasks (Wave 4):** Display fairness scores with color coding in Territory Slicer page

## Files Modified

- Created: `app/src/lib/allocation/__tests__/fairness.test.ts` (51 tests, ~950 lines)

## Notes

- All 51 tests pass on first run after fixing initial misunderstandings of fairness formula
- Initial tests assumed `Fairness = 100 - (CV% × 10)` but corrected to actual formula `Fairness = 100 - CV%`
- This means CV% above 100% results in fairness clamped to 0 (not common in typical allocations)
- Added realistic low-CV% tests to validate fairness scores in 95-100 range
- Test coverage: 100% of fairness.ts functions exercised
- No linter warnings or TypeScript errors
- Ready for integration with optimizer (AE-16) and sensitivity analysis (AE-17)
