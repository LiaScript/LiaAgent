# Task: create-outline

## Purpose

Create the **Lecture Outline** (`journal.md` → `## Outline`): title, target audience, time commitment, abstract, 3–5 learning objectives.

## Inputs

- Title, target audience (e.g. students, professionals, beginners), time commitment (e.g. semester hours per week, total hours), abstract (topics, content, benefits), learning objectives (3–5 concrete goals).
- `templates/course-outline.yaml` — completely.
- Dialog rules: section **Dialog rules** below (the parts of `data/chat-dialog.md` §1 this task uses); do **not** read `data/chat-dialog.md` completely. Read only `data/chat-dialog.md` → `## 2. Fit the narrow chat` when the dialog runs in the preview chat, and `→ Changing another section` only if another section must change.
- `tasks/update-dashboard.md` + `templates/project-dashboard.yaml` once, before the overview draft (step 8); `data/journal-links.md` is read completely with them (their Inputs), not separately here.

## Output

- `journal.md` → `## Outline`, structured by `templates/course-outline.yaml`; then `## Dashboard` (step 9).

## Dialog rules

- Course language (`## Course Context` → Language), address as `Instructor Address` says; no internal keys, slugs, file or script names in messages.
- **Reuse what is known:** prefill what the instructor said in this chat or the journal, ask only for confirmation; ask only what the instructor can decide from teaching experience, make technical choices yourself and show them in the summary. Describe a coming task by what the instructor will decide, never by its step names. What the instructor does not want saved: say honestly it is not kept ("Then I'll ask you again next time", translated).
- **Nothing unseen gets saved:** everything that will be written (incl. new overview entries and texts) appears before "Save", in future tense ("When you save, I will also record: …", translated), never as already saved. After a change show the new version again, starting with one line naming every change ("Changed: …", translated); of a proposal sent in parts resend the changed part whole and say the others stay as shown.
- **Overview texts:** never changed silently — the message before a write names each one it changes; a change of meaning is a question. Yes/no → buttons (`chat` with `inputs`).
- **Report the save first:** right after the write "✅ Saved: …", what the instructor may do now, what still runs ("only the overview is being updated"); a second question is its own message. A mid-save status names nothing as saved. Preview chat only: the ✅ message ends with `<!--- saved: Outline --->` as last line; a later message reporting overview changes ends with `<!--- saved: Dashboard --->`.
- **Agreement noted in the same turn:** the instructor agrees to do something before the material is used (also in a farewell) → `prepare` item in their words with that turn's overview write (`tasks/update-dashboard.md` step 6), or say it is not noted.

## Steps

1. Read `journal.md` → `## Course Context` (course type, conventions). Every `Additional Notes` line "For outline: …" (or for learning objectives) is the instructor's own input — start from it, never ask for it again. Goals neither there nor in your memory of this session: search the chat history before asking — `node specs/dashboard/find.mjs -i "<topic word>" .chats` first, `read_chat` only for the context of a hit.
2. Title and target audience: take from `## Course Context` (Working Title, target group notes) and goals already named; ask only for what is missing or contradictory.
   - Skill `creativity` available (`data/skills.md`): 🎛️ offer once, before the remaining inputs: 1. structured interview (default) · 2. open exploratory ideation with `creativity` first, then condense its result into the inputs. Only on request; this task still writes the outline.
3. Time commitment: prefill from `## Course Context` → Units (time frame of `:init-course` step 4), ask only for what is missing; by course type:
   - **lecture-series**: required (e.g., semester hours/week, total hours)
   - **workshop**: required (e.g., 1-day, 2-day block)
   - **self-paced**: optional (estimated self-study hours recommended, not mandatory)
   - **single-lesson**: skip — not applicable
4. Abstract (topics, content, benefits).
5. 3–5 concrete learning objectives. **Start from the instructor's goal:** already named (chat, `## Course Context`) → keep that goal and its verb; else ask first ("What should the learners be able to do at the end?"). **Self-check before the first proposal** — may add, never silently remove; name every change in one line; ask before dropping or replacing anything the instructor said:
   - **Observable in this setting:** say how each objective becomes visible — in the material (select, assign, write, record) or through a person who listens or watches (`## Course Context`: instructor or partner present?). Not observable in the material → keep it, add the observable step or the occasion where someone checks it; never swap the verb. A check by a person needs a **scheduled joint phase** with its minutes in the time check (learners × minutes per learner ≤ phase; else say it is only a sample). Own pace or alone with headphones: no partner unless such a phase is planned — propose the phase or a recording.
   - **Every level counts:** also for added objectives and every basic/extension level — the observable step uses the objective's verb, or names a preliminary step and the occasion for the verb itself. Narrowing or concretising an instructor's goal → show "your words → proposal" in one line.
   - **One action per objective;** split objectives with two verbs.
   - **Fits the learners** (`## Course Context`): language level, prior knowledge, support needs — add a language component where needed; heterogeneous groups get a basic and an extension level, named in the everyday words of the learners' institution (e.g. "for everyone" / "extra challenge", translated), never a word that also names a school stage, track or grade (German never "Grundstufe").
   - **Fits the time:** short list *session → objective → self-check* (table: at most 3 columns); include every time estimate you mention (e.g. listening time). Does not fit → propose what to drop. **Repeat this time check after every revision** and show the new result; a gap that stays open goes into the Dashboard's `decisions`.
   - Content questions come **before** the save confirmation, never in the same form; everything that will be saved (incl. the session split) is shown as text first. An addition of your own (extra check occasion, joint phase for another objective) is such a content question — never first named in the save preview.
6. Logo wanted → the Artist-Agent creates it after the outline is saved (`:agent artist` → `:create-logo`, stored in `## Visual Identity`).
7. Fill `templates/course-outline.yaml`. **Adding units to an existing outline** (e.g. after a track switch): keep every existing line word for word, add the new units. Single-file mode with several units: the course's title slide once before the units, each unit's slide list starts with its chapter slide (`data/file-structure-modes.md`).
8. **Before saving:** draft the overview data first (`tasks/update-dashboard.md`), then show the outline as the instructor will read it, with "Save" / "Change something" (single write confirmation). The preview names, by title, every open point and step text the overview draft adds or removes; what `write-dashboard.mjs` reports as added but the preview did not name → correction in the ✅ message. The preview has every field of `templates/course-outline.yaml` in its saved wording; a field taken from `## Course Context` may be one line ("Target audience: as in the course frame, plus: …"). Summary claims ("every objective has …") must hold for every item. Save: replace the content of `journal.md` → `## Outline` per `templates/course-outline.yaml` → `layout` (no sub-headings); keep the heading line, the action line (`<!-- class="journal-actions" -->`, computed — leave it) and the `<!--- Filled by :create-outline … --->` comment; replace the one-line "still empty" note; never write `{{…}}`.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` → update `journal.md` → `## Dashboard` in place. Stale statements in other sections (e.g. provisional goals in `## Course Context`) → Dashboard's `decisions`; never edit foreign sections silently. Find them: `node specs/dashboard/find.mjs -i "<outline word>" journal.md` (also over `### Latest Validation Summary`); a stale sentence in a check report → `internal` item for the next check. A finished approval of a unit stays as the journal records it — never ask for it again or add an approval item.
