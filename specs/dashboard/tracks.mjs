// Module for the dashboard scripts: track ids, step lists and when-needed sections per track.
// The course tracks (full, mini, convert, template, design): their steps and the sections a track sets to "when needed".
// Pure data and helpers, shared by journal-model.mjs, derive-dashboard.mjs and actions.mjs.
export const trackIds = ["full", "mini", "convert", "template", "design"];

// The marker line directly under an unchanged heading: the section is not needed for this course yet.
export const laterMarker = "<!-- state: later -->";

const steps = {
  full: ["frame", "outline", "didactics", "blocks", "agenda", "material", "check", "publish"],
  mini: ["frame", "material", "check", "publish"],
  convert: ["frame", "outline", "look", "material", "check", "publish"],
  template: ["brief", "build", "try", "publish"],
  design: ["frame", "look", "images", "check", "publish"]
};

// `mode`: the track's mode (journal-model.mjs → trackMode) – convert: transfer | rebuild; design: the scope
// look | images | both (missing = both).
export function stepsOf(track = "full", mode = null) {
  const list = steps[track] ?? steps.full;
  if (track === "convert" && mode === "transfer") return list.filter(step => step !== "outline");
  if (track === "design" && mode === "look") return list.filter(step => step !== "images");
  if (track === "design" && mode === "images") return list.filter(step => step !== "look");
  return [...list];
}

// Section keys the track sets to `later` when the course is set up. The full track marks only `## Agenda`, and only
// when the Course Profile says `Agenda required: no` (it comes when needed).
export function laterOf(track = "full", mode = null, { agendaRequired = null } = {}) {
  if (track === "mini") return ["Didactics", "Visual Identity", "Agenda", "Learner Personas", "Analysis Status"];
  if (track === "convert") {
    const rest = ["Didactics", "Agenda", "Learner Personas", "Analysis Status"];
    return mode === "transfer" ? ["Outline", ...rest] : rest;
  }
  if (track === "design") return ["Outline", "Didactics", "Agenda", "Learner Personas", "Analysis Status"];
  if (track === "template") return ["Outline", "Didactics", "Visual Identity", "Agenda", "Sessions", "Learner Personas", "Validation", "Analysis Status"];
  return agendaRequired === "no" ? ["Agenda"] : [];
}

// The step titles of the light tracks in English (tasks/update-dashboard.md → Process steps per track); a language
// pack translates them under `lightStepTitles`. The full track's titles are those of the empty journal.
export const englishLightStepTitles = {
  frame: "Frame and learning objectives", outline: "Outline and learning objectives", look: "Look", material: "Write the material",
  check: "Check", publish: "Publish", brief: "Request and brief", build: "Build and test", try: "Try and approve",
  images: "Images", frameDesign: "Frame"
};

// The title key of a step: the design track's frame has no learning objectives ("Frame"), every other step keeps its key.
export const stepTitleKey = (track, key) => track === "design" && key === "frame" ? "frameDesign" : key;

// Marked sections that the overview does not list in process.later (never offered on a new light course).
export const laterHidden = ["Analysis Status"];

// The first non-empty line of a section body is the marker.
export const isLater = body => (String(body).split("\n").map(line => line.trim()).find(Boolean) ?? "") === laterMarker;

export const sectionSlug = key => key.toLowerCase().replace(/\s+/g, "-");
