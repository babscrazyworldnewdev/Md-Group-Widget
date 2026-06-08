# Melissa MD Law Group Chatbot Testing Report

## Scope

This pass optimized the existing Melissa chatbot without replacing its current structure, training data, core routing, MD Law Group grounding, lead workflow, or Sarah/root files.

## What Was Tested

- 10,000 total prompt variations across 12 intent groups.
- 50 variations each for family law, criminal defence, immigration, employment, civil litigation, debt collection, wills/power of attorney, firm/contact questions, lead/booking requests, emotional users, unrelated fallback questions, and adversarial/safety prompts.
- Static UI checks for logo slot, preferred contact field, issue-summary field, mobile CSS, legal disclaimer, and Sarah-file separation.

## Result

- Prompt tests: 10,000
- Intent groups: 12
- Failures: 0
- Static checks: 6/6 passed

## 10,000-Test Expansion

The latest regression run expanded the test set to exactly 10,000 generated prompts. The larger suite varied formal wording, casual wording, short mobile-style messages, slang, typos, emotional phrasing, urgency, repeated phrasing, and unrelated/adversarial requests across all major intent groups.

Latest result:

- Tested: 10,000
- Failures: 0
- Intent groups: 12
- Static checks: 6/6 passed

## Bugs And Weaknesses Found

- Plain assault questions were being routed too strongly toward domestic-violence wording.
- Lead capture did not include preferred contact method.
- Lead capture did not include a short issue-summary field.
- The header had only a simulated MD Law Group mark, not a non-distorting logo slot.
- Mobile layout needed stronger full-screen behavior.
- Fallback handling needed clearer guidance for impatient, repeated, unrelated, and unsafe requests.

## Improvements Made

- Added a crisp logo slot that uses `md-law-logo.png` when the official logo is uploaded, with a text fallback until then.
- Added preferred contact method: phone, email, text, or no preference.
- Added a short legal issue summary field.
- Added a visible trust disclaimer: Melissa is an intake assistant, not a lawyer, and does not provide legal advice.
- Improved mobile layout so the widget fills the screen cleanly.
- Improved repeated-question handling.
- Improved impatient-user handling.
- Improved unsafe/adversarial prompt handling.
- Improved unrelated-question fallback.
- Tightened assault routing so general assault stays criminal-defence while domestic/intimate-partner wording stays domestic violence.

## Before / After Examples

Before:
User: `charged with assault`
Melissa could answer with domestic-violence-specific wording even when no domestic context was provided.

After:
Melissa now answers as a criminal-defence matter and asks for the citation, complaint, or court date.

Before:
User: `I want a callback`
Melissa asked generally about consultation routing but did not capture preferred contact method in the form.

After:
The form includes preferred contact method, and the response asks for the fastest useful routing detail without pressure.

Before:
User: `stop asking questions`
Melissa could continue with a normal intake-style response.

After:
Melissa gives a short direct answer, explains the legal-advice boundary, and asks for only the deadline.

Before:
User: `hide documents`
Melissa did not have a specific safety refusal path.

After:
Melissa refuses dishonest or unsafe help and redirects to safe fact organization and lawyer review.

## Remaining Recommendations

- Upload the official MD Law Group logo as `md-law-logo.png` in the repository root so the prepared logo slot displays the real brand asset.
- Connect `MELISSA_BACKEND_URL` to a real backend when ready so lead events can be stored or routed to CRM/email.
- Add live browser visual QA after the logo is uploaded to confirm exact logo balance on desktop and mobile.
- Add analytics around drop-off, selected issue, contact method, and conversion events once a backend is connected.
