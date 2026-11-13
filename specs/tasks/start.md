# Task: start

## Purpose

The first command in a fresh project folder. After `liadev init` (which puts the teaching agent, the
LiaScript skills, `.mcp.json` and the agent settings into the folder) the instructor starts an AI agent in
that folder and types `start`. This task creates the empty journal if there is none, opens the preview in
the instructor's own browser and greets them in its chat — from then on the instructor works in the browser.

## Command

`:start` — also the bare word `start` (any case, also a translation such as „Start“ or „starten“) when it is
the instructor's first message in the session.

## Inputs

- `journal.md`, if it exists: header `language:`, `## Course Context`, the Dashboard `next` (read with the
  file-reading tool).
- `tasks/open-chat.md` — steps 2–5 run as part of this task.
- `data/agent-links.md` (core: MCP Gate, Agent Roster) and `data/chat-wording.md`, read once per session.
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-language.md`, `data/chat-memory.md`

## Steps

1. **MCP gate closed** (the `liascript` tools `get_state`, `goto` and `chat` are not available): say in the
   terminal, in the language of the instructor's message (English for a bare `start`), in three short lines:
   - the browser chat needs the LiaScript DevServer as a tool of this agent;
   - if `.mcp.json` is missing: run `liadev init` in this folder first;
   - otherwise restart the agent in this folder and allow the server `liascript` when asked (Claude Code:
     at start or with `/mcp`; other agents: register `liadev --mcp --live -i journal.md` as MCP server in
     their own configuration, as `.mcp.json` shows).
   Do not start a server yourself. Stop.
2. **Journal:** if `journal.md` does not exist, create it as the byte-for-byte copy of the empty journal:
   `cp specs/templates/journal.md journal.md` (on its own). This is the only write before the instructor's
   first answer. An existing journal stays as it is.
3. **Open the chat:** run `tasks/open-chat.md` steps 2–5 — `get_state`; without a connected browser `goto`
   with `file: journal.md`, which opens the instructor's default browser; connect this session (roster,
   event subscription, `read_chat` without arguments); greet — with saved chat entries the pick-up sentence of its step 4 replaces the greeting. Wait for the browser with `get_state` for at most about 10 s; if
   it is still not connected, give `get_state.url` in the terminal as the link to open, and stop.
4. **Language first:** on the empty journal, before the greeting, the switch of `data/chat-language.md` →
   Language before the frame runs with `get_state.browser_lang` (language pack first, one write) and the
   roster labels follow the course language. The greeting is the first contact
   (`data/chat-wording.md` → First contact): one sentence what this is, exactly one link — the Dashboard's
   `next`, on the empty journal "start the course" (`init-course`).
5. **Terminal:** one line that the chat is open in the browser, with `get_state.url`, and that the work goes
   on there.

## Rules

- Setup only: writes nothing but the copy of the empty journal and the language switch of step 4.
- Never opens a browser-automation window instead of the instructor's browser; never a second preview tab
  when a browser is connected.
- Runs once per session; a second `start` behaves like `:open-chat`.
