# Task: Create help icon component

TASK: GHM-2
VERSION: 1.0
SUPERSEDES: none
RATIONALE: Create a reusable help icon component that will trigger the glossary modal. The icon should be a question mark or info icon, accessible, and styled appropriately for the header.

PERSONA: web-implementer
SKILL: web-development (defined)

PREREQS:
  MUST_LOAD:
    - [ ] jam/specs/draft/glossary-help-modal/PLAN.md
    - [ ] jam/specs/draft/glossary-help-modal/INTENT.md

REQUIREMENTS:
  CLAUSE:
    GIVEN  creating help icon component
    WHEN   component location is app/src/components/common/HelpIcon.tsx
    THEN   create React component file at specified path
           component exports default export

  CLAUSE:
    GIVEN  rendering icon
    WHEN   component renders
    THEN   display question mark or info icon from lucide-react
           icon is clickable button element

  CLAUSE:
    GIVEN  accessibility requirements
    WHEN   component renders
    THEN   include ARIA label "Open help and glossary"
           component is keyboard accessible (Enter/Space activates)
           component has appropriate hover/focus states

  CLAUSE:
    GIVEN  component props interface
    WHEN   defining TypeScript interface
    THEN   accept onClick prop handler
           TypeScript types are defined

  CLAUSE:
    GIVEN  styling requirements
    WHEN   styling component
    THEN   apply appropriate styling for header placement
           ensure component fits header design

ACCEPTANCE_CRITERIA:
  - [ ] Component exists at `app/src/components/common/HelpIcon.tsx`
  - [ ] Component renders question mark or info icon from lucide-react
  - [ ] Component has ARIA label "Open help and glossary"
  - [ ] Component accepts onClick prop for opening modal
  - [ ] Component is keyboard accessible (Enter/Space activates)
  - [ ] Component has appropriate hover/focus states
  - [ ] Component exports default export
  - [ ] TypeScript types are defined

DONE_WHEN:
  - component_file_exists = true
  - icon_renders_correctly = true
  - aria_label_present = true
  - keyboard_accessible = true
  - typescript_types_defined = true
  - styling_applied = true

ANTI_PATTERNS:
  - Using non-semantic HTML elements (use button element)
  - Missing ARIA labels (accessibility requirement)
  - Ignoring keyboard navigation (Enter/Space must activate)
  - Hardcoding onClick handler (use prop for flexibility)
  - Inconsistent styling with header design

UNMATCHED:
  ACTION: ASK_USER
  CONTEXT: "Help icon component requirement unclear"
