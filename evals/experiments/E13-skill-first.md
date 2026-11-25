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

Lauf 25.11.2026, `/home/claude/runs/m5` (2 Läufe je Variante und Szenario, beide mit installiertem Skill).

| Szenario | Tokens develop+Skill | e13 | Code-Prüfungen develop · e13 |
|---|---|---|---|
| quickfix-quiz | 165.296 | 174.841 (+6 %) | 1/2 · 2/2 (develop: einmal Freigabe gesperrt, einmal richtige Antwort am kürzesten) |
| quickfix-second-change | 140.654 | 146.589 (+4 %) | 2/2 · 2/2 |
| quickfix-typo | 149.317 | 146.383 (−2 %) | 2/2 · 2/2 |
| recheck-short | 181.604 | 194.218 (+7 %) | 2/2 · **1/2** (e13 hat einen Befund außerhalb der Seiten im Material behoben) |

**Entscheidung: nicht übernehmen.** Hauptkennzahl verfehlt (e13 kostet 2–7 % mehr), ein Schutz verletzt. Auf den
Richter wurde verzichtet: das Ergebnis steht ohne ihn fest.

Warum: `develop` liest den installierten Skill **gar nicht** (0 von 8 Läufen) und vom Cheat-Sheet nur einzelne
Abschnitte. E13 liest zusätzlich `SKILL.md` ganz (1.400 Wörter) und einen Referenzabschnitt, und weiterhin die
**[agent rule]**-Abschnitte – es ersetzt also nichts, es kommt dazu. Nebenbefund: der installierte Skill kostet
`develop` praktisch nichts (+0,7 bis +2,5 % Tokens gegenüber Messlauf m4 ohne Skill, im Rauschen).

Was bleibt: der Wert des Skills liegt bei LiaAgent nicht im Token-Sparen, sondern in Richtigkeit und Pflege (eine
Quelle für Syntax). Das ließe sich nur mit Szenarien messen, deren Fehler das Cheat-Sheet nicht kennt.
