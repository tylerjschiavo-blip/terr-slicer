# Data model & validation

Required inputs, schema, and rules for the Territory Slicer.

## Source

- User **uploads** a single XLSX file with Reps and Accounts tabs. The parser auto-detects tabs by column headers (Reps tab has `Rep_Name`, Accounts tab has `Account_ID`). No segment assignments in the Accounts tab; segment is determined by threshold + Reps.
- **Format:** Single XLSX file with multiple tabs (not separate CSV files). Auto-detection provides flexible tab naming.

## Reps

- **Purpose:** List of reps and their fixed segment (Enterprise or Mid Market) and location.
- **Required columns:** `Rep_Name`, `Segment` ('Enterprise' | 'Mid Market'), `Location` (for geo match).
- **Notes:** Segment must be present; missing or invalid segment → hard error. Rep segment never changes with threshold; only account segment does. Segment values are full names ('Enterprise' | 'Mid Market'), not abbreviations.

## Accounts

- **Purpose:** All accounts with current rep, ARR, size, location, and risk.
- **Required columns:** `Account_ID`, `Account_Name`, `Original_Rep` (for baseline and preserve bonus), `ARR`, `Num_Employees` (for threshold), `Location` (for geo match).
- **Optional column:** `Risk_Score` (for high-risk and fairness). If missing, Risk weight locked to 0%.
- **Column Mapping:** If the uploaded XLSX file contains a "Current_Rep" column, it is automatically mapped to "Original_Rep" during import. This mapping is transparent to users and displayed in validation feedback.
- **Notes:** "Original_Rep" is the baseline for Territory Comparison (before vs after) and for the preserve multiplier in allocation.

## Baseline for comparison

- **Before:** Assignments from uploaded data (Original_Rep per account).
- **After:** Assignments produced by the allocation engine at current threshold and weights.
- Territory Comparison and Account Movement use this before/after. Audit Trail explains how "after" was built step-by-step.

## Validation & empty state

- **Hard errors (block processing):**
  - Missing required columns (Reps: Rep_Name, Segment, Location; Accounts: Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location)
  - Invalid data types (e.g., non-numeric ARR or Num_Employees)
  - Duplicate Account_IDs or Rep_Names
  - Invalid Segment values (must be 'Enterprise' or 'Mid Market')
  - Missing Reps or Accounts tabs in XLSX file
- **Soft warnings (proceed with caution):**
  - Risk_Score values outside expected 0–100 range
  - Orphan reps (reps in Reps tab not referenced by any account's Original_Rep)
  - Location format inconsistencies (reminder to align formats for geo matching)
- **Validation note on upload:** 
  - Remind users that location matching is exact string, case-insensitive ("CA" = "ca" but "California" ≠ "CA"). User responsible for data consistency.
  - Inform users that "Current_Rep" column is automatically mapped to "Original_Rep" during XLSX import.
  - Display auto-detection message: "The parser will auto-detect Reps (Rep_Name column) and Accounts (Account_ID column) tabs"
- **Empty state:** Before any successful upload, show "Upload data to begin" and disable or hide main content (charts, tables, sliders that depend on data).
- **Edge cases:** If threshold is set so all accounts are one segment (all Enterprise or all Mid Market), show a short message and still render charts/tables. If a segment has no reps in the Reps tab, handle without division by zero and show a message.

## Export

- **Export CSV:** Full account list with **Assigned_Rep** and **Segment** from the current run. Same row count as Accounts; one row per account. All original columns preserved plus new columns (Segment, Assigned_Rep). **Original_Rep** column preserved as-is (already mapped from "Current_Rep" during XLSX import if applicable).
