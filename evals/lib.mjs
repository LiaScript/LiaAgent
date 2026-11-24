// Shared helpers of the evaluation harness (evals/README.md).
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const harnessRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export const readJson = path => JSON.parse(readFileSync(path, "utf8"));
export const words = text => String(text ?? "").split(/\s+/).filter(Boolean).length;

export function loadScenario(id) {
  const file = join(harnessRoot, "evals", "scenarios", id, "scenario.json");
  if (!existsSync(file)) throw new Error(`unknown scenario: ${id} (no ${file})`);
  return readJson(file);
}

export const scenarioIds = () => readdirSync(join(harnessRoot, "evals", "scenarios"))
  .filter(name => existsSync(join(harnessRoot, "evals", "scenarios", name, "scenario.json")));

// Every run directory below an output folder: <out>/<scenario>/<variant>/<rep>/ with meta.json.
export function runDirs(out) {
  const found = [];
  const walk = (dir, depth) => {
    if (existsSync(join(dir, "meta.json"))) { found.push(dir); return; }
    if (depth > 3) return;
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (!name.startsWith(".") && statSync(path).isDirectory() && name !== "project" && name !== "pristine") walk(path, depth + 1);
    }
  };
  walk(out, 0);
  return found.sort();
}

export function promptFor(scenario, projectDir) {
  return `You are taking part in a controlled experiment. Act exactly as the LiaAgent Teaching-Agent would in a real
Claude Code session in the project folder \`${projectDir}\` (the project root). Work ONLY inside that folder.
Run shell commands as single commands with \`env -C ${projectDir} …\` (no \`cd … &&\`).

Setup:
- Normally \`CLAUDE.md\` (or \`AGENTS.md\`) in the project root is loaded as your instructions. Read it first and
  follow it exactly, including its "On Activation" steps and every reading rule for the command below. Follow
  the specs as written; take no shortcut they forbid and read no file they do not ask for.
- ${scenario.mode === "terminal" ? "Terminal mode: there is NO `liascript` MCP server and no browser (the MCP gate is closed)." : "Preview mode as the specs describe."}
  Today is ${scenario.today} (Europe/Berlin).
- There is no live instructor. Whenever the specs make you ask the instructor and wait, write the message
  exactly as you would show it, then continue with the scripted reply, in order of the questions they answer:
${scenario.replies.map((reply, index) => `  ${index + 1}. ${reply}`).join("\n")}
- A confirmation the specs want in the terminal (git, installs) → "Nein"; continue without it.

The instructor types:

${scenario.command}

Carry the task out completely, including every write and script the specs require.

At the end, write \`TRANSCRIPT.md\` in the project folder with exactly three sections:
## Messages — every message you would have shown the instructor, verbatim and in order, each followed by the scripted reply you used.
## Files read — every file you read, in order, one per line as \`N. path (complete)\` or \`N. path (partial: lines a–b, what)\`, paths relative to the project folder.
## Commands — every shell command you ran, in order, with its exit code.
`;
}
