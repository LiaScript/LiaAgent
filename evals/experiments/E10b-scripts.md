# E10b – Übersicht nur noch per Skript (E10 + E12 + add-point)

Branch: `experiment/e10b-scripts` · Basis: `develop` @ d479ebd · Stand: 25.11.2026

## Hypothese

In E10 lasen alle Läufe die Dashboard-Regeln doch, weil jede Ausgangsdatei Befunde außerhalb der Änderung hat und
deren `decide`-Punkte von Hand geschrieben wurden. Mit `add-point.mjs` dafür, `record-change.mjs` für den
Änderungsweg und `close-recheck.mjs` für die Nachprüfung (E12) braucht weder quick-fix noch die kurze Nachprüfung
die Dashboard-Regeln (`update-dashboard.md` + `project-dashboard.yaml`, rund 4.500 Wörter) – außer für die Freigabe.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | Tokens (Mittel über alle vier Szenarien) | alle | mindestens −7 % gegenüber `develop` |
| Nebenkennzahl | Läufe, die `update-dashboard.md` lesen | alle | höchstens die Quiz-Läufe (Freigabe) |
| Schutz | Läufe mit allen Code-Prüfungen | alle | nicht weniger als `develop` |
| Schutz | Richter-Fragen | alle | keine Frage öfter `false` als bei `develop` |

Läufe: 2 je Variante und Szenario, ohne installierten Skill (wie m4).

## Ergebnis

(nach dem Lauf)
