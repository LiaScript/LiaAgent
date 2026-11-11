# Chat Memory

The saved chat (`.chats/*.json`) survives a restart of the agent or the DevServer. Only with the MCP gate open
(`data/agent-links.md` → MCP Gate); without it nothing here applies, the journal is the only memory.

## The save marker

The ✅ message of every save ends with `<!-- saved: {what} -->` (format and rule: `data/chat-dialog.md` → Report the save first). It proves that its content is in the journal.

## Picking up

On start and after a gap, `read_chat` with its default (omit `last`: the last 50 entries), then:

1. **Saved or not:** the newest entry with a `<!-- saved: … -->` marker separates what is saved from what is not. What lies
   after it is the unsaved state: decisions and answers that no journal section holds yet. Without any marker
   in those entries nothing counts as saved; only the journal counts.
2. **Make a picture** for yourself: topic, saved, unsaved, open question.
3. **One sentence of picking up** instead of a greeting when the greeting rule applies
   (`data/agent-links.md` → On start and after a gap): what stands, what is open. The one link after it stays
   the Dashboard's next (`tasks/open-chat.md` step 4).
4. **Unsaved decisions:** offer to save, never write it silently. They go through the normal save
   confirmation of the task (`data/chat-dialog.md`).
5. **Conflict:** when the chat and the journal differ, the journal wins; name the difference and ask.
6. **Forms** (`chat` with `inputs`) from before the restart are closed: an unanswered one is asked again.
