# Skills-Pilot – Bericht

Stand: 2026-11-24 · Branch `experiment/skills` · Basis `main` @ 6608166

## Frage

Werden die Workflows kürzer und genauso gut, wenn Befehle als **Agent Skills** vorliegen (eine `SKILL.md`, die beim Aufruf geladen wird, plus `references/`, die nur gelesen werden, wenn ihre Bedingung gilt)?

## Aufbau des Experiments

- Pilot: `:quick-fix`, `:update-dashboard` und `:build-session` liegen als `.claude/skills/lia-*/` vor (`.agents/skills` verweist darauf, für Codex und andere Agenten).
- **Die Regeln sind wörtlich dieselben.** Kein Satz wurde gekürzt oder umformuliert. Geändert ist nur, wann er gelesen wird: Was nur in bestimmten Lagen gilt (nach einer Prüfung, Freigabe, Design-Strang, Aufruf aus build-session, alte Journal-Form …), steht in einer Referenz, und die `SKILL.md` sagt, wann sie zu lesen ist. Auch die Regelblätter `chat-dialog`, `chat-checks` und `journal-links` werden nur noch im jeweiligen Fall gelesen. Das ist die einzige inhaltliche Änderung. So misst der Pilot den reinen Struktureffekt.
- `CLAUDE.md`/`AGENTS.md` usw. werden wie bisher aus `teaching-agent.nav.yaml` gebaut und verweisen für die drei Befehle auf die Skills. Die alten Task-Dateien bleiben stehen, weil andere Tasks und `check-specs.mjs` sie noch nennen.
- `node --test specs/check-specs.mjs`: 120 von 120 Tests grün.

## Ergebnis 1 – Regelabdeckung

`node docs/skills-pilot/coverage.mjs`

| Befehl | geschützte Sätze | in `SKILL.md` | in Referenzen | fehlen |
|---|---|---|---|---|
| quick-fix | 21 | 7 | 14 | 0 |
| update-dashboard | 35 | 25 | 10 | 0 |
| build-session | 33 | 19 | 14 | 0 |

Alle 89 geschützten Sätze bleiben erhalten, aber 38 von ihnen werden jetzt nur bedingt geladen. Darin liegt das Risiko des Ansatzes (siehe Ergebnis 3). Von den alten Task-Zeilen sind alle bis auf Überschriften und Verweise auf die alten Pfade wörtlich erhalten.

## Ergebnis 2 – Lesemenge (Tokenlast), berechnet

`python3 docs/skills-pilot/measure.py` · Wörter wie in `docs/regeln-als-werkzeuge.md`. Tokens sind geschätzt (Zeichen / 4): Es gibt hier keinen Tokenizer, aussagekräftig sind die Verhältnisse. Die Grundlast pro Sitzung beträgt in beiden Varianten **10.616 Wörter** (`CLAUDE.md`, Teaching-YAML, `agent-links.md`, `chat-wording.md`) und ist in der Tabelle nicht enthalten.

| Szenario | alt | Skills | Ersparnis |
|---|---|---|---|
| Q1 quick-fix, Tippfehler, Terminal, ungeprüfte Einheit | 14.472 | 11.989 | 17 % |
| Q2 quick-fix, Vorschau-Chat, nach Prüfung, Lernendentext, Freigabe | 17.205 | 17.034 | 1 % |
| U1 update-dashboard, Routine, voller Kurs | 5.613 | 5.367 | 4 % |
| B1 build-session, freie Fotos, keine Profile, eine Korrekturrunde | 36.304 | 35.020 | 4 % |

**Die Skill-Aufteilung der Task-Dateien allein spart wenig.** Dafür gibt es zwei Gründe:
- Die drei Task-Dateien machen nur einen kleinen Teil dessen aus, was ein Befehl liest. Den Großteil ziehen sie nach sich: das Cheat-Sheet (3.519 Wörter), `validate-course.md` (4.996), `create-image.md` (3.827), die Checkliste (2.087) usw.
- In realistischen Lagen gelten die meisten Bedingungen, also werden die Referenzen ohnehin geladen.

Hinzu kommt: Skill-Beschreibungen werden bei jedem Start geladen und kosten hier im Schnitt 56 Wörter je Skill. Alle 31 Teaching-Befehle als Einzel-Skills ergäben etwa 1.750 Wörter, die Befehlstabelle in `CLAUDE.md` hat heute 586. **Einzel-Skills pro Befehl würden die Grundlast also erhöhen.**

### Projektionen: wo der Hebel wirklich liegt (gemessen an den echten Abschnittsgrößen)

| Projektion | alt | neu | Ersparnis |
|---|---|---|---|
| Q1 + P1: Cheat-Sheet nach Konstrukt geteilt, nur die betroffenen Abschnitte | 14.472 | 8.943 | **38 %** |
| Q2 + P1: dito (Quiz-Abschnitt + Fehlerliste) | 17.205 | 14.601 | 15 % |
| B1 + P2: build-session gibt Material, Bilder und Prüfung an Subagenten; gemessen wird der Hauptkontext | 36.304 | 15.993 | **56 %** |

P2 senkt nicht die Gesamtmenge, sondern die Menge im Hauptkontext, also dort, wo die Regeln laut euren Tandem-Tests verwittern.

## Ergebnis 3 – simulierte Läufe (Güte)

Vier Läufe mit Subagenten (Claude, gleiches Modell) in identischen Kopien eines Mini-Kurses (Fixture `journal-mini-approved.md` plus eine Lernseite mit Quiz, `runs/material-README.md`). Terminal-Modus, die Antworten der Lehrkraft waren vorgegeben:
- **A:** Lernseite geprüft, **nicht** freigegeben; „Quiz verrät die Lösung“.
- **B:** Lernseite geprüft **und** freigegeben; „Tippfehler Grundwaser“.

Bewertet hat ein Subagent **blind** nach 13 Punkten (`TESTPLAN.md`). Die Zuordnung X/Y wurde erst danach aufgelöst.

| | A alt | A neu | B alt | B neu |
|---|---|---|---|---|
| Pflicht-Referenzen geladen | – | ✅ after-check, journal-lines, approval | – | ✅ after-check, journal-lines; approval richtig **nicht** |
| Blindbewertung | 12 / 13 | 12 / 13 | 11,5 / 12 | 11 / 12 |
| Urteil | gleichwertig | | alt knapp besser | |
| gelesene Wörter (laut Protokoll) | 27.796 | 31.535 | 30.448 | 28.743 |
| Tokens des Laufs (Harness) | 173 k | 179 k | 163 k | 155 k |
| Dauer | 361 s | 330 s | 222 s | 214 s |
| Werkzeugaufrufe | 63 | 68 | 52 | 52 |

Was das heißt:
- **Das bedingte Laden hat funktioniert.** Beide neuen Läufe haben jede Referenz gelesen, deren Bedingung galt, und keine, deren Bedingung nicht galt. Das war das Hauptrisiko.
- **Die Güte ist gleichwertig.** In A haben beide alle Regeln bis auf dieselben zwei Punkte eingehalten. In B lag der neue Lauf einen halben Punkt zurück: Er schrieb in die Übersicht, die Lernseite müsse erneut freigegeben werden. Das ist eine Textentscheidung, keine fehlende Regel, denn die zuständige Referenz war gelesen. Bei n = 1 je Zelle ist das kein belastbarer Unterschied.
- **Die gemessene Lesemenge schwankt durch die Entscheidungen des Agenten stärker, als die Struktur spart.** Der neue Lauf A las `agent-links.md` (4.117 Wörter, laut Inputs von update-dashboard), der alte nicht. In A lasen beide Läufe nur Abschnitte des Cheat-Sheets, in B beide das ganze, obwohl `validate-syntax` in beiden Varianten dasselbe verlangt. Für eine belastbare Aussage braucht es mehrere Läufe je Variante.

### Befunde, die **beide** Varianten trafen (also an den Specs liegen)

1. **Schritt 2b ↔ datierte Zeile:** 2b sagt, Material und Journal-Zeilen zusammen speichern. Die datierte Zeile nennt aber, wie geprüft wurde, und das steht erst nach Schritt 3 fest. Alle vier Läufe haben deshalb umgestellt.
2. **Kurszusammenfassung auf dem leichten Strang:** Die Pflicht, sie bei jeder Änderung des Berichts mitzuschreiben, steht nur in `validate-course.md` und fehlt in quick-fix. In B blieb sie zweimal bei „bereit zum Veröffentlichen“, obwohl eine Nachprüfung offen ist. Außerdem bleibt `Result: PASS` bei offener Nachprüfung stehen, die Veröffentlichung ist also formal frei.
3. **`:try-as-learner`-Angebot nach „Freigeben“:** Beide haben es ausgelassen. Die Regel steckt mitten im Freigabe-Absatz und nicht in den Schritten, und sie kollidiert mit „nur bei offenem MCP-Gate“.
4. **Einheitentyp im Mini-Strang** lässt sich nicht auflösen (`n/a`, Agenda ruht, die Rückfalllösung gilt nur für create-session).
5. **Shell-Regel „ein Befehl, ohne `&&`“ ↔ Arbeitsverzeichnis:** Das war im Experiment ein Artefakt des Aufbaus, zeigt aber, dass Agenten ohne festes Arbeitsverzeichnis die Regel nicht einhalten können. Ein Argument für eure Werkzeug-Brücke (Nr. 1 in `regeln-als-werkzeuge.md`).

## Empfehlung

1. **Nicht jeden Befehl einzeln zum Skill machen.** Das spart in der Task-Datei wenig und erhöht die Grundlast. Wenn Skills, dann etwa 8–12 gebündelte Skills nach Phase (Rahmen, Planung, Einheit bauen, Prüfen und Korrigieren, Übersicht, Gestaltung, Veröffentlichen, Templates).
2. **Den Hebel bei den schweren gemeinsamen Dateien ansetzen.** Das Cheat-Sheet nach Konstrukt teilen (P1, bis −38 % für quick-fix), oder bei installiertem Skill `liascript-syntax` ganz darauf verweisen (eure offene Frage Nr. 15).
3. **`build-session` als Orchestrator mit Subagenten** (P2, −56 % im Hauptkontext). Die Unterabläufe Material, Bilder und Prüfung sind bereits als eigenständige Tasks geschnitten.
4. **Das bedingte Laden der Referenzen ist tragfähig** und lässt sich behalten. Die Tabelle „Load only what applies“ wurde in beiden Läufen korrekt befolgt.
5. **Die fünf Spec-Befunde oben zuerst beheben.** Sie wirken unabhängig von der Struktur.

## Nachvollziehen

```bash
git checkout experiment/skills
node --test specs/check-specs.mjs        # 120/120
node docs/skills-pilot/coverage.mjs      # Abdeckung
python3 docs/skills-pilot/measure.py     # Lesemenge und Projektionen
```

Protokolle, Diffs und die Blindbewertung liegen in `runs/`. Der Testplan für echte Tandem-Tests, mit weiteren Szenarien C–H, steht in `TESTPLAN.md`.
