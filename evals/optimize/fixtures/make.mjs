// Builds the journal fixtures of the create-outline scenarios: the empty journal of the reference checkout,
// localised, with the course frame :init-course would have written (table + technical details), title and
// overview derived. Reproducible: node evals/optimize/fixtures/make.mjs [<scenario id> …]
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const contexts = JSON.parse(readFileSync(join(here, "contexts.json"), "utf8"));
const wanted = process.argv.slice(2);

function frame(c) {
  const rows = Object.entries(c.table).map(([key, value]) => `| ${key} | ${value} |`).join("\n");
  const list = items => items.map(item => `  - ${item}`).join("\n");
  return `<!-- class="journal-actions" -->
[✏️ Kursrahmen überarbeiten](agent:teaching/init-course) \`:init-course\`

<!--- Filled by :init-course from templates/course-context.yaml (layout: summary table + <details>). --->

**Kursrahmen:** bestätigt am ${c.confirmed}.

<!-- data-type="none" -->
| Punkt | Entschieden |
|---|---|
${rows}

<details><summary>Technische Einstellungen für den Assistenten</summary>

* __Course Type:__
  1. Type: ${c.type}
  2. Working Title: ${c.title}
  3. Target Group: ${c.targetGroup}

* __Track:__
  1. Track: full
  2. Convert mode: n/a
  3. Source: n/a

* __Terminology:__
  1. sessions-called: ${c.sessionsCalled}

* __Course Profile:__
  1. Persona type: ${c.persona}
  2. Agenda required: ${c.agenda}
  3. Pacing: ${c.pacing}
  4. Assessment defaults: ${c.assessment}
  5. Units: ${c.units}
  6. Delivery: ${c.delivery}

* __File Structure:__
  1. Mode: ${c.fileMode}
  2. Session folder naming: ${c.fileMode === "multi-file" ? "`{number}-{slug}`" : "n/a"}

* __Conventions & Standards:__
  1. Language: de
  2. Tone: ${c.tone}
  3. Person: ${c.person}
  4. Instructor Address: Sie
  5. Author: ${c.author}
  6. Contact: 

* __LiaScript conventions:__
  - keine besonderen

* __Additional Notes:__
${list(c.notes)}

</details>

`;
}

for (const [id, c] of Object.entries(contexts)) {
  if (wanted.length && !wanted.includes(id)) continue;
  const dir = mkdtempSync(join(tmpdir(), `fixture-${id}-`));
  cpSync(join(root, "specs"), join(dir, "specs"), { recursive: true });
  cpSync(join(root, "specs/templates/journal.md"), join(dir, "journal.md"));
  const run = (...args) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8" });
  run("specs/dashboard/localize-journal.mjs", "--lang", "de");
  let text = readFileSync(join(dir, "journal.md"), "utf8");
  text = text.replace(/^# .*$/m, `# ${c.title}`);
  text = text.replace(/(^## Course Context[^\n]*\n\n)[\s\S]*?(?=^---\s*$)/m, (all, head) => head + frame(c));
  // The overview as :init-course leaves it: the frame step done, title, context and subtitle in plain words.
  const block = /```json @Dashboard\.View\n([\s\S]*?)\n```/;
  const data = JSON.parse(text.match(block)[1]);
  data.title = c.title;
  data.context = c.table["Lernende"] + " · " + c.table["Einsatz"];
  data.subtitle = `Der Kursrahmen steht (${c.table["Vorhaben"]}). Als Nächstes entsteht die Gliederung mit den Lernzielen.`;
  const first = data.process.steps[0];
  first.state = "done";
  delete first.next;
  first.result = `Kursrahmen bestätigt am ${c.confirmed}`;
  writeFileSync(join(dir, "journal.md"), text);
  writeFileSync(join(dir, "draft.json"), JSON.stringify(data, null, 2));
  const derive = run("specs/dashboard/write-dashboard.mjs", "draft.json");
  const check = run("specs/dashboard/validate-journal.mjs", "journal.md");
  writeFileSync(join(here, `${id}.journal.md`), readFileSync(join(dir, "journal.md"), "utf8"));
  console.log(`${id}: derive ${derive.status}, validate ${check.status}${check.status ? "\n" + (check.stdout + check.stderr).split("\n").filter(l => /^- /.test(l)).slice(0, 5).join("\n") : ""}`);
  rmSync(dir, { recursive: true, force: true });
}
