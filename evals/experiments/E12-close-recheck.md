# E12 – Nachprüfung per Skript abschließen

Branch: `experiment/e12-close-recheck` · Basis: `develop` @ d01ddf1 · Stand: 25.11.2026

## Hypothese

Die kurze Nachprüfung muss acht Stellen zurücksetzen (Zeilen markieren, Endung, „nutzbar“, Empfehlung, Done,
Kurszusammenfassung, Status, offener Punkt). Von Hand gelingt das nicht immer (E3: ein Punkt blieb stehen) und kostet
Lesen und Aufrufe. `close-recheck.mjs` macht es in einem Schreibvorgang.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | Tokens und Dauer (Mittel) | recheck-short | mindestens −10 % gegenüber `develop` |
| Schutz | Läufe mit allen Code-Prüfungen | recheck-short | nicht weniger als `develop` |
| Schutz | Richter-Fragen | recheck-short | keine Frage öfter `false` als bei `develop` |

Läufe: 2 je Variante.

## Ergebnis

Lauf 25.11.2026, `/home/claude/runs/m4` (2 Läufe je Variante, blinder Richter).

| | develop | e12 |
|---|---|---|
| Tokens | 177.127 | 172.678 (−2,5 %) |
| Dauer | 215 s | 196 s (−9 %) |
| Spec-Wörter | 29.808 | 28.937 (−3 %) |
| Code-Prüfungen | 2/2 | 2/2 |
| Richter `false` | 0 | 0 |

**Entscheidung: noch nicht übernehmen.** Das Ziel (−10 % Tokens und Dauer) ist verfehlt; die Qualität ist gleich.
`develop` schließt die Nachprüfung inzwischen selbst verlässlich (Regel aus 777e7ba), der Zugewinn an Sicherheit
ist darum klein. Ein Lauf fand einen Datumsfehler im Skript (`--date` nur deutsch), behoben auf dem Branch. Sinnvoll
zusammen mit E10b: wenn beide Skripte die Übersicht schreiben, entfällt das Lesen der Dashboard-Regeln in beiden
Befehlen.
