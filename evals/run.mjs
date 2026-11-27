#!/usr/bin/env node
// Evaluation harness – prepare and execute runs (evals/README.md).
//
//   node evals/run.mjs prepare --variants base=main,e1=experiment/e1 [--scenarios a,b] [--reps 3] --out evals/.runs/<name>
//   node evals/run.mjs exec    --out <dir> --cmd "claude -p --output-format stream-json --verbose --permission-mode acceptEdits" [--parallel 2]
//   node evals/run.mjs list    --out <dir>      # prompts for running the agents by hand or with subagents
//
// A variant is a git ref of this repository; its specs are exported into a fresh project folder per run, the
// scenario's fixture comes from the harness checkout (the same for every variant).
import { mkdirSync, writeFileSync, readFileSync, existsSync, cpSync, rmSync, createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { harnessRoot, loadScenario, scenarioIds, runDirs, promptFor, readJson } from "./lib.mjs";

const args = process.argv.slice(2);
const command = args[0];
const option = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };

function exportRef(ref, target) {
  mkdirSync(target, { recursive: true });
  const archive = spawnSync("git", ["-C", harnessRoot, "archive", "--format=tar", ref], { maxBuffer: 1 << 30 });
  if (archive.status !== 0) throw new Error(`git archive ${ref}: ${archive.stderr}`);
  const untar = spawnSync("tar", ["-x", "-C", target], { input: archive.stdout });
  if (untar.status !== 0) throw new Error(`tar: ${untar.stderr}`);
  // The agent sees the course project, not the experiment records.
  for (const dir of ["evals", "docs"]) rmSync(join(target, dir), { recursive: true, force: true });
  return spawnSync("git", ["-C", harnessRoot, "rev-parse", "--short", ref], { encoding: "utf8" }).stdout.trim();
}

function prepare() {
  const out = resolve(option("out") ?? `evals/.runs/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`);
  // A variant is a git ref, optionally with an instruction candidate laid over it: name=ref+evals/optimize/candidates/<id>
  // (every file under the candidate's overlay/ folder replaces the file at the same path; the original stays
  // the baseline variant without "+").
  const variants = (option("variants") ?? "base=HEAD").split(",").map(item => {
    const [name, spec] = item.split("=");
    const [ref, candidate] = (spec ?? name).split("+");
    return { name, ref, candidate };
  });
  const scenarios = (option("scenarios") ?? scenarioIds().join(",")).split(",").map(loadScenario);
  const reps = Number(option("reps", "3"));
  const withs = (option("with") ?? "").split(",").filter(Boolean).map(item => { const [from, to] = item.split("="); return { from: resolve(from), to }; });
  for (const scenario of scenarios) for (const variant of variants) for (let rep = 1; rep <= reps; rep++) {
    const dir = join(out, scenario.id, variant.name, String(rep));
    const project = join(dir, "project");
    rmSync(dir, { recursive: true, force: true });
    const commit = exportRef(variant.ref, project);
    if (variant.candidate) cpSync(join(harnessRoot, variant.candidate, "overlay"), project, { recursive: true });
    for (const [target, source] of Object.entries(scenario.fixture)) writeFileSync(join(project, target), readFileSync(join(harnessRoot, source)));
    for (const patch of scenario.patches ?? []) {
      const file = join(project, patch.file);
      const text = readFileSync(file, "utf8");
      if (!text.includes(patch.remove)) throw new Error(`${scenario.id}: patch text not found in ${patch.file}`);
      writeFileSync(file, text.replace(patch.remove, ""));
    }
    // --with <folder>=<path in project>: e.g. an installed skill, the same for every variant.
    for (const extra of withs) cpSync(extra.from, join(project, extra.to), { recursive: true });
    cpSync(project, join(dir, "pristine"), { recursive: true });
    writeFileSync(join(dir, "PROMPT.md"), promptFor(scenario, project));
    writeFileSync(join(dir, "meta.json"), JSON.stringify({ scenario: scenario.id, variant: variant.name, ref: variant.ref, ...(variant.candidate ? { candidate: variant.candidate } : {}), commit, rep, ...(withs.length ? { with: withs.map(extra => extra.to) } : {}) }, null, 1));
    console.log(`prepared ${scenario.id} · ${variant.name} (${commit}) · ${rep}`);
  }
  console.log(`\nRuns in ${out}\nNext: node evals/run.mjs exec --out ${out} --cmd "…"  (or run the prompts of "list" by hand), then node evals/grade.mjs --out ${out}`);
}

async function exec() {
  const out = resolve(option("out"));
  const cmd = option("cmd");
  if (!cmd) throw new Error("--cmd is required, e.g. \"claude -p --output-format stream-json --verbose --permission-mode acceptEdits\"");
  const parallel = Number(option("parallel", "1"));
  const queue = runDirs(out).filter(dir => !readJson(join(dir, "meta.json")).duration_ms);
  const one = dir => new Promise(done => {
    const started = Date.now();
    const child = spawn("sh", ["-c", cmd], { cwd: join(dir, "project"), stdio: ["pipe", "pipe", "pipe"] });
    child.stdout.pipe(createWriteStream(join(dir, "trace.jsonl")));
    child.stderr.pipe(createWriteStream(join(dir, "stderr.txt")));
    child.stdin.end(readFileSync(join(dir, "PROMPT.md")));
    child.on("close", code => {
      const meta = readJson(join(dir, "meta.json"));
      writeFileSync(join(dir, "meta.json"), JSON.stringify({ ...meta, exit: code, duration_ms: Date.now() - started }, null, 1));
      console.log(`done ${dir} (exit ${code}, ${Math.round((Date.now() - started) / 1000)} s)`);
      done();
    });
  });
  const workers = Array.from({ length: parallel }, async () => { while (queue.length) await one(queue.shift()); });
  await Promise.all(workers);
}

function list() {
  for (const dir of runDirs(resolve(option("out")))) {
    const meta = readJson(join(dir, "meta.json"));
    console.log(`${meta.scenario} · ${meta.variant} · ${meta.rep}${meta.duration_ms ? " (done)" : ""}\n  prompt: ${join(dir, "PROMPT.md")}`);
  }
}

if (command === "prepare") prepare();
else if (command === "exec") await exec();
else if (command === "list") list();
else { console.error("usage: node evals/run.mjs prepare|exec|list … (see the head of this file)"); process.exit(2); }
