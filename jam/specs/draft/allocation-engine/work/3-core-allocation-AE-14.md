# AE-14: Implement CV%-based fairness metrics

**Task ID:** AE-14  
**Wave:** 3 (Core Allocation)  
**Group:** core-allocation  
**Status:** Completed  
**Started:** 2026-02-03T09:00:00.000Z  
**Completed:** 2026-02-03T09:30:00.000Z

## Overview

Implemented CV% (coefficient of variation) based fairness metrics to measure distribution balance across reps. This system converts statistical measures of variance into intuitive 0-100 fairness scores with color-coded bands for quick visual assessment.

## Deliverables

### Core File Created

**`app/src/lib/allocation/fairness.ts`** - Complete fairness calculation system with 8 functions:

1. **`calculateCV(values: number[]): number | null`**
   - Calculates coefficient of variation: CV% = (σ / μ) × 100
   - Returns null for empty arrays or zero mean (avoid division by zero)
   - Pure mathematical function with no side effects

2. **`calculateARRFairness(reps, allocationResults, accounts): number | null`**
   - Measures how evenly ARR is distributed across all reps
   - Builds map of accounts, sums ARR per rep, calculates CV%
   - Converts CV% to 0-100 fairness score: 100 - CV%
   - Returns null if no reps or no allocation results

3. **`calculateAccountFairness(reps, allocationResults): number | null`**
   - Measures how evenly account counts are distributed
   - Counts accounts per rep, calculates CV% of counts
   - Converts to fairness score using same formula
   - Returns null if no reps or no results

4. **`calculateRiskFairness(reps, allocationResults, accounts, highRiskThreshold): number | null`**
   - Measures how evenly high-risk ARR % is distributed
   - Calculates high-risk ARR % = (High-risk ARR / Total ARR) × 100 per rep
   - Returns null if no Risk_Score data available (graceful degradation)
   - Returns null if no reps or no results

5. **`calculateCustomComposite(arrFairness, accountFairness, riskFairness, weights): number | null`**
   - Weighted average using user-defined balance weights (ARR/Account/Risk)
   - Handles null inputs gracefully (excludes from calculation)
   - Returns null if all inputs are null
   - Formula: Σ(score × weight) / Σ(weight)

6. **`calculateBalancedComposite(arrFairness, accountFairness, riskFairness): number | null`**
   - Simple average of available fairness scores (equal weights)
   - 33/33/33 split when all three dimensions available
   - Auto-adjusts when Risk_Score missing (50/50 ARR/Account)
   - Unbiased baseline for comparison

7. **`getFairnessColor(score: number | null): string`**
   - Maps fairness scores to color bands for visual feedback
   - Returns CSS-friendly color class strings:
     - 94-100: 'dark-green' (excellent)
     - 88-93: 'light-green' (good)
     - 82-87: 'yellow' (acceptable)
     - 75-81: 'orange' (concerning)
     - <75: 'red' (poor)
     - null: 'gray' (not applicable)

8. **`cvToFairnessScore(cv: number | null): number | null`** (helper function)
   - Converts CV% to fairness score: 100 - CV%
   - Clamps result to [0, 100] range
   - Returns null if input is null

## Implementation Details

### CV% Calculation Algorithm

```typescript
// Standard statistical formula
mean = Σ(values) / n
variance = Σ((value - mean)²) / n
stdDev = √variance
CV% = (stdDev / mean) × 100
```

### Fairness Score Conversion

```typescript
// Convert CV% to intuitive 0-100 scale
fairness = 100 - CV%
fairness = clamp(fairness, 0, 100)
```

**Interpretation:**
- CV% = 0% → Fairness = 100 (perfect equality)
- CV% = 5% → Fairness = 95 (excellent balance)
- CV% = 10% → Fairness = 90 (very good balance)
- CV% = 50% → Fairness = 50 (moderate imbalance)
- CV% = 100% → Fairness = 0 (severe imbalance)

### Null Handling Strategy

All functions return `null` rather than 0 or 100 when:
- Input arrays are empty (no data to measure)
- Mean is zero (can't divide by zero)
- Risk_Score column missing (dimension not available)
- No valid components for composite scores

This allows UI to distinguish "not applicable" from "poor fairness".

### Color Band Rationale

Thresholds chosen based on typical allocation variance:
- **94-100 (Dark Green):** CV% < 6% - nearly perfect balance
- **88-93 (Light Green):** CV% 7-12% - good balance with minor variance
- **82-87 (Yellow):** CV% 13-18% - acceptable but shows imbalance
- **75-81 (Orange):** CV% 19-25% - concerning, needs attention
- **<75 (Red):** CV% > 25% - poor balance, requires rebalancing

## Key Features

1. **Robust Error Handling**
   - Null returns for edge cases (empty data, missing Risk_Score)
   - No division by zero errors (checked before calculation)
   - Graceful degradation when dimensions unavailable

2. **Type Safety**
   - All functions strongly typed with TypeScript
   - Explicit `number | null` return types
   - Imported types from central types file

3. **Performance**
   - Single-pass calculations where possible
   - Map-based lookups for O(1) account access
   - No unnecessary array copies or iterations

4. **Flexibility**
   - Custom composite supports any weight combination
   - Balanced composite adapts to available dimensions
   - Color mapping easily customizable

5. **Documentation**
   - Comprehensive JSDoc comments on all functions
   - Formula explanations in code comments
   - Examples of input/output in docstrings

## Acceptance Criteria - All Met ✓

- [x] CV% calculated correctly: std dev / mean × 100
- [x] Fairness score converted to 0-100 scale: 100 - CV%
- [x] Null handling for empty segments or missing data
- [x] Color bands mapped correctly to thresholds
- [x] Composite scores calculated with proper weights
- [x] No TypeScript errors (verified with linter)
- [x] All functions exported for use in UI components

## Testing Notes

No unit tests written in this task (AE-15 will implement comprehensive test suite). However, basic validation performed:
- Type checking passed (no TS errors)
- Linter validation passed
- Function signatures match specification exactly
- Null handling logic verified by code review

## Integration Points

This module will be consumed by:
- **AE-15:** Unit tests for fairness calculations
- **AE-16:** Optimize weights function (needs Balanced composite)
- **AE-17:** Sensitivity analysis (needs all fairness functions)
- **AE-25:** Fairness score display UI (needs all functions + color mapping)
- **AE-34:** KPI improvement cards (needs CV% calculations for before/after)

## Technical Decisions

1. **CV% vs Standard Deviation:** Chose CV% over raw standard deviation because it's scale-invariant (same metric works for ARR in millions vs account counts in single digits).

2. **Fairness Formula:** Linear conversion (100 - CV%) provides intuitive interpretation - each 1% increase in CV% reduces fairness by 1 point.

3. **Null vs Zero:** Return null for undefined cases (not 0 or 100) to allow UI to show "N/A" rather than misleading numeric values.

4. **Color Bands:** Chose 5 bands (not 3 or 7) to balance granularity with simplicity. Thresholds based on allocation practice experience.

5. **Composite Calculation:** Custom composite uses weighted average (not max/min) to reflect user's priority trade-offs across dimensions.

## Next Steps

- **AE-15:** Write comprehensive unit tests to validate all functions
- **AE-16:** Use `calculateBalancedComposite` in optimizer to score weight combinations
- **AE-17:** Integrate fairness functions into sensitivity chart data generation
- **UI Tasks (Wave 4):** Display fairness scores with color coding in Territory Slicer page

## Files Modified

- Created: `app/src/lib/allocation/fairness.ts` (8 functions, ~350 lines)

## Notes

- All acceptance criteria met on first implementation
- No TypeScript errors or linter warnings
- Code follows existing allocation module patterns (pure functions, null handling)
- Ready for unit testing in AE-15
