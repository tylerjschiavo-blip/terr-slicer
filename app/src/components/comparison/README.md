# Comparison Components

Components for the Compare page that show allocation comparisons and improvements.

## KpiImprovementCards

Displays KPI improvement metrics comparing baseline (Original_Rep assignments) to current allocation.

### Features

- **ARR CV%**: Coefficient of variation for ARR distribution across reps
- **Account CV%**: Coefficient of variation for account count distribution
- **Risk CV%**: Coefficient of variation for high-risk ARR distribution (N/A if Risk_Score missing)
- **Geo Match %**: Percentage of accounts matched to reps in same location

### Display Format

Each metric shows:
- **Before**: Baseline value from Original_Rep assignments
- **After**: Current allocation value
- **Δ (Delta)**: Difference (After - Before)
  - For CV%: Negative delta = improvement (lower is better)
  - For Geo Match: Positive delta = improvement (higher is better)
- **Visual Bar**: Green for improvement, red for degradation

### Usage

```tsx
import { KpiImprovementCards } from '@/components/comparison';

function ComparePage() {
  return (
    <div className="space-y-8">
      <KpiImprovementCards />
      {/* Other comparison components */}
    </div>
  );
}
```

### Data Requirements

The component automatically pulls data from the allocation store:
- `reps`: Array of sales reps
- `accounts`: Array of accounts with Original_Rep assignments
- `results`: Current allocation results
- `highRiskThreshold`: Threshold for classifying high-risk accounts
- `hasRiskScore`: Whether Risk_Score data is available

### Baseline Calculation

The baseline ("Before") metrics are calculated by:
1. Creating allocation results using Original_Rep assignments from accounts
2. Running the same fairness calculations (CV%, Geo Match %) on those assignments
3. Comparing to current allocation results ("After")

This provides a true apples-to-apples comparison of the allocation quality.

### Design

Follows the UI Design System:
- Card: `bg-white rounded-xl shadow-sm hover:shadow-md`
- Section title: `text-lg font-semibold`
- Spacing: `space-y-4` for metrics, `space-y-1.5` for internal spacing
- Colors: Green for improvement, red for degradation, gray for N/A
