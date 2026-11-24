# JUDGE-C – blind evaluation of `:build-session 2` (runs X and Y)

Sources: `blindC/C-X/*`, `blindC/C-Y/*`; rules from `src-tasks/specs/tasks/build-session.md`, `checklists/course-quality-checklist.md`, `templates/session-validation.yaml`, `data/duration-heuristic.md`, `data/cheat-sheet/06-quizzes.md`, `09-audio-sections.md`.

| # | Item | X | Y |
|---|------|---|---|
| 1 | Before the start | ✅ Open decision asked first („Welches Thema gilt für Lernseite 2?“); confirmation names material, header macros („Im Kopf der Kursdatei ergänze ich zwei kurze Rückmeldesätze“), report, status, decision, duration, overview; „etwa 10 Minuten“ (honest for 5 slides, no images) | partial – open decision first ✅, confirmation names writes and „Dauer: etwa 10 Minuten“, but omits the header-macro write to README.md (only mentioned afterwards: „Im Kopf der Kursdatei stehen jetzt zwei Rückmeldungen“); plus a second mid-run question (skill install, „Darf ich sie nur für dieses Projekt installieren?“) after the single start confirmation |
| 2 | Material vs sketch/didactics/outline | ✅ Five slides as sketched, single choice with the three sketched options, four selection lists, hint text from the sketch, survey; companion „du“, ▶ on every text; no task type changed | ✅ Same structure and task types; texts split into short read-aloud chunks (better fit to cognitive-load); no task type changed |
| 3 | Quality for grade 6 | partial – correct core content, options equal in form, controls named (▶, Glühbirne 💡); but an added example is misleading: „Das nennt man Abfließen. Du kennst das von der Straße: Nach dem Regen fließt das Wasser in den Gully.“ (street drains feed the sewer, not „Bäche und Flüsse“); long read-aloud blocks of 6–7 sentences | ✅ Correct content, options „aus feinem grauem Rauch / aus winzigen Wassertröpfchen / aus unsichtbarem Wasserdampf“ equal in form, correct answer in the middle; controls named as shown („Klicke auf ▶“, „Knopf zum Prüfen“, „Knopf zum Senden“) |
| 4 | LiaScript syntax (checked in README.final.md) | ✅ `    {{|>}}` blocks as in cheat sheet §14, `{|>}{…}` on options/hints, `data-text-solved="@ok"`, macros in header, selection lists with line breaks, `[[?]]` hint, survey `[[wolke]]` | ✅ Same patterns; selection lists on one line with „→“; header macros present |
| 5 | Check loop | partial – one iteration, report once ✅; but the stale sketch sentence „etwa 12 bis 13 Minuten“ (checklist line 76, `[mechanical]`, „describe the material as it is now“) was only recorded as a „Hinweis“ under ✅ „Unit entry“ instead of being fixed in the loop | ✅ The same `[mechanical]` FAIL was found, fixed and re-checked, report written after the fix and the partial re-check named: „in diesem Durchgang entfernt; nachgeprüft: nur dieser Eintrag (Suche nach der alten Schätzung)“; fix listed under „Was gut ist“ per `result_rules` 0 |
| 6 | Report | ✅ „bestanden – 3 Punkte zu entscheiden“, usable line, unverified facts listed per page, `Result: PASS with concerns`, Done ❌; duration estimate „etwa 325 Wörter … = etwa 8 Minuten“ (actual read-aloud text ≈ 385 words – modest understatement) | partial – outcome words, usable line, unverified facts, Done ❌ all correct; but the duration hint rests on „etwa 230 Wörter Text“ while the read-aloud text is ≈ 365 words (understated by about a third) |
| 7 | Writes | ✅ named: „Schreibvorgänge: 7 (Kursdatei 2, Planung 5 – davon 4 für die Übersicht)“ – above target (4 overview writes), but named | ✅ „Kursdatei 2 · journal.md 3 (Prüfbericht mit Korrektur, gemessene Dauer, Übersicht)“ – close to target, named |
| 8 | Overview / validator | ✅ write-dashboard.mjs, validate.txt „Exit code: 0“ | ✅ write-dashboard.mjs (one rejected attempt left the journal unchanged), „Exit code: 0“ |
| 9 | Closing summary | ✅ usable line before outcome, outcome words, „Korrekturen … keine“, unverified facts numbered, one learner offer (`:create-learner-persona`), next step `:validate-course 2`, runs line in terminal | ✅ usable first, outcome, fix with before → after, unverified facts, one learner offer, next step, runs line |
| 10 | Scope | ✅ unit 1 untouched (only shared header macros added, announced); journal changes limited to unit 2, overview, decisions | ✅ unit 1 untouched; the sketch-summary sentence removed is a checklist-sanctioned mechanical fix, listed with before → after |
| 11 | Language / address | ✅ German, „Sie“ / „du“ (minor: „Tippe“ where the voice sample says „Klicke“) | ✅ German, „Sie“ / „du“ |
| 12 | Other harm / errors | X: measured duration contradicts itself – journal decision „vorbereitet in 3 Minuten“ vs closing summary „Vorbereitet in 5 Minuten (gemessen)“; Gully example (item 3); 4 overview writes where 1 is the target | Y: mid-run install question during an unattended run; understated word count (item 6); header write not named in the start confirmation (item 1) |

## Totals

- **X: 10 / 11** (✅ 1,2,4,6,7,8,9,10,11 · partial 3,5)
- **Y: 10 / 11** (✅ 2,3,4,5,7,8,9,10,11 · partial 1,6)

## Verdict

**Y better (narrowly; tied on points).** Deciding items: **5** – Y applied the checklist's `[mechanical]` unit-entry fix inside the loop and reported it as the rules require, while X left a known `[mechanical]` finding as a hint under ✅; **12** – X's measured duration contradicts itself (3 vs 5 minutes), and X's Gully example is factually misleading for grade 6. Y's weaknesses (header write missing from the confirmation, a mid-run install question, an understated word count) are smaller and do not touch the material's correctness.

## Weaknesses in both runs

No item is failed (❌) by both runs. Shared weaknesses:
- Both wrote an unconditional „Super gemacht!“ on „Geschafft!“, even though the project rule asks for „kurzes und ehrliches Lob“, and then flagged their own text as a concern.
- Both understate the read-aloud word count in the duration hint.
- Neither could render the page (no DevServer). Both say so correctly.

## Entblindung (nach der Bewertung)
- C-X = run-C-skills
- C-Y = run-C-tasks
