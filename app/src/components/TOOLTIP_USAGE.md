# Tooltip Implementation Guide

This document provides comprehensive guidance for implementing tooltips across the Territory Slicer application.

## Overview

All tooltip content is centralized in `src/lib/tooltipContent.ts` and sourced from `app/docs/tooltips.md`. The reusable `Tooltip` component is located in `src/components/ui/Tooltip.tsx`.

## Quick Start

### Basic Usage

```tsx
import { Tooltip, InfoIcon } from './ui/Tooltip';
import { TOOLTIP_CONTENT } from '../lib/tooltipContent';

// Simple tooltip with info icon
<Tooltip content={TOOLTIP_CONTENT.fairness.custom}>
  <InfoIcon />
</Tooltip>

// Tooltip wrapping any element
<Tooltip content="This is helpful information">
  <button>Hover me</button>
</Tooltip>
```

## Tooltip Locations & Implementation

### 1. Fairness Scores

**Location:** All fairness score displays
**Components:** `FairnessScore.tsx`, `FairnessIndex.tsx`

```tsx
import { FairnessScore } from './components/FairnessScore';

<FairnessScore
  label="Custom Fairness"
  score={customScore}
  tooltipType="custom"
/>
```

**Available tooltip types:**
- `custom` - Custom Fairness Score
- `balanced` - Balanced Fairness Score
- `cv` - Coefficient of Variation (CV%)
- `segment` - Segment Fairness
- `average` - Average Fairness

### 2. Blended Score

**Location:** Rep summary tables, audit trail, scoring displays
**Components:** `BlendedScoreInfo.tsx`, `RepSummary.tsx`, `AuditTrail/RepsTable.tsx`

```tsx
import { BlendedScoreHeading } from './components/BlendedScoreInfo';

// As table heading
<BlendedScoreHeading />

// As inline badge
<BlendedScoreInline score={85.3} />
```

### 3. Geo Match Preference

**Location:** Sidebar preference controls
**Components:** `PreferenceSliders.tsx`, `Sidebar.tsx`

```tsx
import { PreferenceSliders } from './components/PreferenceSliders';

<PreferenceSliders
  geoMatchValue={0.05}
  preserveValue={0.05}
  onGeoMatchChange={(val) => setGeoMatch(val)}
  onPreserveChange={(val) => setPreserve(val)}
/>
```

### 4. Preserve Existing Assignment

**Location:** Sidebar preference controls (same component as Geo Match)
**Components:** `PreferenceSliders.tsx`

See example above - both sliders are in the same component.

### 5. Optimize Weights Button

**Location:** Sidebar controls section
**Components:** `OptimizeWeights.tsx`, `Sidebar.tsx`

```tsx
import { OptimizeWeights } from './components/OptimizeWeights';

<OptimizeWeights
  onClick={handleOptimize}
  isLoading={isOptimizing}
/>
```

### 6. High-Risk Threshold Input

**Location:** Sidebar controls section
**Components:** `HighRiskInput.tsx`, `Sidebar.tsx`

```tsx
import { HighRiskInput } from './components/HighRiskInput';

<HighRiskInput
  value={highRiskThreshold}
  onChange={setHighRiskThreshold}
  disabled={!hasRiskData}
/>
```

### 7. Sensitivity Chart Axes

**Location:** Sensitivity Analysis page
**Components:** `SensitivityChart.tsx`

```tsx
import { SensitivityChart } from './components/SensitivityChart';

<SensitivityChart data={sensitivityData} />
```

The axes tooltips are built into the component. The chart automatically includes:
- X-axis: Employee Count Threshold (with tooltip)
- Left Y-axis: Fairness Scores (with tooltip)
- Right Y-axis: Deal Size Ratio (with tooltip)

## Tooltip Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `React.ReactNode` | Required | Content to show in tooltip |
| `children` | `React.ReactNode` | Required | Element that triggers tooltip |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Side where tooltip appears |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment relative to trigger |
| `delayDuration` | `number` | `200` | Delay before showing (ms) |
| `className` | `string` | `''` | Additional CSS classes |

### Styling

The tooltip uses Tailwind CSS classes and can be customized via the `className` prop:

```tsx
<Tooltip
  content="Custom styled tooltip"
  className="bg-blue-900 text-white max-w-md"
>
  <button>Hover</button>
</Tooltip>
```

## InfoIcon Component

A consistent info icon for tooltip triggers:

```tsx
import { InfoIcon } from './ui/Tooltip';

// Default size (w-4 h-4)
<InfoIcon />

// Custom size
<InfoIcon className="w-5 h-5 text-blue-600" />
```

## Tooltip Content Structure

All tooltip content is organized in `src/lib/tooltipContent.ts`:

```typescript
export const TOOLTIP_CONTENT = {
  fairness: {
    custom: "...",
    balanced: "...",
    cv: "...",
    segment: "...",
    average: "...",
  },
  blendedScore: {
    what: "...",
    full: "...",
  },
  geoMatch: {
    short: "...",
    full: "...",
  },
  // ... more content
};
```

Use the appropriate content key for each tooltip location.

## Best Practices

### 1. Consistent Placement

- **Form labels:** Place info icon immediately after label text
- **Table headers:** Place info icon in header cell next to column name
- **Buttons:** Either wrap entire button or place icon adjacent
- **Chart axes:** Place info icon near axis label

### 2. Content Selection

- Use `short` version for compact UI areas
- Use `full` version for primary controls and complex features
- Use `what` for brief explanations in tight spaces

### 3. Accessibility

The Radix UI Tooltip is fully accessible:
- Keyboard navigable (focus + hover to trigger)
- Screen reader compatible
- ARIA attributes automatically applied
- Works with keyboard navigation

### 4. Performance

- Tooltips are lazy-loaded via Radix UI Portal
- No tooltip content is rendered until hover/focus
- Lightweight bundle impact

## Examples

### Label with Tooltip

```tsx
<div className="flex items-center gap-2">
  <label>Custom Fairness Score</label>
  <Tooltip content={TOOLTIP_CONTENT.fairness.custom}>
    <InfoIcon />
  </Tooltip>
</div>
```

### Button with Tooltip

```tsx
<Tooltip content="Click to optimize allocation weights">
  <button className="btn-primary">
    Optimize
  </button>
</Tooltip>
```

### Table Header with Tooltip

```tsx
<th>
  <div className="flex items-center gap-2">
    <span>Blended Score</span>
    <Tooltip content={TOOLTIP_CONTENT.blendedScore.what}>
      <InfoIcon />
    </Tooltip>
  </div>
</th>
```

### Multi-line Tooltip Content

Tooltips support markdown-style formatting in the content:

```tsx
<Tooltip content={`**Key Point:**
- Item 1
- Item 2
- Item 3`}>
  <InfoIcon />
</Tooltip>
```

## Troubleshooting

### Tooltip not appearing

1. Ensure parent element has sufficient space for tooltip portal
2. Check z-index conflicts (tooltip uses z-50)
3. Verify tooltip trigger has proper pointer events

### Styling issues

1. Check Tailwind CSS is properly configured
2. Verify custom classes don't conflict with base styles
3. Use browser dev tools to inspect tooltip element

### Performance concerns

1. Avoid nesting tooltips deeply
2. Don't use tooltips on rapidly re-rendering elements
3. Consider delayDuration for frequently hovered elements

## Testing

When testing components with tooltips:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('shows tooltip on hover', async () => {
  const user = userEvent.setup();
  render(<ComponentWithTooltip />);
  
  const trigger = screen.getByRole('button');
  await user.hover(trigger);
  
  expect(screen.getByText('Tooltip content')).toBeInTheDocument();
});
```

## Future Enhancements

Potential improvements for the tooltip system:

1. **Tooltip variants:** Success, warning, error styles
2. **Rich content:** Support for formatted text, links, images
3. **Keyboard shortcuts:** Show keyboard hints in tooltips
4. **Analytics:** Track which tooltips users interact with most
5. **Guided tours:** Connect tooltips for onboarding flows
