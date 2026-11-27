#!/usr/bin/env node
// Detects the LiaScript skills installed for this course project (data/skills.md → Detection, item 2):
// prints, for each skill, the first folder that holds its SKILL.md, or "not found". Reads nothing but
// file existence; never downloads or installs. The runtime's own skill list (item 1) stays the agent's check.
//   node specs/dashboard/detect-skills.mjs [--json]
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const skills = ["liascript-syntax", "reference-checker", "liascript-templates", "creativity", "liascript-theming", "liascript-exporter", "oersi-metadata"];
export const projectFolders = [".claude/skills", ".agents/skills", ".github/skills", ".cursor/skills", ".windsurf/skills", ".roo/skills"];
export const userFolders = [".claude/skills", ".agents/skills", ".copilot/skills"];

export function detect(project = process.cwd(), home = homedir()) {
  const places = [...projectFolders.map(folder => join(project, folder)), ...userFolders.map(folder => join(home, folder))];
  return Object.fromEntries(skills.map(name => [name, places.map(place => join(place, name, "SKILL.md")).find(file => existsSync(file)) ?? null]));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const found = detect();
  if (process.argv.includes("--json")) console.log(JSON.stringify(found, null, 2));
  else {
    for (const [name, file] of Object.entries(found)) console.log(`${name}: ${file ?? "not found"}`);
    const count = Object.values(found).filter(Boolean).length;
    console.log(count ? `${count} installed – read a SKILL.md only when a step needs it.` : "None installed in the skill folders. A skill your runtime lists still counts (data/skills.md → Detection).");
  }
}
