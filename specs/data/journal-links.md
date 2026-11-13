# Journal Links and Field Keys

How `agent:` links, action lines, Dashboard actions and field keys are written into `journal.md`. Part of the
agent rules of `data/agent-links.md`; read completely by every task that writes a journal section (its Inputs
name this file).

## Field keys in journal sections

Visible labels in `journal.md` sections are in the course language. When a task
names a field as `__Key:__` (e.g. `## Didactics` → `__Professor Persona:__`), it
means the field whose attribute comment directly above carries its key
(`<!-- data-key="guiding-figure" -->`, keys: the `layout` of the section's
template), and in older journals the bullet whose label starts with that English
key. Fields inside a `<details>` technical block keep their English labels.
Didactics: `Didactic Concept` = `didactic-concept`, `Professor Persona` =
`guiding-figure`, language style = `language-style`, lesson patterns =
`lesson-patterns`, difficulty = `difficulty`, `Persona Voice Sample` =
`voice-sample`. Outline and Agenda: the section ids of `templates/course-outline.yaml` and `templates/course-agenda.yaml` (`Time Budget` = `time-budget`).
The same for a unit's check report: `#### Validation Report` in a task means the
heading directly above `<section data-key="validation-report">` (visible text in
the course language, `templates/session-validation.yaml`), and in older journals
the heading that starts with `#### Validation Report`.
When the instructor asks about a field name, explain that keys are invisible —
never claim a visible English label is needed.

## Markdown Format

In `journal.md` always write the link followed by the visible command, so the line is useful
in any renderer (VS Code, GitHub, LiaScript without DevServer). In the chat the link stands alone
(`data/agent-links.md` → Chat Offers):

```markdown
[▶️ Build session 3](agent:teaching/build-session?number=3) `:build-session 3` — material missing
```

- Label: short verb phrase in the course language (`## Course Context` →
  `Language`), starting with `▶️` (run), `✏️` (revise/redo), `🔍` (check),
  `👁` (preview), `🚀` (publish — only `development/create-project` and
  `development/update-project`), or the agent icon for a switch (`🎨` Artist, `🧑‍🎓` Learner,
  `🛠️` Development, `🎓` Teaching).
- Then the command in inline code, exactly as the instructor would type it —
  with values, never raw placeholders (`{description}`). A value left out on
  purpose is shown as a translated hint in angle brackets (`<what?>`). If the
  label names a concrete fix, pass it in the link (`&description=…`) and in the
  command. Which action comes next — in the Dashboard and in the action lines of
  the core sections and units — is computed by `write-dashboard.mjs`
  (`tasks/update-dashboard.md` step 2), with the button word from the language pack.
  `quick-fix` is never a main action without a description.
- In chat offers: the link, then ` — ` plus a short reason, without the command.
- Never use `<button data-agent=…>`; the Markdown link is the only format.

### Dashboard data

`## Dashboard` holds one JSON block rendered by the Dashboard library
(`specs/dashboard/`). There an action is data, not a Markdown link: `href`
(the `agent:` URI) plus `command` (the readable command) plus `icon` — the same
symbol a Markdown label would start with (see Markdown Format: `▶️`, `✏️`, `🔍`,
`👁`, `🚀`, or the agent icon). The library renders a button with the icon before the
label and the readable command right after it; without `icon` an `agent:` button
shows `▶️`. Whitelist,
prerequisites and confirmation tiers apply unchanged.

### Action lines below headings

A section may carry one **action line**: a single paragraph directly below its
heading (before the `<!--- Filled by … --->` comment), marked with the LiaScript attribute
comment `<!-- class="journal-actions" -->`. The class styles the line and marks
it as generated — `tasks/update-dashboard.md` creates and refreshes these paragraphs and, in
source sections, only the few derived lines its "writes only" list names.

```markdown
## Outline

<!-- class="journal-actions" -->
[✏️ Revise outline](agent:teaching/create-outline) `:create-outline` · [▶️ Didactics](agent:teaching/create-didactics) `:create-didactics`

<!--- Filled by :create-outline from templates/course-outline.yaml. --->
```

Rules for action lines:

- Links separated by ` · `, at most 6 per line, one line only, no headings.
- The lines marked "computed" in the table below are written by `write-dashboard.mjs`
  after every task; a task leaves them as they are. Other lines: a task that replaces a section
  writes its action line already in the state after the save (e.g. ✏️ revise
  instead of ▶️ create), or leaves it to `tasks/update-dashboard.md`, which runs afterwards.
- Writing a section replaces its one-line note ("still empty – …") with the
  content; the provenance comment `<!--- Filled by … --->` stays invisible
  (name the task that actually wrote the section). Never write `{{…}}`
  skeletons into the journal — `validate-journal.mjs` rejects visible ones.
- Tasks that insert blocks into a session
  subsection (`#### Validation Report`, `#### Persona Reviews`, `#### Images`)
  insert them at their place in `templates/session-skeleton.yaml` →
  `section_layout.entry_order` (behind the skeleton fields), never before the
  action line.
- Only commands that make sense in the current state (see table below; e.g. no
  `promote-session` for a session without skeleton).

| Section | Action line (commands) |
|---|---|
| `## Course Context` | computed: `init-course` (▶️ create, ✏️ revise once saved); `analyze-existing` (only for improve-existing courses) |
| `## Outline` | computed: `create-outline` |
| `## Didactics` | computed: `create-didactics`, `artist/create-visuals` |
| `## Visual Identity` | `artist/create-visuals`, `artist/create-logo` |
| `## Templates` | `suggest-templates`, 👁 `preview?file=specs/catalog/README.md` (the template catalog, command `:preview specs/catalog/README.md`), `manage-templates` |
| `## Agenda` | computed: `create-agenda` |
| `## Sessions` | computed (`actions.mjs` → `sectionLines`): `create-session`, `build-session?number={n}`, `validate-course`; light tracks: `create-mini-course` until unit 1 has material, then `validate-course`; design: `validate-course`; none once the unit check is the course check (`unitIsCourseCheck`: mini/convert with unit 1 done, design with every unit done) – the line then goes with its marker and comes back below the heading once links are due again |
| `### {n}. {title}` | computed: **exactly one main action** of that unit by its state (`specs/dashboard/actions.mjs` → `unitAction`); after a check that needs correction ✏️ `coauthor-materials?number={n}` or, when every open point is one small change, ✏️ `quick-fix?number={n}&description=…` — that choice is yours. **Learners' view:** once the material exists, the line also carries 👁 `preview?file={n}` ("How learners see it", translated) as second link after ` · ` — never only inside the `<details>` block. A link to the unit's planning is named "See planning" (translated), never "To unit {n}". All further commands (`promote-session`, `build-session`, `validate-syntax`, `preview`, `quick-fix`, `learner/review-as-persona`) go only into the session's `<details><summary>Technical settings and more actions</summary>` block right after the action line (block order: `templates/session-skeleton.yaml` → `section_layout.entry_order`) |
| `## Agents` | `configure-agent` (agent asked in chat), `create-learner-persona`, `learner/switch` (only if personas exist) |
| `## Validation` | `validate-course` (only once every unit of the agenda or overview has material) |
| `## Publishing` | `development/create-project` (first publication, only if the publishing gate is PASS), `development/update-project` (once `__State:__` is published; same gate) |
| `## Notes Backup` | `save-notes`, `save-decision` |

`## Dashboard` has no action line — its data block carries the actions. `## Analysis
Status` gets none.
