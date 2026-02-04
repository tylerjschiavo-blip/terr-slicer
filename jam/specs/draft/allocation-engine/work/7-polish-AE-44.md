# Work Log: AE-44 - Build missing risk_score degradation

**Date:** February 3, 2026  
**Status:** Completed  
**Task:** Build graceful degradation when Risk_Score column is missing from uploaded data

---

## Summary

Implemented graceful degradation for missing Risk_Score column. The tool now displays an informative banner, disables the Risk dimension, and remains fully functional for ARR and Account balancing when Risk_Score is not present in the data.

---

## Deliverables Completed

### 1. Created `MissingRiskBanner.tsx`
**File:** `app/src/components/common/MissingRiskBanner.tsx`

- Info banner component using blue styling (not warning yellow)
- Displays when `hasRiskScore` is false
- Message: "Risk_Score column not found. Risk dimension disabled. Tool remains functional for ARR and Account balancing."
- Follows UI Design System guidelines (blue-50 background, blue-200 border, info icon)

### 2. Updated `BalanceWeightSliders.tsx`
**File:** `app/src/components/slicer/BalanceWeightSliders.tsx`

**Changes:**
- Added logic to disable and lock Risk slider to 0% when `hasRiskScore` is false
- When Risk_Score missing:
  - Risk slider shows "(Disabled)" label instead of "(Auto)"
  - Risk weight locked to 0%
  - ARR and Account sliders redistribute 100% between them (Risk stays at 0%)
  - Moving ARR slider: Account = 100 - ARR, Risk = 0
  - Moving Account slider: ARR = 100 - Account, Risk = 0
- When Risk_Score present:
  - Original behavior maintained (Risk backfills to 100%)
  - Risk slider shows "(Auto)" label

### 3. Updated `FairnessScoreDisplay.tsx`
**File:** `app/src/components/slicer/FairnessScoreDisplay.tsx`

**No changes required** - Component already handles null Risk scores correctly:
- Uses `formatScore()` utility which returns "N/A" for null values
- Risk Distribution score shows "N/A" when Risk fairness is null
- Progress bar shows gray color for null values (handled by `getFairnessColor()`)

### 4. Verified `fairness.ts`
**File:** `app/src/lib/allocation/fairness.ts`

**Verified behavior** - Already handles missing Risk_Score correctly:
- `calculateRiskFairness()` returns `null` if no accounts have Risk_Score (lines 178-182)
- `calculateCustomComposite()` excludes null Risk fairness from weighted average (lines 243-276)
- `calculateBalancedComposite()` excludes null Risk fairness from simple average (lines 289-315)
- Composite scores calculated correctly using only ARR and Account when Risk is null

### 5. Updated `UploadSection.tsx`
**File:** `app/src/components/upload/UploadSection.tsx`

**Changes:**
- Imported `MissingRiskBanner` component
- Added banner display after "Detected Tabs" section
- Banner appears after file upload completes and accounts are loaded

### 6. Updated `TerritorySlicerPage.tsx`
**File:** `app/src/pages/TerritorySlicerPage.tsx`

**Changes:**
- Imported `MissingRiskBanner` component
- Added banner display at top of main content (after sticky header, before Segment Overview)
- Banner visible on all tabs (Analyze, Compare, Audit)

### 7. Updated `allocationStore.ts`
**File:** `app/src/store/allocationStore.ts`

**Changes:**
- Enhanced `setAccounts` action to automatically reset weights when Risk_Score is missing
- When `hasRiskScore` is false:
  - Sets `riskWeight` to 0
  - Sets `arrWeight` to 50
  - Sets `accountWeight` to 50
- Ensures clean initial state when Risk dimension is unavailable

---

## Acceptance Criteria

All acceptance criteria met:

- [x] Info banner displayed when Risk_Score missing (on upload page and slicer page)
- [x] Message clear and informative (follows spec exactly)
- [x] Risk slider disabled and locked to 0% (shows "(Disabled)" label)
- [x] Risk Distribution fairness shows N/A (via formatScore utility)
- [x] Tool remains functional (ARR and Account balancing works with Risk weight = 0%)
- [x] No errors thrown for missing Risk_Score (verified in code paths)
- [x] Custom and Balanced composites calculated correctly (Risk weight = 0%, excludes null Risk fairness)

---

## Technical Implementation Notes

### Data Flow
1. **Upload**: User uploads XLSX file → Parser reads accounts
2. **Store Update**: `setAccounts()` detects missing Risk_Score → Sets `hasRiskScore = false`
3. **Weight Reset**: If Risk_Score missing → Automatically sets weights to ARR=50%, Account=50%, Risk=0%
4. **UI Updates**:
   - `MissingRiskBanner` displays (checks `hasRiskScore`)
   - `BalanceWeightSliders` disables Risk slider and locks to 0%
   - `FairnessScoreDisplay` shows "N/A" for Risk scores
5. **Allocation**: Algorithm runs with Risk weight = 0% → Risk scoring has no impact on assignments
6. **Fairness**: Risk fairness returns null → Composites calculated using only ARR and Account

### Edge Cases Handled
- **Weight redistribution**: When user adjusts ARR/Account sliders with Risk disabled, weights redistribute correctly between ARR and Account only
- **Null handling**: All fairness calculations handle null Risk fairness gracefully (don't break averages)
- **Persistence**: `hasRiskScore` flag persisted in Zustand store (survives page navigation)
- **Initial load**: If user reloads page with data that has no Risk_Score, banner appears immediately

### Design Decisions
- **Info banner (blue), not warning (yellow)**: Risk_Score is optional, not an error condition
- **Automatic weight reset to 50/50**: When Risk becomes unavailable, split ARR/Account evenly for balanced starting point
- **Risk slider remains visible**: Shows user that Risk dimension exists but is disabled (better UX than hiding)
- **N/A display**: Clear indication that Risk score is not applicable (not broken or error)

---

## Testing Performed

### Manual Testing
1. ✓ Uploaded file without Risk_Score column
2. ✓ Verified banner appears on upload page
3. ✓ Navigated to slicer page - banner appears at top
4. ✓ Verified Risk slider disabled and shows 0%
5. ✓ Adjusted ARR slider - Account redistributes correctly, Risk stays at 0%
6. ✓ Adjusted Account slider - ARR redistributes correctly, Risk stays at 0%
7. ✓ Verified Fairness scores show "N/A" for Risk Distribution
8. ✓ Verified Custom and Balanced composite scores calculated (using only ARR and Account)
9. ✓ Verified allocation runs successfully with Risk weight = 0%
10. ✓ Verified no console errors or warnings

### Code Verification
- ✓ No linter errors in any modified files
- ✓ TypeScript compilation successful
- ✓ All components follow UI Design System guidelines

---

## Files Modified

1. `app/src/components/common/MissingRiskBanner.tsx` (created)
2. `app/src/components/slicer/BalanceWeightSliders.tsx` (updated)
3. `app/src/components/upload/UploadSection.tsx` (updated)
4. `app/src/pages/TerritorySlicerPage.tsx` (updated)
5. `app/src/store/allocationStore.ts` (updated)

---

## Future Considerations

### Potential Enhancements
1. **Risk Score Upload Later**: Add ability to upload Risk_Score data separately and re-enable Risk dimension
2. **Banner Dismissal**: Allow user to dismiss banner (persist dismissal in store)
3. **Analytics**: Track how often users upload data without Risk_Score
4. **Validation Message**: Add validation message explaining Risk_Score column format if user wants to add it

### Related Tasks
- **AE-45**: Compare page should also handle missing Risk_Score (shows deltas as N/A)
- **AE-46**: Audit page should explain when Risk was disabled for allocation decisions

---

## Completion Notes

Implementation completed successfully. All acceptance criteria met. Tool degrades gracefully when Risk_Score is missing, maintains full functionality for ARR and Account balancing, and provides clear user communication about the disabled Risk dimension.

**Ready for QA/Review.**
