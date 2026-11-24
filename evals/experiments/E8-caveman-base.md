# E8 – Caveman für die Grundlast

Branch: `experiment/e8-caveman-base` · Basis: `develop` @ 777e7ba · Stand: 24.11.2026

## Hypothese

Bei jedem Start liest der Agent `CLAUDE.md` (aus `teaching-agent.nav.yaml`) und `teaching-agent.yaml`, zusammen
rund 5.200 Wörter. Im Caveman-Stil verdichtet (Füllwörter weg, Code, Pfade, Schlüssel und geschützte Wortlaute
unverändert, keine Regel gestrichen) sollten es mindestens 25 % weniger sein. Offen ist, ob knapper Text genauso
gut befolgt wird – das ist der eigentliche Test.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | Tokens gesamt (Median) | alle | mindestens −5 % gegenüber `base` |
| Schutz | Läufe mit allen Code-Prüfungen bestanden | alle | nicht weniger als `base` |
| Schutz | Richter-Fragen, besonders `language` | alle | keine Frage öfter `false` als bei `base`; Nachrichten an die Lehrkraft bleiben ganze Sätze |

Läufe: 3 je Variante und Szenario. Übernahme nach `develop`, wenn die Hauptkennzahl das Ziel erreicht und kein
Schutz verletzt ist.

## Ergebnis

(nach dem Lauf)
