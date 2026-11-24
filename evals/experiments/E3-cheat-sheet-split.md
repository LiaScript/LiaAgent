# E3 – Cheat-Sheet nach Konstrukt geteilt

Branch: `experiment/e3-cheat-sheet-split` · Basis: `develop` @ 777e7ba · Stand: 24.11.2026

## Hypothese

Das LiaScript-Cheat-Sheet hat rund 840 Zeilen in einer Datei. Wer nur eine Folie prüft (kurze Nachprüfung,
Quiz-Änderung), liest heute oft die ganze Datei. Geteilt in einen Index und elf Teile, mit der Regel „für einen
engen Umfang nur `00-checks.md` und die Teile der betroffenen Konstrukte“, sollte die gelesene Menge bei engen
Aufgaben sinken – ohne dass eine Prüfung etwas übersieht.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | gelesene Spec-Wörter (Median) | `recheck-short`, `quickfix-quiz` | mindestens −15 % gegenüber `base` |
| Schutz | Läufe mit allen Code-Prüfungen bestanden | alle | nicht weniger als `base` |
| Schutz | Richter-Fragen | alle | keine Frage öfter `false` als bei `base` |
| Schutz | Tokens gesamt | `quickfix-typo`, `quickfix-second-change` | nicht mehr als +10 % (dort liest kaum jemand im Cheat-Sheet) |

Läufe: 3 je Variante und Szenario. Übernahme nach `develop`, wenn die Hauptkennzahl das Ziel erreicht und kein
Schutz verletzt ist.

## Ergebnis

Lauf 24.11.2026, `/home/claude/runs/m2` (2 Läufe je Variante und Szenario, blinder Richter).

| Szenario | gelesene Spec-Wörter base | e3 | Tokens base | e3 | alle Code-Prüfungen base | e3 |
|---|---|---|---|---|---|---|
| recheck-short | 27.974 | 28.789 (+3 %) | 185.577 | 187.289 | 2/2 | 1/2 |
| quickfix-quiz | 23.683 | 24.550 (+4 %) | 160.377 | 165.749 | 2/2 | 2/2 |
| quickfix-second-change | 19.736 | 20.781 | 139.424 | 143.700 | 2/2 | 2/2 |
| quickfix-typo | 20.191 | 20.515 | 144.535 | 147.162 | 2/2 | 2/2 |

**Entscheidung: nicht übernehmen.** Die Hauptkennzahl verfehlt das Ziel (−15 %) deutlich; e3 liest sogar mehr.
Grund: `develop` liest das Cheat-Sheet schon heute abschnittsweise (Abschnittsregel aus 4002f10, z. B. „lines
503–562, Quizzes for young learners“), bei der kurzen Nachprüfung gar nicht. Die Teile von e3 sind größer als
diese Abschnitte. Ein Schutz ist verletzt: einmal blieb nach der Nachprüfung ein zweiter offener Punkt der
Prüfung stehen (`recheck-closed`). Die Teilung lohnt erst, wenn Agenten das ganze Blatt laden müssten.
