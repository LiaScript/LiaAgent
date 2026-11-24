# Skills-Pilot – Testplan für Tandem-Tests

Stand: 2026-11-24 · Branch `experiment/skills`

Ziel: prüfen, ob `:quick-fix`, `:update-dashboard` und `:build-session` als Skills **gleich gut** arbeiten wie als Task-Dateien – bei weniger Lesestoff. Die Regeln sind in beiden Varianten wörtlich gleich (`node docs/skills-pilot/coverage.mjs`); geändert hat sich nur, **wann** sie gelesen werden. Das Risiko ist darum genau eines: Der Agent lädt eine Referenz nicht, obwohl ihre Bedingung gilt.

## Aufbau

- Zwei Ordner aus demselben Stand: `main` (alt) und `experiment/skills` (neu). Gleiches `journal.md`, gleiches Material, gleicher Agent und dasselbe Modell.
- Jede Runde einmal pro Variante, Reihenfolge abwechselnd (A-alt, A-neu, B-neu, B-alt …).
- Claude Code mit DevServer wie gewohnt (`claude --dangerously-load-development-channels server:liascript`). Für den Terminal-Fall einmal ohne `.mcp.json`.
- Mitschreiben: Dauer bis zur ersten Antwort, Dauer gesamt, Kontext laut `/context` am Ende, gelesene Dateien (Tool-Aufrufe im Verlauf), Writes (`.cache/writes.json` plus Edit-Aufrufe).

## Szenarien

Jedes Szenario hat seine Pflicht-Referenzen: Diese **müssen** in der neuen Variante gelesen werden. Wird eine nicht gelesen, ist das ein Befund gegen den Ansatz, auch wenn das Ergebnis zufällig stimmt.

| Nr. | Ausgangslage | Eingabe | Pflicht-Referenzen (neu) | Darf nicht geladen werden |
|---|---|---|---|---|
| A | Mini-Kurs, Lernseite geprüft, **nicht** freigegeben | `:quick-fix 1` Quiz verrät die Lösung | `after-check`, `journal-lines`, `approval` | `design-track`, `called-by` |
| B | Mini-Kurs, Lernseite geprüft **und** freigegeben | `:quick-fix 1` Tippfehler | `after-check`, `journal-lines` | `approval`, `design-track`, `called-by` |
| C | Voller Kurs, Lernseite ohne Prüfbericht | `:quick-fix 2` Tippfehler | – | alle Referenzen von quick-fix |
| D | Design-Strang, Hinweis `content-hints-1` offen | Klick auf den Hinweis | `design-track`, ggf. `after-check` | `approval` |
| E | Voller Kurs, Bausteine-Schritt mit Brief | `:update-dashboard` | `open-points`, `template-step` | `migration` |
| F | Journal im alten Layout | `:update-dashboard` | `open-points`, `migration` | – |
| G | Lernseite mit Skizze, freie Fotos, keine Profile | `:build-session 2` | `images`, `writes`, quick-fix `called-by` | `personas`, `skeleton` |
| H | wie G, mit zwei Lernendenprofilen | `:build-session 2` | `images`, `writes`, `personas` | `skeleton` |

Fixtures: A und B aus `specs/dashboard/fixtures/journal-mini-approved.md` (für A die Zeile „Material freigegeben“ entfernen) plus eine `README.md` mit Quiz-Folie; D aus `journal-design-to-full.md`; F aus `journal-84484ae.md`.

## Bewertung (je Lauf, blind: die Bewertenden wissen nicht, welche Variante)

Für quick-fix nach einer Prüfung (A, B), jeweils ✅ / teilweise / ❌ mit Beleg:

1. Umfang mit Abnahmekriterium bestätigt, bevor etwas geschrieben wird (Schritt 1)
2. Neuer Wortlaut vollständig gezeigt (Folientitel, vorher → nachher), dann „Speichern“ / „Etwas ändern“ (2a)
3. Nur die eine Änderung im Material
4. Inhaltlich gut: Die neue Fassung behebt das Problem (A: keine Antwort verrät sich mehr)
5. A: Muster in allen Einheiten gesucht und als Kursregel angeboten
6. Mini-Prüfung: `validate-syntax` für den geänderten Bereich; `check-material.mjs` oder ehrlich „ohne Browser“; Ton passt zur Didaktik
7. Datierte Zeile im Block „Geändert nach der Prüfung“: Datum · Folientitel · Änderung · wie geprüft
8. Ergebniszeile: „– 1 Punkt seit der Prüfung geändert – kurze Nachprüfung offen“ **oder** vollständige Nachprüfung mit „· nachgeprüft: …“ ohne diesen Zusatz – nie beides, nie keins
9. Journal-Zeilen in **einem** Write über `localize-journal.mjs`, vorher mit `find.mjs` gesucht; keine erledigte Aufgabe bleibt stehen
10. Übersicht zuletzt über `write-dashboard.mjs`; `validate-journal.mjs` ohne Fehler
11. A: Freigabe-Formular mit drei Wahlen; nach „Freigeben“ ein datierter Eintrag „Material freigegeben“ in einem Write; Kurszusammenfassung aufgefrischt (leichter Strang). B: **kein** Freigabe-Formular
12. Sprache und Anrede wie im Kursrahmen (Deutsch, Sie)

Für update-dashboard und build-session gelten die Checklisten der Tasks selbst (Regeln-Abschnitt; Ausgabe-Abschnitt von build-session).

## Messgrößen und Schwellen

| Größe | Quelle | Der Skill-Ansatz besteht, wenn |
|---|---|---|
| Lesemenge je Befehl | `python3 docs/skills-pilot/measure.py`, im Test: Tool-Aufrufe | kleiner als alt |
| Pflicht-Referenz gelesen | Tool-Aufrufe | in 100 % der Läufe |
| Regel-Treffer (Punkte 1–12) | Blindbewertung | nicht schlechter als alt, in keinem Punkt öfter ❌ |
| Dauer | Stoppuhr | nicht länger als alt |

Ein einziges ausgelassenes Pflicht-Lesen in einem Szenario ist ein Signal, die Bedingung in der Tabelle „Load only what applies“ schärfer zu formulieren (oder die Regel zurück in `SKILL.md` zu holen) – nicht, den Ansatz zu verwerfen.
