# E10 – Änderungsweg samt Übersicht per Skript

Branch: `experiment/e10-change-path-script` · Basis: `develop` @ d01ddf1 · Stand: 25.11.2026

## Hypothese

Nach `record-change.mjs` liest der Agent bei jedem quick-fix `tasks/update-dashboard.md`, `project-dashboard.yaml`
und zwei Vorlagen (rund 7.000 Wörter) und baut einen Dashboard-Entwurf von Hand – meist nur, um den offenen Punkt
der Nachprüfung einzutragen, oft in zwei Anläufen. Schreibt `record-change.mjs` die Übersicht gleich mit, braucht
der einfache Fix diese Regeln nicht mehr.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | gelesene Spec-Wörter (Mittel) | quickfix-typo, quickfix-second-change | mindestens −15 % gegenüber `develop` |
| Nebenkennzahl | Tokens, Werkzeugaufrufe | alle drei quick-fix-Szenarien | nicht mehr als `develop` |
| Schutz | Läufe mit allen Code-Prüfungen | alle drei | nicht weniger als `develop` |
| Schutz | Richter-Fragen | alle drei | keine Frage öfter `false` als bei `develop` |

Läufe: 2 je Variante und Szenario.

## Ergebnis

Lauf 25.11.2026, `/home/claude/runs/m4` (2 Läufe je Variante und Szenario, blinder Richter).

| Szenario | Spec-Wörter develop | e10 | Tokens develop | e10 | Dauer develop | e10 | Code-Prüfungen | Richter `false` |
|---|---|---|---|---|---|---|---|---|
| quickfix-quiz | 23.244 | 19.610 (−16 %) | 164.163 | 154.671 (−6 %) | 286 s | 234 s | 2/2 · 2/2 | 1 · 1 |
| quickfix-second-change | 22.575 | 19.251 (−15 %) | 139.499 | 142.706 (+2 %) | 141 s | 149 s | 2/2 · 2/2 | 0 · 0 |
| quickfix-typo | 19.668 | 20.711 (+5 %) | 148.027 | 137.983 (−7 %) | 182 s | 164 s | 2/2 · 2/2 | 0 · 0 |

**Entscheidung: noch nicht übernehmen, weiterbauen (E10b).** Die Hauptkennzahl erreicht ihr Ziel nur in einem der
zwei vorher festgelegten Szenarien (second-change −15 %, typo +5 %); alle Schutzkennzahlen halten. Grund: jede
Ausgangsdatei hat Quiz-Mängel außerhalb der Änderung, also schreibt jeder Lauf `decide`-Punkte von Hand – und liest
dafür `update-dashboard.md` und `project-dashboard.yaml` doch. Die Ersparnis kam nur aus den gekürzten Vorlagen.
Nächster Schritt: ein Skript auch für den Punkt eines Befunds außerhalb der Änderung, dann erneut messen.
