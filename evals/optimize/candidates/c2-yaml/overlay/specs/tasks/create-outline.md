# Task: create-outline — declarative workflow; run `steps` in order, every `never`/`check` is binding.

```yaml
purpose: Create the Lecture Outline in journal.md → "## Outline" — title, target audience, time commitment, abstract, 3–5 learning objectives.
inputs: [title, target audience (students, professionals, beginners…), time commitment (semester hours/week, total hours…), abstract (topics, content, benefits), 3–5 concrete learning objectives]
reads:
  - {file: templates/course-outline.yaml, part: all}
  - {file: journal.md, part: "## Course Context"}
  - {file: data/chat-dialog.md, part: "## 2. Fit the narrow chat", when: dialog runs in the preview chat}
  - {file: data/chat-dialog.md, part: "## 1 → Changing another section", when: another section must change}
  - {file: tasks/update-dashboard.md, part: all, when: before overview draft (step save)}   # its Inputs bring data/journal-links.md completely
  - {file: templates/project-dashboard.yaml, part: all, when: before overview draft}
not_read: data/chat-dialog.md completely — the dialog rules it holds for this task are in `dialog`
output: journal.md → "## Outline" (templates/course-outline.yaml), then "## Dashboard"

dialog:   # from data/chat-dialog.md §1
  language: course language (## Course Context → Language), address per Instructor Address; no internal keys, slugs, file or script names in messages
  reuse: prefill what the instructor said (chat, journal), ask only for confirmation; ask only what teaching experience decides; make technical choices yourself and show them in the summary; describe a coming task by what the instructor will decide, never by step names
  not_saved_wish: say honestly it is not kept ("Then I'll ask you again next time", translated)
  nothing_unseen: everything to be written (incl. new overview entries/texts) shown before "Save", future tense ("When you save, I will also record: …", translated), never as already saved
  after_change: show the new version again, first line names every change ("Changed: …", translated); of a proposal in parts resend the changed part whole, say the others stay as shown
  overview_texts: never changed silently — name each before the write; a change of meaning is a question; yes/no → buttons (chat with inputs)
  after_save: "✅ Saved: …" + what the instructor may do now + what still runs ("only the overview is being updated"); second question = own message; mid-save status names nothing as saved; preview chat only — last line `<!--- saved: Outline --->`, a later message reporting overview changes ends with `<!--- saved: Dashboard --->`
  agreement: instructor agrees to do something before use (also in a farewell) → `prepare` item in their words with that turn's overview write (tasks/update-dashboard.md step 6), or say it is not noted

steps:
  - id: context
    do: read "## Course Context" → course type, conventions; every Additional Notes line "For outline: …" (or for learning objectives) = instructor's own input → start from it
    never: ask for it again
    ask_if: goals neither there nor in session memory → first `node specs/dashboard/find.mjs -i "<topic word>" .chats`, `read_chat` only for the context of a hit, then ask
  - id: title_audience
    do: take title + target audience from "## Course Context" (Working Title, target group notes) and goals already named
    ask_if: missing or contradictory — only that
    option: skill `creativity` available (data/skills.md) → 🎛️ offer once before remaining inputs "1. structured interview (default) · 2. open exploratory ideation with `creativity` first, then condense its result into the inputs"; run only on request; this task still writes the outline
  - id: time
    do: prefill from "## Course Context" → Units (time frame of `:init-course` step 4); ask only for what is missing
    by_course_type:
      lecture-series: required (e.g., semester hours/week, total hours)
      workshop: required (e.g., 1-day, 2-day block)
      self-paced: optional (estimated self-study hours recommended, not mandatory)
      single-lesson: skip — not applicable
  - id: abstract
    do: collect abstract (topics, content, benefits)
  - id: objectives
    do: 3–5 concrete learning objectives, starting from the instructor's goal — named (chat, ## Course Context) → keep goal and its verb
    ask_if: no goal named → ask first "What should the learners be able to do at the end?"
    self_check:   # before the first proposal; may add, never silently remove; name every change in one line; ask before dropping/replacing anything the instructor said
      observable: say how each objective becomes visible — material (select, assign, write, record) or a person who listens/watches (## Course Context: instructor or partner present?); not observable in material → keep it, add observable step or check occasion; never swap the verb
      person_check: needs a scheduled joint phase with its minutes in the time check (learners × minutes per learner ≤ phase; else say it is only a sample); own pace / alone with headphones → no partner unless such a phase is planned → propose the phase or a recording
      every_level: also added objectives and every basic/extension level — observable step uses the objective's verb, or names a preliminary step + occasion for the verb itself; narrowed/concretised instructor goal → one line "your words → proposal"
      one_action: one action per objective; split objectives with two verbs
      learners: fit ## Course Context — language level, prior knowledge, support needs; language component where needed; heterogeneous group → basic + extension level in the everyday words of the learners' institution (e.g. "for everyone" / "extra challenge", translated)
      time: short list session → objective → self-check (table ≤ 3 columns), every time estimate you mention included (e.g. listening time); not fitting → propose what to drop
    never:
      - a level word that also names a school stage, track or grade (German never "Grundstufe")
      - content questions in the same form as the save confirmation
      - an addition of your own (extra check occasion, joint phase for another objective) first named in the save preview — it is a content question
    check:
      - repeat the time check after every revision and show the new result; a gap that stays open → Dashboard's `decisions`
      - everything that will be saved (incl. the session split) shown as text before the save confirmation
  - id: logo
    when: instructor wants a logo
    do: say the Artist-Agent creates it after the outline is saved (`:agent artist` → `:create-logo`, stored in "## Visual Identity")
  - id: fill
    do: fill templates/course-outline.yaml
    adding_units: existing outline (e.g. after a track switch) → keep every existing line word for word, add the new units
    single_file_mode: several units → course title slide once before the units, each unit's slide list starts with its chapter slide (data/file-structure-modes.md)

save:
  before:
    - draft the overview data first (tasks/update-dashboard.md)
    - show the outline as the instructor will read it, with "Save" / "Change something" (single write confirmation)
    - preview names by title every open point and step text the overview draft adds or removes
    - preview contains every field of templates/course-outline.yaml in its saved wording; a field from ## Course Context may be one line ("Target audience: as in the course frame, plus: …")
    - summary claims ("every objective has …") hold for every item
  write: replace the content of journal.md → "## Outline" following templates/course-outline.yaml → layout (no sub-headings)
  keep: heading line; action line `<!-- class="journal-actions" -->` (computed, leave it); `<!--- Filled by :create-outline … --->` comment
  never: "{{…}}" skeletons; leaving the one-line "still empty" note
  correct: what write-dashboard.mjs reports as added but the preview did not name → said in the ✅ message as a correction

after:
  - run tasks/update-dashboard.md with templates/project-dashboard.yaml → update journal.md → "## Dashboard" in place
  - stale statements in other sections (e.g. provisional goals in ## Course Context) → Dashboard's `decisions`; never edit foreign sections silently
  - find them: `node specs/dashboard/find.mjs -i "<outline word>" journal.md` (also over "### Latest Validation Summary"); stale sentence in a check report → `internal` item for the next check
  - a finished approval of a unit stays as the journal records it — never ask for it again, never add an approval item
```
