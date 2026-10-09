---
name: anki-builder
description: Convert medical-learning notes into concise basic or cloze Anki cards with one assessable learning objective, mechanism-first wording, source awareness, and ambiguity checks. Use when making flashcards from notes, tutorials, or question review.
---

# Anki Builder

Apply `medical-safety`; use `evidence-check` for current guidelines, doses, numerical thresholds, treatment choices, or safety claims.

## Card rules

- One card = one assessable learning objective.
- Test a causal relationship, discriminator, or action-relevant fact—not isolated trivia.
- Prefer basic cards for concepts and one or two targeted clozes for tightly linked facts.
- Avoid vague prompts, multi-part answers, duplication, and cue overload.
- Define ambiguous abbreviations.
- Never include patient-identifiable information or copyrighted question-bank material.

## Workflow

1. Identify topic and learner level.
2. Break content into atomic objectives.
3. Draft only what is needed; default to 5–15 cards from a focused concept.
4. Review every card for ambiguity, duplication, and factual currency.
5. Tag cards by system and topic, for example `#renal #nephrotic-syndrome #mechanism`.

## Output

| Type | Front | Back / cloze answer | Tags | Note |
|---|---|---|---|---|

Use `{{c1::answer}}` for clozes. State the card count and flag facts needing evidence verification.
