# Task: apply-theme

## Purpose

Writes the theme of `## Visual Identity` into the header of **all** course files and replaces an older theme there.
A building block of every way: the design track's look step, and in the full or mini way the only route by which a
new or changed look reaches files that already exist (the theme is otherwise copied only when a file is created,
`data/file-structure-modes.md` → "Creating the material document"). It writes only the header and never changes
teaching text.

## Command

`:apply-theme` — no parameters; always all course files.

## Inputs

- The theme: `journal.md` → `## Visual Identity` → `__LiaScript Theme:__` — the non-empty lines of its ```text block (`templates/visuals.yaml`). Without the block: say so in one line, offer `:create-visuals` (`agent:artist/create-visuals`) and stop.
- The course files, each once: design track — each unit's recorded path in the Material cell of `## Sessions`; full and mini way — the material documents as `data/file-structure-modes.md` resolves them (recorded path, then `## Agenda`, then `materials/{number}-{slug}/README.md`; single-file and mini: the root `README.md`). Only units whose material exists.
- `node specs/dashboard/read-source.mjs <file>` per course file (one command each): header styling as `theme-import`, `link-css`, `style` and `custom` entries, every import with its URL as template or theme, slides.
- Course language from `## Course Context`
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- The header (the first HTML comment at the top) of every course file that lacks a theme line or carries foreign styling (step 1) — only the header.
- `journal.md` → `## Dashboard`. No journal line records "theme applied": a file carries the theme when every theme line stands in its header, and the overview computes that.

## Steps

1. Read the theme lines and the course files (Inputs). A file whose header already holds every theme line and no foreign styling (step 2) is left out; if none is left, say that every course file already carries the look and stop — nothing is written. A file whose foreign styling the instructor chose to keep is offered again on a later run — intended: the answer is not stored.
2. **Foreign styling:** from the `read-source.mjs` output, everything of these kinds that is not a line of the new theme: every `@style … @end` and `@custom … @end` block, every `link:` URL it lists as `link-css` (stylesheets and font services) and every theme import. An earlier theme is recognised by these kinds, never by comparing with an older `## Visual Identity`. A header line with the same one-value key as a theme line (e.g. `logo:`) counts too. Show each listed import with its URL, so the instructor can tell a template from a theme. Imports of macro templates always stay (`import (template)`): never listed, never removed. Every other header line (author, language, narrator, version, macros) stays as it is.
3. **Before and after:** one example slide in the chat — the first slide of the first course file, sent twice: "Before" with its current header, "After" with the new header (each message starts with that header comment, so the chat shows the look). Without the preview chat show the old and the new header as two code blocks. If the chat cannot show the look, say so and offer `:preview` of the file after the write.
4. **Summary and one confirmation** (`data/chat-dialog.md` §1, in future tense): the files that will change, per file the lines added and the lines removed, that template imports stay and that nothing outside the header changes. Then one form — the one confirmation, nothing is written before it: one question per kind of foreign styling with its files ("replace — two themes overlap" · "keep"; preselected: replace), at most three; with more kinds, one checkbox question "keep this styling" listing all, none ticked; and the last question "Apply the look to {n} files" · "Change something" (translated).
5. **Write:** per file one write, only the header: replaced styling out — of an `import:` or `link:` key remove only the URL of a theme import or a stylesheet/font link; other URLs on the same key stay, and when its first URL goes, the key moves to the next URL; the theme lines in where the old theme stood, otherwise before the closing `-->`; a file without a header gets one at the top with only the theme lines. Use the file-edit tool on the header, or one map for `node specs/dashboard/localize-journal.mjs <map.json> <file>` — never one edit per line (every write reloads the preview). Then "✅ Saved: …" with the marker (`data/chat-dialog.md` §1).
6. **Contrast:** `node specs/dashboard/check-material.mjs <file>` per written file, each on its own. Every line `contrast {ratio}:1 < {need}:1 on slide {n} ({selector})` is reported in plain words (slide, which text) with a proposed colour; never change it silently — on yes, the colour changes in `## Visual Identity` and the files with one new confirmation, then this step runs again. Other findings of the script go to the suggestion list (Rules). "Rendered check not possible": `data/chat-checks.md` → Offering the Rendered Check; say how you checked.
7. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
8. Finish with a short summary and 1–3 next-step links: the Dashboard's `next` (design track e.g. `agent:artist/review-images?number=1` or the unit check), `agent:artist/preview?file={file}`, and the suggestion list if it has entries.

## Rules

- **Guard rail:** this task changes only the header and never changes teaching text — no slide, no image line, no layout. Layout ideas seen on the way (columns, boxes, a slide too full) go into a suggestion list (slide + one sentence), offered at the end as the Teaching-Agent's `:quick-fix {n} …` (`agent:teaching/quick-fix?number={n}`).
- Imports of macro templates always stay; foreign styling is replaced only as decided in step 4.
- One confirmation for all files; a contrast fix is a new one.
