# Work Log: AE-11 - Implement Weighted Greedy Allocation Algorithm

**Task ID:** AE-11  
**Wave:** 3 (Core Allocation Engine)  
**Group:** core-allocation  
**Role:** web-implementer  
**Skill:** web-development  
**Status:** ✅ Completed  
**Started:** 2026-02-03 07:00:00 UTC  
**Completed:** 2026-02-03 07:30:00 UTC

---

## Summary

Implemented the core weighted greedy allocation algorithm that assigns accounts to reps within each segment based on blended need scores. Accounts are processed in descending ARR order for fairness, with tie-breaking by Account_ID for deterministic results.

---

## Deliverables

### ✅ `app/src/lib/allocation/greedyAllocator.ts`

Implemented the complete allocation engine with five core functions and supporting types:

#### Public API Functions

1. **`calculateTargetARR(reps, accounts)`**
   - Calculates target ARR per rep for a segment
   - Returns: `totalARR / numberOfReps`
   - Handles empty rep arrays (returns 0)

2. **`calculateTargetAccounts(reps, accounts)`**
   - Calculates target account count per rep for a segment
   - Returns: `totalAccounts / numberOfReps`
   - Handles empty rep arrays (returns 0)

3. **`calculateTargetRiskARR(reps, accounts, highRiskThreshold)`**
   - Calculates target high-risk ARR per rep for a segment
   - Only counts ARR from accounts with `Risk_Score >= highRiskThreshold`
   - Returns: `totalRiskARR / numberOfReps`
   - Handles null Risk_Score values gracefully

4. **`calculateBlendedScore(repState, targetARR, targetAccounts, targetRiskARR, config)`**
   - Calculates normalized need score across three dimensions
   - Formula: `(ARR Need × ARR Weight) + (Account Need × Account Weight) + (Risk Need × Risk Weight)`
   - Each Need = `(Target - Current) / Target`
   - Positive score (0 to 1) = under target (higher = more need)
   - Negative score = over target (lower priority)
   - Weights are normalized from percentage (0-100) to decimal (0-1)

5. **`allocateAccounts(accounts, reps, config)`**
   - Main allocation function that orchestrates the entire process
   - Returns array of `AllocationResult` objects with scores

#### Algorithm Flow

1. **Segmentation**: Split accounts into Enterprise and Mid Market using threshold
2. **Rep Filtering**: Filter reps by segment (E accounts → E reps, MM accounts → MM reps)
3. **Per-Segment Allocation**:
   - Calculate targets (ARR, Accounts, Risk ARR) for segment
   - Initialize rep states (track current ARR, account count, risk ARR)
   - Sort accounts by descending ARR, then Account_ID
   - For each account:
     - Calculate blended score for all eligible reps
     - Find winner (highest total score = most under target)
     - Apply tie-breaking: lowest current ARR, then alphabetical by Rep_Name
     - Assign account to winner
     - Update winner's state (ARR, account count, risk ARR)
   - Return allocation results with scores

#### Internal Types

- **`RepState`**: Tracks rep's current state during allocation
  - `rep`: The Rep object
  - `currentARR`: Accumulated ARR from assigned accounts
  - `currentAccounts`: Count of assigned accounts
  - `currentRiskARR`: Accumulated ARR from high-risk accounts
  - `assignedAccountIds`: Array of assigned account IDs

---

## Acceptance Criteria

All acceptance criteria from PLAN-webapp.md met:

- ✅ Accounts assigned only to reps in matching segment (Enterprise accounts → Enterprise reps)
- ✅ Blended scores calculated correctly (positive = under target, negative = over target)
- ✅ Accounts processed in descending ARR order (then by Account_ID for determinism)
- ✅ Results include all score components (blendedScore, geoBonus, preserveBonus, totalScore)
- ✅ No TypeScript or linter errors
- ✅ Allocation is deterministic (same input = same output)
- ✅ Handles empty segments gracefully (no errors)
- ✅ Tie-breaking implemented (lowest current ARR, then alphabetical)

---

## Implementation Notes

### Design Decisions

1. **Segment Isolation**: Enterprise and Mid Market segments are processed completely independently. No cross-segment assignment is possible.

2. **Deterministic Ordering**: Accounts are sorted by:
   - Primary: Descending ARR (largest accounts first for fairness)
   - Secondary: Ascending Account_ID (consistent tie-breaking)

3. **State Tracking**: Used `RepState` interface to track each rep's current state during allocation:
   - Simplifies score calculations
   - Enables accurate need tracking
   - Supports high-risk ARR tracking for fairness metrics

4. **Score Calculation**:
   - Need formula: `(Target - Current) / Target`
   - Normalized to [-∞, 1] range
   - Positive = under target (0 to 1, higher = more need)
   - Negative = over target (lower priority)
   - Zero = exactly at target

5. **Preference Bonuses Placeholder**: 
   - Current implementation sets geoBonus and preserveBonus to 0
   - AE-13 will implement the actual bonus calculation logic
   - Structure is in place for easy integration

6. **Tie-Breaking Strategy**:
   - When total scores are equal:
     1. Rep with lowest current ARR wins (balances workload)
     2. If still tied, alphabetical by Rep_Name (deterministic)

7. **Risk Handling**:
   - High-risk ARR tracked separately for fairness metrics
   - Null Risk_Score values treated as not high-risk
   - Risk weight can be 0% if Risk_Score column missing

### Code Quality

- All functions have comprehensive JSDoc comments
- Clear separation of concerns (public API vs internal helpers)
- TypeScript strict mode compliant
- Descriptive variable names
- Minimal external dependencies (only segmentation module)
- Pure functions where possible (no global state)
- No linter warnings or errors

### Performance Characteristics

- Segmentation: O(n) where n = number of accounts
- Sorting: O(n log n) per segment
- Allocation: O(n × m) where n = accounts, m = reps per segment
- Overall: O(n log n + n × m) - reasonable for typical datasets (<10K accounts, <100 reps)

---

## Algorithm Walkthrough

### Example Scenario

**Inputs:**
- 4 accounts: A ($100K), B ($80K), C ($50K), D ($30K)
- 2 Enterprise reps: Alice, Bob
- Threshold: 1000 employees (all accounts are Enterprise)
- Weights: 50% ARR, 30% Account, 20% Risk

**Target Calculations:**
- Target ARR = $260K / 2 = $130K per rep
- Target Accounts = 4 / 2 = 2 accounts per rep

**Processing Order:** A, B, C, D (descending ARR)

**Step 1: Assign Account A ($100K)**
- Alice: ARR Need = (130-0)/130 = 1.0, Account Need = (2-0)/2 = 1.0
  - Blended = 1.0×0.5 + 1.0×0.3 = 0.80
- Bob: Same as Alice = 0.80
- Tie-breaker: Both at 0 ARR → Alphabetical → **Alice wins**
- Alice: ARR=$100K, Accounts=1

**Step 2: Assign Account B ($80K)**
- Alice: ARR Need = (130-100)/130 = 0.23, Account Need = (2-1)/2 = 0.5
  - Blended = 0.23×0.5 + 0.5×0.3 = 0.265
- Bob: ARR Need = 1.0, Account Need = 1.0
  - Blended = 0.80
- **Bob wins** (0.80 > 0.265)
- Bob: ARR=$80K, Accounts=1

**Step 3: Assign Account C ($50K)**
- Alice: ARR Need = (130-100)/130 = 0.23, Account Need = 0.5
  - Blended = 0.265
- Bob: ARR Need = (130-80)/130 = 0.38, Account Need = 0.5
  - Blended = 0.38×0.5 + 0.5×0.3 = 0.34
- **Bob wins** (0.34 > 0.265)
- Bob: ARR=$130K, Accounts=2

**Step 4: Assign Account D ($30K)**
- Alice: ARR Need = 0.23, Account Need = 0.5
  - Blended = 0.265
- Bob: ARR Need = (130-130)/130 = 0.0, Account Need = 0.0
  - Blended = 0.0
- **Alice wins** (0.265 > 0.0)
- Alice: ARR=$130K, Accounts=2

**Final Result:**
- Alice: 2 accounts ($130K total)
- Bob: 2 accounts ($130K total)
- Perfect balance achieved!

---

## Testing Notes

Unit tests scheduled for AE-12 should cover:

### Basic Functionality
- 2 reps, 4 accounts, equal weights
- Verify segment isolation (E accounts → E reps only)
- Verify descending ARR order processing

### Score Calculations
- Blended score calculation accuracy
- Positive scores for under-target reps
- Negative scores for over-target reps
- Zero scores at exact target
- Weight normalization (percentage to decimal)

### Edge Cases
- Empty segments (no error, empty results)
- Single rep per segment (all accounts to that rep)
- All accounts same ARR (Account_ID tie-breaking)
- Zero ARR accounts
- Null Risk_Score handling

### Tie-Breaking
- Equal total scores → lowest ARR wins
- Equal total scores + equal ARR → alphabetical wins

### Determinism
- Same inputs → same outputs
- Consistent ordering across runs

---

## Next Steps

**Immediate Dependencies:**
1. **AE-12**: Write unit tests for allocation algorithm (validates correctness)
2. **AE-13**: Implement preference bonus system (geo match, preserve)
   - Current implementation has placeholder (geoBonus=0, preserveBonus=0)
   - Easy integration point: modify score calculation in `allocateSegment()`

**Downstream Tasks:**
3. **AE-14**: Implement CV%-based fairness metrics (uses allocation results)
4. **AE-16**: Build optimize weights search function (uses allocation function)
5. **AE-17**: Generate sensitivity chart data (uses allocation function)
6. **AE-18**: Create allocation result audit trail (uses allocation results)

**Integration Points:**
- UI components (AE-20+) will call `allocateAccounts()` when user adjusts sliders
- Export functionality (AE-42) will use allocation results
- Audit trail (AE-36+) will need allocation results with scores

---

## File Changes

### Created
- `app/src/lib/allocation/greedyAllocator.ts` (307 lines)

### Modified
- `terr-slicer/jam/specs/draft/allocation-engine/SCHEDULE.json` (marked AE-11 as completed)

---

## Verification

```bash
# Verify TypeScript compilation
cd terr-slicer/app
npm run build

# Verify no linter errors
npm run lint

# Check types
npx tsc --noEmit
```

All checks passed ✅

---

## Known Limitations

1. **Preference Bonuses Not Implemented**: AE-13 will add geo match and preserve bonuses
2. **No Fairness Metrics**: AE-14 will calculate CV% scores
3. **No Unit Tests Yet**: AE-12 will add comprehensive test coverage
4. **No Optimization**: AE-16 will add weight optimization
5. **No Audit Trail**: AE-18 will add step-by-step explanations

These are all planned tasks and not defects.

---

**Log Created:** 2026-02-03 07:30:00 UTC  
**Authored By:** AI Agent (web-implementer)
