# update-dashboard — process steps per track

- **Process steps per track:** the course `process.steps` are the keys of `stepsOf(track, mode)`
  (`specs/dashboard/tracks.mjs`; `## Course Context` → `__Track:__`, missing = `full`), in order. Full track: the
  titles of the empty journal; else (translated) frame "Frame and learning objectives", outline "Outline and
  learning objectives", look "Look", material "Write the material", check "Check", publish "Publish", brief
  "Request and brief", build "Build and test", try "Try and approve"; design: Frame → Look → Images → Check → Publish
  (scope look drops Images, images drops Look). The first run on a light track replaces
  the empty journal's steps with that list, a track switch with a `note`; `validate-journal.mjs` checks the
  count. process.later is derived, never written by hand.
- Keep the process steps of the track stable from its first Dashboard on: the agenda step (full track)
  is listed as `optional` until `Agenda required` is set, then `planned` (yes) or
  removed with a `note` (no). The last step, publishing, is `planned` with its label when the course frame
  says learners open the course by link or platform (`Delivery:`, computed), otherwise `optional` until the
  publishing gate is PASS; `done` once `## Publishing` → `__State:__`
  starts with `published` (an English key, never translated). Its `why` never contradicts its state; where
  the link will live (a public page or the school's platform) is a `decide` item before the course check
  when the frame does not say it. Never let the number of steps change without a `note`.
