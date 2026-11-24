# LiaScript Guide – Syntax, Semantics & Best Practices

## Purpose

A compact reference guide for agents to produce **syntactically and semantically correct LiaScript**.

---

## How to read this guide

The guide is split into parts under `data/cheat-sheet/`. A rule cited by name from this guide stands in the part whose line below names it.

- **Whole document** — a full syntax check (`:validate-syntax`, `:validate-course`), writing or rewriting a material document (`:promote-session`, `:create-mini-course`, `:coauthor-materials`), or no scope known: read **every part, in the order of the table**.
- **A narrower scope** — a fix of one passage (`:quick-fix`), the short re-check of changed pages, a single cited rule: read `cheat-sheet/00-checks.md` and, completely, every part that covers a construct in the changed passage (a quiz → `06-quizzes.md`; read-aloud lines → `03-presentation-and-speech.md`; an image or link → `04-media-and-links.md`; a heading → `01-header-and-slides.md`). When unsure whether a construct is involved, read its part.

| Part | Covers |
|---|---|
| `cheat-sheet/00-checks.md` | §15 Accessibility (A11y) – Quick Checklist · §16 Common Mistakes & Pitfalls · §17 Mini Validation Before Export |
| `cheat-sheet/01-header-and-slides.md` | §1 Course Metadata (Header) · §2 Structure: Headings & Sections (every `#`/`##`/`###` starts a slide; subheadings within a slide; allowed patterns) |
| `cheat-sheet/02-text-lists-alerts-citations.md` | §3 Text, Lists, Quotes, Alerts & Citations |
| `cheat-sheet/03-presentation-and-speech.md` | §4 Presentation Mode & Speech Output (`narrator:`, `--{{n}}--`, `{{|>}}`, table inside HTML block) |
| `cheat-sheet/04-media-and-links.md` | §5 Media: Images, Audio, Video, oEmbed (Image size, Accessibility) · Link targets (Encode link targets) |
| `cheat-sheet/05-diagrams-formulas-code-tables.md` | §6 Diagrams · §7 Formulas & Equations (`$` math) · §8 Code & Execution · §9 Tables |
| `cheat-sheet/06-quizzes.md` | §10 Quizzes & Interaction: Single/Multiple Choice, Matrix Quiz, Text Quiz, Open Question, Tips · Quizzes for young learners / self-checks (No surface cues, feedback lines) · Controls as learners see them |
| `cheat-sheet/07-surveys.md` | §10b Surveys – Feedback without Solutions |
| `cheat-sheet/08-includes-macros-task-pattern.md` | §11 Including External Content · §12 Variables & Simple Macros · §13 Example Task Pattern |
| `cheat-sheet/09-audio-sections.md` | §14 Audio-Supported Sections |
| `cheat-sheet/10-minimal-example.md` | §18 Minimal Example (Structure) |
