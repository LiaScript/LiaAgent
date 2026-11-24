# update-dashboard — step 6, open points

6. **Open points (mandatory checklist).** Every `[key]` hint `validate-journal.mjs` prints (e.g. `provisional`,
   `slug`, `type-name`, `preparation`, `file-structure`, `template-brief`) becomes an item with that key — it
   rejects a missing one. It also lists the preparations the course frame names; each gets a `prepare` item
   linking the course frame, or an `internal` note why not. Then re-read the sources for what only a reader
   finds:
   - A `## Course Context` summary value that contradicts its technical field.
   - Numbers that disagree between sections (number of units, lessons, minutes).
   - Preparation tasks recorded in a section (equipment, printouts, accounts), and agenda phases led by
     the instructor outside the material (opening, closing, one-to-one talks) → `prepare`, with `how`.
   - Recommended actions of a unit's check report (the validator flags them `[report-action]`): what the
     instructor does herself (look at it on the learners' device, try it with a learner, provide something)
     → `prepare` with `source: {check: n}` and `how` in the report's words; what the assistant does → `internal`.
   - A brief under `## Templates` that the validator flags → `decide`, key `template-brief-{id}`; `how` says
     what is missing and who completes it (the brief together with the instructor, the folder through the
     development assistant). Plain words: German "Baustein", never "Template" or "Vorlage".
   Never fix foreign sections silently — listing them is this task's job. Several items for one hint use
   `{hint}-{topic}`; open priority issues of a persona review use `review-{unit}-{n}` (`decide`), prompt-only
   images and open `own` image spots `image-{unit}-{slug}` (`prepare`: create the image elsewhere or with
   `:generate-image` once an image route exists; for `own`: provide the photo). Each item has a `kind`:
   - `decide` — the instructor must decide **now**; `how` says where and how. A change that comes with a later
     step (e.g. a new start-page title when the next unit is written) goes into that step's `next`, not here.
     An approved unit (its decisions say `material approved`, no newer "Changed after the check" line) gets no
     approval item and no step text asking for it.
   - `prepare` — the instructor must do or get something before using the material; `how` says how.
   - `internal` — cleanup the agent does itself at the next suitable write. No `how`; rendered collapsed.
     Resolve it at the next write and mention it in that task's completion message.
   Something the instructor agreed to do or to have done next time (e.g. fix older units) is a `prepare`
   item in the instructor's words, with `how` saying what and when — never `internal`.
   Empty list if there is nothing open.
