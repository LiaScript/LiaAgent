# Task: create-visuals

## Purpose

Creates the document **Visual Style Guide**.  
Defines logo generation guidelines, course image style, website color palette, typography, and visual consistency rules.  
Ensures all visual materials across courses maintain a consistent brand identity.

## Inputs

- Title from `journal.md` → `## Outline` (`__Title:__` bullet)
- Abstract from `journal.md` → `## Outline` (`__Abstract:__` bullet)
- Professor persona from `journal.md` → `## Didactics` (`__Professor Persona:__` bullet)
- Teaching style from `journal.md` → `## Didactics` (`__Teaching Style:__` bullet)
- Difficulty level from `journal.md` → `## Didactics` (`__Difficulty Level:__` bullet)
- Course type from `journal.md` → `## Didactics` (`__Course Type:__` bullet)
- Additional preferences (optional): color schemes, visual style, brand guidelines
- Variant **From the course or a source** (below) instead of the outline and didactics: `## Course Context`, the output of `read-source.mjs` and two to three questions
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Visual Identity`
- Structure based on `templates/visuals.yaml`

## Steps

0. `## Course Context` → Track `design` (`## Outline` and `## Didactics` are marked when needed), or the instructor wants the look taken from an existing course or a source (a PowerPoint, a web page, a design guide): run the variant below instead of steps 1–13. The full way stays as written.
1. Read title and abstract from `journal.md` → `## Outline`.
2. Read professor persona, teaching style, difficulty level, and course type from `journal.md` → `## Didactics`.
3. Align visual identity with professor persona and teaching style.
   - Example: Playful persona → colorful, informal visuals
   - Example: Academic persona → formal, professional tones
   - Example: Technical style → clean, minimalist design
4. Ensure `journal.md` contains the LiaScript `@color` macro in the header comment before `# ...`:
   ```
   <!--
   color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`
   -->
   ```
   If the macro is missing, add it to the header. If it already exists, leave it unchanged.
5. Define logo generation guidelines (style, format, elements, mood) aligned with persona.
6. Establish logo color palette (primary, secondary, accent, background). Every HEX color shown in `## Visual Identity` must be wrapped as `@color(#HEXCODE)`, for example `@color(#129987)`.
7. Design course image generation guidelines (visual style, composition, lighting, mood).
8. Set image consistency rules to maintain visual coherence.
9. Define website color palette (primary, secondary, accent, neutral, semantic colors). Every HEX color shown in this palette must also use `@color(#HEXCODE)`.
10. Specify typography (headings, body text, monospace fonts) matching the course style.
11. Create example prompts for logos, images, and diagrams based on course theme.
11b. **Optional — LiaScript theme.** Only if the skill `liascript-theming` is available (see `data/skills.md`): 🎛️ offer to turn the website palette and typography into a tested LiaScript theme header — or to apply one of its bundled designs by name — (1. yes · 2. no). On yes, follow the skill to build and contrast-check the block, but do not inject it into any file yourself: store it as the `__LiaScript Theme:__` bullet (see `templates/visuals.yaml`); `promote-session` copies it into the material headers. Without the skill, skip this step silently.
12. Fill the `templates/visuals.yaml` template with the results.
13. Save the visual style guide by creating or replacing `journal.md` → `## Visual Identity`.
14. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place; then "After saving".

## Variant: From the course or a source

No `## Outline`, no `## Didactics` — the look comes from what the course already brings and the instructor's answers.

1. Read `## Course Context`: language, target group, delivery, Track and `Design scope`.
2. Read the course with `node specs/dashboard/read-source.mjs <file>` per course file (design track: the recorded path in the Material cell of `## Sessions`), or the source (`.pptx`, web page, design guide); a source excerpt `.cache/source/notes.md` is read instead of the source. Note what it brings: header styling (theme imports, CSS links, `@style` blocks — read only their colour and font values with the file-reading tool), theme colours and fonts of a `.pptx`, a logo (`logo:` in the header, a picture on the title slide).
3. One form, two to three questions, prefilled from step 2 (`data/chat-dialog.md`): the effect it should have (e.g. calm, lively, formal — options plus free text) · requirements (corporate design, school colours, a given logo, or none) · what should stay (checkbox of the colours, fonts and logo found).
4. Scope `images`: write only the image style — Course Image Generation Guidelines, Image Consistency Rules and the example image prompt — so new pictures fit; no palette, typography or theme. Scope `look` or `both` (and a source in the full way): all blocks of `templates/visuals.yaml` from the answers and what stays; an existing logo is recorded, not redesigned. The `__LiaScript Theme:__` block is required here — the overview counts the look as set only with it: build it with `liascript-theming` as in step 11b, without the skill write the header lines from the website palette and typography by hand and say they are checked after `:apply-theme`.
5. Show the whole section before saving and save with one confirmation (steps 6 and 9 apply: `@color(#HEXCODE)`, and the `@color` macro of step 4 in the journal header); then step 14.

## After saving

If course files with material exist — design track, or the full way with material documents — and the section holds a `__LiaScript Theme:__` block: offer `:apply-theme` (`agent:artist/apply-theme`) once; a new or changed look never reaches existing files otherwise, since the theme is copied only when a file is created.

## Usage

This style guide will be referenced by the Teaching-Agent when:
- Creating logos for courses (`:create-logo`)
- Generating image prompts during material co-authoring (`:coauthor-materials`)
- Designing visual elements for the published course
- Ensuring consistent branding across all course materials
