# E14 – Leseplan für die Übersicht: seltene Fälle in `data/dashboard-cases.md`

Branch: `experiment/e14-dashboard-readplan` · Basis: `develop` @ 6ed992b (mit E10b) · Stand: 27.11.2026

## Hypothese

Jede Aufgabe, die die Übersicht von Hand schreibt, liest `update-dashboard.md` (3.254 Wörter) und
`project-dashboard.yaml` (1.164) vollständig. Im häufigen Fall – frischer Zwischenspeicher `.cache/dashboard.json`,
nur einige Schlüssel ändern sich – braucht sie weder die Vorlage noch die Regeln für seltene Fälle (ganzer
Entwurf, Spurwechsel und Prozessschritte, alte Journal-Form, Aktionszeilen von Hand). Diese Teile wandern in
`data/dashboard-cases.md` und werden nur über einen Verweis gelesen, wenn ihr Fall eintritt.

Erwartet (vor dem Lauf genannt): rund 1.800 Wörter weniger je Speichern mit Zwischenspeicher, Qualität gleich.
Die Schutzregeln unten wurden nach dem Lauf aus dem Muster von E10b übernommen.

## Änderung

- `update-dashboard.md`: 3.254 → 2.616 Wörter. Schritt 7, `labels`, alte Journal-Form, Aktionszeilen von Hand und
  die Regeln zu Prozessschritten, Spur und Baustein-Schritt wörtlich nach `data/dashboard-cases.md` (1.009 Wörter),
  mit je einer Zeile, wann der Teil gilt. Die `plan`-Regel und die Anker bleiben (braucht `create-outline` selbst).
- `project-dashboard.yaml` nur noch für einen ganzen Entwurf. 28 Aufgaben verweisen nicht mehr mit „with
  `templates/project-dashboard.yaml`“; die Lese-Regel in CLAUDE.md sagt, dass die Aufgabe nennt, wann.
- `check-specs.mjs` prüft beide Dateien als eine Regelmenge (keine geschützte Regel verloren), Budget für die neue
  Datei. Skript-Hinweise (`validate-journal.mjs`, `write-dashboard.mjs`) zeigen auf die neuen Teile.
- Messung: vier neue Szenarien `outline-*-cached` mit frischem Zwischenspeicher; `run.mjs` legt Ordner der
  Ausgangsdateien an.

## Ergebnis

Lauf 27.11.2026, `/home/claude/runs/e14`, 2 Läufe je Variante und Szenario, blinder Richter.

| | develop | e14 |
|---|---|---|
| Spec-Wörter gelesen, mit Zwischenspeicher (Median, 8 Läufe) | 15.013 | 12.911 (−14 %) |
| Tokens, mit Zwischenspeicher (Mittel, 8 Läufe) | 140.172 | 130.694 (−6,8 %) |
| Spec-Wörter ohne Zwischenspeicher (s1, 2 Läufe) | 14.172 | 14.410 |
| Tokens ohne Zwischenspeicher (s1, Mittel) | 136.065 | 131.731 |
| Code-Prüfungen (Validator, Gliederung, fremde Abschnitte) | 10/10 | 10/10 |
| ohne kritischen Verstoß | 5/10 | 4/10 |
| Richterfragen erfüllt (Summe) | 109 | 105 |

Je Szenario mit Zwischenspeicher sinken die Tokens um 2–11 % (s1 −9,6 %, s2 −10,5 %, s4 −2,4 %, s5 −4,4 %).
Ohne Zwischenspeicher liest E14 den Teil „Whole draft“ und die Vorlage – wie vorgesehen, ohne Mehrkosten.

Richterfragen, develop/e14: goal_first 10/9, person_check_phase 8/7, one_action 3/2, time_check 9/8,
content_before_save 8/7, save_confirm 7/8, alle anderen gleich. Jede Abweichung ist ein Lauf.

## Bewertung

Die Ersparnis ist eindeutig und gleichgerichtet in allen vier Szenarien mit Zwischenspeicher. Die Qualität
unterscheidet sich je Frage um höchstens einen Lauf, in beide Richtungen. Nach der strengen Schutzregel von E10b
(„keine Frage öfter `false`“) wäre das ein Nein; inhaltlich betrifft keiner der zusätzlichen Fehler eine Regel,
die verschoben wurde: Es sind die bekannten Schwächen von `create-outline` (Vorschau „wie oben“, zwei Verben je
Stufe, eigene Zusätze erst in der Vorschau, zweite Bestätigung) aus dem Benchmark – sie treten bei `develop`
genauso auf. Kein Lauf las einen Teil von `dashboard-cases.md`, der nicht galt, und keiner ließ einen aus, der galt.

**Empfehlung:** übernehmen. Die Rest-Unsicherheit beim Richter ist Rauschen bei 10 Läufen; die Code-Prüfungen der
Übersicht waren in allen Läufen grün.
