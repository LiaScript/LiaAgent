# Regeln als Werkzeuge – welche Spec-Regeln in den DevServer oder in Skripte wandern können

Stand: 2026-11-04 · Branch `refactor/portable-agent-skills`
Grundlage: vollständige Durchsicht aller Tasks, Regelblätter, Templates und Agenten-YAMLs, abgeglichen mit den Befunden aus Tandem-Test 2 und 3 (`test2/feedback/`, `test3/feedback/`).

## Warum

- Die Specs haben sich in einem Monat verdoppelt (365 KB → 750 KB). `:build-session` verlangt vor dem Start rund 430 KB Lektüre.
- Test 3 hat die eigene Faustregel bestätigt: **Was ein Skript prüft, hält. Was nur als Text dasteht, verwittert.** Am häufigsten gebrochen wurden der Statusrhythmus, das Schreibbudget, das Neu-Lesen der Specs und „nichts Ungesehenes speichern“.
- MCP verstehen alle Agenten (Claude Code, Codex, Gemini CLI, Copilot). Eine Regel, die als Werkzeug umgesetzt ist, wirkt daher bei allen gleich. Hooks oder `settings.json` wirken nur in Claude Code.

## Grundsatz für die Aufteilung

| Wohin | Was | Beispiel |
|---|---|---|
| **DevServer** (allgemein, nützt jedem LiaScript-Projekt mit Agent) | Mechanik rund um Vorschau, Chat, Schreiben, Zeit | Reloads bündeln, Schreibzugriffe zählen, Fortschrittsanzeige, Navigation |
| **Projektskripte** im Teaching-Agent (`specs/dashboard/` …) | Alles Teaching-Agent-Spezifische | Übersicht ableiten, Statuswörter, Template-Buchhaltung |
| **Brücke**: Projektwerkzeuge | Der DevServer liest ein Manifest im Projekt (z. B. `specs/tools.json`) und bietet jedes dort genannte Skript als MCP-Werkzeug an | `check_material`, `derive_dashboard` |

Mit der Brücke bleibt der DevServer allgemein, und die Teaching-Agent-Logik bleibt im Projekt. Trotzdem braucht kein Agent mehr eine Shell.

**Bleibt Text:** didaktische Urteile (passt die Aufgabe, ist der Distraktor gut, blockiert ein Persona-Einwand), Gesprächsführung, Formulierungen gegenüber der Lehrkraft und die Zustimmungsregeln (ein Programm kann Zustimmung nicht prüfen, höchstens das Formular dafür stellen).

Aufwand: **klein** = ein überschaubares Skript oder eine Werkzeugoption · **mittel** = neues Werkzeug mit Zustand · **groß** = neues Zusammenspiel von Server und Chat.

---

## Phase 1 – Fundament (größte Wirkung, geringes Risiko)

### 1. Projektskripte als MCP-Werkzeuge
- **Ersetzt:** die Shell-Freigabeliste (ein Satz von etwa 3,5 KB in `teaching-agent.yaml:120`, Wiederholungen in `chat-wording.md`, `skills.md`, `chat-checks.md`) und die Verbote von „nie `grep`/`cat`/`date`/Heredoc“.
- **Werkzeuge:**
  - `check_journal`
  - `check_material({file, viewport?})`
  - `find({pattern, path?})`
  - `replace_lines({file, map})`
  - `localize({lang})`
  - `migrate_journal({check?})`
  - `fetch_thumb({file})`
  - `search_templates({query})`
  - `run_template_tests({id})`

  Alle sind auf das Projektverzeichnis beschränkt und liefern `{exit, output}`.
- **Gebrochen in Tests:** `grep` in R4 und R5-S12 („dritte Runde in Folge“), `date -u` in R3 und R9-S9. Dazu kommen Freigabe-Rückfragen im Terminal, die die Lehrkraft nie sieht.
- **Wo:** Brücke (Manifest im Projekt).
- **Aufwand / Nutzen:** mittel / **hoch**. Funktioniert bei jedem Agenten und spart viel Text.

### 2. Übersicht vollständig ableiten statt von Hand schreiben
- **Ersetzt:** fast die ganze Task `update-dashboard.md` (31 KB) und `project-dashboard.yaml`, die Aktionszeilen-Tabelle in `journal-links.md` sowie die Zeile „danach Übersicht aktualisieren“ in jeder Task.
- **Werkzeug:** `derive-dashboard.mjs [--write]` bzw. `derive_dashboard()`. Es berechnet aus `journal.md`, den Materialdateien und dem Sprachpaket:
  - Einheitenzustand, `statusLabel`, `usable`, `view`, `href`
  - Prozessschritte (Bilder, Templates, Ablaufplan, Veröffentlichen)
  - `next` und `explore` aus einer Prioritätstabelle (die Abhängigkeiten aus `workflows/course-development.yaml` werden zu Daten)
  - offene Punkte (`decisions`) aus den Hinweisen, die `validate-journal` schon findet
  - Statuszeile und Notizzelle der Einheitenübersicht, Einzeiler unter `## Sessions`, alle Aktionszeilen
- **Der Agent schreibt nur noch** optionale Texte (Untertitel, Zusammenfassung je Einheit, `how` bei offenen Punkten) in eine kleine Datei, die beim Ableiten eingemischt wird.
- **Schlüsselbefund:** `validate-journal.mjs` berechnet die meisten Sollwerte schon, meldet sie aber nur als Warnung („sollte X sein“). Diese Prüfungen müssen in Schreiber umgedreht werden.
- **Gebrochen in Tests:**
  - 61–65 s für einen Übersichts-Entwurf (R9-D2, R10)
  - kein `build-session`-Knopf (R10-S7)
  - veraltete Statuswörter, sogar vom Validator empfohlen (R11-D1)
  - 8 Handmigrationen in R1–R8; der Endstand von R11 war veraltet (R11-D2)
- **Wo:** Projektskript, als Werkzeug über die Brücke.
- **Aufwand / Nutzen:** mittel / **sehr hoch**. Fällt etwa 25 KB Text weg. „Migration“ heißt danach nur noch: neu ableiten.

### 3. Eine Funktion für Zustandswörter
- **Ersetzt:** `outcome_words` in `session-validation.yaml` (5,7 KB), die Wortlaut-Regeln in `session-skeleton.yaml`, `update-dashboard.md` und `quick-fix.md`.
- **Werkzeug:** `statusText(einheitenzustand, pack.terms)`. Diese eine Quelle füllt Statuszeile, Notizzelle, `statusLabel` und Ergebniszeile. Plural und „{offen} von {n}“ erledigt das Skript.
- **Gebrochen in Tests:** drei Wortlaute für einen Zustand (R10-S4/D5), „zwei“ statt „drei“ Punkte (R8-S6/S7), R11-D1.
- **Wo:** Projektskript (Teil von Nr. 2).
- **Aufwand / Nutzen:** klein bis mittel / **hoch**.

### 4. Task-Bündel mit Prüfsumme statt „bei jedem Befehl neu lesen“
- **Ersetzt:** die Neu-Lese-Regel in `CLAUDE.md` und `teaching-agent.yaml`, die Zeile „read completely“ in 37 Dateien und die Liste der zu lesenden Unterprozeduren in `build-session.md:20`.
- **Werkzeug:** `load_command({agent, cmd})`. Es liefert die Task, alle Templates und Regelblätter, die sie braucht, vollständig und mit `spec_hash`. Dafür bekommt jede Task eine maschinenlesbare Liste `reads:` im Kopf.
  - `command`-Events tragen `spec_hash`/`changed` (Idee T3-17).
  - Schreibwerkzeuge lehnen ab, wenn der Hash veraltet ist.
  - Ohne MCP erledigt `specs/bundle.mjs <task>` dasselbe. Als Skill ist das Problem ohnehin gelöst, weil Skills bei jedem Aufruf frisch geladen werden.
- **Gebrochen in Tests:** Test 2 R2, Test 3 R2-P1 und R10: `generate-image.md` und `quick-fix.md` ungelesen, `update-dashboard.md` nur Zeilen 1–10. Folge war ein Aufgabentyp-Wechsel, der als „mechanischer Fix“ lief.
- **Wo:** DevServer (Hash, Event) und Projekt (Liste `reads:`).
- **Aufwand / Nutzen:** mittel / **hoch**. Das ist der hartnäckigste P1 über alle Tests.

---

## Phase 2 – Server-Verhalten (allgemein im DevServer)

### 5. Reloads bündeln und alle Schreibzugriffe zählen
- **Ersetzt:**
  - das Schreibbudget („≤ 5 Writes je Speichern“, „nie ein Edit pro Zeile“), etwa 3 KB in rund 15 Dateien
  - den Zeilenersetzer als Umweg
  - `write-count.mjs`, das bisher nur Skript-Writes zählt
- **Verhalten:**
  - Neu geladen wird erst nach 2–3 s ohne weitere Dateiänderung.
  - Der Quiz-Stand bleibt über den Reload erhalten (N46).
  - Der Dateiwächter zählt jeden Schreibzugriff, auch die des Edit-Werkzeugs: `get_state.writes`.
  - `write_section` nimmt mehrere Abschnitte atomar an (`write_sections([...])`).
- **Gebrochen in Tests:** 26 Writes (R0a), 17 (R4), 29 im Allein-Lauf, davon 12 Edits nach der Ankündigung „ein Write“ (R10-S9).
- **Aufwand / Nutzen:** mittel / **hoch**. Das beseitigt die Ursache, nämlich verlorene Quiz-Antworten, statt den Agenten zu überwachen.

### 6. Fortschritt und Lebenszeichen bei langen Läufen
- **Ersetzt:** den Statusrhythmus: erster Aufruf ist ein Status mit Dauer, alle 60 s ein Status, nach halber Zeit ein Zwischenergebnis, „jeder Klick bekommt eine Antwort“. Dazu die Schleifengrenzen und die Laufzeile in `build-session` (zusammen etwa 6 KB in `agent-links.md`, `chat-dialog.md`, `build-session.md`).
- **Werkzeuge:**
  - `begin_run({title, steps:[{title, est_s}]})`, `step(i, {loop?, iteration?})`, `end_run()`
  - Die Chat-Anzeige zeigt „Schritt 2 von 5 · Bilder · etwa 3 min · seit 1:20“.
  - Neue Chat-Nachrichten während eines Laufs bestätigt der Server sofort: „Angekommen, Antwort nach diesem Schritt“ (T3-39).
  - Jede Werkzeugantwort trägt `silence_s` und ab 30 s eine Warnung.
  - Bei Überschreiten der Grenze lehnt `step` ab. `end_run` liefert die Laufzeile mit Iterationen und Writes.
- **Gebrochen in Tests:** R3-S11 (52 s), R4-S1 (53 s), R5-S7 (89 s), R7-S9 (68 s), R10-S5 (72,7 s, 14-mal über 30 s), R10-S6 (Frage 89,7 s unbeantwortet), Iterationen nicht als Zahl genannt (R10-S8).
- **Aufwand / Nutzen:** mittel / **hoch**. Das ist die am häufigsten gebrochene Textregel, und ein Zeitgeber verwittert nicht.

### 7. Ungelesene Nachrichten in jeder Werkzeugantwort
- **Ersetzt:** „bei `newer_user_messages` zuerst `read_chat`, vorher kein Formular“ (etwa 1,3 KB).
- **Verhalten:** Jede liascript-Antwort trägt `pending: [...]`. `chat` mit `inputs` lehnt ab, solange ungelesene Nachrichten nicht per `reply_to` beantwortet sind.
- **Gebrochen in Tests:** R5-S6 (Formular überdeckte den Einwand der Lehrkraft), R10-S6.
- **Aufwand / Nutzen:** klein / mittel bis hoch.

### 8. Zeit vom Server
- **Ersetzt:** `now.mjs`, „nie `date`“ und die Umrechnungsregeln (etwa 1,4 KB).
- **Verhalten:**
  - `get_state.now = {local, tz, date}`
  - jedes Event und jeder `read_chat`-Eintrag mit `t_local` und `age`
- **Gebrochen in Tests:** „22:10 Uhr“ in UTC (R6-S7), „gestern“ und „schönen Abend“ falsch (R7-S8, R8-S11).
- **Aufwand / Nutzen:** klein / mittel.

### 9. Navigation und Reload zuverlässig
- **Ersetzt:**
  - „`goto` nur vor dem ersten `<section>`“, „sonst Ankerlink“, „nicht während `reload_pending`“
  - Titel prüfen
  - Nachrichten erst nach dem Reload senden (etwa 3 KB)
- **Verhalten:**
  - `goto({anchor})` zählt die Folien so wie LiaScript.
  - Aufrufe warten auf einen laufenden Reload.
  - Die Antwort enthält den gerenderten Titel.
  - `chat({after_reload: true})` hält die Nachricht zurück, bis neu geladen ist.
  - `connection{reloaded}` kommt immer.
- **Gebrochen in Tests:** falsche Folie R5-P1 (T3-24), R6-S11, R8-S4, N72; Nachricht mitten im Reload (R0a-S8), T3-41.
- **Aufwand / Nutzen:** mittel (Folienliste aus Elm nötig) / **hoch**.

### 10. Agentenliste und Befehle aus einem Manifest
- **Ersetzt:**
  - Roster-Aufbau (vier Agenten, Emojis, Labels in Kurssprache, Stimmen; etwa 3,5 KB)
  - Befehls-Whitelist, Parameterprüfung und Bestätigungsstufen (etwa 5,5 KB)
  - die Regel „`preview` wechselt nie den Agenten“
- **Verhalten:** `build.py` erzeugt aus `agents/*.yaml` ein Manifest mit Befehlen, Parametertypen, Stufe und Navigationskennzeichen. Der Server:
  - setzt das Roster beim Verbinden selbst, mit Labels aus dem Sprachpaket
  - lehnt unbekannte Befehle ab und prüft Parameter (Einheitennummer gegen die Gliederung, Aufzählungen, Pfade)
  - zeigt bei der Stufe „im Chat bestätigen“ selbst Start/Abbrechen
  - wechselt bei Navigationsbefehlen nie den Agenten
- **Gebrochen in Tests:** Labels in falscher Sprache und sichtbares Umbenennen (R0a-S2, T3-01), espeak-Stimmen (T3-20), `preview` wechselte den Agenten (R7-S4). Die Whitelist ist eine Sicherheitsregel ohne Testbefund.
- **Aufwand / Nutzen:** mittel bis groß / **hoch**. Sicherheit gehört nicht ins Modellurteil.

### 11. Chat-Prüfungen beim Senden (klein, je einzeln)
- Linkziele automatisch kodieren (I10).
- Bei Vorlese-Markup `narrator:`/`language:` einsetzen (R6-S8).
- Formulare normalisieren: ≤ 4 Fragen, kein Doppelpunkt, lange Nachrichten teilen (R3-S10, R4-S7).
- Warnungen bei Dateinamen, `:befehlen` oder veralteten Zustandswörtern im Chattext (R4-S9, R5-S5, R6-S16, R8-S7, R10-S4).
- **Aufwand / Nutzen:** je klein / niedrig bis mittel. Gut als Rückgabe `warnings`, nicht als Blockade.

---

## Phase 3 – Schreiben mit Garantie

### 12. Speichern als Transaktion: `propose_save` → `apply_save`
- **Ersetzt:**
  - „alles vor dem Speichern zeigen“, „nichts Ungesehenes speichern“
  - Änderungszeile statt Fettmarkierung, Dreifach-Formular bei fremden Abschnitten
  - eine einzige Bestätigung, nach dem Formular nicht weiterarbeiten

  Das sind etwa 7 KB in 12 Tasks und `chat-dialog.md`.
- **Werkzeuge:**
  - `propose_save({task, sections:[...]})` zeigt den Vorschlag im Chat. Es berechnet die Zeile „Geändert: …“ selbst, ordnet jeden Abschnitt per Eigentümer-Tabelle (`specs/ownership.json`) als eigen oder fremd ein und stellt die passenden Knöpfe.
  - `apply_save(token, wahl)` schreibt genau das Gezeigte, atomar, mit einem Reload.
  - Jede Textänderung macht das Token ungültig.
- **Gebrochen in Tests:** mehr gespeichert als gezeigt (R2-S3, R3-S6, R4-S8, R5-S10), fremde Abschnitte still geändert (R4-S2/S3, R5-S8), Fettmarkierung statt Änderungszeile (R1-S9, R2-S6), nach dem Formular weitergearbeitet (R1-S6).
- **Aufwand / Nutzen:** groß / **hoch**. Erst der Server kann „nichts Ungesehenes“ wirklich garantieren.

### 13. Abschnitts-Schema beim Schreiben prüfen
- **Ersetzt:** die Regeln zu flachen Abschnitten, Überschriftenebenen, `<section>`-Hüllen, `data-key`-Labels, Tabellen- und `<details>`-Layout, Reihenfolge der `####`-Blöcke (etwa 6 KB, `teaching-agent.yaml:191-200` u. a.).
- **Werkzeug:** Jede Vorlage bekommt ein kleines `layout_check`. `validate-journal.mjs --section <name>` prüft es. `write_section`/`apply_save` rufen die Prüfung vor dem Schreiben auf (Projekt-Hook, z. B. `.liadev.json` → `onWrite`) und lehnen mit genauer Meldung ab.
- **Gebrochen in Tests:** Stufen in Fließtext (R2-S13), `1\.` statt Tabellenziffer (R4-S5/D2), Überschrift im `<section>` und dadurch falsche Folie (R5-P1).
- **Aufwand / Nutzen:** mittel / **hoch**. Fehler werden beim Schreiben abgefangen statt in einer späteren Migration.

### 14. Prüfbericht als Daten schreiben
- **Ersetzt:** Bericht-Layout, `result_rules`, Ergebniswörter, Nutzbarkeitszeile, Zählungen, Kurs-Zusammenfassung, Veröffentlichungs-Schranke (etwa 14 KB in `session-validation.yaml`, `validate-course.md`, `validate-syntax.md`).
- **Werkzeug:** `write_report({unit, mode, findings:[{tag, status, page, text}]})`. Es berechnet Ergebnis, Wortlaut, „{offen} von {n}“, Überschrift und Anker und schreibt Bericht, Tabellenzeile, Statuszeile und Notiz in einem Zug. Danach wird die Übersicht abgeleitet. `gate.mjs` (Exit 0/1) prüft die Veröffentlichungs-Schranke für den Development-Agent.
- **Der Agent liefert nur** die beurteilten Befunde.
- **Gebrochen in Tests:** Prüfung 5:31 min, davon etwa 3 min Berichtschreiben (R8); Überschriften doppelt (R8-D2).
- **Aufwand / Nutzen:** mittel / **hoch**.

### 15. Syntaxprüfung bleibt beim Skill
- **Entscheidung:** Ein Parser oder `parse_errors` steht nicht zur Verfügung. Die LiaScript-Syntax prüft weiter das Modell, gestützt auf den Skill `liascript-syntax`. Kein Werkzeug.
- **Offen:** Was `check-material.mjs` heute schon mechanisch erkennt (kodierte URLs, Bildgrößen, gleiche Optionen, Antwortmuster), bleibt dort. Zu klären ist, ob `validate-syntax.md` und `liascript-cheat-sheet.md` (22 KB) Wissen doppeln, das der Skill schon mitbringt. Dann könnte die Task bei installiertem Skill auf ihn verweisen und nur ohne Skill den Spickzettel lesen.

---

## Phase 4 – Fachliche Bausteine (Projektskripte)

| Nr. | Baustein | Ersetzt | Belege | Aufwand / Nutzen |
|---|---|---|---|---|
| 16 | `insert_images(plan)`: Marker → Bild mit Größe je Rolle, Bildnachweis, Eintrag verdichten, „Bilder n von m“, ein Write je Datei | ~4,5 KB in `create-image`, `build-session`, `generate-image` | R10-S9 (12 Edits statt einem) | mittel / **hoch** |
| 17 | `search-commons.mjs "<begriffe>" --max 3 --role option\|page`: Lizenzfilter (kein NC/ND), Vorschaubilder, Lizenzdaten, kodierte URL | ~2,5 KB | 12 min Hintergrundsuche (R6-P1), I10, 5 min Fotosuche (R10) | klein bis mittel / mittel bis hoch |
| 18 | Lernbegleiter: Der Server berechnet die Hilfestufe je Quiz-Ereignis (`stage`); `activity_log` liefert Fakten für die Nachbesprechung; Ausstiegsknopf | ~3,5 KB inkl. Workaround für DevServer 1.2.19 | Stille nach dem 2. Fehler (N63), erfundene Hinweisstufen (R9-S5), kein Ausstieg (N65) | mittel / **hoch** |
| 19 | `new-journal.mjs --lang --unit-word`: kopieren, Sprachpaket, Einheitenwort in einem Write. Ohne Paket: `--emit-strings` / `--apply-strings` | ~7 KB (doppelt in `init-course` und `scaffold`) | 80 s / 52 s Sprachwechsel (R0a/R0b), R1-S8, halb englische Überschriften (R11-S3) | mittel / **hoch** |
| 20 | `templates.mjs adopt\|remove\|brief\|import\|selection`: Zustandsmaschine `## Templates`, `import:`-Zeilen, `templates.local.json`; Makro-ohne-Import-Prüfung in `check-material` | ~10 KB → ~3 KB, verteilt auf 5 Tasks | noch ungetestet, komplexester Text ohne Testlauf | mittel / **hoch** |
| 21 | Veröffentlichen über die vorhandenen `git_publish`/`git_tag`/`git_sync`/`git_status` statt `gh`/`git` in der Shell; Katalog-PR als vorausgefüllter GitHub-Link | ~5,5 KB Shell-Abläufe | dreimal ungetestet | klein bis mittel / **hoch** |
| 22 | Dauer schätzen in `check-material.mjs --duration <min>` | `duration-heuristic.md` 4,3 KB → ~0,8 KB | „Rechenformel“ ohne Erklärung (R10-S8) | klein / mittel |
| 23 | Kursmodus-Prüfungen der `[mechanical]`-Checkliste in `validate-journal.mjs --course` | ~5 KB | Kursmodus nie getestet | mittel / mittel bis hoch |
| 24 | Kleinkram: `add-entry.mjs` für Notizen und Personas (Datum am Listenanfang, R11-S4), `merge-coauthor.mjs`, `scan-project.mjs`, `resolve-material.mjs`, ChatGPT-Bildskript als eigene Datei statt 8 KB doppeltem JS in `generate-image.md`, `get_state.skills` | zusammen ~15 KB | teils | je klein / niedrig bis mittel |

---

## Was die Umsetzung bringt

- **Text:** Die Schätzungen der Durchsicht summieren sich auf grob 100–150 KB, also ein Sechstel bis ein Fünftel der Specs. Sie überlappen sich, deshalb ist das ein Richtwert. Wichtiger ist, *welcher* Text wegfällt: genau die Regeln, die in den Tests am häufigsten gebrochen wurden.
- **Lese-Last je Befehl:** sinkt stärker als der Gesamtumfang. Die Übersicht (Nr. 2), der Prüfbericht (Nr. 14) und die Regelblätter zu Status und Schreibbudget müssen dann bei fast keinem Befehl mehr gelesen werden.
- **Tempo:** Übersicht in Sekunden statt 60 s, Prüfung ohne 3 min Berichtschreiben (die Syntaxprüfung selbst bleibt beim Skill), Sprachwechsel in unter 10 s.
- **Gleiches Verhalten bei allen Agenten:** Alles in Phase 1–3 wirkt über MCP oder über Skripte.

## Offene Entscheidungen

1. **Bestätigung beim Veröffentlichen:** `git_publish` sagt „im Chat bestätigen“, die Specs verlangen „im Terminal bestätigen“. Eine Regel muss gelten.
2. **Wie allgemein wird der DevServer?** Vorschlag: Nr. 5–9, 11, 12 und das Projektwerkzeug-Manifest (Nr. 1) kommen in den DevServer. Alles andere bleibt Projektskript.
3. **Hintergrundsuche nach Bildern:** `create-image.md` verbietet sie (wegen R6-P1). Mit Fortschrittsanzeige (Nr. 6) wäre ein Helfer im Vordergrund vertretbar.
4. **`check-specs.mjs`:** Es hält etwa 500 Sätze wörtlich fest. Jeder Satz, der hier zum Werkzeug wird, braucht stattdessen einen Test des Werkzeugs (Fixture in `check.mjs`). Sonst lässt sich der Text nicht kürzen.

## Stand der Umsetzung

**Nr. 2, erster Teil (2026-11-04):**
- `specs/dashboard/journal-model.mjs` liest die Fakten aus dem Journal.
- `specs/dashboard/derive-dashboard.mjs [--check | --write]` berechnet daraus: Einheitenliste, `title`, `state`, `href`, `view`, `usable`, `statusLabel`, den Zustand des Bilder-Schritts, fehlende Schritte, Abschnittslinks, Einheitenwörter und das Datum.
- `write-dashboard.mjs` wendet das vor jedem Schreiben an und listet, was es gesetzt hat (`--no-derive` schaltet das ab).
- Getestet in `check.mjs` (6 neue Tests) und an den Journalen aus Test 1–3.

**Nr. 3 (2026-11-04):**
- `statusText()` in `journal-model.mjs` bildet den einen Wortlaut je Einheit. Vor einer Prüfung folgt er aus Planungsskizze, Material und Bild-Einträgen (Wörter aus `terms`), danach aus der Ergebniszeile des Prüfberichts.
- `write-dashboard.mjs` schreibt ihn im selben Schreibvorgang in `statusLabel`, die Statuszeile und die Notizzelle.
- Neue Wörter im Sprachpaket: `skeletonOnly`, `checked`.
- An den Journalen aus Test 1–3 sinken Fehler und Warnungen, es kommen keine neuen hinzu (Test 3: 15 → 11 Warnungen).

**Offen:**
- Veraltete Wörter in der Ergebniszeile des Prüfberichts selbst: `validate-journal` meldet sie. Nach der Korrektur folgen alle Kopien automatisch.
- `next`/`explore`, Template-Schritt, Kursprozess, Stichpunkte für offene Punkte, Aktionszeilen, Einzeiler unter `## Sessions`.
- `update-dashboard.md` kürzen. Dafür müssen die festgehaltenen Sätze in `check-specs.mjs` mitgeändert werden.
- `validate-journal.mjs` auf `journal-model.mjs` umstellen, damit es nur noch einen Leser gibt.

## Empfohlene Reihenfolge

1. Nr. 2 und 3 (Übersicht ableiten): nur Projektskripte, kein DevServer-Release nötig, größter Einzelgewinn.
2. Nr. 1 (Projektwerkzeug-Manifest) und Nr. 4 (Task-Bündel mit Hash): Danach braucht kein Agent mehr Shell oder Neu-Lese-Disziplin.
3. Nr. 5 und 6 (Reloads, Zähler, Fortschritt): die meistgebrochenen Regeln.
4. Nr. 12–14, dann Phase 4 nach Bedarf.

Nach jedem Schritt wird der zugehörige Spec-Text gekürzt und mit einem Verhaltenstest abgesichert, nicht mit einem festgehaltenen Satz.
