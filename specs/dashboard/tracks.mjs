// Module for the dashboard scripts: track ids, step lists and when-needed sections per track.
// The course tracks (full, mini, convert, template): their steps and the sections a track sets to "when needed".
// Pure data and helpers, shared by journal-model.mjs, derive-dashboard.mjs and actions.mjs.
export const trackIds = ["full", "mini", "convert", "template"];

// The marker line directly under an unchanged heading: the section is not needed for this course yet.
export const laterMarker = "<!-- state: later -->";

const steps = {
  full: ["frame", "outline", "didactics", "blocks", "agenda", "material", "check", "publish"],
  mini: ["frame", "material", "check", "publish"],
  convert: ["frame", "outline", "look", "material", "check", "publish"],
  template: ["brief", "build", "try", "publish"]
};

export function stepsOf(track = "full", mode = null) {
  const list = steps[track] ?? steps.full;
  return track === "convert" && mode === "transfer" ? list.filter(step => step !== "outline") : [...list];
}

// Section keys the track sets to `later` when the course is set up. The full track marks only `## Agenda`, and only
// when the Course Profile says `Agenda required: no` (it comes when needed).
export function laterOf(track = "full", mode = null, { agendaRequired = null } = {}) {
  if (track === "mini") return ["Didactics", "Visual Identity", "Agenda", "Learner Personas", "Analysis Status"];
  if (track === "convert") {
    const rest = ["Didactics", "Agenda", "Learner Personas", "Analysis Status"];
    return mode === "transfer" ? ["Outline", ...rest] : rest;
  }
  if (track === "template") return ["Outline", "Didactics", "Visual Identity", "Agenda", "Sessions", "Learner Personas", "Validation", "Analysis Status"];
  return agendaRequired === "no" ? ["Agenda"] : [];
}

// The step titles of the light tracks in English (tasks/update-dashboard.md → Process steps per track); a language
// pack translates them under `lightStepTitles`. The full track's titles are those of the empty journal.
export const englishLightStepTitles = {
  frame: "Frame and learning objectives", outline: "Outline and learning objectives", look: "Look", material: "Write the material",
  check: "Check", publish: "Publish", brief: "Request and brief", build: "Build and test", try: "Try and approve"
};

// Marked sections that the overview does not list in process.later (never offered on a new light course).
export const laterHidden = ["Analysis Status"];

// The first non-empty line of a section body is the marker.
export const isLater = body => (String(body).split("\n").map(line => line.trim()).find(Boolean) ?? "") === laterMarker;

export const sectionSlug = key => key.toLowerCase().replace(/\s+/g, "-");
