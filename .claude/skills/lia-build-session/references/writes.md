# build-session — writes per run

## Writes per run

Every write reloads the preview and resets the answers of an instructor who is trying a page. Target per run — material: the generated text (at most 3 parts), images 1, each fix iteration 1; journal: sketch save 1 plus the overview patch of step 0, report + image entries + status line 1 per iteration, overview 1 (step 4). Changes of several lines go into one map (`localize-journal.mjs`) or one section write (`data/chat-dialog.md` → Changing another section). Sub-procedures write in these batches: all persona reports of one round in one journal write, the image entries and status line of a batch in one, all images of step 3 in one material write. A run that needs more writes names the number in its runs line ("writes: {n}", translated; the write scripts' log `.cache/writes.json` counts theirs, writes with the file-edit tool are added) — never splits silently.
