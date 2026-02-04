# Task: Create glossary modal component

TASK: GHM-3
VERSION: 1.0
SUPERSEDES: none
RATIONALE: Create the modal component that displays the glossary content. The modal uses shadcn/ui Dialog component and renders markdown content from the glossary-content.md file using react-markdown.

PERSONA: web-implementer
SKILL: web-development (defined)

PREREQS:
  MUST_LOAD:
    - [ ] jam/specs/draft/glossary-help-modal/PLAN.md
    - [ ] jam/specs/draft/glossary-help-modal/INTENT.md
    - [ ] app/src/content/glossary-content.md
    - [ ] app/package.json

REQUIREMENTS:
  CLAUSE:
    GIVEN  creating glossary modal component
    WHEN   component location is app/src/components/common/GlossaryModal.tsx
    THEN   create React component file at specified path
           component exports default export

  CLAUSE:
    GIVEN  using shadcn/ui Dialog
    WHEN   rendering modal
    THEN   use Dialog, DialogContent, DialogHeader, DialogTitle components
           modal structure follows shadcn/ui Dialog pattern

  CLAUSE:
    GIVEN  rendering markdown content
    WHEN   displaying glossary content
    THEN   import glossary-content.md file
           use react-markdown to parse and render markdown content
           content displays in two sections with clear headers

  CLAUSE:
    GIVEN  formula rendering
    WHEN   displaying formulas
    THEN   formulas render correctly in inline code format
           maintain markdown formatting from source file

  CLAUSE:
    GIVEN  accessibility requirements
    WHEN   modal is open
    THEN   modal is keyboard accessible (ESC closes, Tab navigates)
           modal is screen reader accessible (via shadcn/ui Dialog defaults)
           modal can be closed via ESC key, clicking outside, or close button

  CLAUSE:
    GIVEN  component props interface
    WHEN   defining TypeScript interface
    THEN   accept open state prop
           accept onOpenChange handler prop
           TypeScript types are defined

  CLAUSE:
    GIVEN  dependency management
    WHEN   react-markdown is required
    THEN   add react-markdown package to package.json
           add react-markdown types if available

  CLAUSE:
    GIVEN  content layout
    WHEN   displaying sections
    THEN   display "Key Inputs/Outputs" section
           display "How It Works" section
           apply proper styling for scannable content

ACCEPTANCE_CRITERIA:
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

DONE_WHEN:
  - component_file_exists = true
  - shadcn_dialog_used = true
  - markdown_content_renders = true
  - react_markdown_installed = true
  - accessibility_verified = true
  - typescript_types_defined = true

ANTI_PATTERNS:
  - Creating custom modal instead of using shadcn/ui Dialog (accessibility built-in)
  - Hardcoding content instead of importing markdown file (maintainability)
  - Missing react-markdown dependency (required for markdown rendering)
  - Ignoring keyboard navigation (ESC must close modal)
  - Breaking two-section layout (requirement from INTENT.md)
  - Not handling modal state properly (open/onOpenChange props required)

UNMATCHED:
  ACTION: ASK_USER
  CONTEXT: "Glossary modal component requirement unclear"
