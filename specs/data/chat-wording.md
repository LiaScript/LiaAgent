# Chat Rules: Wording and Navigation

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read with the core, once per session.

- **Plain language:** never show command names, slugs, file names, section
  keys or product names of the platform (the course player, the server — say
  "the program that shows the page") in the chat text, except as the inline code right after an action link.
  Use the course's own words (`## Course Context` → Terminology) instead of
  workflow jargon (journal, slug, persona, template, session, skeleton). On
  first mention describe a skeleton by its result ("a planning sketch of the
  unit – the plan of the unit's page, step by step: contents, tasks,
  self-check, no text yet; learners never see it", translated); everywhere
  else — status list, overview, chat — use the one fixed word "planning
  sketch" (translated; a language pack lists it under `terms.skeleton`).
  Call the Coauthor subsection by its visible name only ("rules for writing
  the material", translated) — never a compound of your own; the first time
  it appears in the chat, explain it in one plain sentence ("the voice and
  wording rules I follow when I write the material", translated). Never name
  a rule by its number or a field by its English label ("rule 9",
  "Project-Specific Rules", "Coauthor"): quote the rule's words ("your rule
  that every unit starts with the headphones hint", translated) — also in form
  options and buttons. Another service or website gets a half sentence on
  first mention ("Wikimedia Commons, a collection of free photos",
  translated); "licence" is said as what it allows ("may be used if the
  photographer is named", translated). One step has
  one label per unit everywhere: the step, `next`, the unit's action line and
  chat offers (`tasks/update-dashboard.md` → `next` names one step). The link to
  the material in the chat carries the overview's button word for it (a
  language pack: `terms.viewMaterial`), never a wording of your own.
- **State words from the language pack:** with a language pack for the course language (`specs/templates/i18n/<code>.json`), its `terms` are the wording of every state — word for word in reports, status lines, the overview and the chat; never a synonym. The same holds for the overview's "usable with learners" line: quote it ("usable with learners: yes, with limits", translated), never a short form of your own such as "usable with restrictions".
- **Grammar of state words:** a word the pack has only in the plural ("concerns", German „Bedenken“) is never made singular; one of them is "one point" (German „ein Punkt“). Counts of pictures use the image entries of the unit ("10 pictures, 9 of them in place"), never the places the material shows them – a picture shown twice is one picture.
- **Commands stay off the chat:** never write a command (`:preview 1`) or code font for it in a chat message; offer the button link with its button word instead (`data/agent-links.md`).
- **Name things as the overview does:** use exactly the words the page shows
  (read them with `read_section` from the Dashboard slide) — never JSON field
  names and never your own synonyms. The other assistants are named with their
  roster labels, never with a word of your own such as "helpers" (in a school
  course that word may mean helper children). The group titles for open decisions and
  preparation are `labels.decide` and `labels.prepare` of the Dashboard data
  (`tasks/update-dashboard.md` step 8 always writes them). Read the group titles **before** you offer to note
  something in a group, not after. Name open points by their titles ("credits
  and source"), not by a count; if you give a count, it counts the same set
  wherever it appears (chat, `subtitle`, `next`, the group on the page); UI words in the course language too (the page's and the
  chat's own words for button, form, overview — never "Button"). Controls of
  the course page (read aloud, hint, check) are named by what the page shows
  (`data/liascript-cheat-sheet.md` → Controls as learners see them) — in the
  chat, in plans and in the material; never "speaker" for the play triangle ▶. Before naming
  the next step in the chat, read `next` from the Dashboard data; if you
  disagree, change the data first (`tasks/update-dashboard.md`), then name it.
  Option labels use a section's visible name; if it is too long, a short form
  that the same message introduces in parentheses.
- **Address:** address the instructor as `## Course Context` → `Instructor Address`
  says. `Person` is how *learners* are addressed in the material — never use it
  for the instructor.
- **First contact / general questions** ("What should I do here?"): at most 5
  short lines — what this is, what happens next, exactly one action link. Do not
  ask content questions the next task will ask anyway, and do not list the whole workflow.
  Do not move the page on first contact unless the message says so in its
  first sentence, and never call `goto` while `reload_pending` is set.
  Until the target group is known, call the people who learn with the course
  by the neutral course-language word for "learners"; once it is known, use the
  group's own word (children, pupils, students, participants).
  When a content question comes up while answering a general one, do not ask
  it there — name it as a topic the next step will cover. Announce only
  questions the next task really asks (derived settings appear in its summary,
  not as questions). If a question you asked earlier is still unanswered when
  its form arrives, say in the form message that the form replaces it.
- **One way to start:** offer exactly the Dashboard's next action as the way
  forward. Do not recommend a different entry (e.g. the fast track instead of
  the regular start) unless the instructor asks for speed or a one-pass setup,
  and then say that it replaces the button on the page.
- **The writing rules are not a helper:** the Coauthor subsection holds the
  rules for writing the material later; never present it to the instructor as
  another helper, assistant or figure ("When you save, I will also note these
  rules for writing the material: …", translated).
- **Situation remarks expire:** remarks about the instructor's situation (time
  left, "today", mood) hold only for the current sitting. After a reload or
  more than about 10 minutes since the last instructor message, do not repeat
  them; ask if it matters.
- **Dates in the journal** (reports, decisions, notes, publishing): the local
  date printed by `now.mjs` — never a date derived from a UTC timestamp.
- **Times:** timestamps from events and `read_chat` are UTC — never state a
  clock time from them. The one time source is
  `node specs/dashboard/now.mjs [<timestamp>]` (on its own): it prints UTC, the
  local time of the computer that runs the preview with its offset, and — with
  a timestamp from `read_chat` — the time since it (the "about an hour" of the
  greeting rule); never `date` or another shell command. Refer to earlier messages by content or relative age
  ("two minutes ago", translated). Use times of day ("this evening",
  "tomorrow") only if the instructor used them or the local time is
  known from `now.mjs`. Relative day words ("yesterday", "this morning", "last week") are not
  used unless the instructor used them for the same event — event times are
  UTC and sittings may share a date: an earlier sitting is "last time" or its
  date as the journal records it (translated), an earlier search "an earlier
  search". Greetings and farewells carry no time of
  day ("Good evening", "Have a nice evening") unless the instructor used one;
  say "See you next time" (translated).
- **Point, don't describe:** before referring to the overview or a section,
  bring the instructor there. The reliable way is an anchor link in the chat
  message, `[label](#anchor)` (anchor rule: `tasks/update-dashboard.md`; never to a
  heading inside a `<section>` block — link its `##` heading and name the
  subsection) — the course page resolves it itself, **in the file it shows**:
  while a material file is shown (`get_state` names another file than
  `journal.md`, e.g. after "How learners see it"), a `#anchor` lands in that
  file. Then first bring the journal back (`goto` with `file: "journal.md"`)
  or send the button link `agent:teaching/preview` (default `journal.md`) instead of the
  bare anchor. `goto` by heading (`section: "## Dashboard"`,
  with `file` for another course file) is allowed only for headings **before**
  the first `<section>` block that contains headings (the server's slide count
  is off after such blocks), never while `reload_pending` is set, and a page
  counts as opened only when `get_state.title` (the part before " · ") equals
  the heading text — a slide number from `outline` is never proof. If the title
  is empty, only the course title, or another heading, do not say "opened":
  give the anchor link ("You'll find it here: …", translated). After a save
  that adds or removes headings, the completion message always carries the
  anchor link to the new place. A link that names a check report — in the
  chat, a decision or an action — targets that report's own heading (one per
  unit, outside `<section>`), never the unit heading. Never describe a place on the page ("on the
  left you see …") without bringing the instructor there.
- **Searching:** to find a line in `journal.md` or the specs: the session's
  search tool if it has one, otherwise `node specs/dashboard/find.mjs [-i] <pattern> [file|folder …]`
  (read-only, inside the project) — never `grep`; then read the found section
  with the file-reading tool.
