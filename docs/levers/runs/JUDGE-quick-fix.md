# Blind evaluation – `:quick-fix 1` (scenarios A and B)

Rules used: `src-tasks/specs/tasks/quick-fix.md`, `templates/session-validation.yaml`, `tasks/validate-course.md` (Short re-check, One unit, one run, Course result), `data/liascript-cheat-sheet.md` → `cheat-sheet/06-quizzes.md` (Quizzes for young learners, No surface cues).
Scoring: ✅ = 1, partial = 0.5, ❌ = 0, n.a. not counted. For item 14, ✅ means nothing run-specific was found, partial means minor rule breaks, ❌ means something wrong or misleading was written for the instructor.

Same in every run (environment, not scored): no browser and no DevServer, so `check-material.mjs` checked the source only. All runs therefore added the "short re-check open" suffix, which is the correct outcome.

---

## Scenario A – quiz answer gives itself away; unit checked but not approved

### A-R1

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | Msg 1: „Die Änderung ist fertig, wenn keine Antwort sich mehr durch Länge oder Bauart verrät und die Folie die Syntaxprüfung besteht.“ |
| 2 | partial | Msg 2 shows page title, before → after, and Speichern / Etwas ändern. But the transcript says: „the material edit (and the check-material run) were executed in my session before I had formulated Message 2“, so the write came before the confirmation. |
| 3 | ✅ | README.diff touches only the three option lines. ▶ was added to each option because the narrator is set, as the cheat-sheet pattern asks, and this was shown in 2a. |
| 4 | ✅ | „Das Wasser wird zu Regen./Dampf./Schnee.“: same length, same structure, same first words. Suits grade 6 and read-aloud. |
| 5 | partial | Writing rule proposed (Msg 4, `:save-decision`), but the run never reports that it searched for the pattern in the unit or units. |
| 6 | partial | Scoped syntax check and `check-material` were run and reported honestly („Nicht gerendert …“). No tone or persona check is mentioned. |
| 7 | ✅ | „24.11.2026 · Quiz: Was passiert zuerst? · … · Mini-Prüfung: … – nicht gerendert, die Vorschau ließ sich nicht starten“ |
| 8 | ✅ | Outcome „bestanden (12.11.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen“. The suffix is explained with „etwa 2 Minuten“. |
| 9 | partial | One map (11 replacements) written after `check-material`. However, the `find.mjs` search (cmd 4) covered only „freigegeben\|approved\|Was passiert zuerst“, not the old wording. Technical Recommended Actions were updated. |
| 10 | ✅ | `write-dashboard.mjs` ran last (cmds 18, 21). validate.txt exit 0. |
| 11 | ✅ | Summary rewritten in the same map; `Result: PASS with concerns`, „noch nicht bereit zum Veröffentlichen“. |
| 12 | ✅ | Three-choice form; „- **24.11.2026:** Material freigegeben“; `:try-as-learner 1` named once as the next step in the preview (`:open-chat`). |
| 13 | ✅ | German, „Sie“ throughout. |
| 14 | partial | Shell rule broken by `ls -la` (cmd 1, self-reported). The write before confirmation is already scored under item 2. |

**Total: 11.5 / 14**

### A-R3

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | Msg 1: „fertig, wenn alle drei Antworten etwa gleich lang sind, gleich anfangen … und die Materialprüfung … nichts mehr meldet“ |
| 2 | ✅ | Msg 2: the full quiz, before → after for each option, Speichern / Etwas ändern. |
| 3 | ✅ | Only the three option lines changed. ▶ was disclosed and justified. |
| 4 | partial | „Es regnet./Es verdunstet./Es schneit.“ The correct option is still the longest (14 vs 11 characters). It is also the only process verb and the lesson's technical term among two weather words, so it is the "scientific-sounding" pick. The run itself notes: „nur noch über das Wort ‚verdunstet' zu finden“. |
| 5 | partial | Rule offered in Msg 5 (option 2). No search across units is reported. |
| 6 | partial | Syntax and `check-material` (source only, reported honestly). No tone check. |
| 7 | ✅ | „24.11.2026 · Quiz: Was passiert zuerst? · … · Mini-Prüfung (Quelltext geprüft; … nicht gerendert – kein Browser verfügbar)“ |
| 8 | ✅ | Suffix present. „etwa 5 Minuten“ explained in Msg 3. |
| 9 | ✅ | `find.mjs` for page title, old wording and „verdunstet“ (cmd 18), then one map (cmd 20) after `check-material` (cmd 17). |
| 10 | ✅ | `write-dashboard` last. Validator exit 0. |
| 11 | ✅ | Summary in the same map; `Result: PASS with concerns`. |
| 12 | ✅ | Form with three choices; „Material freigegeben“ dated; `:try-as-learner 1` offered once, via `:open-chat`. |
| 13 | ✅ | German, „Sie“. |
| 14 | ✅ | None run-specific. |

**Total: 12.5 / 14**

### A-R6

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | Msg 2: „fertig, wenn keine Antwort durch Länge, Satzbau oder Wortwahl auffällt und nur Wissen über den Kreislauf zur richtigen führt“ |
| 2 | ✅ | Msg 3: before → after with the hint line, Speichern / Etwas ändern. The material write came only after that (Msg 4). |
| 3 | ✅ | Only the option lines changed. The replaced distractor (Schnee → Wolken) was inside the confirmed scope („nennen je einen Schritt des Wasserkreislaufs“). |
| 4 | ✅ | „Das Wasser fällt als Regen herunter. / verdunstet in die Luft. / bildet am Himmel Wolken.“: 34–37 characters, same subject. All three are steps of the cycle, so only knowing the order finds the answer. |
| 5 | ✅ | „Das Muster … habe ich in der ganzen Lernseite gesucht: Es gibt nur dieses eine Quiz“ plus a proposed `:save-decision`. |
| 6 | ✅ | Syntax ✅, answer patterns (script) ✅, „Ton: du-Anrede, kurze Sätze wie im Kursrahmen ✅“, browser rendering „nicht geprüft“. |
| 7 | ✅ | „24.11.2026 · Quiz: Was passiert zuerst? · … · Mini-Prüfung: Quelltext geprüft, Darstellung im Browser war nicht möglich“ |
| 8 | ✅ | Suffix present; „etwa 5 Minuten“. |
| 9 | ✅ | `find.mjs` (cmd 15), then one map (cmd 18) after the mini-check (cmd 14). Technical Recommended Actions updated. |
| 10 | ✅ | `write-dashboard` last. Validator exit 0. |
| 11 | ✅ | Summary in the same map; `Result: PASS with concerns`. |
| 12 | ✅ | Form; dated approval; `:try-as-learner 1` via `:open-chat` (Msg 7, option 3). |
| 13 | ✅ | German, „Sie“. |
| 14 | partial | `now.mjs` ran only at the end (cmd 25), after the dates were written. Also, the approval write refreshed the course summary only in its comment: the visible „Lernseiten“ line does not name the approval. |

**Total: 13.5 / 14**

### A-R7

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | Msg 2: „fertig, wenn keine Antwort mehr durch Länge oder Bauart auffällt (das Prüfskript meldet … nichts) und die Quizfolie die Syntaxprüfung besteht“ |
| 2 | ✅ | Msg 3: before → after, Speichern / Etwas ändern. |
| 3 | ✅ | Only the three option lines changed. ▶ was disclosed. |
| 4 | partial | Same wording as A-R3 („Es verdunstet.“). The correct option is still the longest and the only technical term among two weather words. |
| 5 | partial | Writing rule proposed (Msg 4). No search across units is reported. |
| 6 | partial | Syntax and answer patterns (source only), reported honestly. No tone check. |
| 7 | ✅ | „24.11.2026 · Quiz: Was passiert zuerst? · … · Kurzprüfung (Syntax und Antwortmuster; nicht im Browser angezeigt)“ |
| 8 | ✅ | Suffix present; „etwa 2 Minuten“. |
| 9 | ✅ | `find.mjs` with the old wording (cmd 11) and `now.mjs`, then one map (cmd 18) after `check-material` (cmd 10). |
| 10 | partial | `write-dashboard` ran last and the validator passed, but the draft dropped `next.label` (journal.diff: the `"label"` line was removed and not replaced). `project-dashboard.yaml` lists `label` among the `next` fields. |
| 11 | partial | Summary was in the same map and `PASS with concerns`, but its outcome uses a second wording, „bestanden – kurze Nachprüfung von Lernseite 1 offen“. `outcome_words` says one wording per state. |
| 12 | ✅ | Form; dated approval; `:try-as-learner 1` offered once (Msg 6). |
| 13 | ✅ | German, „Sie“. |
| 14 | ✅ | None beyond the points above. |

**Total: 11.5 / 14**

---

## Scenario B – typo; unit checked and approved

### B-R2

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | „fertig, wenn auf der Folie ‚Grundwasser' steht und das falsche Wort nirgends mehr … vorkommt“ |
| 2 | ✅ | Msg 2: page, before → after, Speichern / Etwas ändern. |
| 3 | ✅ | One word changed. |
| 4 | ✅ | „Grundwaser“ → „Grundwasser“. |
| 5 | n.a. | |
| 6 | ✅ | Syntax of the line; tone „passt zum Kursrahmen … nur gegen den Kursrahmen geprüft“; rendering „nicht geprüft“. |
| 7 | ✅ | „24.11.2026 · Wo ist das Wasser? · Tippfehler … · Mini-Check: … Darstellung nicht geprüft – kein Browser verfügbar“ |
| 8 | ✅ | Suffix present; „etwa 2 Minuten“. |
| 9 | ✅ | `find.mjs` for „grundwas“ and the page title (cmds 5, 9), then one map (cmd 11) after `check-material` (cmd 8). |
| 10 | ✅ | `write-dashboard` last. Validator exit 0. |
| 11 | ✅ | Summary in the same map; `PASS with concerns`; „bis dahin bleibt es gesperrt“. |
| 12 | ✅ | No form, no new approval entry. „Ihre Freigabe vom 12.11.2026 bleibt bestehen.“ |
| 13 | ✅ | German, „Sie“. |
| 14 | partial | `now.mjs` was never run. The date was written without the only allowed time source. |

**Total: 12.5 / 13**

### B-R4

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | „fertig, wenn … ‚Grundwasser' richtig steht, der Rest der Folie unverändert ist und die Syntaxprüfung … bestanden ist“ |
| 2 | ✅ | Msg 2: before → after, Speichern / Etwas ändern. |
| 3 | ✅ | One word changed. |
| 4 | ✅ | Correct. |
| 5 | n.a. | |
| 6 | ✅ | Syntax passed. Rendering not possible, said so. „Die Didaktik ist … zurückgestellt, darum gab es keinen Abgleich“: an honest skip. |
| 7 | ✅ | „24.11.2026 · Wo ist das Wasser? · … · Mini-Prüfung: Syntax der Folie geprüft; ohne Browser …“ |
| 8 | ✅ | Suffix present; „etwa 2 Minuten“. |
| 9 | partial | One map after the mini-check, but `find.mjs` searched only „grundwas“ (cmd 8). The page title, which the spec names, was not searched. |
| 10 | ✅ | `write-dashboard` last. Validator exit 0. |
| 11 | ✅ | Summary in the same map; `PASS with concerns`. |
| 12 | ✅ | No form, no new approval entry. |
| 13 | ✅ | German, „Sie“. |
| 14 | ❌ | Rewrote the overview's unit summary without being asked, outside the fix, and made it factually wrong: „…und was nach dem Verdunsten passiert“. The quiz asks what happens *first*. |

**Total: 11.5 / 13**

### B-R5

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | „fertig, wenn das Wort dort richtig geschrieben ist und sonst nichts … geändert wurde“ |
| 2 | ✅ | Msg 2: before → after, Speichern / Etwas ändern. |
| 3 | ✅ | One word changed. |
| 4 | ✅ | Correct. |
| 5 | n.a. | |
| 6 | partial | Syntax and script run (source only), reported honestly. No tone check mentioned. |
| 7 | ✅ | „24.11.2026 · Wo ist das Wasser? · … · Kurzprüfung: Quelltext geprüft; die Seite wurde nicht angezeigt …“ |
| 8 | ✅ | Suffix present; „etwa 2 Minuten“. |
| 9 | ✅ | `find.mjs` for „grundwas“ and the page title (cmds 8, 17), then one map (cmd 22) after `check-material` (cmd 12). |
| 10 | ✅ | `write-dashboard` last. Validator exit 0. |
| 11 | partial | Same map and `PASS with concerns`, but the summary outcome keeps the old date: „bestanden (12.11.2026) – …“ while `Date: 2026-11-24`. |
| 12 | ✅ | No form, no new approval entry. |
| 13 | ✅ | German, „Sie“. |
| 14 | ✅ | None. |

**Total: 12 / 13**

### B-R8

| # | Score | Evidence |
|---|---|---|
| 1 | ✅ | „Fertig ist die Änderung, wenn auf dieser Seite ‚Grundwasser' richtig geschrieben steht und sonst nichts verändert ist.“ |
| 2 | ✅ | Msg 2: before → after, Speichern / Etwas ändern. |
| 3 | ✅ | One word changed. |
| 4 | ✅ | Correct. |
| 5 | n.a. | |
| 6 | ✅ | Syntax of the line; „Ton und Anrede … unverändert“; rendering not possible, said so. |
| 7 | ✅ | „24.11.2026 · Wo ist das Wasser? · … · Kurzprüfung (Syntax der geänderten Zeile; … nicht angezeigt …)“ |
| 8 | partial | Outcome suffix is correct. Where the instructor first meets the short re-check (Msg 5), the duration („about {m} minutes“) is missing, which `outcome_words` asks for. |
| 9 | ✅ | `find.mjs` on README and journal (cmds 3, 9), then one map (cmd 13) after `check-material` (cmd 8). |
| 10 | ✅ | `write-dashboard` last. Validator exit 0. |
| 11 | ✅ | Summary in the same map; `PASS with concerns`. |
| 12 | ✅ | No form, no new approval entry. |
| 13 | ✅ | German, „Sie“. |
| 14 | ✅ | None. It also flagged its uncertainty about the narrator-block count honestly. |

**Total: 12.5 / 13**

---

## Totals and ranking

| Run | Score | Max | % |
|---|---|---|---|
| A-R1 | 11.5 | 14 | 82 % |
| A-R3 | 12.5 | 14 | 89 % |
| A-R6 | 13.5 | 14 | 96 % |
| A-R7 | 11.5 | 14 | 82 % |
| B-R2 | 12.5 | 13 | 96 % |
| B-R4 | 11.5 | 13 | 88 % |
| B-R5 | 12 | 13 | 92 % |
| B-R8 | 12.5 | 13 | 96 % |

**Scenario A:** 1. A-R6 (13.5) · 2. A-R3 (12.5) · 3. A-R1 and A-R7 tied (11.5). A-R1's break is more serious: it wrote before the confirmation. A-R7's breaks are format slips.
**Scenario B:** 1. B-R2 and B-R8 tied (12.5) · 3. B-R5 (12) · 4. B-R4 (11.5; the only run that wrote a factually wrong text).

---

## Failing in most runs (likely spec problems)

- **Item 5, search across units not reported** (3 of 4 A runs). All proposed the writing rule, but only A-R6 said where it searched. The spec says „searched in every unit“ but does not ask for the search to be reported. In a one-unit course the agents treat it as implicit.
- **Item 6, tone check vs. Didactics** (missing in 4 of 8: A-R1, A-R3, A-R7, B-R5). On a mini course `## Didactics` is `state: later`, and quick-fix step 3 does not say what to compare tone against then. Runs that checked it fell back to the course frame (B-R2, A-R6) or skipped it honestly (B-R4).
- **Not scored, seen in 6 of 8 runs** (A-R3, A-R7, B-R2, B-R4, B-R5, B-R8): the report's technical „Recommended Actions: 1. Keine.“ was left standing while a short re-check is open. The quick-fix "find first" list does not name it.
- **Not scored, all 8 runs:** the existing check report claims „Jeder Text und jede Antwort hat ▶ zum Vorlesen“, which is untrue (the hint has no ▶). Every run found this and other out-of-scope findings (answer cue, player default feedback, solution button) through `check-material` and named them only in the chat. The spec has no path for a mini-check finding outside the changed area to reach the report, so the stale "What works" line stays.
- **Not scored, all 8 runs:** the technical table keeps Done ✅ (per `session-skeleton.yaml`, only `:validate-course` resets it), while the derived overview reports „0 done“ for the same unit. The two state sources disagree during a short re-check.
- **Item 4, wording cue** (2 of 4 A runs): „Es verdunstet.“ beside „Es regnet./Es schneit.“ The "No surface cues" rule names length, grammatical form and first word, but not "the only technical or scientific-sounding term among everyday words". Two runs met the letter of the rule and kept a semantic cue.

## Failing in single runs

- A-R1: material written before „Speichern“ (self-reported); `ls -la` shell use; `find.mjs` search left out the old wording.
- A-R6: `now.mjs` run only after the dates were written; the approval write refreshed the course summary only in its comment.
- A-R7: `next.label` dropped from the overview; a second wording for the short re-check state in the course summary.
- B-R2: `now.mjs` never run.
- B-R4: wrong, unasked rewrite of the overview's unit summary („was nach dem Verdunsten passiert“); `find.mjs` without the page title.
- B-R5: course-summary outcome dated 12.11.2026 next to `Date: 2026-11-24`.
- B-R8: no duration in the first explanation of the short re-check.

## Entblindung (nach der Bewertung)
- A-R3 = run-A-tasks-1
- A-R6 = run-A-tasks-2
- A-R1 = run-A-skills-1
- A-R7 = run-A-skills-2
- B-R2 = run-B-tasks-1
- B-R8 = run-B-tasks-2
- B-R4 = run-B-skills-1
- B-R5 = run-B-skills-2
