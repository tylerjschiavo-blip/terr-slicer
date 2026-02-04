# Glossary/Help Modal Feature — IDEA

## Status

**spec-ready**

---

## Thesis

A contextual glossary/help modal accessible via a help icon that provides quick, punchy explanations of allocation terminology, metrics, and logic—helping users understand CV%, Weighted/Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold, and the allocation scoring math without cluttering the UI or requiring a full documentation page.

---

## Synopsis

During Wave 7 polish work on Territory Slicer, users identified a need for contextual help explaining allocation terminology and logic. While tooltips (implemented in AE-41) provide brief explanations on specific UI elements, there's a gap for users who want a comprehensive reference guide to understand the system's inputs, outputs, and how the allocation algorithm works.

The glossary/help modal will be a markdown-style reference document accessible via a help icon, organized into two main sections: **Key Inputs/Outputs** (definitions for CV%, Weighted/Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold) and **How It Works** (allocation scoring logic, why higher scores are better, the math behind it). Content will be brief (1-3 sentences per item, flexible based on complexity), hybrid tone (technical but approachable), and include formulas where needed for transparency.

This is explicitly NOT a best practices guide, results interpretation guide, or visual examples—it's a quick reference glossary focused on terminology and logic.

---

## Telos

**Empower users to understand and trust the allocation system by making its terminology, metrics, and logic transparent and accessible.**

The ultimate good this serves is **user confidence**: when sales operations teams and revenue leaders can quickly reference what "CV%" means, how "Weighted Fairness" differs from "Balanced Fairness," and why the algorithm assigns accounts the way it does, they can make informed decisions about threshold choices and weight configurations. This transparency reduces "black box" anxiety and builds trust that the allocation is fair and explainable—not just because the Audit Trail shows it, but because users understand the underlying concepts.

---

## Value

- **Quick reference access.** Help icon provides instant access to terminology without leaving the current page or disrupting workflow.
- **Comprehensive glossary.** Single source of truth for all allocation-related terms, metrics, and concepts in one place.
- **Formula transparency.** Shows the actual math behind CV%, blended scores, and preference bonuses—users can verify the logic.
- **Reduced cognitive load.** Brief, punchy explanations (1-3 sentences, flexible based on complexity) prevent information overload while still being informative.
- **Hybrid tone.** Technical enough for ops teams, approachable enough for revenue leaders—bridges the gap between implementation details and business understanding.
- **Replaces tooltips.** Tooltips were removed after Wave 7; this glossary replaces that concept entirely as the reference system.

---

## Impact

- **For sales operations teams:** Faster onboarding for new users. Quick lookup when explaining allocation results to reps or leadership.
- **For revenue leaders:** Confidence in understanding fairness metrics (CV%, Weighted vs Balanced) when making threshold decisions.
- **For reps:** Ability to understand what "Geo Match Bonus" and "Preserve Bonus" mean when reviewing Audit Trail explanations.
- **For the product:** Reduces support questions about terminology. Makes the tool more self-service and professional.

---

## Opportunity

- **Short-term:** Fill the documentation gap identified during Wave 7 polish. Provide users with the reference material they need to fully understand the allocation system.
- **Mid-term:** Establish a pattern for contextual help in future features. The modal pattern can be reused for other complex concepts.
- **Long-term:** Foundation for more comprehensive help system. Could evolve into a full documentation site or interactive tutorial, but starts simple with glossary.

---

## Problem

Current state: Territory Slicer previously had tooltips (implemented in Wave 7, AE-41) that explained individual concepts when hovering over specific UI elements. However, tooltips were removed after Wave 7, and users expressed need for:

1. **Comprehensive reference.** A full glossary they can browse to understand allocation concepts.
2. **Terminology clarity.** Terms like "CV%," "Weighted Fairness," "Balanced Fairness" need clear definitions that users can reference.
3. **Logic explanation.** Users want to understand *how* the allocation algorithm works, not just what the inputs/outputs mean.
4. **Formula visibility.** The math behind fairness scores and blended scores should be transparent and accessible.

Without this glossary, users may:
- Misunderstand what metrics mean (e.g., confusing Weighted vs Balanced Fairness)
- Not realize why higher scores are better in the allocation algorithm
- Struggle to explain allocation results to stakeholders
- Feel the system is a "black box" despite Audit Trail transparency

---

## Risk of Action

| Risk | Mitigation |
|------|------------|
| **Information overload** — Too much content overwhelms users, defeating the "quick reference" purpose. | Keep entries brief (1-3 sentences, flexible based on complexity). Use clear section headers. Simple, scannable layout without tabs/search. |
| **Tone mismatch** — Too technical alienates business users; too casual undermines credibility with ops teams. | Hybrid tone: technical but approachable. Use plain language with technical terms defined. Test with both audiences. |
| **Maintenance burden** — Glossary becomes outdated as allocation logic evolves. | Store content in markdown file (`glossary-content.md`) for easy manual updates. Reference ALLOCATION.md as source of truth. One-time creation expected, minimal future edits. |
| **Modal fatigue** — Users ignore help icon if it's not discoverable or useful. | Place help icon prominently in header (right of "Territory Slicer" title, always visible). Make content scannable with clear sections. Ensure it's actually helpful, not just "documentation dump." |
| **Scope creep** — Temptation to add best practices, examples, or interpretation guidance. | Explicitly OUT of scope per user requirements. Stay focused on terminology and logic only. |

---

## Risk of Inaction

| Risk | Consequence |
|------|-------------|
| **User confusion** — Users misunderstand metrics and make poor threshold/weight decisions. | Suboptimal territory allocations. Loss of trust in the tool. |
| **Support burden** — Repeated questions about terminology and logic. | Support team time spent explaining concepts that should be self-service. |
| **Adoption friction** — New users struggle to understand the system and abandon it. | Lower tool adoption. Teams revert to manual spreadsheet methods. |
| **Black box perception** — Despite Audit Trail transparency, users don't understand underlying concepts. | Distrust in allocation results. "The algorithm is magic" perception. |
| **Knowledge gap** — Users can't explain allocation logic to stakeholders (reps, leadership, finance). | Difficulty justifying territory decisions. Reduced buy-in for segmentation changes. |

---

## Journey

### Origin

During Wave 7 polish work (specifically around AE-41 tooltip implementation), the user realized that while contextual tooltips are helpful for specific UI elements, there's a need for a comprehensive glossary that users can browse. The idea emerged from user feedback that terms like "CV%," "Weighted Fairness," and "Balanced Fairness" needed clearer definitions, and that the allocation scoring logic should be more transparent.

The initial framing was simple: "We need a help modal that explains the terminology and logic." User explicitly specified:
- Format: Help icon/modal (NOT a full page)
- Content style: Brief (1-3 sentences per item, flexible), hybrid tone
- Formulas: Show formulas where needed
- Two main sections: Key Inputs/Outputs + How It Works
- Explicitly OUT: No best practices, no results interpretation, no visual examples

### Pivots

**Content source:** During exploration, decided to store glossary content as a markdown file (`glossary-content.md`) and render with react-markdown parser. This provides the best "reading markdown" feel and makes content easy to edit while maintaining separation from component code.

**Tooltip integration:** Tooltips (AE-41) were removed after Wave 7. This glossary replaces that concept entirely—no integration needed, as tooltips no longer exist.

### Dead Ends

*None yet—idea is spec-ready. Dead ends may emerge during implementation.*

---

## Insights

1. **Markdown file + react-markdown provides best "reading markdown" feel.** Storing content in a markdown file and rendering with react-markdown parser gives users the familiar markdown reading experience while keeping content maintainable and separate from component code.

2. **Header placement balances visibility with non-intrusiveness.** Placing the help icon right of the "Territory Slicer" title in the header ensures it's always visible and discoverable without being intrusive or disrupting the main workflow.

3. **Desktop-first approach is pragmatic.** This tool's primary audience uses desktop browsers. Mobile-specific optimizations can be deferred to future versions without impacting core value.

4. **Tooltips were removed; glossary is the replacement reference system.** Tooltips (AE-41) were implemented then removed after Wave 7. This glossary replaces that concept entirely, providing a comprehensive reference system instead of contextual tooltips.

5. **Terminology clarity builds trust.** When users understand what "CV%" means and how it maps to fairness, they're more likely to trust the allocation results.

6. **Formula transparency reduces "black box" anxiety.** Showing the actual math in inline code format (e.g., `CV% = (SD / Mean) × 100`, `Fairness Score = 100 - CV%`) lets users verify the logic themselves.

7. **Hybrid tone is essential.** Sales ops teams need technical accuracy; revenue leaders need approachable explanations. The glossary must serve both audiences.

8. **Scope discipline prevents bloat.** User's explicit "OUT" list (no best practices, no interpretation guidance, no examples) keeps the feature focused and maintainable.

9. **Modal pattern is right choice.** Full-page documentation would disrupt workflow. Modal provides quick access without navigation overhead.

10. **Simple, scannable layout works best.** Two sections in one modal (no tabs, no search) keeps the interface simple and content easy to scan—perfect for a quick reference glossary.

---

## Open Questions

**Key implementation questions resolved during exploration.** All major design and implementation decisions have been made. Remaining questions are minor implementation details that will be resolved during spec development:

- Minor styling and spacing decisions for modal layout
- Exact wording refinements for glossary entries (to be finalized during content creation)

---

## Scope Sketch

### In (for v1)

- **Help icon** — Accessible icon (question mark or info icon) placed right of "Territory Slicer" title in header (always visible), with ARIA label: "Open help and glossary"
- **Modal component** — Reusable modal dialog using shadcn/ui Dialog component (relies on defaults for accessibility)
- **Two main sections in one modal:**
  - **Key Inputs/Outputs:** Definitions for CV%, Weighted Fairness, Balanced Fairness, Geo Match Bonus, Preserve Bonus, High Risk Threshold
  - **How It Works:** Allocation scoring logic explanation, why higher scores are better, formulas for blended score, preference bonuses, CV% calculation
- **Content source:** Markdown file (`glossary-content.md`) rendered with react-markdown parser
- **Content style:** Brief (1-3 sentences per item, flexible based on complexity), hybrid tone (technical but approachable)
- **Formulas:** Displayed in inline code format (e.g., `CV% = (SD / Mean) × 100`, `Fairness Score = 100 - CV%`, blended score formula, preference bonus math)
- **Accessibility:** Rely on shadcn/ui Dialog defaults (keyboard navigation, screen reader support, focus management), with ARIA label on help icon
- **Layout:** Simple, scannable design—two sections in one modal, no tabs, no search functionality
- **Desktop-focused:** Optimized for desktop experience (mobile out of scope for v1)

### Out (for now)

- **Best practices section** — User explicitly excluded this
- **Results interpretation guidance** — User explicitly excluded this
- **Visual examples** — User explicitly excluded this
- **Interactive tutorials** — Glossary is reference material, not tutorial
- **Search functionality** — v1 is scannable enough without search
- **Multiple modals** — Single modal with sections, not separate modals per topic
- **Content editing UI** — Content is developer-maintained, not user-editable
- **Analytics/tracking** — Out of scope for v1
- **Localization** — English only for v1 (no need to plan for it)
- **Mobile-specific optimizations** — Desktop-focused for v1, mobile out of scope
- **Tooltip integration** — Tooltips were removed after Wave 7; glossary replaces that concept entirely

### Fuzzy / TBD

- **Exact wording for glossary entries** — Content will be finalized during implementation (1-3 sentences per item, flexible based on complexity; "How It Works" section will be more detailed than "Key Inputs/Outputs" glossary)
- **Minor styling details** — Exact spacing, typography refinements to be determined during implementation

---

## Related

- **allocation-engine spec** — Parent spec that defines the allocation algorithm and terminology this glossary explains
- **ALLOCATION.md** — Source of truth for allocation logic and formulas (glossary should reference this)
- **AE-41 (Tooltip System)** — Tooltip implementation that was added in Wave 7 but later removed; this glossary replaces that concept entirely
- **Wave 7 polish work** — Context where this need was identified

---

*This idea emerged from user feedback during Wave 7 polish. Key implementation questions resolved during exploration. Next step: Create INTENT.md to formalize the approach, then PLAN.md to break down implementation tasks.*
