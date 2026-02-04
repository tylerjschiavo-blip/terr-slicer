## 1. What We Mean by "Equitable"

- **Equitable** = distribution of load (ARR, account count, risk) across reps that tracks **stated targets** and **priorities**, not equal slices regardless of size or role.
- We measure it with **Fairness Score** (100 − CV%): lower spread (CV%) ⇒ higher score ⇒ more balanced.
- **User-controlled priorities:** Balance weights (ARR % / Account % / Risk %) define what "fair" means for this org (e.g., 50% ARR, 30% accounts, 20% risk).

> **Takeaway:** Equity is defined explicitly and measured with a standard statistic (CV%), not hand-wavy.

---

## 2. Mechanism: Need-Based Assignment

- Accounts are assigned **one at a time** in descending ARR order (greedy by value).
- For each account, every eligible rep gets a **Blended Score** = how far they are from their **targets** (ARR, accounts, risk), combined by the user's weights.
- **Higher score** = more under target = **higher need**.
- **Winner = highest total score** (after small preference adjustments).

So the core rule is: **assign each account to the rep who is most under target**, given the chosen balance weights. That directly pushes the distribution toward the targets and reduces imbalance (lowers CV%, raises Fairness Score).

> **Takeaway:** The algorithm is explicitly need-based; it doesn't favor arbitrary reps, it favors reps who are behind.

---

## 3. Preferences Are Bounded (Tiebreaker, Not Override)

- **Geo Match** and **Rep Preservation** are small bonuses (0.00–0.10 each, default 0.05).
- They are applied as **multipliers** on the Blended Score. At max (0.10 each), they can only flip the decision when reps are within ~9% of each other in need.
- They are **not** additive blocks that let a rep far below others "steal" an account. Design keeps preference impact below the smallest balance weight so they act as tiebreakers, not overrides.

> **Takeaway:** Business preferences (geo, preserve) refine who wins when need is similar; they don't override the equity logic.

---

## 4. Transparency and Control

- **Audit trail:** Every assignment shows account, eligible reps, scores (Blended, bonuses, Total), and why the winner won.
- **User controls:** Threshold (segment boundary), balance weights, and preference bonuses are all configurable and visible.
- **Fairness metrics:** Custom Fairness (your weights) and Balanced Fairness (33/33/33) are reported so you can see whether the current config is producing balanced outcomes.

> **Takeaway:** The logic is inspectable and adjustable; no hidden rules.

---

## 5. Why Greedy (One-at-a-Time) Is Reasonable

- Processing **highest-ARR accounts first** avoids giving small accounts undue influence on who gets the big ones.
- **Sequential assignment with updated state** means each decision uses up-to-date "current" loads, so need is recalculated after every assignment. That's exactly what you want for driving toward targets over time.
- **Per-segment (E vs MM):** Enterprise and Mid-Market are balanced separately, so segment mix doesn't distort within-segment equity.

> **Takeaway:** The greedy, need-based, per-segment process is aligned with the goal of equitable distribution toward targets.
