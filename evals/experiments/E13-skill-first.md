# E13 – Skill zuerst (`liascript-syntax` installiert)

Branch: `experiment/e13-skill-first` · Basis: `develop` @ fd5b70f · Stand: 25.11.2026 · Skill: LiaScript/skills (Klon vom 25.11.2026)

## Hypothese

André installiert `liascript-syntax` immer mit. Heute ist der Skill nur „zweite Referenz“: der Agent liest dann
Cheat-Sheet **und** Skill. Ist der Skill die Syntax-Referenz und das Cheat-Sheet nur noch für die eigenen Regeln des
Agenten da (junge Lernende, Bedienelemente, Barrierefreiheit, Mini-Prüfung), sollte weniger gelesen werden, bei
gleicher oder besserer Qualität (der Skill ist am LiaScript-Quelltext geprüft). Risiko: die Referenzdateien des
Skills sind groß (bis 5.300 Wörter); ganz gelesen kosten sie mehr als die Abschnitte des Cheat-Sheets.

## Vorher festgelegt

Beide Varianten mit installiertem Skill (`prepare --with …=.claude/skills/liascript-syntax`).

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | Tokens (Mittel) | alle vier | mindestens −5 % gegenüber `develop` mit Skill |
| Schutz | Läufe mit allen Code-Prüfungen | alle | nicht weniger als `develop` mit Skill |
| Schutz | Richter-Fragen, besonders `content_fixed` | alle | keine Frage öfter `false` |

Läufe: 2 je Variante und Szenario. Nebenbei sichtbar: was `develop` mit Skill gegenüber `develop` ohne Skill
(Messlauf m4) kostet.

## Ergebnis

(nach dem Lauf)
