// Regression check for the specs: key rules found in tandem tests must not get
// lost when specs are ported or rewritten. Run from the project root:
//   node --test specs/check-specs.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { laterOf } from "./dashboard/tracks.mjs";

const specs = dirname(fileURLToPath(import.meta.url));
const read = path => readFileSync(join(specs, path), "utf8");
// The teaching agent is split (T5-111): the core read at start, and teaching-agent.nav.yaml with commands,
// coordination, skills and links, which build.py renders into CLAUDE.md. Tests of those sections read both.
const teachingAgent = () => read("agents/teaching-agent.yaml") + "\n" + (existsSync(join(specs, "agents/teaching-agent.nav.yaml")) ? read("agents/teaching-agent.nav.yaml") : "");
const agentYaml = name => name === "teaching" ? teachingAgent() : read(`agents/${name}-agent.yaml`);
const yamlCommands = text => Object.fromEntries([...(text.split(/^commands:\s*$/m)[1]?.split(/^\S/m)[0] ?? "").matchAll(/^ {2}(:[\w-]+[^:\n]*):\s*(.*)$/gm)].map(match => [match[1].trim(), match[2]]));
// The fixed start reading of an agent: its core YAML and the rule sheets read once per session at start.
const startLoad = agent => {
  const files = [`agents/${agent}-agent.yaml`, "data/agent-links.md", "data/chat-wording.md", "data/chat-language.md", "data/chat-memory.md"];
  return { files, bytes: files.reduce((sum, file) => sum + Buffer.byteLength(read(file)), 0) };
};

// File → sentences that must stay (one key phrase per rule).
const required = {
  "tasks/analyze-existing.md": ["8b. **Before saving:**", "written only after \"Save\" in step 8b"],
  "tasks/manage-templates.md": ["3b. **Before saving:**", "is a catalog `id`", "read the template's README to confirm", "ready to test", "step 1c decides (acceptance check first)", "ask whether its activity still needs a template", "yes → `open`; no → its id leaves the line, none left: `done – none needed`", "neither a brief nor an adopted entry"],
  "tasks/suggest-templates.md": ["never present a `found` or `own` entry as checked", "never write to `specs/catalog/templates.json`", "read its README before", "(in development)", "a decided activity may be reopened", "recomputed in the same write", "yes → `open`; no → its id leaves the line, none left: `done – none needed`", "is not suggested: it is adopted only through `:manage-templates {id}`", "also removes its `own` entry"],
  "tasks/develop-template.md": ["liascript-templates", "Loop:", "ready to test", "**Loop:** Repeat steps 3–5 until the instructor confirms the brief's `__Acceptance:__` points in the preview, or after 3 iterations — whichever comes first. On hitting the cap without meeting the condition: stop and report the remaining points to the instructor instead of continuing.", "Installing a Missing Skill", "Offering the Rendered Check", "agent:teaching/switch", "never invent", "This task writes only:", "`import: \"./lia-templates/{id}/README.md\"`", "the entry `{id}` in `templates.local.json` (step 6)"],
  "tasks/publish-template.md": ["confirm in the terminal", "liascript-template", "templates.local.json", "The instructor decides", "raw.githubusercontent.com/{owner}/{repo}/{tag}/README.md", "No submodule, no subtree", "`shared: \"not-offered\"`", "This task writes only:", "in **every** material", "Switch the entry `{id}` in `templates.local.json`", "`checked` = the date of the author's own check", "find.mjs \"raw.githubusercontent.com/{owner}/{repo}/\"", "rm -r .cache/catalog-pr", "the course `.gitignore` gets `.cache/`","re-verify the import, the macros and the demo", "Never `status: \"checked\"` in `templates.local.json`"],
  "tasks/save-notes.md": ["4b. **Before saving:**"],
  "tasks/open-chat.md": ["replaces the \"chat is open\"", "the one link stays the Dashboard's next"],
  "tasks/start.md": ["the pick-up sentence of its step 4 replaces the greeting"],
  "tasks/activate-section.md": ["never delete content", "**Stage 1: only full ↔ mini.**", "Never write `Track: convert` or `Track: template`", "`README.md` is **restructured in place**", "every former `##` slide becomes `###`", "**One save** for all of it", "(one material write)", "no new approval round", "{Unit} 1 is ready; the next {units} are created after the didactics."],
  "tasks/init-course.md": ["What are you planning?", "one confirmation", "<!-- state: later -->", "**Language pack first:**", "also for \"mixed\"", "is not saved", "English stay only keys that tasks read", "For a single lesson do not ask", "Ask this only once the time frame (step 4) is known", "never offer an internal threshold", "what the mapped keys change in the material", "builds LiaScript courses only — never ask for a platform", "Accessibility is not asked", "follow the course language in terminal mode too", "are the only writes allowed before the save confirmation", "Reuse what is known", "No unfounded recommendations", "two short questions in the instructor's own terms", "file structure as a **teacher question**", "Audience override", "only what the instructor answered", "**Only while `## Course Context` is still empty**", "and is **not asked**", "never overwrites a filled section of the full track", "`terms.miniSessionsNote`"],
  "tasks/scaffold-course.md": ["exactly as confirmed — its self-check ran before the draft", "**Language pack first:**", "planning sketch ✅ · material open", "Teaching style and difficulty level are not asked", "**Checks before the draft is shown,**", "plus \"Self-check before saving\" (`tasks/create-session-skeleton.md` step 7)", "Guiding figure / instructor persona", "No agenda — decided with the course frame", "8b. Set `language:`", "Draft before saving", "never compute a middle value", "grounding question", "step 10 does", "`Track: full`, `Convert mode: n/a`, `Source: n/a`"],
  "tasks/create-outline.md": ["prefill it from `## Course Context` → Units", "Start from the instructor's goal", "Repeat this time check after every revision"],
  "tasks/create-didactics.md": ["together with its `Required` elements", "in its short form", "do **not** ask the instructor", "`layout` of `templates/course-didactics.yaml`", "merge, never overwrite", "data-from=\"didactics\""],
  "tasks/create-agenda.md": ["\"Create a schedule after all?\"", "**exactly one unit row**", "unless the learners work in fixed time slots", "Net working time per time slot", "Clean up Session Type slugs before writing them", "Self-check before the summary", "If later: stop here", "do not ask about methods"],
  "tasks/create-session-skeleton.md": ["Objectives and duration of this session", "also in the terminal", "data-key", "Show the new unit", "can be solved with the material the learners get", "**Type and Method first:**"],
  "tasks/promote-session.md": ["**Existing material:**", "Done ❌", "with their task type", "**No surface cues**"],
  "tasks/coauthor-materials.md": ["asked with the approval form of `tasks/quick-fix.md`", "not for a single lesson", "**Course-wide decisions**", "never present it as checked", "Fact check before showing", "New rule → re-check", "Material ✅ means the document exists", "do not run `:promote-session` first", "never before it —", "Never search, download or verify images here", "is **not solvable** yet", "Insert images now", "controls named as the page shows them", "`- **{date}:** {decision}`", "`- **{date}:** material approved`", "(light track: the whole `README.md` is unit 1)"],
  "tasks/validate-course.md": ["exactly one unit", "**One unit, one run:**", "offer `:try-as-learner {number}` once", "(expected: the agenda's rows;", "count only the findings on this unit's chapter slides", "**Course result:** the worst of", "**Short re-check:**", "0. **Concerns only:**", "- Mechanical open: N", "**Confirm each round of fixes:**", "A required element that is **missing** is missing content", "Answer options give nothing away", "heading stands outside; everything below it is wrapped", "Items only the instructor can resolve are not in scope", "With **PASS with concerns**", "Chat summary", "result_rules", "`[advisory]` items such as the duration flag are not in scope", "Never offer \"publish anyway\"", "in both directions", "A session PASS must not hide", "**Fix during the check**", "**Required means in this unit:**", "never hold the result back", "Image options fit the learners' device", "whose `__Used in:__` names a unit", "the short re-check of step 0 included (it refreshes the summary too)", "On a light track every finding counts"],
  "checklists/course-quality-checklist.md": ["**Light tracks**", "Every unit with a skeleton has its material document", "has its credit line in the credits chapter", "`[advisory]` = computed mechanically", "[advisory] Estimated duration", "All image options of a question are visible together", "one fact, one tag", "*and* hint texts can be read aloud", "met only by this unit's own material", "no to-dos, no remarks about single images", "image-credit lines", "Every control named in a learner text", "[mechanical] No answer-pattern warning", "Distractors give no other surface cue", "names something visible in a picture", "briefs `### {id} (in development)` are exempt", "whose `__Used in:__` names a unit"],
  "data/file-structure-modes.md": ["Umlauts and ß are transliterated", "Title slide (single-file, first unit)", "`narrator:` a voice for that language", "3. **Images:**", "`import: ../../lia-templates/{id}/README.md`"],
  "tasks/create-image.md": ["`* __To do:__ none found ({date})", "Wikimedia Commons first", "unique across all units of the journal", "set `__Source:__` to the source used now", "8. **Finish:**", "work through every **open** entry", "**if a marker is already in the material**", "each marker is **one block pair**", "`<!--- image: {image-slug} — {description} --->`", "never the alt text or description", "## Free photos", "at most **3 candidates**", "never hand the search to a background agent", "`prompt-only`", "no visual identity yet", "Mark the spot in the material", "Look at every candidate before you show it", "fetch-thumb.mjs", "`(not looked at)`", "standard thumbnail width", "max-height: 30vh", "Credit lines never reveal an answer", "images {n} of {m}", "Compact once inserted", "rewrite every remaining old marker", "never from a summarizing fetch prompt", "**Texts match the chosen photo:**", "**A spot left without image:**", "**one replacement map**", "keeps its other looked-at candidates"],
  "data/skills.md": ["workflow versions"],
  "data/duration-heuristic.md": ["the middle of the estimated range", "Count a teacher-led phase once", "## Naming the estimate", "never by a name"],
  "tasks/preview.md": ["say only \"Here is the overview again.\"", "never switches the agent", "agent:{active agent}/preview", "(light track: the whole `README.md` is unit 1, slide 1)"],
  "agents/learner-agent.yaml": ["other sections only when a command names them"],
  "data/session-types.md": ["never the course's total time", "never equal the default unit words", "Objectives and duration of a session", "Never leave a check without objectives"],
  "tasks/update-dashboard.md": ["stepsOf(track, mode)", "process.later is derived", "**Process steps per track:**", "only for units whose check passed without an open ⏳ item (Done ✅) and that are approved", "6. the one-line note under `## Sessions`", "`review-{unit}-{n}`", "starts with `published` (an English key, never translated)", "The last step, publishing", "This task writes only:", "the start of every heading stays unchanged", "punctuation kept", "#3.-why-do-leaves-fall?", "write-dashboard.mjs", "**Computed by `write-dashboard.mjs`**", "do not work these out by hand", "**Words stay yours, button words come from the pack.**", "only you can judge that", "a wrong state word is fixed in the report", "Sign of life first", "Exactly one definition of \"finished\"", "**`next` names one step.**", "Link only headings outside HTML blocks", "**and the current state**", "never the unit heading", "`labels.decide` and `labels.prepare`", "**Fresh cache:**", "never this check", "**One ranking of the three measures:**", "never `plan`", "a review with fixes alone is no approval", "**Template step:**", "key `template-brief-{id}`", "the definition of \"finished\" in the note stays as it is", "German \"{n} bereit zum Ausprobieren\"", "the agenda step keeps the state it has"],
  "tasks/quick-fix.md": ["brings this form at once (one click on \"Approve\") — never a silent entry", "The change path after a check (\"Changed after the check\", the outcome suffix) does not apply there", "Every change after a check makes the unit \"short re-check open\"", "2a. **Show and confirm:**", "**Called from `:validate-course`** (fix during the check", "without one, say so in the dated line", "does not reopen a check", "Change path after a check", "**One journal write per fix:**", "Changed after the check", "never leave a done to-do standing", "Called from `:build-session`", "**Find them first:**", "**The Notes cell states the state, not a list of changes:**", "offer both variants in the same form", "short re-check open", "Change a task's type", "is searched in every unit", "**Approval after a review:**", "\"correction needed: {open} of {n} points open\"", "(light track: the whole `README.md` is unit 1)"],
  "tasks/generate-image.md": ["or `prompt-only` now that a route exists", "move every downloaded `{slug}.png`", "never send the instructor back to `:create-image` for it", "add the image `![{alt text}]({path})` below the prompt", "replace the marker", "never by its name", "Only once the file exists"],
  "tasks/build-session.md": ["**before the run starts**, right after the start confirmation", "(no looked-at candidate for a spot: insert nothing there", "where neither names one, ask it in the start confirmation", "`create-image` (Free photos) skips its \"go\" per batch", "go to step 4, which runs in every case", "names the number in its runs line", "**`free-photo` and `own`: record the spot first**", "is not blocking: the image step resolves it", "do not refresh the dashboard themselves", "prompt-only mode", "every factual statement that could not be verified", "one that makes the unit unusable for that persona", "only the named `#### Persona:` entry", "Repeat c–d", "never 1a or 1b", "ask **once in the terminal**", "**read completely when its step starts**, **together with every file its own Inputs name**", "never copy a finding, a `Required` list or a \"(from …)\" line from another unit's report", "**Open decisions first:**", "a hint, never a reason to decline the run", "**Image source per spot:**", "**Check the sketch before the start:**", "**Overview patch in the same save:**", "in parts of at most about a minute of generation each", "**Never a \"mechanical\" fix:**", "write the report **once per iteration, after the fixes of step d", "insert the best looked-at candidate **before step c**", "**One write per file for all images of the run:**", "**Runs line**", "## Writes per run", "try-as-learner?number={number}", "**Usable first:**", "**Approval stays with the instructor:**"],
  "tasks/create-project.md": ["never the assistant's own files", "1b. Only once the gate is open", "the contact address was not saved either", "never `.cache/`", "**Version:**", "**Contact address:**", "Read the repository before anything changes", "Show the plan, then confirm in the terminal", "`templates.local.json` are committed with the course content"],
  "tasks/update-project.md": ["Show the plan, then confirm in the terminal", "**Template files in the commit list:**"],
  "tasks/configure-agent.md": ["Nothing is written before it", "the entry is theirs from then on"],
  "tasks/create-learner-persona.md": ["##### 3. Learning Context", "Show the complete persona exactly as it will be saved"],
  "tasks/validate-syntax.md": ["checked only by the publishing gate", "Findings returned to a caller never contain line numbers", "is never ❌ for it"],
  "tasks/try-as-learner.md": ["a workaround for DevServer 1.2.19", "find_teacher", "a computer program plays this role", "Fallback", "Preview required", "Name each person exactly as the portrait card shows it", "**last line is the exit sentence**", "\"Back to planning\"", "one fixed sentence announcing the help", "**Name controls as the page shows them**", "**Only what the events show:**", "a hint stage counts as seen only if `hints` reached it", "**Current patterns first:**", "**course decision**", "planning conversation stays visible"],
  "data/agent-links.md": ["no status stands at all", "**Effort for the instructor**","**Order of the first reply:**","named or composed by an event","with two exceptions, both setup","**Inside an autonomous run**","at about half time with an interim result","`agent` (`:configure-agent`) is one of","`slide` is a positive integer","never material or anything the instructor wrote","Language before the frame","Lost or unseen messages","Typed answers","Temporary companion","Learner view","reply_to","reload_pending","never end a turn while announced work runs in the background","`preview` belongs to every agent","**Never for `preview`:**","**Long runs:**","tool call** is a `chat` status without a duration","never a new total","\"step {i} of {n}: …\"", "when greeting is due and the chat has entries, the pick-up of `data/chat-memory.md` replaces it"],
  "data/chat-wording.md": ["never with a word of your own such as \"helpers\"","**State words from the language pack:**","Relative day words","Name open points by their titles","never the unit heading","One way to start","**Times:**","Greetings and farewells carry no time","Read the group titles **before**","`node specs/dashboard/now.mjs [<timestamp>]`","never \"speaker\" for the play triangle ▶"],
  "data/chat-language.md": ["browser_lang"],
  "data/chat-dialog.md": ["The write scripts count their writes (`.cache/writes.json`)", "**What the instructor does not want saved**","`\"append\"` adds lines at the end of the file","Reuse what is known","Tables in the chat","Changing another section","header comment like the material header","what the instructor may do now", "(preview chat only)"],
  "data/chat-checks.md": ["`--viewport` with the window size of the learners' device","**Layout and devices:**","A missing warning is no proof","Say how you checked","*search result only*","*looked at*","*read as an extract*"],
  "data/chat-companion.md": ["**Workaround for DevServer 1.2.19 (N63):**","replaces the server's general \"stay silent\"","| wrong, `trial` 2 (before `help`) |","| `solved` after at least one wrong check |","On the self-check","with a \"Back to planning\" button"],
  "data/journal-links.md": ["preview?file=specs/catalog/README.md", "is computed by `write-dashboard.mjs`", "that choice is yours", "**Learners' view:**","never \"To unit {n}\""],
  "data/liascript-cheat-sheet.md": ["### Link targets", "A pair of `$` starts math everywhere outside code", "**The comment goes directly above the first answer line, not above the question.**", "**Matrix Quiz (graded, for matching tasks)**", "data-text-solved", "Each `#`, `##` and `###` heading **always starts a new slide**", "data-solution-button=\"false\"", "**Encode link targets.**", "**Image size.**", "`- [[?]] {|>}{Hint text}`", "A `vh` limit does not guarantee the fit", "**Controls as learners see them**", "never \"speaker\", \"loudspeaker\"", "A hint appears only when the learner taps the light bulb", "**No surface cues:**"],
  "templates/course-context.yaml": ["layout:", "Target Group"],
  "templates/course-outline.yaml": ["__Session Overview:__", "layout:"],
  "templates/course-didactics.yaml": ["key: guiding-figure (visible)", "content guidance only", "layout:"],
  "templates/course-agenda.yaml": ["layout:", "Time Budget"],
  "templates/session-skeleton.yaml": ["data-key=\"summary\"", "`write-dashboard.mjs` writes all three after every task", "→ `statusText`", "<details>", "a visible status list", "so list and table never disagree", "never relative to another optional block", "Stays 2–4 sentences", "- **{{date}}:** [Decision", "as second link after"],
  "templates/project-dashboard.yaml": ["`source: {check: n, date?}`", "Fields marked (computed) are set by `write-dashboard.mjs`", "One ranking of the three measures", "Every unit with material gets `view`", "usable: 'Once a check report exists", "view: 'Once the material exists"],
  "templates/session-material.yaml": ["heading_levels:", "its parts are `###`"],
  "templates/session-validation.yaml": ["Counts take the form of their number", "\"the point corrected\"", "also in units created later", "could not be verified", "the heading stays outside", "counts as accepted in every unit", "passed with concerns – your decision needed", "so it never blocks Done", "<section data-key=\"validation-report\">", "correction needed ({n})", "Usable with learners now", "Changed after the check", "Unit entry (journal)", "Each fact is reported once", "Never move an item between", "Accepted concerns", "never a blanket", "**Method Consistency:**", "**Duration (advisory):**", "**Reference Check:**", "**Templates:**", "passed – still missing: {what}", "never a command or step name as subject", "One wording per state", "short re-check open", "\"correction needed: {open} of {n} points open\"", "`outdatedTerms`", "`units[].usable`"],
  "templates/journal.md": ["\"title\": \"Publish\"", "journal-start", "## Publishing", "Still empty", "__Template selection:__ open", "agent:teaching/suggest-templates", "agent:teaching/preview?file=specs/catalog/README.md"],
  "templates/course-templates.yaml": ["template-brief", "(in development)", "__Template selection:__", "__Catalog id:__", "__Source:__"],
  "templates/course-outline.yaml": ["Session Overview"],
  "templates/course-agenda.yaml": ["Time Budget"],
  "templates/course-didactics.yaml": ["Didactic Framework", "copied from Course Context"],
  "templates/course-context.yaml": ["Target Group"],
  "workflows/course-development.yaml": [":try-as-learner", "offer :try-as-learner once (only with the preview / MCP gate open)", "change path", "One way to start", "write-dashboard.mjs"],
  "agents/teaching-agent.yaml": ["never read a section marked when needed", "once per command, before its first Dashboard write", "only if they do not already arrive as `<channel>` tags", "the labels, the first reply and its one action need them", ":try-as-learner", "once (only when the MCP gate is open; it runs in the preview)", "starts with `## Outline`", "read a task file **completely**", "`node specs/dashboard/now.mjs [<timestamp>]`", "`develop-template` changes only `__State:__` and `__Folder:__`"],
};

// Phrases match regardless of line breaks and indentation, so rewrapping a paragraph keeps them.
const flat = text => text.replace(/\s+/g, " ");
for (const [file, phrases] of Object.entries(required)) {
  test(`${file} keeps its key rules`, () => {
    assert.ok(existsSync(join(specs, file)), `${file} is missing`);
    const text = flat(file === "agents/teaching-agent.yaml" ? teachingAgent() : read(file));
    for (const phrase of phrases) assert.ok(text.includes(flat(phrase)), `${file} lost: "${phrase}"`);
  });
}

const walkSpecs = (dir = specs) => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? (name === "node_modules" || name === ".cache" ? [] : walkSpecs(path)) : [path];
});

test("a reference `data/<sheet>.md` → Name finds a heading or bold rule name in that sheet", () => {
  const simple = text => text.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[*"„“”'’:.]/g, "").replace(/\s+/g, " ").trim();
  const namesOf = sheet => {
    const text = read(`data/${sheet}`);
    return [...text.matchAll(/^#+\s+(.+)$/gm), ...text.matchAll(/\*\*([^*\n]+)\*\*/g)].map(match => simple(match[1])).filter(Boolean);
  };
  const broken = [];
  for (const path of walkSpecs().filter(item => /\.(md|ya?ml)$/.test(item))) {
    for (const match of readFileSync(path, "utf8").matchAll(/data\/([a-z-]+\.md)`? → ("([^"\n]+)"|[^"`,;:()—\n]+)/g)) {
      if (!existsSync(join(specs, "data", match[1]))) { broken.push(`${path.slice(specs.length + 1)}: data/${match[1]} does not exist`); continue; }
      const name = simple((match[3] ?? match[2]).split(" → ")[0]);
      if (!name) continue;
      const names = namesOf(match[1]);
      if (!names.some(rule => name.startsWith(rule) || rule.startsWith(name))) broken.push(`${path.slice(specs.length + 1)}: data/${match[1]} → ${name}`);
    }
  }
  assert.deepEqual(broken, [], "a rule was renamed or removed – rename the reference too");
});

// Word budgets: the cleanup after tandem test 4 moved computed rules into scripts. A budget keeps the text from
// growing back; raise one only with a reason (a new rule no script can carry, e.g. the `start` setup, the read lists of build-session and validate-course after R12/R12b, measured durations and agreements after R12c).
const budgets = {
  "tasks/update-dashboard.md": 3275, /* +110 over 3005: process steps per track, the two new triggers; +145 over 3115 (tandem test 5): decide only for now, no approval item for an approved unit, report actions → prepare, old Course Context words in the cache; +15 over 3260 (stage 2a T8): the design track's step list with its titles "Frame" and "Images" and the scope rule */ "data/agent-links.md": 4090, /* +23: chat-memory sheet row and pointer; +15 over 3898: the pick-up replaces the due greeting; +177 over 3913 (tandem test 5): idle watch, nudge, status after a form answer, "your answer has arrived", read_chat without arguments */ "data/chat-wording.md": 1165, "data/chat-dialog.md": 1480, /* +35 over 1191: the save marker rule; +3 over 1226: marker in the preview chat only; +251 over 1229 (tandem test 5): no ruled-out options, saved state from the journal, to-do answer = overview, side questions without a new form, no number columns, removeBlock */
  "data/chat-checks.md": 637, "tasks/build-session.md": 3367, "tasks/validate-course.md": 4420, /* +89 over 4198: one unit, one run on a light track; +31 over 4287: light-track unit 1 in session mode, short re-check refreshes the summary; +102 over 4318 (tandem test 5): the unit check is the course check, the summary follows every later report change */ "tasks/quick-fix.md": 1750, /* +8 over 1613: light track, the whole README is unit 1; +129 over 1621 (tandem test 5): "look at it later", re-check sets Done, approval refreshes the summary, removeBlock */
};
test("commands never stand in the chat, only in journal.md after their link", () => {
  assert.match(read("data/chat-wording.md"), /\*\*Commands stay off the chat:\*\*[^\n]*\n[^\n]*also not after a link/);
  assert.match(read("data/agent-links.md"), /In the chat a link stands without its command/);
  assert.match(read("data/journal-links.md"), /In chat offers: the link, then ` — ` plus a short reason, without the command/);
  for (const sheet of ["data/agent-links.md", "data/chat-wording.md", "data/chat-dialog.md", "data/journal-links.md"]) {
    assert.doesNotMatch(read(sheet), /inline command after a link is optional|except as the inline code right after an action link/, `${sheet} allows a command in the chat again`);
  }
});

test("start: the first command after liadev init creates the empty journal, opens the browser and greets in the chat", () => {
  const task = read("tasks/start.md");
  for (const phrase of ["`cp specs/templates/journal.md journal.md`", "run `liadev init` in this folder first", "`tasks/open-chat.md` steps 2–5", "Language before the frame", "Do not start a server yourself"]) assert.ok(task.includes(phrase), `tasks/start.md lost: ${phrase}`);
  const yaml = teachingAgent();
  assert.match(yaml, /^ {2}:start: "run task `tasks\/start\.md`/m);
  assert.match(yaml, /on_activation:\n\s+- "If the instructor's first message is only `start`/, "start is the first activation rule");
  assert.match(read("data/agent-links.md"), /\| \*\*run\*\* \|[^\n]*`start`/);
  assert.match(read("data/agent-links.md"), /`liadev init` in an empty folder/);
});

test("build-session reads what its check step needs: every file the Inputs of validate-course name (R12-SP101)", () => {
  const inputs = read("tasks/validate-course.md").split("## Inputs")[1].split("\n## ")[0];
  const files = [...inputs.matchAll(/^- `((?:checklists|templates|data|tasks)\/[^`]+)`/gm)].map(match => match[1])
    .filter(file => !["tasks/update-dashboard.md", "templates/project-dashboard.yaml"].includes(file));
  assert.ok(files.length >= 6, `validate-course names its inputs (${files.join(", ")})`);
  const build = read("tasks/build-session.md");
  const stepC = build.split(/^c\. /m)[1]?.split(/^d\. /m)[0] ?? "";
  const known = build.split("## Inputs")[1].split("\n## ")[0] + stepC;
  assert.deepEqual(files.filter(file => !known.includes(file)), [], "build-session does not name these inputs of its check step");
  assert.match(stepC, /\*\*Read first, completely\*\*/);
});

test("validate-course marks the files of the check as read completely, so the re-read rule covers them (R12b-SP111)", () => {
  const inputs = read("tasks/validate-course.md").split("## Inputs")[1].split("\n## ")[0].split("\n");
  for (const file of ["checklists/course-quality-checklist.md", "tasks/validate-syntax.md", "data/duration-heuristic.md", "data/didactic-methods.md", "templates/session-validation.yaml"]) {
    const line = inputs.find(item => item.startsWith(`- \`${file}\``)) ?? "";
    assert.match(line, /read completely/, `${file} is not marked "read completely" in the Inputs of validate-course`);
  }
});

test("chat memory: the chat is picked up after a restart from the last save marker (leichte Straenge T6)", () => {
  const sheet = read("data/chat-memory.md");
  for (const phrase of ["the newest entry with a `<!--- saved: … --->` marker", "offer to save, never write it silently", "the journal wins", "nothing counts as saved", "asked again", "only if the journal does not already hold its answer", "name it, do not ask", "a chat promise never reopens them"]) assert.ok(sheet.includes(phrase), `data/chat-memory.md lost: ${phrase}`);
  assert.match(read("data/agent-links.md"), /data\/chat-memory\.md/);
  assert.match(read("data/agent-links.md"), /\| `data\/chat-memory\.md` \|/, "the Rule sheets table lists chat-memory.md");
  assert.ok(read("data/chat-dialog.md").includes("ends with `<!--- saved: {what} --->` as its last line") && read("data/chat-dialog.md").includes("never in a message without a save"), "chat-dialog.md carries the save marker rule");
  for (const task of ["tasks/start.md", "tasks/open-chat.md"]) assert.match(read(task), /data\/chat-memory\.md/, `${task} does not name chat-memory.md`);
  assert.match(teachingAgent(), /\(5\) `read_chat` without arguments:[^"]*data\/chat-memory\.md/);
  // R5/R6: the rule "no arguments" must stand where read_chat is called, not only in the sheet read after the call (T5-106).
  for (const task of ["tasks/start.md", "tasks/open-chat.md"]) assert.match(read(task), /`read_chat` without arguments/, `${task} calls read_chat without "without arguments"`);
});

test("rule sheets and the main tasks stay within their word budget", () => {
  const over = Object.entries(budgets).map(([file, max]) => [file, read(file).split(/\s+/).filter(Boolean).length, max]).filter(([, words, max]) => words > max);
  assert.deepEqual(over.map(([file, words, max]) => `${file}: ${words} words > ${max}`), []);
});

test("material paths use the title slug, never the session type", () => {
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const hits = walk(specs).filter(path => /\.(md|ya?ml)$/.test(path))
    .flatMap(path => readFileSync(path, "utf8").split("\n").map(line => [path, line]))
    .filter(([, line]) => /\{\{?number\}?\}-\{\{?type\}?\}/.test(line) && !/legacy/.test(line));
  assert.deepEqual(hits.map(([path, line]) => `${path.slice(specs.length + 1)}: ${line.trim()}`), []);
});

test("the workflow quick reference lists every agent command with its signature", () => {
  const generic = new Set([":agent", ":help", ":exit", ":list-agents"]);
  const workflow = read("workflows/course-development.yaml");
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    const keys = [...agentYaml(agent).matchAll(/^\s{2}(:[\w-]+[^:\n]*):/gm)].map(match => match[1].trim())
      .filter(key => !generic.has(key.split(" ")[0]));
    const list = workflow.split(`${agent}_agent_commands:`)[1]?.split(/\n\s*\n/)[0] ?? "";
    const listed = [...list.matchAll(/^\s*- (:.+)$/gm)].map(match => match[1].trim());
    assert.deepEqual(keys.filter(key => !listed.includes(key)), [], `${agent}: missing in quick_reference`);
    assert.deepEqual(listed.filter(key => !keys.includes(key) && !generic.has(key.split(" ")[0])), [], `${agent}: unknown in quick_reference`);
  }
});

test("the Development-Agent builds and publishes own templates: commands, tiers, triggers, hand-back", () => {
  const agent = read("agents/development-agent.yaml");
  assert.match(agent, /^  title: Git, Templates & Publishing Assistant$/m);
  for (const key of [":develop-template {id}", ":publish-template {id}"]) assert.ok(agent.includes(`  ${key}: "run task \`tasks/${key.slice(1).split(" ")[0]}.md\``), `development-agent.yaml lacks ${key}`);
  assert.ok(agent.includes("agent:teaching/switch"), "development-agent.yaml does not hand back with agent:teaching/switch");
  const tiers = read("data/agent-links.md").split("\n");
  assert.ok(tiers.find(line => line.startsWith("| **confirm in chat**"))?.includes("`develop-template`"), "develop-template is not confirm in chat");
  assert.ok(tiers.find(line => line.startsWith("| **confirm in terminal**"))?.includes("`publish-template`"), "publish-template is not confirm in terminal");
  const triggers = read("tasks/update-dashboard.md").split("## Automatic Trigger")[1]?.split("\n## ")[0] ?? "";
  for (const task of ["develop-template", "publish-template"]) {
    assert.ok(read(`tasks/${task}.md`).includes("tasks/update-dashboard.md"), `${task} does not run update-dashboard`);
    assert.ok(triggers.includes(`:${task}`), `${task} is missing in the update-dashboard trigger list`);
  }
  assert.match(teachingAgent(), /`:publish-template`[^"]*`gh repo create`[^"]*`gh repo fork`[^"]*`gh pr create`[^"]*`rm -r \.cache\/catalog-pr`/, "shell list lacks the named git/gh calls of publish-template");
  assert.doesNotMatch(teachingAgent(), /the others its plan lists/, "the shell list names the publish-template commands, not 'the others'");
  const readme = read("../README.md");
  for (const key of [":develop-template {id}", ":publish-template {id}"]) assert.ok(readme.includes(`\`${key}\``), `README.md lacks ${key}`);
  assert.match(readme, /\| `liascript-templates` \| 🛠️ Development \|[^\n]*`:develop-template`/, "README.md skills table lacks the Development row");
  // The roster label covers templates and publishing, in English and German alike.
  assert.ok(read("data/agent-links.md").includes('"Development assistant"'), "agent-links.md: the Development label example");
  assert.equal(JSON.parse(read("templates/i18n/de.json")).labels.development, "Entwicklungsassistent", "de.json: the Development label");
  assert.match(read("catalog/README.md"), /`\.\/lia-templates\/\{id\}\/README\.md`/, "the catalog's data format lacks the local import of own templates");
});

test("every task file an agent's commands run exists", () => {
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    const files = [...agentYaml(agent).matchAll(/run task `(tasks\/[\w-]+\.md)`/g)].map(match => match[1]);
    assert.deepEqual([...new Set(files)].filter(file => !existsSync(join(specs, file))), [], `${agent}-agent.yaml runs a task file that does not exist`);
  }
});

test("the mini course: unit 1 in ## Sessions, one save, the unit check covers the course (leichte Straenge T7)", () => {
  const task = read("tasks/create-mini-course.md");
  const inputs = task.split(/^## Inputs[^\n]*\n/m)[1]?.split(/^## /m)[0] ?? "";
  assert.match(inputs, /Rule sheets, read completely with this task \(`data\/agent-links\.md` → Chat Conduct → Rule sheets\): `data\/chat-dialog\.md`, `data\/chat-checks\.md`, `data\/journal-links\.md`/);
  assert.match(inputs, /`tasks\/coauthor-materials\.md`[^\n]*read completely/);
  assert.ok(task.includes("tasks/update-dashboard.md"), "create-mini-course does not run update-dashboard");
  const triggers = read("tasks/update-dashboard.md").split("## Automatic Trigger")[1]?.split("\n## ")[0] ?? "";
  assert.ok(triggers.includes(":create-mini-course"), "create-mini-course is missing in the update-dashboard trigger list");
  assert.match(read("agents/teaching-agent.yaml"), /^ {4}- create-mini-course\.md$/m, "teaching-agent.yaml dependencies lack create-mini-course.md");
  // The first Dashboard write after the mini save replaces the empty journal's steps with the track's list.
  assert.match(read("tasks/init-course.md"), /replaces `process\.steps` with the steps of the mini track/);
  assert.match(read("tasks/activate-section.md"), /the overview's step list follows the new track \(`tasks\/update-dashboard\.md` → Rules → Process steps per track\)/);
  // The light-track exceptions of the check stand in the checklist, which validate-course applies completely.
  assert.match(read("checklists/course-quality-checklist.md"), /\*\*Light tracks\*\*[^\n]*marked when needed[^\n]*no finding/);
  assert.match(read("data/file-structure-modes.md"), /the whole file is unit 1/);
  assert.match(read("data/journal-links.md"), /\| `## Sessions` \|[^\n]*light tracks[^\n]*`create-mini-course`/);
});

test("a task that runs only in a light track names no section its track marks when needed in its Inputs", () => {
  // Task → the tracks (and convert modes) it runs in. Files that do not exist yet are skipped.
  const tracks = { "tasks/create-mini-course.md": [["mini"]], "tasks/convert-course.md": [["convert", "transfer"], ["convert", "rebuild"]], "tasks/start-template.md": [["template"]] };
  for (const [file, runs] of Object.entries(tracks)) {
    if (!existsSync(join(specs, file))) continue;
    const inputs = read(file).split(/^## Inputs[^\n]*\n/m)[1]?.split(/^## /m)[0] ?? "";
    for (const [track, mode] of runs) for (const key of laterOf(track, mode)) {
      assert.doesNotMatch(inputs, new RegExp(`## ${key}\\b`), `${file}: its Inputs name ## ${key}, which the ${track}${mode ? ` (${mode})` : ""} track marks when needed`);
    }
  }
});

test("design track: the follow-up question, the frame and its markers (stage 2a)", () => {
  const init = read("tasks/init-course.md");
  for (const phrase of ["What should get better?", "## Design Track", "`node specs/dashboard/read-source.mjs .`", "Design scope", "never changes teaching text", "| design | Outline, Didactics, Agenda, Learner Personas, Analysis Status |"]) assert.ok(init.includes(phrase), phrase);
  // The markers table copies tracks.mjs verbatim: the mini and design rows are the lists of laterOf.
  for (const track of ["mini", "design"]) assert.ok(init.includes(`| ${track} | ${laterOf(track).join(", ")} |`), `init-course: the ${track} row of the markers table differs from laterOf("${track}")`);
  assert.match(read("templates/course-context.yaml"), /Design scope: \[look \| images \| both \| n\/a\]/);
  assert.match(read("data/file-structure-modes.md"), /Recorded paths[\s\S]*design track/);
  assert.match(read("tasks/update-dashboard.md"), /design: Frame → Look → Images → Check → Publish/);
});

test("preview is a navigation command of every agent", () => {
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    assert.match(agentYaml(agent), /^  :preview \{file\?\} \{slide\?\}:/m, `${agent} has no :preview`);
  }
});

test("open-chat is a navigation command of every agent and opens a collapsed chat", () => {
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    assert.match(agentYaml(agent), /^  :open-chat: "run task `tasks\/open-chat\.md`/m, `${agent} has no :open-chat`);
  }
  const task = read("tasks/open-chat.md");
  assert.match(task, /A `chat` message also unfolds a collapsed\s+chat/);
  assert.match(task, /Do not start\s+a server yourself/);
  assert.match(task, /never writes `journal\.md`/);
  assert.match(task, /opens the instructor's\s+default browser/);
  assert.match(task, /Do not open it in a browser-automation window instead/);
  assert.match(task, /if\s+`connected` is still `false`, give `get_state\.url` in the terminal/);
  assert.match(read("data/agent-links.md"), /\| \*\*run\*\* \|[^\n]*`open-chat`/);
});

test("Artist tasks that write journal.md refresh the dashboard and are listed as its triggers", () => {
  const triggers = read("tasks/update-dashboard.md").split("## Automatic Trigger")[1]?.split("\n## ")[0] ?? "";
  for (const task of ["create-visuals", "create-logo", "create-image", "generate-image"]) {
    assert.ok(read(`tasks/${task}.md`).includes("tasks/update-dashboard.md"), `${task} does not run update-dashboard`);
    assert.ok(triggers.includes(`:${task}`), `${task} is missing in the update-dashboard trigger list`);
  }
});

test("the workflow matches the dashboard path: work out together first, build-session after one approved unit", () => {
  const workflow = read("workflows/course-development.yaml");
  assert.ok(!workflow.includes('":create-session", ":promote-session"'), "a course path still promotes before co-authoring");
  assert.ok(!/dependencies: \[create_didactics, create_visuals\]/.test(workflow), "the agenda depends on the optional visual identity again");
  assert.match(workflow, /- command: :build-session \{number\}/, "build-session is missing in the session development sequence");
  assert.match(workflow, /Creates the material document at the first Save/, "coauthor-materials no longer creates the material in the workflow");
});

test("templates and tasks agree on fields: agent subsections, agenda summary, delivery format, check scripts", () => {
  const agents = read("templates/agents.yaml");
  for (const id of ["coauthor", "teaching-agent", "artist-agent", "development-agent", "learner-personas"]) {
    assert.match(agents, new RegExp(`- id: ${id}\\n`), `templates/agents.yaml has no own section ${id}`);
  }
  assert.ok(!/learning objectives?, summary/i.test(read("tasks/create-agenda.md") + read("tasks/validate-course.md") + read("checklists/course-quality-checklist.md")), "the agenda asks for a summary it has no place for");
  assert.ok(!read("tasks/create-didactics.md").includes("Set the delivery format"), "create-didactics sets a delivery format without a field");
  assert.ok(!read("dashboard/check-material.mjs").includes('"/usr/bin/chromium"'), "check-material.mjs hard-codes the browser path");
  assert.match(read("data/duration-heuristic.md"), /For a single-lesson/, "reading pace for a single-lesson is undefined");
});

test("no task reads objectives or duration only from the agenda, and ### is a slide", () => {
  for (const file of ["tasks/validate-course.md", "tasks/coauthor-materials.md", "data/duration-heuristic.md", "checklists/course-quality-checklist.md", "tasks/build-session.md", "tasks/review-as-persona.md"]) {
    assert.ok(!/(objectives?|duration)[^\n]{0,40}(from|in) `journal\.md` → `## Agenda`/i.test(read(file)) && !/`## Agenda` to get the learning objectives/.test(read(file)), `${file} reads objectives or duration only from the agenda`);
  }
  assert.ok(!read("data/liascript-cheat-sheet.md").includes("does not start a new slide"), "the cheat sheet says ### stays on the slide again");
});

test("cheat sheet quiz examples put the attribute comment above the options and hints unindented", () => {
  const sheet = read("data/liascript-cheat-sheet.md");
  for (const block of sheet.match(/```lia\n[\s\S]*?```/g) ?? []) {
    const lines = block.split("\n");
    lines.forEach((line, i) => {
      if (/^<!-- data-(hint-button|max-trials|solution-button|text-)/.test(line)) {
        assert.match(lines[i + 1] ?? "", /^(- )?\[/, `quiz comment not directly above the options:\n${block}`);
      }
      assert.ok(!/^\s+\[\[\?\]\]/.test(line), `indented hint:\n${block}`);
    });
  }
  assert.ok(!sheet.includes("cannot be changed per quiz"), "the cheat sheet says feedback texts are fixed again");
});

test("skills are detected by their installed names; old names only as aliases", () => {
  const files = ["data/skills.md", "agents/teaching-agent.yaml", "agents/teaching-agent.nav.yaml", "agents/development-agent.yaml", "tasks/create-project.md", "tasks/update-project.md", "tasks/manage-templates.md", "tasks/suggest-templates.md", "tasks/develop-template.md", "tasks/publish-template.md"];
  for (const file of files) {
    for (const old of ["exporter-workflow", "template-development"]) {
      const lines = read(file).split("\n").filter(line => line.includes(old) && !/older name/.test(line));
      assert.deepEqual(lines, [], `${file} still detects the old skill name ${old}`);
    }
  }
  assert.match(read("data/skills.md"), /`liascript-exporter`/);
});

test("skills and Playwright are installed only after consent, project-local, asked once", () => {
  const skills = read("data/skills.md");
  assert.match(skills, /ask once per\s+conversation/);
  for (const phrase of ["never `-g`", "npx -y skills add LiaScript/skills --skill <name> --agent <agent> --yes", "confirm in terminal", "skills-lock.json", ".gitignore"]) assert.ok(skills.includes(phrase), `data/skills.md lost: ${phrase}`);
  const checks = read("data/chat-checks.md");
  for (const phrase of ["no installed Playwright found", "has no browser of its own", "npm i -D playwright", "npx playwright install chromium", "npm init -y", "`--with-deps`"]) assert.ok(checks.includes(phrase), `data/chat-checks.md lost: ${phrase}`);
  assert.match(checks, /not for\s+every exit code 2/);
  assert.match(read("tasks/build-session.md"), /before the start confirmation run `node specs\/dashboard\/check-material\.mjs[^\n]*ask once in the terminal \*\*before the run starts\*\*/i);
  for (const file of ["agents/teaching-agent.nav.yaml", "agents/development-agent.yaml", "agents/artist-agent.yaml"]) assert.match(read(file), /Installing a Missing Skill/, `${file} does not point to the install rule`);
  for (const file of ["tasks/coauthor-materials.md", "tasks/quick-fix.md", "tasks/validate-course.md", "tasks/build-session.md"]) assert.match(read(file), /Offering the Rendered Check/, `${file} does not point to the Playwright offer`);
  assert.match(teachingAgent(), /npm i -D playwright/, "shell list lacks the installs");
  assert.match(read("data/agent-links.md"), /skill and Playwright installs/, "tier table lacks the installs");
  for (const file of ["data/skills.md", "agents/teaching-agent.yaml", "agents/teaching-agent.nav.yaml", "agents/development-agent.yaml", "agents/artist-agent.yaml", "tasks/create-project.md", "tasks/update-project.md", "../README.md"]) assert.doesNotMatch(read(file), /never install/i, `${file} still forbids installing`);
});

test("authoring notes in the journal template are <!--- … ---> so LiaScript ignores them", () => {
  const journal = read("templates/journal.md");
  const plain = [...journal.matchAll(/<!--(?!-)([\s\S]*?)-->/g)].slice(1)
    .map(match => match[1].trim()).filter(body => !/^(class|data-[\w-]+)=/.test(body));
  assert.deepEqual(plain.map(body => body.slice(0, 60)), []);
  for (const sheet of ["data/agent-links.md", "data/journal-links.md", "data/chat-dialog.md", "data/chat-wording.md"]) assert.ok(!read(sheet).includes("materials/03-"), `${sheet} shows a zero-padded folder number again`);
});

test("the course is always LiaScript: no platform or accessibility question, no accessibility field", () => {
  for (const file of ["tasks/init-course.md", "tasks/scaffold-course.md", "templates/course-context.yaml", "templates/journal.md"]) {
    assert.ok(!/Accessibility: (\[|\{\{)?required/.test(read(file)), `${file} asks for or stores accessibility again`);
  }
});

test("one unit word (no lectures-called), no early build link, cp only for the empty journal", () => {
  for (const file of ["tasks/init-course.md", "templates/course-context.yaml", "templates/journal.md", "data/session-types.md", "tasks/create-didactics.md", "checklists/course-quality-checklist.md"]) {
    assert.ok(!read(file).includes("lectures-called"), `${file} still uses lectures-called`);
  }
  assert.ok(!read("templates/session-skeleton.yaml").includes("agent:teaching/build-session"), "the skeleton offers build-session before an approved unit");
  assert.match(teachingAgent(), /`cp specs\/templates\/journal\.md journal\.md`/);
});

test("leftovers of the first test round stay fixed", () => {
  assert.ok(!read("tasks/init-course.md").includes("Until step 7 is saved"), "init-course names the wrong save step");
  for (const file of ["tasks/init-course.md", "tasks/scaffold-course.md"]) {
    assert.match(read(file), /read_chat`? when the preview is connected/, `${file} requires read_chat in the terminal`);
  }
  const agent = read("agents/teaching-agent.yaml");
  for (const data of ["session-types.md", "didactic-methods.md", "duration-heuristic.md", "file-structure-modes.md"]) {
    assert.ok(agent.includes(`    - ${data}`), `teaching-agent.yaml dependencies miss ${data}`);
  }
  const artistLines = read("templates/journal.md").split("\n").filter(line => line.includes("](agent:artist/"));
  assert.deepEqual(artistLines.filter(line => /(?<!→ )`:create-(visuals|logo)`/.test(line)), [], "an action line shows an Artist command without :agent artist");
  assert.match(read("tasks/validate-course.md"), /- Mode: course/);
});

test("the required-elements key is English; the German Erforderlich is only read in older journals", () => {
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const hits = walk(specs).filter(path => /\.(md|ya?ml)$/.test(path) && !path.endsWith("example-project.yaml"))
    .flatMap(path => readFileSync(path, "utf8").split("\n").map(line => [path, line]))
    .filter(([, line]) => line.includes("Erforderlich") && !/older journals use `Erforderlich:`/.test(line));
  assert.deepEqual(hits.map(([path, line]) => `${path.slice(specs.length + 1)}: ${line.trim().slice(0, 80)}`), []);
});

test("session methods are chosen by the agent, never asked for per session", () => {
  const methods = read("data/didactic-methods.md");
  for (const old of ["confirms or changes it", "confirms, edits, or opts out", "default pre-selected"]) {
    assert.ok(!methods.includes(old), `data/didactic-methods.md still says "${old}"`);
  }
  assert.ok(!/Ask per session/i.test(read("tasks/create-agenda.md")), "create-agenda asks per session again");
});

test("reports inside sessions and the course summary use bold labels, not ##### headings", () => {
  for (const file of ["tasks/review-as-persona.md", "tasks/validate-course.md", "templates/session-validation.yaml"]) {
    const headings = read(file).split("\n").filter(line => /^\s*#{5,6}\s/.test(line));
    assert.deepEqual(headings, [], `${file} writes ##### headings`);
  }
});

test("the check report: course-language heading per unit, found by its key, placed behind the skeleton", () => {
  const template = read("templates/session-validation.yaml");
  const heading = template.match(/id: report-heading[\s\S]*?template: \|\n\s+(#### .*)/)?.[1] ?? "";
  assert.ok(heading && !/Validation Report/.test(heading), `report heading carries the English key: ${heading}`);
  assert.match(heading, /\{\{number\}\}/, "report heading is not unique per unit");
  assert.match(template, /<section data-key="validation-report">/);
  const order = read("templates/session-skeleton.yaml").match(/entry_order: >-([\s\S]*?)\n  title:/)?.[1] ?? "";
  assert.ok(order.indexOf("References") >= 0 && order.indexOf("References") < order.indexOf("the validation report"), "the report must follow the skeleton fields");
  assert.ok(order.indexOf("the validation report") < order.indexOf("#### Images"), "the report comes before #### Images");
  assert.ok(!read("tasks/validate-course.md").includes("The report heading is always `#### Validation Report`"));
});

test("no persona or scenario data from tandem tests in the specs", () => {
  // Scenario words of the tandem tests (German and English) and their test setup. Devices such as tablets are
  // legitimate examples; "beehive" is a theme name of the theming skill.
  const words = /\b(biene\w*|bienenvolk|sabine|jonas|frida|frieda|summi|krüger|merian|wochenplan|pollen\w*|bees?|honeybees?|nektar|3029|3030|9333|testlauf)\b|queen_bee|test[34]\//i;
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const generated = ["CLAUDE.md", "AGENTS.md", "README.md", ".windsurfrules", ".cursor/rules/agent.md", ".github/copilot-instructions.md", "dist/web-bundle.md"]
    .map(name => join(specs, "..", name)).filter(path => existsSync(path));
  const hits = [...walk(specs), ...generated].filter(path => /\.(md|ya?ml|mjs|js|json)$|windsurfrules$/.test(path) && !path.endsWith("check-specs.mjs") && !path.includes("/fixtures/"))
    .filter(path => words.test(readFileSync(path, "utf8")));
  assert.deepEqual(hits.map(path => path.slice(specs.length + 1)), []);
});

function checkJournal(text, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "journal-"));
  const file = join(dir, "journal.md");
  writeFileSync(file, text);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  const run = spawnSync(process.execPath, [join(specs, "dashboard", "validate-journal.mjs"), file], { encoding: "utf8" });
  return { status: run.status, output: run.stdout + run.stderr };
}

// A small journal with two units, an agenda and a session with a validation report.
function journal({ agenda, outcome = "**Outcome:** passed (2026-10-19)", units = 2, context = "", didactics = "", decisions } = {}) {
  const data = { title: "X", ...(decisions ? { decisions } : {}), units: Array.from({ length: units }, (_, i) => ({ id: String(i + 1), title: `U${i + 1}`, state: "planned", ...(i === 0 ? { href: "#1.-intro" } : {}) })) };
  return ["<!--\nlanguage: fr\n-->", "# X", "## Course Context", context, "## Didactics", didactics,
    "## Dashboard", "```json @Dashboard.View", JSON.stringify(data), "```",
    "## Agenda", agenda ?? [
      "__Time Budget – Budget :__", "", "| 1 | 90 min − 10 min = 80 min |", "", "<!-- data-type=\"none\" -->",
      "  | No. | Titre | Durée |", "  |---|---|---|", ...Array.from({ length: units }, (_, i) => `  | ${i + 1} | U${i + 1} | 45 min |`), "",
      "<details><summary>Réglages techniques</summary>", "", "| No. | type | material |", "|---|---|---|",
      ...Array.from({ length: units }, (_, i) => `| ${i + 1} | module | materials/${i + 1}-module/README.md |`), "", "</details>"].join("\n"),
    "## Sessions", "### 1. Intro", "#### Validation Report – Rapport de validation", outcome, "",
    "<details><summary>Rapport technique</summary>", "", "__Result:__ PASS", "", "</details>"].join("\n\n");
}

test("the empty journal template passes the journal check", () => {
  const run = checkJournal(read("templates/journal.md"));
  assert.equal(run.status, 0, run.output);
});

test("the journal check counts only the visible units table of the agenda", () => {
  const ok = checkJournal(journal());
  assert.equal(ok.status, 0, ok.output);
  const fewer = checkJournal(journal({ units: 3 }).replace("  | 3 | U3 | 45 min |\n", ""));
  assert.equal(fewer.status, 2, fewer.output);
  assert.match(fewer.output, /the agenda has 2 rows, the dashboard shows 3 units/);
});

test("open points never repeat the dashboard's group names", () => {
  for (const title of ["Vor dem Einsatz vorbereiten: Kopfhörer", "Prepare before use: headphones"]) {
    const run = checkJournal(journal({ decisions: [{ title, kind: "prepare", how: "x" }] }));
    assert.equal(run.status, 2, run.output);
    assert.match(run.output, /repeats the group name/);
  }
});

test("the journal check tells line references from content that mentions rows", () => {
  const content = checkJournal(journal({ outcome: "**Outcome:** passed (2026-10-19)\n\n**What works:**\n\n- The exercise sums Zeile 6 of the table" }));
  assert.equal(content.status, 0, content.output);
  for (const cited of ["- Missing alt text (Zeile 12)", "- Missing alt text in line 12", "- Missing alt text, Z. 12"]) {
    const run = checkJournal(journal({ outcome: `**Outcome:** passed (2026-10-19)\n\n**Still missing:**\n\n${cited}` }));
    assert.equal(run.status, 2, `${cited}: ${run.output}`);
  }
});

test("the Done check finds the column also when the header is translated", () => {
  const table = "| # | Titre | Type | Squelette | Matériel | Fait | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | module | ✅ | ✅ | ✅ | |";
  const failed = journal().replace("## Sessions\n\n", `## Sessions\n\n${table}\n\n`).replace("__Result:__ PASS", "__Result:__ FAIL");
  const run = checkJournal(failed, { "materials/1-intro/README.md": "# Intro" });
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /without a passed check/);
});

test("Material ✅ needs the material document, and a done unit needs Done ✅", () => {
  const table = done => `| # | Title | Type | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | module | ✅ | ✅ | ${done} | |`;
  const context = "* __File Structure:__\n  1. Mode: multi-file";
  const base = done => journal({ context }).replace("## Sessions\n\n", `## Sessions\n\n${table(done)}\n\n`);
  const missing = checkJournal(base("❌"));
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /material document .*missing/);
  assert.equal(checkJournal(base("❌"), { "materials/1-intro/README.md": "# Intro" }).status, 0);
  const single = journal({ context: "* __File Structure:__\n  1. Mode: single-file" }).replace("## Sessions\n\n", `## Sessions\n\n${table("❌")}\n\n`);
  assert.equal(checkJournal(single).status, 2);
  assert.equal(checkJournal(single, { "README.md": "# X\n\n## 1. Intro" }).status, 0);
  // An existing course that keeps its own folder name records its path in the Material cell.
  const recorded = base("❌").replace("| ✅ | ❌ | |", "| ✅ `materials/carpentry-intro/README.md` | ❌ | |");
  assert.equal(checkJournal(recorded, { "materials/carpentry-intro/README.md": "# Intro" }).status, 0);
  const lost = checkJournal(recorded, { "materials/1-intro/README.md": "# Intro" });
  assert.equal(lost.status, 2, lost.output);
  assert.match(lost.output, /material document is missing \(materials\/carpentry-intro\/README\.md\)/);
  const doneUnit = base("❌").replace('"state":"planned"', '"state":"done"');
  const run = checkJournal(doneUnit, { "materials/1-intro/README.md": "# Intro" });
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /dashboard shows unit 1 as done/);
});

test("the journal check reads plain table labels, single-file chapters, the start link and the course summary", () => {
  const layout = mode => `* __File Structure:__\n  1. Mode: ${mode}\n\n| Item | Decided |\n|---|---|\n| Aufbau | ein Kurs mit Kapiteln |`;
  const hint = checkJournal(journal({ context: layout("multi-file") }));
  assert.equal(hint.status, 2, hint.output);
  assert.match(hint.output, /\[file-structure\]/);
  const table = "| # | Title | Type | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | module | ✅ | ✅ | ❌ | |";
  const single = journal({ context: "* __File Structure:__\n  1. Mode: single-file" }).replace("## Sessions\n\n", `## Sessions\n\n${table}\n\n`);
  assert.equal(checkJournal(single, { "README.md": "# X\n\n## Something else" }).status, 2);
  assert.equal(checkJournal(single, { "README.md": "# X\n\n## Stunde: Intro" }).status, 0);
  const start = journal().replace("# X", "# X\n\n<!-- class=\"journal-start\" -->\n[Open the overview →](#no-such-heading)");
  const run = checkJournal(start);
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /#no-such-heading/);
  const summary = journal() + "\n\n## Validation\n\n### Latest Validation Summary\n\nDate: 2026-10-22\nResult: PASS\n";
  const missing = checkJournal(summary);
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /Latest Validation Summary/);
  assert.equal(checkJournal(journal() + "\n\n## Validation\n\n### Latest Validation Summary\n\nDate: 2026-10-22\nMode: course\nResult: PASS\n").status, 0);
});

test("the validation report heading stands outside its <section>", () => {
  const inside = journal().replace("#### Validation Report – Rapport de validation", "<section>\n\n#### Validation Report – Rapport de validation").replace("</details>", "</details>\n\n</section>");
  const run = checkJournal(inside);
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /heading inside <section>/);
});

test("Done ✅ needs a passed check without open ⏳ items", () => {
  const table = "| # | Title | Type | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | modul | ✅ | ✅ | ✅ | |";
  const done = text => text.replace("## Sessions\n\n", `## Sessions\n\n${table}\n\n`);
  const clean = checkJournal(done(journal()));
  assert.equal(clean.status, 0, clean.output);
  const pending = checkJournal(done(journal({ outcome: "**Outcome:** passed – image follows\n\n**Still missing:**\n\n- ⏳ Header image – in the image step" })));
  assert.equal(pending.status, 2, pending.output);
  assert.match(pending.output, /unit 1: "Done ✅" while ⏳ items are still open/);
});

test("a type's display name must not repeat the unit word; its slug may", () => {
  const context = "* __Terminology:__\n  1. sessions-called: Modul";
  const types = (...names) => "* __Session Types:__\n" + names.map(([name, slug], i) => `  ${i + 1}. __${name}__ (slug: \`${slug}\`) — x`).join("\n");
  const slugOnly = checkJournal(journal({ context, didactics: types(["Lernmodul", "modul"], ["Selbstcheck", "selbstcheck"]) }));
  assert.equal(slugOnly.status, 0, slugOnly.output);
  const shown = checkJournal(journal({ context, didactics: types(["Modul", "lernmodul"], ["Selbstcheck", "selbstcheck"]) }));
  assert.equal(shown.status, 2, shown.output);
  assert.match(shown.output, /\[type-name\].*Modul/);
  const single = checkJournal(journal({ context, didactics: types(["Modul", "modul"]) }));
  assert.equal(single.status, 0, single.output);
});

test("session commands identify a unit by its number; the type is never a parameter", () => {
  const keys = ["teaching", "artist", "learner", "development"].flatMap(agent =>
    [...agentYaml(agent).matchAll(/^\s{2}(:[\w-]+[^:\n]*):/gm)].map(match => match[1]));
  assert.deepEqual(keys.filter(key => /\{type\??\}/.test(key) && !key.startsWith(":save-notes")), []);
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const files = [...walk(specs).filter(path => /\.(md|ya?ml)$/.test(path)), join(specs, "..", "README.md")];
  const hits = files.flatMap(path => readFileSync(path, "utf8").split("\n").map(line => [path, line]))
    .filter(([, line]) => /[?&]type=|\{\{?number\}?\} \{\{?type\}?\}|\{n\} \{type\}|<number> <type>|\[number\] \[type\]|`:create-session \d+ [a-z]+`/.test(line));
  assert.deepEqual(hits.map(([path, line]) => `${path.slice(specs.length + 1)}: ${line.trim().slice(0, 100)}`), []);
});

test("the journal check finds the visible outcome in any course language", () => {
  const ok = checkJournal(journal({ outcome: "**Résultat :** réussi (2026-10-19)" }));
  assert.equal(ok.status, 0, ok.output);
  const missing = checkJournal(journal({ outcome: "réussi (2026-10-19)" }));
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /without visible summary/);
});

test("language packs carry one wording per state: passed with something missing, the short re-check (R10-S4)", () => {
  for (const name of existsSync(join(specs, "templates", "i18n")) ? readdirSync(join(specs, "templates", "i18n")) : []) {
    const terms = JSON.parse(read(`templates/i18n/${name}`)).terms ?? {};
    for (const key of ["passedMissing", "recheckShort", "recheckExplain"]) assert.ok(terms[key], `${name}: terms.${key} is missing`);
    assert.ok(!("recheckPending" in terms), `${name}: the old term recheckPending is back`);
    assert.match(terms.passedMissing, /\{what\}/, `${name}: passedMissing names what is missing, never a step`);
  }
  assert.ok(!/later step\}? (still )?follows/.test(read("templates/session-validation.yaml") + read("templates/session-skeleton.yaml") + read("tasks/update-dashboard.md")), "a step name is the subject of an outcome again");
});

test("every language pack matches the empty journal template line by line", () => {
  const template = read("templates/journal.md").split("\n").map(line => line.trimEnd());
  for (const name of existsSync(join(specs, "templates", "i18n")) ? readdirSync(join(specs, "templates", "i18n")) : []) {
    const pack = JSON.parse(read(`templates/i18n/${name}`));
    const misses = pack.replace.filter(([from, , all]) => { const n = template.filter(line => line === from.trimEnd()).length; return all === "all" ? n < 1 : n !== 1; }).map(([from]) => from);
    assert.deepEqual(misses, [], `${name}: lines not found exactly once in templates/journal.md`);
    assert.ok(pack.dashboard && pack.labels, `${name}: needs dashboard and labels`);
    assert.ok(!JSON.stringify(pack).includes("{{"), `${name}: template placeholder`);
  }
});

test("no template prescribes a numbered item that starts with a date; decisions are '- **{date}:** …' (R11-S4)", () => {
  const files = [...readdirSync(join(specs, "templates")).filter(name => /\.(ya?ml|md)$/.test(name)).map(name => `templates/${name}`),
    ...readdirSync(join(specs, "tasks")).map(name => `tasks/${name}`), ...readdirSync(join(specs, "data")).map(name => `data/${name}`)];
  const leading = /^\s*\d+\.\s+(?:\{\{[^}]*\bdate\b|\[[^\]]*\bdate\b|\d{1,2}\.\d{1,2}\.\d{2,4}|\d{4}-\d{2}-\d{2})/i;
  const hits = files.flatMap(file => read(file).split("\n").map(line => [file, line]))
    .filter(([, line]) => leading.test(line) || /^\s*\d+\.\s.*\bwith date\b/i.test(line));
  assert.deepEqual(hits.map(([file, line]) => `${file}: ${line.trim().slice(0, 80)}`), []);
  assert.match(read("templates/session-skeleton.yaml"), /<!-- data-key="decisions" -->\n\s+\*\*\{\{"Decisions", translated\}\}:\*\*\n\n\s+- \*\*\{\{date\}\}:\*\* /);
  assert.match(read("templates/journal.md"), /^- \*\*\{\{date\}\}:\*\* /m);
});

test("the overview answers 'usable with learners now' first and shows each unit's learners' view (R11-S1, R11-S2)", () => {
  const library = read("dashboard/dashboard.js");
  const texts = lang => library.split(`    ${lang}: {`)[1]?.split(/\n    \}/)[0] ?? "";
  for (const lang of ["de", "en"]) {
    for (const key of ['"usable.yes"', '"usable.limited"', '"usable.no"', "usableMissing", "checkedNone", "usableUnits", "usableLimitedShort", "viewMaterial", "plan:"]) {
      assert.ok(texts(lang).includes(key), `dashboard.js ${lang} lacks ${key}`);
    }
  }
  assert.match(texts("en"), /plan: "See planning"/);
  assert.ok(!/planLabel/.test(library), "the planning link can be renamed again (planLabel)");
  // Every unit with material has a view link: in the schema, the task, the action line rule and the validator.
  assert.match(read("templates/project-dashboard.yaml"), /^\s+view: 'Once the material exists: \{href: "agent:teaching\/preview\?file=\{n\}"/m);
  assert.match(read("dashboard/derive-dashboard.mjs"), /href: `agent:teaching\/preview\?file=\$\{facts\.n\}`/, "write-dashboard sets view for every unit with material");
  assert.match(read("data/journal-links.md"), /\*\*Learners' view:\*\* once the material exists, the line also carries 👁 `preview\?file=\{n\}`/);
  const validator = read("dashboard/validate-journal.mjs");
  assert.match(validator, /but no view – add units/);
  assert.match(validator, /its action line has no 👁 preview link/);
  assert.match(validator, /has a check report but no usable/);
  // Card order: usable → open points (status chip) → process steps.
  const card = library.match(/function unit\(input, selected = false, viewId\) \{[\s\S]*?\n  \}/)?.[0] ?? "";
  const content = card.match(/const content = `([^\n]*)`;/)?.[1] ?? "";
  assert.ok(content.indexOf("usableLine(") >= 0 && content.indexOf("usableLine(") < content.indexOf("status(") && content.indexOf("status(") < content.indexOf("stepText"), "unit card order is not usable → status → steps");
});

test("outdated state wordings are recognised, never recommended; the current terms match the template (R11-D1)", () => {
  const validation = read("templates/session-validation.yaml") + read("templates/session-skeleton.yaml");
  const validator = read("dashboard/validate-journal.mjs");
  const english = validator.match(/const englishTerms = \{([\s\S]*?)\};/)?.[1] ?? "";
  for (const [key, term] of [...english.matchAll(/(\w+): "([^"]+)"/g)].map(match => [match[1], match[2]])) {
    if (/^usable/.test(key)) continue;
    const words = term.replace(/^\{n\} /, "");
    assert.ok(validation.includes(words), `validate-journal.mjs term ${key} "${term}" is not the wording of templates/session-validation.yaml or session-skeleton.yaml`);
  }
  for (const name of existsSync(join(specs, "templates", "i18n")) ? readdirSync(join(specs, "templates", "i18n")) : []) {
    const pack = JSON.parse(read(`templates/i18n/${name}`));
    for (const key of ["correctionOpen", "usableYes", "usableLimited", "usableNo"]) assert.ok(pack.terms?.[key], `${name}: terms.${key} is missing`);
    assert.ok(Array.isArray(pack.outdatedTerms) && pack.outdatedTerms.length, `${name}: outdatedTerms is missing`);
    for (const [pattern, term] of pack.outdatedTerms) {
      assert.doesNotThrow(() => new RegExp(pattern, "iu"), `${name}: outdatedTerms pattern ${pattern}`);
      assert.ok(pack.terms[term], `${name}: outdatedTerms names the unknown term ${term}`);
      assert.ok(!new RegExp(pattern, "iu").test(pack.terms[term]), `${name}: the current term ${term} matches its own outdated pattern ${pattern}`);
    }
  }
  // An outdated outcome in a journal: the warning names the current term, never the old words.
  const report = "**Outcome:** passed – images still follows (2026-10-19) – 1 point(s) changed since – re-check open\n\n**Usable with learners now:** yes, with limits: 1 photo\n\n**Changed after the check:**\n\n- 2026-10-20 · Start · shorter · mini-check";
  const run = checkJournal(journal({ outcome: report }).replace("language: fr", "language: en"));
  assert.match(run.output, /uses outdated wording \("images still follows", "re-check open"\) – never copy it; the current wording is "passed – still missing: \{what\}", "\{n\} point\(s\) changed since – short re-check open"/);
  assert.doesNotMatch(run.output, /write "passed – images still follows/);
});


test("every helper script in specs/dashboard and specs/catalog is on the shell list of the YAML and of the built CLAUDE.md", () => {
  const yaml = teachingAgent();
  const built = readFileSync(join(specs, "..", "CLAUDE.md"), "utf8");
  // Modules of the scripts declare themselves in their first line ("// Module for …") and are no commands.
  for (const folder of ["dashboard", "catalog"]) {
    const scripts = readdirSync(join(specs, folder)).filter(name => name.endsWith(".mjs") && name !== "check.mjs" && !/^\/\/ Module for /.test(read(`${folder}/${name}`)));
    for (const name of scripts) {
      assert.ok(yaml.includes(`\`node specs/${folder}/${name}`), `agents/teaching-agent.yaml: ${name} is missing from the shell list`);
      assert.ok(built.includes(`\`node specs/${folder}/${name}`), `CLAUDE.md: ${name} is missing – run python specs/build.py`);
    }
  }
  assert.ok(yaml.includes("`node --test lia-templates/{id}/check.mjs`"), "agents/teaching-agent.yaml: the test of an own template is missing from the shell list");
});

test("the shell list of CLAUDE.md names read-source.mjs with its arguments (stage 2a, T6)", () => {
  const built = readFileSync(join(specs, "..", "CLAUDE.md"), "utf8");
  assert.ok(built.includes("`node specs/dashboard/read-source.mjs <file | folder | URL>`"), "CLAUDE.md: read-source.mjs is missing from the shell list – run python specs/build.py");
});

test("older journals: the validator's migration hint leads to a confirmed migration in update-dashboard (R11-D2)", () => {
  const task = read("tasks/update-dashboard.md");
  assert.match(task, /\*\*Older journal layout:\*\*/);
  assert.match(task, /`node specs\/dashboard\/migrate-journal\.mjs --check`/);
  assert.match(task, /"Update" \/ "Not now" \(tier "confirm in chat"\)/);
  assert.match(task, /the layout changes of `migrate-journal\.mjs`, only after the instructor's\s+"Update"/);
  assert.match(read("dashboard/validate-journal.mjs"), /older journal layout – run `node specs\/dashboard\/migrate-journal\.mjs`/);
});

test("the agent YAML carries no outdated journal rules: no {{…}} skeletons, all write ways, re-reading named inputs", () => {
  const yaml = teachingAgent();
  assert.doesNotMatch(yaml, /keep their `\{\{\.\.\.\}\}` placeholder skeleton/, "the empty journal has one-line notes, not {{…}} skeletons");
  assert.doesNotMatch(yaml, /bullet skeleton per section/);
  assert.doesNotMatch(yaml, /only with the file-edit tool, and re-read/, "the line replacer and write_section are allowed write ways too");
  assert.match(yaml, /every file its Inputs mark as read completely/);
  assert.match(yaml, /Read `specs\/agents\/teaching-agent\.yaml` completely once per session/);
  for (const name of ["teaching", "artist", "learner", "development"]) assert.match(agentYaml(name), /the switch is one short message signed by the new agent/, `${name}-agent.yaml`);
});

test("language packs cover the empty journal in both directions: every visible line is translated or an English key tasks read", () => {
  const template = read("templates/journal.md");
  const visible = template.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "")
    .split("\n").map(line => line.trimEnd()).filter(line => line.trim() && line.trim() !== "---" && !/^<\/?(section|details)>$/.test(line.trim()));
  // Keys tasks read stay English: entry headings under Templates/Agents, `__Label:__` lines, inline-code values, table rows.
  const key = line => /^### /.test(line) || /^\s*\* __[^_]+:__/.test(line) || /^\s+`[^`]+`$/.test(line) || /^\|/.test(line);
  for (const name of readdirSync(join(specs, "templates", "i18n"))) {
    const pack = JSON.parse(read(`templates/i18n/${name}`));
    const covered = new Set(pack.replace.map(([from]) => from.trimEnd()));
    const missing = visible.filter(line => !covered.has(line) && !key(line));
    assert.deepEqual(missing, [], `${name}: visible template lines without a translation`);
  }
});

test("a language pack's Dashboard has the structure of the template's, and --lang gives a valid journal", () => {
  const template = read("templates/journal.md");
  const english = JSON.parse(template.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]);
  for (const name of readdirSync(join(specs, "templates", "i18n"))) {
    const pack = JSON.parse(read(`templates/i18n/${name}`));
    const shape = data => ({ next: [data.next.href, data.next.command, data.next.icon], steps: data.process.steps.map(step => step.state), explore: data.explore.map(item => item.href), links: data.links.length });
    assert.deepEqual(shape(pack.dashboard), shape(english), `${name}: Dashboard structure differs from templates/journal.md`);
    assert.equal(pack.dashboard.next.title, pack.dashboard.process.steps.find(step => step.state === "current").title, `${name}: next.title is the current step's title`);
    const dir = mkdtempSync(join(tmpdir(), "pack-check-"));
    writeFileSync(join(dir, "journal.md"), template);
    const code = name.replace(/\.json$/, "");
    const run = spawnSync(process.execPath, [join(specs, "dashboard", "localize-journal.mjs"), "--lang", code], { cwd: dir, encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const check = spawnSync(process.execPath, [join(specs, "dashboard", "validate-journal.mjs"), join(dir, "journal.md")], { encoding: "utf8" });
    assert.equal(check.status, 0, check.stdout + check.stderr);
  }
  assert.equal(english.next.title, english.process.steps.find(step => step.state === "current").title, "templates/journal.md: next.title is the current step's title");
});

test("agent rules: a lean core, topic sheets named where they are used, no reference to a moved rule", () => {
  const core = read("data/agent-links.md");
  assert.ok(core.split("\n").length <= 400, `data/agent-links.md has ${core.split("\n").length} lines – keep the core under 400, topics go into the rule sheets`);
  const sheets = readdirSync(join(specs, "data")).filter(name => /^(chat-.*|journal-links)\.md$/.test(name)).map(name => `data/${name}`);
  assert.ok(sheets.length >= 6, "the rule sheets exist");
  const yaml = teachingAgent();
  for (const sheet of sheets) {
    assert.ok(core.includes(`\`${sheet}\``), `${sheet} is missing from the index (Chat Conduct → Rule sheets)`);
    assert.ok(yaml.includes(`- ${sheet.slice(5)}`), `${sheet} is missing from the YAML's data dependencies`);
    assert.match(read(sheet), /^# /, `${sheet} starts with its title`);
  }
  // A task that refers to a sheet names it in its Inputs line "Rule sheets, read completely with this task".
  for (const name of readdirSync(join(specs, "tasks")).filter(file => file.endsWith(".md"))) {
    const text = read(`tasks/${name}`);
    const line = text.split("\n").find(item => item.startsWith("- Rule sheets, read completely with this task")) ?? "";
    // data/chat-wording.md is read with the core once per session; the other sheets go with the task.
    for (const sheet of sheets.filter(item => item !== "data/chat-wording.md")) if (text.split("\n").filter(item => item !== line).some(item => item.includes(sheet))) assert.ok(line.includes(sheet), `tasks/${name} refers to ${sheet} but its Inputs do not name it`);
  }
  // Moved rules are referred to in their sheet, never through the core.
  const moved = ["Language before the frame", "Plain language", "Name things as the overview does", "Times", "Point, don't describe", "Say how you checked", "Changing another section", "Nothing unseen gets saved", "Forms", "Field keys", "Action lines", "Markdown Format", "Link targets", "Temporary companion"];
  const files = [...readdirSync(join(specs, "tasks")).map(name => `tasks/${name}`), ...readdirSync(join(specs, "agents")).map(name => `agents/${name}`), ...sheets, "data/agent-links.md", "templates/session-skeleton.yaml", "workflows/course-development.yaml"];
  for (const file of files) for (const rule of moved) assert.ok(!new RegExp(`agent-links\\.md\`?\\s*→\\s*(Chat Conduct\\s*→\\s*)?"?${rule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(read(file)), `${file} refers to "${rule}" through data/agent-links.md – it lives in its rule sheet now`);
});

test("light tracks: every agent skips sections marked when needed; every pack has the mini note of ## Sessions (final review)", () => {
  for (const agent of ["learner", "artist", "development"]) assert.ok(read(`agents/${agent}-agent.yaml`).includes("Never read a section marked `<!-- state: later -->` (when needed); a task input that is marked counts as empty"), `${agent}-agent.yaml lacks the when-needed rule`);
  for (const name of readdirSync(join(specs, "templates", "i18n")).filter(item => item.endsWith(".json"))) assert.ok(JSON.parse(read(`templates/i18n/${name}`)).terms?.miniSessionsNote, `${name}: terms.miniSessionsNote is missing`);
  assert.doesNotMatch(read("data/journal-links.md"), /convert-course/, "a rule sheet points stage 1 agents at a command that does not exist yet");
  assert.match(read("data/agent-links.md"), /\| `data\/chat-memory\.md` \|[^\n]*\| `start`, `open-chat`, start order \|/);
});

test("the fixed start reading stays within its budget (T5-111)", () => {
  // 64 kB, not 60 kB: the split core (≈16 kB) plus the four rule sheets read at start (≈44 kB) leave no headroom at 60 kB.
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    const { bytes, files } = startLoad(agent);
    assert.ok(bytes <= 64_000, `${agent}: start reading ${bytes} bytes > 64000 (${files.join(", ")})`);
  }
  // 16.5 kB, not 16 kB: the core's two pointers to the moved agent_links name where it lives now (CLAUDE.md → Agent Links, the nav file).
  assert.ok(Buffer.byteLength(read("agents/teaching-agent.yaml")) <= 16_500, "teaching-agent.yaml core ≤ 16.5 kB");
});

test("CLAUDE.md carries what moved to teaching-agent.nav.yaml", () => {
  const claude = readFileSync(join(specs, "..", "CLAUDE.md"), "utf8");
  const commands = Object.keys(yamlCommands(teachingAgent()));
  assert.ok(commands.length >= 20, `the teaching agent has its commands (${commands.length})`);
  for (const key of commands) assert.ok(claude.includes(key.split(" ")[0]), key);
  assert.ok(existsSync(join(specs, "agents/teaching-agent.nav.yaml")), "agents/teaching-agent.nav.yaml is missing");
  for (const section of ["agent_coordination", "skills", "agent_links", "commands"]) {
    assert.doesNotMatch(read("agents/teaching-agent.yaml"), new RegExp(`^${section}:`, "m"), `${section} still stands in the core`);
    assert.match(read("agents/teaching-agent.nav.yaml"), new RegExp(`^${section}:`, "m"), `${section} is missing from the nav file`);
  }
  assert.ok(claude.includes("Read `specs/agents/teaching-agent.yaml` completely once per session (the core; CLAUDE.md carries its commands, links and coordination)"), "On Activation names the core");
  assert.match(claude, /\(2\) read the header `language:`, `## Course Context`, the Dashboard block and the `###` headings of `## Sessions` of `journal\.md`/, "start order reads only the head of the journal");
});

test("every rule of teaching-agent.nav.yaml reaches CLAUDE.md: nothing moved out of the start reading gets lost (T5-111)", () => {
  const claude = flat(readFileSync(join(specs, "..", "CLAUDE.md"), "utf8").replaceAll("\\|", "|"));
  const nav = read("agents/teaching-agent.nav.yaml");
  const commands = nav.split(/^commands:\s*$/m)[1];
  const rules = [...nav.split(/^commands:\s*$/m)[0].matchAll(/^\s+(?:- |[\w-]+: )"(.*)"$/gm)].map(match => match[1]);
  assert.ok(rules.length >= 40, `the nav file has its rules (${rules.length})`);
  const notes = Object.values(yamlCommands(nav)).map(desc => desc.replace(/^"|"$/g, ""))
    .map(desc => desc.includes("—") ? desc.split("—").slice(1).join("—").trim() : /^run task/.test(desc) ? `specs/${desc.match(/`(tasks\/[^`]+)`/)[1]}` : desc);
  assert.ok(commands && notes.length >= 20);
  const missing = [...rules, ...notes].filter(text => !claude.includes(flat(text)));
  assert.deepEqual(missing.map(text => text.slice(0, 70)), [], "build.py does not render these rules of the nav file into CLAUDE.md");
  const rows = readFileSync(join(specs, "..", "CLAUDE.md"), "utf8").split("\n").filter(line => line.startsWith("| `:"));
  assert.deepEqual(rows.filter(row => row.replaceAll("\\|", "").split("|").length !== 5).map(row => row.slice(0, 40)), [], "a command note splits its table row (escape | as \\|)");
});

test("the core and CLAUDE.md read journal.md the same way at start: head, Course Context, Dashboard; the rest on demand", () => {
  const claude = readFileSync(join(specs, "..", "CLAUDE.md"), "utf8");
  const activation = claude.split("## On Activation")[1].split("\n## ")[0];
  assert.doesNotMatch(activation, /Read `journal\.md` if it exists, especially/, "On Activation still reads the whole journal");
  assert.match(activation, /the Dashboard block[^\n]*the rest of `journal\.md` when a task needs it \(`find\.mjs`, `read_section`\)/);
  assert.doesNotMatch(read("agents/teaching-agent.yaml"), /see `agent_links`"|under `agent_links` names/, "the core points to agent_links without saying where it lives now");
  assert.match(read("agents/teaching-agent.yaml"), /CLAUDE\.md → Agent Links/);
});
