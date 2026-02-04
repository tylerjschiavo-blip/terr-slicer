# Plan: Glossary/Help Modal Feature

**Initiative:** Glossary/Help Modal
**Status:** Draft
**DSL Version:** plan/1.0
**Intent:** [INTENT.md](./INTENT.md)

---

## Overview

This plan delivers a contextual glossary/help modal feature for Territory Slicer that provides quick, punchy explanations of allocation terminology, metrics, and logic. The modal is accessible via a help icon in the header and displays content from a markdown file rendered with react-markdown. The feature consists of four main components: glossary content markdown file, help icon component, modal component, and integration into the header.

**Tech Stack:** React, TypeScript, shadcn/ui Dialog, react-markdown

**Key Capabilities:**
- Help icon in header (right of "Territory Slicer" title) with ARIA label
- Modal dialog using shadcn/ui Dialog component (accessibility built-in)
- Two-section content layout: "Key Inputs/Outputs" and "How It Works"
- Markdown content rendered with react-markdown parser
- Formulas displayed in inline code format
- Keyboard accessible (ESC closes, Tab navigates, Enter activates)
- Screen reader accessible (via shadcn/ui Dialog defaults)

---

## Task Table

| Task | Title | Role | Skill | Wave | Group |
|------|-------|------|-------|------|-------|
| GHM-1 | Create glossary content markdown file | file-writer | text-authoring (defined) | 1 | content |
| GHM-2 | Create help icon component | web-implementer | web-development (defined) | 1 | components |
| GHM-3 | Create glossary modal component | web-implementer | web-development (defined) | 2 | components |
| GHM-4 | Integrate help icon and modal into header | web-implementer | web-development (defined) | 2 | integration |

---

## Detailed Tasks

### GHM-1: Create glossary content markdown file

**Role:** file-writer
**Skill:** text-authoring (defined)

**Scope:** Create the markdown content file that will be rendered in the glossary modal. Content must include two main sections: "Key Inputs/Outputs" and "How It Works" with definitions and formulas as specified in INTENT.md.

**Deliverables:**
- `app/src/content/glossary-content.md` - Markdown file containing:
  - **Key Inputs/Outputs section:** Definitions for CV%, Weighted Fairness, Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold
  - **How It Works section:** Allocation scoring logic explanation, why higher scores are better, formulas for blended score, preference bonuses, CV% calculation
  - Formulas displayed in inline code format (e.g., `` `CV% = (SD / Mean) × 100` ``)
  - Brief entries (1-3 sentences per item, flexible based on complexity)
  - Hybrid tone (technical but approachable)

**Acceptance Criteria:**
- [ ] Markdown file exists at `app/src/content/glossary-content.md`
- [ ] File contains "Key Inputs/Outputs" section with all required term definitions
- [ ] File contains "How It Works" section with allocation logic explanation
- [ ] All formulas are in inline code format (backticks)
- [ ] Content references ALLOCATION.md as source of truth for accuracy
- [ ] Entries are brief (1-3 sentences per item)
- [ ] Tone is technical but approachable (hybrid)
- [ ] No best practices, interpretation guidance, or visual examples (per INTENT.md scope)

---

### GHM-2: Create help icon component

**Role:** web-implementer
**Skill:** web-development (defined)

**Scope:** Create a reusable help icon component that will trigger the glossary modal. The icon should be a question mark or info icon, accessible, and styled appropriately for the header.

**Deliverables:**
- `app/src/components/common/HelpIcon.tsx` - React component:
  - Question mark or info icon (using lucide-react)
  - ARIA label: "Open help and glossary"
  - Clickable button element
  - Appropriate styling for header placement
  - TypeScript interface for props (onClick handler)

**Acceptance Criteria:**
- [ ] Component exists at `app/src/components/common/HelpIcon.tsx`
- [ ] Component renders question mark or info icon from lucide-react
- [ ] Component has ARIA label "Open help and glossary"
- [ ] Component accepts onClick prop for opening modal
- [ ] Component is keyboard accessible (Enter/Space activates)
- [ ] Component has appropriate hover/focus states
- [ ] Component exports default export
- [ ] TypeScript types are defined

---

### GHM-3: Create glossary modal component

**Role:** web-implementer
**Skill:** web-development (defined)

**Scope:** Create the modal component that displays the glossary content. The modal uses shadcn/ui Dialog component and renders markdown content from the glossary-content.md file using react-markdown.

**Deliverables:**
- `app/src/components/common/GlossaryModal.tsx` - React component:
  - Uses shadcn/ui Dialog components (Dialog, DialogContent, DialogHeader, DialogTitle)
  - Renders markdown content from `glossary-content.md` using react-markdown
  - Two-section layout: "Key Inputs/Outputs" and "How It Works"
  - Proper styling for scannable content
  - TypeScript interface for props (open state, onOpenChange handler)
- `app/package.json` - Updated dependencies:
  - `react-markdown` package added
  - `react-markdown` types added if available

**Acceptance Criteria:**
- [ ] Component exists at `app/src/components/common/GlossaryModal.tsx`
- [ ] Component uses shadcn/ui Dialog (Dialog, DialogContent, DialogHeader, DialogTitle)
- [ ] Component imports and renders `glossary-content.md` file
- [ ] Component uses react-markdown to parse and render markdown content
- [ ] Content displays in two sections with clear headers
- [ ] Formulas render correctly in inline code format
- [ ] Modal is keyboard accessible (ESC closes, Tab navigates)
- [ ] Modal is screen reader accessible (via shadcn/ui Dialog defaults)
- [ ] Modal can be closed via ESC key, clicking outside, or close button
- [ ] react-markdown package is added to package.json
- [ ] TypeScript types are defined
- [ ] Component exports default export

**Dependencies:**
- GHM-1 (glossary content markdown file)

---

### GHM-4: Integrate help icon and modal into header

**Role:** web-implementer
**Skill:** web-development (defined)

**Scope:** Integrate the HelpIcon component and GlossaryModal into the Header component. The help icon should be positioned right of the "Territory Slicer" title, and clicking it should open the modal.

**Deliverables:**
- `app/src/components/layout/Header.tsx` - Modified component:
  - Import HelpIcon component
  - Import GlossaryModal component
  - Add help icon positioned right of "Territory Slicer" NavLink
  - Add state management for modal open/close
  - Wire up HelpIcon onClick to open modal
  - Include GlossaryModal in render with proper state binding

**Acceptance Criteria:**
- [ ] Header.tsx imports HelpIcon and GlossaryModal components
- [ ] Help icon is positioned right of "Territory Slicer" title in header
- [ ] Help icon is always visible (not conditionally rendered)
- [ ] Clicking help icon opens GlossaryModal
- [ ] Modal state is managed within Header component
- [ ] Modal closes properly via ESC, outside click, or close button
- [ ] Help icon has proper spacing from "Territory Slicer" text
- [ ] Integration maintains existing Header functionality
- [ ] No TypeScript errors
- [ ] No console errors

**Dependencies:**
- GHM-2 (help icon component)
- GHM-3 (glossary modal component)

---

## Implementation Order

```
Wave 1 (Parallel):
  ┌─────────────────┐
  │   GHM-1         │  (content)
  │   (file-writer) │
  └─────────────────┘
         │
         │ (file dependency)
         │
  ┌─────────────────┐
  │   GHM-2         │  (components)
  │   (web-impl)     │
  └─────────────────┘
         │
         │
Wave 2 (Sequential):
  ┌─────────────────┐
  │   GHM-3         │  (depends on GHM-1)
  │   (web-impl)     │
  └─────────────────┘
         │
         │ (component dependencies)
         │
  ┌─────────────────┐
  │   GHM-4         │  (depends on GHM-2, GHM-3)
  │   (web-impl)     │
  └─────────────────┘
```

**Rationale:**
- **Wave 1:** GHM-1 (content) and GHM-2 (help icon) can be done in parallel since they don't conflict on files. GHM-1 creates the markdown file, GHM-2 creates a standalone component.
- **Wave 2:** GHM-3 depends on GHM-1 (needs the markdown file to exist). GHM-4 depends on both GHM-2 and GHM-3 (needs both components to integrate).

**File Conflicts Check:**
- Wave 1: No conflicts (GHM-1 creates `app/src/content/glossary-content.md`, GHM-2 creates `app/src/components/common/HelpIcon.tsx`)
- Wave 2: No conflicts (GHM-3 creates `app/src/components/common/GlossaryModal.tsx` and modifies `app/package.json`, GHM-4 modifies `app/src/components/layout/Header.tsx`)

---

## Success Criteria

**Aggregate Deliverables:**
- [ ] `app/src/content/glossary-content.md` - Glossary content markdown file
- [ ] `app/src/components/common/HelpIcon.tsx` - Help icon component
- [ ] `app/src/components/common/GlossaryModal.tsx` - Glossary modal component
- [ ] `app/src/components/layout/Header.tsx` - Updated header with help icon and modal integration
- [ ] `app/package.json` - Updated with react-markdown dependency

**Feature Completeness:**
- [ ] Help icon visible in header, positioned right of "Territory Slicer" title
- [ ] Help icon has ARIA label "Open help and glossary"
- [ ] Clicking help icon opens modal dialog
- [ ] Modal displays two sections: "Key Inputs/Outputs" and "How It Works"
- [ ] Content is rendered from markdown file using react-markdown
- [ ] Formulas display in inline code format
- [ ] Modal is keyboard accessible (ESC closes, Tab navigates, Enter activates)
- [ ] Modal is screen reader accessible
- [ ] Modal can be closed via ESC key, clicking outside, or close button
- [ ] Content matches requirements from INTENT.md (terminology and logic only, no best practices or interpretation guidance)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| react-markdown not rendering formulas correctly | M | Test markdown rendering early; use inline code format consistently |
| Content becomes outdated as allocation logic evolves | L | Reference ALLOCATION.md as source of truth; markdown file is easy to update |
| Modal not discoverable if icon placement is unclear | M | Place icon prominently right of "Territory Slicer" title; ensure proper spacing |
| Scope creep into best practices or interpretation guidance | M | Strictly follow INTENT.md scope; reference "What We're NOT Building" section |

---

## Decisions

1. **Content file location:** `app/src/content/glossary-content.md` - Centralized content directory keeps content separate from components and makes it easy to find and update.

2. **Component organization:** HelpIcon and GlossaryModal in `app/src/components/common/` - These are reusable UI components that fit the existing common components pattern.

3. **react-markdown for content rendering:** As specified in INTENT.md, react-markdown provides the best "reading markdown" feel while keeping content maintainable and separate from component code.

4. **Two waves:** Content and help icon can be parallel (Wave 1), then modal and integration are sequential (Wave 2) based on dependencies.

5. **State management:** Modal open/close state managed in Header component - Simple local state is sufficient for this feature; no need for global state management.

---

## Handoff

**Next Step:** Handoff to plan-reviewer for review and approval.

**After Approval:** Task specs will be created by task-writer for each task in the plan.
