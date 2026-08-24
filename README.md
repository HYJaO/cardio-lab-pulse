# CardioLab Foundation

Build Phase 1 of a premium medical education web application called "CardioLab".

IMPORTANT:

Do NOT build the entire platform yet.

Do NOT create fake working functionality for ECG, 3D anatomy, flashcards, authentication, or clinical cases.

This phase is ONLY the visual foundation and landing experience.

PROJECT:

CardioLab is a next-generation USMLE Step 1 medical education platform.

The first module is Cardiovascular Medicine.

DESIGN PHILOSOPHY:

Apple-level product design + premium medical textbook + interactive anatomy laboratory + modern health-tech.

The website must NOT look like:

- a hospital website

- a generic LMS

- a generic SaaS dashboard

- a children's educational app

- a gaming interface

VISUAL STYLE:

- Dark mode by default

- Midnight navy background

- Deep blue

- Cool white

- Cyan

- Teal

- Electric blue

- Controlled crimson accents

- Elegant gradients

- Subtle glass surfaces

- Fine technical borders

- Soft atmospheric glow

- Sophisticated shadows

- Large intentional whitespace

- Premium modern typography

Use rounded corners carefully.

Avoid excessive "bubble UI".

PAGE STRUCTURE:

1. TOP NAVIGATION

Logo:

CARDOLAB

Navigation:

Learn

Anatomy

Physiology

Pathology

Pharmacology

ECG

Clinical

Right side:

Search

Progress

Keep navigation minimal and premium.

2. HERO SECTION

Large eyebrow:

CARDIOVASCULAR SYSTEM

Main headline:

Master the Cardiovascular System

Subtitle:

Transform complex cardiovascular concepts into visual, interactive learning experiences designed for high-yield USMLE preparation.

Primary button:

Explore Cardiovascular Topics

Secondary button:

Explore the Heart

Hero visual:

Create an elegant abstract 2D cardiovascular visualization.

It should include:

- sophisticated heart silhouette/anatomical illustration

- subtle cardiac pulse

- flowing blood-flow lines

- ECG waveform

- arterial branching patterns

- tiny particles

- cyan/blue atmospheric illumination

- controlled crimson accents

Motion should be subtle and educational.

Do NOT use a giant decorative 3D heart.

3. LEARNING PATH

Title:

Your Cardiovascular Learning Path

Create seven connected stages:

Embryology

Anatomy

Physiology

Pathology

Pharmacology

ECG

Clinical

Show them as a sophisticated horizontal/curved progression rather than ordinary cards.

Each stage should have:

- icon

- title

- short descriptor

- progress indicator

4. HIGH-YIELD TOPICS

Title:

High-Yield Cardiovascular

Create premium topic cards for:

Cardiac Cycle

Heart Failure

Atherosclerosis

Heart Blocks

Starling Curve

Heart Murmurs

Each card should contain:

- title

- short description

- difficulty

- estimated study time

- small visual preview

Use the taxonomy visual language:

HIGH-YIELD = red accent

MECHANISM = blue accent

CLINICAL PEARL = amber

CLASSIC PRESENTATION = emerald

DIFFERENTIAL = violet

USMLE TRAP = dark red

For this phase, demonstrate the taxonomy visually but do not build the complete taxonomy engine yet.

5. ECG PREVIEW

Create a visually impressive ECG laboratory preview.

Show:

- realistic ECG waveform

- P wave

- QRS

- T wave

- subtle glow

Add small labels.

Make it look like a professional medical interface.

This is a visual preview only.

Do not implement the full ECG interaction yet.

6. EXPLORE THE HEART

Create a section titled:

Explore the Heart

Show a sophisticated placeholder anatomical heart visualization.

It should look like an interactive anatomy laboratory is coming next.

Include small interface controls:

Rotate

Layers

Coronaries

Valves

Chambers

These controls can be non-functional placeholders in Phase 1.

7. FINAL CTA

Create:

Build Your Cardiovascular Knowledge

Subtitle:

From anatomy and physiology to pathology, pharmacology, ECGs, and clinical reasoning.

Button:

Start Learning

8. FOOTER

Minimal premium footer.

CardioLab

Medical Education Platform

Do not use stock doctor photographs.

RESPONSIVE DESIGN:

Desktop:

cinematic, spacious, sophisticated.

Tablet:

preserve hierarchy.

Mobile:

stack sections cleanly and prioritize readability.

ACCESSIBILITY:

- high contrast

- readable typography

- keyboard-friendly controls

- respect prefers-reduced-motion

PERFORMANCE:

Keep animations lightweight.

Do not create unnecessary heavy 3D/WebGL yet.

TECHNICAL REQUIREMENT:

Build this using a reusable component architecture.

Create reusable components for:

Navbar

Hero

LearningPath

TopicCard

TaxonomyBadge

ECGPreview

AnatomyPreview

CTA

Footer

Do NOT hard-code every section as one giant component.

The visual design system must be reusable for future modules.

IMPORTANT:

This is Phase 1 only.

The result should feel like a polished production medical education platform homepage, not a prototype full of fake buttons.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8de39c00-c8bf-4975-a853-580c84fea1ff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
