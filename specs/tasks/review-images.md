# Task: review-images

## Purpose

Reviews the images a unit already has, as a building block of every way (design track, full way). Every existing
image becomes an entry in the unit's `#### Images` block with the status `existing` (slide, alt text, source, licence
known or unclear). For each image the instructor chooses in one form: keep · make new in the course's style · replace
with a free photo · remove; an image with an unclear licence is preselected on "replace", never silently "keep". New
image spots are added where the instructor says so on a slide in the preview. Afterwards `:create-image {number}`
works through the open entries; missing alt texts are added. Like `:apply-theme`, it never changes teaching text — one exception: when an image is removed, the sentence that explicitly refers to it ("see figure") may be adapted, and that change is shown in the confirmation. An image that is an answer option of a quiz can only be replaced, never removed.

## Command

`:review-images {number?}` — `{number}` identifies the unit; omitted with exactly one unit, that unit; otherwise ask
which (numbered list).

## Inputs

- The unit: `journal.md` → `## Sessions` → `### {number}. {title}` and its `#### Images` block
- The unit's course file: its recorded path in the Material cell of `## Sessions` (`data/file-structure-modes.md` → Recorded paths), else the material document as that file resolves it
- `node specs/dashboard/read-source.mjs <file>`: each image with slide, alt text, target and whether it is credited
- Image style from `journal.md` → `## Visual Identity` (`__Course Image Generation Guidelines:__`)
- `tasks/create-image.md` → Journal Entry Format (entry fields, statuses, compact entries, link targets) and Free photos step 6 (the three writes, the map), read completely
- `templates/session-skeleton.yaml` → decisions (the unit's Decisions block)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/chat-memory.md`, `data/journal-links.md`

## Output

- The unit's Decisions, above `#### Images`: the dated line `images reviewed`
- The unit's `#### Images` block: one entry per image
- The course file: only image lines, alt texts, the image credits chapter and slug comments (Rules)
- `journal.md` → `## Dashboard`, with the layout suggestions as an open point

## Steps

1. **Read** the unit and its course file (Inputs); no course file yet: say so in one line and stop. Run `read-source.mjs` on the file (on its own). An image whose target already has an entry in the block keeps it: its decision is protected (`data/chat-memory.md` → Conflict) and is not asked again; only images without an entry are reviewed. A unit without any image goes on with step 4 (new spots), then step 5. With more than about 8 images announce the time honestly (about half a minute per image to look at it, as `tasks/create-image.md` → Free photos step 1) and send a status per form.
2. **Inventory:** per image one entry (`tasks/create-image.md` → Journal Entry Format; slug from the file name, unique across the journal as there, step 11):
   ```markdown
   <section>

   #### {image-slug}

   * __Status:__ existing
   * __Place:__ {page title} – {role, e.g. "picture on the slide", "option 2 of the quiz"}
   * __File:__ {target exactly as the course file has it}
   * __Alt text:__ {alt text, or the proposal of step 3}
   * __Author:__ {from the credit}
   * __License:__ {licence with link | the term of step 4}
   * __Page:__ [label](encoded file page)

   </section>
   ```
   Author, licence and page are taken **verbatim** from the image's credit line; a Wikimedia Commons image without one: `node specs/dashboard/fetch-thumb.mjs <file name>` reads them. The licence is **known** when the credit (or the file data) names one, or the instructor says it is her own picture; otherwise it is **unclear** — no credit, a credit without licence. Never guess a licence.
3. **Look at each image** (local file: the file-reading tool; Commons: the thumbnail of `fetch-thumb.mjs`) to propose a missing alt text — what is visible, never the answer term of a question. An image you could not open gets `(not looked at)` and its alt text is asked (`data/chat-checks.md` → Say how you checked). Layout ideas seen on the way (columns, boxes, a slide too full) go into the suggestion list (slide + one sentence; Rules).
4. **Decide per image** in the chat: first show the images of a form as images, each with slide, alt text and licence; then one form with **at most 4 images per form** (`data/chat-dialog.md` → Forms), one question per image: "keep" · "make new in the course's style" · "replace with a free photo" · "remove" (translated). An image with an unclear licence is **preselected on "replace"** (a photo: the free photo; a drawing or diagram: make new) and its label says "licence unclear" — never silently "keep". A clear free licence (public domain, CC0, CC BY, CC BY-SA, her own picture) defaults to "keep"; a clear but restrictive one (NC, ND, "all rights reserved") names its restriction in the label and is preselected on "replace" when the course is published (`## Course Context` → Delivery link or platform; `tasks/create-image.md` → Free photos step 3 allows only free licences there), otherwise "keep". If the instructor keeps it anyway, its `__License:__` and its line in the credits chapter both read `terms.licenseUnclearKept` ("license unclear – kept by the instructor", translated) — never a plain "unclear". **Images that are answer options of a quiz can only be replaced** (option lines `[( )]`, `[[ ]]`, `[[X]]` …): their question has no "remove". With the first form say once: for a new picture, go to the slide in the preview and write "an image here" (translated) in the chat — the agent takes the slide from the event's `context.slide` and `context.title` and records a `wanted` entry (`__Place:__` from them, `__Description:__` and `__Source:__` free-photo · generated · own asked in one form, `tasks/create-image.md` → Image spots).
5. **Summary and one confirmation** (`data/chat-dialog.md` §1, future tense): per image what happens; proposed alt texts; for "remove" the image line that goes and every sentence that explicitly refers to it ("see figure"), old → new — the only teaching text that may change; the credit lines added, changed or removed; new spots; the dated line `images reviewed`; the layout suggestions as the overview point they will become. Then "Save" · "Change something" — the one confirmation, nothing is written before it.
6. **Write** (3 writes, as `tasks/create-image.md` → Free photos step 6):
   - **Material:** one map for `node specs/dashboard/localize-journal.mjs <map.json> <course file>` (or the file once): alt texts in; for "remove" only the `![…](…)` markup out — a line that holds only the image goes whole, teaching text around an inline image stays — its reference sentence adapted and its credit line out (the image file stays on disk — never delete files); a kept unclear licence gets its credit line with `terms.licenseUnclearKept`, a newly found licence its credit line (credits chapter as in `data/file-structure-modes.md` → "Creating the material document"); above every image to replace and at every new spot the slug comment `<!--- image: {image-slug} — {description} --->` — no visible marker: the course is in use, the old image stays until its replacement is in. A quiz option image gets no comment line: its option line is its marker, and the insert replaces only the `![…](…)` inside it, keeping the option prefix (`- [( )]`, `- [[ ]]`) and its style comment.
   - **Journal:** one map: the `existing` entries (kept ones compact, together with the inserted ones, `tasks/create-image.md` → Compact once inserted); an image to replace becomes `wanted` with `__Source:__` free-photo or generated, `__Place:__`, `__Description:__`, `__Search terms:__` (free photo) and `* __Replaces:__ {old target}`; new spots as `wanted`; removed images get no entry; the line `- **{date}:** {terms.imagesReviewed}` ("images reviewed", translated; date from `node specs/dashboard/now.mjs`), exactly in this form, also for a unit without images, goes into the unit's Decisions above `#### Images` — the overview reads decision lines only before the first `####`; a unit without Decisions yet (design-track units) gets them per `templates/session-skeleton.yaml` → decisions (the `<!-- data-key="decisions" -->` comment and the translated bold label) right above `#### Images`.
   - **Overview:** run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml`; layout suggestions become one `decide` item with key `layout-suggestions-{n}`, `how` one line per suggestion (slide + one sentence) and the Teaching-Agent's `:quick-fix {n}` (`agent:teaching/quick-fix?number={n}`).
   Then "✅ Saved: …" with the marker (`data/chat-dialog.md` §1) and `node specs/dashboard/check-material.mjs <course file>` on its own; findings in plain words, "Rendered check not possible": `data/chat-checks.md` → Offering the Rendered Check.
7. **Finish** with a short summary and 1–3 next-step links: with open entries `:create-image {number}` (`agent:artist/create-image?number={number}`) for them, otherwise the Dashboard's `next` (the next unit's review or the unit check); the layout suggestions as `agent:teaching/quick-fix?number={n}` when they exist.

## Rules

- **Guard rail:** this task changes only image lines, alt texts, slug comments and the image credits chapter — never teaching text, quizzes, slide order or layout; the one exception is the reference sentence of a removed image (step 5). Layout ideas only go into the suggestion list.
- One confirmation for the whole unit. A later change of a decision (e.g. removing a kept image on the instructor's explicit wish) is a new one: steps 5–6 for that image, the material change as there, its entry removed with `{"removeBlock": "#### {image-slug}"}` (`localize-journal.mjs`).
- A unit that already has a validation report: the material write follows `tasks/quick-fix.md` → Change path after a check.
