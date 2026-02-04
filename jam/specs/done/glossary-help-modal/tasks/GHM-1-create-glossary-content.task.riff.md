# Task: Create glossary content markdown file

TASK: GHM-1
VERSION: 1.0
SUPERSEDES: none
RATIONALE: Create the markdown content file that will be rendered in the glossary modal. Content must include two main sections: "Key Inputs/Outputs" and "How It Works" with definitions and formulas as specified in INTENT.md.

PERSONA: file-writer
SKILL: text-authoring (defined)

PREREQS:
  MUST_LOAD:
    - [ ] jam/specs/draft/glossary-help-modal/INTENT.md
    - [ ] jam/specs/draft/glossary-help-modal/PLAN.md

REQUIREMENTS:
  CLAUSE:
    GIVEN  creating glossary content markdown file
    WHEN   file location is app/src/content/glossary-content.md
    THEN   create markdown file with two sections: "Key Inputs/Outputs" and "How It Works"
           file must exist at specified path

  CLAUSE:
    GIVEN  creating "Key Inputs/Outputs" section
    WHEN   defining terms
    THEN   include definitions for CV%, Weighted Fairness, Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold
           each definition is 1-3 sentences (flexible based on complexity)
           use hybrid tone (technical but approachable)

  CLAUSE:
    GIVEN  creating "How It Works" section
    WHEN   explaining allocation logic
    THEN   include allocation scoring logic explanation
           explain why higher scores are better
           include formulas for blended score, preference bonuses, CV% calculation
           formulas displayed in inline code format (backticks)

  CLAUSE:
    GIVEN  formatting formulas
    WHEN   displaying mathematical expressions
    THEN   use inline code format with backticks
           example: `CV% = (SD / Mean) × 100`

  CLAUSE:
    GIVEN  content accuracy requirement
    WHEN   writing definitions and explanations
    THEN   reference ALLOCATION.md as source of truth for accuracy
           ensure content matches allocation logic specifications

  CLAUSE:
    GIVEN  scope constraints from INTENT.md
    WHEN   writing content
    THEN   exclude best practices section
           exclude results interpretation guidance
           exclude visual examples
           focus on terminology and logic only

ACCEPTANCE_CRITERIA:
  - [ ] Markdown file exists at `app/src/content/glossary-content.md`
  - [ ] File contains "Key Inputs/Outputs" section with all required term definitions
  - [ ] File contains "How It Works" section with allocation logic explanation
  - [ ] All formulas are in inline code format (backticks)
  - [ ] Content references ALLOCATION.md as source of truth for accuracy
  - [ ] Entries are brief (1-3 sentences per item)
  - [ ] Tone is technical but approachable (hybrid)
  - [ ] No best practices, interpretation guidance, or visual examples (per INTENT.md scope)

DONE_WHEN:
  - file_exists = true
  - key_inputs_section_complete = true
  - how_it_works_section_complete = true
  - all_formulas_formatted = true
  - content_accuracy_verified = true

ANTI_PATTERNS:
  - Adding best practices or interpretation guidance (explicitly out of scope)
  - Including visual examples or diagrams (text-based reference only)
  - Writing lengthy explanations (keep entries brief, 1-3 sentences)
  - Using overly technical jargon without explanation (hybrid tone required)
  - Deviating from ALLOCATION.md as source of truth

UNMATCHED:
  ACTION: ASK_USER
  CONTEXT: "Glossary content requirement unclear"
