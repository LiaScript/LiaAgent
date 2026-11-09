// Module for the write scripts (localize-journal, write-dashboard, migrate-journal) – not a command of its own.
// Every write reloads the preview and resets the instructor's quiz answers; the rules allow at most 5 writes per
// save (data/chat-dialog.md → Changing another section). The scripts log each write in .cache/writes.json and
// warn from the 6th write within 10 minutes. The log keeps 2 hours, so a long run (tasks/build-session.md) can
// count all of its writes from it. Edits made with the file-edit tool are not counted.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, relative, isAbsolute } from "node:path";

const WINDOW = 10 * 60 * 1000;
const KEEP = 2 * 60 * 60 * 1000;
const BUDGET = 5;

export function countWrite(projectDir, script, file, now = new Date()) {
  // Only writes to this project's files count (a test run on a temporary journal is no write of the project).
  const inside = path => { const rel = relative(resolve(projectDir), resolve(projectDir, path)); return !rel.startsWith("..") && !isAbsolute(rel); };
  if (!inside(file)) return null;
  const dir = join(projectDir, ".cache");
  const log = join(dir, "writes.json");
  let writes = [];
  try { writes = JSON.parse(readFileSync(log, "utf8")); if (!Array.isArray(writes)) writes = []; } catch { writes = []; }
  const kept = writes.filter(item => now - new Date(item.at) >= 0 && now - new Date(item.at) < KEEP && inside(item.file ?? ""));
  kept.push({ at: now.toISOString(), script, file });
  try { mkdirSync(dir, { recursive: true }); writeFileSync(log, JSON.stringify(kept, null, 1)); } catch { /* counting must never block a write */ }
  writes = kept.filter(item => now - new Date(item.at) < WINDOW);
  if (writes.length <= BUDGET) return null;
  const by = {};
  writes.forEach(item => { by[item.script] = (by[item.script] ?? 0) + 1; });
  const parts = Object.entries(by).map(([name, n]) => `${n} × ${name}`).join(", ");
  return `Warning: ${writes.length}th write within 10 minutes (${parts}) – every write reloads the preview and resets the instructor's quiz answers; put the remaining changes of this save into one map or one section write (data/chat-dialog.md → Changing another section), and name extra writes of a long run in its runs line`;
}
