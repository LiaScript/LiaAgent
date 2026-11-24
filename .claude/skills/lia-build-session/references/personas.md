# build-session — step 2, persona review loop

a. For each persona, run `tasks/review-as-persona.md {name} {number}` in **report-only mode**: perform its steps 1–7 (produce and save the structured `#### Persona Reviews` report) and skip steps 8–10 (the persistent in-character follow-up chat) — there is no one present to chat with during an automated loop. The instructor can start that chat separately afterward by calling `:review-as-persona` directly.

b. If any persona's priority issues (`data-key="priority"`) include a blocking concern (one that makes the unit unusable for that persona: it cannot follow, cannot do a task, or cannot access the material — everything else is reported, not fixed in this loop; a concern that exists only because a planned picture is not in yet — its spot is an open `#### Images` entry with its marker — is not blocking: the image step resolves it, and the closing summary names it with that step) — including a "content feels too short/rushed" comment, which is the real judgment call on the Step 1e duration flag — fix it via `:quick-fix` if it is an isolated issue, using the "When to use vs. `:coauthor-materials`" table from `tasks/quick-fix.md` as the decision rule. A broader issue needs `:coauthor-materials`: stop and hand off to the instructor, same rule as Step 1d — never regenerate the material to fix it.

c. After fixes, re-run Step 1c–1d — never 1a or 1b: regenerating would discard every fix of this run — and then this step again for **all** personas (not just the one that raised the concern, to catch regressions).

**Loop:** Repeat a–c until no persona raises a blocking concern, or after 3 rounds — whichever comes first. On hitting the cap: stop, list the unresolved persona concerns, and report to the instructor.
