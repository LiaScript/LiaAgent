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

Gebaut: `teaching-agent.yaml` 2.064 → 1.612 Wörter (−22 %), `teaching-agent.nav.yaml` 2.648 → 2.225 (−16 %),
`CLAUDE.md` 3.139 → 2.637. Ziel von −25 % verfehlt: Code, Pfade, Befehlslisten und geschützte Sätze bleiben wörtlich.

Lauf 24.11.2026, `/home/claude/runs/m2` (2 Läufe je Variante und Szenario, blinder Richter).

| Szenario | Tokens base | e8 | gelesene Spec-Wörter base | e8 | Code-Prüfungen | Richter-Auffälligkeit |
|---|---|---|---|---|---|---|
| quickfix-quiz | 160.377 | 164.928 (+3 %) | 23.683 | 20.083 | 2/2 · 2/2 | `content_fixed` base 2/2, **e8 0/2** |
| quickfix-second-change | 139.424 | 144.805 (+4 %) | 19.736 | 18.639 | 2/2 · 2/2 | – |
| quickfix-typo | 144.535 | 151.950 (+5 %) | 20.191 | 21.181 | 2/2 · 2/2 | – |
| recheck-short | 185.577 | 179.267 (−3 %) | 27.974 | 27.169 | 2/2 · 2/2 | e8 besser bei `scope_kept`, `no_harm` |

**Entscheidung: nicht übernehmen.** Die Tokens sinken nicht (Hauptkennzahl verfehlt): die gesparten ~500 Wörter
Grundlast gehen im Rauschen der Lesemenge unter. Der Qualitätsschutz ist verletzt: beide e8-Quizläufe schrieben
knappe, gleich gebaute Antworten („Regen fällt herab.“ / „Wasser verdunstet.“ / „Schnee fällt herab.“;
„Es verdunstet Wasser.“) – der Telegrammstil der Anweisungen färbt auf den Text für Lernende ab. Bei nur zwei
Läufen ist das kein Beweis, aber genau das Risiko, das die Hypothese prüfen sollte. Wenn überhaupt, dann nur
Teile ohne Bezug zum Schreiben (Befehlstabelle, Shell-Liste) verdichten.
