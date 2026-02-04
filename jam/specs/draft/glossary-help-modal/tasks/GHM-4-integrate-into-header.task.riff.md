# Task: Integrate help icon and modal into header

TASK: GHM-4
VERSION: 1.0
SUPERSEDES: none
RATIONALE: Integrate the HelpIcon component and GlossaryModal into the Header component. The help icon should be positioned right of the "Territory Slicer" title, and clicking it should open the modal.

PERSONA: web-implementer
SKILL: web-development (defined)

PREREQS:
  MUST_LOAD:
    - [ ] jam/specs/draft/glossary-help-modal/PLAN.md
    - [ ] jam/specs/draft/glossary-help-modal/INTENT.md
    - [ ] app/src/components/common/HelpIcon.tsx
    - [ ] app/src/components/common/GlossaryModal.tsx
    - [ ] app/src/components/layout/Header.tsx

REQUIREMENTS:
  CLAUSE:
    GIVEN  integrating components into header
    WHEN   modifying Header.tsx
    THEN   import HelpIcon component
           import GlossaryModal component
           maintain existing Header functionality

  CLAUSE:
    GIVEN  positioning help icon
    WHEN   rendering header
    THEN   place help icon right of "Territory Slicer" NavLink
           help icon is always visible (not conditionally rendered)
           help icon has proper spacing from "Territory Slicer" text

  CLAUSE:
    GIVEN  modal state management
    WHEN   managing modal open/close state
    THEN   add state management within Header component
           wire up HelpIcon onClick to open modal
           include GlossaryModal in render with proper state binding

  CLAUSE:
    GIVEN  modal interaction
    WHEN   user interacts with modal
    THEN   clicking help icon opens GlossaryModal
           modal closes properly via ESC, outside click, or close button
           modal state updates correctly

  CLAUSE:
    GIVEN  code quality
    WHEN   implementing integration
    THEN   no TypeScript errors
           no console errors
           existing Header functionality preserved

ACCEPTANCE_CRITERIA:
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

DONE_WHEN:
  - components_imported = true
  - help_icon_positioned = true
  - modal_state_managed = true
  - click_handler_wired = true
  - modal_closes_correctly = true
  - no_typescript_errors = true
  - no_console_errors = true
  - existing_functionality_preserved = true

ANTI_PATTERNS:
  - Conditionally rendering help icon (must always be visible)
  - Managing modal state outside Header component (state should be local)
  - Breaking existing Header functionality (must preserve current behavior)
  - Poor spacing between icon and title (UX requirement)
  - Not handling modal close events properly (ESC, outside click, close button)
  - Importing components incorrectly (use proper import paths)

UNMATCHED:
  ACTION: ASK_USER
  CONTEXT: "Header integration requirement unclear"
