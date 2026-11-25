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

(nach dem Lauf)
