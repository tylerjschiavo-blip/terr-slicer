# Glossary/Help Modal Feature — INTENT

## The Problem

Users lack a comprehensive reference for understanding allocation terminology, metrics, and logic in Territory Slicer. After tooltips were removed following Wave 7, users expressed confusion about terms like "CV%," "Weighted Fairness," and "Balanced Fairness," and they want to understand how the allocation algorithm works and why higher scores are better. Without this reference, users may misunderstand metrics, struggle to explain allocation results to stakeholders, and perceive the system as a "black box" despite Audit Trail transparency.

## The Solution

A contextual glossary/help modal accessible via a help icon in the header that provides quick, punchy explanations of allocation terminology, metrics, and logic. The modal will be organized into two main sections: **Key Inputs/Outputs** (definitions for key terms and metrics) and **How It Works** (allocation scoring logic and formulas). Content will be brief, use a hybrid tone (technical but approachable), and display formulas for transparency.

## Scope

### In Scope

1. Help icon (question mark or info icon) placed right of "Territory Slicer" title in header, always visible, with ARIA label: "Open help and glossary"
2. Modal component using shadcn/ui Dialog component (relies on defaults for accessibility, keyboard navigation, screen reader support, focus management)
3. Two main sections in one modal:
   - **Key Inputs/Outputs:** Definitions for CV%, Weighted Fairness, Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold
   - **How It Works:** Allocation scoring logic explanation, why higher scores are better, formulas for blended score, preference bonuses, CV% calculation
4. Content source: Markdown file (`glossary-content.md`) rendered with react-markdown parser
5. Content style: Brief (1-3 sentences per item, flexible based on complexity), hybrid tone (technical but approachable)
6. Formulas displayed in inline code format (e.g., `CV% = (SD / Mean) × 100`, `Fairness Score = 100 - CV%`, blended score formula, preference bonus math)
7. Simple, scannable layout—two sections in one modal, no tabs, no search functionality
8. Desktop-focused experience (mobile optimizations out of scope for v1)

### Out of Scope

- **Best practices section** — User explicitly excluded this; glossary is terminology and logic reference only
- **Results interpretation guidance** — User explicitly excluded this; glossary explains concepts, not how to interpret results
- **Visual examples** — User explicitly excluded this; text-based reference only
- **Interactive tutorials** — Glossary is reference material, not tutorial content
- **Search functionality** — v1 is scannable enough without search; two sections are manageable
- **Multiple modals** — Single modal with sections, not separate modals per topic
- **Content editing UI** — Content is developer-maintained via markdown file, not user-editable
- **Analytics/tracking** — Out of scope for v1
- **Localization** — English only for v1; no need to plan for internationalization
- **Mobile-specific optimizations** — Desktop-focused for v1; mobile can be addressed in future versions
- **Tooltip integration** — Tooltips were removed after Wave 7; glossary replaces that concept entirely

## Success Criteria

- [ ] Help icon is visible in header, positioned right of "Territory Slicer" title, with ARIA label "Open help and glossary"
- [ ] Clicking help icon opens modal dialog using shadcn/ui Dialog component
- [ ] Modal displays two sections: "Key Inputs/Outputs" and "How It Works"
- [ ] "Key Inputs/Outputs" section includes definitions for CV%, Weighted Fairness, Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold
- [ ] "How It Works" section explains allocation scoring logic, why higher scores are better, and includes relevant formulas
- [ ] Content is rendered from `glossary-content.md` file using react-markdown parser
- [ ] Formulas are displayed in inline code format (e.g., `CV% = (SD / Mean) × 100`)
- [ ] Modal is keyboard accessible (ESC closes, Tab navigates, Enter activates)
- [ ] Modal is screen reader accessible (shadcn/ui Dialog defaults provide proper ARIA attributes)
- [ ] Content entries are 1-3 sentences per item (flexible based on complexity)
- [ ] Modal displays correctly on desktop browsers (primary use case)
- [ ] Modal can be closed via ESC key, clicking outside, or close button

## What We're NOT Building

| Not Building | Why |
|--------------|-----|
| Best practices section | User explicitly excluded this; glossary is terminology and logic reference only, not guidance on how to use the tool |
| Results interpretation guidance | User explicitly excluded this; glossary explains what terms mean and how logic works, not how to interpret allocation results |
| Visual examples | User explicitly excluded this; glossary is text-based reference material, not visual tutorial |
| Interactive tutorials | Glossary is reference material for quick lookup, not interactive learning content |
| Search functionality | Two sections are manageable without search; v1 focuses on scannable layout |
| Multiple modals | Single modal with two sections keeps interface simple and reduces navigation overhead |
| Content editing UI | Content is developer-maintained via markdown file for easy updates; no user editing needed |
| Analytics/tracking | Out of scope for v1; can be added later if needed |
| Localization | English only for v1; internationalization can be addressed in future versions |
| Mobile-specific optimizations | Desktop-focused for v1; mobile optimizations can be deferred without impacting core value |
| Tooltip integration | Tooltips were removed after Wave 7; glossary replaces that concept entirely |

## Decisions

1. **Markdown file + react-markdown for content rendering** — Storing glossary content in `glossary-content.md` and rendering with react-markdown parser provides the best "reading markdown" feel while keeping content maintainable and separate from component code.

2. **Help icon placement in header (right of "Territory Slicer" title)** — Placing the help icon in the header ensures it's always visible and discoverable without being intrusive or disrupting the main workflow.

3. **Two sections in one modal (no tabs, no search)** — Simple, scannable layout with two sections keeps the interface straightforward and content easy to scan—perfect for a quick reference glossary.

4. **Desktop-first approach** — This tool's primary audience uses desktop browsers; mobile-specific optimizations can be deferred to future versions without impacting core value.

5. **Inline code format for formulas** — Displaying formulas in inline code format (e.g., `CV% = (SD / Mean) × 100`) provides formula transparency and reduces "black box" anxiety while maintaining readability.

6. **Hybrid tone (technical but approachable)** — Content must serve both sales ops teams (who need technical accuracy) and revenue leaders (who need approachable explanations); hybrid tone bridges this gap.

7. **Brief entries (1-3 sentences per item, flexible)** — Keeping entries brief prevents information overload while still being informative, maintaining the "quick reference" purpose.

8. **shadcn/ui Dialog component** — Using shadcn/ui Dialog provides accessibility defaults (keyboard navigation, screen reader support, focus management) without custom implementation.

9. **Glossary replaces tooltips entirely** — Tooltips (AE-41) were removed after Wave 7; this glossary replaces that concept entirely as the comprehensive reference system.

10. **Scope discipline: terminology and logic only** — User's explicit "OUT" list (no best practices, no interpretation guidance, no examples) keeps the feature focused and maintainable.

## Context

During Wave 7 polish work on Territory Slicer, users identified a need for contextual help explaining allocation terminology and logic. While tooltips (implemented in AE-41) provided brief explanations on specific UI elements, there was a gap for users who wanted a comprehensive reference guide to understand the system's inputs, outputs, and how the allocation algorithm works. Tooltips were later removed after Wave 7, leaving users without a reference system. The glossary/help modal emerged from user feedback that terms like "CV%," "Weighted Fairness," and "Balanced Fairness" needed clearer definitions, and that the allocation scoring logic should be more transparent. The ultimate goal is to empower users to understand and trust the allocation system by making its terminology, metrics, and logic transparent and accessible—building user confidence that the allocation is fair and explainable.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Information overload** — Too much content overwhelms users, defeating the "quick reference" purpose | Keep entries brief (1-3 sentences, flexible based on complexity). Use clear section headers. Simple, scannable layout without tabs/search. |
| **Tone mismatch** — Too technical alienates business users; too casual undermines credibility with ops teams | Hybrid tone: technical but approachable. Use plain language with technical terms defined. Test with both audiences. |
| **Maintenance burden** — Glossary becomes outdated as allocation logic evolves | Store content in markdown file (`glossary-content.md`) for easy manual updates. Reference ALLOCATION.md as source of truth. One-time creation expected, minimal future edits. |
| **Modal fatigue** — Users ignore help icon if it's not discoverable or useful | Place help icon prominently in header (right of "Territory Slicer" title, always visible). Make content scannable with clear sections. Ensure it's actually helpful, not just "documentation dump." |
| **Scope creep** — Temptation to add best practices, examples, or interpretation guidance | Explicitly OUT of scope per user requirements. Stay focused on terminology and logic only. Reference "What We're NOT Building" section during implementation. |
