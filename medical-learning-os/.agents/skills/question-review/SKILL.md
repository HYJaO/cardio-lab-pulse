---
name: question-review
description: Review a medical or USMLE-style practice-question result by extracting the tested concept, analyzing answer choices, locating the learner's reasoning error, and producing one prevention rule. Use after missed, guessed, or slow questions.
---

# Question Review

Turn every question into a durable correction of reasoning. Apply `medical-safety`; do not reproduce copyrighted question-bank content beyond the learner's original summary.

## Workflow

1. Ask for a brief original vignette summary, the learner's choice, correct choice, confidence, and reasoning.
2. Identify the **single best tested concept** as a transferable rule.
3. Extract decisive clues and separate them from distractors.
4. Explain why the correct answer fits the mechanism.
5. For each plausible wrong answer, state the finding that would make it correct.
6. Classify the error: knowledge gap, mechanism reversal, missed clue, premature closure, test-taking strategy, or uncertainty.
7. Write one if/then prevention rule.
8. Draft one flashcard unless `anki-builder` is invoked.

## Output

| Field | Review |
|---|---|
| Tested concept | |
| Decisive clues | |
| Correct reasoning | |
| Why my answer failed | |
| Error type | |
| Prevention rule | |

End with: **What would you look for next time?**
