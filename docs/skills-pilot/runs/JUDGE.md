# Blind evaluation – `:quick-fix 1`, scenarios A and B

Basis: `blind/{A-alt (X),A-neu (Y),B-alt (X),B-neu (Y)}/` (transcript, diffs, finals, validate.txt) against `specs/tasks/quick-fix.md`, `templates/session-validation.yaml`, `tasks/validate-course.md` (Short re-check, One unit, one run), `data/liascript-cheat-sheet.md` (No surface cues).

Scoring: ✅ = 1 · partial = 0.5 · ❌ = 0 · n.a. excluded.

---

## Scenario A – answer gives itself away, unit checked but not approved

| # | Item | A-alt (X) | A-neu (Y) |
|---|------|-----|-----|
| 1 | Scope + acceptance criterion before writing | ✅ Msg 1: „Die Änderung ist fertig, wenn keine Antwort durch Länge oder Satzbau auffällt, die richtige nicht mehr die längste ist und die Syntaxprüfung der Folie ohne Fehler bleibt.“ – Ja/Umfang anpassen | ✅ Msg 1: „Fertig ist die Änderung, wenn keine Antwort mehr durch Länge oder Bauart auffällt … und die Prüfung der Antwortmuster nichts mehr meldet.“ |
| 2 | Full wording, page title, before → after, Speichern/Etwas ändern | ✅ Msg 2: „Folie „Quiz: Was passiert zuerst?“ – vorher → nachher“, all three lines both ways, 1. Speichern 2. Etwas ändern; also announces the report/overview changes before the save | ✅ Msg 2: same, plus reasons (what is lost: „steigt als unsichtbarer Wasserdampf“) |
| 3 | Only the targeted change | ✅ README.diff: only the three option lines; `{|>}` read-aloud on options was announced in the scope (cheat-sheet pattern for new learner text) | ✅ README.diff: only the three option lines; `{|>}` announced and justified in Msg 2 |
| 4 | Content quality (no surface cue, grade 6, read aloud) | ✅ „Das Wasser fällt als Regen herunter. / Das Wasser verdunstet in die Luft. / Das Wasser friert und wird zu Eis.“ – 36/34/34 chars, same first words, correct not longest, three different verb frames so none is the odd one out; simple words | ✅ „… fällt als Regen herunter. / … wird warm und verdunstet. / … wird kalt und gefriert.“ – 34–36 chars, correct shares its frame with a distractor; explicitly reasoned that Regen/Schnee as a pair would have made the correct one the odd one out |
| 5 | Pattern searched course-wide, proposed as writing rule | ✅ find on quiz markers in README (cmd 17), check-material: „richtige Antwort deutlich am längsten – 0 von 1 Frage“ (= the whole light-track course); Msg 7 offers the rule via `:save-decision` | ✅ check-material over the whole README (= the only unit): „meldet für keine Antwort mehr …“; Msg 4: „ein Muster, kein Einzelfall … Regel für das Schreiben des Materials … (`:save-decision`)“ |
| 6 | Mini-validation: syntax scoped, check-material run/honest, tone vs Didactics | ✅ Msg 4: syntax of this slide PASS; check-material run, „Im Browser angezeigt: nicht möglich – … Vorschauserver startete hier nicht“; „Ton … nicht geprüft – Didaktik … nicht angelegt“ | ✅ Msg 3: syntax ok; „Die Seite selbst wurde nicht angezeigt, weil die Vorschau … nicht startete“; „Didaktik: keine geprüft … zurückgestellt“ |
| 7 | Dated line in „Nach der Prüfung geändert“ | ✅ „24.11.2026 · Quiz: Was passiert zuerst? · Die drei Antworten … · Kurzprüfung (… nicht im Browser angezeigt)“ | ✅ „24.11.2026 · Quiz: Was passiert zuerst? · die drei Antworten gleich lang und gleich gebaut … · Kurzprüfung; die Seite wurde nicht angezeigt …“ |
| 8 | Outcome suffix XOR re-checked | ✅ „bestanden (12.11.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen“, no „nachgeprüft“; explained „etwa 2 Minuten“ at first mention (Msg 2) | ✅ same suffix, no „nachgeprüft“; explained „etwa 3 Minuten“ (Msg 3) |
| 9 | Journal: find.mjs first, one map per fix, no stale to-do, status/Notes not hand-edited | ✅ cmd 19 find for page title/old wording → cmd 22 one map; approval in a second map (separate decision write, cmd 29); Notes cell set by write-dashboard (validator warning before, fixed after) | ✅ cmd 19 find → cmd 21 one map; approval map cmd 24; Notes via write-dashboard |
| 10 | Overview last via write-dashboard, validator passes | ✅ cmd 25/30 after the journal writes; validate.txt „OK … Exit code: 0“ | ✅ cmd 23/26; validate.txt „OK … Exit code: 0“ |
| 11 | Approval form (3 choices), one dated entry, course summary refreshed | partial – Msg 6 „Passt Lernseite 1 so? 1. Freigeben 2. Noch etwas ändern 3. Später ansehen“; one „**24.11.2026:** Material freigegeben“; summary rewritten (Date, outcome, Lernseiten, Material, steps). **Missing:** the once-only `:try-as-learner 1` offer after „Freigeben“ | partial – Msg 3 form with the three choices; one „**24.11.2026:** Material freigegeben“; summary rewritten. **Missing:** `:try-as-learner 1` offer |
| 12 | German, „Sie“ | ✅ throughout („Stimmt das so?“, „Wenn Sie speichern …“) | ✅ throughout |
| 13 | Other harm | partial – overview gets an unasked `decide` item („Gliederung und Lernseite beschreiben zwei Folien verschieden“) while the rewritten summary keeps „Zusammenhang: ✅ … in Gliederung und Seite gleich“ (self-contradiction, X even names it in Msg 4); unit summary carries a change remark („seit dem 24.11.2026 etwa gleich lang“) instead of describing the state | partial – same unasked `decide` item and same contradictory „Zusammenhang: ✅“ line; unit summary change remark („sind jetzt gleich lang“); additionally the course summary outcome is dated „bestanden (24.11.2026)“ although no check ran that day (report says 12.11.2026) |

**Totals A:** A-alt (X) **12 / 13** · A-neu (Y) **12 / 13**

**Verdict A: equivalent.** Both made the same correct, well-formed change with the full change path. Decisive differences are small and cancel out: Y gave the better content rationale (odd-one-out reasoning, what content is dropped, caught the visible solution button), X kept the course summary's check date correct and told the instructor openly that the overview's earlier „freigegeben“ had no decision entry behind it. If a tiebreak is forced, X has the one fewer factual error in the journal (item 13: Y's „bestanden (24.11.2026)“).

---

## Scenario B – typo „Grundwaser“, unit checked and approved

| # | Item | B-alt (X) | B-neu (Y) |
|---|------|-----|-----|
| 1 | Scope + acceptance criterion | ✅ Msg 1: „fertig, wenn das Wort auf der Folie richtig geschrieben ist und sonst nichts an der Seite verändert wurde“ | ✅ Msg 1: „fertig, wenn auf dieser Seite „Grundwasser“ richtig geschrieben steht und der Rest der Seite unverändert ist“ |
| 2 | Full wording, before → after, Speichern/Etwas ändern | ✅ Msg 2: „Vorher: `* im Boden – das nennt man Grundwaser` Nachher: `… Grundwasser`“; also previews the exact dated line and outcome suffix before saving | ✅ Msg 2: „gespeichert ist noch nichts“, vorher/nachher line, notes read-aloud text unaffected |
| 3 | Only the targeted change | ✅ README.diff: one line | ✅ README.diff: one line |
| 4 | Content quality | ✅ „Grundwasser“ correct; read-aloud text checked („enthält das Wort nicht“) | ✅ same |
| 5 | Pattern search / rule | n.a. | n.a. |
| 6 | Mini-validation | ✅ syntax of the page; check-material run **before and after** („Ausgabe ist vor und nach der Änderung gleich – also keine Nebenwirkung“); render not possible stated; Didactics deferred stated | ✅ syntax of the changed spot; check-material run (cmd 12), „Im Browser angezeigt: nicht möglich“; Didactics deferred stated |
| 7 | Dated line | ✅ „24.11.2026 · Wo ist das Wasser? · Tippfehler „Grundwaser“ → „Grundwasser“ · Kurzprüfung (Syntax der Seite; ohne gerenderte Prüfung – kein Browser verfügbar)“ | ✅ „24.11.2026 · Wo ist das Wasser? · Tippfehler … korrigiert · Kurzprüfung (Seite nicht im Browser angezeigt)“ |
| 8 | Outcome suffix XOR re-checked | ✅ „bestanden (12.11.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen“; explained „etwa 2 Minuten“ (Msg 2) | ✅ same; explained „etwa 2 Minuten“ (Msg 3) |
| 9 | Journal writes | ✅ cmd 7 find („Wo ist das Wasser|Grundwas|im Boden“) → cmd 12 one map (2 replacements) | ✅ cmd 13 find → cmd 17 one map (2 replacements) |
| 10 | Overview last, validator | ✅ cmd 14 last; validate.txt OK, exit 0 | ✅ cmd 20 last; validate.txt OK, exit 0 |
| 11 | No approval form / no new approval entry | ✅ none; only the 12.11. entry | ✅ none; only the 12.11. entry |
| 12 | German, „Sie“ | ✅ | ✅ |
| 13 | Other harm | partial – `### Latest Validation Summary` left at „bereit zum Veröffentlichen“ / „1. Die Lernseite veröffentlichen.“ although the unit now has a short re-check open (light track: every write changing unit 1's report rewrites the summary); overview `next` lost its `label` field; unit summary gets a change remark | ❌ – same stale course summary; **overview misstates the approval:** `next.why` „danach geben Sie die Lernseite wieder frei“, subtitle and step results drop „freigegeben“ although the approval entry stands (approval is computed, never lapses by a fix); unasked removal of „jeder Text zum Vorlesen“ from the unit summary; Msg 3 tells the instructor the short re-check „nimmt die Quiz-Hinweise mit auf“, but the short re-check covers only the changed pages (`validate-course.md` → Short re-check) |

**Totals B:** B-alt (X) **11.5 / 12** · B-neu (Y) **11 / 12**

**Verdict B: X better.** Decided by item 13 (Y's overview tells the instructor a re-approval is needed and promises the re-check will cover the quiz – both wrong) and, secondarily, item 6 (X's before/after check-material comparison is a real regression check).

---

## Items where BOTH runs fail (point at the specs)

1. **A – `:try-as-learner 1` offer after „Freigeben“ missing in both.** The obligation sits mid-paragraph in quick-fix.md → Approval after a review („after "Approve" offer `:try-as-learner 1` once …“) and is not in the Steps list; both agents executed the steps and missed it. Move it into step 4 / a closing step.
2. **B – course summary not refreshed after a quick-fix on a light track (both).** quick-fix.md mentions the summary refresh only for the approval write; the obligation for a report change lives in validate-course.md → One unit, one run („Every later write that changes unit 1's report (a quick-fix re-check, …)“) – its example names only the re-check, so a plain quick-fix with „short re-check open“ reads as exempt. Result: the publishing gate text still says „bereit zum Veröffentlichen“ while the overview says „kurze Nachprüfung offen“. quick-fix.md's Change path should say it explicitly for every report-changing write on a light track.
3. **A – both add an unasked overview `decide` item (outline vs. page) and leave „Zusammenhang: ✅ … gleich“ in the summary they themselves rewrite.** No spec says where an observation found during a quick-fix goes (chat only? overview item? report point?), nor that a summary rewrite must drop a line the agent has just found false.
4. **A and B – both write change remarks into the overview's unit `summary`** („seit dem 24.11.2026 …“, „Seit der Prüfung ist ein Tippfehler …“). The „no remarks about fixed points“ rule exists for the journal unit entry (`Unit entry (journal)`) but quick-fix.md does not say it for the dashboard summary.
5. **B – both route the quiz rewording to `:coauthor-materials 1`,** although quick-fix.md's own table lists „Reword answer options … so that none gives the answer away“ as `:quick-fix`. The agents bundled it with feedback lines/tip read-aloud; the table gives no guidance for a bundle of small quiz fixes.
Entblindung: A: X=alt, Y=neu · B: X=alt, Y=neu (Zufallszuordnung, erst nach der Bewertung aufgelöst)
