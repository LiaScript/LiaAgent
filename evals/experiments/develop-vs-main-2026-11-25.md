# Vergleich `develop` (4a98f9d) gegen `main` (bd8b06f) – 25.11.2026

4 Szenarien × 2 Läufe je Variante, Code-Prüfungen und blinder Richter (`/home/claude/runs/m3`).

| | main | develop |
|---|---|---|
| Läufe mit allen Code-Prüfungen | 5/8 | 7/8 (der eine Fehlschlag: Freigabe von der Testumgebung gesperrt) |
| Richter-Fragen `false` | 4 | 3 |
| Tokens je Lauf (Mittel) | 165.870 | 158.474 (−4,5 %) |
| Dauer je Lauf (Mittel) | 304 s | 266 s (−12,5 %) |
| gelesene Spec-Wörter (Mittel) | 25.571 | 23.725 (−7 %) |

Je Szenario:

| Szenario | Code-Prüfungen main / develop | Auffällig |
|---|---|---|
| quickfix-typo | 2/2 · 2/2 | main liest 22 % mehr Spec-Wörter |
| quickfix-quiz | 1/2 · 1/2 | main: einmal Antworten unausgewogen, zweimal interne Begriffe/englischer Satz; develop: Freigabe gesperrt (Umgebung), Lerner-Angebot einmal vergessen |
| quickfix-second-change | **0/2** · 2/2 | main: Empfehlung „kurze Nachprüfung“ doppelt (beide Läufe); develop: Datum/Zusammenfassung (s. u.) |
| recheck-short | 2/2 · 2/2 | main: Befunde einmal in die Kurszusammenfassung geschrieben |

Gefundene Schwächen in `develop` (für die nächsten Fixes):
- `record-change.mjs` nimmt für die Kurszusammenfassung das Systemdatum, wenn nur `--date` angegeben ist (ISO-Datum nicht abgeleitet).
- Der Validator erkennt nur ein nacktes „Keine.“ als „keine Empfehlung“; „Keine – …“ zählt als offene Empfehlung und führt zu einem Platzhalter-Punkt.
- Ein Lauf hat die Kurzbeschreibung der Lernseite in der Übersicht ungefragt umformuliert.
