# Task: create-outline (AIL notation)

Legend — read this first; every line below is a binding rule:
- `@x` = file x (paths relative to `specs/`); `@x ⊂ S` = read ONLY part S of x; `@x ⊂ *` = read x completely
- `?` = ask the instructor (only if the condition after `?` holds); `!` = never do this
- `→` = then / results in / goes into; `⇐` = take from (prefill, don't ask)
- `≤` / `≥` = at most / at least; `|` = alternatives by case
- `"…"` = user-facing wording: keep its meaning, translate into the course language
- `[n]` = step n; `§` = rule block of this file; `+` = also / in addition

PURPOSE: Lecture Outline → `journal.md` → `## Outline`: title, target audience, time commitment, abstract, 3–5 learning objectives.
IN: title · target audience (students, professionals, beginners…) · time commitment (semester hours/week, total hours…) · abstract (topics, content, benefits) · 3–5 concrete learning objectives
READ: `@templates/course-outline.yaml ⊂ *` · `journal.md ⊂ ## Course Context` · §DIALOG (replaces a complete read of `@data/chat-dialog.md`) · `@data/chat-dialog.md ⊂ ## 2. Fit the narrow chat` only if dialog runs in preview chat · `@data/chat-dialog.md ⊂ Changing another section` only if another section must change · `@tasks/update-dashboard.md ⊂ *` + `@templates/project-dashboard.yaml ⊂ *` once, before the overview draft [8] (they bring `@data/journal-links.md ⊂ *`)
OUT: `journal.md` → `## Outline` per `@templates/course-outline.yaml` → then `## Dashboard`

§DIALOG (from `data/chat-dialog.md` §1)
- course language (`## Course Context` → Language), address per `Instructor Address`; ! internal keys, slugs, file or script names in messages; ! internal agent names ("Teaching-Agent", "Artist-Agent" …): "I" for yourself, another assistant by its role in the course language (e.g. "the design assistant")
- ⇐ what instructor said (chat, journal), ask only for confirmation; ? only what teaching experience decides; technical choices: yours, shown in summary; describe a coming task by what the instructor decides, ! by step names
- instructor doesn't want something saved → say honestly it is not kept ("Then I'll ask you again next time")
- everything to be written (+ new overview entries/texts) shown before "Save", future tense ("When you save, I will also record: …"); ! as if already saved
- after a change → show new version again, first line names every change ("Changed: …"); proposal in parts → resend changed part whole, say others stay as shown (! in the save preview [8]: there every field in full)
- overview texts: ! change silently; name each before the write; change of meaning = question; yes/no → buttons (`chat` with `inputs`)
- after write → "✅ Saved: …" + what instructor may do now + what still runs ("only the overview is being updated"); 2nd question = own message; mid-save status names nothing as saved; preview chat only: last line `<!--- saved: Outline --->`; later message reporting overview changes ends `<!--- saved: Dashboard --->`
- instructor agrees to do something before use (+ in a farewell) → `prepare` item in their words with that turn's overview write (`@tasks/update-dashboard.md` step 6), or say it is not noted

STEPS
[1] read `## Course Context` → course type, conventions. `Additional Notes` line "For outline: …" (or for learning objectives) = instructor's own input → start from it; ! ask for it again. Goals not there and not in session memory → `node specs/dashboard/find.mjs -i "<topic word>" .chats` first, `read_chat` only for context of a hit → then ?.
[2] title + target audience ⇐ `## Course Context` (Working Title, target group notes) + goals already named; ? only missing or contradictory.
    skill `creativity` available (`@data/skills.md`) → 🎛️ offer once before remaining inputs: 1. structured interview (default) · 2. open exploratory ideation with `creativity` first, then condense into the inputs. Run only on request; this task still writes the outline.
[3] time commitment ⇐ `## Course Context` → Units (time frame of `:init-course` step 4); ? only missing. By course type:
    **lecture-series**: required (e.g., semester hours/week, total hours) | **workshop**: required (e.g., 1-day, 2-day block) | **self-paced**: optional (estimated self-study hours recommended, not mandatory) | **single-lesson**: skip — not applicable
[4] abstract (topics, content, benefits).
[5] 3–5 concrete learning objectives. Instructor's goal named (chat, `## Course Context`) → keep goal + its verb; else ? first "What should the learners be able to do at the end?".
    SELF-CHECK before the first proposal: may add, ! silently remove; every change named in one line; ? before dropping/replacing anything the instructor said.
    - observable: say how each objective becomes visible — material (select, assign, write, record) | person who listens/watches (`## Course Context`: instructor or partner present?). Not observable in material → keep it + add observable step or check occasion; ! swap the verb.
    - person check → scheduled joint phase, its minutes in the time check (learners × minutes per learner ≤ phase; else say it is only a sample). Own pace / alone with headphones → no partner unless such a phase is planned → propose the phase or a recording.
    - every level counts: added objectives + every basic/extension level; observable step uses the objective's verb, or names a preliminary step + occasion for the verb itself. Narrowed/concretised instructor goal → one line "your words → proposal".
    - one action per objective AND per basic/extension level: one verb each ("view and restore" = two actions). Two-verb objective or level → split into two, or reduce to the one verb its observable step checks; name it in one line. Before showing: count the verbs of every objective and level line.
    - fits learners (`## Course Context`): language level, prior knowledge, support needs; language component where needed; heterogeneous group → basic + extension level in everyday words of the learners' institution (e.g. "for everyone" / "extra challenge"); ! a word that also names a school stage, track or grade (German ! "Grundstufe").
    - fits time: short list session → objective → self-check (table ≤ 3 columns), + every time estimate you mention (e.g. listening time); not fitting → propose what to drop. Repeat after EVERY revision, show new result; gap stays open → Dashboard's `decisions`.
    - content questions BEFORE save confirmation, ! in the same form; everything to be saved (+ session split) shown as text first. Own addition (extra check occasion, joint phase for another objective) + any new sentence in any field (target-group note, abstract sentence, session note, the "plus: …" of [8]) = content question; ! first named in save preview.
[6] logo wanted → tell the instructor the design assistant creates it after the outline is saved (`:agent artist` → `:create-logo`, stored in `## Visual Identity`).
[7] fill `@templates/course-outline.yaml`. Adding units to existing outline (e.g. after track switch) → keep every existing line word for word + add new units. Single-file mode, several units → course title slide once before the units, each unit's slide list starts with its chapter slide (`@data/file-structure-modes.md`).
[8] BEFORE SAVE: overview data draft first (`@tasks/update-dashboard.md`) → show outline as the instructor will read it + "Save" / "Change something" (single write confirmation).
    - preview names by title every open point + step text the overview draft adds or removes; `write-dashboard.mjs` reports added but unnamed → correction in the ✅ message
    - preview = every field of `@templates/course-outline.yaml` (title, target audience, time commitment, abstract, learning objectives + their sub-lists, session overview) written out in its saved wording, even if shown just before; ! "as above", "unchanged", "see list", "as discussed" or any pointer in place of the text. Only a field taken over from `## Course Context` may be one line ("Target audience: as in the course frame, plus: …")
    - saved text = preview text, word for word (+ numbering, sub-lists); change after the preview (+ your own rewording or fix) → new full preview, first line "Changed: …", then save; ! save wording the instructor has not seen
    - summary claims ("every objective has …") hold for every item
    SAVE: replace content of `journal.md` → `## Outline` per `@templates/course-outline.yaml` → `layout` (no sub-headings). Keep heading line, action line `<!-- class="journal-actions" -->` (computed, leave it), `<!--- Filled by :create-outline … --->` comment; replace the one-line "still empty" note; ! write `{{…}}`.
[9] run `@tasks/update-dashboard.md` with `@templates/project-dashboard.yaml` → `journal.md` → `## Dashboard` in place.
    stale statements in other sections (e.g. provisional goals in `## Course Context`) → Dashboard's `decisions`; ! edit foreign sections silently. Find: `node specs/dashboard/find.mjs -i "<outline word>" journal.md` (+ over `### Latest Validation Summary`); stale sentence in a check report → `internal` item for the next check.
    finished approval of a unit stays as the journal records it; ! ask for it again; ! add an approval item.
