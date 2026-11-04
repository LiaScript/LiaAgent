// Module for derive-dashboard.mjs (no command of its own).
// Which action comes next: the main action of each unit (data/journal-links.md → the `### {n}. {title}` row)
// and the course's `next` (tasks/update-dashboard.md step 5 and Rules). It decides the command; the words
// for it come from the agent (kept while the command is right) or from the language pack's `actions`
// (English below), so that a changed command never keeps a label of another one.

// Label, title and why of each action in English; a language pack overrides them under `actions`.
// {unit} is the course's word for one unit, {n} its number, {id} a template id.
export const englishActions = {
  "init-course": { title: "Set the frame", label: "Start course", why: "Topic, target group and format are the basis for learning objectives and material." },
  "create-outline": { title: "Outline and learning objectives", label: "Create outline", why: "Clear learning objectives say what the learners can do at the end." },
  "create-didactics": { title: "Didactics", label: "Create didactics", why: "Methods, activity types and support that fit the objectives and the learners." },
  "suggest-templates": { title: "Templates for activities", label: "Suggest templates", why: "Ready-made building blocks for the activities – or the decision that none is needed." },
  "develop-template": { title: "Templates for activities", label: "Develop the building block {id}", why: "A building block of your own for an activity that no ready-made one covers." },
  "adopt-template": { title: "Templates for activities", label: "Try and adopt {id}", why: "The building block is ready: try it, then adopt it into the course." },
  "create-agenda": { title: "Agenda", label: "Create agenda", why: "Order and time of the units in your lessons." },
  "plan-unit": { label: "Plan {unit} {n}", why: "The planning sketch fixes content, activities and self-check before material is written." },
  "work-out": { label: "Work out {unit} {n}", why: "Texts, activities and self-check are written together; you see every part first." },
  "insert-images": { label: "Insert images for {unit} {n}", why: "The marked spots get their pictures." },
  "check-unit": { label: "Check {unit} {n}", why: "The check shows whether the material fits the objectives and the time." },
  "recheck-unit": { label: "Re-check {unit} {n}", why: "Points were changed after the check; a short re-check looks at the changed pages." },
  "revise-unit": { label: "Revise {unit} {n}", why: "The check found points that need correcting." },
  "resolve-concerns": { label: "Check {unit} {n}: resolve concerns", why: "The check passed with concerns that need your decision." },
  "approve-unit": { label: "Look at {unit} {n} and approve", why: "The check passed; the material waits for your approval." },
  "view-unit": { label: "How learners see it", why: "The checked material as the learners see it." },
  "check-course": { title: "Check and revise", label: "Check the course", why: "The course check comes before publishing." },
  publish: { title: "Publish", label: "Publish course", why: "The checked course gets a link to share." }
};

// The global process steps of templates/journal.md, by position: the title of `next` for a course action.
const courseStep = { "init-course": 0, "create-outline": 1, "create-didactics": 2, "suggest-templates": 3, "develop-template": 3, "adopt-template": 3, "create-agenda": 4, "check-course": 6, publish: 7 };
const agentIcons = { artist: "🎨", learner: "🧑‍🎓", development: "🛠️" };

// An action: the agent: link, the readable command (Dashboard) and the command as inline code (action line).
export function action(key, agent, cmd, params = {}, icon) {
  const query = Object.entries(params).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("&");
  const typed = `:${cmd}${Object.values(params).length ? ` ${Object.values(params).join(" ")}` : ""}`;
  return {
    key, agent, cmd, params,
    icon: icon ?? agentIcons[agent] ?? "▶️",
    href: `agent:${agent}/${cmd}${query ? `?${query}` : ""}`,
    command: agent === "teaching" ? typed : `:agent ${agent} → ${typed}`,
    code: agent === "teaching" ? `\`${typed}\`` : `\`:agent ${agent}\` → \`${typed}\``,
    also: []
  };
}

// The main action of a unit, or null where it needs a judgement the journal does not record (then the
// agent's action stays). `also`: other actions that are right in the same state (the agent's choice).
export function unitAction(unit) {
  const n = unit.n;
  const report = unit.report;
  const imagesOpen = unit.images.open > 0;
  if (!unit.heading && !unit.material) return action("plan-unit", "teaching", "create-session", { number: n });
  if (!unit.material) return { ...action("work-out", "teaching", "coauthor-materials", { number: n }), also: [`agent:teaching/build-session?number=${n}`] };
  // Before a check, and after changes since one: the open images first, then the (re-)check.
  if (!report?.result || report.changedSince) {
    if (imagesOpen) return action("insert-images", "artist", "create-image", { number: n });
    return action(report?.result ? "recheck-unit" : "check-unit", "teaching", "validate-course", { number: n }, "🔍");
  }
  // FAIL: a small correction (quick-fix with its description) is the agent's call, revising is the default.
  if (report.result === "FAIL") return { ...action("revise-unit", "teaching", "coauthor-materials", { number: n }, "✏️"), also: [`agent:teaching/quick-fix?number=${n}&`] };
  if (report.result === "PASS with concerns") return action("resolve-concerns", "teaching", "validate-course", { number: n }, "🔍");
  if (imagesOpen) return action("insert-images", "artist", "create-image", { number: n });
  // ⏳ items other than images (e.g. generated pictures): which step produces them is the agent's call.
  if (report.deferred) return null;
  if (!unit.done || !unit.approved) return action("approve-unit", "teaching", "preview", { file: n }, "👁");
  return action("view-unit", "teaching", "preview", { file: n }, "👁");
}

// Does a brief's `__Used in:__` name unit n: by number, by range ("2–4") or all of them ("all units")?
function names(usedIn, n) {
  return /\b(all|alle|allen)\b/i.test(usedIn)
    || [...usedIn.matchAll(/(\d+)\s*[–-]\s*(\d+)/g)].some(([, from, to]) => Number(n) >= Number(from) && Number(n) <= Number(to))
    || new RegExp(`(^|\\D)${n}(\\D|$)`).test(usedIn);
}

// The course's next action (tasks/update-dashboard.md step 5, Rules → Template step, first unit).
// `states`: unit number → derived state; `selected`: the recommended unit of the overview.
export function courseNext(journal, states, selected) {
  if (!journal.filled["Course Context"]) return action("init-course", "teaching", "init-course");
  if (!journal.filled.Outline) return action("create-outline", "teaching", "create-outline");
  if (!journal.filled.Didactics) return action("create-didactics", "teaching", "create-didactics");
  // The unit being worked on: the recommended one (also before its planning sketch) while it is not done,
  // else the first begun unit that is not done.
  const open = unit => states.get(unit.n) !== "done";
  const working = journal.units.find(unit => unit.n === String(selected) && open(unit))
    ?? journal.units.find(unit => (unit.heading || unit.material) && open(unit));
  const { selection, adopted, briefs } = journal.templates;
  const brief = briefs.find(item => !adopted.includes(item.id));
  if (brief && (!working || names(brief.usedIn, working.n))) {
    return brief.state === "ready to test"
      ? action("adopt-template", "teaching", "manage-templates", { name: brief.id })
      : action("develop-template", "development", "develop-template", { id: brief.id });
  }
  if (working) return unitAction(working);
  if (selection === "open" && !brief && !journal.hasAgenda) return action("suggest-templates", "teaching", "suggest-templates");
  if (journal.agendaRequired === "yes" && !journal.hasAgenda) return action("create-agenda", "teaching", "create-agenda");
  const unplanned = journal.units.find(unit => !unit.heading && !unit.material);
  if (unplanned) {
    const approvedOne = journal.units.some(unit => unit.approved);
    return { ...unitAction(unplanned), also: approvedOne ? [`agent:teaching/build-session?number=${unplanned.n}`] : [] };
  }
  if (journal.units.length && !(journal.validation.mode === "course" && journal.validation.result === "PASS")) return action("check-course", "teaching", "validate-course", {}, "🔍");
  if (journal.validation.mode === "course" && journal.validation.result === "PASS" && !journal.published) return action("publish", "development", "create-project", {}, "🚀");
  return null;
}

// Is an existing href right for this action: the same command with at least the same parameters (the agent
// may pass more, e.g. a type), or one of the agent's alternatives (`also`; ending in "&": any parameters after it).
const parse = href => {
  const [path, query = ""] = String(href ?? "").split("?");
  return { path, params: Object.fromEntries(query.split("&").filter(Boolean).map(pair => pair.split("=").map(decodeURIComponent))) };
};
const covers = (wanted, href) => {
  const [want, have] = [parse(wanted), parse(href)];
  return want.path === have.path && Object.entries(want.params).every(([name, value]) => have.params[name] === value);
};
export const accepts = (expected, href) => Boolean(href) && (covers(expected.href, href)
  || expected.also.some(other => other.endsWith("&") ? String(href).startsWith(other) : covers(other, href)));

// The words of an action in the course language, or null when no pack has them (the agent writes them).
export function wordsOf(expected, journal, values) {
  const words = journal.pack?.actions?.[expected.key] ?? (journal.language === "en" ? englishActions[expected.key] : null);
  if (!words) return null;
  const fill = text => text == null ? text : String(text).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  return { title: fill(words.title), label: fill(words.label), why: fill(words.why) };
}

// The title of `next`: the step it advances, as the process panel shows it (Rules → "next names one step").
export function nextTitle(expected, data, unitWord) {
  if (expected.key in courseStep) return data.process?.steps?.[courseStep[expected.key]]?.title ?? null;
  const n = expected.params.number ?? expected.params.file;
  const steps = data.units?.find(unit => String(unit.id) === String(n))?.process?.steps ?? [];
  const step = {
    "plan-unit": steps[0],
    "work-out": steps.find(item => /materi/i.test(item.title)) ?? steps[1],
    "insert-images": steps.find(item => /\b(bilder|images?|fotos?|photos?)\b/i.test(item.title)),
  }[expected.key] ?? (["check-unit", "recheck-unit", "revise-unit", "resolve-concerns"].includes(expected.key)
    ? steps.find(item => /prüf|check|review|revis/i.test(item.title)) ?? steps.at(-1) : null);
  return step ? `${step.title} – ${unitWord} ${n}` : null;
}

// Each unit's action line (`<!-- class="journal-actions" -->` below `### {n}. {title}`): its main action and,
// once the material exists, 👁 how the learners see it. A link that is already right keeps its words.
// Returns the new text, one entry per changed line, and the actions that still need words (no pack).
export function patchUnitActions(source, journal, wordsFor) {
  const lines = source.split("\n");
  const changes = [];
  const missing = [];
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)(\s*`[^`]*`(?:\s*→\s*`[^`]*`)?)?/g;
  for (const unit of journal.units.filter(item => item.heading)) {
    const at = lines.findIndex(line => line.startsWith(`### ${unit.n}. `));
    if (at < 0) continue;
    let marker = at + 1;
    while (marker < lines.length && !lines[marker].trim()) marker++;
    const hasLine = lines[marker]?.trim() === '<!-- class="journal-actions" -->';
    const old = hasLine ? lines[marker + 1] ?? "" : "";
    const links = [...old.matchAll(linkPattern)].map(match => ({ text: match[0].trim(), href: match[2] }));
    const expected = unitAction(unit);
    const preview = `agent:teaching/preview?file=${unit.n}`;
    let main = expected && links[0] && accepts(expected, links[0].href) ? links[0].text : null;
    if (!expected) main = links[0]?.text ?? null;
    else if (!main) {
      const words = wordsFor(expected, unit);
      if (!words) { missing.push({ where: `action line of ${unit.n}`, action: expected }); continue; }
      main = `[${expected.icon} ${words.label}](${expected.href}) ${expected.code}`;
    }
    const parts = [main];
    if (unit.material && expected?.href !== preview) {
      parts.push(links.find(link => link.href === preview)?.text ?? `[👁 ${journal.terms.viewMaterial}](${preview}) \`:preview ${unit.n}\``);
    }
    const next = parts.filter(Boolean).join(" · ");
    if (next === old) continue;
    changes.push({ path: `## Sessions action line ${unit.n}`, from: old || undefined, to: next, why: expected ? `main action: ${expected.command}` : "learners' view next to the main action" });
    if (hasLine) lines[marker + 1] = next;
    else lines.splice(at + 1, 0, "", '<!-- class="journal-actions" -->', next);
  }
  return { source: lines.join("\n"), changes, missing };
}
