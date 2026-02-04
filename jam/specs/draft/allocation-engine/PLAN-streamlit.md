# Plan: allocation-engine

**Initiative:** allocation-engine
**Status:** Draft
**DSL Version:** plan/1.0
**Intent:** [INTENT.md](./INTENT.md)

---

## Overview

This plan delivers an interactive Territory Slicer web application using **Streamlit + Python**. Users upload Reps and Accounts data, slide an employee-count threshold to segment accounts into Enterprise/Mid-Market, and instantly see fairness metrics, rep workloads, and allocation results. The weighted greedy allocation algorithm balances ARR, Account count, and Risk distribution with user-tunable weights and preference bonuses.

**Tech Stack:**
- **Streamlit** — Interactive web UI with `st.slider`, `st.file_uploader`, `st.tabs`
- **Python 3.11+** — Core allocation algorithm and data processing
- **Pandas** — Data manipulation and validation
- **Plotly** — Interactive charts (sensitivity, before/after comparison)
- **NumPy** — Numerical calculations for fairness metrics

**Architecture:**
```
src/
├── allocation/
│   ├── engine.py         # Core weighted greedy allocation
│   ├── fairness.py       # CV% → 0-100 score conversions
│   └── optimizer.py      # Weight optimization search
├── data/
│   ├── models.py         # Dataclasses for Reps, Accounts
│   ├── validator.py      # Upload validation (hard/soft errors)
│   └── loader.py         # CSV parsing with error handling
├── ui/
│   ├── app.py            # Main Streamlit entry point
│   ├── territory_slicer.py   # Page 1: threshold + config
│   ├── comparison.py     # Page 2: before/after analysis
│   └── audit_trail.py    # Page 3: decision explainability
├── charts/
│   ├── sensitivity.py    # Fairness across thresholds
│   └── comparison.py     # Before/after bar charts
└── utils/
    ├── export.py         # CSV export with all columns
    └── tooltips.py       # Tooltip text definitions
```

---

## Task Table

| Task | Title | Role | Skill | Wave | Group |
|------|-------|------|-------|------|-------|
| AE-01 | Project initialization and dependencies | python-implementer | python-development | 1 | setup |
| AE-02 | Data models for Reps and Accounts | python-implementer | python-development | 1 | data |
| AE-03 | CSV upload validator with hard/soft errors | python-implementer | python-development | 1 | data |
| AE-04 | Core weighted greedy allocation algorithm | python-implementer | python-development | 1 | algorithm |
| AE-05 | Fairness metrics (CV% → 0-100 scores) | python-implementer | python-development | 2 | metrics |
| AE-06 | 5-band color scale logic and thresholds | python-implementer | python-development | 2 | metrics |
| AE-07 | Weight optimization search function | python-implementer | python-development | 2 | algorithm |
| AE-08 | Sensitivity chart computation (30-50 samples) | python-implementer | python-development | 2 | analysis |
| AE-09 | Streamlit app structure and routing | ui-implementer | ui-development | 3 | ui-foundation |
| AE-10 | File upload UI with validation feedback | ui-implementer | ui-development | 3 | ui-foundation |
| AE-11 | Threshold slider with dynamic range | ui-implementer | ui-development | 3 | ui-controls |
| AE-12 | Balance weight sliders (sum to 100%) | ui-implementer | ui-development | 3 | ui-controls |
| AE-13 | Preference sliders (Geo, Preserve: 0.00-0.10) | ui-implementer | ui-development | 3 | ui-controls |
| AE-14 | Fairness metrics display with color bands | ui-implementer | ui-development | 4 | ui-display |
| AE-15 | "Optimize Weights" button and feedback | ui-implementer | ui-development | 4 | ui-controls |
| AE-16 | Territory Slicer page layout and sections | ui-implementer | ui-development | 4 | pages |
| AE-17 | Territory Comparison page (before/after) | ui-implementer | ui-development | 4 | pages |
| AE-18 | Audit Trail page with step-through | ui-implementer | ui-development | 4 | pages |
| AE-19 | Sensitivity chart visualization (Plotly) | ui-implementer | ui-development | 4 | charts |
| AE-20 | Before/after comparison charts (Plotly) | ui-implementer | ui-development | 4 | charts |
| AE-21 | Rep distribution and workload tables | ui-implementer | ui-development | 4 | ui-display |
| AE-22 | Account assignments table with sorting | ui-implementer | ui-development | 4 | ui-display |
| AE-23 | CSV export with all original columns + new fields | python-implementer | python-development | 5 | export |
| AE-24 | Tooltip definitions and implementation | ui-implementer | ui-development | 5 | polish |
| AE-25 | Empty segment handling (N/A, warning banner) | ui-implementer | ui-development | 5 | error-handling |
| AE-26 | Missing risk_score graceful degradation | ui-implementer | ui-development | 5 | error-handling |
| AE-27 | UI/UX design and color scheme | ui-designer | ui-design | 3 | design |
| AE-28 | Responsive layout and mobile considerations | ui-designer | ui-design | 5 | design |
| AE-29 | Unit tests for allocation algorithm | ui-test-implementer | ui-testing | 6 | testing |
| AE-30 | Unit tests for fairness metrics | ui-test-implementer | ui-testing | 6 | testing |
| AE-31 | Integration tests for data validation | ui-test-implementer | ui-testing | 6 | testing |
| AE-32 | End-to-end test with sample data | ui-test-implementer | ui-testing | 6 | testing |
| AE-33 | Deployment configuration (Docker/Cloud Run) | devops-implementer | devops | 7 | deployment |
| AE-34 | README with usage instructions | devops-implementer | devops | 7 | documentation |

---

## Wave 1: Foundation (Setup, Data, Core Algorithm)

### AE-01: Project initialization and dependencies
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `requirements.txt` — Pin versions: streamlit>=1.32.0, pandas>=2.2.0, plotly>=5.19.0, numpy>=1.26.0, pytest>=8.0.0
- `pyproject.toml` — Project metadata, Python 3.11+, dev dependencies (black, ruff, mypy)
- `.gitignore` — Python cache, venv, .streamlit/secrets.toml, .pytest_cache, __pycache__
- `src/__init__.py` — Empty file to mark package root
- `README.md` — Placeholder with title and tech stack

**Acceptance:**
- `pip install -r requirements.txt` succeeds without errors
- Project structure created with all src/ subdirectories

---

### AE-02: Data models for Reps and Accounts
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/data/models.py` — Dataclasses:
  - `Rep`: rep_name (str), segment (Literal["Enterprise", "Mid-Market"]), location (str)
  - `Account`: account_id (str), account_name (str), original_rep (str), arr (float), num_employees (int), location (str), risk_score (Optional[float])
  - `AllocationResult`: account_id (str), segment (str), assigned_rep (str), score (float), reasoning (dict)
  - `FairnessMetrics`: arr_cv (float), account_cv (float), risk_cv (Optional[float]), balanced_score (float), custom_score (float), color_band (str)

**Acceptance:**
- All dataclasses have type hints and default values where appropriate
- Optional[float] for risk_score handles missing values
- Models validated with mypy --strict

---

### AE-03: CSV upload validator with hard/soft errors
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/data/validator.py` — Functions:
  - `validate_reps_data(df: pd.DataFrame) -> Tuple[bool, List[str], List[str]]` — Returns (is_valid, hard_errors, soft_warnings)
  - `validate_accounts_data(df: pd.DataFrame) -> Tuple[bool, List[str], List[str]]`
  - Hard errors: missing required columns, invalid data types, negative ARR/employees
  - Soft warnings: missing risk_score column (triggers graceful degradation), location format inconsistencies, duplicate account_ids
- `src/data/loader.py` — Functions:
  - `load_reps(uploaded_file) -> Tuple[List[Rep], List[str], List[str]]`
  - `load_accounts(uploaded_file) -> Tuple[List[Account], List[str], List[str], bool]` — Returns has_risk_score flag

**Acceptance:**
- Validator rejects CSV with missing required columns (hard error)
- Validator warns but accepts CSV with missing risk_score (soft warning)
- Loader converts valid DataFrame to typed dataclass instances
- Unit tests cover 5+ validation scenarios

---

### AE-04: Core weighted greedy allocation algorithm
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/allocation/engine.py` — Core allocation engine:
  - `allocate_accounts(accounts: List[Account], reps: List[Rep], threshold: int, weights: Dict[str, float], preferences: Dict[str, float], has_risk_score: bool) -> List[AllocationResult]`
  - Segment accounts: num_employees >= threshold → Enterprise, else Mid-Market
  - For each account, calculate blended score for each eligible rep:
    - Base drivers: ARR, Account count (incremental), Risk distribution (if available)
    - Preference bonuses: Geo match (+bonus), Preserve existing rep (+bonus)
    - Blended score = (w_arr × normalized_arr + w_acct × normalized_acct + w_risk × normalized_risk) × (1 + geo_bonus + preserve_bonus)
  - Assign account to rep with highest blended score
  - Track reasoning: segment decision, candidate rep scores, winner, tiebreaker

**Acceptance:**
- Allocation produces deterministic results for fixed inputs
- All accounts assigned (no orphans)
- Reasoning dict captures segment, scores, winner for audit trail
- Handles empty segments without errors (returns empty rep list for that segment)
- Risk weight automatically set to 0 when has_risk_score=False

---

## Wave 2: Metrics and Analysis

### AE-05: Fairness metrics (CV% → 0-100 scores)
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/allocation/fairness.py` — Fairness calculation functions:
  - `calculate_cv_percent(values: List[float]) -> float` — Standard deviation / mean × 100, handles empty lists → return None
  - `cv_to_score(cv_percent: float) -> float` — Inverted: lower CV = higher score; formula: max(0, 100 - (cv_percent × multiplier))
  - `calculate_fairness_metrics(results: List[AllocationResult], reps: List[Rep], weights: Dict[str, float], has_risk_score: bool) -> FairnessMetrics`
    - Compute ARR CV%, Account Count CV%, Risk CV% (if available) per rep
    - Convert each CV% → 0-100 score
    - Balanced Score = average of available driver scores (exclude Risk if missing)
    - Custom Score = weighted average using current slider weights
  - `get_color_band(score: float) -> str` — Returns: "dark_green", "light_green", "yellow", "orange", "red"

**Acceptance:**
- CV% calculation matches standard formula: (std_dev / mean) × 100
- Score conversion produces 0-100 range (clamp negatives to 0)
- Balanced score excludes Risk when has_risk_score=False
- Empty segment returns None for all CV% values
- Unit tests verify score boundaries: 94→dark_green, 93→light_green, 87→yellow, 81→orange, 74→red

---

### AE-06: 5-band color scale logic and thresholds
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/allocation/fairness.py` — Update `get_color_band()` with exact thresholds:
  - 94–100 → Dark Green (#006400)
  - 88–93 → Light Green (#90EE90)
  - 82–87 → Yellow (#FFD700)
  - 75–81 → Orange (#FFA500)
  - <75 → Red (#DC143C)
- `src/utils/colors.py` — Color constants:
  - `COLOR_BANDS = {"dark_green": "#006400", "light_green": "#90EE90", "yellow": "#FFD700", "orange": "#FFA500", "red": "#DC143C"}`
  - `get_color_for_score(score: float) -> str` — Returns hex color

**Acceptance:**
- Boundary tests: 94.0→dark_green, 93.9→light_green, 87.9→yellow, 81.9→orange, 74.9→red
- Color constants used consistently across UI components
- No magic strings for colors in any file

---

### AE-07: Weight optimization search function
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/allocation/optimizer.py` — Optimization function:
  - `optimize_weights(accounts: List[Account], reps: List[Rep], threshold: int, preferences: Dict[str, float], has_risk_score: bool) -> Dict[str, Any]`
  - Grid search over all valid weight combinations in 1% increments that sum to 100%
  - If has_risk_score=False, only search ARR/Account combinations (Risk locked at 0%)
  - For each combination: run allocation, calculate Balanced fairness score
  - Return best combination: {weights: {arr: X, account: Y, risk: Z}, balanced_score: score, improvement: delta}
  - Add early termination: stop if score reaches 100.0 or search exceeds 2 seconds
- `src/utils/progress.py` — Progress indicator helper for optimization display

**Acceptance:**
- Finds optimal weights for sample dataset within 2 seconds
- Returns improvement delta comparing current vs optimal Balanced score
- Handles has_risk_score=False by only searching 2D space (ARR/Account)
- Unit test: verifies optimal weights produce higher Balanced score than random weights

---

### AE-08: Sensitivity chart computation (30-50 samples)
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/allocation/sensitivity.py` — Sensitivity analysis:
  - `compute_sensitivity(accounts: List[Account], reps: List[Rep], weights_balanced: Dict, weights_custom: Dict, preferences: Dict, has_risk_score: bool) -> pd.DataFrame`
  - Determine threshold range from data: min_employees to max_employees
  - Sample ~30-50 threshold values evenly across range
  - For each threshold:
    - Run allocation with Balanced weights → compute Balanced fairness score
    - Run allocation with Custom weights → compute Custom fairness score
    - Calculate Deal Size Ratio: avg(Enterprise ARR) / avg(Mid-Market ARR)
  - Return DataFrame: columns [threshold, balanced_score, custom_score, deal_size_ratio, enterprise_count, midmarket_count]
  - Optimize for <2 second compute time: use sampling if dataset is large

**Acceptance:**
- Sensitivity chart computed once on data load, not on every slider change
- Returns 30-50 data points evenly distributed across threshold range
- Deal Size Ratio calculated only for thresholds with both segments non-empty (otherwise None)
- Performance test: completes in <2 seconds for 1000 accounts, 20 reps

---

## Wave 3: UI Foundation and Basic Controls

### AE-09: Streamlit app structure and routing
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/app.py` — Main Streamlit app entry point:
  - `st.set_page_config(page_title="Territory Slicer", layout="wide")`
  - Session state initialization: uploaded_data, allocation_results, sensitivity_data
  - Three-tab navigation using `st.tabs(["Territory Slicer", "Territory Comparison", "Audit Trail"])`
  - Import and render page modules: territory_slicer, comparison, audit_trail
- `src/ui/__init__.py` — Empty file for package
- `.streamlit/config.toml` — Theme configuration: primary color #1f77b4, background #ffffff

**Acceptance:**
- App launches with `streamlit run src/ui/app.py`
- Three tabs render without errors
- Session state persists across interactions
- No page flicker on slider changes (use st.session_state properly)

---

### AE-10: File upload UI with validation feedback
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — File upload section:
  - Two `st.file_uploader` widgets: one for Reps CSV, one for Accounts CSV
  - On upload, call `validator.validate_reps_data()` and `validator.validate_accounts_data()`
  - Display hard errors in `st.error()` red boxes, block further interaction
  - Display soft warnings in `st.warning()` yellow boxes, allow continuation
  - Show info banner with `st.info()` if risk_score missing: "Risk weight locked to 0%, Risk CV% will show N/A"
  - Store validated data in session state: `st.session_state.reps`, `st.session_state.accounts`, `st.session_state.has_risk_score`
  - Show success message in `st.success()` when both files valid

**Acceptance:**
- Upload fails with clear error message for invalid CSV
- Upload succeeds with warning for missing risk_score
- Info banner displays when risk_score missing
- Session state populated only after successful validation
- UI disables downstream controls until both files uploaded successfully

---

### AE-11: Threshold slider with dynamic range
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Threshold slider component:
  - `st.slider("Employee Count Threshold", min_value=min_employees, max_value=max_employees, step=1000, value=default_threshold)`
  - Dynamic range: min = min(accounts.num_employees), max = max(accounts.num_employees)
  - Default value: median num_employees (rounded to nearest 1000)
  - Display current segment split below slider: "Enterprise: {X} accounts | Mid-Market: {Y} accounts"
  - On change, update session state: `st.session_state.threshold`

**Acceptance:**
- Slider range computed from uploaded data, not hardcoded
- Step size is 1000 employees
- Segment count updates in real-time on slider drag
- Default value is sensible (median of distribution)

---

### AE-12: Balance weight sliders (sum to 100%)
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Balance weight sliders:
  - Three `st.slider` widgets: ARR Weight (0-100%), Account Weight (0-100%), Risk Weight (0-100%)
  - Step size: 1% increments
  - Real-time sum validation: display running total below sliders: "Total: {X}%" with color: green if 100%, red otherwise
  - Disable allocation button if sum ≠ 100%
  - Lock Risk slider at 0% (disabled) if has_risk_score=False, show tooltip: "Risk data not available"
  - Store in session state: `st.session_state.weights = {arr: X, account: Y, risk: Z}`

**Acceptance:**
- Sliders move in 1% increments
- Sum validation prevents allocation if total ≠ 100%
- Risk slider disabled with tooltip when risk_score missing
- Validation updates in real-time without page reload

---

### AE-13: Preference sliders (Geo, Preserve: 0.00-0.10)
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Preference slider section:
  - `st.slider("Geo Match Bonus", min_value=0.00, max_value=0.10, step=0.01, value=0.05, format="%.2f")`
  - `st.slider("Preserve Existing Rep Bonus", min_value=0.00, max_value=0.10, step=0.01, value=0.05, format="%.2f")`
  - Tooltip icon next to each slider using `st.markdown()` with custom CSS for hover
  - Store in session state: `st.session_state.preferences = {geo: X, preserve: Y}`

**Acceptance:**
- Sliders support 0.01 step increments
- Format displays two decimal places: 0.05, not 0.050000
- Default values are 0.05 for both
- Tooltips explain: "Geo: +5% bonus for location match" and "Preserve: +5% bonus for keeping existing rep"

---

### AE-27: UI/UX design and color scheme
**Role:** ui-designer  
**Skill:** ui-design

**Deliverables:**
- `src/ui/styles.css` — Custom CSS for Streamlit components:
  - Color palette: primary #1f77b4, success #006400, warning #FFA500, error #DC143C
  - Typography: headers (Roboto 24px bold), body (Roboto 14px), monospace (Courier New 12px for tables)
  - Card-style containers with `st.container()` and border: 1px solid #e0e0e0, padding: 20px, border-radius: 8px
  - Responsive grid for metrics: 3 columns on desktop, stack on mobile (<768px)
- `src/ui/app.py` — Load custom CSS:
  - `st.markdown(f"<style>{css_content}</style>", unsafe_allow_html=True)`

**Deliverables (continued):**
- Design specification document: `docs/ui-design-spec.md`:
  - Color palette definitions with hex codes
  - Spacing system: 8px base unit (multiples: 8, 16, 24, 32)
  - Component hierarchy: headers, subheaders, metrics, tables, charts
  - Accessibility: WCAG AA contrast ratios, keyboard navigation support

**Acceptance:**
- Custom CSS loaded without breaking Streamlit default styles
- Color bands match exact hex codes from AE-06
- Metrics display in clean card layout with visual separation
- Design spec documented for future reference

---

## Wave 4: Pages, Charts, and Advanced Display

### AE-14: Fairness metrics display with color bands
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Fairness metrics section:
  - Metrics cards using `st.columns(3)`:
    - Column 1: **Balanced Score** — large bold number with color background, 5-band color from `get_color_band()`
    - Column 2: **Custom Score** — same format as Balanced
    - Column 3: **Individual Driver CV%** — ARR CV%, Account CV%, Risk CV% (or "N/A" if missing)
  - Tooltip icon next to Balanced/Custom scores explaining calculation
  - Color background using `st.markdown()` with inline CSS: background-color from COLOR_BANDS
  - Display segment-level fairness: Enterprise CV% and Mid-Market CV% in expandable section

**Acceptance:**
- Scores display with exact 5-band colors matching thresholds
- Risk CV% shows "N/A" when has_risk_score=False
- Tooltip appears on hover explaining Balanced vs Custom score
- Empty segment shows "N/A" for all metrics with warning banner above

---

### AE-15: "Optimize Weights" button and feedback
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Optimize button section:
  - `st.button("Optimize Weights for Balanced Fairness")` next to weight sliders
  - On click:
    - Show `st.spinner("Searching optimal weights...")` during computation
    - Call `optimizer.optimize_weights()` for current threshold
    - Display result in `st.success()`: "Optimal weights found: ARR {X}%, Account {Y}%, Risk {Z}% → Balanced Score: {score} (+{improvement} improvement)"
    - Update weight sliders to optimal values automatically
    - Re-run allocation with new weights
  - Tooltip next to button: "Finds best weight combination for current threshold only (1% increments)"
  - Disable button if both files not uploaded

**Acceptance:**
- Button triggers optimization search
- Spinner shows during computation (1-2 seconds)
- Success message shows optimal weights and improvement delta
- Weight sliders update to optimal values automatically
- Tooltip clarifies optimization scope (current threshold, not global)

---

### AE-16: Territory Slicer page layout and sections
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Complete page layout:
  - **Section 1: Upload** (AE-10) — File uploaders with validation
  - **Section 2: Configuration** (AE-11, AE-12, AE-13) — Threshold slider, weight sliders, preference sliders
  - **Section 3: Optimize** (AE-15) — Optimize button with feedback
  - **Section 4: Fairness Metrics** (AE-14) — Balanced/Custom scores with color bands
  - **Section 5: Sensitivity Chart** (AE-19) — Fairness across thresholds with deal size ratio
  - **Section 6: Rep Summary** (AE-21) — Workload distribution table
  - **Section 7: Account Assignments** (AE-22) — Full account allocation table with sorting
  - Sections rendered in order with `st.header()` titles and horizontal dividers
  - Disable Sections 2-7 until files uploaded (gray out with message: "Upload data to begin")

**Acceptance:**
- All sections render in logical order
- Sections disabled until prerequisite data available
- No visual breaks or layout shifts on interaction
- Page scrollable without horizontal overflow

---

### AE-17: Territory Comparison page (before/after)
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/comparison.py` — Comparison page layout:
  - **Section 1: KPI Improvement Cards** (3 columns):
    - Balanced Score: Before → After with delta (+X improvement) in green
    - ARR Distribution CV%: Before → After with delta
    - Account Distribution CV%: Before → After with delta
  - **Section 2: Before/After Charts** (AE-20) — Side-by-side bar charts for ARR and account count per rep
  - **Section 3: Account Movement Table**:
    - Columns: Account Name, Original Rep, New Assigned Rep, Segment, ARR, Reason (Geo Match/Preserve/Score)
    - Filter to show only accounts where Original Rep ≠ New Assigned Rep
    - Sortable by ARR (highest first by default)
    - Show movement count: "X accounts reassigned (Y% of total)"
  - Message if no data: "Upload data and run allocation on Territory Slicer page first"

**Acceptance:**
- KPI cards show clear before/after deltas with color coding (green=improvement, red=regression)
- Charts render side-by-side without overlap
- Movement table shows only changed assignments
- Page gracefully handles no data state

---

### AE-18: Audit Trail page with step-through
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/audit_trail.py` — Audit trail page:
  - **Section 1: Account Selector**:
    - Searchable dropdown: `st.selectbox("Select Account", options=account_names, index=0)`
    - Auto-complete search with fuzzy matching
  - **Section 2: Decision Breakdown**:
    - Display for selected account:
      - **Segment Decision**: "Num Employees: {X} → Threshold: {T} → Segment: {Enterprise/Mid-Market}"
      - **Candidate Reps**: Table with columns [Rep Name, Base Score, Geo Bonus, Preserve Bonus, Blended Score]
        - Sort by Blended Score descending
        - Highlight winner row in light green background
      - **Winner Explanation**: "Assigned to {Rep Name} because: [highest blended score / geo match tiebreaker / preserve tiebreaker]"
  - **Section 3: Score Calculation Details** (expandable):
    - Show formula: Blended = (w_arr × arr_norm + w_acct × acct_norm + w_risk × risk_norm) × (1 + geo + preserve)
    - Show normalized values for winner: arr_norm, acct_norm, risk_norm
  - Message if no data: "Run allocation on Territory Slicer page to see decision trail"

**Acceptance:**
- Account selector has auto-complete search (type to filter)
- Decision breakdown shows all candidate rep scores
- Winner row visually distinct (highlighted)
- Explanation text dynamically generated based on reasoning dict from allocation
- Expandable section for score details doesn't clutter main view

---

### AE-19: Sensitivity chart visualization (Plotly)
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/charts/sensitivity.py` — Sensitivity chart function:
  - `render_sensitivity_chart(sensitivity_df: pd.DataFrame) -> None`:
    - Plotly line chart with dual Y-axes:
      - **Primary Y-axis (left)**: Balanced Fairness (blue line), Custom Fairness (orange line)
      - **Secondary Y-axis (right)**: Deal Size Ratio (gray dashed line)
    - X-axis: Threshold (employee count), range from min to max in data
    - Add vertical line marker at current threshold (green dashed) with annotation
    - Hover tooltip shows: Threshold, Balanced Score, Custom Score, Deal Size Ratio, Enterprise Count, Mid-Market Count
    - Legend positioned top-right, outside plot area
    - Responsive sizing: `st.plotly_chart(fig, use_container_width=True)`
- `src/ui/territory_slicer.py` — Integrate chart:
  - Call `render_sensitivity_chart(st.session_state.sensitivity_df)` in Section 5
  - Display above chart: "Sensitivity Analysis (computed once on data load)"

**Acceptance:**
- Chart renders with two Y-axes properly scaled
- Current threshold marked with vertical line
- Hover tooltip shows all relevant data points
- Chart resizes smoothly on window resize
- Computed once on upload, not recalculated on slider changes (show note confirming this)

---

### AE-20: Before/after comparison charts (Plotly)
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/charts/comparison.py` — Comparison charts functions:
  - `render_arr_comparison(before_df: pd.DataFrame, after_df: pd.DataFrame) -> None`:
    - Grouped bar chart: Rep Name on X-axis, ARR on Y-axis
    - Two bars per rep: Before (light blue), After (dark blue)
    - Sort reps by After ARR descending
    - Hover shows exact ARR values and delta
  - `render_account_comparison(before_df: pd.DataFrame, after_df: pd.DataFrame) -> None`:
    - Same structure as ARR chart but for account count
  - Both functions use `st.plotly_chart(fig, use_container_width=True)`
- `src/ui/comparison.py` — Integrate charts:
  - Display charts side-by-side using `st.columns(2)`
  - Left column: ARR comparison, Right column: Account comparison
  - Title above charts: "ARR Distribution by Rep" and "Account Distribution by Rep"

**Acceptance:**
- Charts display side-by-side without horizontal scroll
- Bars grouped correctly (before/after per rep)
- Reps sorted by After value descending
- Hover tooltip shows before, after, and delta
- Charts responsive and resize with window

---

### AE-21: Rep distribution and workload tables
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Rep summary table in Section 6:
  - `st.dataframe()` with columns:
    - Rep Name | Segment | Accounts Assigned | Total ARR | Avg ARR per Account | Risk Score Avg (or "N/A") | CV% Contribution
  - Sort by Total ARR descending by default
  - Color-code CV% Contribution column using gradient: low CV (green) to high CV (red)
  - Add summary row at bottom: "Total: {X} accounts, ${Y} ARR"
  - Show separate tables for Enterprise and Mid-Market reps (two expandable sections)

**Acceptance:**
- Table displays all reps with correct calculated metrics
- Sorting works on any column (click column header)
- CV% gradient colors applied correctly
- Summary row totals match allocation results
- Empty segment shows empty table with message: "No reps assigned to this segment"

---

### AE-22: Account assignments table with sorting
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Account assignments table in Section 7:
  - `st.dataframe()` with columns:
    - Account Name | Account ID | Segment | Assigned Rep | Original Rep | ARR | Num Employees | Location | Risk Score | Blended Score
  - Default sort: Blended Score descending
  - Highlight rows where Assigned Rep ≠ Original Rep (light yellow background)
  - Add filters above table:
    - Segment filter: dropdown ["All", "Enterprise", "Mid-Market"]
    - Rep filter: dropdown with all rep names + "All"
    - Changed assignments only: checkbox to show only reassigned accounts
  - Pagination: show 50 rows per page with next/prev buttons
  - Download button below table: "Download Full Table (CSV)"

**Acceptance:**
- Table renders with all allocation results
- Sorting works on any column
- Filters apply correctly and update table in real-time
- Reassigned accounts highlighted visually
- Pagination handles large datasets (1000+ accounts) without performance issues
- Download button exports filtered view to CSV

---

## Wave 5: Export, Tooltips, and Error Handling

### AE-23: CSV export with all original columns + new fields
**Role:** python-implementer  
**Skill:** python-development

**Deliverables:**
- `src/utils/export.py` — Export function:
  - `export_allocation_results(accounts: List[Account], results: List[AllocationResult]) -> io.BytesIO`:
    - Merge original accounts DataFrame with allocation results
    - Add new columns: Segment, Assigned_Rep (keep all original columns)
    - Return BytesIO buffer for download
- `src/ui/territory_slicer.py` — Export button:
  - `st.download_button("Download Allocation Results (CSV)", data=export_buffer, file_name=f"allocation_results_{timestamp}.csv", mime="text/csv")`
  - Place button below Account Assignments table (Section 7)
  - Filename includes timestamp: YYYY-MM-DD_HH-MM-SS

**Acceptance:**
- Exported CSV contains all original columns plus Segment and Assigned_Rep
- Column order: original columns first, then Segment, then Assigned_Rep
- No data loss: row count matches uploaded accounts
- Filename timestamp in ISO 8601 format
- Download triggers immediately on button click

---

### AE-24: Tooltip definitions and implementation
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/utils/tooltips.py` — Tooltip content:
  - `TOOLTIPS = {`
    - `"balanced_score": "Average of ARR, Account, and Risk fairness scores (0-100). Higher = more balanced workload across reps.",`
    - `"custom_score": "Weighted average using your custom weight sliders. Shows fairness optimized for your priorities.",`
    - `"blended_score": "Composite score per account-rep pair: (weighted drivers) × (1 + geo bonus + preserve bonus).",`
    - `"geo_match": "Bonus applied when rep and account locations match. Helps keep territories geographically clustered.",`
    - `"optimize": "Searches all weight combinations (1% increments) to maximize Balanced fairness at current threshold. Does not change threshold.",`
    - `"cv_percent": "Coefficient of Variation: (std dev / mean) × 100. Measures distribution inequality. Lower = more fair.",`
    - `"deal_size_ratio": "Average Enterprise ARR ÷ Average Mid-Market ARR. Shows deal size difference between segments."`
  - `}`
- `src/ui/territory_slicer.py` — Tooltip implementation:
  - Use `st.markdown()` with custom HTML for tooltip icons:
    - Icon: ⓘ (Unicode info symbol) or small question mark
    - CSS hover behavior: show tooltip text in floating box
  - Place tooltips next to:
    - Balanced Score metric (AE-14)
    - Custom Score metric (AE-14)
    - Blended Score column header (AE-22)
    - Geo Match slider (AE-13)
    - Optimize button (AE-15)

**Acceptance:**
- Tooltips appear on hover over info icon
- Tooltip text matches definitions exactly
- Tooltips don't interfere with underlying UI elements
- Tooltips positioned to avoid clipping at screen edges
- All 5 required tooltips implemented (fairness, blended score, geo match, optimize, CV%)

---

### AE-25: Empty segment handling (N/A, warning banner)
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Empty segment logic:
  - After allocation, check if either segment has 0 accounts
  - If empty:
    - Display warning banner at top of page: `st.warning("⚠️ {Segment} segment is empty at this threshold. Fairness metrics may show N/A.")`
    - In Fairness Metrics section (AE-14): show "N/A" for all CV% values for empty segment
    - In Rep Summary table (AE-21): show empty table with message: "No accounts in this segment"
    - In Sensitivity Chart (AE-19): annotate chart with note if any sampled thresholds produce empty segments
  - Empty segments are valid states, not errors (tool remains functional)

**Acceptance:**
- Warning banner appears when either segment is empty
- N/A displayed for undefined metrics (not 0 or error messages)
- All other functionality remains operational
- Sensitivity chart correctly handles empty segments at extreme threshold values
- No Python exceptions thrown for empty segment calculations

---

### AE-26: Missing risk_score graceful degradation
**Role:** ui-implementer  
**Skill:** ui-development

**Deliverables:**
- `src/ui/territory_slicer.py` — Risk score missing handling:
  - When `has_risk_score=False` after upload validation:
    - Display info banner below upload section: `st.info("ℹ️ Risk Score column not found. Risk weight locked to 0%, Risk CV% will show N/A.")`
    - Lock Risk weight slider at 0% (disabled state) with tooltip: "Risk data unavailable in uploaded file"
    - In Fairness Metrics (AE-14): show "N/A" for Risk CV%
    - In Optimizer (AE-15): search only ARR/Account 2D space (Risk=0%)
    - In Rep Summary table (AE-21): show "N/A" for Risk Score Avg column
    - In Account Assignments table (AE-22): show "N/A" for Risk Score column
  - Tool remains fully functional with 2 drivers instead of 3

**Acceptance:**
- Info banner explains degradation clearly
- Risk slider disabled and shows 0% (not removable from UI)
- Balanced score calculated from 2 drivers only (ARR, Account) when risk missing
- Optimization search space reduced to 2D (faster computation)
- No errors or exceptions from missing risk_score column
- Weight sliders still require sum=100% (ARR + Account + 0%)

---

### AE-28: Responsive layout and mobile considerations
**Role:** ui-designer  
**Skill:** ui-design

**Deliverables:**
- `src/ui/styles.css` — Responsive CSS:
  - Breakpoints: desktop (>1200px), tablet (768-1199px), mobile (<767px)
  - Mobile: stack columns vertically, increase font size for readability, expand touch targets to 44px min
  - Tablet: 2-column layouts for metrics, side-by-side charts stacked
  - Hide non-essential elements on mobile: sensitivity chart annotation text, detailed tooltips (show simplified)
- `docs/responsive-design-notes.md` — Document:
  - Viewport meta tag requirements
  - Test checklist for responsive behavior
  - Known limitations (Streamlit mobile support constraints)

**Acceptance:**
- App usable on mobile devices (320px width minimum)
- Sliders functional with touch input
- Tables horizontally scrollable on small screens
- Charts resize without breaking layout
- Critical functionality accessible on all screen sizes

---

## Wave 6: Testing

### AE-29: Unit tests for allocation algorithm
**Role:** ui-test-implementer  
**Skill:** ui-testing

**Deliverables:**
- `tests/test_allocation.py` — Unit tests for allocation engine:
  - `test_allocate_accounts_basic()` — Simple 2 reps, 4 accounts, verify all assigned
  - `test_allocate_accounts_empty_segment()` — Threshold produces empty Mid-Market, verify no errors
  - `test_allocate_accounts_missing_risk_score()` — has_risk_score=False, verify Risk weight=0%, allocation succeeds
  - `test_allocate_accounts_deterministic()` — Same inputs produce same outputs (no randomness)
  - `test_allocate_accounts_preferences()` — Geo match and Preserve bonuses affect assignment correctly
  - `test_allocate_accounts_all_ties()` — Equal scores, verify tiebreaker logic (alphabetical rep name)
  - `test_allocate_accounts_reasoning_captured()` — Verify reasoning dict contains segment, scores, winner
- Use pytest fixtures: `@pytest.fixture def sample_reps()`, `@pytest.fixture def sample_accounts()`
- Target: 90%+ code coverage for `src/allocation/engine.py`

**Acceptance:**
- All tests pass with `pytest tests/test_allocation.py`
- Tests cover happy path, edge cases, and error conditions
- Code coverage report shows 90%+ for allocation engine
- Tests run in <5 seconds total

---

### AE-30: Unit tests for fairness metrics
**Role:** ui-test-implementer  
**Skill:** ui-testing

**Deliverables:**
- `tests/test_fairness.py` — Unit tests for fairness calculations:
  - `test_calculate_cv_percent()` — Standard formula verification with known inputs
  - `test_calculate_cv_percent_empty_list()` — Returns None for empty rep list
  - `test_cv_to_score()` — Verify conversion: low CV→high score, high CV→low score
  - `test_cv_to_score_boundaries()` — Verify clamp to 0-100 range
  - `test_get_color_band()` — Test all 5 band boundaries: 94, 93, 87, 81, 74
  - `test_calculate_fairness_metrics()` — End-to-end: allocation results → metrics with correct scores
  - `test_calculate_fairness_metrics_missing_risk()` — has_risk_score=False, verify Balanced excludes Risk
  - `test_calculate_fairness_metrics_empty_segment()` — Empty segment returns None for CV%
- Target: 95%+ code coverage for `src/allocation/fairness.py`

**Acceptance:**
- All tests pass with `pytest tests/test_fairness.py`
- Color band boundary tests verify exact thresholds
- CV% calculation matches Excel formula output (regression test)
- Tests run in <3 seconds total

---

### AE-31: Integration tests for data validation
**Role:** ui-test-implementer  
**Skill:** ui-testing

**Deliverables:**
- `tests/test_validation.py` — Integration tests for CSV validation:
  - `test_validate_reps_valid()` — Valid Reps CSV passes all checks
  - `test_validate_reps_missing_column()` — Missing required column triggers hard error
  - `test_validate_reps_invalid_segment()` — Segment not in [Enterprise, Mid-Market] triggers hard error
  - `test_validate_accounts_valid()` — Valid Accounts CSV passes all checks
  - `test_validate_accounts_missing_risk_score()` — Missing risk_score triggers soft warning, validation passes
  - `test_validate_accounts_negative_arr()` — Negative ARR triggers hard error
  - `test_validate_accounts_duplicate_ids()` — Duplicate account_id triggers soft warning
- `tests/fixtures/` — Sample CSV files:
  - `reps_valid.csv`, `reps_invalid_missing_column.csv`, `accounts_valid.csv`, `accounts_missing_risk.csv`, `accounts_negative_arr.csv`
- Target: 100% coverage for validation paths (hard error, soft warning, success)

**Acceptance:**
- All tests pass with `pytest tests/test_validation.py`
- Tests use real CSV files (not mocked DataFrames) to verify file parsing
- Hard error tests verify validation returns is_valid=False
- Soft warning tests verify validation returns is_valid=True with warnings list populated
- Tests run in <3 seconds total

---

### AE-32: End-to-end test with sample data
**Role:** ui-test-implementer  
**Skill:** ui-testing

**Deliverables:**
- `tests/test_e2e.py` — End-to-end integration test:
  - Load sample Reps (10 reps, 5 Enterprise, 5 Mid-Market) and Accounts (100 accounts, ARR range $10K-$500K, employees 10-5000)
  - Upload data through validation pipeline
  - Set threshold=500, weights={arr:40, account:40, risk:20}, preferences={geo:0.05, preserve:0.05}
  - Run allocation
  - Verify:
    - All 100 accounts assigned (no orphans)
    - Segment split: ~50 Enterprise, ~50 Mid-Market (within ±10)
    - Fairness scores computed (not None)
    - Color band assigned for Balanced and Custom scores
    - Reasoning dict populated for all accounts
  - Compute sensitivity chart (30 samples), verify DataFrame shape
  - Export CSV, verify output contains 100 rows + headers, columns include Segment and Assigned_Rep
- `tests/fixtures/sample_data/` — Pre-generated realistic sample CSVs:
  - `sample_reps.csv` (10 reps)
  - `sample_accounts.csv` (100 accounts)
- Target: Full workflow validation in single test

**Acceptance:**
- E2E test passes with `pytest tests/test_e2e.py`
- Test runs in <10 seconds
- Sample data realistic (based on real-world sales territory data patterns)
- Test verifies allocation, fairness, sensitivity, and export in one flow
- No Streamlit UI interaction (pure backend logic test)

---

## Wave 7: Deployment and Documentation

### AE-33: Deployment configuration (Docker/Cloud Run)
**Role:** devops-implementer  
**Skill:** devops

**Deliverables:**
- `Dockerfile` — Multi-stage build:
  - Base: `python:3.11-slim`
  - Install dependencies from `requirements.txt`
  - Copy `src/` directory
  - Expose port 8501 (Streamlit default)
  - CMD: `streamlit run src/ui/app.py --server.port=8501 --server.address=0.0.0.0`
- `.dockerignore` — Exclude: `.git`, `__pycache__`, `*.pyc`, `tests/`, `.pytest_cache`, `.venv`
- `deploy/cloud-run.yaml` — Google Cloud Run config (optional):
  - Memory: 2Gi
  - CPU: 2
  - Timeout: 300s (for optimization search)
  - Environment: `STREAMLIT_SERVER_HEADLESS=true`, `STREAMLIT_SERVER_ENABLE_CORS=false`
- `deploy/README.md` — Deployment instructions:
  - Local Docker: `docker build -t territory-slicer . && docker run -p 8501:8501 territory-slicer`
  - Cloud Run: `gcloud run deploy territory-slicer --source . --region us-central1`

**Acceptance:**
- Docker image builds successfully without errors
- Container runs locally and app accessible at `localhost:8501`
- Image size <500MB (optimized with slim base, no dev dependencies)
- Cloud Run deployment instructions verified (if deploying to GCP)
- Health check endpoint responds at `/healthz` (Streamlit default)

---

### AE-34: README with usage instructions
**Role:** devops-implementer  
**Skill:** devops

**Deliverables:**
- `README.md` — Complete documentation:
  - **Title and Description**: Territory Slicer — Interactive allocation engine for Enterprise/Mid-Market segmentation
  - **Features**: Bullet list matching INTENT.md success criteria
  - **Tech Stack**: Streamlit, Python, Pandas, Plotly, NumPy
  - **Installation**:
    - Prerequisites: Python 3.11+, pip
    - Steps: `pip install -r requirements.txt`
  - **Usage**:
    - Run locally: `streamlit run src/ui/app.py`
    - Access at: `http://localhost:8501`
    - Upload Reps and Accounts CSVs (see Data Requirements)
  - **Data Requirements**:
    - Reps CSV: columns [Rep_Name, Segment, Location]
    - Accounts CSV: columns [Account_ID, Account_Name, Original_Rep, ARR, Num_Employees, Location, Risk_Score (optional)]
    - Sample data: link to `tests/fixtures/sample_data/`
  - **Key Features**:
    - Threshold slider, weight sliders, preference sliders
    - Fairness metrics with 5-band color scale
    - Optimize Weights button
    - Sensitivity chart, Territory Comparison, Audit Trail
    - CSV export
  - **Testing**: `pytest tests/ -v --cov=src/`
  - **Deployment**: See `deploy/README.md`
  - **Architecture**: Link to `docs/architecture.md` (if exists)
  - **License**: MIT (or specify)

**Acceptance:**
- README contains all required sections
- Instructions accurate and tested (verified by running commands)
- Sample data referenced with working links
- Markdown formatting renders correctly on GitHub
- No broken links or outdated information

---

## Success Criteria

This plan is complete when all 34 tasks are delivered and the following acceptance tests pass:

1. **Upload and Validate**: User uploads valid Reps and Accounts CSVs → No errors, success message displayed
2. **Missing Risk Score**: User uploads Accounts without risk_score column → Info banner displayed, Risk weight locked to 0%, tool functional
3. **Threshold Slider**: User drags threshold slider → Segment counts update in real-time, allocation re-runs, metrics refresh in <1 second
4. **Weight Sliders**: User adjusts ARR/Account/Risk weights → Sum validation enforces 100%, allocation re-runs when sum=100%
5. **Preference Sliders**: User sets Geo=0.08, Preserve=0.03 → Allocation applies bonuses correctly, reassignments visible in movement table
6. **Fairness Metrics**: User views Balanced and Custom scores → Correct 5-band color displayed, CV% values shown, tooltips explain calculations
7. **Optimize Weights**: User clicks Optimize → Search completes in <2 seconds, optimal weights displayed and applied, Balanced score improves
8. **Sensitivity Chart**: User views chart → Two fairness lines + deal size ratio rendered, current threshold marked, hover shows details
9. **Territory Comparison**: User navigates to Comparison page → Before/after charts displayed, KPI deltas shown, movement table filtered to changed accounts only
10. **Audit Trail**: User selects an account → Segment decision, candidate rep scores, and winner explanation displayed with correct reasoning
11. **CSV Export**: User clicks Download → CSV file downloaded with all original columns + Segment + Assigned_Rep, filename includes timestamp
12. **Empty Segment**: User sets extreme threshold (all accounts in one segment) → Warning banner displayed, N/A shown for empty segment metrics, no errors
13. **Performance**: Dataset of 1000 accounts, 50 reps → Allocation completes in <2 seconds, sensitivity chart computes in <2 seconds, UI remains responsive
14. **Testing**: `pytest tests/ -v --cov=src/` → All tests pass, code coverage >85%
15. **Deployment**: `docker build && docker run` → App accessible at localhost:8501, all features functional in containerized environment

---

**Technical Decisions:**
- Python 3.11+ for match/case syntax and performance improvements
- Plotly over Matplotlib for interactive charts with hover tooltips
- Dataclasses over Pydantic for simplicity (no external validation needed beyond pandas)
- No async: Streamlit architecture is synchronous, single-user per session
- No caching beyond Streamlit's built-in `st.cache_data` for sensitivity chart computation

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Weight sliders don't sum to 100% (user frustration) | Real-time sum validation with color-coded total, disable allocation button if sum ≠ 100% |
| Optimization search too slow (>5 seconds) | Early termination if score=100.0, limit search space to 1% increments, profile and optimize hot loops |
| Empty segment causes divide-by-zero errors | Explicit checks for empty rep lists, return None for CV%, display N/A in UI, warning banner |
| Missing risk_score breaks allocation | Graceful degradation: lock Risk weight to 0%, show info banner, exclude Risk from Balanced score calculation |
| Large datasets (10K+ accounts) slow UI | Pagination for tables (50 rows/page), sensitivity chart sampling (<50 points), profile allocation algorithm |
| Streamlit reloads lose session state | Store all critical data in `st.session_state`, persist sensitivity chart across interactions |
| Tooltip implementation inconsistent | Centralize tooltip text in `src/utils/tooltips.py`, use single helper function for all tooltip rendering |
| Color band thresholds hard to remember | Unit tests lock exact boundaries (94, 93, 87, 81, 74), document in `src/utils/colors.py` |

---

## Next Steps After Completion

Once all 34 tasks are complete and acceptance tests pass:

1. **User Acceptance Testing (UAT)**: Provide tool to sales leaders for real-world testing with actual territory data
2. **Feedback Iteration**: Collect feedback on usability, fairness metric interpretations, and optimization usefulness
3. **Performance Benchmarking**: Test with large datasets (10K accounts, 100 reps) to identify bottlenecks
4. **Feature Enhancements** (future scope):
   - Multi-segment support (SMB, Enterprise, Strategic)
   - Threshold optimization (not just weight optimization)
   - Historical tracking and version comparison
   - API exposure for CRM integration
   - Team hierarchy and manager roll-ups
5. **Documentation Expansion**: Create video tutorial, FAQ, troubleshooting guide based on UAT feedback

---

## Appendix: File Structure

```
territory-slicer/
├── src/
│   ├── __init__.py
│   ├── allocation/
│   │   ├── __init__.py
│   │   ├── engine.py           # AE-04: Weighted greedy allocation
│   │   ├── fairness.py         # AE-05, AE-06: Fairness metrics and color bands
│   │   ├── optimizer.py        # AE-07: Weight optimization search
│   │   └── sensitivity.py      # AE-08: Sensitivity chart computation
│   ├── data/
│   │   ├── __init__.py
│   │   ├── models.py           # AE-02: Dataclasses for Reps, Accounts, etc.
│   │   ├── validator.py        # AE-03: CSV validation (hard/soft errors)
│   │   └── loader.py           # AE-03: CSV loading and parsing
│   ├── ui/
│   │   ├── __init__.py
│   │   ├── app.py              # AE-09: Main Streamlit entry point
│   │   ├── territory_slicer.py # AE-10-16: Territory Slicer page
│   │   ├── comparison.py       # AE-17: Territory Comparison page
│   │   ├── audit_trail.py      # AE-18: Audit Trail page
│   │   └── styles.css          # AE-27: Custom CSS for styling
│   ├── charts/
│   │   ├── __init__.py
│   │   ├── sensitivity.py      # AE-19: Sensitivity chart (Plotly)
│   │   └── comparison.py       # AE-20: Before/after charts (Plotly)
│   └── utils/
│       ├── __init__.py
│       ├── export.py           # AE-23: CSV export function
│       ├── tooltips.py         # AE-24: Tooltip text definitions
│       └── colors.py           # AE-06: Color band constants
├── tests/
│   ├── __init__.py
│   ├── test_allocation.py      # AE-29: Allocation algorithm tests
│   ├── test_fairness.py        # AE-30: Fairness metrics tests
│   ├── test_validation.py      # AE-31: Data validation tests
│   ├── test_e2e.py             # AE-32: End-to-end integration test
│   └── fixtures/
│       ├── sample_data/
│       │   ├── sample_reps.csv
│       │   └── sample_accounts.csv
│       ├── reps_valid.csv
│       ├── reps_invalid_missing_column.csv
│       ├── accounts_valid.csv
│       ├── accounts_missing_risk.csv
│       └── accounts_negative_arr.csv
├── deploy/
│   ├── README.md               # AE-33: Deployment instructions
│   └── cloud-run.yaml          # AE-33: Cloud Run config (optional)
├── docs/
│   ├── ui-design-spec.md       # AE-27: UI design specification
│   └── responsive-design-notes.md # AE-28: Responsive design documentation
├── .streamlit/
│   └── config.toml             # AE-09: Streamlit theme configuration
├── .gitignore                  # AE-01: Git ignore rules
├── requirements.txt            # AE-01: Python dependencies
├── pyproject.toml              # AE-01: Project metadata
├── Dockerfile                  # AE-33: Docker build configuration
├── .dockerignore               # AE-33: Docker ignore rules
└── README.md                   # AE-34: Main documentation
```

---

**End of Plan**
