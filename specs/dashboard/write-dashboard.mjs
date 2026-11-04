// Writes the Dashboard data block of journal.md in one step: reads a JSON draft,
// checks it with the Dashboard library, replaces the whole ```json @Dashboard.View
// block (one file write = one preview reload) and runs validate-journal.mjs.
// After the write it stores `_journalHash` (hash of the block as written) in the draft file: a later run
// with that draft refuses to write when the journal block has changed since ("cache stale"), so small
// changes can be made in the cache with the edit tool instead of a whole new draft
// (tasks/update-dashboard.md step 8). A draft without `_journalHash` is always accepted.
// Before writing, the fields that follow from the journal (unit list, state, href, view, usable,
// statusLabel, image step, links, unit words, date) are derived from it (derive-dashboard.mjs) and
// replace the draft's values, and each unit's status line, Notes cell and action line in ## Sessions
// follow in the same write; the script prints every field it set. When no language pack has the words of
// a changed action, it writes nothing and names the words to write. --no-derive writes the draft as it is.
// Run from the course project root:
//   node specs/dashboard/write-dashboard.mjs <draft.json> [journal.md] [--no-derive]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import "./dashboard.js";
import { countWrite } from "./write-count.mjs";
import { deriveForJournal, describe, patchJournal, missingText } from "./derive-dashboard.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const noDerive = args.includes("--no-derive");
const [draftFile, journalArg] = args.filter(arg => !arg.startsWith("--"));
if (!draftFile || !existsSync(draftFile)) {
  console.error("Usage: node specs/dashboard/write-dashboard.mjs <draft.json> [journal.md]");
  console.log("Exit code: 1");
  process.exit(1);
}
const journal = journalArg ?? ["journal.md", resolve(here, "..", "..", "journal.md")].find(path => existsSync(path));

const blockHash = text => createHash("sha256").update(text).digest("hex").slice(0, 16);

let data;
let cacheHash;
let derived = null;
try {
  data = JSON.parse(readFileSync(draftFile, "utf8"));
  if (data && typeof data === "object" && !Array.isArray(data)) ({ _journalHash: cacheHash, ...data } = data);
  if (!noDerive && journal && existsSync(journal) && data && typeof data === "object" && !Array.isArray(data)) {
    derived = deriveForJournal(journal, data);
    data = derived.data;
    if (derived.changes.length) {
      console.log(`Derived from the journal (${derived.changes.length} field${derived.changes.length === 1 ? "" : "s"} set – no need to write them yourself):`);
      derived.changes.forEach(change => console.log(describe(change)));
    }
    if (derived.missing.length) {
      console.error("Words still to write, journal unchanged (no language pack has them):");
      derived.missing.forEach(item => console.error(missingText(item)));
      console.log("Exit code: 1");
      process.exit(1);
    }
  }
  globalThis.LiaDashboard.buildModel(data);
} catch (error) {
  console.error(`Draft rejected, journal unchanged: ${error.message}`);
  console.log("Exit code: 1");
  process.exit(1);
}

const source = readFileSync(journal, "utf8");
const block = /```json @Dashboard\.View\n[\s\S]*?\n```/;
if (!block.test(source)) {
  console.error("No ```json @Dashboard.View block found under ## Dashboard, journal unchanged.");
  console.log("Exit code: 1");
  process.exit(1);
}
const current = source.match(block)[0].slice("```json @Dashboard.View\n".length, -"\n```".length);
if (cacheHash && cacheHash !== blockHash(current)) {
  console.error(`Cache stale, journal unchanged: the Dashboard block in ${journal} changed since ${draftFile} was last written – rebuild the whole draft from the current journal (tasks/update-dashboard.md step 8).`);
  console.log("Exit code: 1");
  process.exit(1);
}
const json = JSON.stringify(data, null, 2);
// The block and the status lines / Notes cells of ## Sessions in one write (one preview reload).
const replaced = source.replace(block, () => "```json @Dashboard.View\n" + json + "\n```");
const next = derived ? patchJournal(replaced, derived.journal, derived).source : replaced;
if (next === source) console.log("Dashboard unchanged.");
else {
  writeFileSync(journal, next);
  console.log(`Dashboard written to ${journal}.`);
  const budget = countWrite(process.cwd(), "write-dashboard", journal);
  if (budget) console.log(budget);
}
// The cache now matches the journal block: next time change only the affected keys in it.
writeFileSync(draftFile, JSON.stringify({ ...data, _journalHash: blockHash(json) }, null, 2) + "\n");
console.log(`Cache ${draftFile} matches the journal block (_journalHash ${blockHash(json)}) – for a small change edit only the affected keys there.`);

const check = spawnSync(process.execPath, [resolve(here, "validate-journal.mjs"), journal], { encoding: "utf8" });
process.stdout.write(check.stdout);
process.stderr.write(check.stderr);
process.exit(check.status ?? 1);
