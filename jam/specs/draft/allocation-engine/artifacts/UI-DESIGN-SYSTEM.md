# UI Design System

**Version:** 1.1  
**Last Updated:** February 3, 2026  
**Status:** Active - All future UI work must follow these principles  
**Changes:** Updated with Wave 5 (Compare page) implementations

---

## Design Philosophy

The Territory Slicer UI follows a **modern, data-focused aesthetic** inspired by Notion and Ramp's reporting interfaces. The design prioritizes:

1. **Clarity over decoration** - Clean, minimal design that puts data first
2. **Breathing room** - Generous spacing and padding for comfortable reading
3. **Subtle hierarchy** - Typography and spacing create structure, not heavy borders
4. **Professional polish** - Soft shadows, rounded corners, and smooth transitions
5. **Consistency** - Unified design language across all components

---

## Core Design Tokens

### Colors

**Background:**
- Page background: `bg-gray-50` (soft gray, not pure white)
- Card background: `bg-white`
- Sidebar background: `bg-white`

**Borders & Dividers:**
- Subtle dividers: `border-gray-100` (very light)
- Standard borders: `border-gray-200` (when needed)
- Tab underline (active): `border-gray-900` or `bg-gray-900`

**Text:**
- Primary headings: `text-gray-900`
- Secondary text/labels: `text-gray-600` or `text-gray-700`
- Values/data: `text-gray-900 font-medium`

**Shadows:**
- Default card: `shadow-sm`
- Hover state: `shadow-md`
- Transition: `transition-shadow duration-200`

### Typography

**Page Title:**
- Size: `text-3xl`
- Weight: `font-semibold`
- Example: "Territory Slicer"

**Section Titles:**
- Size: `text-lg`
- Weight: `font-semibold`
- Margin bottom: `mb-6`
- Casing: Sentence case (not UPPERCASE)
- Examples: "Segment Overview", "Rep Distribution", "Threshold Sensitivity", "Account Movements"

**Card Titles:**
- Size: `text-lg`
- Weight: `font-semibold`
- Alignment: Center for segment cards
- Casing: Sentence case or capitalize

**Subsection Headers:**
- Size: `text-sm`
- Weight: `font-medium`
- Color: `text-gray-700`

**Body Text:**
- Size: `text-sm`
- Labels: `text-gray-600`
- Values: `text-gray-900 font-medium`

### Spacing

**Card Padding:**
- Compact cards (KPI scorecards): `p-5`
- Standard cards: `p-6` to `p-8`
- Chart cards: `p-5` to `p-8`

**Section Spacing:**
- Between sections: `mb-8`
- After section titles: `mb-6`

**Internal Spacing:**
- Tight (KPI rows): `space-y-1.5` to `space-y-2`
- Standard: `space-y-3` to `space-y-4`
- Loose: `space-y-4` to `space-y-6`

**Grid Gaps:**
- Tight: `gap-2` to `gap-3`
- Standard: `gap-4` to `gap-6`

### Borders & Corners

**Card Borders:**
- **DO NOT USE:** `border border-gray-200`
- **USE INSTEAD:** `shadow-sm hover:shadow-md transition-shadow`

**Border Radius:**
- Cards: `rounded-xl` (not `rounded-lg`)
- Smaller elements: `rounded-lg` or `rounded-md`
- Badges/pills: `rounded-full` for circular elements

---

## Component Patterns

### Cards

**Standard Card Pattern:**
```tsx
<div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
  {/* Card content */}
</div>
```

**Key Rules:**
- No visible borders - use shadows instead
- Rounded corners (`rounded-xl`)
- Hover effect for interactive cards
- White background on gray-50 page

### Section Headers

**Pattern:**
```tsx
<h2 className="text-lg font-semibold text-gray-900 mb-6">Section Title</h2>
```

**Key Rules:**
- Sentence case (not UPPERCASE)
- Consistent sizing (`text-lg`)
- Standard margin (`mb-6`)

### Section Headers with Counts

**Pattern:**
```tsx
<h2 className="mb-6 text-lg font-semibold text-gray-900">
  Section Title ({itemCount})
</h2>
```

**Key Rules:**
- Include item count in parentheses
- No accordion/toggle behavior (tables always visible)
- Consistent spacing (`mb-6`)
- Standard typography (`text-lg font-semibold`)

### Tables

**Pattern:**
```tsx
<div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-200">
        {/* Headers */}
      </thead>
      <tbody className="divide-y divide-gray-200">
        {/* Rows */}
      </tbody>
    </table>
  </div>
</div>
```

**Key Rules:**
- Wrapped in card with shadow
- Light gray header background
- Dividers between rows
- Sticky headers when scrollable: `sticky top-0 z-10`

### Charts

**Container Pattern:**
```tsx
<div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
  <p className="text-xs font-medium text-gray-600 mb-3">Chart Title</p>
  <ResponsiveContainer width="100%" height={200}>
    {/* Chart */}
  </ResponsiveContainer>
</div>
```

**Key Rules:**
- Small chart titles (`text-xs`)
- Consistent padding (`p-5`)
- Shadow on hover

---

## Page Structure

### Sticky Header

**Pattern:**
```tsx
<div className="sticky top-0 z-20 bg-gray-50 -mx-8 px-8">
  <h1 className="text-3xl font-semibold text-gray-900 mb-6 pt-8">Page Title</h1>
  
  <div className="border-b border-gray-200">
    <nav className="flex gap-8">
      {/* Tab buttons */}
    </nav>
  </div>
</div>
```

**Key Rules:**
- Extends full width with negative margin
- Clean background (no visible borders when scrolling)
- Tab navigation with underline indicator
- Proper z-index layering

### Tab Navigation

**Active Tab:**
```tsx
<button className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-900">
  Tab Name
  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
</button>
```

**Inactive Tab:**
```tsx
<button className="pb-3 px-1 text-sm font-medium transition-colors relative text-gray-500 hover:text-gray-700">
  Tab Name
</button>
```

### Layout Grid

**Three-Column Cards (KPI Segment Cards):**
```tsx
<div className="grid grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

**Two-Column Layout (Rep Distribution):**
```tsx
<div className="grid grid-cols-2 gap-6">
  {/* Left: Enterprise */}
  {/* Right: Mid Market */}
</div>
```

---

## Specific Component Guidelines

### Segment Overview Cards (Analyze Page)

**Structure:**
1. Card title (centered, UPPERCASE)
2. Metrics section (tight spacing: `space-y-1.5`)
3. Subtle separator (`border-b border-gray-100`)
4. "Fairness Index" subheading
5. Composite scores (Custom & Balanced) in 2-column grid
6. Individual fairness scores (ARR, Account, Risk) with bars

**Spacing:**
- Card padding: `p-5`
- Title margin: `mb-4`
- Section margins: `mb-4`
- Internal spacing: `space-y-1.5` (metrics), `space-y-2.5` (fairness)

**Typography:**
- Labels: `text-sm text-gray-600`
- Values: `text-sm font-medium text-gray-900`
- Fairness subheading: `text-sm font-medium text-gray-700`
- No colons after labels

**Total Card Variations:**
- Omits: ARR/Rep and Accts/Rep (E/MM ratio metrics only in Enterprise/Mid Market cards)
- Includes: ARR, Accounts, Avg Deal Size (E/MM), High-Risk ARR %
- Uses invisible spacers to maintain vertical alignment with other cards

### Rep Distribution Charts

**Structure:**
- Section title: "Rep Distribution"
- Two columns: Enterprise | Mid Market
- Each column has 2 cards: ARR Distribution, Account Distribution

**Styling:**
- Column headers: `text-sm font-medium text-gray-700`
- Card spacing: `space-y-4`
- Chart titles: `text-xs font-medium text-gray-600`

### Tables (Rep Summary, Account Assignments, Account Movements)

**Features:**
- Always visible (no accordion/toggle behavior)
- Item count in section header
- Sortable columns (where applicable)
- Sticky headers for scrollable tables: `sticky top-0 z-10`
- Hover states on rows: `hover:bg-gray-50 transition-colors`
- Filter controls above table (when applicable)

**Analyze Page Tables:**
- Rep Summary: Grouped by segment (Enterprise first, then Mid Market)
- Account Assignments: Filterable by segment, rep, high-risk toggle

**Compare Page Tables:**
- Account Movements: Shows accounts that changed reps
- Columns: Account ID, Account Name, Location, ARR, Total Employees, From Rep, Segment - From Rep, To Rep, Segment - To Rep
- Filterable by segment, from rep, to rep
- Segment badges color-coded (blue for Enterprise, green for Mid Market)

---

## Migration from Old Design

### Before → After Changes

**Card Borders:**
- ❌ `border border-gray-200`
- ✅ `shadow-sm hover:shadow-md transition-shadow`

**Border Radius:**
- ❌ `rounded-lg`
- ✅ `rounded-xl`

**Section Titles:**
- ❌ `text-xl font-bold` + UPPERCASE
- ✅ `text-lg font-semibold` + Sentence case
- Example update: "KPI by Segment" → "Segment Overview"

**Card Padding:**
- ❌ `p-3` or `p-4` (too tight)
- ✅ `p-5` to `p-8` (depending on content)

**Spacing:**
- ❌ `space-y-3` everywhere
- ✅ `space-y-1.5` to `space-y-2` for tight content, `space-y-4` to `space-y-6` for sections

**Accordion Behavior:**
- ❌ Collapsible tables with toggle buttons
- ✅ Always visible tables with static section headers

---

## Design Rationale

### Why Shadows Instead of Borders?

Shadows create depth and hierarchy without harsh lines. They're more modern and allow cards to "lift" on hover, providing better visual feedback.

### Why Sentence Case?

Sentence case is easier to read and feels more conversational. UPPERCASE titles feel dated and aggressive. Modern SaaS products (Notion, Linear, Ramp) use sentence case.

### Why Gray-50 Background?

Pure white backgrounds can feel harsh. A subtle gray background (`bg-gray-50`) provides contrast for white cards while remaining clean and professional.

### Why Rounded-XL?

Larger border radius (`rounded-xl` = 12px) feels more modern and friendly than `rounded-lg` (8px). It's a signature element of contemporary UI design.

### Why Compress KPI Cards?

Data density matters in analytics tools. Tighter spacing (`space-y-1.5`) allows users to scan metrics quickly without excessive scrolling, while still maintaining readability.

---

## Implementation Checklist

When creating new components or updating existing ones:

- [ ] Use `shadow-sm hover:shadow-md` instead of borders
- [ ] Use `rounded-xl` for cards
- [ ] Use sentence case for all titles
- [ ] Use `text-lg font-semibold` for section headers
- [ ] Use `text-gray-600` for labels, `text-gray-900 font-medium` for values
- [ ] Apply appropriate spacing (tight for data, loose for sections)
- [ ] Add hover states where interactive
- [ ] Ensure sticky headers have clean backgrounds
- [ ] Test on gray-50 page background
- [ ] Verify consistent typography hierarchy

---

## Compare Page Guidelines (Wave 5)

### KPI Improvement Cards

**Structure:**
- 3 segment cards (Enterprise, Mid Market, Total)
- Each card matches Segment Overview Card structure from Analyze page
- Metrics section: Geo Match %, Preserved Rep %, separator, Fairness Index subheading
- Fairness scores: 3 columns (ARR, Account, Risk) with deltas underneath
- Deltas shown as: +24% / -5% with color coding (green for positive, red for negative)

**Layout:**
```tsx
<div className="grid grid-cols-3 gap-6">
  {/* 3 cards */}
</div>
```

**Label Updates:**
- "Rep Preservation" → "Preserved Rep"
- Fairness scores: "ARR Balance" → "ARR", "Account Balance" → "Account", etc.

### Rep Distribution Charts (Before vs. After)

**Structure:**
- Single section with shared legend at top
- 2 stacked charts (one per row): ARR chart, Accounts chart
- Each chart shows stacked bars: Normal (bottom) + High Risk (top)
- Legend uses diagonal split squares showing both normal and high-risk colors
- Subtitles ("ARR", "Accounts") are left-aligned

**Chart Features:**
- X-axis: Rep names sorted alphabetically, horizontal labels close to axis
- Y-axis: Formatted values (currency for ARR, numbers for accounts)
- Bars: Before (light blue/red) and After (blue/red) side by side
- Total labels on top of each bar stack
- Tooltip: Shows percentages only (Normal % and High Risk %), no delta
- Colors match Analyze page rep distribution

**Layout:**
```tsx
<div className="space-y-4">
  {/* ARR chart */}
  {/* Accounts chart */}
</div>
```

### Account Movement Table

**Purpose:** Shows accounts that changed assigned reps (Original_Rep ≠ Assigned_Rep)

**Columns (in order):**
1. Account ID (small gray text, left-aligned)
2. Account Name
3. Location (gray text, shows "—" if empty)
4. ARR (right-aligned, formatted with M/K suffix)
5. Total Employees (right-aligned, comma-separated)
6. From Rep
7. Segment - From Rep (badge)
8. To Rep
9. Segment - To Rep (badge)

**Features:**
- All columns sortable
- Filterable by: Segment (all/Enterprise/Mid Market), From Rep, To Rep
- Filter controls in card above table
- Reset filters button
- Segment badges: Blue for Enterprise, Green for Mid Market
- Always visible (no accordion)

## Future Considerations

As we build the **Audit** page (Wave 6), maintain these principles:

1. Reuse the same card patterns
2. Keep section title styling consistent
3. Use the same spacing tokens
4. Apply shadows, not borders
5. Maintain the gray-50 background
6. Follow the sticky header pattern for page navigation
7. Tables always visible (no accordions)

---

## Questions or Exceptions?

If you encounter a design scenario not covered here, ask:
1. Does it follow the "Notion/Ramp" aesthetic?
2. Does it use shadows instead of borders?
3. Is the typography hierarchy clear?
4. Does it have appropriate breathing room?
5. Is it consistent with existing components?

When in doubt, reference the **Analyze** page as the canonical example.
