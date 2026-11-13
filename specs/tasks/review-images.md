# Task: review-images

## Purpose

Reviews the images a unit already has, as a building block of every way (design track, full way). Every existing
image becomes an entry in the unit's `#### Images` block with the status `existing` (slide, alt text, source, licence
known or unclear). For each image the instructor chooses in one form: keep · make new in the course's style · replace
with a free photo · remove; an image with an unclear licence is preselected on "replace", never silently kept. New
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
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Steps

The steps follow in the next version. Until then say so in one line and offer `:create-image {number}`
(`agent:artist/create-image?number={number}`) for the unit's open image entries.
