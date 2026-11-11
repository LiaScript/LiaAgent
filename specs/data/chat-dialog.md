# Chat Rules: Dialog and Saving

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read completely by every task with a dialog (its Inputs name this sheet).

## 1. Ask little, show everything, then write once

- **Reuse what is known:** in every interview (also the fast track), prefill what the instructor already said
  in this chat or the journal and ask only for confirmation. Ask only what the instructor can decide from
  teaching experience; make technical choices yourself and show them in the summary. Describe a coming task
  by what the instructor will decide, never by its step names. **What the instructor does not want saved** (a
  start date, an agreement): say honestly that it is not kept — "Then I'll ask you again next time"
  (translated) — never that other assistants will find it in the chat: they read only its latest entries.
- **Nothing unseen gets saved:** everything that will be written — lesson splits, review lines, decision-list
  entries, report notes, new overview entries and texts — appears in the summary before "Save", in future
  tense ("When you save, I will also record: …", translated), never as if already saved. After a change, show
  the new version again, **starting with one line that names every change** ("Changed: …", translated); of a
  proposal sent in parts resend the changed part whole and say the others stay as shown. Content questions
  never share a form with "Save".
- **Overview texts you change:** never silently. The message before a write names every overview text it
  changes; a change of meaning (a step becomes required, a point disappears) is a question, not an update.
  When a chat answer admits that an overview text is wrong, say it will be corrected at the next overview
  write. A yes/no decision gets buttons (`chat` with `inputs`), never "just tell me whether I should".
- **Report the save first:** right after the write send "✅ Saved: …" (marker: `data/chat-memory.md`), what the instructor may do now ("You
  can already look at the page", translated) and what still runs ("only the overview is being updated"),
  so the status below does not read "not saved yet"; a second question comes as its own message. After a
  check the ✅ message carries the outcome and the line "usable with learners now" as two paragraphs (a blank
  line between — a single line break becomes a space) and links the report; details follow after the
  overview update.
- **An agreement is noted in the same turn:** when the instructor agrees to do something before the material is
  used (look at a page on the device, bring a photo, fix older units next time) — also in a farewell — write it as
  a `prepare` item in their words (`tasks/update-dashboard.md` step 6) with that turn's overview write, or say that it
  is not noted.
- **A new writing rule for all units** (saved in the rules for writing the material): after the save, offer
  once to check the units that already have material against it (one form: each unit with "check briefly"
  – `:quick-fix {n}` – or "leave it"), and name the offer in the save summary.
- **Changing another section:** if the running task needs a change in a section it does not own (e.g. an
  objective in the outline while planning the lesson design), show the new wording and give it its own
  choice **in the first save form**: "Save, including the changes in {sections}" · "Save only {own section}"
  (the contradiction then becomes an open point on the overview) · "Change something" — never a plain "Save"
  that silently includes them.
  - Read the owning task **and its template** first and apply its checks (a template `layout` is kept); add
    a short note in **every** changed section (also `## Agents` subsections) which task changed what; the
    completion message lists only notes that exist.
  - In course-wide sections (didactics, writing rules) change only general rules; values for one unit belong
    to the agenda, the outline line and the unit — widen a range ("about 5–10 minutes") instead of adding an
    exception.
  - **One write per changed section:** `read_section` + `write_section` (hash-checked, layout kept), or all
    line changes of one save in one map for `node specs/dashboard/localize-journal.mjs <map.json> [<file>]` —
    an all-or-nothing line replacer: a pair may replace a block of consecutive lines that occurs once, and
    `"append"` adds lines at the end of the file. A few lines in a foreign section go into the same map as
    the own section's lines, never a rewrite of the whole foreign section. Material files alike: one map or
    the whole file once — never one edit per line (every write reloads the preview and resets the
    instructor's quiz answers).
  - Target for "own section + two foreign sections + overview": 2 writes (the map, then
    `write-dashboard.mjs`), never more than 5. The write scripts count their writes (`.cache/writes.json`)
    and warn from the 6th within 10 minutes: take it as a stop and put the rest into one map.

## 2. Fit the narrow chat

- **Forms:** at most 4 questions per form, each with a plain-language label without a trailing colon (the chat
  adds one); `checkbox` where several answers can apply. `buttons` submits at once only when it is the only
  question (e.g. "Save"/"Change"); never promise "one question at a time" when you send several.
- **Long proposals:** a proposal longer than about 1500 characters (about 20 lines) — also the whole version
  after a change — goes out as 2–3 messages (content · distribution and time · open points); the form comes
  as a separate last message. If it ends up more than a screen above after a side question, post it again.
- **Superseded forms:** when you post a revised proposal or a form that replaces an open one, close the old
  one with `chat` `close: true` and a `reason` ("Replaced – new form below ↓", translated; German „Ersetzt –
  neues Formular unten ↓“). An `answer` event to an older `ask` than your latest is not acted on; ask for an
  answer in the new form.
- **Tables in the chat:** at most 3 columns with short cells (about 25 characters), otherwise a list; no column
  of bare numbers ("1 · Title" in the first cell), no attribute comments. Long tables go to the journal; after
  saving, link the section instead of repeating the table.
- **Preview before writing:** quizzes, surveys and other interactive parts are shown in the chat as LiaScript
  first, so the instructor can try them. A message with read-aloud markup (`{{|>}}`, `{|>}{…}`, `--{{n}}--`)
  starts with a header comment like the material header — `narrator:` of the material header (before it
  exists, a voice for the course language, `data/file-structure-modes.md` → "Creating the material document")
  and `language:` — without it the chat reads with a default English voice. Check the draft against the
  narrow width first (no matrix quiz wider than 3 short columns).
