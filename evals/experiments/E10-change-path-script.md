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

(nach dem Lauf)
