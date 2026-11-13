# Chat Memory

The saved chat (`.chats/*.json`) survives a restart of the agent or the DevServer. Only with the MCP gate open
(`data/agent-links.md` → MCP Gate); without it nothing here applies, the journal is the only memory.

## The save marker

The ✅ message of every save ends with `<!--- saved: {what} --->` (three dashes, so LiaScript hides it; format and rule: `data/chat-dialog.md` → Report the save first; older chats may carry the two-dash form `<!-- saved: … -->`, which counts the same). It proves that its content is in the journal.

## Picking up

On start and after a gap, `read_chat` with no arguments (its default: the last 50 entries — never a smaller
`last`), then:

1. **Saved or not:** the newest entry with a `<!--- saved: … --->` marker separates what is saved from what is not. What lies
   after it is the unsaved state: decisions and answers that no journal section holds yet. Without any marker
   in those entries nothing counts as saved; only the journal counts.
2. **Make a picture** for yourself: topic, saved, unsaved, open question.
3. **One sentence of picking up** instead of a greeting when the greeting rule applies
   (`data/agent-links.md` → On start and after a gap): what stands, what is open. The one link after it stays
   the Dashboard's next (`tasks/open-chat.md` step 4). When the greeting rule does **not** apply (a short
   gap, e.g. only a restart): no message of its own — no welcome, no summary; only an open form is asked again
   (point 6), or the one-line correction of point 5 when the statement it corrects is among the last visible
   messages. The picture of point 2 is answered when the instructor asks ("where were we?"), once.
4. **Unsaved decisions:** offer to save, never write it silently. They go through the normal save
   confirmation of the task (`data/chat-dialog.md`).
5. **Conflict:** when the chat and the journal differ, the journal wins. When the journal settles it (an
   approval, a passed check, a saved decision): **name it, do not ask** — one sentence that refers to the old
   message ("Last time I wrote that I would ask you again about approving {unit} 1 – that is not needed: your
   approval stands", translated). Only a difference the journal does not settle is a question. **Protected
   states** — a chat promise never reopens them: an approval, a passed check, a decision about an existing
   image (keep, replace, remove), a licence the instructor keeps, a confirmed design.
6. **Forms** (`chat` with `inputs`) from before the restart are closed (the chat marks them "no longer open"):
   an unanswered one is asked again, with one short line why ("I was restarted — here is the open question
   again", translated) — **only if the journal does not already hold its answer.** Look it up first
   (`node specs/dashboard/find.mjs`): an approval counts as answered when the unit's decisions hold a
   `material approved` entry (or a later decision that keeps it, e.g. a confirmed track switch) and no
   "Changed after the check" line is newer. Then ask nothing; correct an old announcement once as point 5 does; a promise in the chat ("I'll ask
   you again next time") never reopens a finished approval or check — the journal wins (point 5). An
   approval form is always the one of `tasks/quick-fix.md` (incl. "Look at it later"), never a copy of an old form.
