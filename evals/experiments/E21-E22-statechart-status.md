# E21/E22 – Ablauf aus dem Statechart, Status-Skript statt Dashboard-Block

Branch: `experiment/e20-statechart` · Basis: `develop` @ b594ee1 · Stand: 27.11.2026 · Läufe: `/home/claude/runs/e22`

## Änderungen

- **E21:** `actions.mjs` holt Zustand und Knopf aus `specs/statechart/*.machine.json`; die Wenn-dann-Ketten liegen nur noch
  als Testreferenz in `specs/statechart/legacy.mjs`. Gleichheit der ganzen Aktionsobjekte: 10.560 Einheiten-Fälle,
  200.000 Zufallsjournale; Dashboard-Tests 274/274, Spec-Prüfungen 120/120. CI prüft `specs/statechart/check.mjs`.
- **E22:** `node specs/dashboard/status.mjs` gibt Sprache, Track, nächste Aktion, Zustand und Knopf je Einheit und die
  Zeilenbereiche aller Abschnitte aus (~160–250 Wörter). Aktivierung, Startreihenfolge, `start.md`, `open-chat.md`:
  Skript ausführen, dann nur `## Course Context` per Zeilenbereich lesen – der Dashboard-Block wird nicht mehr gelesen.
- **Eval:** neues Szenario `quickfix-typo-multi` (voller Track, 4 Einheiten, Tippfehler in Einheit 2);
  `checks.mjs` kennt `file` und `unit`, `grade.mjs` gibt `materials/*.md` an den Richter.

## Ergebnis (je 3 Läufe)

| Szenario | Prüfungen | Tokens | Dauer | Journal-Wörter gelesen |
|---|---|---|---|---|
| 4 Einheiten, base → e22 | 30/30 → 30/30 | 117.940 → 115.099 (−2,4 %) | 129 s → 129 s | ≈ 2.000 → ≈ 800 |
| 1 Einheit, base → e22 | 27/27 → 27/27 | 114.777 → 110.868 (−3,4 %) | 119 s → 123 s | ≈ 1.650 → ≈ 750 |

Lesemuster: develop liest Kopf + Dashboard-Block (900 Wörter bei 4 Einheiten) + Kursrahmen und später einen breiten
Bereich von `## Sessions`. E22 liest in allen drei Läufen gleich: Kursrahmen 304–367, `### Teaching-Agent`, dann genau
`### 2.` mit Bericht (569–619) – die Zeilenbereiche aus dem Status werden direkt genutzt.

## Einordnung

Die Einsparung beim Journal ist deutlich (−60 %), am Gesamtverbrauch aber klein, weil die Spec-Dateien (~13.000 Wörter)
den Großteil ausmachen. Sie wächst mit dem Kurs: der Dashboard-Block nimmt je Einheit rund 200 Wörter zu.
Nebenbefund: die Skripte nehmen das Datum von der Systemuhr; ein Lauf nutzte `--iso-date`, die anderen schrieben
27.11. statt des Szenario-Datums (bekannt, Test-Datumsvariable offen).
Der Blindrichter wurde noch nicht befragt (Code-Prüfungen alle gleich).
