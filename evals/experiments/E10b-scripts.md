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

Lauf 25./27.11.2026, `/home/claude/runs/m6` (2 Läufe je Variante und Szenario, blinder Richter).

| Szenario | Tokens develop | e10b | Spec-Wörter develop | e10b | Code-Prüfungen |
|---|---|---|---|---|---|
| quickfix-quiz | 171.865 | 150.373 (−12,5 %) | 24.185 | 22.183 | 2/2 · 2/2 |
| quickfix-second-change | 147.190 | 118.303 (−19,6 %) | 19.812 | 13.749 | 2/2 · 2/2 |
| quickfix-typo | 141.779 | 120.343 (−15,1 %) | 20.103 | 13.415 | 2/2 · 2/2 |
| recheck-short | 181.066 | 165.046 (−8,8 %) | 28.491 | 26.709 | 2/2 · 2/2 |
| **Mittel** | 160.475 | 138.516 (**−13,7 %**) | | | 8/8 · 8/8 |

- Dashboard-Regeln gelesen: `develop` 8 von 8 Läufen, `e10b` 2 von 8 (die beiden Quiz-Läufe, wegen der Freigabe).
- Richter: je Variante genau eine Antwort `false` in 16 Läufen (beide `no_harm`: eine ungefragt umformulierte
  bzw. nicht nachgezogene Kurzbeschreibung der Übersicht) – kein Unterschied.

**Entscheidung: übernehmen** (Ziel −7 % klar erreicht, alle Schutzkennzahlen gehalten).

Gefundene Kleinigkeiten für die Übernahme: `close-recheck` schreibt „· nachgeprüft: X“ auch, wenn X schon in der
Zeile steht (doppelt); mehrere Befunde bedeuten mehrere `add-point`-Aufrufe und damit mehrere Schreibvorgänge.
