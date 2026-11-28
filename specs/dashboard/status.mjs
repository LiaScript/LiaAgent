// The course status in a few lines, computed from journal.md (E22): language, track, the next action, every unit's
// state and button, and the line ranges of the sections – instead of reading the Dashboard block on activation.
// Read-only. Usage: node specs/dashboard/status.mjs [journal.md]
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveForJournal, unitState } from "./derive-dashboard.mjs";
import { unitAction } from "./actions.mjs";
import { isLater } from "./tracks.mjs";
import { unitByMachine } from "../statechart/unit.impl.mjs";
import { courseByMachine } from "../statechart/course.impl.mjs";

// ## and ### headings outside code blocks, with their line ranges (1-based, inclusive).
export function sectionRanges(source) {
  const lines = source.split("\n");
  let fence = false;
  let comment = false;
  const heads = [];
  // Headings in code blocks and HTML comments (the examples of the empty journal) are no sections.
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const opens = !fence && !comment && /<!--/.test(line) && !/-->/.test(line.slice(line.indexOf("<!--")));
    const closes = comment && /-->/.test(line);
    const match = !fence && !comment && !opens && line.match(/^(##|###) (.+?)\s*$/);
    if (opens) comment = true;
    if (closes) comment = false;
    if (match) heads.push({ level: match[1].length, text: match[2], start: i + 1 });
  });
  heads.forEach((head, i) => {
    const next = heads.slice(i + 1).find(other => other.level <= head.level);
    head.end = (next ? next.start : lines.length + 1) - 1;
    while (head.end > head.start && !lines[head.end - 1].trim()) head.end--;
    head.body = lines.slice(head.start, head.end).join("\n");
  });
  return heads;
}

export function status(journalFile) {
  const source = readFileSync(journalFile, "utf8");
  const block = source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)?.[1];
  let input = {};
  try { input = block ? JSON.parse(block) : {}; } catch { input = {}; }
  const { _journalHash, ...base } = input;
  const { data, changes, journal } = deriveForJournal(journalFile, base);
  const out = [];
  const yesNo = value => value ? "yes" : "no";
  out.push(`language ${journal.language} · track ${journal.track}${journal.trackMode ? ` (${journal.trackMode})` : ""} · unit word "${journal.terminology ?? "unit"}" · delivery ${journal.delivery ?? "–"} · published ${yesNo(journal.published)}`);
  if (data.title || data.context) out.push(`course: ${[data.title, data.context].filter(Boolean).join(" – ")}`);

  const states = new Map(journal.units.map(unit => [unit.n, unitState(unit).state]));
  const course = courseByMachine(journal, states, data.selected);
  const next = data.next;
  if (next) {
    out.push(`next: ${next.label ?? next.title} – ${next.href}${next.command ? ` (\`${next.command}\`)` : ""}`);
    if (next.why) out.push(`  why: ${next.why}`);
  } else out.push("next: – (nothing left on the course process)");
  out.push(`  course state: ${course.path}${course.unit ? ` → unit ${course.unit.n}` : ""}`);

  if (journal.units.length) {
    out.push("units:");
    for (const unit of journal.units) {
      const shown = unitState(unit, { selected: data.selected });
      const machine = unitByMachine(unit, { selected: data.selected });
      const button = unitAction(unit);
      out.push(`  ${unit.n} ${unit.title ?? unit.tableTitle ?? ""} · ${shown.state} (${shown.why}) · ${machine.path} · ${button ? `${button.key} \`${button.command}\`` : "agent's call"}`);
    }
  }

  const heads = sectionRanges(source);
  const range = head => head.start === head.end ? `${head.start}` : `${head.start}–${head.end}`;
  out.push("sections (read by part, these line ranges):");
  for (const head of heads.filter(item => item.level === 2)) {
    const key = head.text.split(/\s+–\s+/)[0];
    if (isLater(head.body)) { out.push(`  ## ${key}: later`); continue; }
    const subs = heads.filter(item => item.level === 3 && item.start > head.start && item.end <= head.end);
    const list = subs.length ? ` – ${subs.map(sub => `### ${sub.text} ${range(sub)}`).join(", ")}` : "";
    out.push(`  ## ${key} ${range(head)}${list}`);
  }
  out.push(changes.length
    ? `Dashboard block: ${changes.length} derived field${changes.length === 1 ? "" : "s"} differ from the journal – a task that changes state ends with \`node specs/dashboard/derive-dashboard.mjs --write\`.`
    : "Dashboard block: matches the journal.");
  return out.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = process.argv[2] ?? ["journal.md", resolve(here, "..", "..", "journal.md")].find(path => existsSync(path));
  if (!file || !existsSync(file)) {
    console.log("No journal.md yet – the course starts with :init-course (or :start).");
    process.exit(0);
  }
  console.log(status(file));
}
