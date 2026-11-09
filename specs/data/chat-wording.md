# Chat Rules: Wording and Navigation

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read with the core, once per session.

## 1. The instructor's words, never internal ones

- **Plain language:** no command names, slugs, file names, section keys, rule numbers, English field labels
  or product names of the platform in the chat — also not in form options and buttons; the server is "the
  program that shows the page". Use the course's own words (`## Course Context` → Terminology) instead of
  workflow jargon (journal, slug, persona, template, session, skeleton). Quote a rule instead of numbering it
  ("your rule that every unit starts with the headphones hint", never "rule 9" or "Project-Specific Rules").
  Fixed words, each explained on first mention:
  - a skeleton is the "planning sketch" (`terms.skeleton`) — "the plan of the unit's page, step by step:
    contents, tasks, self-check, no text yet; learners never see it";
  - the Coauthor subsection is "the rules for writing the material" — "the voice and wording rules I follow
    when I write the material"; never a compound of your own, never presented as another helper or figure;
  - another service gets a half sentence ("Wikimedia Commons, a collection of free photos"); a licence is
    said as what it allows ("may be used if the photographer is named").
- **Commands stay off the chat:** never write a command (`:preview 1`) or code font for it in a chat message,
  also not after a link — offer the button link with its button word (`data/agent-links.md` → Chat Offers).
  The command in code font belongs only in `journal.md`.
- **Address:** the instructor as `## Course Context` → `Instructor Address` says; `Person` is how *learners*
  are addressed in the material, never the instructor. Until the target group is known, the learners are the
  neutral course-language word for "learners"; then the group's own word (children, pupils, students).

## 2. Visible words are quoted, never paraphrased

- **State words from the language pack:** with a language pack for the course language (`specs/templates/i18n/<code>.json`), its `terms` are the wording of every state — word for word in reports, status lines, the overview and the chat; never a synonym. The same holds for the overview's "usable with learners" line: quote it ("usable with learners: yes, with limits", translated). A word the pack has only in the plural ("concerns", German „Bedenken“) is never made singular; one of them is "one point" (German „ein Punkt“).
- **Name things as the overview does:** use exactly the words the page shows (read them with `read_section`
  from the Dashboard slide) — never JSON field names and never your own synonyms.
  - One step has one label everywhere: the step, `next`, the unit's action line and chat offers
    (`tasks/update-dashboard.md` → `next` names one step); the link to the material carries the overview's
    button word (`terms.viewMaterial`).
  - The other assistants are named with their roster labels, never with a word of your own such as
    "helpers" (in a school course that word may mean helper children).
  - The group titles for open decisions and preparation are `labels.decide` and `labels.prepare` of the
    Dashboard data. Read the group titles **before** you offer to note something in a group, not after.
  - UI words in the course language (never "Button"); controls of the course page by what the page shows
    (`data/liascript-cheat-sheet.md` → Controls as learners see them) — never "speaker" for the play triangle ▶.
  - Option labels use a section's visible name, or a short form the same message introduces in parentheses.

## 3. One source per fact

- **Name open points by their titles** ("credits and source"), not by a count; a count counts the same set
  wherever it appears (chat, `subtitle`, `next`, the group on the page). Pictures are counted as the overview
  counts them ("images {n} of {m}": by image entries — a picture shown twice is one picture).
- **One way to start:** before naming the next step, read `next` from the Dashboard data; if you disagree,
  change the data first (`tasks/update-dashboard.md`), then name it. Offer exactly that action as the way
  forward — another entry (e.g. the fast track) only when the instructor asks for speed, and then say that it
  replaces the button on the page.
- **First contact / general questions** ("What should I do here?"): at most 5 short lines — what this is,
  what happens next, exactly one action link. No content questions the next task will ask anyway (name them
  as its topic), no list of the whole workflow, and announce only questions the next task really asks. Do not
  move the page on first contact unless the first sentence says so, never `goto` while `reload_pending` is
  set. A form that replaces an earlier, unanswered question says so.

## 4. Times

- **Situation remarks expire:** remarks about the instructor's situation (time left, "today", mood) hold only
  for the current sitting — after a reload or about 10 minutes of silence, ask instead of repeating them.
- **Times:** timestamps from events and `read_chat` are UTC — never state a clock time or a journal date from
  them. The one time source is `node specs/dashboard/now.mjs [<timestamp>]` (on its own): UTC, the local time
  of the computer that runs the preview, and — with a timestamp — the time since it; never `date`. Journal
  dates are its local date. Refer to earlier messages by content or relative age ("two minutes ago").
  Times of day only if the instructor used them or `now.mjs` gave the local time. Relative day words
  ("yesterday", "this morning") only if the instructor used them for the same event; an earlier sitting is
  "last time" or its journal date. Greetings and farewells carry no time of day unless the instructor used
  one ("See you next time", translated).

## 5. Point, don't describe

- **Point, don't describe:** before referring to the overview or a section, bring the instructor there —
  never "on the left you see …".
  - The reliable way is an anchor link `[label](#anchor)` (anchor rule: `tasks/update-dashboard.md` →
    Anchors). It resolves **in the file the page shows**: while a material file is shown (`get_state`), first
    `goto` with `file: "journal.md"` or send the button link `agent:teaching/preview` instead.
  - Never link a heading inside a `<section>` block — link its `##` heading and name the subsection. A link
    that names a check report targets that report's own heading, never the unit heading.
  - `goto` by heading only for headings **before** the first `<section>` block that contains headings, never
    while `reload_pending` is set. A page counts as opened only when `get_state.title` (the part before " · ")
    equals the heading text; otherwise give the anchor link ("You'll find it here: …", translated).
  - After a save that adds or removes headings, the completion message carries the anchor link to the new
    place.
