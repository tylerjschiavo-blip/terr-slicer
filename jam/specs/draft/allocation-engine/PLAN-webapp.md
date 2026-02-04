# Plan: Allocation Engine Web App

**Initiative:** Allocation Engine
**Status:** Draft
**DSL Version:** plan/1.0
**Intent:** [INTENT.md](./INTENT.md)

---

## Overview

This plan delivers an interactive browser-based Territory Slicer web application for sales leaders restructuring from Generalist to Enterprise/Mid-Market segmentation. The tool provides transparent, defensible territory allocation through a weighted greedy algorithm, real-time fairness metrics, and step-through explainability.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Zustand

**Design System:** UI-DESIGN-SYSTEM.md (Ramp/Notion aesthetic with shadows, rounded corners, sentence case titles)

**Architecture:** Single-page application with client-side state management, no backend required. Modular allocation logic designed for future API exposure or CRM integration.

**Key Capabilities:**
- Real-time threshold exploration with immediate fairness feedback
- Multi-dimensional workload balancing (ARR, Account count, Risk distribution)
- Preference-aware allocation (geographic match, rep preservation)
- Automated weight optimization with 1% increment search
- Sensitivity analysis across threshold range (~30-50 samples)
- Before/after territory comparison with KPI tracking
- Step-through audit trail for allocation transparency
- CSV export with all original columns + Segment + Assigned_Rep

**Wave 4 Design Update (V3):** Territory Slicer page implemented with modern Ramp/Notion aesthetic. All subsequent waves must follow UI-DESIGN-SYSTEM.md for consistency. Key changes: shadows instead of borders, rounded-xl corners, sentence case titles, unified segment cards, sticky header with tab navigation.

## Tasks

| Task | Title | Role | Skill | Wave | Group |
|------|-------|------|-------|------|-------|
| AE-01 | Initialize Vite + React + TypeScript project | devops-implementer | devops (defined) | 1 | foundation |
| AE-02 | Configure Tailwind CSS and shadcn/ui | devops-implementer | devops (defined) | 1 | foundation |
| AE-03 | Set up project structure and routing | web-implementer | web-development (defined) | 1 | foundation |
| AE-04 | Define core TypeScript types and interfaces | web-implementer | web-development (defined) | 1 | foundation |
| AE-05 | Initialize Zustand store structure | web-implementer | web-development (defined) | 1 | foundation |
| AE-06 | Implement Rep and Account data schemas | web-implementer | web-development (defined) | 2 | data-layer |
| AE-07 | Build XLSX parser with validation | web-implementer | web-development (defined) | 2 | data-layer |
| AE-08 | Create upload UI for XLSX with drag-drop | ui-implementer | ui-development (defined) | 2 | data-layer |
| AE-09 | Implement validation feedback system | ui-implementer | ui-development (defined) | 2 | data-layer |
| AE-10 | Build segmentation logic (threshold-based) | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-11 | Implement weighted greedy allocation algorithm | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-12 | Write unit tests for allocation algorithm | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-13 | Build preference bonus system (Geo + Preserve) | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-14 | Implement CV%-based fairness metrics | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-15 | Write unit tests for fairness calculations | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-16 | Build optimize weights search function | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-17 | Generate sensitivity chart data on load | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-18 | Create allocation result audit trail | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-19 | Write unit tests for edge cases and data validation | web-implementer | web-development (defined) | 3 | core-allocation |
| AE-20 | Build Territory Slicer page layout | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-21 | Implement threshold slider component | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-22 | Build balance weight sliders (sum to 100%) | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-23 | Create preference sliders (0.00–0.10) | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-24 | Build segment summary cards with metrics | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-25 | Implement fairness score display with color bands | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-26 | Create rep distribution charts (ARR and Accounts) | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-27 | Build sensitivity chart with dual Y-axis | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-28 | Implement rep summary table | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-29 | Build account assignments table | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-30 | Add Optimize Weights button and modal | ui-implementer | ui-development (defined) | 4 | ui-slicer |
| AE-31 | Build Territory Comparison page layout | ui-implementer | ui-development (defined) | 5 | ui-comparison |
| AE-32 | Create before/after ARR bar charts | ui-implementer | ui-development (defined) | 5 | ui-comparison |
| AE-33 | Build before/after account distribution charts | ui-implementer | ui-development (defined) | 5 | ui-comparison |
| AE-34 | Implement KPI improvement cards | ui-implementer | ui-development (defined) | 5 | ui-comparison |
| AE-35 | Create account movement table with filtering | ui-implementer | ui-development (defined) | 5 | ui-comparison |
| AE-36 | Build Audit Trail page layout | ui-implementer | ui-development (defined) | 6 | ui-audit |
| AE-37 | Implement step-through navigation | ui-implementer | ui-development (defined) | 6 | ui-audit |
| AE-38 | Create decision explainability cards | ui-implementer | ui-development (defined) | 6 | ui-audit |
| AE-39 | Build rep score comparison display | ui-implementer | ui-development (defined) | 6 | ui-audit |
| AE-40 | Implement segment reasoning display | ui-implementer | ui-development (defined) | 6 | ui-audit |
| AE-41 | Create tooltip system with definitions | ui-designer | ui-design (defined) | 7 | polish |
| AE-42 | Build CSV export functionality | web-implementer | web-development (defined) | 7 | polish |
| AE-43 | Implement empty segment handling | ui-implementer | ui-development (defined) | 7 | polish |
| AE-44 | Build missing risk_score degradation | ui-implementer | ui-development (defined) | 7 | polish |
| AE-45 | Add warning and info banners | ui-implementer | ui-development (defined) | 7 | polish |
| AE-46 | Implement responsive layout adjustments | ui-implementer | ui-development (defined) | 7 | polish |
| AE-47 | Add loading states and optimistic updates | ui-implementer | ui-development (defined) | 7 | polish |
| AE-48 | Perform cross-browser testing | ui-test-implementer | ui-testing (defined) | 8 | quality |
| AE-49 | End-to-end integration testing | ui-test-implementer | ui-testing (defined) | 8 | quality |
| AE-50 | Performance test with large datasets | ui-test-implementer | ui-testing (defined) | 8 | quality |

---

### AE-01: Initialize Vite + React + TypeScript project

**Scope:** Set up the foundational build tooling and React application structure with TypeScript support.

**Deliverables:**
- `app/package.json` - Dependencies: vite, react, react-dom, typescript, @types/react, @types/react-dom
- `app/vite.config.ts` - Vite configuration with path aliases (@/ for src/)
- `app/tsconfig.json` - TypeScript configuration with strict mode, JSX support
- `app/index.html` - HTML entry point with root div
- `app/src/main.tsx` - React application entry point with React 18 createRoot
- `app/.gitignore` - Node modules, dist, build artifacts

**Acceptance Criteria:**
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server on port 5173
- [ ] React 18 renders "Hello World" in browser
- [ ] TypeScript compilation succeeds with no errors
- [ ] Hot module replacement works on file save

---

### AE-02: Configure Tailwind CSS and shadcn/ui

**Scope:** Set up Tailwind CSS with design tokens and install shadcn/ui component library.

**Deliverables:**
- `app/tailwind.config.js` - Tailwind configuration with shadcn/ui design tokens (colors, spacing, typography)
- `app/postcss.config.js` - PostCSS configuration for Tailwind
- `app/src/styles/globals.css` - Global styles with Tailwind directives and CSS variables for theming
- `app/components.json` - shadcn/ui configuration file
- `app/src/lib/utils.ts` - cn() utility function for className merging

**Acceptance Criteria:**
- [ ] Tailwind CSS processes and applies styles correctly
- [ ] shadcn/ui components can be installed via CLI (e.g., `npx shadcn-ui@latest add button`)
- [ ] Design tokens (colors, spacing) match shadcn/ui defaults
- [ ] CSS variables defined for theme customization
- [ ] Utility classes (flex, grid, etc.) work as expected

---

### AE-03: Set up project structure and routing

**Scope:** Create folder structure and implement client-side routing for three main pages.

**Deliverables:**
- `app/src/App.tsx` - Root component with React Router setup
- `app/src/pages/TerritorySlicerPage.tsx` - Territory Slicer page skeleton
- `app/src/pages/TerritoryComparisonPage.tsx` - Territory Comparison page skeleton
- `app/src/pages/AuditTrailPage.tsx` - Audit Trail page skeleton
- `app/src/components/layout/Header.tsx` - Navigation header with page tabs
- `app/src/components/layout/Sidebar.tsx` - Left sidebar for controls (shared across pages)
- `app/src/components/layout/MainLayout.tsx` - Layout wrapper component

**Acceptance Criteria:**
- [ ] React Router installed and configured
- [ ] Three page routes: /slicer, /comparison, /audit
- [ ] Navigation tabs switch between pages without page reload
- [ ] Sidebar persists across page navigation
- [ ] Default route redirects to /slicer
- [ ] 404 page handles invalid routes

---

### AE-04: Define core TypeScript types and interfaces

**Scope:** Create comprehensive TypeScript type definitions for all data structures used throughout the application.

**Deliverables:**
- `app/src/types/index.ts` - Core type definitions:
  - `Rep` interface: Rep_Name, Segment ('Enterprise' | 'Mid Market'), Location
  - `Account` interface: Account_ID, Account_Name, Original_Rep, ARR (number), Num_Employees (number), Location, Risk_Score (number | null)
  - `AllocationConfig` interface: threshold (number), arrWeight (number), accountWeight (number), riskWeight (number), geoMatchBonus (number), preserveBonus (number), highRiskThreshold (number)
  - `FairnessMetrics` interface: arrFairness (number | null), accountFairness (number | null), riskFairness (number | null), customComposite (number | null), balancedComposite (number | null)
  - `AllocationResult` interface: accountId, assignedRep, segment, blendedScore, geoBonus, preserveBonus, totalScore
  - `AuditStep` interface: account, segment, eligibleReps, winner, reasoning
  - `SensitivityDataPoint` interface: threshold, balancedFairness, customFairness, dealSizeRatio

**Acceptance Criteria:**
- [ ] All types compile without errors
- [ ] Types match data structures from INTENT.md and DATA.md
- [ ] Optional fields (Risk_Score) use `| null` or `?` syntax
- [ ] Segment type is literal union ('Enterprise' | 'Mid Market')
- [ ] All numeric fields have explicit number types
- [ ] Types exported for use across application

---

### AE-05: Initialize Zustand store structure

**Scope:** Set up Zustand state management with slices for data, configuration, allocation results, and UI state.

**Deliverables:**
- `app/src/store/allocationStore.ts` - Main Zustand store with slices:
  - `dataSlice`: reps (Rep[]), accounts (Account[]), validationErrors (string[]), validationWarnings (string[]), hasRiskScore (boolean) - stores parsed upload data that persists across page navigation
  - `configSlice`: threshold (number), arrWeight (number), accountWeight (number), riskWeight (number), geoMatchBonus (number), preserveBonus (number), highRiskThreshold (number)
  - `allocationSlice`: results (AllocationResult[]), fairnessMetrics (FairnessMetrics), sensitivityData (SensitivityDataPoint[]), auditTrail (AuditStep[])
  - `uiSlice`: currentPage ('slicer' | 'comparison' | 'audit'), isLoading (boolean), currentAuditStep (number)

**Acceptance Criteria:**
- [ ] Zustand installed and store created
- [ ] All slices defined with initial state
- [ ] Actions defined for updating each slice
- [ ] Store accessible via hooks (useAllocationStore)
- [ ] State persists during page navigation
- [ ] TypeScript types inferred correctly from store

---

### AE-06: Implement Rep and Account data schemas

**Scope:** Create Zod schemas for runtime validation of uploaded Rep and Account data.

**Deliverables:**
- `app/src/lib/schemas/repSchema.ts` - Zod schema:
  - Rep_Name: string, non-empty
  - Segment: z.enum(['Enterprise', 'Mid Market'])
  - Location: string, non-empty
- `app/src/lib/schemas/accountSchema.ts` - Zod schema:
  - Account_ID: string, non-empty
  - Account_Name: string, non-empty
  - Original_Rep: string, non-empty (accepts "Current_Rep" column during import)
  - ARR: number, positive
  - Num_Employees: number, positive integer
  - Location: string, non-empty
  - Risk_Score: number, 0-100, optional

**Acceptance Criteria:**
- [ ] Zod installed and schemas compile
- [ ] Rep schema validates required fields (Rep_Name, Segment, Location)
- [ ] Account schema validates required fields (Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location)
- [ ] Risk_Score optional and validates range 0-100 when present
- [ ] ARR and Num_Employees must be positive numbers
- [ ] Segment must be exactly 'Enterprise' or 'Mid Market'
- [ ] Schema errors provide clear field-level messages

---

### AE-07: Build XLSX parser with validation

**Scope:** Parse uploaded XLSX files with multiple tabs, auto-detect Reps and Accounts data by column headers, and perform structural validation.

**Deliverables:**
- `app/src/lib/parsers/xlsxParser.ts` - XLSX parsing functions:
  - `parseXLSXFile(file: File): Promise<{ reps: Rep[], accounts: Account[] }>` - Parse XLSX file with multiple tabs, auto-detect Reps and Accounts sheets by column headers
  - Handle XLSX tabs (auto-detect by presence of Rep_Name vs Account_ID columns)
  - Handle headers case-insensitively (e.g., "Rep_Name" = "rep_name", "Current_Rep" → "Original_Rep")
  - Convert numeric columns (ARR, Num_Employees, Risk_Score) to numbers
  - Return parsing errors with row/column/sheet context
- `app/src/lib/validators/dataValidator.ts` - Business rule validation:
  - `validateRepsData(reps: Rep[]): ValidationResult` - Check for duplicate Rep_Names, invalid Segments
  - `validateAccountsData(accounts: Account[]): ValidationResult` - Check for duplicate Account_IDs, invalid ARR/Num_Employees
  - `validateDataConsistency(reps: Rep[], accounts: Account[]): ValidationResult` - Check for orphan reps (reps not referenced in accounts)

**Acceptance Criteria:**
- [ ] XLSX parser handles Excel files with multiple tabs correctly
- [ ] Auto-detects Reps tab (contains Rep_Name column) and Accounts tab (contains Account_ID column)
- [ ] Headers matched case-insensitively (e.g., "Rep_Name" = "rep_name")
- [ ] Column name mapping: "Current_Rep" → "Original_Rep" during import
- [ ] Numeric columns parsed as numbers (not strings)
- [ ] Hard errors returned for: missing required columns, duplicate Account_IDs, duplicate Rep_Names, invalid Segment values
- [ ] Soft warnings returned for: Risk_Score out of 0-100 range, orphan reps, location format inconsistencies
- [ ] Error messages include row number, column name, and sheet name
- [ ] Empty files handled gracefully

---

### AE-08: Create upload UI for XLSX with drag-drop

**Scope:** Build file upload component with drag-and-drop functionality for single XLSX file containing multiple tabs.

**Deliverables:**
- `app/src/components/upload/FileUploadZone.tsx` - Upload component:
  - Drag-and-drop zone for XLSX files
  - Click to browse file input
  - Single upload zone: "Upload Data File (XLSX with Reps and Accounts tabs)"
  - File type validation (XLSX only)
  - Visual feedback (drag over state, file selected state)
  - Display uploaded file name
  - Auto-detection message explaining tab detection by column headers
- `app/src/components/upload/UploadSection.tsx` - Container component for upload zone

**Acceptance Criteria:**
- [ ] Drag-and-drop works for XLSX files
- [ ] Click to browse opens file picker
- [ ] File type validation rejects non-XLSX files with clear error
- [ ] Visual feedback shows drag-over state
- [ ] Uploaded file name displayed after selection
- [ ] Information message explains auto-detection: "The parser will auto-detect Reps (Rep_Name column) and Accounts (Account_ID column) tabs"
- [ ] Component accessible (keyboard navigation, screen reader support)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Parsed reps and accounts data stored in Zustand store (persists across page navigation)
- [ ] File references and UI state remain in local component state

---

### AE-09: Implement validation feedback system

**Scope:** Display validation errors and warnings to users with clear, actionable messages for XLSX parsing.

**Deliverables:**
- `app/src/components/upload/ValidationFeedback.tsx` - Feedback component:
  - Display hard errors (blocking) in red alert box
  - Display soft warnings (non-blocking) in yellow info box
  - List errors with row/column/sheet context (e.g., "Accounts tab, Row 5, Account_ID: Duplicate value 'ACC-123'")
  - Group errors by type (missing columns, invalid data, duplicates, sheet detection)
  - Show validation note: "Geo match uses exact string match (case-insensitive). Ensure location formats align between Reps and Accounts tabs."
  - Show info about column mapping: "Note: 'Current_Rep' column is automatically mapped to 'Original_Rep' during import"
- `app/src/components/common/Alert.tsx` - Reusable alert component (shadcn/ui based)

**Acceptance Criteria:**
- [ ] Hard errors displayed prominently and block processing
- [ ] Soft warnings displayed but allow processing to continue
- [ ] Error messages include specific row/column/sheet information
- [ ] Validation note displayed on upload page
- [ ] Column mapping info displayed (Current_Rep → Original_Rep)
- [ ] Errors grouped logically (structural vs data quality vs sheet detection)
- [ ] Clear visual distinction between errors (red) and warnings (yellow)
- [ ] Users can dismiss warnings but errors persist until fixed

---

### AE-10: Build segmentation logic (threshold-based)

**Scope:** Implement threshold-based segmentation that assigns accounts to Enterprise (≥threshold) or Mid-Market (<threshold) based on Num_Employees.

**Deliverables:**
- `app/src/lib/allocation/segmentation.ts` - Segmentation functions:
  - `segmentAccount(account: Account, threshold: number): 'Enterprise' | 'Mid Market'` - Return segment based on Num_Employees vs threshold
  - `segmentAccounts(accounts: Account[], threshold: number): { enterprise: Account[], midMarket: Account[] }` - Segment all accounts
  - `getThresholdRange(accounts: Account[]): { min: number, max: number }` - Calculate min/max employees, round to nearest 1K
  - `roundToNearestThousand(value: number): number` - Helper to round threshold range

**Acceptance Criteria:**
- [ ] Account with Num_Employees ≥ threshold assigned to Enterprise
- [ ] Account with Num_Employees < threshold assigned to Mid-Market
- [ ] Threshold range calculated from data (min rounded down, max rounded up to nearest 1K)
- [ ] Empty segments handled (return empty arrays, not errors)
- [ ] Function is pure (no side effects)
- [ ] TypeScript types enforced (returns 'Enterprise' | 'Mid Market')

---

### AE-11: Implement weighted greedy allocation algorithm

**Scope:** Build the core weighted greedy allocation algorithm that assigns accounts to reps within each segment based on blended need scores.

**Deliverables:**
- `app/src/lib/allocation/greedyAllocator.ts` - Allocation functions:
  - `calculateBlendedScore(rep: Rep, segmentAccounts: Account[], assignedAccounts: Account[], config: AllocationConfig): number` - Calculate normalized need across ARR, Account count, Risk, weighted by user sliders
  - `allocateAccounts(accounts: Account[], reps: Rep[], config: AllocationConfig): AllocationResult[]` - Main allocation function:
    - Segment accounts by threshold
    - Filter reps by segment (E reps get E accounts, MM reps get MM accounts)
    - Process accounts in descending ARR order (then by Account_ID)
    - For each account, calculate blended score for each eligible rep, apply preference bonuses, get total score
    - Assign to rep with highest total score (most under target after bonuses)
    - Track assigned accounts for next iteration
    - Return allocation results with scores
  - `calculateTargetARR(reps: Rep[], accounts: Account[]): number` - Calculate target ARR per rep for segment
  - `calculateTargetAccounts(reps: Rep[], accounts: Account[]): number` - Calculate target account count per rep

**Acceptance Criteria:**
- [ ] Accounts assigned only to reps in matching segment (Enterprise accounts → Enterprise reps)
- [ ] Allocation uses weighted greedy: highest total score wins (most under target = highest priority)
- [ ] Blended score combines ARR balance, Account balance, Risk balance with user weights
- [ ] Positive blended scores = under target (0 to 1, higher = more need), negative = over target
- [ ] Accounts processed in consistent order (descending ARR, then Account_ID)
- [ ] Tie-breaking: when scores equal, lowest current ARR wins, then alphabetical by Rep_Name
- [ ] Function handles empty segments gracefully (no errors)
- [ ] Allocation is deterministic (same input = same output)

---

### AE-12: Write unit tests for allocation algorithm

**Scope:** Write comprehensive unit tests for the weighted greedy allocation algorithm to validate correctness and edge cases.

**Deliverables:**
- `app/src/lib/allocation/__tests__/greedyAllocator.test.ts` - Unit test suite for allocation algorithm
- Test cases covering:
  - Simple case: 2 reps, 4 accounts, equal weights
  - Edge case: 1 rep per segment, empty segment handling
  - Complex case: 10 reps, 100 accounts, various weight combinations
  - Segment assignment validation (E accounts → E reps, MM accounts → MM reps)
  - Blended score calculation validation (positive = under target, negative = over target)
  - Preference bonus formula validation (sign-aware multiplier)
  - Winner selection validation (highest total score wins)
  - Tie-breaking validation (lowest ARR, then alphabetical)

**Acceptance Criteria:**
- [ ] Test cases cover simple, edge, and complex scenarios
- [ ] Allocation assigns accounts to correct segment (Enterprise vs Mid Market)
- [ ] Blended scores calculated correctly (positive = under target, negative = over target)
- [ ] Preference bonus formula correct (sign-aware multiplier)
- [ ] Winner selection correct (highest total score wins)
- [ ] Tie-breaking works correctly (lowest ARR, then alphabetical)
- [ ] All tests pass
- [ ] Test coverage >80% for allocation logic

---

### AE-13: Build preference bonus system (Geo + Preserve)

**Scope:** Implement geographic match and preserve bonuses that modify blended scores as tiebreakers.

**Deliverables:**
- `app/src/lib/allocation/preferences.ts` - Preference functions:
  - `calculateGeoBonus(account: Account, rep: Rep, geoMatchBonus: number): number` - Return geoMatchBonus (0.00-0.10) if account Location matches rep Location (exact string, case-insensitive), else 0
  - `calculatePreserveBonus(account: Account, rep: Rep, preserveBonus: number): number` - Return preserveBonus (0.00-0.10) if account Original_Rep matches rep Rep_Name, else 0
  - `applyPreferenceBonuses(blendedScore: number, geoBonus: number, preserveBonus: number): number` - Apply bonuses using sign-aware multiplier:
    - For positive blended scores (under target): `blendedScore * (1 + geoBonus + preserveBonus)` - bonuses increase priority
    - For negative blended scores (over target): `blendedScore * (1 - geoBonus - preserveBonus)` - bonuses reduce penalty
  - `geoMatch(accountLocation: string, repLocation: string): boolean` - Exact string match, case-insensitive ("CA" = "ca" but "California" ≠ "CA")

**Acceptance Criteria:**
- [ ] Geo match: exact string comparison, case-insensitive
- [ ] Geo bonus applied only when locations match exactly (after case normalization)
- [ ] Preserve bonus applied only when account Original_Rep matches rep Rep_Name
- [ ] Bonuses in range 0.00-0.10 (from user sliders)
- [ ] Bonuses applied with sign-aware multiplier:
  - Positive blended scores: `blendedScore * (1 + geoBonus + preserveBonus)`
  - Negative blended scores: `blendedScore * (1 - geoBonus - preserveBonus)`
- [ ] At max bonus 0.10, preferences can only flip decisions when reps within ~9% of each other
- [ ] Function handles missing/null locations gracefully

---

### AE-14: Implement CV%-based fairness metrics

**Scope:** Calculate coefficient of variation (CV%) for ARR, Account count, and Risk distribution, convert to 0-100 fairness scores, and apply 5-band color scale.

**Deliverables:**
- `app/src/lib/allocation/fairness.ts` - Fairness calculation functions:
  - `calculateCV(values: number[]): number | null` - Calculate coefficient of variation (std dev / mean), return null if mean is 0 or empty array
  - `calculateARRFairness(reps: Rep[], allocationResults: AllocationResult[], accounts: Account[]): number | null` - Calculate ARR CV% across reps, convert to 0-100 score (100 - CV%), return null if undefined
  - `calculateAccountFairness(reps: Rep[], allocationResults: AllocationResult[]): number | null` - Calculate account count CV% across reps, convert to 0-100 score
  - `calculateRiskFairness(reps: Rep[], allocationResults: AllocationResult[], accounts: Account[], highRiskThreshold: number): number | null` - Calculate high-risk ARR % CV% across reps, convert to 0-100 score, return null if Risk_Score missing
  - `calculateCustomComposite(arrFairness: number | null, accountFairness: number | null, riskFairness: number | null, weights: { arr: number, account: number, risk: number }): number | null` - Weighted average using user weights
  - `calculateBalancedComposite(arrFairness: number | null, accountFairness: number | null, riskFairness: number | null): number | null` - Equal-weight average (33/33/33)
  - `getFairnessColor(score: number | null): string` - Return color class: 94-100 Dark Green, 88-93 Light Green, 82-87 Yellow, 75-81 Orange, <75 Red, null = gray

**Acceptance Criteria:**
- [ ] CV% calculated correctly: std dev / mean * 100
- [ ] Fairness score: 100 - CV%, clamped to 0-100
- [ ] Empty segments return null (not 0 or 100) for fairness scores
- [ ] Custom composite uses user's balance weights (ARR/Account/Risk)
- [ ] Balanced composite uses equal weights (33/33/33)
- [ ] Color mapping: 94-100 Dark Green, 88-93 Light Green, 82-87 Yellow, 75-81 Orange, <75 Red
- [ ] Null scores handled gracefully (show N/A, gray color)

---

### AE-15: Write unit tests for fairness calculations

**Scope:** Write unit tests to validate CV% and fairness score calculations are mathematically correct.

**Deliverables:**
- `app/src/lib/allocation/__tests__/fairness.test.ts` - Fairness calculation test suite
- Test cases covering:
  - Known CV% values with hand-calculated expected results
  - Equal distribution (CV% = 0, fairness = 100)
  - Highly unequal distribution (high CV%, low fairness)
  - Empty segment (fairness = null, not 0 or 100)
  - Custom composite with various weight combinations
  - Balanced composite (33/33/33 equal weights)
  - Color band mapping validation (94-100 Dark Green, etc.)
- Manual verification: calculate CV% by hand for test cases, compare to code output

**Acceptance Criteria:**
- [ ] CV% calculated correctly: std dev / mean * 100
- [ ] Fairness score: 100 - CV%, clamped to 0-100
- [ ] Equal distribution → fairness = 100
- [ ] Empty segment → fairness = null (not 0 or 100)
- [ ] Custom composite: weighted average using user weights
- [ ] Balanced composite: equal-weight average (33/33/33)
- [ ] Color bands applied correctly (94-100 Dark Green, etc.)
- [ ] All tests pass
- [ ] Manual verification matches code output
- [ ] Test coverage 100% for fairness functions

---

### AE-16: Build optimize weights search function

**Scope:** Implement brute-force search across all weight combinations (1% increments) to find weights maximizing Balanced fairness at current threshold.

**Deliverables:**
- `app/src/lib/allocation/optimizer.ts` - Optimization functions:
  - `optimizeWeights(accounts: Account[], reps: Rep[], threshold: number, geoMatchBonus: number, preserveBonus: number, highRiskThreshold: number): { arrWeight: number, accountWeight: number, riskWeight: number, balancedScore: number }` - Search all weight combinations:
    - Iterate ARR weight 0-100% in 1% steps
    - For each ARR weight, iterate Account weight 0 to (100 - ARR weight)%
    - Risk weight = 100 - ARR weight - Account weight
    - Run allocation with each weight combination
    - Score result using Balanced composite (33/33/33)
    - Return weights with highest Balanced score
  - Handle missing Risk_Score: lock Risk weight to 0%, only search ARR/Account weights
  - Return recommended weights and resulting Balanced score

**Acceptance Criteria:**
- [ ] Searches all valid weight combinations (sum to 100%, 1% increments)
- [ ] No minimum constraints (optimizer may recommend 0% for any driver)
- [ ] Optimization target: maximize Balanced fairness (33/33/33 composite)
- [ ] Runs allocation for each weight combination
- [ ] Returns best weights and resulting Balanced score
- [ ] Handles missing Risk_Score: only searches ARR/Account weights (Risk locked to 0%)
- [ ] Completes in reasonable time (<5 seconds for typical datasets)

---

### AE-17: Generate sensitivity chart data on load

**Scope:** Compute fairness and Deal Size Ratio across ~30-50 threshold samples using current allocation weights.

**Deliverables:**
- `app/src/lib/allocation/sensitivity.ts` - Sensitivity analysis functions:
  - `generateSensitivityData(accounts: Account[], reps: Rep[], config: AllocationConfig): SensitivityDataPoint[]` - Generate data points:
    - Calculate threshold range (min/max employees, rounded to nearest 1K)
    - Sample ~30-50 thresholds evenly across range
    - For each threshold:
      - Run allocation with current weights (from config)
      - Calculate Balanced fairness (33/33/33 scoring)
      - Calculate Custom fairness (user's weight scoring)
      - Calculate Deal Size Ratio (E Avg ARR / MM Avg ARR)
    - Return array of data points
  - `calculateDealSizeRatio(enterpriseAccounts: Account[], midMarketAccounts: Account[]): number | null` - Calculate E Avg ARR / MM Avg ARR, return null if empty segment

**Acceptance Criteria:**
- [ ] Generates ~30-50 threshold samples evenly across range
- [ ] Uses current allocation weights (not optimized per threshold)
- [ ] Calculates Balanced fairness (33/33/33 scoring) for each threshold
- [ ] Calculates Custom fairness (user's weight scoring) for each threshold
- [ ] Calculates Deal Size Ratio (E Avg ARR / MM Avg ARR) for each threshold
- [ ] Handles empty segments (return null for Deal Size Ratio)
- [ ] Completes in <1-2 seconds for typical datasets
- [ ] Data points sorted by threshold (ascending)

---

### AE-18: Create allocation result audit trail

**Scope:** Capture step-by-step allocation decisions for explainability: account → segment → eligible reps' scores → winner.

**Deliverables:**
- `app/src/lib/allocation/auditTrail.ts` - Audit trail functions:
  - `generateAuditTrail(accounts: Account[], reps: Rep[], config: AllocationConfig, allocationResults: AllocationResult[]): AuditStep[]` - Generate audit trail:
    - Process accounts in same order as allocation (descending ARR, then Account_ID)
    - For each account:
      - Determine segment (E or MM) and reason ("Enterprise (threshold 2,750: 53K ≥ 2,750)")
      - Find eligible reps (same segment as account)
      - Calculate scores for each eligible rep: blended score, geo bonus, preserve bonus, total score
      - Identify winner (highest total score = most under target)
      - Generate reasoning: "Mickey wins because: highest total score (most under target) + geo match bonus"
    - Return array of audit steps
  - `formatSegmentReason(account: Account, threshold: number): string` - Format segment assignment reason
  - `formatWinnerReason(winner: Rep, scores: { blended: number, geo: number, preserve: number, total: number }, eligibleReps: Rep[]): string` - Format winner explanation

**Acceptance Criteria:**
- [ ] Audit trail matches allocation order (same account sequence)
- [ ] Each step includes: account info, segment and reason, eligible reps with scores, winner and reasoning
- [ ] Segment reason formatted: "Enterprise (threshold 2,750: 53K ≥ 2,750)" or "Mid-Market (threshold 2,750: 450 < 2,750)"
- [ ] Rep scores include: blended (need), geo bonus, preserve bonus, total score
- [ ] Winner reasoning explains why rep won (e.g., "highest total score (most under target) + geo match bonus")
- [ ] Tie-breaking explained when applicable (e.g., "tied score + lower current ARR")
- [ ] Audit trail length matches number of accounts

---

### AE-19: Write unit tests for edge cases and data validation

**Scope:** Write unit tests for edge cases: empty segments, single rep, missing Risk_Score, data validation errors.

**Deliverables:**
- `app/src/lib/__tests__/edgeCases.test.ts` - Edge case test suite
- Test scenarios covering:
  - Empty segments (all accounts in one segment)
  - Single rep per segment
  - All accounts same employee count
  - All accounts same ARR
  - Missing Risk_Score column (Risk dimension disabled)
  - Invalid CSV format (malformed data)
  - Duplicate Account_IDs (hard error)
  - Orphan reps (reps not referenced in accounts)
- Verify: no errors thrown, appropriate warnings/errors displayed, tool remains functional

**Acceptance Criteria:**
- [ ] Empty segments handled gracefully (N/A metrics, warning banner)
- [ ] Single rep per segment works (no division by zero)
- [ ] Missing Risk_Score handled (Risk disabled, info banner)
- [ ] Invalid CSV shows clear error messages
- [ ] Duplicate Account_IDs show hard error
- [ ] Orphan reps show soft warning
- [ ] All edge cases tested and documented
- [ ] No crashes or unhandled errors
- [ ] Test coverage >70% for validation logic

---

### AE-20: Build Territory Slicer page layout

**Scope:** Create the main page layout with all sections: controls sidebar, segment metrics, fairness index, rep distribution, sensitivity chart, rep summary, account assignments.

**Deliverables:**
- `app/src/pages/TerritorySlicerPage.tsx` - Complete page layout:
  - Left sidebar with controls (threshold, weights, preferences, optimize button)
  - Main content area with sections:
    - Segment Overview (3 unified cards combining metrics and fairness: Enterprise, Mid Market, Total)
    - Rep Distribution (ARR and Account charts for E and MM)
    - Threshold Sensitivity chart
    - Rep Summary table
    - Account Assignments table (collapsible)
  - Empty state: show "Upload data to begin" when no data loaded
- `app/src/components/slicer/SlicerLayout.tsx` - Layout wrapper component

**Acceptance Criteria:**
- [ ] Page layout matches wireframes.md v3 layout and follows UI-DESIGN-SYSTEM.md
- [ ] Tab navigation (Analyze/Compare/Audit) with sticky header
- [ ] Left sidebar contains all controls
- [ ] Main content sections render in correct order
- [ ] Empty state displayed when no data uploaded
- [ ] Page responsive on tablet and desktop
- [ ] Sections update in real-time when controls change

---

### AE-21: Implement threshold slider component

**Scope:** Build dynamic range slider for employee-count threshold with 1K increments.

**Deliverables:**
- `app/src/components/slicer/ThresholdSlider.tsx` - Slider component:
  - Range slider (shadcn/ui Slider component)
  - Dynamic min/max from data (rounded to nearest 1K)
  - 1,000-employee increments
  - Display current threshold value
  - Update store on change (triggers recalculation)
  - Show min/max labels below slider

**Acceptance Criteria:**
- [ ] Slider range matches data (min rounded down, max rounded up to nearest 1K)
- [ ] Slider increments in 1,000-employee steps
- [ ] Current threshold value displayed
- [ ] Changing threshold triggers segmentation and allocation recalculation
- [ ] Slider accessible (keyboard navigation, ARIA labels)
- [ ] Visual feedback shows current position

---

### AE-22: Build balance weight sliders (sum to 100%)

**Scope:** Create three sliders (ARR, Account, Risk) that auto-adjust to maintain 100% sum.

**Deliverables:**
- `app/src/components/slicer/BalanceWeightSliders.tsx` - Weight sliders component:
  - Three sliders: ARR Weight, Account Weight, Risk Weight
  - Range 0-100%, 1% increments
  - Auto-adjustment: when one slider changes, proportionally adjust other two to maintain sum=100%
  - Rounding: calculate proportional values, round to nearest integer, reconcile ±1 difference by adjusting larger slider
  - Display percentage values
  - Update store on change (triggers allocation recalculation)
  - Disable Risk slider if Risk_Score missing (greyed, locked to 0%)

**Acceptance Criteria:**
- [ ] Three sliders sum to exactly 100%
- [ ] Sliders adjust in 1% increments
- [ ] Changing one slider proportionally adjusts others to maintain 100% sum
- [ ] Rounding handled correctly (no sum drift)
- [ ] Risk slider disabled and locked to 0% when Risk_Score missing
- [ ] Changing weights triggers allocation and fairness recalculation
- [ ] Sliders accessible and keyboard-navigable

---

### AE-23: Create preference sliders (0.00–0.10)

**Scope:** Build two sliders for Geo Match and Preserve bonuses with 0.00-0.10 range.

**Deliverables:**
- `app/src/components/slicer/PreferenceSliders.tsx` - Preference sliders component:
  - Geo Match slider: 0.00-0.10 range, 0.01 step, default 0.05
  - Preserve slider: 0.00-0.10 range, 0.01 step, default 0.05
  - Display values with 2 decimal places (e.g., "0.05")
  - Update store on change (triggers allocation recalculation)
  - High-Risk Threshold slider: 0-100 range, step 5, default 70

**Acceptance Criteria:**
- [ ] Geo Match slider: 0.00-0.10 range, 0.01 increments, default 0.05
- [ ] Preserve slider: 0.00-0.10 range, 0.01 increments, default 0.05
- [ ] High-Risk Threshold slider: 0-100 range, step 5, default 70
- [ ] Values displayed with appropriate precision (2 decimals for preferences, integer for high-risk)
- [ ] Changing sliders triggers allocation recalculation
- [ ] Sliders accessible and keyboard-navigable

---

### AE-24: Build segment summary cards with metrics

**Scope:** Display Enterprise, Mid Market, and Total segment metrics in unified card format (combined with fairness index).

**Deliverables:**
- `app/src/components/slicer/SegmentOverviewCards.tsx` - Summary cards component:
  - Three equal-width cards: Enterprise, Mid Market, Total
  - Each card combines metrics (ARR, Accounts, ARR/Rep, Accts/Rep, Avg Deal Size, High-Risk ARR %) and fairness index (Custom/Balanced scores + ARR/Account/Risk breakdown)
  - Each card displays:
    - ARR (total for segment)
    - Accounts (count)
    - ARR/Rep (ARR ÷ number of reps in segment)
    - Accts/Rep (Accounts ÷ number of reps in segment)
    - Avg Deal (ARR ÷ Accounts)
  - Format numbers: ARR as currency ($62M), counts as integers, ratios with 1 decimal
  - Handle empty segments: show N/A for undefined metrics

**Acceptance Criteria:**
- [ ] Three unified cards render: Enterprise, Mid Market, Total (not separate metric and fairness cards)
- [ ] Enterprise card shows E segment metrics
- [ ] Mid Market card shows MM segment metrics
- [ ] Total card shows combined metrics
- [ ] Numbers formatted correctly (currency, integers, decimals)
- [ ] Empty segments show N/A (not 0 or errors)
- [ ] Cards update in real-time when threshold changes

---

### AE-25: Implement fairness score display with color bands

**Scope:** Display Custom and Balanced fairness scores with 5-band color coding (Integrated into SegmentOverviewCards component, not standalone).

**Deliverables:**
- Fairness index integrated into `app/src/components/slicer/SegmentOverviewCards.tsx`
- Three cards: Enterprise, Mid Market, Average
  - Each card displays:
    - Custom composite score (with color badge)
    - Balanced composite score (with color badge)
    - ARR Balance score (with color bar)
    - Account Balance score (with color bar)
    - Risk Distribution score (with color bar, N/A if Risk_Score missing)
  - Color bands: 94-100 Dark Green, 88-93 Light Green, 82-87 Yellow, 75-81 Orange, <75 Red
  - Tooltip on hover: explain CV% method and what scores mean
  - Show N/A for null scores (empty segments, missing Risk_Score)

**Acceptance Criteria:**
- [ ] Three cards render (Enterprise, Mid-Market, Average)
- [ ] Custom and Balanced scores displayed with color badges
- [ ] ARR, Account, Risk scores displayed with color bars
- [ ] Color bands applied correctly (94-100 Dark Green, etc.)
- [ ] Tooltips explain fairness scores on hover
- [ ] N/A displayed for null scores (not 0 or 100)
- [ ] Scores update in real-time when weights/threshold change

---

### AE-26: Create rep distribution charts (ARR and Accounts)

**Scope:** Build horizontal bar charts showing ARR and account distribution across Enterprise and Mid-Market reps.

**Deliverables:**
- `app/src/components/slicer/RepDistributionCharts.tsx` - Distribution charts component:
  - Two chart sets: Enterprise reps, Mid-Market reps
  - Each set has two charts: ARR by Rep, Accounts by Rep
  - Stacked bars: Base ARR + High-Risk ARR (if Risk_Score available)
  - Show rep names on Y-axis, values on X-axis
  - Average trend line across bars
  - Color coding: Base ARR (primary color), High-Risk ARR (secondary color)
  - Use Recharts BarChart component

**Acceptance Criteria:**
- [ ] Four charts render: E ARR, E Accounts, MM ARR, MM Accounts
- [ ] Stacked bars show Base + High-Risk ARR (when Risk_Score available)
- [ ] Rep names displayed on Y-axis
- [ ] Average trend line shown across bars
- [ ] Charts update in real-time when allocation changes
- [ ] Empty segments handled gracefully (no errors)
- [ ] Charts responsive and accessible

---

### AE-27: Build sensitivity chart with dual Y-axis

**Scope:** Create line chart showing Balanced and Custom fairness across thresholds with Deal Size Ratio on secondary Y-axis.

**Deliverables:**
- `app/src/components/slicer/SensitivityChart.tsx` - Sensitivity chart component:
  - Recharts LineChart with dual Y-axis:
    - Left Y-axis: Fairness (0-100)
    - Right Y-axis: Deal Size Ratio (E:MM)
  - Two lines: "Balanced Fairness" (33/33/33 scoring), "Custom Fairness" (user's weight scoring)
  - X-axis: Threshold (employee count)
  - Hover tooltip: show threshold, both fairness scores, Deal Size Ratio, weight splits
  - Current threshold indicator (vertical line)
  - Chart computed once on data load (not per-threshold optimization)

**Acceptance Criteria:**
- [ ] Dual Y-axis chart renders correctly
- [ ] Two lines: Balanced Fairness and Custom Fairness
- [ ] Secondary Y-axis shows Deal Size Ratio
- [ ] Hover tooltip displays threshold, scores, ratio, weight splits
- [ ] Current threshold indicator shown
- [ ] Chart uses pre-computed sensitivity data (not recalculated on every render)
- [ ] ~30-50 data points for smooth curve
- [ ] Chart responsive and accessible

---

### AE-28: Implement rep summary table

**Scope:** Display per-rep metrics in a sortable table with accordion functionality (collapsible).

**Deliverables:**
- `app/src/components/slicer/RepSummaryTable.tsx` - Summary table component:
  - Accordion header with rep count and expand/collapse icon (▲/▼), expanded by default
  - Columns: Rep, ARR, Accounts, Avg Deal, Geo Match %, Preserve %
  - Sortable columns (click header to sort)
  - Format: ARR as currency, counts as integers, percentages with 1 decimal
  - Calculate Geo Match %: (accounts with geo match / total accounts) * 100
  - Calculate Preserve %: (accounts with Original_Rep match / total accounts) * 100
  - Group by segment (Enterprise reps first, then Mid-Market reps)

**Acceptance Criteria:**
- [ ] Accordion functionality works (collapsible section with icon)
- [ ] Table displays all reps with metrics
- [ ] Columns sortable (ascending/descending)
- [ ] Numbers formatted correctly (currency, integers, percentages)
- [ ] Geo Match % calculated correctly
- [ ] Preserve % calculated correctly
- [ ] Reps grouped by segment (E first, then MM)
- [ ] Table updates in real-time when allocation changes
- [ ] Table accessible (keyboard navigation, screen reader support)

---

### AE-29: Build account assignments table

**Scope:** Display all accounts with assigned rep, segment, ARR, employees, risk in a sortable, filterable table.

**Deliverables:**
- `app/src/components/slicer/AccountAssignmentsTable.tsx` - Assignments table component:
  - Columns: Account ID, Account Name, Segment, Assigned Rep, ARR, Employees, Risk Score (if available)
  - Sortable columns
  - Filterable by segment, rep, risk level
  - Collapsible section (default collapsed, expand to view)
  - Format: ARR as currency, Employees as integer with K suffix (e.g., "53K"), Risk Score as integer
  - Pagination for large datasets (optional, if >100 rows)

**Acceptance Criteria:**
- [ ] Table displays all accounts with assignments
- [ ] Columns sortable and filterable
- [ ] Section collapsible (default collapsed)
- [ ] Numbers formatted correctly
- [ ] Risk Score column shown only when Risk_Score available
- [ ] Table updates in real-time when allocation changes
- [ ] Table accessible and performant for large datasets

---

### AE-30: Add Optimize Weights button and modal

**Scope:** Create button that triggers optimization and displays results in a modal.

**Deliverables:**
- `app/src/components/slicer/OptimizeWeightsButton.tsx` - Optimize button component:
  - Button: "Optimize Weights"
  - On click: run optimizer, show loading state, display results modal
  - Modal displays:
    - Current weights and Balanced score
    - Recommended weights and resulting Balanced score
    - Improvement delta (+X points)
    - "Apply" button to update sliders
    - "Cancel" button to dismiss
  - Tooltip: explain what optimization does ("Searches all weight combinations to find highest Balanced fairness at current threshold")
- `app/src/components/slicer/OptimizeWeightsModal.tsx` - Results modal component

**Acceptance Criteria:**
- [ ] Button triggers optimization on click
- [ ] Loading state shown during optimization
- [ ] Modal displays current and recommended weights
- [ ] Modal shows Balanced score improvement
- [ ] "Apply" button updates weight sliders to recommended values
- [ ] "Cancel" button dismisses modal without changes
- [ ] Tooltip explains optimization behavior
- [ ] Modal accessible (keyboard navigation, focus trap)

---

### AE-31: Build Territory Comparison page layout

**Scope:** Create page layout for before/after comparison with ARR charts, account charts, KPI improvements, and account movement table.

**Deliverables:**
- `app/src/pages/TerritoryComparisonPage.tsx` - Comparison page layout:
  - Left sidebar (shared controls)
  - Main content sections:
    - ARR by Rep (Before vs After) chart
    - Accounts by Rep (Before vs After) chart
    - KPI Improvement cards
    - Account Movement table (collapsible)
  - Empty state: show "Upload data and configure allocation to view comparison"
- `app/src/components/comparison/ComparisonLayout.tsx` - Layout wrapper component

**Acceptance Criteria:**
- [ ] Page layout matches wireframes.md comparison layout and follows UI-DESIGN-SYSTEM.md styling
- [ ] Uses same design tokens as Analyze page (shadows, rounded-xl, sentence case)
- [ ] Left sidebar contains shared controls
- [ ] Main content sections render in correct order
- [ ] Empty state displayed when no allocation results
- [ ] Page responsive on tablet and desktop
- [ ] Sections update in real-time when controls change

---

### AE-32: Create before/after ARR bar charts

**Scope:** Build clustered column chart showing ARR distribution before (Original_Rep) and after (Assigned_Rep).

**Deliverables:**
- `app/src/components/comparison/ArrComparisonChart.tsx` - ARR comparison chart:
  - Recharts BarChart with clustered columns
  - X-axis: Rep names (all reps)
  - Two bars per rep: Before (Original_Rep assignments), After (Assigned_Rep assignments)
  - Y-axis: ARR (currency format)
  - Legend: "Before (Original)" and "After (New Allocation)"
  - Color coding: Before (light color), After (dark color)
  - Hover tooltip: show rep name, before ARR, after ARR, delta

**Acceptance Criteria:**
- [ ] Clustered column chart renders correctly
- [ ] Two bars per rep: Before and After
- [ ] ARR values displayed correctly (currency format)
- [ ] Legend explains Before vs After
- [ ] Hover tooltip shows values and delta
- [ ] Chart updates when allocation changes
- [ ] Chart accessible and responsive

---

### AE-33: Build before/after account distribution charts

**Scope:** Create clustered column chart showing account count distribution before and after allocation.

**Deliverables:**
- `app/src/components/comparison/AccountDistributionChart.tsx` - Account comparison chart:
  - Recharts BarChart with clustered columns
  - X-axis: Rep names (all reps)
  - Two bars per rep: Before (Original_Rep assignments), After (Assigned_Rep assignments)
  - Y-axis: Account count (integer)
  - Legend: "Before (Original)" and "After (New Allocation)"
  - Color coding: Before (light color), After (dark color)
  - Hover tooltip: show rep name, before count, after count, delta

**Acceptance Criteria:**
- [ ] Clustered column chart renders correctly
- [ ] Two bars per rep: Before and After
- [ ] Account counts displayed correctly (integers)
- [ ] Legend explains Before vs After
- [ ] Hover tooltip shows values and delta
- [ ] Chart updates when allocation changes
- [ ] Chart accessible and responsive

---

### AE-34: Implement KPI improvement cards

**Scope:** Display fairness improvement metrics (CV% deltas) and other KPIs.

**Deliverables:**
- `app/src/components/comparison/KpiImprovementCards.tsx` - KPI cards component:
  - Cards display:
    - ARR CV%: Before → After, Δ (delta), visual bar showing improvement
    - Account CV%: Before → After, Δ, visual bar
    - Risk CV%: Before → After, Δ, visual bar (N/A if Risk_Score missing)
    - Geo Match %: Before → After, Δ, visual bar
  - Format: CV% as percentage (e.g., "32% → 8%"), delta as signed number (e.g., "-24%")
  - Visual bars: green for improvement (negative delta), red for degradation (positive delta)
  - Calculate baseline: run allocation with equal weights (33/33/33) on Original_Rep assignments

**Acceptance Criteria:**
- [ ] Cards display ARR, Account, Risk CV% improvements
- [ ] Geo Match % improvement shown
- [ ] Values formatted correctly (percentages, signed deltas)
- [ ] Visual bars indicate improvement direction (green = better, red = worse)
- [ ] Risk CV% shows N/A when Risk_Score missing
- [ ] Baseline calculated from Original_Rep assignments with equal weights
- [ ] Cards update when allocation changes

---

### AE-35: Create account movement table with filtering

**Scope:** Display accounts that changed reps (Original_Rep ≠ Assigned_Rep) with filtering options.

**Deliverables:**
- `app/src/components/comparison/AccountMovementTable.tsx` - Movement table component:
  - Columns: Account Name, From Rep (Original_Rep), To Rep (Assigned_Rep), Segment, ARR
  - Filterable by: Segment, From Rep, To Rep
  - Sortable columns
  - Show only accounts where Original_Rep ≠ Assigned_Rep
  - Collapsible section (default collapsed)
  - Format: ARR as currency
  - Pagination for large datasets (optional, if >100 rows)

**Acceptance Criteria:**
- [ ] Table shows only accounts that changed reps
- [ ] Columns filterable and sortable
- [ ] Section collapsible (default collapsed)
- [ ] Numbers formatted correctly
- [ ] Filters work correctly (segment, from/to rep)
- [ ] Table updates when allocation changes
- [ ] Table accessible and performant

---

### AE-36: Build Audit Trail page layout

**Scope:** Create page layout for step-through allocation explainability.

**Deliverables:**
- `app/src/pages/AuditTrailPage.tsx` - Audit trail page layout:
  - Left sidebar (shared controls)
  - Main content sections:
    - Step counter: "Step X of Y"
    - Account info card (name, ARR, employees)
    - Segment reasoning display
    - Rep score comparison table
    - Winner explanation card
    - Navigation controls (Previous, Next, centered)
  - Empty state: show "Upload data and configure allocation to view audit trail"
- `app/src/components/audit/AuditLayout.tsx` - Layout wrapper component

**Acceptance Criteria:**
- [ ] Page layout matches wireframes.md audit trail layout
- [ ] Left sidebar contains shared controls
- [ ] Main content sections render in correct order
- [ ] Step counter displays current step and total
- [ ] Empty state displayed when no audit trail data
- [ ] Page responsive on tablet and desktop
- [ ] Navigation controls functional

---

### AE-37: Implement step-through navigation

**Scope:** Build Previous/Next navigation for stepping through allocation decisions.

**Deliverables:**
- `app/src/components/audit/AccountStepper.tsx` - Stepper component:
  - Previous button (disabled on first step)
  - Next button (disabled on last step)
  - Step counter: "Step X of Y"
  - Optional: jump to step input (number input or slider)
  - Update currentAuditStep in store on navigation
  - Display current account info (name, ARR, employees)

**Acceptance Criteria:**
- [ ] Previous button navigates to previous step
- [ ] Next button navigates to next step
- [ ] Buttons disabled at boundaries (first/last step)
- [ ] Step counter updates correctly
- [ ] Jump to step input works (if implemented)
- [ ] Navigation updates displayed content
- [ ] Navigation accessible (keyboard shortcuts: arrow keys)

---

### AE-38: Create decision explainability cards

**Scope:** Display why a specific account was assigned to a specific rep.

**Deliverables:**
- `app/src/components/audit/DecisionExplanationCard.tsx` - Explanation card component:
  - Display account info: Name, ARR, Employees
  - Display segment assignment: "Enterprise (threshold 2,750: 53K ≥ 2,750)" or "Mid-Market (threshold 2,750: 450 < 2,750)"
  - Display winner: Rep name
  - Display reasoning: "Mickey wins because: highest total score (most under target) + geo match bonus"
  - Format: Clear, readable explanation with bullet points or structured text

**Acceptance Criteria:**
- [ ] Account info displayed correctly
- [ ] Segment assignment reason formatted correctly
- [ ] Winner rep name displayed
- [ ] Reasoning explains why rep won (highest total score, bonuses, tie-breaking)
- [ ] Explanation clear and defensible
- [ ] Card updates when step changes
- [ ] Card accessible and readable

---

### AE-39: Build rep score comparison display

**Scope:** Display table of all eligible reps with their scores for the current account.

**Deliverables:**
- `app/src/components/audit/RepScoreComparison.tsx` - Score comparison table:
  - Columns: Rep, Blended (need), Geo, Preserve, Total
  - Highlight winner row (highest Total score)
  - Format scores: 2 decimal places
  - Show bonuses: "+0.05" if applied, "0" if not
  - Tooltip on Blended column: explain blended score (positive = under target, higher = more need)
  - Sortable by Total score (descending, winner first)

**Acceptance Criteria:**
- [ ] Table displays all eligible reps (same segment as account)
- [ ] Scores displayed correctly (2 decimal places)
- [ ] Bonuses shown: "+0.05" or "0"
- [ ] Winner row highlighted
- [ ] Tooltip explains blended score on hover
- [ ] Table updates when step changes
- [ ] Table accessible and sortable

---

### AE-40: Implement segment reasoning display

**Scope:** Display why account was assigned to Enterprise vs Mid-Market segment.

**Deliverables:**
- `app/src/components/audit/SegmentReasoningDisplay.tsx` - Segment reasoning component:
  - Display: "Enterprise (threshold 2,750: 53K ≥ 2,750)" or "Mid-Market (threshold 2,750: 450 < 2,750)"
  - Format: Clear, one-line explanation
  - Show threshold value and account employee count
  - Use comparison operator (≥ or <)

**Acceptance Criteria:**
- [ ] Segment reason displayed correctly
- [ ] Format: "Enterprise (threshold X: Y ≥ X)" or "Mid-Market (threshold X: Y < X)"
- [ ] Threshold and employee count shown
- [ ] Comparison operator correct (≥ for Enterprise, < for Mid-Market)
- [ ] Display updates when step changes
- [ ] Display accessible and readable

---

### AE-41: Create tooltip system with definitions

**Scope:** Implement reusable tooltip component with content definitions for key concepts.

**Deliverables:**
- `app/src/components/common/Tooltip.tsx` - Reusable tooltip component (shadcn/ui based):
  - Hover trigger with info icon or question mark
  - Tooltip content from definitions file
  - Accessible (keyboard focus, screen reader support)
- `app/src/lib/tooltips/definitions.ts` - Tooltip content definitions:
  - `FAIRNESS_SCORE`: "Fairness score (0-100) calculated as 100 - CV%. Higher scores indicate more balanced distribution. CV% measures coefficient of variation across reps."
  - `BALANCED_FAIRNESS`: "Average of ARR CV%, Account CV%, and Risk CV% fairness scores using equal weights (33/33/33). Unbiased baseline for comparison."
  - `CUSTOM_FAIRNESS`: "Weighted average of ARR CV%, Account CV%, and Risk CV% fairness scores using your current balance weights. Reflects your priorities."
  - `BLENDED_SCORE`: "Normalized need score combining ARR balance, Account balance, and Risk balance with your current weights. Positive scores (0 to 1) indicate rep is under target—higher means more need. Negative scores indicate rep is over target. Preference bonuses are then applied to calculate final priority."
  - `GEO_MATCH`: "Bonus (0.00-0.10) applied when account and rep location strings match exactly (case-insensitive). Example: 'CA' = 'ca' but 'California' ≠ 'CA'."
  - `OPTIMIZE_WEIGHTS`: "Searches all weight combinations (1% increments) to find the weight split (ARR/Account/Risk) that produces the highest Balanced fairness score at your current threshold. Optimization target: Balanced fairness (33/33/33 composite), not Custom fairness."
  - `PRESERVE_BONUS`: "Bonus (0.00-0.10) applied when account's Original_Rep matches this rep. Helps maintain existing rep relationships while balancing workload."
  - `DEAL_SIZE_RATIO`: "Ratio of Enterprise average ARR to Mid-Market average ARR. Higher ratio indicates larger Enterprise deals relative to Mid-Market deals."

**Acceptance Criteria:**
- [ ] Tooltip component reusable across application
- [ ] Tooltip content loaded from definitions file
- [ ] Tooltips appear on hover/focus
- [ ] Tooltips accessible (keyboard navigation, screen reader)
- [ ] All required tooltips implemented (fairness scores, blended score, geo match, optimize weights)
- [ ] Tooltip content clear and helpful
- [ ] Tooltips positioned correctly (not cut off screen)

---

### AE-42: Build CSV export functionality

**Scope:** Generate CSV file with all original columns plus Segment and Assigned_Rep.

**Deliverables:**
- `app/src/lib/export/csvExporter.ts` - CSV export functions:
  - `exportAllocationResults(accounts: Account[], allocationResults: AllocationResult[]): string` - Generate CSV:
    - Include all original columns from uploaded Accounts data
    - Keep "Original_Rep" column as-is (already mapped from "Current_Rep" during XLSX import)
    - Add "Segment" column (Enterprise or Mid Market)
    - Add "Assigned_Rep" column
    - Format: CSV with headers, comma-separated values
    - Handle special characters (quotes, commas)
- `app/src/components/common/ExportButton.tsx` - Export button component:
  - Button: "Export CSV"
  - On click: generate CSV, trigger browser download
  - Filename: "territory-allocation-YYYY-MM-DD.csv"
  - Disabled when no allocation results

**Acceptance Criteria:**
- [ ] CSV includes all original columns
- [ ] "Original_Rep" column preserved (no renaming needed, already mapped from "Current_Rep" during XLSX import)
- [ ] "Segment" column added (Enterprise or Mid Market)
- [ ] "Assigned_Rep" column added
- [ ] CSV formatted correctly (headers, comma-separated)
- [ ] Special characters handled (quotes escaped)
- [ ] Download triggered on button click
- [ ] Filename includes date stamp
- [ ] Button disabled when no results

---

### AE-43: Implement empty segment handling

**Scope:** Handle thresholds that result in empty Enterprise or Mid-Market segments gracefully.

**Deliverables:**
- `app/src/components/common/EmptySegmentWarning.tsx` - Warning banner component:
  - Display when segment has zero accounts
  - Message: "No [Enterprise/Mid-Market] accounts at this threshold."
  - Show N/A for undefined metrics (CV%, per-rep calculations)
  - Display in segment summary cards and fairness cards
- `app/src/lib/allocation/fairness.ts` - Update fairness functions to return null for empty segments
- `app/src/components/slicer/SegmentSummaryCards.tsx` - Display N/A for empty segment metrics

**Acceptance Criteria:**
- [ ] Warning banner displayed when segment is empty
- [ ] Message clear: "No Enterprise accounts at this threshold" or "No Mid-Market accounts at this threshold"
- [ ] N/A displayed for undefined metrics (not 0 or 100)
- [ ] Fairness scores show N/A for empty segments
- [ ] Segment summary cards show N/A for empty segments
- [ ] No errors thrown for empty segments
- [ ] Tool remains functional (other segment still works)

---

### AE-44: Build missing risk_score degradation

**Scope:** Handle missing Risk_Score column gracefully by disabling Risk dimension.

**Deliverables:**
- `app/src/components/common/MissingRiskBanner.tsx` - Info banner component:
  - Display when Risk_Score column not found in uploaded data
  - Message: "Risk_Score column not found. Risk dimension disabled. Tool remains functional for ARR and Account balancing."
  - Display on upload page and slicer page
- `app/src/components/slicer/BalanceWeightSliders.tsx` - Disable and lock Risk slider to 0% when Risk_Score missing
- `app/src/components/slicer/FairnessScoreDisplay.tsx` - Show N/A for Risk Distribution score when Risk_Score missing
- `app/src/lib/allocation/fairness.ts` - Return null for Risk fairness when Risk_Score missing

**Acceptance Criteria:**
- [ ] Info banner displayed when Risk_Score missing
- [ ] Message clear and informative
- [ ] Risk slider disabled and locked to 0%
- [ ] Risk Distribution fairness shows N/A
- [ ] Tool remains functional (ARR and Account balancing works)
- [ ] No errors thrown for missing Risk_Score
- [ ] Custom and Balanced composites calculated correctly (Risk weight = 0%)

---

### AE-45: Add warning and info banners

**Scope:** Create reusable banner components for warnings and informational messages.

**Deliverables:**
- `app/src/components/common/AlertBanner.tsx` - Reusable banner component:
  - Variants: warning (yellow), info (blue), error (red)
  - Dismissible (optional)
  - Accessible (ARIA labels, keyboard navigation)
- `app/src/components/common/EmptySegmentWarning.tsx` - Uses AlertBanner (warning variant)
- `app/src/components/common/MissingRiskBanner.tsx` - Uses AlertBanner (info variant)
- `app/src/components/upload/ValidationFeedback.tsx` - Uses AlertBanner (error variant for hard errors, warning variant for soft warnings)

**Acceptance Criteria:**
- [ ] Banner component reusable with variants
- [ ] Visual distinction between warning (yellow), info (blue), error (red)
- [ ] Banners dismissible (if configured)
- [ ] Banners accessible (ARIA labels, keyboard navigation)
- [ ] Banners positioned correctly (not overlapping content)
- [ ] Banners responsive on mobile

---

### AE-46: Implement responsive layout adjustments

**Scope:** Ensure application works well on tablet and desktop screen sizes.

**Deliverables:**
- `app/src/styles/responsive.css` - Responsive styles:
  - Breakpoints: tablet (768px), desktop (1024px)
  - Sidebar: full-width on mobile, fixed width on desktop
  - Cards: stack vertically on mobile, side-by-side on desktop
  - Tables: horizontal scroll on mobile, full-width on desktop
  - Charts: responsive sizing
- `app/src/components/layout/MainLayout.tsx` - Apply responsive classes
- `app/src/components/slicer/SegmentSummaryCards.tsx` - Stack cards on mobile
- `app/src/components/slicer/FairnessScoreDisplay.tsx` - Stack cards on mobile

**Acceptance Criteria:**
- [ ] Layout responsive on tablet (768px+)
- [ ] Layout responsive on desktop (1024px+)
- [ ] Sidebar adapts to screen size
- [ ] Cards stack on mobile, side-by-side on desktop
- [ ] Tables scroll horizontally on mobile if needed
- [ ] Charts resize appropriately
- [ ] No horizontal scroll on mobile (unless table overflow)
- [ ] Touch targets adequate size (44px minimum)

---

### AE-47: Add loading states and optimistic updates

**Scope:** Provide visual feedback during allocation computation and other async operations.

**Deliverables:**
- `app/src/components/common/LoadingSpinner.tsx` - Loading spinner component (shadcn/ui based)
- `app/src/components/common/LoadingOverlay.tsx` - Full-page loading overlay
- `app/src/store/allocationStore.ts` - Add isLoading state to uiSlice
- `app/src/pages/TerritorySlicerPage.tsx` - Show loading spinner during allocation computation
- `app/src/components/slicer/OptimizeWeightsButton.tsx` - Show loading state during optimization
- Optimistic updates: update UI immediately, then recalculate in background

**Acceptance Criteria:**
- [ ] Loading spinner displayed during allocation computation
- [ ] Loading state shown during optimization
- [ ] Loading overlay displayed during CSV parsing
- [ ] Optimistic updates: UI updates immediately, then recalculates
- [ ] Loading states accessible (ARIA labels, screen reader announcements)
- [ ] Loading states don't block user interaction unnecessarily
- [ ] Performance: allocation completes in <200ms for typical datasets

---

### AE-48: Perform cross-browser testing

**Scope:** Validate application works correctly across major browsers.

**Deliverables:**
- Browser compatibility test report:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
- Test cases: upload CSV, adjust sliders, view charts, export CSV, navigate pages
- Document any browser-specific issues or workarounds

**Acceptance Criteria:**
- [ ] Application works in Chrome (latest)
- [ ] Application works in Firefox (latest)
- [ ] Application works in Safari (latest)
- [ ] Application works in Edge (latest)
- [ ] All features functional across browsers
- [ ] No browser-specific bugs (or documented workarounds)
- [ ] Test report documents results

---

### AE-49: End-to-end integration testing

**Scope:** Validate complete user workflows across all pages (upload → slicer → comparison → audit → export).

**Deliverables:**
- `app/src/__tests__/integration/` - Integration test suite directory
- Test workflows covering:
  - Full allocation workflow: upload CSVs → configure threshold/weights → view results → export
  - Multi-page navigation: Slicer → Comparison → Audit Trail, verify state persists
  - State persistence: verify allocation results persist across page navigation
  - Export accuracy: verify exported CSV matches allocation results (all columns, correct values)
  - User interactions: slider changes, optimize weights button, step navigation
- Verify: complete workflows execute successfully, no console errors, state management works correctly

**Acceptance Criteria:**
- [ ] Upload → Slicer → Comparison → Audit → Export workflow completes
- [ ] State persists correctly across page navigation
- [ ] Export CSV matches allocation results
- [ ] All user interactions trigger correct state updates
- [ ] No console errors during workflows

---

### AE-50: Performance test with large datasets

**Scope:** Validate application performance with large datasets (1K, 5K, 10K accounts).

**Deliverables:**
- Performance benchmark report:
  - Test datasets: 1K accounts, 5K accounts, 10K accounts
  - Metrics: allocation computation time, sensitivity chart generation time, UI render time
  - Target: <200ms for allocation, <2s for sensitivity chart
- Test file: `app/src/lib/__tests__/performance.test.ts`
- Document performance characteristics and optimization opportunities

**Acceptance Criteria:**
- [ ] Allocation completes in <200ms for 1K accounts
- [ ] Allocation completes in <500ms for 5K accounts
- [ ] Allocation completes in <1s for 10K accounts
- [ ] Sensitivity chart generates in <2s for 1K accounts
- [ ] Sensitivity chart generates in <5s for 5K accounts
- [ ] UI remains responsive during computation
- [ ] Performance benchmarks documented
- [ ] Optimization opportunities identified (if needed)

---

## Implementation Order

```
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 1: Foundation (AE-01 to AE-05)                                │
│ Vite/React setup → Tailwind → Routing → Types → Zustand            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 2: Data Layer (AE-06 to AE-09)                                │
│ Schemas → CSV Parser → Upload UI → Validation Feedback             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 3: Core Allocation Engine + Tests (AE-10 to AE-19)            │
│ Segmentation → Greedy Algorithm → Unit Tests (AE-12) →             │
│ Preferences → Fairness → Unit Tests (AE-15) → Optimizer →          │
│ Sensitivity → Audit Trail → Unit Tests (AE-19)                     │
│                                                                     │
│ ⚠️  CRITICAL GATE: All allocation/fairness tests MUST pass         │
│    before proceeding to Waves 4-7 (UI work)                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ↓                     ↓                     ↓
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ WAVE 4: UI Slicer │ │ WAVE 5: UI Comp.  │ │ WAVE 6: UI Audit  │
│ (AE-20 to AE-30)  │ │ (AE-31 to AE-35)  │ │ (AE-36 to AE-40)  │
│                   │ │                   │ │                   │
│ Territory Slicer  │ │ Territory         │ │ Audit Trail       │
│ Page with 11 UI   │ │ Comparison Page   │ │ Page with step-   │
│ components        │ │ with before/after │ │ through explainer │
└───────────────────┘ └───────────────────┘ └───────────────────┘
                                  } Can run in parallel
        └─────────────────────┬─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 7: Polish (AE-41 to AE-47)                                    │
│ Tooltips → Export → Empty Segment Handling → Missing Risk →        │
│ Banners → Responsive → Loading States                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 8: Integration & Performance Testing (AE-48 to AE-50)         │
│ Cross-Browser Testing → End-to-End Integration → Performance       │
│                                                                     │
│ Note: Unit tests for allocation/fairness moved to Wave 3           │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this order:**

1. **Wave 1 (Foundation)** establishes the build tooling, routing, type system, and state management that every subsequent task depends on. These 5 tasks must complete before any feature development can begin.

2. **Wave 2 (Data Layer)** builds on the types and store from Wave 1. CSV parsing, schemas, and validation depend on the TypeScript interfaces defined in AE-04. The upload UI requires the React routing structure from AE-03.

3. **Wave 3 (Core Allocation + Critical Testing Gate)** implements the business logic that drives all three pages AND validates correctness through unit tests. The allocation engine (AE-10 to AE-19) consumes the data schemas from Wave 2 and produces the allocation results, fairness metrics, sensitivity data, and audit trail that the UI layers will display. **This wave now includes 3 testing tasks (AE-12, AE-15, AE-19) that MUST pass before any UI work (Waves 4-7) begins.** This ensures the core allocation and fairness algorithms are mathematically correct and handle edge cases properly before building UI on top of them. This is the most complex wave with 10 interdependent tasks that must run sequentially.

4. **Waves 4/5/6 (UI Pages) can run in parallel** because each builds a distinct page with no file conflicts:
   - **Wave 4** builds Territory Slicer page (11 tasks)
   - **Wave 5** builds Territory Comparison page (5 tasks)
   - **Wave 6** builds Audit Trail page (5 tasks)
   
   All three waves depend on Wave 3's allocation engine but are otherwise independent. They each create separate page files and component trees. This is the primary parallelization opportunity in the plan.

5. **Wave 7 (Polish)** adds cross-cutting concerns that touch multiple pages: tooltips, export functionality, edge case handling, responsive design, and loading states. These tasks require the UI pages from Waves 4/5/6 to be complete so they can add polish to the full application.

6. **Wave 8 (Integration & Performance Testing)** validates the complete system through cross-browser testing, end-to-end integration testing, and performance benchmarking. **Unit tests for allocation and fairness (formerly AE-46, AE-48) moved to Wave 3 as critical gates (AE-12, AE-15, AE-19).** Wave 8 now focuses on integration testing (complete user workflows) and performance validation rather than first-time unit testing. These tasks require the entire application (Waves 1-7) to be complete.

**Parallelization within waves:**

- **Wave 1:** AE-01/AE-02 (Vite setup + Tailwind) can run in parallel if assigned to different implementers. AE-03/AE-04/AE-05 depend on AE-01/AE-02 completion.
- **Wave 2:** AE-06/AE-07 (schemas + parser) can run in parallel. AE-08/AE-09 (upload UI + validation feedback) can run in parallel after AE-06/AE-07.
- **Wave 3:** Mostly sequential due to algorithm interdependencies. AE-12 (tests) must follow AE-11 (implementation). AE-15 (tests) must follow AE-14 (implementation). AE-19 (tests) must follow AE-18 (implementation). AE-16/AE-17 (optimizer + sensitivity) can run in parallel after AE-15 completes. **All tests (AE-12, AE-15, AE-19) must pass before Wave 4 begins.**
- **Waves 4/5/6:** Fully parallel across waves. Within Wave 4, some components can be built in parallel (e.g., AE-24/AE-25 segment cards + fairness display).
- **Wave 7:** AE-41 (tooltips) and AE-42 (export) can start in parallel. AE-43/AE-44/AE-45 (edge case handling) can run in parallel. AE-46/AE-47 (responsive + loading) should run sequentially at the end.
- **Wave 8:** All 3 testing tasks (browser, integration, performance) can run in parallel if assigned to different testers.

**Critical path:** Wave 1 → Wave 2 → Wave 3 → Wave 4 (longest UI page) → Wave 7 → Wave 8

Wave 4 (Territory Slicer with 11 tasks) is the longest UI wave and determines the critical path through the parallel UI phase. Waves 5 and 6 will likely complete before Wave 4, so Wave 4's completion gates Wave 7's start.

---

## Success Metrics

**Functional Completeness:**
- ✅ All 22 success criteria from INTENT.md implemented
- ✅ Three pages (Slicer, Comparison, Audit) operational
- ✅ Upload → Configure → Analyze → Export workflow functional
- ✅ Real-time feedback on all slider adjustments
- ✅ Tooltips on all required elements (fairness scores, blended score, geo match, optimize weights)

**Performance:**
- ✅ Sensitivity chart computation: <2 seconds for datasets up to 5K accounts
- ✅ Real-time responsiveness: <200ms for threshold/weight adjustments
- ✅ Allocation computation: <200ms for typical datasets (<1K accounts)

**Quality:**
- ✅ Zero hard errors for valid input files
- ✅ Graceful degradation for missing Risk_Score
- ✅ Clear validation feedback for malformed data
- ✅ Empty segments handled gracefully (N/A metrics, warning banners)
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

**User Experience:**
- ✅ Tooltips on all non-obvious UI elements
- ✅ Responsive design functional on tablet and desktop
- ✅ Color-coded fairness bands immediately recognizable
- ✅ Clear error messages with actionable guidance
- ✅ Loading states provide feedback during computation

---

## Risks & Mitigations

**Risk:** Large datasets (10K+ accounts) cause UI lag on weight changes  
**Mitigation:** Debounce slider inputs; move allocation to Web Worker if needed; implement virtual scrolling for large tables

**Risk:** Optimize Weights button takes too long (10K+ weight combinations)  
**Mitigation:** Show progress indicator; consider early termination if fairness improvement plateaus; optimize search algorithm if needed

**Risk:** Location string matching too strict (e.g., "San Francisco" vs "SF")  
**Mitigation:** Document requirement for consistent location formats in tooltips and validation note; consider fuzzy matching in v2

**Risk:** Users don't understand why fairness score changed  
**Mitigation:** Display CV% breakdown alongside composite scores; link to Audit Trail for account-level details; tooltips explain calculations

**Risk:** Browser memory limits with very large datasets  
**Mitigation:** Implement pagination for tables; lazy load chart data; consider data streaming for CSV parsing

---

## Future Enhancements (Out of Scope for v1)

- Multi-segment support (SMB, Mid-Market, Enterprise)
- Automated threshold recommendation
- Persistent session storage (localStorage or cloud)
- API exposure for CRM integration
- Team hierarchy with manager roll-ups
- Real-time collaboration for multi-user planning
- Advanced data validation and cleaning tools
- Fuzzy location matching
- Historical tracking and versioning
- Mobile-optimized UI (beyond responsive design)

---

**Plan Status:** Ready for implementation  
**Estimated Complexity:** Medium-High (50 tasks across 8 waves, AE-01 through AE-50)  
**Critical Path:** Wave 3 (Core Allocation + Tests - CRITICAL GATE) → Wave 4 (UI Slicer) → Wave 5 (UI Comparison) → Wave 6 (UI Audit)
